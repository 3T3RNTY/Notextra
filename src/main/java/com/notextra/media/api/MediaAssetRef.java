package com.notextra.media.api;

import java.util.UUID;

public record MediaAssetRef(
	UUID id,
	MediaType type,
	String storageKey,
	String contentType
) {
}
