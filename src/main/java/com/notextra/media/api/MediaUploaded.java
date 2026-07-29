package com.notextra.media.api;

import java.util.UUID;

public record MediaUploaded(UUID assetId, UUID ownerId, MediaType type) {
}
