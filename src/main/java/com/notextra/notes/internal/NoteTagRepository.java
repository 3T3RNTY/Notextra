package com.notextra.notes.internal;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface NoteTagRepository extends JpaRepository<NoteTagEntity, NoteTagEntity.NoteTagId> {

	List<NoteTagEntity> findByNoteId(UUID noteId);

	List<NoteTagEntity> findByNoteIdIn(Collection<UUID> noteIds);

	List<NoteTagEntity> findByTagId(UUID tagId);

	void deleteByNoteIdAndTagId(UUID noteId, UUID tagId);

	void deleteByTagId(UUID tagId);

	boolean existsByNoteIdAndTagId(UUID noteId, UUID tagId);
}
