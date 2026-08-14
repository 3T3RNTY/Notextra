package com.notextra.notes.api;

import java.util.UUID;

public record NoteTag(
	UUID id,
	String name
) {
}
