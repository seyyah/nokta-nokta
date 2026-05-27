# BRIDGE.md — Phase C Expert Call Log

> Forge cycle'da STUCK durumuna girildiğinde uzmana (sınıf arkadaşı) Jitsi ile bağlanma kaydı.

---

## Görüşme #1 — Lipsync Jitter Sorunu

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-27 |
| **Süre** | ~3 dk |
| **Platform** | Jitsi Meet (meet.jit.si) |
| **Katılımcılar** | Aleyna (231118098) + sınıf arkadaşı |
| **Tetikleyen Cycle** | Cycle #7 — Asymmetric Lerp ROLLBACK |
| **Paylaşım** | Ekran paylaşımı + kamera + mikrofon |

### Bağlam

Cycle #7'de avatar lipsync lag'ını asymmetric lerp ile çözmeye çalıştım. Ağız açılması 0.8, kapanması 0.3 factor ile yapıldı. Sonuç: düşük amplitude konuşmada jitter — ağız sürekli titriyordu. ROLLBACK yaptım ama alternatif konusunda takıldım.

### Görüşme Özeti

1. **Ekran paylaşımıyla sorunu gösterdim:** MirrorScreen'de normal konuşurken avatarın ağzının titrediğini canlı gösterdim
2. **Arkadaşın gözlemi:** "Gürültüde amplitude 0.01-0.05 arası sallanıyor, 0.8 factor ile bu çok abartılı hareket oluyor"
3. **Önerisi:** "Neden karmaşık yapıyorsun? Sadece factor'ü 0.6-0.7 yap, symmetric kalsın. Basit çözüm yeterli"
4. **Ek fikir:** "Bir de dead zone ekleyebilirsin — amplitude 0.05 altıysa sıfır say, gürültüyü kes"

### Çıkarım

- Basit factor bump (0.4 → 0.65) yeterli oldu (Cycle #8'de COMMIT)
- Dead zone fikri güzel ama Track A sadelik çizgisinde kalmak için şimdilik eklenmedi — gelecek iterasyon adayı
- **İnsan perspektifi farkı:** Ben "daha akıllı algoritma" düşünüyordum, arkadaş "daha basit parametre" dedi — doğru çıktı

### Sonraki Cycle'a Etkisi

Cycle #8'de symmetric lerp 0.65 ile devam edildi → COMMIT. Görüşme doğrudan sonucu etkiledi.

---

**231118098** · Phase C — Köprü · Track A
