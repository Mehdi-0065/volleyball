# 🏐 RotationIQ — Volleyball Rotation Coach

A modern, animated single-page app that teaches volleyball court rotations and
player movement for the four main systems — **4‑2, 6‑2, 5‑1** and the beginner
**6‑6** — across all 6 rotations, with no libero (exactly 6 players on court).

Ships as a website (AWS Amplify) and as native **Android** and **iOS** apps
(Capacitor) from one shared codebase. Store display name: **RotationIQ: Volleyball Coach**.

For every system × rotation it shows:

- **Where players stand before the serve** (a legal lineup that respects the
  overlap rule), and
- **How they move after serve contact**, animated smoothly,
- For both **we serve** and **they serve (serve receive)** scenarios.

## Features

- **Top‑down SVG court** that scales crisply to any size (net, sidelines, 3 m
  attack line, faint zone numbers 1–6).
- **Stepped animation engine** with a phase indicator and one‑line captions:
  - _We serve_ → Before serve → Serve contact → Switch to base defence.
  - _They serve_ → Serve receive → Serve contact → Pass · Set · Attack →
    Transition to base defence.
- **Setter movement** is highlighted (front‑row setter in 4‑2, back‑row
  penetration in 6‑2 and back‑row 5‑1 rotations).
- **Overlap rule** teaching: optional guide lines between adjacent players, with
  an in‑app plain‑English explainer. Illegal formations would highlight red
  (all built‑in data is legal by construction).
- **Playback controls**: play / pause / step / restart, a 0.5×–2× speed slider,
  and an auto‑play loop for screen‑sharing while teaching.
- **Numbered roles** (S1/S2, OH1/OH2, MB1/MB2) plus optional **figure tokens**
  and **editable real player names** (saved per device).
- **Toggles** for movement arrows, overlap guides and zone numbers.
- **Light & dark mode**, fully **mobile‑responsive** (controls collapse into a
  bottom sheet), and `prefers-reduced-motion` aware, with smooth eased motion.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Framer Motion (player + ball animations)
- Zustand (client‑side state, no backend)

## Data model

Everything is driven by typed data (see `src/types.ts`). Each system is built
from rules in `src/data/build.ts`, producing:

```ts
type Phase = { id; caption; positions: Record<PlayerId, {x, y}>; ball? };
type System = { name; description; players; rotations: { rotation; serve; receive; bullets }[] };
```

Coordinates use **court‑relative units (0–100)** so the SVG scales freely and any
player's position can be fine‑tuned by editing the coordinate tables in
`src/data/court.ts`.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build (outputs to dist/)
npm run preview  # preview the production build
```

Validate that every pre‑serve formation is legal and complete:

```bash
npx tsx scripts/validate.ts
```

## Deployment

The app is a static site. Build with `npm run build` and deploy the `dist/`
folder to any static host (Vercel, Netlify, GitHub Pages, S3, …).

### AWS Amplify Hosting

A ready‑to‑use [`amplify.yml`](./amplify.yml) build spec is included:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands: [npm ci]
    build:
      commands: [npm run build]
  artifacts:
    baseDirectory: dist
    files: ['**/*']
  cache:
    paths: [node_modules/**/*]
```

Steps:

1. Push this repo to GitHub/GitLab/Bitbucket (or use the Amplify CLI).
2. In the AWS Amplify console, choose **Host a web app** → connect the repo and
   branch. Amplify auto‑detects `amplify.yml` (build output `dist/`).
3. Deploy. Amplify builds with Node 18+ and serves the static `dist/` output.

No server‑side rendering or backend is required, and there is no client‑side
routing, so no rewrite rules are needed.

## Mobile apps (Android & iOS via Capacitor)

The same codebase ships as native Android and iOS apps using
[Capacitor](https://capacitorjs.com) — the web build runs inside a native
shell, so all rendering, animation and state code is reused unchanged.

```bash
# Build the web app and copy it into the native projects
npm run cap:sync

# Open the native IDEs to run on a device/emulator or to publish
npm run cap:android   # opens Android Studio
npm run cap:ios       # opens Xcode (requires macOS)

# Regenerate app icons & splash screens (sources live in /assets)
node scripts/gen-assets.mjs   # builds the vector PNG sources
npm run cap:assets            # generates every platform size
```

Requirements:

- **Android:** Android Studio (+ Android SDK).
- **iOS:** a Mac with Xcode. Capacitor 8 uses Swift Package Manager, so no
  CocoaPods step is needed.
- App identity: `appId: com.rivitan.volleyball`, configured in
  [`capacitor.config.ts`](./capacitor.config.ts).

Publishing: open the project in Android Studio / Xcode, set your signing
credentials, then build an `.aab` (Google Play) or archive (App Store). An
Apple Developer account ($99/yr) and Google Play account ($25 one-time) are
required for store distribution.

## Project structure

```
src/
  types.ts             # core domain types
  store.ts             # Zustand app state
  roles.ts             # role colours & names
  anim.ts              # animation timing
  data/
    court.ts           # court geometry, coordinate tables, overlap rule
    build.ts           # rules-based generator for all systems/rotations
  components/
    Court.tsx          # SVG court + animated players + ball + arrows + guides
    TopBar.tsx         # system tabs + theme toggle
    Controls.tsx       # rotation / scenario / playback / toggles
    PhaseStepper.tsx   # numbered phase pills + caption
    Legend.tsx         # role colours, ball, arrows
    Explainer.tsx      # per-rotation bullets + overlap rule card
    RosterEditor.tsx   # editable real player names
scripts/
  validate.ts          # data legality checks
  gen-assets.mjs       # vector -> PNG icon/splash sources
assets/                # icon & splash source images (Capacitor)
android/ ios/          # native app projects (Capacitor)
capacitor.config.ts    # native app id / name / web dir
amplify.yml            # AWS Amplify Hosting build spec
```
