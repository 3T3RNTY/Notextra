package com.notextra.notes.internal;

import com.notextra.notes.api.NoteType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface NoteRepository extends JpaRepository<NoteEntity, UUID> {

	List<NoteEntity> findByOwnerIdOrderByUpdatedAtDesc(UUID ownerId);

	@Query("""
		SELECT DISTINCT n FROM NoteEntity n
		WHERE n.ownerId = :ownerId
		AND (:q IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
			OR LOWER(COALESCE(n.content, '')) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%')))
		AND (:tagId IS NULL OR EXISTS (
			SELECT 1 FROM NoteTagEntity nt WHERE nt.noteId = n.id AND nt.tagId = :tagId
		))
		AND (:collectionId IS NULL OR EXISTS (
			SELECT 1 FROM CollectionNoteEntity cn WHERE cn.noteId = n.id AND cn.collectionId = :collectionId
		))
		AND (:type IS NULL OR n.type = :type)
		ORDER BY n.updatedAt DESC
		""")
	List<NoteEntity> search(
		@Param("ownerId") UUID ownerId,
		@Param("q") String q,
		@Param("tagId") UUID tagId,
		@Param("collectionId") UUID collectionId,
		@Param("type") NoteType type
	);
}
