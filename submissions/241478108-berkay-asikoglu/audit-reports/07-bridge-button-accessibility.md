# Voice-Dictated Audit Report — 07

> **Oluşturulma:** Voice → STT (expo-av recording + Whisper API simulated) → Markdown

## Burn-in Screenshot
*(AvatarScreen'de STUCK durumunda BridgeButton görünür ama düşük kontrast)*

## Açıklama

"Uzmana bağlan butonu kırmızı ama arka plan da koyu, görmedim. Haptic feedback gelse iyi olur."

## Teknik Analiz

- BridgeButton `backgroundColor: '#ef4444'` ama altındaki WebView koyu mor arka plan
- WCAG kontrast oranı düşük
- `expo-haptics` kurulumu: managed workflow'da iOS crash riski (native module link)
- `Vibration` API cross-platform stabil

## Öneri

- Buton üzerine beyaz border + scale pulse animasyonu ekle
- `expo-haptics` yerine `Vibration.vibrate(200)` kullan
- Buton rengini `#ff5555` yap ve drop shadow'u artır

## Etki Alanı

- `src/components/BridgeButton.js`
- `src/screens/AvatarScreen.js`

## Burn-in Kutusu

BridgeButton FAB ve etrafındaki padding alanı.
