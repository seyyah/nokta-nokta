# BRIDGE.md

## Uzman Köprüsü — Görüşme Kayıtları

> Bu dosya `ExpertBridge.jsx` tarafından otomatik doldurulur.
> Her `onBridgeEnd` callback'i yeni bir bölüm ekler.
> Demo videosunda en az 1 görüşme kaydı bulunmalıdır (≥60sn).

---

## Görüşme #1

- **Tarih:** [Otomatik doldurulur]
- **Oda:** nokta-211118085-[SUFFIX]
- **Süre:** [Otomatik]
- **Tetikleyici:** 2x FAIL/ROLLBACK — Forge Cycle #[N]
- **Uzman:** [Sınıf arkadaşının adı]

### Problem Tanımı (STUCK durumu)
> Hangi cycle'da ne tıkandı, agent ne yapmaya çalıştı?

Örnek: "Groq API rate limit'e çarptı, 3. departman analizi 2 kez ardışık hata verdi.
Agent retry yapmak yerine sentezi boş veri ile tamamlamaya çalıştı."

### Ekran Paylaşımı İçeriği
- [ ] Terminal / log çıktısı gösterildi
- [ ] Uygulama akışı canlı demo edildi
- [ ] Hata mesajları paylaşıldı

### Uzmanın Önerileri
1. [Öneri 1]
2. [Öneri 2]
3. [Öneri 3]

### Alınan Kararlar
- [ ] Groq API için exponential backoff ekle
- [ ] Hata durumunda partial result kaydet
- [ ] Timeout değerini 10s → 20s artır

### Sonraki Cycle'a Context
```
Önceki cycle'da yaşanan sorun: [özet]
Uzman önerisi: [kısa not]
Denenmesi gereken çözüm: [somut adım]
```

---

## Görüşme #2

*(Bir sonraki STUCK durumunda otomatik eklenir)*

---

## Görüşme #3

*(Bir sonraki STUCK durumunda otomatik eklenir)*

---

## Özet İstatistikler

| Metrik | Değer |
|---|---|
| Toplam görüşme | 0 |
| Toplam süre | 0 dk |
| Çözülen problem | 0 |
| Çözülemeyen problem | 0 |
| Ortalama görüşme süresi | — |
