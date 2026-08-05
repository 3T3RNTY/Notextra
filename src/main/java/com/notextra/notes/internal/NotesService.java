package com.notextra.notes.internal;

import com.notextra.notes.api.NoteCreated;
import com.notextra.notes.api.NoteDetail;
import com.notextra.notes.api.NoteStatus;
import com.notextra.notes.api.NoteSummary;
import com.notextra.notes.api.NotesApi;
import com.notextra.shared.security.CurrentUser;
import com.notextra.shared.web.ForbiddenException;
import com.notextra.shared.web.ResourceNotFoundException;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class NotesService implements NotesApi {

	private final NoteRepository noteRepository;
	private final ApplicationEventPublisher events;

	NotesService(NoteRepository noteRepository, ApplicationEventPublisher events) {
		this.noteRepository = noteRepository;
		this.events = events;
	}

	List<NoteDetail> listForCurrentUser() {
		return noteRepository.findByOwnerIdOrderByUpdatedAtDesc(CurrentUser.id()).stream()
			.map(this::toDetail)
			.toList();
	}

	NoteDetail create(CreateNoteRequest request) {
		var note = new NoteEntity(
			UUID.randomUUID(),
			CurrentUser.id(),
			request.title(),
			request.content(),
			NoteStatus.ACTIVE
		);
		noteRepository.save(note);
		events.publishEvent(new NoteCreated(note.getId(), note.getOwnerId()));
		return toDetail(note);
	}

	NoteDetail get(UUID noteId) {
		return toDetail(getOwnedEntity(noteId));
	}

	NoteDetail update(UUID noteId, UpdateNoteRequest request) {
		var note = getOwnedEntity(noteId);
		note.setTitle(request.title());
		note.setContent(request.content());
		if (request.status() != null) {
			note.setStatus(request.status());
		}
		return toDetail(note);
	}

	void delete(UUID noteId) {
		var note = getOwnedEntity(noteId);
		noteRepository.delete(note);
	}

	NoteDetail attachMedia(UUID noteId, UUID mediaAssetId) {
		var note = getOwnedEntity(noteId);
		note.getAttachmentIds().add(mediaAssetId);
		return toDetail(note);
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<NoteSummary> findById(UUID noteId) {
		return noteRepository.findById(noteId).map(this::toSummary);
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<NoteDetail> findDetailById(UUID noteId) {
		return noteRepository.findById(noteId).map(this::toDetail);
	}

	@Override
	@Transactional(readOnly = true)
	public List<NoteSummary> findByOwner(UUID ownerId) {
		return noteRepository.findByOwnerIdOrderByUpdatedAtDesc(ownerId).stream()
			.map(this::toSummary)
			.toList();
	}

	@Override
	public NoteDetail createForOwner(UUID ownerId, String title, String content) {
		var note = new NoteEntity(
			UUID.randomUUID(),
			ownerId,
			title,
			content,
			NoteStatus.ACTIVE
		);
		noteRepository.save(note);
		events.publishEvent(new NoteCreated(note.getId(), note.getOwnerId()));
		return toDetail(note);
	}

	private NoteEntity getOwnedEntity(UUID noteId) {
		var note = noteRepository.findById(noteId)
			.orElseThrow(() -> new ResourceNotFoundException("Note not found"));
		if (!note.getOwnerId().equals(CurrentUser.id())) {
			throw new ForbiddenException("You do not have access to this note");
		}
		return note;
	}

	private NoteSummary toSummary(NoteEntity note) {
		return new NoteSummary(note.getId(), note.getTitle(), note.getStatus());
	}

	private NoteDetail toDetail(NoteEntity note) {
		return new NoteDetail(
			note.getId(),
			note.getOwnerId(),
			note.getTitle(),
			note.getContent(),
			note.getStatus(),
			List.copyOf(note.getAttachmentIds()),
			note.getCreatedAt(),
			note.getUpdatedAt()
		);
	}

	record CreateNoteRequest(
		@NotBlank @Size(max = 500) String title,
		String content
	) {
	}

	record UpdateNoteRequest(
		@NotBlank @Size(max = 500) String title,
		String content,
		NoteStatus status
	) {
	}
}
