package com.notextra.notes.api;

import java.util.UUID;

public record NoteSummary(
	UUID id,
	String title,
	NoteStatus status
) {
}
