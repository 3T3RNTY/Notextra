package com.notextra.generation.internal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.notextra.ai.api.AiGenerationRequest;
import com.notextra.ai.api.AiService;
import com.notextra.ai.api.AiTaskType;
import com.notextra.generation.api.GenerationJobCompleted;
import com.notextra.generation.api.GenerationJobStatus;
import com.notextra.generation.api.GenerationOutputType;
import com.notextra.media.api.MediaApi;
import com.notextra.notes.api.NoteDetail;
import com.notextra.notes.api.NotesApi;
import com.notextra.shared.web.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
class GenerationJobProcessor {

	private final GenerationJobRepository generationJobRepository;
	private final NotesApi notesApi;
	private final MediaApi mediaApi;
	private final AiService aiService;
	private final GenerationResultWriter resultWriter;
	private final ApplicationEventPublisher events;
	private final ObjectMapper objectMapper;

	GenerationJobProcessor(
		GenerationJobRepository generationJobRepository,
		NotesApi notesApi,
		MediaApi mediaApi,
		AiService aiService,
		GenerationResultWriter resultWriter,
		ApplicationEventPublisher events,
		ObjectMapper objectMapper
	) {
		this.generationJobRepository = generationJobRepository;
		this.notesApi = notesApi;
		this.mediaApi = mediaApi;
		this.aiService = aiService;
		this.resultWriter = resultWriter;
		this.events = events;
		this.objectMapper = objectMapper;
	}

	@Async
	void processAsync(UUID jobId) {
		process(jobId);
	}

	@Transactional
	void process(UUID jobId) {
		var job = generationJobRepository.findById(jobId)
			.orElseThrow(() -> new ResourceNotFoundException("Generation job not found"));

		job.setStatus(GenerationJobStatus.PROCESSING);
		generationJobRepository.save(job);

		try {
			List<String> sourceTexts = collectSourceTexts(job);
			var aiResult = aiService.generate(new AiGenerationRequest(
				mapTaskType(job.getOutputType()),
				job.getPrompt(),
				sourceTexts,
				job.getOutputType().name()
			));

			var result = resultWriter.write(job, aiResult.content());
			job.setResultNoteId(result.noteId());
			job.setResultMediaId(result.mediaId());
			job.setStatus(GenerationJobStatus.COMPLETED);
			generationJobRepository.save(job);

			events.publishEvent(new GenerationJobCompleted(
				job.getId(),
				job.getOutputType(),
				job.getResultNoteId(),
				job.getResultMediaId()
			));
		}
		catch (Exception ex) {
			job.setStatus(GenerationJobStatus.FAILED);
			job.setErrorMessage(ex.getMessage());
			generationJobRepository.save(job);
		}
	}

	private List<String> collectSourceTexts(GenerationJobEntity job) {
		List<String> texts = new ArrayList<>();
		for (UUID noteId : readIds(job.getSourceNoteIds())) {
			notesApi.findDetailById(noteId).ifPresent(note -> texts.add(formatNote(note)));
		}
		for (UUID mediaId : readIds(job.getSourceMediaIds())) {
			mediaApi.findById(mediaId).ifPresent(media -> texts.add(
				"Media asset %s (%s, %s)".formatted(media.id(), media.type(), media.contentType())
			));
		}
		return texts;
	}

	private String formatNote(NoteDetail note) {
		return "# %s\n\n%s".formatted(note.title(), note.content() == null ? "" : note.content());
	}

	private AiTaskType mapTaskType(GenerationOutputType outputType) {
		return switch (outputType) {
			case TRANSCRIPT -> AiTaskType.TRANSCRIBE;
			case PRESENTATION -> AiTaskType.GENERATE_PRESENTATION;
			case NOTE, MARKDOWN -> AiTaskType.GENERATE_NOTE;
			case PDF -> AiTaskType.SUMMARIZE;
		};
	}

	private List<UUID> readIds(String json) {
		if (json == null || json.isBlank()) {
			return List.of();
		}
		try {
			return objectMapper.readValue(json, new TypeReference<>() {
			});
		}
		catch (JsonProcessingException ex) {
			return List.of();
		}
	}
}
