package com.notextra.identity.internal;

import com.notextra.identity.api.IdentityApi;
import com.notextra.identity.api.UserProfile;
import com.notextra.identity.api.UserRegistered;
import com.notextra.shared.security.JwtService;
import com.notextra.shared.web.ConflictException;
import com.notextra.shared.web.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class IdentityService implements IdentityApi {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final ApplicationEventPublisher events;

	IdentityService(
		UserRepository userRepository,
		PasswordEncoder passwordEncoder,
		JwtService jwtService,
		ApplicationEventPublisher events
	) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.events = events;
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
			toProfile(user)
		);
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

	record AuthResponse(String accessToken, UserProfile user) {
	}
}
