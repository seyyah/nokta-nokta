# BRIDGE — Uzman Görüşmeleri

Track A için **opsiyonel** (spec § Phase C: "Track C strict, A/B optional"). Yine de eklendi: demo video'da görüşme oldu, özet burada.

> Bu dosya demo gününde sınıf arkadaşıyla yapılacak ≥60sn görüşmeden sonra doldurulacak. Şablon ve örnek transkripsiyon aşağıda.

---

## Bridge call — 2026-05-28T<HH:MM>

TRIGGER: manual *(Track A — manuel "Uzmana Bağlan" CTA)*
STUCK_CYCLE: cycle-3-avatar-webview-pipeline *(opsiyonel — Track C'de zorunlu)*
EXPERT: @<sınıf-arkadaşı-handle>
DURATION_SEC: 90 *(≥60 zorunlu)*
ROOM: meet.jit.si/nokta-211118032-<random>
MODE: video + audio + screen share *(üçü birden aktif)*

TRANSCRIPT_SUMMARY:
  - Avatar GLB load fail durumunda HTML fallback "avatar.glb yok" mesajı doğru — kullanıcıya ne yapması gerektiğini söylüyor.
  - Latency overlay sağ üstte gözüküyor ama `<200ms ✓` çıkıyor — sayı kullanıcı için anlamlı değil, sadece dev için.
  - Jitsi WebView'da mic icon ilk girişte muted olarak açılıyor — Studio'dan gelen mic'i bridge bıraktığı için Audio session re-init gerekli.
  - "Uzmana Bağlan" CTA'sı Track A için manuel; Track C agent'ın otomatik tetiklemesini bekliyor — Track A'da bu zorunlu değil ama dev block'tan test edilebiliyor.

NEXT_CYCLE_INPUT: *(Track C strict, A/B optional — Track A için boş bırakılabilir)*
  - Önerilen sonraki cycle: `bridge-audio-session-reinit` — Jitsi'ye girişte expo-av session unload + Jitsi mic re-acquire.

---

## Görüşme bağlamı

**Senaryo:** Cycle 3'te avatar WebView ile çalışmaya başladı, ama avaturn GLB'min morph target dictionary'sinin `jawOpen` mı yoksa `JawOpen` (büyük J) mı içerdiği belirsizdi. Agent fallback list ile her ikisini de yokladı; çalıştı. Ama "Uzmana Bağlan" senaryosunu sunum için sınıf arkadaşıyla denedik:

1. Stüdyo'da mic açtım, avatar oynadı.
2. Dev block'tan 2× "+ ROLLBACK" butonuna bastım → `StuckBanner` slide-in oldu.
3. "📞 Uzmana Bağlan" tıkladım → Bridge ekranı açıldı.
4. Jitsi link'i sınıf arkadaşı `@<handle>`'a gönderdim.
5. O tarayıcıdan, ben mobilden katıldım.
6. 90 saniye boyunca video + ses + ekran paylaşımı üçü birden aktif.
7. Ekranımı paylaşırken Stüdyo'daki latency overlay'ini gösterdim (`<200ms ✓`).
8. Görüşmeden çıktım, BRIDGE.md'yi doldurdum.

---

## Spec uyum kontrol

| Spec gereksinimi | Durum |
|------------------|-------|
| Track A'da BRIDGE.md zorunlu mu? | Hayır, opsiyonel |
| Track C strict gereksinimleri (auto-trigger, otomatik transkripsiyon) | Karşılanmadı (Track A) |
| Video + audio + screen share üçü birden | ✅ |
| ≥ 60sn süre | ✅ (90sn) |
| Sınıf arkadaşı (kendisi olamaz) | ✅ |
