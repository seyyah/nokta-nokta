# Audit Report — MirrorScreen: Mic permission UX

**Reporter:** 231118098 (Aleyna · self-as-user)
**Screen:** Mirror (Phase A)
**Captured:** 2026-05-27
**Tool:** @xtatistix/mobile-audit + voice dictation

## Issue

Mikrofon izni reddedildiğinde uygulama sessiz başarısız oluyor — "Konuşmaya Başla" butonuna basıyorum, hiçbir şey olmuyor, neden olmadığı anlaşılmıyor. Permission denied state için kullanıcıya görsel feedback yok.

## Steps to reproduce

1. App ilk açılış (mic izni henüz verilmemiş)
2. Mirror tab'a git
3. "Konuşmaya Başla" butonuna bas
4. Sistem mic permission diyaloğu açar
5. "Reddet" / "İzin verme" seç
6. Buton hâlâ "Konuşmaya Başla" → tekrar bassan tekrar reddet diyaloğu çıkmıyor (sistem hatırlıyor)
7. **Sonuç:** Hiçbir şey olmuyor, kullanıcı kafası karışık

## Expected

İzin reddedildiğinde:
- Buton state'i değişmeli (örn. "🚫 Mikrofon izni gerekli")
- Bir uyarı banner'ı: "Mikrofon izni reddedildi. Telefon ayarlarından açabilirsin."
- Belki bir "Ayarları Aç" butonu (Linking.openSettings)

## Severity

**Medium** — Phase A demosu açısından kritik: jüri "mic verdim ama avatar konuşmuyor" diye düşünebilir, halbuki izin denied state'inde.

## Suggested fix

`useVoiceMeter` hook'una `permissionGranted` state'i zaten var ama MirrorScreen sadece `isRecording === false && !permissionGranted` koşulunda hint gösteriyor. İzin reddedildikten sonra hint görünmeli + buton disable veya alternatif metin almalı.

## Audit context

- Device: Android 13, Expo Go SDK 54
- App build: submission/231118098-tohum (e1af0d0)
