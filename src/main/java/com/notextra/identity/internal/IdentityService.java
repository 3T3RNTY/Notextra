package com.notextra.identity.internal;

import com.notextra.identity.api.IdentityApi;
import com.notextra.identity.api.UserProfile;
import com.notextra.identity.api.UserRegistered;
import com.notextra.shared.NotextraProperties;
import com.notextra.shared.security.JwtService;
import com.notextra.shared.web.BadRequestException;
import com.notextra.shared.web.ConflictException;
import com.notextra.shared.web.ResourceNotFoundException;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class IdentityService implements IdentityApi {

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final ApplicationEventPublisher events;
	private final long refreshExpirationMs;

	IdentityService(
		UserRepository userRepository,
		RefreshTokenRepository refreshTokenRepository,
		PasswordEncoder passwordEncoder,
		JwtService jwtService,
		ApplicationEventPublisher events,
		NotextraProperties properties
	) {
		this.userRepository = userRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.events = events;
		this.refreshExpirationMs = properties.security().refreshExpirationMs();
	}

	AuthResponse register(RegisterRequest request) {
		if (userRepository.existsByEmail(request.email())) {
			throw new ConflictException("Email already registered");
		}

		var user = new UserEntity(
			UUID.randomUUID(),
			request.email().toLowerCase(),
			passwordEncoder.encode(request.password()),
			request.displayName(),
			Instant.now()
		);
		userRepository.save(user);
		events.publishEvent(new UserRegistered(user.getId(), user.getEmail()));
		return toAuthResponse(user);
	}

	AuthResponse login(LoginRequest request) {
		var user = userRepository.findByEmail(request.email().toLowerCase())
			.orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new ResourceNotFoundException("Invalid email or password");
		}

		return toAuthResponse(user);
	}

	AuthResponse refresh(RefreshRequest request) {
		var now = Instant.now();
		var existing = refreshTokenRepository.findByTokenHash(hashToken(request.refreshToken()))
			.filter(token -> token.isActive(now))
			.orElseThrow(() -> new BadRequestException("Invalid or expired refresh token"));

		existing.revoke(now);
		refreshTokenRepository.save(existing);

		var user = userRepository.findById(existing.getUserId())
			.orElseThrow(() -> new ResourceNotFoundException("User not found"));
		return toAuthResponse(user);
	}

	void logout(LogoutRequest request) {
		if (request.refreshToken() == null || request.refreshToken().isBlank()) {
			return;
		}
		refreshTokenRepository.findByTokenHash(hashToken(request.refreshToken()))
			.ifPresent(token -> {
				token.revoke(Instant.now());
				refreshTokenRepository.save(token);
			});
	}

	UserProfile me(UUID userId) {
		return findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<UserProfile> findById(UUID userId) {
		return userRepository.findById(userId).map(this::toProfile);
	}

	@Override
	@Transactional(readOnly = true)
	public boolean existsById(UUID userId) {
		return userRepository.existsById(userId);
	}

	private AuthResponse toAuthResponse(UserEntity user) {
		return new AuthResponse(
			jwtService.generateToken(user.getId(), user.getEmail()),
			issueRefreshToken(user.getId()),
			toProfile(user)
		);
	}

	private String issueRefreshToken(UUID userId) {
		byte[] bytes = new byte[32];
		SECURE_RANDOM.nextBytes(bytes);
		String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
		Instant now = Instant.now();

		refreshTokenRepository.save(new RefreshTokenEntity(
			UUID.randomUUID(),
			userId,
			hashToken(rawToken),
			now.plusMillis(refreshExpirationMs),
			now
		));
		return rawToken;
	}

	private static String hashToken(String rawToken) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
			return HexFormat.of().formatHex(hash);
		}
		catch (NoSuchAlgorithmException ex) {
			throw new IllegalStateException("SHA-256 not available", ex);
		}
	}

	private UserProfile toProfile(UserEntity user) {
		return new UserProfile(user.getId(), user.getEmail(), user.getDisplayName(), user.getCreatedAt());
	}

	record RegisterRequest(
		@Email @NotBlank String email,
		@NotBlank @Size(min = 8, max = 100) String password,
		@NotBlank @Size(max = 255) String displayName
	) {
	}

	record LoginRequest(
		@Email @NotBlank String email,
		@NotBlank String password
	) {
	}

	record RefreshRequest(
		@NotBlank String refreshToken
	) {
	}

	record LogoutRequest(
		String refreshToken
	) {
	}

	record AuthResponse(String accessToken, String refreshToken, UserProfile user) {
	}
}
