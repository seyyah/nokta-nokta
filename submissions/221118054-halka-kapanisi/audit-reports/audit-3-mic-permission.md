# Bug Raporu — Halka Kapanışı

**Tarih:** 2026-05-23 15:20
**Toplam:** 1 not · 🔴 1 açık
**Raporlayan:** qa-221118054

---

## Ekran: MirrorScreen

### 🔴 #1 — Mikrofon izni reddedildiğinde sessiz fail

> Burn-in seçim: "Konuş" butonu sarı kutuyla işaretli — basınca hiçbir
> şey olmuyor.

- **Durum:** Açık
- **Bileşen ipucu:** `app/src/voice/useMicAnalyzer.ts` → `start()` error path
- **Zaman:** 2026-05-23T15:20

**Not (insan dili):**
Telefonun ayarlarından mikrofon iznini kapatıp uygulamayı açtım. "Konuş"
butonuna basınca hiçbir şey olmadı — UI sessiz. Kullanıcı neyin yanlış
olduğunu anlamıyor.

**Beklenen:** İzin reddedildiğinde anlaşılır bir uyarı (Alert veya toast):
"Mikrofon izni reddedildi. Ayarlardan etkinleştirin."
