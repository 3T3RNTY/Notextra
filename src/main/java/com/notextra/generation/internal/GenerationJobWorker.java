package com.notextra.generation.internal;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.SmartLifecycle;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "notextra.generation.queue", havingValue = "redis", matchIfMissing = true)
class GenerationJobWorker implements ApplicationRunner, SmartLifecycle {

	private static final Logger log = LoggerFactory.getLogger(GenerationJobWorker.class);
	private static final Duration POP_TIMEOUT = Duration.ofSeconds(2);

	private final StringRedisTemplate redisTemplate;
	private final GenerationJobProcessor jobProcessor;
	private final AtomicBoolean running = new AtomicBoolean(false);
	private Thread workerThread;

	GenerationJobWorker(StringRedisTemplate redisTemplate, GenerationJobProcessor jobProcessor) {
		this.redisTemplate = redisTemplate;
		this.jobProcessor = jobProcessor;
	}

	@Override
	public void run(ApplicationArguments args) {
		start();
	}

	@Override
	public void start() {
		if (!running.compareAndSet(false, true)) {
			return;
		}
		workerThread = Thread.ofVirtual().name("generation-job-worker").start(this::pollLoop);
	}

	@Override
	public void stop() {
		running.set(false);
		if (workerThread != null) {
			workerThread.interrupt();
		}
	}

	@Override
	public boolean isRunning() {
		return running.get();
	}

	private void pollLoop() {
		while (running.get()) {
			try {
				String jobId = redisTemplate.opsForList().rightPop(RedisGenerationJobQueue.QUEUE_KEY, POP_TIMEOUT);
				if (jobId != null && !jobId.isBlank()) {
					jobProcessor.process(UUID.fromString(jobId));
				}
			}
			catch (Exception ex) {
				if (running.get()) {
					log.warn("Generation job worker error: {}", ex.getMessage());
					try {
						Thread.sleep(1000);
					}
					catch (InterruptedException interrupted) {
						Thread.currentThread().interrupt();
						return;
					}
				}
			}
		}
	}
}
