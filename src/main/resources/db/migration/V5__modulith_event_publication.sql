-- Spring Modulith JPA event publication registry
CREATE TABLE IF NOT EXISTS event_publication (
    id UUID NOT NULL PRIMARY KEY,
    listener_id VARCHAR(512) NOT NULL,
    event_type VARCHAR(512) NOT NULL,
    serialized_event VARCHAR(4000) NOT NULL,
    publication_date TIMESTAMPTZ NOT NULL,
    completion_date TIMESTAMPTZ,
    status VARCHAR(20),
    completion_attempts INT,
    last_resubmission_date TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS event_publication_archive (
    id UUID NOT NULL PRIMARY KEY,
    listener_id VARCHAR(512) NOT NULL,
    event_type VARCHAR(512) NOT NULL,
    serialized_event VARCHAR(4000) NOT NULL,
    publication_date TIMESTAMPTZ NOT NULL,
    completion_date TIMESTAMPTZ,
    status VARCHAR(20),
    completion_attempts INT,
    last_resubmission_date TIMESTAMPTZ
);
