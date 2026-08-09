package com.notextra.notes.internal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface CollectionNoteRepository extends JpaRepository<CollectionNoteEntity, CollectionNoteEntity.CollectionNoteId> {

	List<CollectionNoteEntity> findByCollectionIdOrderByPositionAsc(UUID collectionId);

	void deleteByCollectionIdAndNoteId(UUID collectionId, UUID noteId);

	boolean existsByCollectionIdAndNoteId(UUID collectionId, UUID noteId);

	int countByCollectionId(UUID collectionId);
}
