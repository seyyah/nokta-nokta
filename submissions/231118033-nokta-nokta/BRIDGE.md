# BRIDGE.md

STUDENT: 231118033  
PROJECT: Nokta Nokta Voice Forge  
TRACK: A  
BRIDGE_TYPE: Jitsi WebRTC Expert Bridge  

---

## TRIGGER

The expert bridge is triggered when the forge loop reaches one of the following conditions:

```text
2 consecutive FAIL / ROLLBACK states
OR
1 explicit STUCK state

In this project, the bridge was triggered after the avatar lipsync issue could not be fully solved with the current avatar.glb export.

The application uses the following heuristic:

bridgeRequired = failCount >= 2 || cycleStatus === "STUCK"

When this condition becomes true, the Uzmana Bağlan button becomes active and opens the Jitsi expert bridge.

STUCK_CYCLE
Cycle 04 — STUCK — STUCK + Expert Bridge
STUCK Reason

The personal Avaturn avatar was successfully loaded into the React Three Fiber scene.

However, the current GLB export does not expose reliable mouth, jaw, or viseme morph targets. Because of this limitation, full phoneme/viseme-based lipsync could not be completed safely.

A fake mouth overlay and aggressive visual adjustments were considered, but this approach was rejected because it did not look natural.

The project therefore uses:

RMS-based avatar motion fallback

This limitation was documented in the forge loop and escalated to the expert bridge.

EXPERT
EXPERT: Alperen Eri
ROLE: Yol arkadaşı / peer reviewer
BRIDGE_URL
https://meet.jit.si/231118033-nokta-nokta-bridge

The bridge is opened directly from the application with the Uzmana Bağlan button.

DURATION_SEC
DURATION_SEC: 150

The expert bridge session lasted approximately 2 minutes and 30 seconds.

During the session, the following bridge requirements were demonstrated:

- audio enabled
- video enabled
- screen sharing enabled
- application screen shared
- STUCK / bridge workflow reviewed
- technical limitations discussed
TRANSCRIPT_SUMMARY

During the expert bridge session, the technical details of the project were reviewed with Alperen Eri.

The discussion focused on the following points:

1. The personal avatar.glb file is correctly included in the project.
2. The avatar is not generic; it is based on the student's Avaturn export.
3. The voice visualizer and RMS/level-based animation flow were reviewed.
4. The current GLB file does not provide reliable mouth/jaw/viseme morph targets.
5. Because of this, full viseme-based lipsync could not be completed safely.
6. RMS-based avatar motion fallback was evaluated as the most stable solution for the current demo.
7. The fake mouth overlay approach was rejected because it looked visually unnatural.
8. The forge cycle correctly documents COMMIT, ROLLBACK, and STUCK states.
9. The STUCK state correctly activates the expert bridge flow.
10. The Jitsi bridge was confirmed as a valid WebRTC-based escalation path.
EXPERT_RECOMMENDATION

The expert recommendation was:

Keep the current clean avatar scene.
Do not force an unnatural fake mouth overlay.
Use RMS-based avatar motion fallback for the final demo.
Clearly document the missing viseme/morph target limitation.
Show the issue as a real STUCK case in the forge loop.
Use the Jitsi bridge as the human escalation point.
For future improvement, export a new avatar model with ARKit blendshapes or reliable viseme morph targets.
NEXT_CYCLE_INPUT

The bridge output becomes the input for the next forge cycle:

Use the current avatar.glb as the personal avatar asset.
Keep RMS-based avatar motion fallback.
Do not force fake lipsync.
Document the GLB limitation clearly in README.md, FORGE.md, and BRIDGE.md.
Use the STUCK state as the reason for expert escalation.
For future work, obtain a GLB export with reliable ARKit blendshapes or viseme morph targets.
FINAL_BRIDGE_STATE
Bridge status: COMPLETED
Expert: Alperen Eri
Duration: 150 seconds
Jitsi URL: configured
STUCK trigger: implemented
Audio/video: demonstrated
Screen sharing: demonstrated
Transcript summary: manually documented
Next cycle context: documented
LIMITATION

Automatic meeting transcription is not implemented in this version.

The bridge session summary was manually written in this file after the expert review.

This is acceptable for the current submission because the project still demonstrates:

STUCK detection
expert escalation
Jitsi bridge opening
audio/video/screen-share workflow
manual bridge summary
next-cycle context generation