# Voice-Dictated Audit Report — 05

> **Oluşturulma:** Voice → STT (expo-av recording + Whisper API simulated) → Markdown

## Burn-in Screenshot
*(VoiceVisualizerScreen → AvatarScreen geçişinde viseme latency gözlemlendi)*

## Açıklama

"Avatar ekranına geçince dudaklar sesimden yarım saniye geriden geliyor. Buffer büyük galiba, düşürmek lazım."

## Teknik Analiz

- `expo-av`'ın `Recording.createAsync` default buffer boyutu: 2048 sample
- 48kHz'de 2048 sample = 42.6ms buffer latency
- Ekstra UI thread + WebView postMessage overhead ile toplam ~260ms
- Hedef <200ms

## Öneri

FFT/PCM buffer boyutunu 512'ye düşür. `setProgressUpdateIntervalAsync(16)` ile 16ms'de bir metering al. WebView postMessage throttle'ını 80ms'den 50ms'ye çek.

## Etki Alanı

- `src/screens/AvatarScreen.js`
- `src/components/VisemeController.js`
- `src/screens/VoiceVisualizerScreen.js`

## Burn-in Kutusu

VoiceVisualizerScreen'deki bar animasyonu → AvatarScreen WebView viseme state güncellemesi pipeline'ı.
