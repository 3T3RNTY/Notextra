package com.notextra.generation.internal;

import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "notextra.generation.queue", havingValue = "memory")
class InMemoryGenerationJobQueue implements GenerationJobQueue {

	private final GenerationJobProcessor jobProcessor;

	InMemoryGenerationJobQueue(GenerationJobProcessor jobProcessor) {
		this.jobProcessor = jobProcessor;
	}

	@Override
	public void enqueue(UUID jobId) {
		jobProcessor.process(jobId);
	}
}
