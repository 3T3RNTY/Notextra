package com.notextra.notes.internal;

import com.notextra.notes.api.NoteStatus;
import com.notextra.notes.api.NoteType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(schema = "notes", name = "notes")
class NoteEntity {

	@Id
	private UUID id;

	@Column(name = "owner_id", nullable = false)
	private UUID ownerId;

	@Column(nullable = false, length = 500)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String content;

	@Enumerated(EnumType.STRING)
	@Column(name = "note_type", nullable = false, length = 50)
	private NoteType type;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 50)
	private NoteStatus status;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(schema = "notes", name = "note_attachments", joinColumns = @JoinColumn(name = "note_id"))
	@Column(name = "media_asset_id")
	private Set<UUID> attachmentIds = new LinkedHashSet<>();

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected NoteEntity() {
	}

	NoteEntity(UUID id, UUID ownerId, String title, String content, NoteStatus status) {
		this(id, ownerId, title, content, NoteType.TEXT, status);
	}

	NoteEntity(UUID id, UUID ownerId, String title, String content, NoteType type, NoteStatus status) {
		this.id = id;
		this.ownerId = ownerId;
		this.title = title;
		this.content = content;
		this.type = type == null ? NoteType.TEXT : type;
		this.status = status;
		Instant now = Instant.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		createdAt = now;
		updatedAt = now;
		if (type == null) {
			type = NoteType.TEXT;
		}
		if (attachmentIds == null) {
			attachmentIds = new LinkedHashSet<>();
		}
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}

	UUID getId() {
		return id;
	}

	UUID getOwnerId() {
		return ownerId;
	}

	String getTitle() {
		return title;
	}

	void setTitle(String title) {
		this.title = title;
	}

	String getContent() {
		return content;
	}

	void setContent(String content) {
		this.content = content;
	}

	NoteType getType() {
		return type == null ? NoteType.TEXT : type;
	}

	void setType(NoteType type) {
		this.type = type == null ? NoteType.TEXT : type;
	}

	NoteStatus getStatus() {
		return status;
	}

	void setStatus(NoteStatus status) {
		this.status = status;
	}

	Set<UUID> getAttachmentIds() {
		if (attachmentIds == null) {
			attachmentIds = new LinkedHashSet<>();
		}
		return attachmentIds;
	}

	Instant getCreatedAt() {
		return createdAt;
	}

	Instant getUpdatedAt() {
		return updatedAt;
	}
}
