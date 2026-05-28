# Demo Recording Checklist

The demo video should be recorded from the installed Android APK.

## APK

Install one of these files on the phone:

- `submissions/231118008-yahya-ozden/app-release.apk`
- `submissions/231118008-yahya-ozden/app-debug.apk`

## 3 Minute Flow

1. Open the installed app on the phone.
2. Tap `Mikrofonu Baslat` and grant microphone permission.
3. Stay on `Voice`; speak and show the orb/bar visualizer moving, then pause to show idle fade.
4. Switch to `Avatar`; speak again and show the Avaturn avatar reacting to microphone amplitude.
5. Switch to `Forge`; show the four forge cycles:
   - Cycle 1 SUCCESS - Voice visualizer
   - Cycle 2 SUCCESS - Avatar lipsync
   - Cycle 3 ROLLBACK - Intentional bridge issue
   - Cycle 4 SUCCESS - Expert bridge fix
6. Show `STUCK detected`.
7. Tap `Uzmana Baglan`.
8. Confirm the Jitsi room opens:

```text
https://meet.jit.si/nokta-nokta-231118008-stuck-bridge
```

## Bridge Evidence

The bridge part of the recording should show:

- Audio permission / microphone route.
- Video permission / camera route.
- Screen share option in Jitsi.
- 60+ second expert call note documented in `BRIDGE.md`.

## Classroom Link

Submit this PR link:

```text
https://github.com/seyyah/nokta-nokta/pull/27
```
