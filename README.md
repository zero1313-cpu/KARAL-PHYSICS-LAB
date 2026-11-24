# KARAL PHYSICS LAB

An offline-first, bilingual (English/Hindi) physics learning app for Android and the web. It bundles lessons, an interactive 2D/3D laboratory, a deterministic numerical solver, a scientific calculator, a searchable formula book, virtual experiments, chapter-wise quizzes, bookmarks and local progress tracking. No account, network service, AI tutor, API key or analytics is required.

- App ID: `com.karal.physicslab`
- App name: `KARAL PHYSICS LAB`
- Stack: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Three.js, KaTeX, Dexie (IndexedDB), Vitest, Playwright, Capacitor 7, Gradle

## What works offline

Everything essential is bundled with the app: all content, simulations, physics constants, solver, quiz engine and local database. There are no remote fonts, images or scripts. The service worker (supported browsers/PWA installs only) caches the app shell for repeat offline visits. Inside Capacitor the web assets are packaged in the APK, so the app works without any network permission. The status chip only reflects the browser's real `navigator.onLine` state; it never simulates offline mode.

Curriculum lists are community-maintained study outlines, **not official board syllabi**. Simulations are explicitly labelled with their idealized assumptions; virtual experiments record *your* observations and do not invent readings.

## Requirements

- Node.js 20+ (Node LTS recommended) and npm
- For Android builds: JDK 17, Android SDK (API 35 recommended) and `adb`
- For browser e2e tests: Playwright browser binaries

## First-time setup

```bash
cd KARAL-PHYSICS-LAB
npm ci
```

## Run locally (web)

```bash
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

## Verify the project

```bash
npm run typecheck     # strict TypeScript, no unused symbols
npm run typecheck:e2e # typecheck Playwright specs
npm test              # 34 Vitest unit tests (physics, content, database, simulations, fallback)
npm run build         # typecheck + production Vite bundle into dist/
npx playwright install chromium   # once, if browsers are not installed
npm run test:e2e      # Playwright: desktop + mobile; navigation, bilingual UI, lab controls, quiz, offline, back button
```

All checks must pass before packaging an APK. Playwright cannot launch browser binaries on Android hosts; the desktop and mobile specs are typechecked locally and executed by the `e2e` job in GitHub Actions on Linux whenever the Android APK workflow runs.

## Build and install an Android APK

### Easiest: GitHub Actions

1. Push this project to a GitHub repository.
2. Open **Actions → Build Android Debug APK → Run workflow**.
3. When the run finishes, download the `karal-physics-lab-debug-apk` artifact from the run page.
4. Unzip it and install `app-debug.apk`:

```bash
adb install -r app-debug.apk
```

The workflow runs typecheck, unit tests, the production build, `npx cap sync android`, then `./gradlew assembleDebug --no-daemon` on JDK 17 with the Android SDK installed.

### Locally

```bash
npm run cap:sync          # builds web bundle and syncs it into android/
cd android
chmod +x ./gradlew
./gradlew assembleDebug --no-daemon
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

### Signed release APK (optional)

Configure repository secrets `RELEASE_KEYSTORE_BASE64` (base64 of your keystore), `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS` and `RELEASE_KEY_PASSWORD`. Then run **Actions → Build Signed Android Release APK → Run workflow**. The keystore is decoded only inside the runner, never committed, and the signed `app-release.apk` is uploaded as an artifact. Keep the keystore and passwords yourself; losing them prevents future update signing.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run typecheck` | Strict TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run test:watch` | Watch-mode unit tests |
| `npm run test:e2e` | Playwright desktop + mobile tests |
| `npm run build` | Production web bundle |
| `npm run cap:sync` | Build + copy assets/plugins into `android/` |
| `npm run cap:open` | Open the Android project in Android Studio |

## App structure

```
src/
  app/          App provider, hash router, error boundary, Android back handling
  components/   Layout, UI primitives, MathText (KaTeX), diagrams, bookmarks
  content/      Curriculum, bilingual lesson/law seeds, formulas, numericals,
                experiments, quizzes, validated local content packs
  physics/      Constants, unit conversion, dimensions, safe expression parser
  engine/       Integrators, projectile helpers, device capability probe
  database/     Dexie schema and versioned JSON backup/restore
  localization/ English and Hindi translation dictionaries
  simulations/  Declarative 2D engine, 23 two-dimensional labs, Three.js scenes
  features/     Home, courses, laws, labs, numericals, calculator, formula book,
                experiments, quizzes, bookmarks, search, progress, settings
  styles/       Tailwind theme and safe-area helpers
android/        Generated Capacitor Android project with branded launcher/splash assets
public/         PWA manifest, icons, offline service worker
tests/e2e/      Playwright end-to-end tests
.github/workflows/  Debug APK and optional signed release APK builds
```

## Data, privacy and backup

Preferences, language, theme, bookmarks, completed lessons, study time, notes, quiz scores, recent items, simulation settings and installed content packs are stored locally in IndexedDB via Dexie. Nothing is uploaded.

**Settings → Backup & restore → Export JSON backup** writes a versioned file (`schemaVersion: 1`). **Import JSON backup** validates every field before atomically replacing local learning data. Invalid, wrong-version or foreign files are rejected with a visible error and leave existing data untouched. Export a backup before clearing app data or reinstalling.

## Learning coverage and honesty

Levels: Class 6–8, Class 9–10, Class 11, Class 12, Diploma/Engineering, Undergraduate and Advanced. Each chapter has a bilingual overview lesson; the law library contains law lessons with statements, derivations, conditions, assumptions, worked examples, practice, MCQs and revision notes. Numericals show question, given data, required quantity, formula, conversion, substitution, steps and an SI answer. The evaluator never uses `eval`/`Function` and rejects unsafe names. 3D scenes offer a mapped 2D fallback when WebGL is unavailable, animation quality is low, or the device is low-memory.

Physics diagrams and simulations are schematic teaching models. Real experiments require measurement, uncertainty estimates and safety supervision.
