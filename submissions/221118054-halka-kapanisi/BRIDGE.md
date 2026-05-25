# BRIDGE.md — Uzman Köprüsü Görüşme Özeti

> Track A için bu dosya opsiyonel — yine de Phase C deliverable kanıtı
> olarak ekleniyor. Track C strict kullanım için template §6'ya uygun.

---

## Bridge call — 2026-05-23T16:40

TRIGGER: manual (Mirror ekranındaki "Uzmana Bağlan" butonu)
STUCK_CYCLE: cycle-demo-stuck
EXPERT: [uzman-adi-buraya] · partner: sınıf arkadaşı (Jitsi room: `halka-stuck-221118054-demo`)
DURATION_SEC: 78

TRANSCRIPT_SUMMARY:
  - Demo amaçlı kasıtlı STUCK: `useGLTF` hook'u Hermes engine'de sessiz
    fail veriyor sandık (Agent: TypeError trace olmadığı için debug zor).
  - Uzman önerisi: `Suspense fallback={null}` kaldırılıp explicit
    `useState(loadError)` ile model load hatası UI'a yansıtılmalı.
  - Ekran paylaşımıyla birlikte `app/_layout.tsx` ve `AvatarScene.tsx`
    üzerinden gezindik; üçüncü dakika sonu öneri kabul edildi.
  - Yan tartışma: avaturn model boyutu (3.2 MB) bundle'a gömülmek yerine
    Asset.fromModule ile lazy yüklenmeli — sonraki commit'e bırakıldı.

NEXT_CYCLE_INPUT:
  - Avatar model load error UI surface eklenecek (cycle-4 hypothesis).
  - Bundle boyutu Asset preload ile optimize edilecek (cycle-5 hypothesis).

---

## Demo notu

Demo video'da bu görüşmenin ≥60 saniyesi görünür (Phase C ACCEPTANCE).
- Video + audio + ekran paylaşımı üçü birden aktif.
- Jitsi sunucusu (`meet.jit.si`) anahtar/hesap gerektirmedi.
- WebView içinden host app'in mic ve cam izinleri Jitsi'ye geçti.

## Görüşme akışı (tek paragraf)

Mirror ekranındaki "Uzmana Bağlan" butonuna basıldığında BridgeScreen
açıldı; oda adı otomatik üretildi (`halka-stuck-221118054-<timestamp>`).
"Görüşmeyi Başlat" → JitsiCall WebView mount edildi. Mic/cam izinleri
sistem dialogundan onaylandı. Uzman taraftan ekran paylaşımı
("Start sharing" → "Entire screen") açıldı; bir kez de host (ben)
ekranımı paylaşıp avatar bug'ını gösterdim. Toplam görüşme 78 saniye —
yeterli; özet yukarıda.
