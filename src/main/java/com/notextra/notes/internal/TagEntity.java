package com.notextra.notes.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "notes", name = "tags")
class TagEntity {

	@Id
	private UUID id;

	@Column(name = "owner_id", nullable = false)
	private UUID ownerId;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected TagEntity() {
	}

	TagEntity(UUID id, UUID ownerId, String name, Instant createdAt) {
		this.id = id;
		this.ownerId = ownerId;
		this.name = name;
		this.createdAt = createdAt;
	}

	UUID getId() {
		return id;
	}

	UUID getOwnerId() {
		return ownerId;
	}

	String getName() {
		return name;
	}

	Instant getCreatedAt() {
		return createdAt;
	}
}
