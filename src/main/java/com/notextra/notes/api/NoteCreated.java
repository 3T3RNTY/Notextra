package com.notextra.notes.api;

import java.util.UUID;

public record NoteCreated(UUID noteId, UUID ownerId) {
}
