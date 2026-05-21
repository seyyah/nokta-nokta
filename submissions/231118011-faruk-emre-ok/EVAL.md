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
