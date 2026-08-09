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
@Table(schema = "notes", name = "collection_notes")
@IdClass(CollectionNoteEntity.CollectionNoteId.class)
class CollectionNoteEntity {

	@Id
	@Column(name = "collection_id", nullable = false)
	private UUID collectionId;

	@Id
	@Column(name = "note_id", nullable = false)
	private UUID noteId;

	@Column(nullable = false)
	private int position;

	protected CollectionNoteEntity() {
	}

	CollectionNoteEntity(UUID collectionId, UUID noteId, int position) {
		this.collectionId = collectionId;
		this.noteId = noteId;
		this.position = position;
	}

	UUID getCollectionId() {
		return collectionId;
	}

	UUID getNoteId() {
		return noteId;
	}

	int getPosition() {
		return position;
	}

	static class CollectionNoteId implements Serializable {

		private UUID collectionId;
		private UUID noteId;

		protected CollectionNoteId() {
		}

		CollectionNoteId(UUID collectionId, UUID noteId) {
			this.collectionId = collectionId;
			this.noteId = noteId;
		}

		@Override
		public boolean equals(Object o) {
			if (this == o) {
				return true;
			}
			if (!(o instanceof CollectionNoteId that)) {
				return false;
			}
			return Objects.equals(collectionId, that.collectionId) && Objects.equals(noteId, that.noteId);
		}

		@Override
		public int hashCode() {
			return Objects.hash(collectionId, noteId);
		}
	}
}
