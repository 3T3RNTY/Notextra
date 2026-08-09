package com.notextra.notes.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(schema = "notes", name = "note_tags")
@IdClass(NoteTagEntity.NoteTagId.class)
class NoteTagEntity {

	@Id
	@Column(name = "note_id", nullable = false)
	private UUID noteId;

	@Id
	@Column(name = "tag_id", nullable = false)
	private UUID tagId;

	protected NoteTagEntity() {
	}

	NoteTagEntity(UUID noteId, UUID tagId) {
		this.noteId = noteId;
		this.tagId = tagId;
	}

	UUID getNoteId() {
		return noteId;
	}

	UUID getTagId() {
		return tagId;
	}

	static class NoteTagId implements Serializable {

		private UUID noteId;
		private UUID tagId;

		protected NoteTagId() {
		}

		NoteTagId(UUID noteId, UUID tagId) {
			this.noteId = noteId;
			this.tagId = tagId;
		}

		@Override
		public boolean equals(Object o) {
			if (this == o) {
				return true;
			}
			if (!(o instanceof NoteTagId that)) {
				return false;
			}
			return Objects.equals(noteId, that.noteId) && Objects.equals(tagId, that.tagId);
		}

		@Override
		public int hashCode() {
			return Objects.hash(noteId, tagId);
		}
	}
}
