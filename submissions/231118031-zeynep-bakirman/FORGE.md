# FORGE Cycle Ledger

Student: Zeynep Bakirman  
Student No: 231118031  
Track: A

This ledger records real feedback loops from the submission work. Inputs are saved under `audit-reports/` when they came from user review or in-app/demo testing feedback.

## Row Template

```text
## Cycle N - <slug> - YYYY-MM-DDTHH:MM
STATUS: COMMIT | ROLLBACK | STUCK
INPUT: <audit-report-path>
HYPOTHESIS: <one line>
CHANGES: <files touched>
TEST: <how verified>
DURATION_MIN: <n>
NOTES: <free-form>
```

## Cycle 1 - commit-history-rollback - 2026-05-21T18:13
STATUS: ROLLBACK
INPUT: `audit-reports/cycle-1-commit-structure.md`
HYPOTHESIS: A single final commit hides the required engineering trace; the submission history should be split into meaningful commits.
CHANGES: Git history rewritten with `git reset --soft HEAD~1`; final monolithic commit split into app, docs, and APK commits.
TEST: `git log --oneline -5` showed separate commits for app implementation, docs/decision log, and APK.
DURATION_MIN: 8
NOTES: Real rollback of the previous one-commit delivery. Resulting commits: `e147eb7`, `7e38462`, `bd11012`.

## Cycle 2 - avatar-face-crop - 2026-05-21T18:29
STATUS: COMMIT
INPUT: `audit-reports/cycle-2-avatar-face-crop.md`
HYPOTHESIS: The camera is framing the avatar body too high/close, so the face is out of view.
CHANGES: `app/App.tsx`
TEST: `npx tsc --noEmit`; Expo Go reload and user screenshot review.
DURATION_MIN: 10
NOTES: Added a camera rig and moved the procedural mouth from torso level toward the face. Commit: `6416af6`.

## Cycle 3 - avatar-upper-body-frame - 2026-05-21T18:31
STATUS: COMMIT
INPUT: `audit-reports/cycle-3-avatar-upper-body-frame.md`
HYPOTHESIS: The camera is still too tight; a wider upper-body frame will keep the face visible during the demo.
CHANGES: `app/App.tsx`
TEST: `npx tsc --noEmit`; Expo Go reload requested before recording demo.
DURATION_MIN: 5
NOTES: Camera moved back, FOV widened, avatar scale reduced, and mouth fallback lowered. Commit: `cc4926f`.
