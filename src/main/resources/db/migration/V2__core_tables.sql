CREATE TABLE identity.users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes.notes (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES identity.users (id),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_owner ON notes.notes (owner_id);

CREATE TABLE notes.note_attachments (
    note_id UUID NOT NULL REFERENCES notes.notes (id) ON DELETE CASCADE,
    media_asset_id UUID NOT NULL,
    PRIMARY KEY (note_id, media_asset_id)
);

CREATE TABLE media.media_assets (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES identity.users (id),
    type VARCHAR(50) NOT NULL,
    storage_key VARCHAR(1024) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_owner ON media.media_assets (owner_id);

CREATE TABLE generation.generation_jobs (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES identity.users (id),
    output_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    prompt TEXT,
    source_note_ids TEXT,
    source_media_ids TEXT,
    result_note_id UUID,
    result_media_id UUID,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generation_owner ON generation.generation_jobs (owner_id);
