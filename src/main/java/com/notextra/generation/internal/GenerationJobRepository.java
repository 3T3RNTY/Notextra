package com.notextra.generation.internal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface GenerationJobRepository extends JpaRepository<GenerationJobEntity, UUID> {

	List<GenerationJobEntity> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
}
