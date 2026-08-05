package com.notextra.ai.api;

import java.util.List;

public record AiGenerationRequest(
	AiTaskType taskType,
	String prompt,
	List<String> sourceTexts,
	String outputFormatHint
) {
}
