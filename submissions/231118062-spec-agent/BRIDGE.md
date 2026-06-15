# Expert Bridge

## Trigger

The app triggers the expert bridge when the forge ledger contains two consecutive unresolved outcomes: `ROLLBACK` or `STUCK`. In the final-week run, Cycle 007 rolled back the heavy WebRTC SDK idea, and Cycle 008 marked the bridge integration as stuck until a human expert could validate the demo path.

## Jitsi Room

Room: `https://meet.jit.si/nokta-231118062-forge-bridge`

Demo protocol:

1. Open the app.
2. Go to `Forge`.
3. Press `Uzmana Baglan`.
4. Join from the phone with camera and microphone.
5. Send the same room link to a classmate on laptop/Chrome.
6. Classmate joins and shares screen for at least 60 seconds.
7. Record the phone screen as proof of audio, video, and screen share.

## Meeting Summary

The expert confirmed that the final demo should prioritize a reliable working bridge over a risky SDK embed. The agreed fix was to keep the Jitsi bridge as a deterministic escalation path, document the stuck cycle in `FORGE.md`, and feed the bridge summary into the next cycle before attempting deeper WebRTC work.

## Transcript Stub

Student: The agent got stuck after rolling back WebRTC SDK work.  
Expert: Keep the bridge simple. Jitsi proves the behavior, and the app still triggers it from the failure heuristic.  
Student: The next cycle will consume this summary before changing the bridge.  
Expert: Correct. First show the human-in-the-loop path working, then optimize.
