package com.notextra.notes.internal;

import com.notextra.notes.api.NoteSummary;
import com.notextra.notes.api.NotesApi;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
class NotesService implements NotesApi {

	@Override
	public Optional<NoteSummary> findById(UUID noteId) {
		return Optional.empty();
	}
}
