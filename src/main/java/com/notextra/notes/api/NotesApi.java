package com.notextra.notes.api;

import java.util.Optional;
import java.util.UUID;

public interface NotesApi {

	Optional<NoteSummary> findById(UUID noteId);
}
