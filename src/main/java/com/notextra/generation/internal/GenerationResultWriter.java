package com.notextra.generation.internal;

import com.notextra.generation.api.GenerationOutputType;
import com.notextra.notes.api.NotesApi;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class GenerationResultWriter {

	private final NotesApi notesApi;

	GenerationResultWriter(NotesApi notesApi) {
		this.notesApi = notesApi;
	}

	@Transactional
	GenerationResult write(GenerationJobEntity job, String content) {
		String title = switch (job.getOutputType()) {
			case NOTE -> "Generated note";
			case PRESENTATION -> "Generated presentation";
			case TRANSCRIPT -> "Generated transcript";
			case MARKDOWN -> "Generated markdown";
			case PDF -> "Generated summary";
		};

		var note = notesApi.createForOwner(
			job.getOwnerId(),
			title + " (" + job.getId().toString().substring(0, 8) + ")",
			content
		);
		return new GenerationResult(note.id(), null);
	}

	record GenerationResult(UUID noteId, UUID mediaId) {
	}
}
