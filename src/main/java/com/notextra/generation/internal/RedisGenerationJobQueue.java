package com.notextra.generation.internal;

import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "notextra.generation.queue", havingValue = "redis", matchIfMissing = true)
class RedisGenerationJobQueue implements GenerationJobQueue {

	static final String QUEUE_KEY = "notextra:generation:jobs";

	private final StringRedisTemplate redisTemplate;

	RedisGenerationJobQueue(StringRedisTemplate redisTemplate) {
		this.redisTemplate = redisTemplate;
	}

	@Override
	public void enqueue(UUID jobId) {
		redisTemplate.opsForList().leftPush(QUEUE_KEY, jobId.toString());
	}
}
