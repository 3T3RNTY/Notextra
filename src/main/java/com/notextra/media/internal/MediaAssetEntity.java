package com.notextra.media.internal;

import com.notextra.media.api.MediaType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "media", name = "media_assets")
class MediaAssetEntity {

	@Id
	private UUID id;

	@Column(name = "owner_id", nullable = false)
	private UUID ownerId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 50)
	private MediaType type;

	@Column(name = "storage_key", nullable = false, length = 1024)
	private String storageKey;

	@Column(name = "content_type", nullable = false)
	private String contentType;

	@Column(name = "file_name", nullable = false, length = 500)
	private String fileName;

	@Column(name = "size_bytes")
	private Long sizeBytes;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected MediaAssetEntity() {
	}

	MediaAssetEntity(
		UUID id,
		UUID ownerId,
		MediaType type,
		String storageKey,
		String contentType,
		String fileName,
		Long sizeBytes,
		Instant createdAt
	) {
		this.id = id;
		this.ownerId = ownerId;
		this.type = type;
		this.storageKey = storageKey;
		this.contentType = contentType;
		this.fileName = fileName;
		this.sizeBytes = sizeBytes;
		this.createdAt = createdAt;
	}

	UUID getId() {
		return id;
	}

	UUID getOwnerId() {
		return ownerId;
	}

	MediaType getType() {
		return type;
	}

	String getStorageKey() {
		return storageKey;
	}

	String getContentType() {
		return contentType;
	}

	String getFileName() {
		return fileName;
	}

	Long getSizeBytes() {
		return sizeBytes;
	}

	void setSizeBytes(Long sizeBytes) {
		this.sizeBytes = sizeBytes;
	}

	Instant getCreatedAt() {
		return createdAt;
	}
}
