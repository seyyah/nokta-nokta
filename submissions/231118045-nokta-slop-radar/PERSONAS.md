# PERSONAS

This submission ships with two avatar personas that read the same report in different tones.

## Persona 01 - Junior-sen

- Role: `Hype Scan`
- Tone: fast, excited, trend-driven
- Intent: exposes how weak reports can sound persuasive while still staying vague
- Voice config:
  - `rate: 1.2`
  - `pitch: 1.2`
- Typical feedback style:
  - highlights momentum
  - over-indexes on buzzwords
  - sounds confident before architecture is validated
- Use in demo:
  - read a deliberately weak or overhyped report
  - show how a polished tone can still hide slop

## Persona 02 - Senior-sen

- Role: `Architecture Review`
- Tone: slower, stricter, implementation-first
- Intent: reframes the same report in terms of constraints, ownership, and system design
- Voice config:
  - `rate: 0.85`
  - `pitch: 0.9`
- Typical feedback style:
  - asks what the system is
  - asks who owns the risk
  - asks what happens when the flow breaks
- Use in demo:
  - switch from Junior-sen to Senior-sen after the first audit
  - show that the exact same report receives a more grounded interpretation

## UI Behavior

- Persona label is visible in the hero area
- Persona switch is available from the avatar panel
- Persona switch also changes spoken feedback characteristics
- The avatar is positioned as a guide, not just a decorative model

## Why This Track Fits The Project

The app is not only scoring reports. It is also demonstrating how the framing voice changes the perceived credibility of a report. The two-persona setup makes that visible during the demo:

1. `Junior-sen` dramatizes the danger of polished but shallow AI language.
2. `Senior-sen` pulls the report back into concrete architecture and repair actions.

## Demo Notes To Fill Before Submission

- `TODO add timestamp where Junior-sen speaks`
- `TODO add timestamp where Senior-sen speaks`
- `TODO note which report was read by both personas`
