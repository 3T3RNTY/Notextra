package com.notextra.notes.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "notes", name = "collections")
class CollectionEntity {

	@Id
	private UUID id;

	@Column(name = "owner_id", nullable = false)
	private UUID ownerId;

	@Column(nullable = false)
	private String name;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected CollectionEntity() {
	}

	CollectionEntity(UUID id, UUID ownerId, String name, Instant createdAt) {
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

	void setName(String name) {
		this.name = name;
	}

	Instant getCreatedAt() {
		return createdAt;
	}
}
