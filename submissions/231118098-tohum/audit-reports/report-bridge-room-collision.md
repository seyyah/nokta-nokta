# Audit Report — BridgeScreen: Room name collision risk

**Reporter:** 231118098 (Aleyna · self-as-user)
**Screen:** Bridge (Phase C)
**Captured:** 2026-05-27
**Tool:** @xtatistix/mobile-audit + voice dictation

## Issue

Bridge oda adı `nokta-tohum-{studentId}-{unixMinute}` formatında — yani aynı dakika içinde aynı student'ın açtığı 2 oda **aynı** olur. Bu **iyi** bir özellik (arkadaşımla aynı odada buluşmak için), **ama** test sırasında:

1. Ben Bridge'i açtım → oda `nokta-tohum-231118098-29250320`
2. Yeniden açtım (test için) → aynı dakikadayım, hâlâ aynı oda
3. Beklenti: "Yeni Oda" butonu farklı oda üretmeli → ÜRETMEDİ, çünkü `makeRoomName()` aynı dakika slot'unda aynı sayıyı veriyor

## Steps to reproduce

1. Bridge tab → oda kodu görünür
2. "↻ Yeni oda kodu üret" → kod **değişmiyor** (aynı dakika içindeysen)
3. 1 dakika bekle, tekrar bas → yeni kod

## Expected

"Yeni oda kodu üret" her seferinde farklı kod vermeli. Eğer aynı dakika içinde tekrar üretilirse, en azından **suffix** eklenmeli (`-2`, `-3` gibi) veya **rastgele 4 karakter** eklenmeli.

## Severity

**Low-Medium** — Demo akışını bozmaz ama UX küçük bir sürpriz; jüri "neden basıyorum bir şey olmuyor" diyebilir.

## Suggested fix

```ts
function makeRoomName(): string {
  const slot = Math.floor(Date.now() / 60_000);
  const nonce = Math.random().toString(36).slice(2, 6);
  return `${ROOM_PREFIX}-${STUDENT_ID}-${slot}-${nonce}`;
}
```

Bu çözüm "arkadaşımla aynı odaya düşmek istiyorum" davranışını bozar — arkadaş aynı kodu görmek için linki paylaşmak zorunda kalır. Bu **trade-off doğru** çünkü zaten "Linki Paylaş" butonu var, manuel koordinasyon = daha az collision.

## Audit context

- Device: Android 13, Expo Go SDK 54
- App build: submission/231118098-tohum (e1af0d0)
