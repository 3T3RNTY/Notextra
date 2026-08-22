package com.notextra.media.internal;

import com.notextra.media.api.MediaType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface MediaAssetRepository extends JpaRepository<MediaAssetEntity, UUID> {

	List<MediaAssetEntity> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

	List<MediaAssetEntity> findByOwnerIdAndTypeOrderByCreatedAtDesc(UUID ownerId, MediaType type);
}
