package com.notextra.notes.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record NoteDetail(
	UUID id,
	UUID ownerId,
	String title,
	String content,
	NoteType type,
	NoteStatus status,
	List<UUID> attachmentIds,
	List<NoteTag> tags,
	Instant createdAt,
	Instant updatedAt
) {
}
