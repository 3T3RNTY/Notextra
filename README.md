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
├── packages/
│   ├── theme/                    # Shared design tokens (light/dark + palettes)
│   └── api/                      # Shared REST client
├── apps/
│   ├── web/                      # Next.js web app
│   └── mobile/                   # Expo / React Native app
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
- Node.js 20+ (web and mobile clients)

## Local development

1. Start Docker infrastructure (Postgres, MinIO, Redis):

   ```powershell
   docker compose up -d
   ```

2. Run the API:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

   On first run, Flyway creates schemas/tables if they do not exist; Hibernate also updates any missing entity tables.

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

5. Install client dependencies (from the repo root):

   ```powershell
   npm install
   ```

6. Run the web app:

   ```powershell
   npm run web
   ```

   Open http://localhost:3000. Copy `apps/web/.env.example` to `apps/web/.env.local` if needed (`NEXT_PUBLIC_API_URL=http://localhost:8080`).

7. Run the mobile app:

   ```powershell
   npm run mobile
   ```

   Then open the Expo dev tools. iOS simulator can use `http://localhost:8080`; Android emulator typically needs `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080`. Theme (light/dark + color palettes) is changed under Options.

## Environment variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `SPRING_DATASOURCE_URL` | Override DB URL in production |
| `NEXT_PUBLIC_API_URL` | Web client API base URL (default `http://localhost:8080`) |
| `EXPO_PUBLIC_API_URL` | Mobile client API base URL |

Copy `.env.example` and fill in values for local overrides.

## Next steps

- [x] Identity: JWT auth + user registration (+ refresh tokens)
- [x] Notes: REST CRUD + tags, collections, search
- [x] Media: presigned upload to MinIO
- [ ] AI: Whisper transcription + GPT summarization
- [x] Generation: async job pipeline with Redis + WebSocket status
- [x] Web app scaffold (Next.js) with shared themes
- [x] Mobile app scaffold (Expo) with shared themes

## License

TBD
