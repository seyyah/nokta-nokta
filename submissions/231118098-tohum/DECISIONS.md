# DECISIONS.md — AI-DLC Harness Engineering Log

> Bu dosya AWS AI-DLC (AI-Driven Development Life Cycle) çerçevesindeki **Visioner Harness Engineer** rolü altında alınan kararları belgeler. Her karar, hocanın paylaştığı 6 alt rolden hangisine denk geldiğini açık eder.

**Hoca referansı:**
- [AWS AI-DLC blog](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/)
- [awslabs/aidlc-workflows](https://github.com/awslabs/aidlc-workflows)
- SDLC vs AI-DLC görseli — Nurettin Senyer (21 May)

---

## Rol Haritası

AI-DLC'de insan artık "kod yazan" değil **orkestratör**. 6 alt rolün her birine bu hafta düşen kararlar:

### 🎯 Visioner — Net hedef koyar, problemi tanımlar, değeri tanımlar

| Karar | Tarih | Gerekçe |
|---|---|---|
| Track A — Sadakat seçimi | 2026-05-27 | 3 track içinde **Phase A (30 puan)** içeriğini doğrudan derinleştiren tek track. Track B (2 avatar) ve Track C (auto-trigger) ek karmaşıklık getirip Phase A'yı sade bırakıyor. Sınıfta 5+ kişi Track A'da — baseline karşılaştırma için avantaj. |
| "Sade ama kusursuz" çizgisi | 2026-05-27 | Tek `Mirror` ekranı + tek `Bridge` ekranı. 4 yeni ekran açıp scope'u şişirmek yerine 2 ekrana hapsedip kalite artırmak. |
| Önceki tohum app'inin üstüne devam | 2026-05-27 | Hocanın spec'i: *"submissions/<no>-<slug>/app/ klasörünü (önceki haftadan devam) genişlet."* Sıfırdan başlamak hem zaman israfı hem de anti-slop riski (yeni baseline cosine'ı bozar). |

### 🛠️ Harness Engineer — Doğru AI araçlarını, modelleri ve veriyi seçer

| Karar | Tarih | Gerekçe |
|---|---|---|
| Claude Opus 4.7 (1M context) via Claude Code | 2026-05-27 | Tohum projesinin Hafta 1-2 boyunca tek coding agent'ı; context devamlılığı + auto-memory ile geçmiş kararları hatırlıyor. |
| Jitsi Meet (Daily.co/LiveKit yerine) | 2026-05-27 | Jitsi açık kaynak, oda oluşturma için **hesap gerekmiyor** — sınıf arkadaşı sadece linke tıklıyor. Daily.co API key + LiveKit self-host overhead'i Track A sadelik çizgisini bozar. |
| `react-three-fiber` + viseme pipeline | 2026-05-27 | Spec'in açık referansı (wass08/r3f-lipsync-tutorial). Three.js'in React idiomatic kullanımı, raw WebGL'den daha sürdürülebilir. |
| `expo-speech-recognition` (cloud STT yerine) | 2026-05-27 | On-device çalışır, ağ gecikmesi yok, gizlilik (Guardian rolü çakışır). Whisper API alternatifiydi ama latency + maliyet + key yönetimi getirir. |

### 🛡️ Guardian — Etik, güvenlik, gizlilik, uyum

| Karar | Tarih | Gerekçe |
|---|---|---|
| `avatar.glb` kendi yüzüm | 2026-05-27 | Spec açık: *"generic head model kabul edilmez."* + Guardian: başka birinin yüzünü kullanmak etik ihlal. avaturn.me yüz tanıma akışı kullanıldı. |
| Mock data sadece audit screenshot'larda | 2026-05-27 | Spec: *"No real user data in audit report screenshots."* Test fikirleri jenerik ("Test Idea 1", "Bisiklet uygulaması" vb.), gerçek kişi/firma yok. |
| STT on-device | 2026-05-27 | Sesli dikteyi cloud'a göndermemek = veri minimizasyonu. |
| Anti-slop cosine kontrolü | 2026-05-27 | Hafta 2 ile cosine < 0.80 hedefi; yeni `Mirror`/`Bridge`/`useVoiceMeter` dosyaları zaten farklı domain → gate aşılması beklenmiyor. |

### 🧠 Critical Thinker — AI çıktısını sorgular, doğrular, karar verir

> **Memory referansı:** [feedback_coding_agent_critical_review](Aleyna'nın kalıcı feedback'i) — Claude'un çözümlerini körü körüne kabul etmemek.

| Karar | Tarih | Gerekçe |
|---|---|---|
| (örnek, hafta 2'den) Cycle #4 SecureStore reddi | 2026-05-20 | Claude AsyncStorage→SecureStore migration önerdi. Test edildi, **2KB limit** sorunu çıktı. ROLLBACK + asıl sorun (state management) tespit edildi. → Cycle #5 `useFocusEffect` ile çözüldü. |
| (gelecek, hafta 3) Phase A iskelet review | TBD | Voice viz + avatar bileşenleri eklenince her commit öncesi: gerçekten <200ms latency tutuyor mu? Görsel olarak ikna edici mi? |

### 🔗 System Thinker — Büyük resmi görür, parçaları uyumlu hale getirir

| Karar | Tarih | Gerekçe |
|---|---|---|
| Voice viz → audit report → forge cycle → bridge zincirinin tek demo'da gösterilmesi | 2026-05-27 | Demo video 3 dk, Phase A+B+C tek video. Sahne sırası: (1) Mirror'da konuş → bar+lipsync, (2) AuditWidget aç → sesli dikte → markdown rapor, (3) Claude Code'a feed → cycle koş, (4) ROLLBACK simüle et → Bridge butonu → Jitsi → sınıf arkadaşı. |
| 4 eski + 2 yeni ekran toplam 6 ekran | 2026-05-27 | Spec "3-5 ekran" diyor ama eski 4 ekran + Mirror + Bridge = 6 → spec'in **üstünde**. Phase A/B/C için ayrı ekran organizasyonu zorunlu, monolitik App.tsx anti-pattern. |

### 📚 Teacher & Feedback Loop — AI'ya geri bildirim verir, sistemi sürekli iyileştirir

| Karar | Tarih | Gerekçe |
|---|---|---|
| Bridge call sonrası uzman özetinin sonraki cycle'a feed edilmesi | TBD | Spec Track C'de "strict" istiyor; biz Track A'da serbest format ama yine de yapacağız → çılgınlık bonusu için. BRIDGE.md → bir sonraki FORGE cycle'ın INPUT alanına geçer. |
| FORGE.md'de ROLLBACK'lerin gerekçesi her zaman | sürekli | Sadece COMMIT'leri loglamak ratchet disiplinini bozar. Hafta 2'deki Cycle #4 (SecureStore) ROLLBACK'i bu felsefenin örneği. |

---

## Karar Süreci (AI-DLC Plan-Clarify-Implement)

Her büyük karar şu döngüden geçti:

1. **PLAN** — Claude öneri sunar (örn: "Mirror ekranını şöyle yapayım")
2. **CLARIFY** — Aleyna sorguya tabi tutar / netleştirme ister / red eder
3. **IMPLEMENT** — Onaylanan plan koda dökülür

Bu çerçeve hocanın paylaştığı görseldeki "**İnsan yön verir (Direction) → AI ölçeklendirir (Scale) → İnsan sorumluluk alır (Accountability)**" akışıyla birebir.

---

## Hafta 2'den Devam Eden Kararlar

(Önceki haftanın decision log'u korunuyor, sadece Hafta 3'e taşıyan kararlar yeniden tartışılır)

| Karar | Hafta | Durum |
|---|---|---|
| 4 ekran (Home/AddIdea/IdeaDetail/Profile) | 2 | ✅ Devam |
| AsyncStorage (SecureStore yerine) | 2, cycle #4 | ✅ Devam (rollback dersi) |
| Dark theme palette | 2 | ✅ Devam |
| `@xtatistix/mobile-audit` widget | 2 | ✅ Devam, Phase B'de daha aktif kullanım |
| Bottom tabs navigation | 2 | ⚠️ Mirror + Bridge eklenince yeniden değerlendirilecek (5+ tab UX'i bozar) |

---

**231118098** · 2026-05-27 · Halka Kapanışı Decision Log
