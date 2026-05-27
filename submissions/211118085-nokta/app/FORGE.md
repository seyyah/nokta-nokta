# FORGE.md

## Nokta — Forge Döngüsü Kayıtları

> Kurallar: Her cycle 20dk kutulu. ≥2 başarılı + ≥1 rollback zorunlu.
> 2x FAIL/ROLLBACK → Expert Bridge tetiklenir.

---

## Cycle #1 — [Tarih]

**Durum:** ✅ BAŞARILI  
**Süre:** 20dk  
**Hedef:** Voice Visualizer entegrasyonu

### Yapılanlar
- `VoiceVisualizer.jsx` oluşturuldu
- `expo-av` mikrofon izni ayarlandı
- RMS → bar animasyonu bağlandı

### Test
- Mikrofona konuşuldu → barlar tepki verdi ✅
- Sessizlikte barlar söndü ✅
- <200ms latency gözlemlendi ✅

### Çıktı
```
VoiceVisualizer çalışıyor, rms değeri AvatarWebView'a iletiliyor.
```

---

## Cycle #2 — [Tarih]

**Durum:** ✅ BAŞARILI  
**Süre:** 20dk  
**Hedef:** AvatarWebView + lipsync entegrasyonu

### Yapılanlar
- `avatar-web/index.html` WebView'a yüklendi
- GLB asset bundle'a eklendi
- postMessage köprüsü (RMS → viseme) test edildi

### Test
- Avatar yüklendi ✅
- Konuşunca dudaklar hareket etti ✅
- Persona geçişi çalıştı ✅

### Çıktı
```
Avatar konuşuyor. Junior/Senior persona geçişi sorunsuz.
```

---

## Cycle #3 — [Tarih] ⚠️ ROLLBACK

**Durum:** 🔴 ROLLBACK  
**Süre:** 20dk  
**Hedef:** Jitsi WebView kamera izni

### Yapılanlar
- `ExpertBridge.jsx` Jitsi URL'i açtı
- Android kamera izni `onPermissionRequest` denendi

### Problem
```
Android WebView kamera iznini otomatik grant etmedi.
Jitsi "Kamera bulunamadı" hatası verdi.
```

### Rollback Nedeni
Android `mediaCapturePermissionGrantType` prop'u bu WebView versiyonunda
desteklenmiyor. Jitsi sayfası ses olmadan açılıyor.

### Çözüm (Sonraki Cycle)
- `react-native-webview` güncellemesi dene
- Manuel izin dialog'u ekle: `PermissionsAndroid.request(CAMERA)`

---

## Cycle #4 — [Tarih]

**Durum:** ✅ BAŞARILI  
**Süre:** 20dk  
**Hedef:** Kamera izni fix + Expert Bridge demo

### Yapılanlar
- `PermissionsAndroid.request` Cycle #3 çözümü uygulandı
- Jitsi ses+video çalıştı
- 60sn demo tamamlandı

### Test
- Görüntülü görüşme açıldı ✅
- Ekran paylaşımı çalıştı ✅
- 60sn timer tamamlandı ✅
- BRIDGE.md güncellendi ✅

### Çıktı
```
Expert Bridge tam fonksiyonel. BRIDGE.md Görüşme #1 eklendi.
```

---

## Özet

| Cycle | Durum | Süre | Özellik |
|---|---|---|---|
| #1 | ✅ Başarılı | 20dk | Voice Visualizer |
| #2 | ✅ Başarılı | 20dk | Avatar Lipsync |
| #3 | 🔴 Rollback | 20dk | Jitsi Kamera |
| #4 | ✅ Başarılı | 20dk | Bridge Fix |

**Toplam:** 4 cycle · 80dk · 3 başarılı · 1 rollback ✅
