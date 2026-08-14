package com.notextra.notes.internal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface CollectionRepository extends JpaRepository<CollectionEntity, UUID> {

	List<CollectionEntity> findByOwnerIdOrderByNameAsc(UUID ownerId);

	boolean existsByOwnerIdAndNameIgnoreCase(UUID ownerId, String name);
}
