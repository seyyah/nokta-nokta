# PERSONAS.md

## Nokta — Avatar Persona Sistemi

### Genel Bakış
Nokta uygulamasında iki farklı avatar persona bulunmaktadır. Her ikisi de kullanıcının **kendi yüzüyle** oluşturulmuş avaturn.me GLB dosyasını kullanır; fark **ton, duruş ve geri bildirim stili**ndedir.

---

## Persona 1 — 🧑 Junior Ben

| Özellik | Değer |
|---|---|
| `persona` değeri | `junior` |
| GLB | `assets/avatar.glb` |
| Avatar ölçeği | `[1, 1, 1]` |
| Kamera pozisyonu | `[0, 0.15, 2.2]` |
| Badge | `🧑 Junior Ben` |

### Ton & Davranış
- **Meraklı, açık fikirli** — fikirleri soru sormadan kabul eder
- Rapor okurken **hızlı ve heyecanlı** tempo
- Hataları "öğrenme fırsatı" olarak çerçeveler
- Sessizlikte hafif gülümseme morph target aktif
- Lipsync viseme geçişleri: daha geniş, dramatik

### Kullanım Senaryosu
Ana menüden "Ses & Avatar" ekranına girildiğinde varsayılan persona.
Yeni fikir analizi veya ilk cycle'larda önerilir.

---

## Persona 2 — 👔 Senior Ben

| Özellik | Değer |
|---|---|
| `persona` değeri | `senior` |
| GLB | `assets/avatar.glb` (aynı dosya, farklı config) |
| Avatar ölçeği | `[1.05, 1.05, 1.05]` |
| Kamera pozisyonu | `[0, 0.15, 2.2]` |
| Badge | `👔 Senior Ben` |

### Ton & Davranış
- **Analitik, ölçülü** — önce soruyu sorgular, sonra cevaplar
- Rapor okurken **yavaş ve vurgulu** tempo
- Hataları "sistem açığı" olarak çerçeveler
- Sessizlikte nötr, ciddi yüz ifadesi
- Lipsync viseme geçişleri: daha küçük, kontrollü

### Kullanım Senaryosu
`failCount >= 2` durumunda (STUCK tespiti) otomatik önerilir.
Expert Bridge açılmadan önce Senior Ben devreye girer.

---

## Teknik Uygulama

```jsx
// AvatarWebView.jsx — persona geçişi
webViewRef.current.postMessage(
  JSON.stringify({ type: 'PERSONA', persona: 'senior' })
);

// avatar-web/index.html — badge güncelleme
badge.textContent = persona === 'senior' ? '👔 Senior Ben' : '🧑 Junior Ben';
```

### WebView → RN Köprüsü
```
RN (postMessage) ──→ WebView (window.addEventListener 'message')
     { type: 'RMS', value: 0.3 }       → lipsync
     { type: 'PERSONA', persona: '...' } → badge + stil
     { type: 'AVATAR_URI', uri: '...' }  → GLB yükle
```

---

## Geçiş Animasyonu
Persona değiştiğinde WebView kısa fade-out/fade-in yapar (`opacity` CSS transition 0.3s).
Morph target'lar sıfırlanır, yeni persona konfigürasyonu uygulanır.

---

## Gelecek İyileştirmeler
- [ ] Persona bazlı farklı .glb dosyası (kıyafet değişikliği)
- [ ] TTS entegrasyonu: her persona farklı ses tonu
- [ ] Emotion detection: ses tonu → morph target (mutlu/ciddi/endişeli)
