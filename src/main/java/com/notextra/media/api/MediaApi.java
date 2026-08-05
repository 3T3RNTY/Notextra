package com.notextra.media.api;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MediaApi {

	Optional<MediaAssetRef> findById(UUID assetId);

	List<MediaAssetRef> findByOwner(UUID ownerId);

	boolean isOwnedBy(UUID assetId, UUID ownerId);
}
