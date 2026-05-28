# Audit Reports

This folder is reserved for mobile-generated burn-in reports from the mounted audit widget.

## Required Final Reports

| Report | Screen | Intended Evidence |
|---|---|---|
| `01-voice-mirror.md` | `Voice mirror` | Mic-driven bars wake on speech and fade toward silence. |
| `02-avatar-mirror.md` | `Avatar mirror` | Mouth movement responds to voice level and dictated text. |
| `03-expert-bridge.md` | `Expert bridge` | Stuck detector enables the human bridge after repeated non-commit cycles. |

## Capture Protocol

1. Open the target screen on the physical Android device.
2. Tap `AUD`.
3. Draw the yellow burn-in rectangle around the evidence area.
4. Add the dictated note text.
5. Save the note.
6. Double-tap `AUD`.
7. Export Markdown.
8. Copy the exported `.md` and referenced screenshot files into this folder.

## Dictation Prompts

Voice mirror:

```text
Voice mirror ekranında mikrofon barlarının konuşunca hareket ettiğini ve sessizlikte sönüp sönmediğini doğruluyorum.
```

Avatar mirror:

```text
Avatar mirror ekranında ses seviyesiyle ağız hareketinin senkron görünüp görünmediğini doğruluyorum.
```

Expert bridge:

```text
Expert bridge ekranında iki başarısız forge cycle sonrası Uzmana Bağlan butonunun aktifleştiğini doğruluyorum.
```
