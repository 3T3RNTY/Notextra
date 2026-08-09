package com.notextra.notes.internal;

import com.notextra.notes.api.NoteTag;
import com.notextra.notes.internal.NotesService.CreateTagRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tags")
class TagController {

	private final NotesService notesService;

	TagController(NotesService notesService) {
		this.notesService = notesService;
	}

	@GetMapping
	List<NoteTag> list() {
		return notesService.listTags();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	NoteTag create(@Valid @RequestBody CreateTagRequest request) {
		return notesService.createTag(request);
	}

	@DeleteMapping("/{tagId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void delete(@PathVariable UUID tagId) {
		notesService.deleteTag(tagId);
	}
}
