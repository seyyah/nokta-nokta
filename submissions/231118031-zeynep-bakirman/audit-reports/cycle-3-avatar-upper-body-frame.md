# Audit Report - Cycle 3

## Source

User re-tested the Expo Go view after Cycle 2.

## Finding

The avatar face was still not fully visible; only the mouth region was visible. The frame needed to move lower and wider.

## Action

Move the camera farther back, widen FOV, reduce avatar scale, and lower the upper-body frame so the face and shoulders fit in the stage.

## Verification

TypeScript passed with `npx tsc --noEmit`; the new frame was pushed before the final demo recording.
