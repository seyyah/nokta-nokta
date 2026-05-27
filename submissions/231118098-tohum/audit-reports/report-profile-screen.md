# Audit Report — Profile Screen

**App:** NOKTA
**Screen:** Profile
**Reporter:** 231118098
**Date:** 2026-05-20
**Status:** Open → Fixed

---

## Issue #1: Data Persistence on Restart

**Severity:** High
**Category:** Data / Storage

### Description
Uygulama tamamen kapatılıp yeniden açıldığında kaydedilen fikirler görünmüyor. AsyncStorage'dan okuma yapılmıyor gibi görünüyor.

### Screenshot Region
[İstatistik kartları alanı işaretli - Toplam: 0 gösteriyor]

### Steps to Reproduce
1. 2-3 fikir ekle
2. Uygulamayı tamamen kapat (background'dan da çıkar)
3. Yeniden başlat
4. Home ekranı boş, Profile'da 0 fikir

### Expected Behavior
Eklenen fikirler kalıcı olmalı, restart sonrası görünmeli.

### Root Cause Analysis
İlk deneme: SecureStore migration → **ROLLBACK** (2KB limit)
Asıl sorun: useEffect sadece mount'ta çalışıyor, tab değişimlerinde çalışmıyor.

### Suggested Fix
useFocusEffect kullanarak her ekran focus'unda data reload:
```typescript
useFocusEffect(
  useCallback(() => {
    loadStats();
  }, [])
);
```

---

## Issue #2: Statistics Calculation

**Severity:** Low
**Category:** Logic / Display

### Description
Profil ekranındaki istatistikler navigation ile güncellenmiyor. Home'da fikir eklendikten sonra Profile'a gidince eski sayılar görünüyor.

### Screenshot Region
[4 stat kartı işaretli]

### Steps to Reproduce
1. Profile ekranına git, sayıları not al
2. Home'a dön, yeni fikir ekle
3. Profile'a geri dön
4. Sayılar değişmemiş

### Expected Behavior
Her ekran açılışında stats yeniden hesaplanmalı.

### Suggested Fix
Issue #1 ile aynı fix - useFocusEffect.

---

## Issue #3: Dangerous Button Placement

**Severity:** Medium
**Category:** User Experience / Safety

### Description
"Tüm Verileri Temizle" butonu sayfa sonunda ama yeterince dikkat çekici değil. Yanlışlıkla tıklanabilir.

### Screenshot Region
[Kırmızı buton alanı işaretli]

### Steps to Reproduce
1. Profile ekranında scroll yap
2. "Tüm Verileri Temizle" butonu görünür
3. Yanında uyarı yok

### Expected Behavior
- Confirmation dialog (MEVCUT ✓)
- Buton daha belirgin uyarı rengi
- Metin: "Bu işlem geri alınamaz" görünür

### Current Status
Confirmation dialog mevcut. Ek görsel uyarı v2'de düşünülecek.

---

## Summary

| Issue | Severity | Status |
|-------|----------|--------|
| Data Persistence on Restart | High | Fixed |
| Statistics Calculation | Low | Fixed |
| Dangerous Button Placement | Medium | Partial (dialog var) |

**Total Issues:** 3
**Fixed:** 2
**Partial:** 1

---

## Forge Cycle Notes

Bu rapordaki Issue #1 için SecureStore migration denendi ve **ROLLBACK** yapıldı. Detaylar FORGE.md Cycle #4'te.
