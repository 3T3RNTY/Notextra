package com.notextra.notes.internal;

import com.notextra.notes.api.NoteDetail;
import com.notextra.notes.internal.NotesService.CreateNoteRequest;
import com.notextra.notes.internal.NotesService.UpdateNoteRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notes")
class NoteController {

	private final NotesService notesService;

	NoteController(NotesService notesService) {
		this.notesService = notesService;
	}

	@GetMapping
	List<NoteDetail> list(
		@RequestParam(required = false) String q,
		@RequestParam(required = false) UUID tagId,
		@RequestParam(required = false) UUID collectionId
	) {
		return notesService.listForCurrentUser(q, tagId, collectionId);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	NoteDetail create(@Valid @RequestBody CreateNoteRequest request) {
		return notesService.create(request);
	}

	@GetMapping("/{noteId}")
	NoteDetail get(@PathVariable UUID noteId) {
		return notesService.get(noteId);
	}

	@PutMapping("/{noteId}")
	NoteDetail update(@PathVariable UUID noteId, @Valid @RequestBody UpdateNoteRequest request) {
		return notesService.update(noteId, request);
	}

	@DeleteMapping("/{noteId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void delete(@PathVariable UUID noteId) {
		notesService.delete(noteId);
	}

	@PostMapping("/{noteId}/attachments/{mediaAssetId}")
	NoteDetail attachMedia(@PathVariable UUID noteId, @PathVariable UUID mediaAssetId) {
		return notesService.attachMedia(noteId, mediaAssetId);
	}

	@PostMapping("/{noteId}/tags/{tagId}")
	NoteDetail attachTag(@PathVariable UUID noteId, @PathVariable UUID tagId) {
		return notesService.attachTag(noteId, tagId);
	}

	@DeleteMapping("/{noteId}/tags/{tagId}")
	NoteDetail detachTag(@PathVariable UUID noteId, @PathVariable UUID tagId) {
		return notesService.detachTag(noteId, tagId);
	}
}
