package com.notextra.generation.internal;

import com.notextra.generation.api.GenerationJobStatus;
import com.notextra.generation.api.GenerationOutputType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(schema = "generation", name = "generation_jobs")
class GenerationJobEntity {

	@Id
	private UUID id;

	@Column(name = "owner_id", nullable = false)
	private UUID ownerId;

	@Enumerated(EnumType.STRING)
	@Column(name = "output_type", nullable = false, length = 50)
	private GenerationOutputType outputType;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 50)
	private GenerationJobStatus status;

	@Column(columnDefinition = "TEXT")
	private String prompt;

	@Column(name = "source_note_ids", columnDefinition = "TEXT")
	private String sourceNoteIds;

	@Column(name = "source_media_ids", columnDefinition = "TEXT")
	private String sourceMediaIds;

	@Column(name = "result_note_id")
	private UUID resultNoteId;

	@Column(name = "result_media_id")
	private UUID resultMediaId;

	@Column(name = "error_message", columnDefinition = "TEXT")
	private String errorMessage;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected GenerationJobEntity() {
	}

	GenerationJobEntity(
		UUID id,
		UUID ownerId,
		GenerationOutputType outputType,
		GenerationJobStatus status,
		String prompt,
		String sourceNoteIds,
		String sourceMediaIds
	) {
		this.id = id;
		this.ownerId = ownerId;
		this.outputType = outputType;
		this.status = status;
		this.prompt = prompt;
		this.sourceNoteIds = sourceNoteIds;
		this.sourceMediaIds = sourceMediaIds;
	}

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		createdAt = now;
		updatedAt = now;
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

	GenerationOutputType getOutputType() {
		return outputType;
	}

	GenerationJobStatus getStatus() {
		return status;
	}

	void setStatus(GenerationJobStatus status) {
		this.status = status;
	}

	String getPrompt() {
		return prompt;
	}

	String getSourceNoteIds() {
		return sourceNoteIds;
	}

	String getSourceMediaIds() {
		return sourceMediaIds;
	}

	UUID getResultNoteId() {
		return resultNoteId;
	}

	void setResultNoteId(UUID resultNoteId) {
		this.resultNoteId = resultNoteId;
	}

	UUID getResultMediaId() {
		return resultMediaId;
	}

	void setResultMediaId(UUID resultMediaId) {
		this.resultMediaId = resultMediaId;
	}

	String getErrorMessage() {
		return errorMessage;
	}

	void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	Instant getCreatedAt() {
		return createdAt;
	}

	Instant getUpdatedAt() {
		return updatedAt;
	}
}
