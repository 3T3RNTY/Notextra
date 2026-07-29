package com.notextra.generation.api;

import java.util.UUID;

public record GenerationJobRef(UUID jobId, GenerationJobStatus status) {
}
