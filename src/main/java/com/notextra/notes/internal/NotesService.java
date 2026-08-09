package com.notextra.notes.internal;

import com.notextra.notes.api.NoteCreated;
import com.notextra.notes.api.NoteDetail;
import com.notextra.notes.api.NoteStatus;
import com.notextra.notes.api.NoteSummary;
import com.notextra.notes.api.NoteTag;
import com.notextra.notes.api.NotesApi;
import com.notextra.shared.security.CurrentUser;
import com.notextra.shared.web.BadRequestException;
import com.notextra.shared.web.ConflictException;
import com.notextra.shared.web.ForbiddenException;
import com.notextra.shared.web.ResourceNotFoundException;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class NotesService implements NotesApi {

	private final NoteRepository noteRepository;
	private final TagRepository tagRepository;
	private final NoteTagRepository noteTagRepository;
	private final CollectionRepository collectionRepository;
	private final CollectionNoteRepository collectionNoteRepository;
	private final ApplicationEventPublisher events;

	NotesService(
		NoteRepository noteRepository,
		TagRepository tagRepository,
		NoteTagRepository noteTagRepository,
		CollectionRepository collectionRepository,
		CollectionNoteRepository collectionNoteRepository,
		ApplicationEventPublisher events
	) {
		this.noteRepository = noteRepository;
		this.tagRepository = tagRepository;
		this.noteTagRepository = noteTagRepository;
		this.collectionRepository = collectionRepository;
		this.collectionNoteRepository = collectionNoteRepository;
		this.events = events;
	}

	List<NoteDetail> listForCurrentUser(String q, UUID tagId, UUID collectionId) {
		String query = (q == null || q.isBlank()) ? null : q.trim();
		List<NoteEntity> notes = noteRepository.search(CurrentUser.id(), query, tagId, collectionId);
		Map<UUID, List<NoteTag>> tagsByNote = loadTagsByNoteIds(
			notes.stream().map(NoteEntity::getId).toList()
		);
		return notes.stream()
			.map(note -> toDetail(note, tagsByNote.getOrDefault(note.getId(), List.of())))
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
		if (request.tagIds() != null && !request.tagIds().isEmpty()) {
			replaceNoteTags(note.getId(), request.tagIds());
		}
		events.publishEvent(new NoteCreated(note.getId(), note.getOwnerId()));
		return toDetail(note, tagsForNote(note.getId()));
	}

	NoteDetail get(UUID noteId) {
		var note = getOwnedEntity(noteId);
		return toDetail(note, tagsForNote(noteId));
	}

	NoteDetail update(UUID noteId, UpdateNoteRequest request) {
		var note = getOwnedEntity(noteId);
		note.setTitle(request.title());
		note.setContent(request.content());
		if (request.status() != null) {
			note.setStatus(request.status());
		}
		if (request.tagIds() != null) {
			replaceNoteTags(noteId, request.tagIds());
		}
		return toDetail(note, tagsForNote(noteId));
	}

	void delete(UUID noteId) {
		var note = getOwnedEntity(noteId);
		noteRepository.delete(note);
	}

	NoteDetail attachMedia(UUID noteId, UUID mediaAssetId) {
		var note = getOwnedEntity(noteId);
		note.getAttachmentIds().add(mediaAssetId);
		return toDetail(note, tagsForNote(noteId));
	}

	NoteDetail attachTag(UUID noteId, UUID tagId) {
		getOwnedEntity(noteId);
		var tag = getOwnedTag(tagId);
		if (!noteTagRepository.existsByNoteIdAndTagId(noteId, tag.getId())) {
			noteTagRepository.save(new NoteTagEntity(noteId, tag.getId()));
		}
		return toDetail(getOwnedEntity(noteId), tagsForNote(noteId));
	}

	NoteDetail detachTag(UUID noteId, UUID tagId) {
		getOwnedEntity(noteId);
		getOwnedTag(tagId);
		noteTagRepository.deleteByNoteIdAndTagId(noteId, tagId);
		return toDetail(getOwnedEntity(noteId), tagsForNote(noteId));
	}

	List<NoteTag> listTags() {
		return tagRepository.findByOwnerIdOrderByNameAsc(CurrentUser.id()).stream()
			.map(tag -> new NoteTag(tag.getId(), tag.getName()))
			.toList();
	}

	NoteTag createTag(CreateTagRequest request) {
		String name = request.name().trim();
		if (tagRepository.existsByOwnerIdAndNameIgnoreCase(CurrentUser.id(), name)) {
			throw new ConflictException("Tag already exists");
		}
		var tag = new TagEntity(UUID.randomUUID(), CurrentUser.id(), name, Instant.now());
		tagRepository.save(tag);
		return new NoteTag(tag.getId(), tag.getName());
	}

	void deleteTag(UUID tagId) {
		var tag = getOwnedTag(tagId);
		noteTagRepository.deleteByTagId(tagId);
		tagRepository.delete(tag);
	}

	List<CollectionDetail> listCollections() {
		return collectionRepository.findByOwnerIdOrderByNameAsc(CurrentUser.id()).stream()
			.map(this::toCollectionDetail)
			.toList();
	}

	CollectionDetail createCollection(CreateCollectionRequest request) {
		String name = request.name().trim();
		if (collectionRepository.existsByOwnerIdAndNameIgnoreCase(CurrentUser.id(), name)) {
			throw new ConflictException("Collection already exists");
		}
		var collection = new CollectionEntity(UUID.randomUUID(), CurrentUser.id(), name, Instant.now());
		collectionRepository.save(collection);
		return toCollectionDetail(collection);
	}

	CollectionDetail getCollection(UUID collectionId) {
		return toCollectionDetail(getOwnedCollection(collectionId));
	}

	CollectionDetail updateCollection(UUID collectionId, UpdateCollectionRequest request) {
		var collection = getOwnedCollection(collectionId);
		String name = request.name().trim();
		collection.setName(name);
		return toCollectionDetail(collection);
	}

	void deleteCollection(UUID collectionId) {
		collectionRepository.delete(getOwnedCollection(collectionId));
	}

	CollectionDetail addNoteToCollection(UUID collectionId, UUID noteId) {
		var collection = getOwnedCollection(collectionId);
		getOwnedEntity(noteId);
		if (!collectionNoteRepository.existsByCollectionIdAndNoteId(collectionId, noteId)) {
			int position = collectionNoteRepository.countByCollectionId(collectionId);
			collectionNoteRepository.save(new CollectionNoteEntity(collectionId, noteId, position));
		}
		return toCollectionDetail(collection);
	}

	CollectionDetail removeNoteFromCollection(UUID collectionId, UUID noteId) {
		var collection = getOwnedCollection(collectionId);
		collectionNoteRepository.deleteByCollectionIdAndNoteId(collectionId, noteId);
		return toCollectionDetail(collection);
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<NoteSummary> findById(UUID noteId) {
		return noteRepository.findById(noteId)
			.map(note -> toSummary(note, tagsForNote(noteId)));
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<NoteDetail> findDetailById(UUID noteId) {
		return noteRepository.findById(noteId)
			.map(note -> toDetail(note, tagsForNote(noteId)));
	}

	@Override
	@Transactional(readOnly = true)
	public List<NoteSummary> findByOwner(UUID ownerId) {
		List<NoteEntity> notes = noteRepository.findByOwnerIdOrderByUpdatedAtDesc(ownerId);
		Map<UUID, List<NoteTag>> tagsByNote = loadTagsByNoteIds(
			notes.stream().map(NoteEntity::getId).toList()
		);
		return notes.stream()
			.map(note -> toSummary(note, tagsByNote.getOrDefault(note.getId(), List.of())))
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
		return toDetail(note, List.of());
	}

	private void replaceNoteTags(UUID noteId, List<UUID> tagIds) {
		Set<UUID> unique = new HashSet<>(tagIds);
		List<TagEntity> ownedTags = tagRepository.findAllById(unique).stream()
			.filter(tag -> tag.getOwnerId().equals(CurrentUser.id()))
			.toList();
		if (ownedTags.size() != unique.size()) {
			throw new BadRequestException("One or more tags were not found");
		}
		noteTagRepository.findByNoteId(noteId).forEach(noteTagRepository::delete);
		noteTagRepository.flush();
		for (TagEntity tag : ownedTags) {
			noteTagRepository.save(new NoteTagEntity(noteId, tag.getId()));
		}
	}

	private List<NoteTag> tagsForNote(UUID noteId) {
		return loadTagsByNoteIds(List.of(noteId)).getOrDefault(noteId, List.of());
	}

	private Map<UUID, List<NoteTag>> loadTagsByNoteIds(Collection<UUID> noteIds) {
		if (noteIds.isEmpty()) {
			return Map.of();
		}
		List<NoteTagEntity> links = noteTagRepository.findByNoteIdIn(noteIds);
		Set<UUID> tagIds = links.stream().map(NoteTagEntity::getTagId).collect(Collectors.toSet());
		Map<UUID, TagEntity> tags = tagRepository.findAllById(tagIds).stream()
			.collect(Collectors.toMap(TagEntity::getId, tag -> tag));

		Map<UUID, List<NoteTag>> result = new HashMap<>();
		for (NoteTagEntity link : links) {
			TagEntity tag = tags.get(link.getTagId());
			if (tag != null) {
				result.computeIfAbsent(link.getNoteId(), ignored -> new ArrayList<>())
					.add(new NoteTag(tag.getId(), tag.getName()));
			}
		}
		return result;
	}

	private NoteEntity getOwnedEntity(UUID noteId) {
		var note = noteRepository.findById(noteId)
			.orElseThrow(() -> new ResourceNotFoundException("Note not found"));
		if (!note.getOwnerId().equals(CurrentUser.id())) {
			throw new ForbiddenException("You do not have access to this note");
		}
		return note;
	}

	private TagEntity getOwnedTag(UUID tagId) {
		var tag = tagRepository.findById(tagId)
			.orElseThrow(() -> new ResourceNotFoundException("Tag not found"));
		if (!tag.getOwnerId().equals(CurrentUser.id())) {
			throw new ForbiddenException("You do not have access to this tag");
		}
		return tag;
	}

	private CollectionEntity getOwnedCollection(UUID collectionId) {
		var collection = collectionRepository.findById(collectionId)
			.orElseThrow(() -> new ResourceNotFoundException("Collection not found"));
		if (!collection.getOwnerId().equals(CurrentUser.id())) {
			throw new ForbiddenException("You do not have access to this collection");
		}
		return collection;
	}

	private CollectionDetail toCollectionDetail(CollectionEntity collection) {
		List<UUID> noteIds = collectionNoteRepository
			.findByCollectionIdOrderByPositionAsc(collection.getId())
			.stream()
			.map(CollectionNoteEntity::getNoteId)
			.toList();
		return new CollectionDetail(
			collection.getId(),
			collection.getName(),
			noteIds,
			collection.getCreatedAt()
		);
	}

	private NoteSummary toSummary(NoteEntity note, List<NoteTag> tags) {
		return new NoteSummary(note.getId(), note.getTitle(), note.getStatus(), tags);
	}

	private NoteDetail toDetail(NoteEntity note, List<NoteTag> tags) {
		return new NoteDetail(
			note.getId(),
			note.getOwnerId(),
			note.getTitle(),
			note.getContent(),
			note.getStatus(),
			List.copyOf(note.getAttachmentIds()),
			tags,
			note.getCreatedAt(),
			note.getUpdatedAt()
		);
	}

	record CreateNoteRequest(
		@NotBlank @Size(max = 500) String title,
		String content,
		List<UUID> tagIds
	) {
	}

	record UpdateNoteRequest(
		@NotBlank @Size(max = 500) String title,
		String content,
		NoteStatus status,
		List<UUID> tagIds
	) {
	}

	record CreateTagRequest(
		@NotBlank @Size(max = 100) String name
	) {
	}

	record CreateCollectionRequest(
		@NotBlank @Size(max = 255) String name
	) {
	}

	record UpdateCollectionRequest(
		@NotBlank @Size(max = 255) String name
	) {
	}

	record CollectionDetail(
		UUID id,
		String name,
		List<UUID> noteIds,
		Instant createdAt
	) {
	}
}
