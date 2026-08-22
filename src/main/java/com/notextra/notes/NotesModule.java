package com.notextra.notes;

import org.springframework.modulith.ApplicationModule;

/**
 * Note CRUD, collections, tags, and note-to-note relationships.
 */
@ApplicationModule(
	displayName = "Notes",
	allowedDependencies = {"media :: api", "shared"}
)
public class NotesModule {
}
