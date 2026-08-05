package com.notextra.shared.security;

import com.notextra.shared.NotextraProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

	private final SecretKey secretKey;
	private final long expirationMs;

	public JwtService(NotextraProperties properties) {
		this.secretKey = Keys.hmacShaKeyFor(properties.security().jwtSecret().getBytes(StandardCharsets.UTF_8));
		this.expirationMs = properties.security().jwtExpirationMs();
	}

	public String generateToken(UUID userId, String email) {
		Instant now = Instant.now();
		return Jwts.builder()
			.subject(userId.toString())
			.claim("email", email)
			.issuedAt(Date.from(now))
			.expiration(Date.from(now.plusMillis(expirationMs)))
			.signWith(secretKey)
			.compact();
	}

	public JwtClaims parseToken(String token) {
		var claims = Jwts.parser()
			.verifyWith(secretKey)
			.build()
			.parseSignedClaims(token)
			.getPayload();

		return new JwtClaims(
			UUID.fromString(claims.getSubject()),
			claims.get("email", String.class)
		);
	}

	public record JwtClaims(UUID userId, String email) {
	}
}
