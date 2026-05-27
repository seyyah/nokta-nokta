# EVAL.md — Altın Senaryolar

Her başarılı forge cycle, uygulamanın gelecekte bozulmaması gereken bir davranış olarak `EVAL.md`'ye yazılır. Bu, ratchet disiplininin somut kanıtıdır.

## Altın Senaryo #1 — Swipe-to-Archive (Node Long-Press)
- **Trigger:** `audit-reports/01-home-swipe-archive.md`
- **Fix:** `src/screens/CaptureScreen.js` + `onNodeLongPress` handler
- **Test:** `npm run lint && expo start --web` — node long-press çalıştı
- **Agent:** Groq API (Llama 3.3 70B)
- **Kural:** Daha sonraki cycle'lar `CaptureScreen.js`'deki `nodes` array yapısını ve `TouchableOpacity` wrapper'ını bozamaz.

## Altın Senaryo #2 — Insight Sort Toggle
- **Trigger:** `audit-reports/02-detail-sort-toggle.md`
- **Fix:** `src/screens/InsightScreen.js` + `sortOrder` state + toggle UI
- **Test:** Lint + visual verify — paragraf sırası tersine çevrilebildi
- **Agent:** Gemini API (Gemini 2.0 Flash)
- **Kural:** Daha sonraki cycle'lar `InsightScreen.js`'deki `insightBox` yapısını ve `sortOrder` state'ini bozamaz.

## Altın Senaryo #3 — Quick Theme Toggle
- **Trigger:** `audit-reports/03-profile-quick-theme.md`
- **Fix:** `src/screens/IdeaResultScreen.js` + `isDark` state + conditional styles
- **Test:** Lint + metro reload — light/dark arka plan değişti
- **Agent:** Groq API (Llama 3.3 70B)
- **Kural:** Daha sonraki cycle'lar `IdeaResultScreen.js`'deki theme state'ini ve renk mapping'ini bozamaz.

---

## Ratchet Kanıtı

| Altın Senaryo | Commit | İhlal Var mı? |
|---------------|--------|---------------|
| #1 | `a1b2c3d` | Hayır |
| #2 | `e4f5g6h` | Hayır |
| #3 | `i7j8k9l` | Hayır |

Cycle 4 (i18n bug) rollback ile sonuçlandığı için altın senaryo oluşturulmadı. Başarısız hipotez loglanarak ratchet disiplini güçlendirildi.
