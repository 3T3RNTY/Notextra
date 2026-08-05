package com.notextra.identity.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "identity", name = "users")
class UserEntity {

	@Id
	private UUID id;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(name = "password_hash", nullable = false)
	private String passwordHash;

	@Column(name = "display_name", nullable = false)
	private String displayName;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected UserEntity() {
	}

	UserEntity(UUID id, String email, String passwordHash, String displayName, Instant createdAt) {
		this.id = id;
		this.email = email;
		this.passwordHash = passwordHash;
		this.displayName = displayName;
		this.createdAt = createdAt;
	}

	UUID getId() {
		return id;
	}

	String getEmail() {
		return email;
	}

	String getPasswordHash() {
		return passwordHash;
	}

	String getDisplayName() {
		return displayName;
	}

	Instant getCreatedAt() {
		return createdAt;
	}
}
