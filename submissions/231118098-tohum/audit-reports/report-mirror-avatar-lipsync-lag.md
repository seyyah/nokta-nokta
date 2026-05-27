# Audit Report — MirrorScreen: Avatar lipsync lag

**Reporter:** 231118098 (Aleyna · self-as-user)
**Screen:** Mirror (Phase A)
**Captured:** 2026-05-27
**Tool:** @xtatistix/mobile-audit + voice dictation

## Issue

Avatar dudakları konuşmama göre hareket ediyor ama **belirgin bir gecikme** var — ben "AAAA" diye yüksek sesle bağırıyorum, ağız ~0.5 saniye sonra açılıyor. Mimik ile ses arasında his uyumsuzluğu var. Spec hedefi "<200ms" idi; subjektif olarak 300-500ms gibi.

## Steps to reproduce

1. Mirror tab → "Konuşmaya Başla"
2. Aniden "AAA" diye yüksek ses çıkar
3. Aynaya bak → ağız açılması belirgin gecikmeli
4. Sürekli konuş → ağız yavaşça takip ediyor, anlık değil

## Expected

Ağız konuşmayla aynı anda hareket etsin — insan beyni 150ms üstü gecikmeyi "yanlış zamanlama" olarak okuyor (lip-sync uncanny valley).

## Probable cause

`AvatarStage.tsx`'te morph target update'leri `useFrame` içinde lerp ile yapılıyor:

```ts
influences[idx] += (target - influences[idx]) * 0.4;
```

Lerp factor `0.4` çok yumuşak — yüksek frekanslı amplitude değişimlerini smooth ediyor. Konuşma için daha agresif lerp gerekli (örn. 0.6-0.75) veya direkt atama.

## Severity

**High** — Phase A puanlamasının özü "lipsync fidelity"; demo'da jüri ilk fark edeceği şey gecikme.

## Suggested fix

1. Lerp factor 0.4 → 0.65 dene
2. Mouth target için ayrıca asymmetric lerp: ağız açılması hızlı (0.8), kapanması yavaş (0.3) → daha doğal
3. Eğer hala yetersizse: useVoiceMeter UPDATE_INTERVAL_MS=16 → 8 (daha sık update)

## Audit context

- Device: Android 13, Expo Go SDK 54
- App build: submission/231118098-tohum (e1af0d0)
- Latency göstergesi ekrandaki: 14-18ms (hook-level, end-to-end değil)
