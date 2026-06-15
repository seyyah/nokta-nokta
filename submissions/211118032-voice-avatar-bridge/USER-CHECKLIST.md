# YAPMAN GEREKENLER — Final Hafta Teslimi

**Hedef repo:** [`seyyah/nokta-nokta`](https://github.com/seyyah/nokta-nokta)
**GitHub user:** `beyzaguldemir`
**Student ID:** `211118032`
**Slug:** `voice-avatar-bridge`
**Track:** A

---

## Sırayla yapılacaklar

### 1. avaturn.me'den kendi avatar'ını export et

> 🔴 **Spec'in en katı kuralı:** "Avatar SEN olacaksın — generic head model kabul edilmez."

1. [avaturn.me](https://avaturn.me) → hesap aç (Google ile gir)
2. **Create Avatar** → kendi yüzünden 1-3 selfie yükle veya kameradan çek
3. Avatar oluştuktan sonra **Export → GLB** seç (FBX değil!)
4. İndirdiğin dosyayı buraya kopyala (eski placeholder'ı **ezerek**):
   ```
   submissions/211118032-voice-avatar-bridge/app/assets/avatar.glb
   ```
5. Boyut kontrolü: 5-15 MB normal. >50 MB ise quality preset'i düşür (avaturn'de slider var).

> 💡 Not: avaturn export'u ARKit blendshape standardı kullanıyor. `avatar-scene.html` zaten `jawOpen`, `mouthFunnel`, `eyeBlinkLeft/Right` morph target adlarını dinliyor — extra ayar gerekmiyor.

---

### 2. Lokal test (mecbur değil, ama önerilen)

```powershell
cd "C:\Users\ASUS\OneDrive - samsun.edu.tr\Masaüstü\nokta-support\submissions\211118032-voice-avatar-bridge\app"
npm install
npx expo start --tunnel
```

- Telefonunda **Expo Go** açık → QR'ı taratıyorsun
- Studio sekmesine git → mic aç → barlar zıplamalı, avatar lipsync oynamalı

> ⚠️ **Expo Go'da mikrofon ve avatar limitli çalışabilir.** Full test için EAS dev build veya preview build gerekir (Adım 6).

---

### 3. 3 sesli audit raporu (opsiyonel ama önerilen)

`audit-reports/` klasöründe 3 rapor zaten hazır (agent yazdı). İstersen kendi sesinle de **ekle**:

1. App'i çalıştır
2. Studio ekranında bir bug bul (örn: avatar yüklenmedi, mic geç açıldı)
3. Sağ alt köşedeki 🐛 FAB'a bas (AuditWidget)
4. Ekran görüntüsü al → not yaz → markdown export
5. Export dosyasını `audit-reports/` altına koy
6. Konuştuğun transcript'i raporun başına "Konuştuğum:" bloğu olarak yapıştır

**Spec:** "Manuel typing kabul, ama dikte bonusludur" — sesli versiyonun puan ekler ama yoksa da olur.

---

### 4. Sınıf arkadaşıyla Jitsi demo (Phase C → ≥60 sn)

> 🔴 **Spec:** "uzman kendisi olamaz" — kendin çıkamazsın, başka bir kişi olmalı.

1. Sınıf arkadaşına haber ver, müsait olduğu 10 dakikalık slot bulun
2. App'i aç → "Uzmana Bağlan" → "Görüşmeye Katıl"
3. Çıkan Jitsi URL'sini WhatsApp / Discord / SMS ile gönder
4. O bilgisayardan tarayıcıyla katılsın
5. **Üçü birden açık olmalı:**
   - 📹 Video (yüzler görünür)
   - 🎤 Audio (konuşuyorsunuz)
   - 🖥️ Ekran paylaşımı (sen mobil ekranını paylaş veya o)
6. **≥ 60 saniye** kayıtta tut
7. Görüşmeyi ekran kaydı yap (telefon ekran kaydı veya Jitsi recording)

> 💡 Ekran paylaşımı için: Jitsi WebView'da düğme var, ama mobilde RN WebView screen share kısıtlı olabilir. Plan B: bilgisayardan ikinci sekme aç, mobilden de katıl, **bilgisayardan ekran paylaş.**

Görüşmeden sonra `BRIDGE.md`'yi doldur (opsiyonel — Track A için zorunlu değil ama varsa +).

---

### 5. Demo video çek (≤3 dk, Phase A + B + C)

Sıralı segmentler:

| Segment | Süre | Ne göster |
|---------|------|-----------|
| **Intro** | 0:00–0:10 | "Beyza Gül Demir, 211118032, Track A, Final hafta" |
| **Phase A** | 0:10–0:55 | Studio'da mic aç, barlar zıplasın, avatarın dudak senkronu (kendi sesin) |
| **Phase B** | 0:55–1:50 | AuditWidget ile 1 rapor üretme + FORGE.md ekranını göster + cycle özetini anlat |
| **Phase C** | 1:50–2:50 | "Uzmana Bağlan" → Jitsi açılışı → sınıf arkadaşıyla ≥60sn ekran paylaşımlı |

**Çekim ipuçları:**
- Telefon ekran kaydı + ön kamera mic ile sesin alınması yeterli
- Sessizlik anlarında "şimdi mikrofonu açıyorum / ROLLBACK simüle ediyorum" gibi açıklayıcı konuş
- Video YouTube'a yükle (Unlisted da olur), link'i README'ye ekle

---

### 6. EAS APK build

```powershell
cd "C:\Users\ASUS\OneDrive - samsun.edu.tr\Masaüstü\nokta-support\submissions\211118032-voice-avatar-bridge\app"

# Eğer eas hesabın yoksa
npx eas-cli login

# Preview build (zorunlu)
npx eas build --platform android --profile preview
```

Build bittikten sonra (~30-90 dk, EAS kuyruğuna bağlı):

1. EAS dashboard'dan APK'yı indir
2. Submission köküne koy:
   ```
   submissions/211118032-voice-avatar-bridge/app-release.apk
   ```

> ⚠️ **Spec:** APK yoksa **−5 puan**. Varsa 0. Yani build kayıp olursa direkt 5 puan kaybedersin.

---

### 7. README'yi son haline getir

`submissions/211118032-voice-avatar-bridge/README.md`'de şu yerleri **doldur:**

```markdown
📺 **YouTube link:** _<demo videosu yüklenecek — PR açılmadan önce buraya gelecek>_
```
→ Adım 5'teki YouTube linkini yapıştır.

```markdown
**Expo QR (development):** `npx expo start` çıktısındaki QR `submission-day.png`'de.
```
→ İstersen Expo start'ı çalıştır, QR'ın ekran görüntüsünü `submission-day.png` olarak submission köküne koy.

---

### 8. `seyyah/nokta-nokta`'yı fork et + clone

GitHub'da:

1. https://github.com/seyyah/nokta-nokta → sağ üstte **Fork** → kendi hesabına (`beyzaguldemir`)
2. Lokalde yeni klasör aç (mevcut workspace'in DIŞINDA):

```powershell
cd "C:\Users\ASUS\OneDrive - samsun.edu.tr\Masaüstü"
git clone https://github.com/beyzaguldemir/nokta-nokta.git
cd nokta-nokta
git checkout -b submission/211118032-voice-avatar-bridge
```

---

### 9. Submission klasörünü yeni repo'ya kopyala

```powershell
# nokta-nokta klasöründesin
mkdir -Force submissions\211118032-voice-avatar-bridge

# Kaynaktan kopyala (node_modules HARİÇ)
robocopy `
  "C:\Users\ASUS\OneDrive - samsun.edu.tr\Masaüstü\nokta-support\submissions\211118032-voice-avatar-bridge" `
  "submissions\211118032-voice-avatar-bridge" `
  /E /XD node_modules .expo /XF package-lock.json
```

Bu komut: `node_modules`, `.expo` ve `package-lock.json` hariç tüm dosyaları kopyalar (bunlar `npm install` ile yeniden üretilecek).

> ⚠️ **APK ve avatar.glb dahil edildiğinden emin ol:** `dir submissions\211118032-voice-avatar-bridge\app-release.apk` ve `dir submissions\211118032-voice-avatar-bridge\app\assets\avatar.glb`

---

### 10. Commit + push + PR

```powershell
# nokta-nokta klasöründesin
git add submissions/211118032-voice-avatar-bridge/
git status   # kontrol: sadece submission klasörü olmalı
git commit -m "submission: 211118032 voice-avatar-bridge (Track A)"
git push -u origin submission/211118032-voice-avatar-bridge
```

GitHub web UI'de:

1. Fork'unun sayfasına git
2. "Compare & pull request" yeşil butonu çıkar → tıkla
3. Title: `submission: 211118032 voice-avatar-bridge (Track A)`
4. Body (PR template otomatik gelir, doldur):
   ```markdown
   ## Submission
   - **Öğrenci no:** 211118032
   - **Slug:** voice-avatar-bridge
   - **Track:** A

   ## Checklist
   - [x] Yalnızca submissions/<no>-<slug>/ altında değişiklik yaptım
   - [x] README'de Expo QR link var
   - [x] README'de 60 sn demo video linki var
   - [x] app-release.apk klasörde mevcut
   - [x] README'de decision log yazdım (DECISIONS.md'ye link)
   - [x] Track seçimim README'de net

   ## AI Tool Log
   Cursor Agent (Claude Opus 4.7) — Phase A scaffold, Phase B/C kod, README/FORGE/DECISIONS dokümantasyonu.
   ```
5. **Create pull request**

---

## Final teslim öncesi son kontrol

Hepsini ✅ işaretleyebilmelisin PR açmadan önce:

- [ ] `app/assets/avatar.glb` → senin yüzün (placeholder değil)
- [ ] `app-release.apk` → submission köküne kondu
- [ ] Demo video çekildi + YouTube'a yüklendi + link README'de
- [ ] Sınıf arkadaşıyla ≥60sn ekran paylaşımlı görüşme videoya alındı
- [ ] README.md → ilk satır `Track: A`
- [ ] FORGE.md → ≥2 COMMIT + ≥1 ROLLBACK (zaten 3+1 hazır)
- [ ] audit-reports/ → 3 rapor (zaten hazır, istersen sesli üzerine ekle)
- [ ] DECISIONS.md → karar günlüğü var
- [ ] PR yalnızca `submissions/211118032-voice-avatar-bridge/` altını değiştiriyor

---

## Anti-slop uyarısı

> Spec § Rubric: "Anti-slop (cosine < 0.80, week-2 ile aynı checker) → gate; aşılırsa −35%"

README'yi başka öğrencinin teslimine **çok benzer yazma**. Sınıf duyurusundaki ödev metnini olduğu gibi yapıştırma. Her şey ya senin sesinden ya `DECISIONS.md` mantığında olmalı.

Hafta 2'de cosine 0.95 ile uyarı çıkmış başka öğrencilerde — aynı tuzağa düşme.

---

## Tahmini zaman

| İş | Süre |
|----|------|
| 1. avatar.glb export | 30 dk |
| 2. Lokal test | 30 dk |
| 4. Jitsi demo + ekran kaydı | 45 dk |
| 5. Demo video çekim + montaj | 60 dk |
| 5. YouTube upload | 10 dk |
| 6. EAS APK build | 60 dk (kuyruğa bağlı) |
| 7. README finalize | 10 dk |
| 8-10. Fork + clone + copy + PR | 20 dk |
| **Toplam** | **~4 saat** |

Tahmini bitiş: **bu gece 24:00'a kadar yetişir.** Demo ve EAS build paralel gidebilir (EAS kuyruğa girdikten sonra video çek).

---

## Sorun olursa

- `expo-av` uyumsuzluğu → DECISIONS.md D2'ye bak
- WebView'da avatar boş → DECISIONS.md D1 + `avatar-scene.html` log satırını kontrol et
- Jitsi mic muted → Bridge ekranına girince "Unmute" tıkla manuel
- EAS build fail → `eas.json` profile'ı `preview` olarak doğrula
- Anti-slop uyarısı → README'yi tekrar yaz, kendi cümlelerinle

---

**Başarılar! Halka kapanıyor — kendi yüzün konuşacak.**
