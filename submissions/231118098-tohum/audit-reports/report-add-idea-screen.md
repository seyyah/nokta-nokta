# Audit Report — Add Idea Screen

**App:** NOKTA
**Screen:** AddIdea
**Reporter:** 231118098
**Date:** 2026-05-20
**Status:** Open → Fixed

---

## Issue #1: Status Badge Color Contrast

**Severity:** Medium
**Category:** Accessibility / Visual Design

### Description
"Tohum" durumu için sarı (#FCD34D) badge üzerinde text okunmuyor. Beyaz veya açık renkli text düşük kontrast sağlıyor.

### Screenshot Region
[Status seçim butonları alanı işaretli - "Tohum" butonu]

### Steps to Reproduce
1. Add Idea ekranını aç
2. Durum bölümüne bak
3. "Tohum" seçili iken text zor okunuyor

### Expected Behavior
Tüm status badge'lerde text net okunabilir olmalı. WCAG AA standardı minimum 4.5:1 kontrast oranı.

### Suggested Fix
Badge text rengini koyu (#0F172A) yap:
```typescript
statusButtonTextActive: {
  color: '#0F172A',
}
```

---

## Issue #2: Tag Input Validation

**Severity:** Low
**Category:** Input Validation

### Description
Etiket alanına boşluk veya özel karakter girildiğinde temizlenmiyor. "  mobil  ,  ai  " gibi girdiler düzgün parse edilmeli.

### Screenshot Region
[Etiketler input alanı işaretli]

### Steps to Reproduce
1. Add Idea ekranını aç
2. Etiketler alanına "  test  ,   demo  " yaz
3. Kaydet
4. Idea detail'de etiketler boşluklu görünüyor

### Expected Behavior
- Leading/trailing boşluklar trim edilmeli
- Boş etiketler filtrelenmeli
- Lowercase normalize edilmeli

### Suggested Fix
```typescript
const tags = tagsText
  .split(',')
  .map((t) => t.trim().toLowerCase())
  .filter((t) => t.length > 0);
```

---

## Issue #3: Form Validation Feedback

**Severity:** Low
**Category:** User Experience

### Description
Boş form gönderildiğinde Alert gösteriliyor ama hangi alanın eksik olduğu net değil. Her alan için inline validation olmalı.

### Screenshot Region
[Form alanları ve Kaydet butonu işaretli]

### Steps to Reproduce
1. Add Idea ekranını aç
2. Hiçbir şey yazmadan "Fikri Kaydet" butonuna dokun
3. "Fikir başlığı gerekli" alert'i çıkıyor

### Expected Behavior
Inline validation: her input altında hata mesajı, border rengi değişimi.

### Current Status
**Deferred** - MVP için Alert yeterli, v2'de iyileştirilecek.

---

## Summary

| Issue | Severity | Status |
|-------|----------|--------|
| Status Badge Color Contrast | Medium | Fixed |
| Tag Input Validation | Low | Fixed |
| Form Validation Feedback | Low | Deferred |

**Total Issues:** 3
**Fixed:** 2
**Deferred:** 1
