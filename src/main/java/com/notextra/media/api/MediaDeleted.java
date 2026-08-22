package com.notextra.media.api;

import java.util.UUID;

public record MediaDeleted(UUID assetId, UUID ownerId) {
}
