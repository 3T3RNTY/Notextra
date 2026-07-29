package com.notextra.generation.api;

import java.util.UUID;

public record GenerationJobCompleted(
	UUID jobId,
	GenerationOutputType outputType,
	UUID resultNoteId,
	UUID resultMediaId
) {
}
