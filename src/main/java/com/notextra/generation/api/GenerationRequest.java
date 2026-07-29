package com.notextra.generation.api;

import java.util.List;
import java.util.UUID;

public record GenerationRequest(
	UUID userId,
	List<UUID> sourceNoteIds,
	List<UUID> sourceMediaIds,
	GenerationOutputType outputType,
	String prompt
) {
}
