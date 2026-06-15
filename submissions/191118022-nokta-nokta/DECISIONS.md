# DECISIONS

| Time | Decision | Reason | Result |
|---|---|---|---|
| 2026-05-22T00:00+03:00 | Use `seyyah/nokta-nokta` as the write target | The final challenge contract marks `seyyah/nokta` and `seyyah/nokta-audit` as read-only context. | Avoids the previous-week PR target confusion. |
| 2026-05-22T00:05+03:00 | Base the app on the week-2 audit submission | It already had the drop-in widget, local storage, burn-in selection, and Expo Router shell. | Faster path to a valid final-week host. |
| 2026-05-22T00:12+03:00 | Select Track A | Voice fidelity and lipsync responsiveness are the shortest honest path to a strong demo. | App prioritizes voice bars and mouth motion over extra personas. |
| 2026-05-22T00:20+03:00 | Use `expo-av` recording metering for voice level | The spec names `expo-av`; metering provides an RMS-like native signal without building a custom DSP pipeline. | `useVoiceMeter` converts dB metering into animated bins. |
| 2026-05-22T00:24+03:00 | Keep dictation separate from the audit widget internals | The previous week emphasized drop-in discipline; changing the package API would weaken that boundary. | `DictationCard` provides voice text while `AuditWidget` remains removable. |
| 2026-05-22T00:28+03:00 | Use Jitsi for the expert bridge | It avoids API keys and provider setup while still demonstrating video/audio/screen-share flow. | `Expert bridge` opens a deterministic room URL. |
| 2026-05-22T00:35+03:00 | Do not fake `avatar.glb` | The challenge explicitly rejects generic head models. | The fallback scene proves the pipeline; own-face GLB remains a human-provided artifact. |
| 2026-05-28T16:55+03:00 | Use USB debug for physical-device testing | Debug APK requires Metro; USB reverse gives reliable localhost routing. | Redmi device opened the app successfully. |
| 2026-05-28T17:00+03:00 | Keep Windows short-path build workaround documented | Native build under the long submission path hits Windows 260-character CMake output paths. | `C:\Users\Bahri\Desktop\nn` is used only as a build mirror. |
