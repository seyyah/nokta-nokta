# BRIDGE Log

This file documents the expert escalation path that is triggered when the forge loop becomes stuck.

## Escalation Rule

The app is designed to surface an expert bridge when a repair issue reaches repeated failure:

- `FAIL`
- `ROLLBACK`
- `FAIL + FAIL`
- `FAIL + ROLLBACK`
- `ROLLBACK + ROLLBACK`

Any repeated broken sequence should be treated as a human-in-the-loop moment.

## Planned Demo Flow

1. Run or simulate two consecutive broken forge outcomes.
2. Show the `Open Expert Bridge` button inside the app.
3. Start the Jitsi call.
4. Keep audio, video, and screen share active for at least `60 seconds`.
5. Write the summary below and feed it into the next forge cycle.

## Session Template

### Session 01

- Date: `TODO`
- Start time: `TODO`
- End time: `TODO`
- Triggering cycle: `TODO reference cycle number from FORGE.md`
- Expert name: `TODO`
- Channel: `Jitsi`
- Screen share used: `TODO yes/no`
- Audio used: `TODO yes/no`
- Video used: `TODO yes/no`

### Problem Summary

- `TODO describe the exact stuck condition`
- `TODO explain why the agent alone could not close it`

### What The Expert Suggested

- `TODO`
- `TODO`
- `TODO`

### Decisions Taken

- `TODO`
- `TODO`

### Context Fed Back Into Next Cycle

- `TODO describe what was copied into the next repair attempt`

## Delivery Reminder

Before final PR submission, replace every `TODO` field in this file with the real bridge session details from the recorded demo.
