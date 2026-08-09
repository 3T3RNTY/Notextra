package com.notextra.generation.internal;

import java.util.UUID;

interface GenerationJobQueue {

	void enqueue(UUID jobId);
}
