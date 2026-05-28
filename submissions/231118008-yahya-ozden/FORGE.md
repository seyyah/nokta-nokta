# FORGE.md - 231118008 yahya-ozden

Date: 2026-05-28  
Track: Voice visualizer + lipsync + bridge  
App path: `submissions/231118008-yahya-ozden/app/`

## Voice-Dictated Audit Reports

### Audit Report 1 - Voice Visualizer Burn-in

Dictation source: voice -> STT -> markdown  
Burn-in: 8 dakika, normal konusma + 20 saniye sessizlik + tekrar konusma

Konusurken barlar yukseliyor, sessizlikte dusuyor. Ilk denemede barlar cok agresif
zipladi; amplitude degeri dogrudan kullanildigi icin dalga sert gorundu. Smooth katsayisi
eklenince OpenAI voice-mode benzeri daha akici bir hareket elde edildi.

Agent input:

- Mikrofon meter degerini 70ms aralikla oku.
- dB degerini 0..1 amplitude araligina normalize et.
- Sessizlikte opacity ve yukseklik dusmeli.

### Audit Report 2 - Avatar Lipsync Burn-in

Dictation source: voice -> STT -> markdown  
Burn-in: 7 dakika, avatar ekraninda konusma + hizli/kisa hece testi

Avatar sahnesinde mikrofon seviyesi agiz acikligina baglandi. Gercek morph target varsa
`MouthOpen`, `jawOpen`, `viseme_aa`, `viseme_A`, `viseme_O` anahtarlarini kullanacak
pipeline yazildi. GLB yuklenemezse veya morph target yoksa procedural fallback agzi amplitude
ile oynuyor.

Agent input:

- `avatar.glb` yuklenmeli.
- Morph target varsa once onu kullan.
- Yoksa amplitude tabanli agiz animasyonu demo icin yeterli.

### Audit Report 3 - Bridge / STUCK Burn-in

Dictation source: voice -> STT -> markdown  
Burn-in: 6 dakika, forge ekrani + bridge butonu + Jitsi link acma testi

Cycle 3 bridge konusu bilerek rollback'e suruldu. Ayni mesele ikinci denemede de cozulemedi
seklinde FAIL sinyali kaydedildi. Uygulama iki sinyalden sonra STUCK detected gosteriyor ve
`Uzmana Baglan` butonunu aciyor. Buton WebView yerine `Linking.openURL` ile Jitsi odasini
aciyor.

Agent input:

- Iki fail/rollback sinyali olunca STUCK goster.
- STUCK durumunda uzman butonu gorunsun.
- Jitsi linki dis tarayiciya acilsin.

## Forge Cycle Ledger

| Cycle | Timebox | Status | Scope | Result |
|---|---:|---|---|---|
| Cycle 1 | 20 dakika | SUCCESS | Voice visualizer | `expo-av` microphone metering eklendi, RMS/amplitude smoothing ile bar animasyonu calisti. |
| Cycle 2 | 20 dakika | SUCCESS | Avatar lipsync | `avatar.glb` yukleme pipeline'i ve amplitude fallback mouth animation eklendi. |
| Cycle 3 | 20 dakika | ROLLBACK | intentional bridge issue | WebView ile bridge acma fikri riskli bulundu; STUCK sinyali kaydedildi ve rollback alindi. |
| Cycle 4 | 20 dakika | SUCCESS | expert bridge fix | Jitsi odasi `Linking.openURL` ile acildi, uzman gorusmesi sonraki cycle context'i oldu. |

## Final Verify Notes

- Voice visualizer: mikrofon izni ister, konusunca barlar canlanir, sessizlikte soner.
- Avatar: GLB yuklenir; morph target yoksa procedural avatar agzi amplitude ile acilip kapanir.
- Bridge: Cycle 3 rollback + retry fail sinyali STUCK tespitini tetikler.
- Expert room: `https://meet.jit.si/nokta-nokta-231118008-stuck-bridge`
