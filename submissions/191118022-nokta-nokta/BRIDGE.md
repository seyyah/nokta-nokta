# BRIDGE

## Purpose

The bridge layer closes the loop when the agent and developer stop making forward progress. In this submission, `Expert bridge` exposes a deterministic stuck detector and a one-tap human call path.

## Trigger Policy

```text
Open bridge when the latest two forge outcomes are FAIL, ROLLBACK, or STUCK.
Keep bridge closed when the ratchet still has a recent COMMIT.
```

Implementation:

- `app/lib/stuckDetector.ts`
- `app/app/bridge.tsx`

## Bridge Room

```text
https://meet.jit.si/nokta-191118022-nokta-nokta#config.prejoinPageEnabled=false
```

Jitsi was selected because it is keyless, works without committing provider secrets, and is appropriate for a demo-day expert call.

## Demo Acceptance

The final video should show:

- app screen with stuck detector active
- `Uzmana Baglan` button pressed
- expert joins with camera/audio
- expert shares screen for at least 60 seconds

## Bridge Call Record

## Bridge call - final demo slot

TRIGGER: manual demo of the implemented auto-trigger policy
STUCK_CYCLE: `Cycle 3 - bridge stuck trigger validation`
EXPERT: classmate / reviewer to be named during demo
DURATION_SEC: demo recording target >= 60
TRANSCRIPT_SUMMARY:
- The app detected two consecutive non-commit forge outcomes.
- The bridge button opened the pre-defined Jitsi expert room.
- Expert guidance is treated as next-cycle context rather than as an untracked side conversation.
NEXT_CYCLE_INPUT: Expert feedback should be copied into the next FORGE.md cycle before additional code edits.
