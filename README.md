# Notextra

AI-assisted note taking platform. Capture text, photos, audio, and video — then use AI to generate new notes, presentations, transcripts, and other outputs.

## Architecture overview

Notextra uses a **modular monolith** backend (Spring Boot + Spring Modulith) with separate **web** and **mobile** clients. Infrastructure runs in **Docker**.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client layer                              │
│  ┌──────────────────┐          ┌──────────────────┐           │
│  │   Web (Next.js)  │          │ Mobile (Expo/RN) │           │
│  └────────┬─────────┘          └────────┬─────────┘           │
└───────────┼─────────────────────────────┼───────────────────────┘
            │         REST / WebSocket    │
            ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Notextra API (modular monolith)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────┐ ┌────────────┐ ┌─────────┐ │
│  │ Identity │ │  Notes   │ │ Media│ │ Generation │ │   AI    │ │
│  └──────────┘ └──────────┘ └──────┘ └────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
            │              │              │
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ Postgres │   │  MinIO   │   │  Redis   │
     │  (data)  │   │ (media)  │   │ (jobs)   │
     └──────────┘   └──────────┘   └──────────┘
```

## Backend modules

| Module | Responsibility |
|--------|----------------|
| **identity** | Users, auth, permissions |
| **notes** | Note CRUD, tags, collections, search |
| **media** | Upload & store photos, audio, video, documents |
| **ai** | LLM / speech-to-text provider integration |
| **generation** | Orchestrate AI jobs → notes, decks, transcripts |

Modules communicate via **published APIs** (`*.api` packages) and **domain events** (e.g. `NoteCreated`, `MediaUploaded`, `GenerationJobCompleted`). Internal implementation stays in `*.internal` packages — enforced by Spring Modulith.

## Typical user flows

1. **Capture** — User creates a note with text + attaches a voice memo and photos.
2. **Transcribe** — AI module transcribes audio → stored as linked note content.
3. **Generate** — User selects source notes/media and requests a presentation or summary.
4. **Deliver** — Generation module runs async job, produces output file + new note.

## Repository layout

```
Notextra/
├── src/main/java/com/notextra/   # Backend modular monolith
│   ├── identity/
│   ├── notes/
│   ├── media/
│   ├── ai/
│   └── generation/
├── apps/
│   ├── web/                      # Next.js web app (placeholder)
│   └── mobile/                   # Expo/React Native app (placeholder)
├── compose.yaml                  # Local dev infrastructure
├── docker/
│   └── Dockerfile                # Production API image
└── docs/
    └── ARCHITECTURE.md
```

## Prerequisites

- Java 21+
- Docker Desktop
- Maven (or use `./mvnw`)

## Local development

1. Start Docker infrastructure (Postgres, MinIO, Redis):

   ```powershell
   docker compose up -d
   ```

2. Run the API:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

   On first run, database tables are auto-created via Hibernate.

3. Verify the API is running:

   ```powershell
   curl http://localhost:8080/api/health
   # Should return: {"service":"notextra-api","status":"ok"}
   ```

4. Access services:
   - API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - MinIO Console: http://localhost:9001 (credentials: `notextra` / `notextraminio`)
   - Postgres: localhost:5432 (credentials: `notextra` / `notextra`)

## Environment variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `SPRING_DATASOURCE_URL` | Override DB URL in production |

Copy `.env.example` and fill in values for local overrides.

## Next steps

- [ ] Identity: JWT auth + user registration
- [ ] Notes: REST CRUD + rich text storage
- [ ] Media: presigned upload to MinIO
- [ ] AI: Whisper transcription + GPT summarization
- [ ] Generation: async job pipeline with Redis
- [ ] Web app scaffold (Next.js)
- [ ] Mobile app scaffold (Expo)

## License

TBD
