package com.notextra.media.api;

import java.util.Optional;
import java.util.UUID;

public interface MediaApi {

	Optional<MediaAssetRef> findById(UUID assetId);
}
