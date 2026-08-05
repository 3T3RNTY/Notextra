package com.notextra.identity.api;

import java.time.Instant;
import java.util.UUID;

public record UserProfile(
	UUID id,
	String email,
	String displayName,
	Instant createdAt
) {
}
