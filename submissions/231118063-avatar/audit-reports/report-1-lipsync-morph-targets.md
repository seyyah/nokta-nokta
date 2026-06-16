# Audit Raporu — #1: Lipsync Çalışmıyor (Morph Target Eksikliği)

**Tarih:** 2026-06-16  
**Rapor Eden:** 231118063  
**Faz:** Phase A — Ayna (Voice + Avatar)  
**Önem:** Kritik

---

## Sorun / Bulgu

Uygulama açıldığında 3D avatar sahnede görünüyor ancak mikrofona konuşulduğunda avatarın ağzı **hiç hareket etmiyor**. Voice viz barları ses şiddetine göre animasyon yapıyor, dolayısıyla mikrofon girdisi doğru alınıyor. Sorun lipsync katmanında.

## Kök Neden Analizi

`index.tsx` içindeki `Avatar` bileşeni, lipsync için morph target (blend shape) kullanıyor:

```js
const mouthOpenIndex = child.morphTargetDictionary['mouthOpen'] 
  ?? child.morphTargetDictionary['jawOpen'];
```

Ancak `avatar.glb` dosyası avaturn.me'den **viseme/blend shape seçeneği kapalı** olarak export edilmiş. GLB'nin JSON chunk'ı incelendiğinde hiçbir `targets` bloğu bulunmuyor — mesh primitive'leri yalnızca `POSITION`, `NORMAL`, `TEXCOORD_0`, `JOINTS_0`, `WEIGHTS_0` attribute'larına sahip.

`mouthOpen` ve `jawOpen` isimleri avaturn modelleri için geçersiz olduğundan `mouthOpenIndex` her zaman `undefined` dönüyor ve lipsync kodu hiçbir zaman çalışmıyor.

## Etki

- Phase A acceptance kriteri: **"Mic-to-mouth latency demo'da görünür biçimde < 200ms"** → Ağız hiç hareket etmediği için bu kriter karşılanamıyor.
- Demo videosunda avatar hareketsiz görünüyor, sesle senkron yok.

## Önerilen Çözüm

İki seçenek:

1. **Uzun vade:** avaturn.me'den avatar yeniden export edilmeli, "Face Blendshapes / Visemes" seçeneği aktif edilmeli. Oculus viseme isimleri (`viseme_aa`, `viseme_O` vb.) kullanılarak morph target animasyonu yapılmalı.

2. **Kısa vade (mevcut GLB ile):** Skeleton'da `Head` kemiği mevcut. Ses şiddetine orantılı olarak `Head` kemiğinin X rotasyonu negatif yönde (çene aşağı) değiştirilerek görsel lipsync simüle edilebilir.
