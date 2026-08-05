package com.notextra.generation.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record GenerationJobDetail(
	UUID id,
	UUID ownerId,
	GenerationOutputType outputType,
	GenerationJobStatus status,
	String prompt,
	List<UUID> sourceNoteIds,
	List<UUID> sourceMediaIds,
	UUID resultNoteId,
	UUID resultMediaId,
	String errorMessage,
	Instant createdAt,
	Instant updatedAt
) {
}
