Track: A

# 231118011 - Nokta Audit-Forge Submission

Track choice: **Track A - Sadelik**. This submission keeps the audit package as a drop-in primitive: the host app owns routing, storage, capture, file writing, binary writing, and sharing through `deps`; the widget is mounted once in the root layout. Removing that one mount line leaves the three-screen Expo Router app intact.

## Expo QR / Link

- Expo Go link: `expo-go://u.expo.dev/59bd1c95-dc58-4e25-b6c8-4dcf31e9d40f?channel-name=main`
- EAS / Expo project reference: https://expo.dev/accounts/farukkemree/projects/nokta-audit-forge-231118011
- Latest Android APK build: https://expo.dev/accounts/farukkemree/projects/nokta-audit-forge-231118011/builds/b9c13cc9-6ab5-4fb0-a882-37047a670bbd

## 60 Second Demo

- Demo video link: https://www.youtube.com/watch?v=UYkzabHiRl8
- Local demo artifact note: `demo/` is reserved for the recorded walkthrough export.

## What Is Included

- Minimal Expo + TypeScript + Expo Router app under `app/`.
- `@xtatistix/mobile-audit` installed and wired through host-provided dependencies.
- Routes: `/`, `/reports`, `/forge`.
- Audit reports: `capture-cta.md`, `reports-export.md`, `forge-ratchet.md`.
- Burn-in assets under `audit-reports/assets/`.
- `FORGE.md` with 3 success cycles and 1 rollback cycle.
- `IDEA.md`, `EVAL.md`, and `app-release.apk`.

## Decision Log

1. The app uses a custom compact tab row instead of adding a UI kit, keeping Track A scope small.
2. Native functionality stays in the host root layout and is passed through `deps`; the audit package is not asked to import native modules itself.
3. `currentScreen` is derived from Expo Router `usePathname()` and mapped to Capture, Reports, or Forge at render time.
4. File storage uses the host Expo FileSystem boundary so the storage adapter remains swappable.
5. Each audit report is intentionally one-screen and one-bounds so the forge cycles stay narrow.

## Human Touch Points

Total: **4**.

- Picked Track A and the `231118011-faruk-emre-ok` submission folder.
- Recorded and attached the final public YouTube demo video.
- Rebuilt the APK through EAS because the local Android toolchain is unavailable.
- Final review before PR creation is intentionally left for the student.

## AI Tool Log

- Codex read `challenge-audit-forge.md`, `nokta-audit` README, `IDEA.md`, and `nokta-forge.md`.
- Codex generated the Expo Router host app, audit reports, ledger, and evaluation notes.
- Codex ran typecheck, Expo dependency check, widget grep, APK inspection, scoped diff check, and local auto-score in an isolated copy.

## Self-Check

- [x] README first line is `Track: A`.
- [x] `app/app.json` exists.
- [x] Audit widget is mounted once in root layout.
- [x] `currentScreen` comes from `usePathname()`.
- [x] Three routes exist: `/`, `/reports`, `/forge`.
- [x] Three audit reports exist and reference burn-in screenshots.
- [x] `FORGE.md` includes success and rollback cycles.
- [x] APK file exists and is a non-empty binary artifact.
