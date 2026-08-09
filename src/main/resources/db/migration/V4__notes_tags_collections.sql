CREATE TABLE IF NOT EXISTS notes.tags (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tags_owner_name UNIQUE (owner_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_owner ON notes.tags (owner_id);

CREATE TABLE IF NOT EXISTS notes.note_tags (
    note_id UUID NOT NULL REFERENCES notes.notes (id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES notes.tags (id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_note_tags_tag ON notes.note_tags (tag_id);

CREATE TABLE IF NOT EXISTS notes.collections (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES identity.users (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_collections_owner_name UNIQUE (owner_id, name)
);

CREATE INDEX IF NOT EXISTS idx_collections_owner ON notes.collections (owner_id);

CREATE TABLE IF NOT EXISTS notes.collection_notes (
    collection_id UUID NOT NULL REFERENCES notes.collections (id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes.notes (id) ON DELETE CASCADE,
    position INT NOT NULL DEFAULT 0,
    PRIMARY KEY (collection_id, note_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_notes_note ON notes.collection_notes (note_id);
