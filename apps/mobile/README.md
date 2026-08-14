# Mobile client

Expo (React Native) app with Expo Router. Consumes the same Notextra REST API as the web client.

## Setup

From the repository root:

```powershell
npm install
copy apps\mobile\.env.example apps\mobile\.env
npm run mobile
```

Then press `i` for iOS simulator or `a` for Android emulator.

## API URL

Default: `EXPO_PUBLIC_API_URL=http://localhost:8080`

- iOS simulator: `http://localhost:8080`
- Android emulator: `http://10.0.2.2:8080`
- Physical device: use your machine's LAN IP, e.g. `http://192.168.x.x:8080`

## Theme

Appearance (light / dark / system) and color palettes (Neutral, Ocean, Forest, Violet) are shared with the web app via `@notextra/theme`. Change them under the **Options** tab. Preference is stored in AsyncStorage.
