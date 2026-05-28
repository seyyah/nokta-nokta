# Bug Raporu — Nokta Voice Avatar Bridge

**Tarih:** 28.05.2026 17:42
**Toplam:** 1 not · 🔴 1 açık
**Üretim:** Sesli dikte → STT → markdown (manuel review)

---

## Ekran: Home → Uzmana Bağlan

### 🔴 #1 — "Uzmana Bağlan" tıkladığımda hiçbir şey olmuyor, kamera açılmıyor

![Screenshot](./screenshots/bridge-no-permission-2026-05-28.png)

**Konuştuğum (transcript):**

> "Ana ekrandaki 'Uzmana Bağlan' butonuna bastım, yeni bir sayfa açıldı 'Görüşmeye Katıl' diyor. Butona bastım ama hiçbir şey olmadı. Sanırım kamera ve mikrofon izni eksik. Android için RECORD_AUDIO ve CAMERA permission'larını eklemek lazım. Bir de Daily.co'yu mu deneyelim yoksa Jitsi key-less mı? Submission'a 4 saat var, en hızlı yol hangisi?"

**Etki:** Phase C ACCEPTANCE: "Uzmana çağrı butonu app'te functional" → şu an navigation çalışıyor ama WebView içinde getUserMedia başarısız → video+audio+share gösterilemez.

- **Durum:** Açık
- **Zaman:** 28.05.2026 17:42:18
- **Raporlayan:** 211118032

---

## Aksiyon önerisi

1. `app.json` Android: `RECORD_AUDIO`, `CAMERA`, `MODIFY_AUDIO_SETTINGS`, `INTERNET` permissions
2. `app.json` iOS: `NSMicrophoneUsageDescription`, `NSCameraUsageDescription` info.plist
3. `react-native-webview` props: `allowsInlineMediaPlayback`, `mediaPlaybackRequiresUserAction={false}`, `mediaCapturePermissionGrantType="grant"`
4. Jitsi URL'sine `#config.prejoinPageEnabled=false&config.disableDeepLinking=true` query → app içinde lobby skip
5. Oda adı `nokta-211118032-<rand>` → çakışma yok

→ Forge cycle 4: `bridge-jitsi-mount` (FORGE.md Cycle 4)
