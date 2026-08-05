package com.notextra.notes.internal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface NoteRepository extends JpaRepository<NoteEntity, UUID> {

	List<NoteEntity> findByOwnerIdOrderByUpdatedAtDesc(UUID ownerId);
}
