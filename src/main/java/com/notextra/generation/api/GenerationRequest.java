package com.notextra.generation.api;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record GenerationRequest(
	List<UUID> sourceNoteIds,
	List<UUID> sourceMediaIds,
	@NotNull GenerationOutputType outputType,
	String prompt
) {

	public GenerationRequest {
		if (sourceNoteIds == null) {
			sourceNoteIds = List.of();
		}
		if (sourceMediaIds == null) {
			sourceMediaIds = List.of();
		}
	}
}
