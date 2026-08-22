package com.notextra.media.internal;

import com.notextra.media.api.MediaAssetDetail;
import com.notextra.media.api.MediaType;
import com.notextra.media.internal.MediaService.ConfirmUploadRequest;
import com.notextra.media.internal.MediaService.InitiateUploadRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/media")
class MediaController {

	private final MediaService mediaService;

	MediaController(MediaService mediaService) {
		this.mediaService = mediaService;
	}

	@GetMapping
	List<MediaAssetDetail> list(@RequestParam(required = false) MediaType type) {
		return mediaService.listForCurrentUser(type);
	}

	@PostMapping("/uploads")
	@ResponseStatus(HttpStatus.CREATED)
	MediaService.UploadSessionResponse initiateUpload(@Valid @RequestBody InitiateUploadRequest request) {
		return mediaService.initiateUpload(request);
	}

	@PostMapping("/{assetId}/confirm")
	MediaAssetDetail confirmUpload(
		@PathVariable UUID assetId,
		@Valid @RequestBody ConfirmUploadRequest request
	) {
		return mediaService.confirmUpload(assetId, request);
	}

	@GetMapping("/{assetId}")
	MediaAssetDetail get(@PathVariable UUID assetId) {
		return mediaService.get(assetId);
	}

	@DeleteMapping("/{assetId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void delete(@PathVariable UUID assetId) {
		mediaService.delete(assetId);
	}
}
