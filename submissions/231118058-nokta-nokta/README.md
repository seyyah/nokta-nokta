Track: A

## Submission

- **Öğrenci no:** 231118058
- **Slug:** nokta-nokta
- **Track:** A — Sadakat (Voice viz + lipsync fidelity, latency, akıcılık)

## Checklist

- [x] Yalnızca `submissions/231118058-nokta-nokta/` altında değişiklik yaptım
- [x] README ilk satırında Track seçimi var
- [x] Phase A bileşenleri tamamlandı (VoiceVisualizer + AvatarScene)
- [x] FORGE.md ≥3 cycle (4 cycle: 2 COMMIT + 1 ROLLBACK + 1 STUCK)
- [x] BRIDGE.md dolduruldu (≥60sn video+audio+screen share)
- [x] avatar.glb mevcut (app/assets/avatar.glb — avaturn.me export)
- [x] app-release.apk build edilmiş
- [ ] demo.mp4 ≤3dk eklenecek
- [ ] Expo QR / link eklenecek

---

# OkbilApp × Nokta-Nokta — Track A: Voice Visualizer + Avatar Lipsync

## Proje Bilgileri
- **APK:** `submissions/231118058-nokta-nokta/app-release.apk`
- **Demo Video:** [demo.mp4 eklenecek]
- **Expo Go Yayını:** [Expo link eklenecek]

## Phase A — Ayna (Voice + Avatar)

### VoiceVisualizer
- `expo-av` ile mikrofon kaydı (`Audio.Recording`)
- Her 50ms'de `meteringEnabled` ile dBFS ses seviyesi ölçümü
- 20 adet bar `Animated.spring` ile gerçek zamanlı animasyon
- Sessizlikte idle breathing animasyonu
- Konuşunca barlar OpenAI voice-mode estetiğinde zıplıyor
- **Latency < 200ms mic-to-mouth ✅**

### AvatarScene
- `expo-gl` + `expo-three` ile GLView içinde 3D render
- `app/assets/avatar.glb` — avaturn.me'den kendi yüz export'u (4.5MB)
- Ses seviyesine göre ağız `scale.y` ile lipsync:
  - Sessiz → `mouth.scale.y = 1` (idle)
  - Konuşuyor → `mouth.scale.y = 1 + vol * 3.5`
- Avatar hafif yalpa hareketi (idle breathing)

### AvatarVoiceScreen
- Üstte `AvatarScene` (ekranın ~%58'i)
- Altta `VoiceVisualizer` (ekranın ~%24'ü)
- "Konuşmaya Başla" / "Durdur" butonu
- Mikrofon izni `Audio.requestPermissionsAsync()` ile isteniyor
- Bottom tab navigasyona "Avatar" sekmesi olarak eklendi

## Phase B — Forge Döngüleri

FORGE.md'de 4 cycle:
- **Cycle 1** — STATUS: COMMIT (UI modernizasyon)
- **Cycle 2** — STATUS: ROLLBACK (lipsync ilk deneme, >500ms latency)
- **Cycle 3** — STATUS: STUCK (Bridge call tetiklendi)
- **Cycle 4** — STATUS: COMMIT (expert görüşme sonrası rAF optimizasyonu, <100ms)

## Phase C — Bridge (HITL)

- Uygulama içi "Uzmana Bağlan" butonu (Jitsi WebRTC)
- Cycle 3 STUCK sonrası manual bridge tetiklendi
- 65+ saniye video + audio + screen share aktif
- Görüşme özeti BRIDGE.md'de

## AI Tool Log
- **Kullanılan AI Tool:** Antigravity (Claude Sonnet 4.6 Thinking)
- **Süreç:** Uçtan uca pair-programming; bileşen mimarisi, expo-gl entegrasyonu, lipsync algoritması

## Decision Log
- **expo-three tercih edildi:** `@react-three/fiber` Expo Go managed workflow'da desteklenmiyor; `expo-three` + `THREE.js` doğrudan GLView ile çalışıyor.
- **Fallback geometry:** `avatar.glb` assets'te olmadan da ekran çalışsın diye THREE.js ile basit kafa modeli oluşturuldu.
- **Polling 50ms:** Expo `metering` API'si event-driven değil, polling gerekiyor. 50ms latency hedefin altında kalıyor.
- **requestAnimationFrame:** setInterval(50) yerine rAF ile latency <100ms'ye düşürüldü (Bridge call feedback'i).
