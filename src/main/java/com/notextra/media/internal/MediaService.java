package com.notextra.media.internal;

import com.notextra.media.api.MediaAssetDetail;
import com.notextra.media.api.MediaAssetRef;
import com.notextra.media.api.MediaType;
import com.notextra.media.api.MediaUploaded;
import com.notextra.media.api.MediaApi;
import com.notextra.shared.security.CurrentUser;
import com.notextra.shared.storage.ObjectStorageService;
import com.notextra.shared.web.BadRequestException;
import com.notextra.shared.web.ForbiddenException;
import com.notextra.shared.web.ResourceNotFoundException;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class MediaService implements MediaApi {

	private final MediaAssetRepository mediaAssetRepository;
	private final ObjectStorageService objectStorageService;
	private final ApplicationEventPublisher events;

	MediaService(
		MediaAssetRepository mediaAssetRepository,
		ObjectStorageService objectStorageService,
		ApplicationEventPublisher events
	) {
		this.mediaAssetRepository = mediaAssetRepository;
		this.objectStorageService = objectStorageService;
		this.events = events;
	}

	UploadSessionResponse initiateUpload(InitiateUploadRequest request) {
		UUID assetId = UUID.randomUUID();
		String storageKey = "users/%s/%s/%s".formatted(
			CurrentUser.id(),
			request.type().name().toLowerCase(Locale.ROOT),
			assetId
		);

		var asset = new MediaAssetEntity(
			assetId,
			CurrentUser.id(),
			request.type(),
			storageKey,
			request.contentType(),
			request.fileName(),
			null,
			Instant.now()
		);
		mediaAssetRepository.save(asset);

		String uploadUrl = objectStorageService.createUploadUrl(storageKey, request.contentType());
		return new UploadSessionResponse(assetId, uploadUrl, storageKey);
	}

	MediaAssetDetail confirmUpload(UUID assetId, ConfirmUploadRequest request) {
		var asset = getOwnedEntity(assetId);
		asset.setSizeBytes(request.sizeBytes());
		events.publishEvent(new MediaUploaded(asset.getId(), asset.getOwnerId(), asset.getType()));
		return toDetail(asset);
	}

	List<MediaAssetDetail> listForCurrentUser() {
		return mediaAssetRepository.findByOwnerIdOrderByCreatedAtDesc(CurrentUser.id()).stream()
			.map(this::toDetail)
			.toList();
	}

	MediaAssetDetail get(UUID assetId) {
		return toDetail(getOwnedEntity(assetId));
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<MediaAssetRef> findById(UUID assetId) {
		return mediaAssetRepository.findById(assetId).map(this::toRef);
	}

	@Override
	@Transactional(readOnly = true)
	public List<MediaAssetRef> findByOwner(UUID ownerId) {
		return mediaAssetRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream()
			.map(this::toRef)
			.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public boolean isOwnedBy(UUID assetId, UUID ownerId) {
		return mediaAssetRepository.findById(assetId)
			.map(asset -> asset.getOwnerId().equals(ownerId))
			.orElse(false);
	}

	MediaAssetRef getRef(UUID assetId) {
		return toRef(getOwnedEntity(assetId));
	}

	MediaAssetRef getRefForUser(UUID assetId, UUID ownerId) {
		var asset = mediaAssetRepository.findById(assetId)
			.orElseThrow(() -> new ResourceNotFoundException("Media asset not found"));
		if (!asset.getOwnerId().equals(ownerId)) {
			throw new ForbiddenException("You do not have access to this media asset");
		}
		return toRef(asset);
	}

	private MediaAssetEntity getOwnedEntity(UUID assetId) {
		var asset = mediaAssetRepository.findById(assetId)
			.orElseThrow(() -> new ResourceNotFoundException("Media asset not found"));
		if (!asset.getOwnerId().equals(CurrentUser.id())) {
			throw new ForbiddenException("You do not have access to this media asset");
		}
		return asset;
	}

	private MediaAssetRef toRef(MediaAssetEntity asset) {
		return new MediaAssetRef(asset.getId(), asset.getType(), asset.getStorageKey(), asset.getContentType());
	}

	private MediaAssetDetail toDetail(MediaAssetEntity asset) {
		return new MediaAssetDetail(
			asset.getId(),
			asset.getOwnerId(),
			asset.getType(),
			asset.getContentType(),
			asset.getFileName(),
			asset.getSizeBytes(),
			asset.getCreatedAt(),
			objectStorageService.createDownloadUrl(asset.getStorageKey())
		);
	}

	static MediaType detectType(String contentType) {
		if (contentType == null) {
			throw new BadRequestException("Content type is required");
		}
		if (contentType.startsWith("image/")) {
			return MediaType.IMAGE;
		}
		if (contentType.startsWith("audio/")) {
			return MediaType.AUDIO;
		}
		if (contentType.startsWith("video/")) {
			return MediaType.VIDEO;
		}
		if (contentType.startsWith("text/") || contentType.contains("pdf") || contentType.contains("document")) {
			return MediaType.DOCUMENT;
		}
		return MediaType.OTHER;
	}

	record InitiateUploadRequest(
		@NotBlank String fileName,
		@NotBlank String contentType,
		@NotNull MediaType type
	) {
	}

	record ConfirmUploadRequest(@Positive long sizeBytes) {
	}

	record UploadSessionResponse(UUID assetId, String uploadUrl, String storageKey) {
	}
}
