# HITL Bridge

## Provider

Provider: Jitsi Meet  
Room: `https://meet.jit.si/nokta-audit-forge-231118060`  
Escalation id: `HITL-231118060-AF`

## Why External

The requirement asks for audio, video and screen share. Jitsi gives those as real capabilities without pretending that the app has a complete native calling stack. The Bridge route uses `Linking.openURL` and sends the user to the real meeting room.

## Product Flow

1. User detects that the audit loop is stuck.
2. User opens the Bridge route.
3. App shows the escalation packet context.
4. User taps `Connect expert`.
5. Jitsi opens with audio/video/screen share controls.

## Escalation Packet

The intended packet contains:

- current route name from the audit context
- latest customer note
- selected bounds
- screenshot or burn-in evidence
- voice/avatar symptom if the issue is live audio related

This version presents the packet in UI and docs. A future cleanup can export it as a Markdown file before opening the meeting.

## Non-Goals

- No fake in-app call screen.
- No simulated expert response.
- No claim that the meeting is hosted by a custom backend.
