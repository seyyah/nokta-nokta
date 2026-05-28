# Burn-in Audit Report 02 — Avatar + Lipsync

## Scope
Personal Avaturn avatar (`avatar.glb`) integration and R3F canvas rendering.

## Test Steps
1. Export the personal avatar model from Avaturn.
2. Embed the `avatar.glb` file into the assets folder.
3. Render the model inside React Three Fiber Canvas.
4. Scale and position the camera to lock a clean face-and-shoulders framing.
5. Tie RMS audio levels to avatar bone movements.

## Findings
- Personal avatar renders beautifully and reliably.
- Real-time RMS volume values drive natural skeletal/head movements.
- Unnatural facial overlays are avoided to maintain premium quality.
- **Limitation:** The Avaturn model does not expose valid facial morph targets (visemes), preventing full blendshape-based lipsync.

## Risk
R3F Canvas performance and WebGL contexts can vary slightly depending on low-end device constraints.

## Forge Input
Keep the robust RMS-based motion fallback active, and transition to viseme compatible exports in a later phase.

## Result
PASS / LIMITATION
