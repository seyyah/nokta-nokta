## Bridge call - 2026-05-28T19:47
TRIGGER: auto + manual
STUCK_CYCLE: Cycle 2
EXPERT: classmate expert demo
DURATION_SEC: 60+
TRANSCRIPT_SUMMARY:
  - The forge loop was marked stuck after repeated rollback/fail signals around the incomplete-question report.
  - The expert narrowed the next iteration to three anchors: target user, primary problem, and success metric.
  - The app opens the Jitsi room `https://meet.jit.si/nokta-uzman-231118068` from the in-app bridge panel with video, audio, and screen-share support through WebView.
NEXT_CYCLE_INPUT: Use the bridge summary as the next forge input before changing the question-generation flow.

## Implementation Notes

- `HomeScreen.tsx` increments the forge fail counter and opens the bridge automatically after the second fail/rollback signal.
- The "Uzmana Baglan" action opens the same Jitsi room manually.
- Ending the call writes a runtime `BRIDGE.md` summary into the app document directory for handoff.
