# Nokta-Nokta Architecture Decisions

## 1. WebRTC Provider
- **Decision**: Jitsi Meet (`react-native-jitsi-meet`) over LiveKit/Daily.co
- **Rationale**: Requires zero auth/key generation. Easy to trigger via standard URL schemes and perfectly matches the "Fail-safe" philosophy for the HITL (Human-in-the-Loop) STUCK module.

## 2. Voice-to-Text Pipeline
- **Decision**: Deterministic Queue over live LLM API for Demo
- **Rationale**: Due to Gemini API rate limits and strict key blocking policies (Google automatically revoking keys pushed to GitHub), relying on live API calls during a video demonstration introduces unacceptable flakiness. We implemented a fallback sequential queue logic ensuring exact NLP triggers are hit precisely to demonstrate the WebRTC bridge reliably.

## 3. Avatar Module
- **Decision**: `react-three-fiber` and `drei`
- **Rationale**: Lightweight, deeply integrates with React state. Allows passing `volumeLevel` (RMS from `expo-av`) directly into a prop to trigger dynamic lip-syncing without needing complex animation frame loops.

## 4. Engineering Probes
- **Decision**: Static probe mapping in absence of Groq Key.
- **Rationale**: Ensures the SLOP-CHECK phase works 100% of the time, guaranteeing progression to the final Artifact and Avatar phase even if LLM keys expire.
