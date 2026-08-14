package com.notextra.generation.api;

import java.util.UUID;

public record GenerationJobStatusChanged(
	UUID jobId,
	UUID ownerId,
	GenerationJobStatus status,
	UUID resultNoteId,
	UUID resultMediaId,
	String errorMessage
) {
}
