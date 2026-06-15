# Demo Video Shot List — Hafta 3 (~3 dk)

**Hedef:** Phase A + B + C tek videoda. Toplam ~3:00. Web'den ekran kaydı (OBS / Loom / Windows Game Bar Win+G).

> **Setup öncesi kontrol:**
> - `npx expo start --web` çalışıyor mu, http://localhost:8081 açık mı
> - Browser'da hard refresh (Ctrl+Shift+R) yapılmış mı, son bundle yüklü mü
> - `app/.env`'de geçerli Gemini key var mı (transcription için)
> - `avatar.glb` `assets/`'a kondu + `avatarSource.js` uncomment edildi mi (yoksa proxy head görünür — kabul edilirse OK ama brief "kendi yüzün" istiyor)
> - Headset / mic test edildi, ortam sessiz
> - Sınıf arkadaşı Phase C için online, link beklemede
> - Screen resolution 1920x1080 (mobile-frame görünüm için browser DevTools "Toggle device toolbar" Pixel 6 / iPhone 14 simülasyonu kullan)

---

## 00:00 – 00:15 · Intro (15 sn)
- **Kamera:** Tam ekran browser, http://localhost:8081 ana ekran (Hafta 2 home, boş state — "Void / Feed your notes")
- **Ses (sen):** "Nokta Cleaner — müşterinin geliştirici olduğu kapalı döngü. Hafta 3'te üç katman: voice + avatar lipsync, sesli dikte ile audit raporları, ve takıldığında uzmana görüntülü köprü."
- **Görsel ipucu:** Header'da VOICE · EXPERT butonları görünür; sağ-altta ◉ FAB. Üç butonu kısa fare hover ile işaret et.

---

## 00:15 – 01:00 · Phase A — Voice + Avatar (45 sn)
- **00:15** — VOICE butonuna tıkla → Voice ekranı açılır.
- **00:20** — Proxy head (veya `.glb` eklenmiş ise gerçek avatar) sahnesi, altında sönük bar viz, en altta büyük record butonu.
- **00:25** — Record butonuna bas, mic permission "Allow".
- **00:28 – 00:50** — Konuş (~22 sn). Sözler dikte değil — sesin doğal hareketi gösterilsin. Önerilen cümle:
  > _"Phase A: mic input gerçek zamanlı FFT analiz ediyor, 16-band aynalı bar viz spektrumu çiziyor, ve avatarın ağzı amplitude'a göre — düşük frekans O, yüksek frekans I, mid AA — viseme blend yapıyor. Toplam reaksiyon süresi yaklaşık yetmiş milisaniye."_
- **00:50** — Stop. Bar'lar 260ms'de sönsün, avatar ağzı kapansın.
- **00:55** — ← Back ile ana ekrana dön.
- **00:58** — Ana ekrandayken Hafta 2 input akışı görünmeli (kanıt: Hafta 3 katmanı Hafta 2'yi bozmamış).

**Yakalama önerileri:**
- Voice ekranındayken **konsolu kapalı tut** (F12 kapat) — temiz görüntü.
- Konuşurken yüzünü kamerada gösterirsen (PIP) jüri için lipsync senkronu daha net.

---

## 01:00 – 02:00 · Phase B — Voice dictation + audit report (60 sn)
- **01:00** — Sağ-altta ◉ FAB'a bas → AuditWidget modal açılır.
- **01:05** — Title yaz: ör. _"Voice screen back button çok küçük"_ (klavyede live yazıldığı görünsün).
- **01:12** — "What the customer sees" yanındaki **Record** butonuna bas → konuş.
  > _"Voice ekranındaki back butonu çok küçük ve sağ üst köşede, parmakla ulaşmak zor. Tipografya zayıf, sadece on bir punto. Touch target en az kırk dört px olmalı."_  (~12 sn)
- **01:25** — Stop. "Transcribing via Gemini..." spinner görünsün (~2-3 sn). Transcript text-area'ya düşmeli.
- **01:30** — Severity'yi **high** seç (chip görünür değişsin).
- **01:35** — "▸ Show markdown preview" toggle → formatted markdown görünür.
- **01:45** — **⬇ Download .md** butonuna bas → tarayıcı dosya indirir (Downloads klasörüne görünmeli).
- **01:50** — Modal'ı kapat → ana ekrana dön.
- **01:55** — File explorer'ı kısa göster (Downloads'ta `audit-NN-...md` dosyası varlığı kanıt).

**Yakalama önerileri:**
- Transcript Gemini'den geri dönerken spinner 1-3 sn — bunu kesme, jüri "gerçek STT çalışıyor" diye anlasın.
- Markdown preview'ı tam göster, scroll ile sees / wants / form alanlarını gez.

---

## 02:00 – 02:45 · Phase C — Expert Bridge (45 sn — call'un kendisi de buna dahil)
- **02:00** — Header'da **EXPERT** butonuna bas → ExpertBridge modal açılır.
- **02:05** — "Why are you stuck?" alanına yaz (live):
  > _"Cycle dört — viseme blend ağırlıkları doğru ama dudak çok dar, AA shape görünmüyor."_
- **02:15** — **📞 Open call** butonuna bas → yeni tab'da Jitsi Meet odası açılır.
- **02:18** — Jitsi'ye joinle, kamera + mic + ekran paylaşımı izinleri "Allow".
- **02:25** — Sınıf arkadaşın da odaya girer (önceden link gönderilmiş olmalı).
- **02:25 – 02:40** — Sen ekranı paylaş (Jitsi → "Start screen share" → "Entire screen" veya VS Code window). Konuşma:
  > _Sen: "Şuradaki AvatarScene'de viseme blend'e bakar mısın?"_
  > _Arkadaşın: "Burada amplitude'u 0.9 ile çarpıyorsun ama AA shape için 1.2 olmalı."_
  >
  > (Konuşma natural — gerçek "code review" gibi görünsün, scripted ama doğal.)
- **02:40** — Jitsi tab'ından çık, AuditWidget'a dön.
- **02:42** — Post-call notes alanına kısa yaz: _"AA viseme weight 1.2'ye çek"_
- **02:43** — **Copy BRIDGE.md block** → alert görünür.

**Yakalama önerileri:**
- Call sırasında EN AZ 60 sn ekran-paylaşımlı görünmeli — brief şartı. Sınıf arkadaşının yüzü PIP'te olmalı.
- Mic kaliten iyiyse Jitsi audio'su yeterince temiz.
- Jitsi tab'ında "You are sharing your screen" badge'i jüri için kanıt.

---

## 02:45 – 03:00 · Outro (15 sn)
- **02:45** — Bir text editor'ı aç, az önce indirilen `.md` dosyasını + `BRIDGE.md`'yi göster.
- **02:55** — Ses (sen): _"Dikte rapor + forge cycle + stuck call → BRIDGE.md → sonraki cycle context. Üç katman tek loop. Bitti."_
- **03:00** — Fade out / cut.

---

## Çekim sonrası kontrol

- [ ] Video toplam ~3:00 (±10 sn)
- [ ] Phase A: avatar + lipsync görünür, sen konuşurken ağız hareketi senkron
- [ ] Phase B: dikte → transcript → markdown preview → file download üçü kesilmeden geçti
- [ ] Phase C: gerçek call, ekran paylaşımı, ≥60 sn, sınıf arkadaşı görünür
- [ ] Ses temiz, mic clipping yok
- [ ] 1920x1080 export
- [ ] Sıkıştırılmış final mp4 < 50 MB ideal (submission size)
- [ ] Repo'ya `demo-3min.mp4` veya YouTube/Drive private link → README'ye gömüldü

---

## Hızlı troubleshoot (çekim sırasında çıkabilecek sorunlar)

| Sorun | Hızlı fix |
|---|---|
| Mic permission soruyor ama "Block" gelmiş | Browser site settings (Chrome: lock icon → Permissions) → Microphone Allow → refresh |
| Voice screen avatar görünmez (canvas blank) | Console'da r3f hatası kontrol, refresh; veya `expo start --web --clear` ile rebundle |
| Gemini "API key invalid" | `.env`'i kontrol et, `EXPO_PUBLIC_GEMINI_API_KEY=` doğru mu; dev server restart gerek |
| Jitsi tab açılmıyor (pop-up blocker) | Browser address bar pop-up icon → "Always allow from localhost" |
| Bar viz tutuk / kasıyor | Konsol kapalı tut, başka tab arkaplanda fizik / video oynatma kapat |
