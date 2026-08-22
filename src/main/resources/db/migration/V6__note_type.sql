ALTER TABLE notes.notes ADD COLUMN IF NOT EXISTS note_type VARCHAR(50) NOT NULL DEFAULT 'TEXT';

CREATE INDEX IF NOT EXISTS idx_notes_owner_type ON notes.notes (owner_id, note_type);
