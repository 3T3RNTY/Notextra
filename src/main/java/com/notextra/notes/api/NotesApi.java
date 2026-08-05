package com.notextra.notes.api;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotesApi {

	Optional<NoteSummary> findById(UUID noteId);

	Optional<NoteDetail> findDetailById(UUID noteId);

	List<NoteSummary> findByOwner(UUID ownerId);

	NoteDetail createForOwner(UUID ownerId, String title, String content);
}
