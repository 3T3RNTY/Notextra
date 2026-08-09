package com.notextra.generation.internal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.notextra.generation.api.GenerationJobDetail;
import com.notextra.generation.api.GenerationJobStatus;
import com.notextra.generation.api.GenerationRequest;
import com.notextra.media.api.MediaApi;
import com.notextra.notes.api.NotesApi;
import com.notextra.shared.security.CurrentUser;
import com.notextra.shared.web.BadRequestException;
import com.notextra.shared.web.ForbiddenException;
import com.notextra.shared.web.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
class GenerationService {

	private final GenerationJobRepository generationJobRepository;
	private final NotesApi notesApi;
	private final MediaApi mediaApi;
	private final GenerationJobQueue jobQueue;
	private final ObjectMapper objectMapper;
	private final boolean memoryQueue;

	GenerationService(
		GenerationJobRepository generationJobRepository,
		NotesApi notesApi,
		MediaApi mediaApi,
		GenerationJobQueue jobQueue,
		ObjectMapper objectMapper,
		@Value("${notextra.generation.queue:redis}") String queueMode
	) {
		this.generationJobRepository = generationJobRepository;
		this.notesApi = notesApi;
		this.mediaApi = mediaApi;
		this.jobQueue = jobQueue;
		this.objectMapper = objectMapper;
		this.memoryQueue = "memory".equalsIgnoreCase(queueMode);
	}

	@Transactional
	GenerationJobDetail createJob(GenerationRequest request) {
		validateSources(request);
		var job = new GenerationJobEntity(
			UUID.randomUUID(),
			CurrentUser.id(),
			request.outputType(),
			GenerationJobStatus.QUEUED,
			request.prompt(),
			writeIds(request.sourceNoteIds()),
			writeIds(request.sourceMediaIds())
		);
		generationJobRepository.saveAndFlush(job);
		if (memoryQueue) {
			jobQueue.enqueue(job.getId());
			generationJobRepository.findById(job.getId()).ifPresent(updated -> {
				job.setStatus(updated.getStatus());
				job.setResultNoteId(updated.getResultNoteId());
				job.setResultMediaId(updated.getResultMediaId());
				job.setErrorMessage(updated.getErrorMessage());
			});
		}
		else {
			enqueueAfterCommit(job.getId());
		}
		return toDetail(job);
	}

	private void enqueueAfterCommit(UUID jobId) {
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					jobQueue.enqueue(jobId);
				}
			});
		}
		else {
			jobQueue.enqueue(jobId);
		}
	}

	@Transactional(readOnly = true)
	List<GenerationJobDetail> listForCurrentUser() {
		return generationJobRepository.findByOwnerIdOrderByCreatedAtDesc(CurrentUser.id()).stream()
			.map(this::toDetail)
			.toList();
	}

	@Transactional(readOnly = true)
	GenerationJobDetail get(UUID jobId) {
		return toDetail(getOwnedEntity(jobId));
	}

	private void validateSources(GenerationRequest request) {
		if (request.sourceNoteIds().isEmpty() && request.sourceMediaIds().isEmpty()) {
			throw new BadRequestException("At least one source note or media asset is required");
		}

		for (UUID noteId : request.sourceNoteIds()) {
			var note = notesApi.findDetailById(noteId)
				.orElseThrow(() -> new ResourceNotFoundException("Source note not found: " + noteId));
			if (!note.ownerId().equals(CurrentUser.id())) {
				throw new ForbiddenException("You do not have access to source note: " + noteId);
			}
		}

		for (UUID mediaId : request.sourceMediaIds()) {
			if (!mediaApi.isOwnedBy(mediaId, CurrentUser.id())) {
				throw new ForbiddenException("You do not have access to source media: " + mediaId);
			}
		}
	}

	private GenerationJobEntity getOwnedEntity(UUID jobId) {
		var job = generationJobRepository.findById(jobId)
			.orElseThrow(() -> new ResourceNotFoundException("Generation job not found"));
		if (!job.getOwnerId().equals(CurrentUser.id())) {
			throw new ForbiddenException("You do not have access to this generation job");
		}
		return job;
	}

	private GenerationJobDetail toDetail(GenerationJobEntity job) {
		return new GenerationJobDetail(
			job.getId(),
			job.getOwnerId(),
			job.getOutputType(),
			job.getStatus(),
			job.getPrompt(),
			readIds(job.getSourceNoteIds()),
			readIds(job.getSourceMediaIds()),
			job.getResultNoteId(),
			job.getResultMediaId(),
			job.getErrorMessage(),
			job.getCreatedAt(),
			job.getUpdatedAt()
		);
	}

	private String writeIds(List<UUID> ids) {
		if (ids == null || ids.isEmpty()) {
			return "[]";
		}
		try {
			return objectMapper.writeValueAsString(ids);
		}
		catch (JsonProcessingException ex) {
			throw new BadRequestException("Invalid source id list");
		}
	}

	private List<UUID> readIds(String json) {
		if (json == null || json.isBlank()) {
			return List.of();
		}
		try {
			return objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<>() {
			});
		}
		catch (JsonProcessingException ex) {
			return List.of();
		}
	}
}
