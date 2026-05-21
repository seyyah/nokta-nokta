# EVAL

## Golden Scenarios

| scenario | expectation | check |
|---|---|---|
| Drop-in removal | Removing the single audit mount keeps `/`, `/reports`, and `/forge` renderable. | `rg -n "AuditWidget" app -g "!node_modules"` returns one line. |
| Route awareness | The audit dependency bundle receives Capture, Reports, or Forge from the active route. | Root layout uses `usePathname()` and maps pathnames to screen names. |
| Report portability | Every audit report has a screenshot, screen name, customer note, bounds, and agent input. | `audit-reports/*.md` manual scan. |
| Forge ratchet | Failed hypotheses are logged instead of erased. | `FORGE.md` includes at least one rollback row. |
| Build hygiene | The app stays type-safe and Expo-compatible. | `npm run typecheck` and `npx expo install --check`. |

## Ratchet Rule

No future cycle may add a second audit mount, move native package imports into the audit package, remove the Expo Router route mapping, or commit a forge cycle without a test result. This keeps the Track A simplicity bonus defensible.

## Halka Verification - 2026-05-21

| check | result | note |
|---|---|---|
| `npm run typecheck` | pass | TypeScript passed after voice/avatar/bridge code and after Expo patch updates. |
| `npx expo install --check` | pass | Initial patch mismatch was fixed with app-scoped `expo install`. |
| `npx expo export --platform web --output-dir dist-web-check` | pass | Export bundled `avatar.da0564028c45a1301008e0c580b5aca8.glb`. |
| single audit mount grep | pass | One line: `app/app/_layout.tsx:137`. |
| Browser smoke | pass | `/`, `/reports`, and `/forge` rendered; Forge DOM includes `Uzmana Baglan`, `Video`, `Audio`, `Screen share`, and an iframe. |
| EAS Android preview build | pass | Build `87d57eb8-9edd-451a-be33-1bf73d4b3f1d`; APK downloaded to `app-release.apk`. |
| current-work scope | pass | `git diff --name-only <previous-work-branch>...HEAD` lists only `submissions/231118011-faruk-emre-ok/`. |
| requested `origin/main...HEAD` scope | warning | Fork `origin/main` is not the clean PR base for this branch and lists legacy repo differences outside this task. No new work was made outside this submission. |
| `demo.mp4` | blocked | Missing by design until the student records real mic, audit, forge, and >=60s expert bridge proof. |

## Score / Delivery / Scope / Anti-Slop / Trace

| axis | status | evidence |
|---|---|---|
| Score | strong with one honest gap | Track A features are implemented; `demo.mp4` remains the only blocked acceptance item. |
| Delivery | pass | Required docs, `avatar.glb`, fresh `app-release.apk`, app code, and audit reports are present. |
| Scope | pass | Against `nokta-nokta/main`, all changed files are under `submissions/231118011-faruk-emre-ok/`. |
| Anti-Slop | pass | No fake avatar, fake APK, fake transcript, fake demo, or generated placeholder proof was added. |
| Trace | pass | `FORGE.md` includes COMMIT, ROLLBACK, and STUCK cycles with timestamps, tests, changed files, and notes. |
