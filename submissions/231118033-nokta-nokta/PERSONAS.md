# PERSONA CONFIGURATIONS — Nokta Nokta

- **Student:** 231118033
- **Project:** Nokta Nokta Voice Forge

---

## Purpose
The mobile application provides a real-time persona switch mechanism. This switch demonstrates how the same personal `avatar.glb` model can represent two completely distinct levels of engineering support during audit dictation and forge loop reviews.

---

## Persona 01 — Junior-Sen

### Style & Role
Junior-Sen acts as a supportive, beginner-friendly assistant. It is designed to lower development stress, explain technical terms simply, and provide step-by-step guidance.

### Tone
- **Turkish:** Destekleyici, sade ve yönlendirici
- **English:** Supportive, simple, and guiding

### In-App Message
```text
Ben Junior-Sen. Önce problemi basitleştirir, sonra adım adım çözüm öneririm.
```

### Use Case
- Simplifying complex audit findings into understandable lists.
- Providing gentle encouragement during failing forge cycles.
- Suggesting straightforward, low-risk repair steps.

---

## Persona 02 — Senior-Sen

### Style & Role
Senior-Sen represents a critical, rigorous senior engineering reviewer. It focuses heavily on security, validation protocols, risk analysis, and checking rollback criteria to ensure demo stability.

### Tone
- **Turkish:** Eleştirel, teknik ve doğrulama odaklı
- **English:** Critical, technical, and validation-focused

### In-App Message
```text
Ben Senior-Sen. Riskleri, doğrulama adımlarını ve rollback ihtimalini kontrol ederim.
```

### Use Case
- Detailed technical analysis of auditable systems.
- Rigid enforcement of test coverage and build stability.
- Initiating rollbacks for experimental or unstable changes (e.g., reverting artificial mouth overlays in Cycle 03).
- Rigorous checking of the STUCK heuristic and triggering Jitsi Meet escalation.

---

## Persona Switch & Review Support

Tapping the persona switch buttons inside the application toggles between **Junior-Sen** and **Senior-Sen** modes instantly. This switch helps the user or auditor evaluate the codebase and forge history through two different lenses:

1. **Audit Phase (Voice → Audit Markdown):**
   - In **Junior-Sen** mode, the user receives structured, step-by-step guidance on how to speak and write findings clearly.
   - In **Senior-Sen** mode, the application demands precise technical parameters, such as latency metrics (e.g., `< 200ms`) and explicit verification checklists.

2. **Forge & STUCK Phase (Phase C):**
   - **Junior-Sen** encourages the developer to continue iterating or to try a simple, alternative pathway when a rollback occurs.
   - **Senior-Sen** enforces immediate stuck transitions if there are two consecutive failures, requiring a formal expert escalation session on Jitsi.
Persona 01 — Junior-Sen
Style & Role

Junior-Sen acts as a supportive, beginner-friendly assistant. It is designed to lower development stress, explain technical terms simply, and provide step-by-step guidance.

Tone
Turkish: Destekleyici, sade ve yönlendirici
English: Supportive, simple, and guiding
In-App Message
Ben Junior-Sen. Önce problemi basitleştirir, sonra adım adım çözüm öneririm.
Turkish Report Reading Behavior

Junior-Sen reads the report in a more energetic, supportive, and guiding tone.

In the app, this mode uses a higher and more encouraging TTS configuration:

Language: tr-TR
Rate: faster / natural
Pitch: slightly higher
Purpose: supportive guidance
Use Case

Junior-Sen is used for:

- simplifying complex audit findings
- providing gentle encouragement during failing forge cycles
- suggesting straightforward, low-risk repair steps
- explaining what the user should do next
Persona 02 — Senior-Sen
Style & Role

Senior-Sen represents a critical, rigorous senior engineering reviewer. It focuses on validation, risk analysis, rollback criteria, and demo stability.

Tone
Turkish: Eleştirel, teknik ve doğrulama odaklı
English: Critical, technical, and validation-focused
In-App Message
Ben Senior-Sen. Riskleri, doğrulama adımlarını ve rollback ihtimalini kontrol ederim.
Turkish Report Reading Behavior

Senior-Sen reads the report in a slower, deeper, and more technical review tone.

In the app, this mode uses a lower and more serious TTS configuration:

Language: tr-TR
Rate: slower
Pitch: lower
Purpose: technical validation and risk review
Use Case

Senior-Sen is used for:

- detailed technical analysis of audit reports
- checking test coverage and build stability
- reviewing rollback decisions
- validating STUCK conditions
- triggering expert escalation when required
Persona Switch & Review Support

Tapping the persona switch buttons inside the application toggles between Junior-Sen and Senior-Sen modes instantly.

This switch helps the user or auditor evaluate the codebase and forge history through two different lenses.

Audit Phase Support

During the Voice → Audit Markdown phase:

Junior-Sen

Junior-Sen helps the user understand the audit result in a simple and supportive way.

Example behavior:

The voice visualizer is working. The avatar is loaded. Continue step by step and verify the expert bridge.
Senior-Sen

Senior-Sen checks whether the audit result is technically complete and whether limitations are documented.

Example behavior:

The audit report confirms the voice visualizer, avatar scene, forge loop, rollback state, and expert bridge. The GLB viseme limitation must remain documented.
Forge & STUCK Phase Support

During the Forge + Expert Bridge phase:

Junior-Sen

Junior-Sen encourages the developer to continue iterating or try a simpler fallback when a rollback occurs.

Senior-Sen

Senior-Sen enforces stricter engineering decisions:

- verify cycle result
- decide COMMIT / ROLLBACK / STUCK
- check whether failCount reached the bridge threshold
- validate whether expert escalation is required
Report Reading Feature

The application includes a persona-based Turkish report reading feature.

The user can press:

Personaya Türkçe Raporu Okut

The selected persona then reads a Turkish feedback message.

The user can also press:

Okumayı Durdur

to stop the current reading.

Avatar Motion During Persona Reading

When a persona reads the report, the avatar receives a simulated TTS activity level.

This means:

Junior-Sen / Senior-Sen reads the feedback
↓
ttsLevel is generated
↓
AvatarScene receives Math.max(microphoneLevel, ttsLevel)
↓
Avatar moves while the persona is speaking

This improves the visual feeling that the avatar is speaking, even though the current avatar.glb does not expose reliable mouth/jaw/viseme morph targets.

Known Limitation

The current personal Avaturn avatar.glb does not expose reliable facial morph targets such as:

jawOpen
mouthOpen
viseme_AA
viseme_O

Because of this, the personas do not perform full phoneme-level lipsync.

Instead, the app uses:

RMS-based and TTS-driven avatar motion fallback

This limitation is documented in:

README.md
FORGE.md
BRIDGE.md
DECISIONS.md
Final Persona State
Junior-Sen: supportive Turkish report reader
Senior-Sen: technical Turkish report reviewer
Persona switch: implemented
Turkish TTS: implemented
Avatar motion during TTS: implemented
Full viseme lipsync: limited by GLB export
Fallback: RMS/TTS-driven avatar motion

Bu hali daha iyi çünkü sadece “butonla metin değişiyor” demiyor; artık şunları açıkça kanıtlıyor:

```text
✅ Junior-Sen / Senior-Sen var
✅ Türkçe rapor okuma var
✅ Farklı tonlama var
✅ TTS sırasında avatar hareketi var
✅ GLB lipsync sınırlaması dürüstçe yazılmış
