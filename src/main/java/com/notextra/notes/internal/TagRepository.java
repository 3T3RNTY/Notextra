package com.notextra.notes.internal;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface TagRepository extends JpaRepository<TagEntity, UUID> {

	List<TagEntity> findByOwnerIdOrderByNameAsc(UUID ownerId);

	Optional<TagEntity> findByOwnerIdAndNameIgnoreCase(UUID ownerId, String name);

	boolean existsByOwnerIdAndNameIgnoreCase(UUID ownerId, String name);
}
