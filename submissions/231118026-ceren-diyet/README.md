Track: B | C

# Ceren Diyet - Halka Kapanışı (Diet Tracking MVP)

Ceren Diyet, danışanların günlük diyet takibini yaparken, yapay zeka tabanlı diyetisyen avatarı ile sesli ve görüntülü iletişim kurabildiği, olumsuz davranışlarda destekleyici yaklaşımlar sergileyen ve gerektiğinde gerçek bir uzmana (diyetisyene) WebRTC üzerinden bağlanan akıllı bir web uygulamasıdır.

## 🚀 Özellikler

1. **2D Lipsync Avatar (Track B)**: 
   - İki farklı persona: **Junior Ceren** (Sevecen, destekleyici) ve **Senior Ceren** (Disiplinli, otoriter).
   - Gerçek zamanlı Text-to-Speech (TTS) sentezi ile tam senkronize ağız hareketleri (viseme pipeline).
   
2. **OpenAI Voice-Mode Dalgası (Phase A)**:
   - Web Audio API `AnalyserNode` entegrasyonu.
   - Mikrofondan gelen sesin RMS/FFT değerlerine göre şekil değiştiren, sessizlikte sönen, konuşunca canlanan parlayan akışkan dalga animasyonu.

3. **Akıllı Diyet Analizi (Phase B)**:
   - Dikte desteği (Voice → STT → Markdown).
   - Danışanın yediği şeyleri veya psikolojik durumunu değerlendirerek otomatik destekleyici geri bildirim veya sert uyarılar verir.

4. **Otonom Köprü (Track C & Phase C)**:
   - Eğer danışan üst üste olumsuz davranışlar sergilerse veya diyet dışı zararlı besinler tüketeceğini ısrarla belirtirse uygulama **STUCK** durumuna geçer.
   - Bu durumda anında diyetisyene görüntülü/sesli/ekran paylaşımlı WebRTC çağrısı (Jitsi Meet tabanlı) tetiklenir.

## 🛠️ Kurulum ve Çalıştırma

### 1. Gereksinimler
- Node.js (v18+)
- npm

### 2. Çalıştırma
```bash
cd submissions/231118026-ceren-diyet/app
npm install
npm run dev
```

### 3. QR Kod & APK
Uygulama mobil uyumlu olarak tasarlanmıştır. QR kod ve APK dosyası (`app-release.apk`) teslim klasöründe yer almaktadır.

---
*Bu proje seyyah/nokta-nokta final ödevi kapsamında geliştirilmiştir.*
