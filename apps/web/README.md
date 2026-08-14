# Web client

Next.js 15 app that consumes the Notextra REST API.

## Setup

From the repository root:

```powershell
npm install
copy apps\web\.env.example apps\web\.env.local
npm run web
```

Open http://localhost:3000. The API should already be running at http://localhost:8080.

## Theme

Appearance (light / dark / system) and color palettes (Neutral, Ocean, Forest, Violet) are shared with the mobile app via `@notextra/theme`. Change them under **Options**. Preference is stored in `localStorage`.
