package com.notextra.ai.internal;

import com.notextra.ai.api.AiGenerationRequest;
import com.notextra.ai.api.AiGenerationResult;
import com.notextra.ai.api.AiService;
import com.notextra.ai.api.AiTaskType;
import com.notextra.shared.NotextraProperties;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
class StubAiService implements AiService {

	private final NotextraProperties properties;

	StubAiService(NotextraProperties properties) {
		this.properties = properties;
	}

	@Override
	public AiGenerationResult generate(AiGenerationRequest request) {
		String apiKey = properties.ai().openaiApiKey();
		String provider = (apiKey == null || apiKey.isBlank()) ? "stub" : "openai-placeholder";

		String sourceSummary = request.sourceTexts().isEmpty()
			? "No source content provided."
			: request.sourceTexts().stream()
				.map(text -> text.length() > 200 ? text.substring(0, 200) + "..." : text)
				.collect(Collectors.joining("\n\n"));

		String content = """
			# Generated %s

			**Prompt:** %s

			**Sources:**
			%s

			---
			This is a placeholder output from the `%s` provider. Configure `OPENAI_API_KEY` and replace \
			`StubAiService` with a real provider integration when ready.
			""".formatted(
			request.taskType(),
			request.prompt() == null ? "(none)" : request.prompt(),
			sourceSummary,
			provider
		);

		return new AiGenerationResult(content.strip(), provider);
	}
}
