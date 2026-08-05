package com.notextra.media.api;

import java.time.Instant;
import java.util.UUID;

public record MediaAssetDetail(
	UUID id,
	UUID ownerId,
	MediaType type,
	String contentType,
	String fileName,
	Long sizeBytes,
	Instant createdAt,
	String downloadUrl
) {
}
