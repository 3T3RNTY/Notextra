package com.notextra.media.internal;

import com.notextra.media.api.MediaAssetDetail;
import com.notextra.media.internal.MediaService.ConfirmUploadRequest;
import com.notextra.media.internal.MediaService.InitiateUploadRequest;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
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
	List<MediaAssetDetail> list() {
		return mediaService.listForCurrentUser();
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

	@GetMapping("/{assetId}/content")
	ResponseEntity<InputStreamResource> content(
		@PathVariable UUID assetId,
		@RequestParam(defaultValue = "false") boolean inline
	) {
		var file = mediaService.openContent(assetId);
		org.springframework.http.MediaType mediaType;
		try {
			mediaType = MediaType.parseMediaType(file.contentType());
		}
		catch (Exception ex) {
			mediaType = MediaType.APPLICATION_OCTET_STREAM;
		}
		var headers = new HttpHeaders();
		headers.setContentType(mediaType);
		headers.setContentDisposition(
			ContentDisposition.builder(inline ? "inline" : "attachment")
				.filename(file.fileName(), StandardCharsets.UTF_8)
				.build()
		);
		if (file.sizeBytes() != null) {
			headers.setContentLength(file.sizeBytes());
		}
		return new ResponseEntity<>(new InputStreamResource(file.body()), headers, HttpStatus.OK);
	}

	@PutMapping("/{assetId}/content")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void uploadContent(
		@PathVariable UUID assetId,
		@RequestHeader(value = HttpHeaders.CONTENT_TYPE, required = false) String contentType,
		@RequestHeader(HttpHeaders.CONTENT_LENGTH) long contentLength,
		jakarta.servlet.ServletInputStream body
	) throws java.io.IOException {
		mediaService.putContent(assetId, body, contentType, contentLength);
	}
}
