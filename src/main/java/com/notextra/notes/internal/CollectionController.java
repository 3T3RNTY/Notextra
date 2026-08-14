package com.notextra.notes.internal;

import com.notextra.notes.internal.NotesService.CollectionDetail;
import com.notextra.notes.internal.NotesService.CreateCollectionRequest;
import com.notextra.notes.internal.NotesService.UpdateCollectionRequest;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/collections")
class CollectionController {

	private final NotesService notesService;

	CollectionController(NotesService notesService) {
		this.notesService = notesService;
	}

	@GetMapping
	List<CollectionDetail> list() {
		return notesService.listCollections();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	CollectionDetail create(@Valid @RequestBody CreateCollectionRequest request) {
		return notesService.createCollection(request);
	}

	@GetMapping("/{collectionId}")
	CollectionDetail get(@PathVariable UUID collectionId) {
		return notesService.getCollection(collectionId);
	}

	@PutMapping("/{collectionId}")
	CollectionDetail update(
		@PathVariable UUID collectionId,
		@Valid @RequestBody UpdateCollectionRequest request
	) {
		return notesService.updateCollection(collectionId, request);
	}

	@DeleteMapping("/{collectionId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void delete(@PathVariable UUID collectionId) {
		notesService.deleteCollection(collectionId);
	}

	@PostMapping("/{collectionId}/notes/{noteId}")
	CollectionDetail addNote(@PathVariable UUID collectionId, @PathVariable UUID noteId) {
		return notesService.addNoteToCollection(collectionId, noteId);
	}

	@DeleteMapping("/{collectionId}/notes/{noteId}")
	CollectionDetail removeNote(@PathVariable UUID collectionId, @PathVariable UUID noteId) {
		return notesService.removeNoteFromCollection(collectionId, noteId);
	}
}
