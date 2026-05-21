# Audit Report - Cycle 1

## Source

User review during PR preparation.

## Finding

The submission initially had one large final commit. The assignment and reviewer expectation called for multiple meaningful commits showing progress such as app implementation, docs/link updates, APK addition, and fixes.

## Action

Rollback/rewrite the single final commit with `git reset --soft HEAD~1`, then recommit the same work as separate scoped commits.

## Verification

`git log --oneline` showed separate commits for app work, docs/decision log, and APK.
