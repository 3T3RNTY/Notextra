package com.notextra.media.internal;

import com.notextra.media.api.MediaApi;
import com.notextra.media.api.MediaAssetRef;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
class MediaService implements MediaApi {

	@Override
	public Optional<MediaAssetRef> findById(UUID assetId) {
		return Optional.empty();
	}
}
