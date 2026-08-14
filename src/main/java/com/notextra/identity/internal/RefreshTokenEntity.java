package com.notextra.identity.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "identity", name = "refresh_tokens")
class RefreshTokenEntity {

	@Id
	private UUID id;

	@Column(name = "user_id", nullable = false)
	private UUID userId;

	@Column(name = "token_hash", nullable = false, unique = true)
	private String tokenHash;

	@Column(name = "expires_at", nullable = false)
	private Instant expiresAt;

	@Column(name = "revoked_at")
	private Instant revokedAt;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected RefreshTokenEntity() {
	}

	RefreshTokenEntity(UUID id, UUID userId, String tokenHash, Instant expiresAt, Instant createdAt) {
		this.id = id;
		this.userId = userId;
		this.tokenHash = tokenHash;
		this.expiresAt = expiresAt;
		this.createdAt = createdAt;
	}

	UUID getUserId() {
		return userId;
	}

	boolean isActive(Instant now) {
		return revokedAt == null && expiresAt.isAfter(now);
	}

	void revoke(Instant at) {
		this.revokedAt = at;
	}
}
