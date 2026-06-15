---
id: nokta-nokta
title: Halka Kapanışı — Avatar · Voice · HITL
duration_days: 7
format: solo
points_max: 120
points_bonus: 25
prereq_repos: [seyyah/nokta, seyyah/nokta-audit]
deliverable_root: submissions/<student-id>-<slug>/
audience: [human-student, coding-agent]
---

# Nokta-Nokta · Halka Kapanışı

## 0. TL;DR

Geliştirici, kendi uygulamasının ilk kullanıcısı olur. Kendi avatarın seninle konuşur, sesin görselleşir, kendi audit raporlarınla forge döngüsü tetiklenir, sıkıştığında bir insan uzman görüntülü gelir. Önceki iki haftanın halkası burada kapanır.

> **Coding agent okuyorsan:** `## 1. CONTRACT` bağlayıcıdır. Çelişki olursa CONTRACT kazanır. `## 4. ACCEPTANCE` geçer testlerdir; commit'ten önce her satırı doğrula.

## 1. CONTRACT

### Read-only context
- `github.com/seyyah/nokta` — host app + idea capture
- `github.com/seyyah/nokta-audit` — drop-in audit widget

### Write target
- `github.com/seyyah/nokta-nokta` — fork & PR

### Required artifacts

| Path | Required |
|---|---|
| `submissions/<id>-<slug>/app/` | Expo + TS projesi |
| `submissions/<id>-<slug>/app/avatar.glb` | avaturn export, **kendi yüzün** |
| `submissions/<id>-<slug>/FORGE.md` | cycle ledger |
| `submissions/<id>-<slug>/BRIDGE.md` **or** `PERSONAS.md` | track'e göre |
| `submissions/<id>-<slug>/app-release.apk` | build çıktısı |
| `submissions/<id>-<slug>/demo.mp4` | ≤3dk, Phase A+B+C |
| `submissions/<id>-<slug>/README.md` | track + QR + linkler |
| `submissions/<id>-<slug>/DECISIONS.md` | karar günlüğü |

### Forbidden
- Submission klasörü dışına yazmak (CI reject)
- Generic head model — avatar avaturn.me'den kendi yüzün olmalı
- Sentetik/cherry-picked FORGE cycle'ları — hepsi gerçek diff + gerçek timestamp

## 2. Phases

### Phase A — Ayna (Voice + Avatar)
Mic in → bar/wave visualizer → lipsync avatar out.

- Voice viz: `expo-av` mic capture, FFT/RMS bins → animated bars veya wave. Sessizlikte idle.
- Avatar: [avaturn.me](https://avaturn.me)'den kendi yüzünü `.glb` export et → `react-three-fiber` sahneye mount → viseme pipeline ([wass08/r3f-lipsync-tutorial](https://github.com/wass08/r3f-lipsync-tutorial) pattern).
- **Latency hedefi:** mic-to-mouth < 200ms.

**Done when:** 30sn videoda kendi sesinle avatarın senkron konuşuyor.

### Phase B — Kendi Müşterin (Self-as-User Forge)
Kendi appini gerçek kullanıcı gibi kullan, audit'leri agent'a feed et.

- `<AuditWidget />` mount (week-2 drop-in).
- ≥3 burn-in audit raporu üret — raporları **sesli dikte** et (voice → STT → markdown). Manuel typing kabul, ama dikte bonusludur.
- Coding agent (Claude Code / Codex / OpenCode) ile forge loop:
  `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK`
- **≥2 COMMIT + ≥1 ROLLBACK.** Her cycle ≤ 20dk wall-clock.
- Her cycle `FORGE.md`'ye row olarak işlenir (template §5).

### Phase C — Köprü (HITL/HOTL Video Bridge)
Agent + sen birlikte sıkışırsanız insan uzmana görüntülü çağrı.

- WebRTC serbest: Jitsi (en kolay, key yok), Daily.co, LiveKit, Whereby.
- "Uzmana Bağlan" butonu app içinde. **Minimum:** video + audio + screen share — üçü birden.
- Bir cycle'ı kasıtlı STUCK'a sürükle, uzmanı çağır (sınıf arkadaşı; kendin olamaz).
- Demo videoda ≥60sn ekran paylaşımlı görüşme.
- Görüşme özeti `BRIDGE.md`'ye (Track C strict, A/B optional).

## 3. Tracks

| Track | Ad | Odak | Ekstra |
|---|---|---|---|
| A | Sadakat | Voice viz + lipsync fidelity, latency, akıcılık | — |
| B | Çoklu Persona | 2+ avatar (junior-sen / senior-sen) tonal farklılaşma | `PERSONAS.md` |
| C | Otonom Köprü | STUCK auto-detect, agent-triggered call, transkripsiyon → next cycle feedback | `BRIDGE.md` (strict) |

README ilk satır: `Track: A | B | C`

## 4. ACCEPTANCE

**Genel**
- [ ] `submissions/<id>-<slug>/` açıldı, root'a hiçbir dosya yazılmadı
- [ ] README track seçimini içeriyor
- [ ] `avatar.glb` mevcut ve avaturn export
- [ ] `app-release.apk` build edilmiş
- [ ] `demo.mp4` ≤3dk, Phase A+B+C görünür

**Phase A**
- [ ] Mic input voice viz'i tetikliyor (silent state idle)
- [ ] Avatar `.glb` sahnede mount + lipsync oynuyor
- [ ] Mic-to-mouth latency demo'da görünür biçimde < 200ms

**Phase B**
- [ ] `FORGE.md` ≥3 cycle entry
- [ ] ≥2 `STATUS: COMMIT`, ≥1 `STATUS: ROLLBACK`
- [ ] Her cycle ≤ 20dk (timestamp delta kanıtlar)
- [ ] Audit raporları `.md` olarak repo'da mevcut

**Phase C**
- [ ] Uzmana çağrı butonu app'te functional
- [ ] Demo'da ≥60sn video + audio + screen share aktif
- [ ] Track C: `BRIDGE.md` transkripsiyon + next-cycle feedback gösteriyor

## 5. FORGE.md row template

```text
## Cycle N — <slug> — YYYY-MM-DDTHH:MM
STATUS: COMMIT | ROLLBACK | STUCK
INPUT: <audit-report-path>
HYPOTHESIS: <one line>
CHANGES: <files touched>
TEST: <how verified>
DURATION_MIN: <n>
NOTES: <free-form>
```

## 6. BRIDGE.md template (Track C strict)

```text
## Bridge call — YYYY-MM-DDTHH:MM
TRIGGER: auto | manual
STUCK_CYCLE: <cycle-id>
EXPERT: <name-or-handle>
DURATION_SEC: <n>
TRANSCRIPT_SUMMARY:
  - <bullet 1>
  - <bullet 2>
NEXT_CYCLE_INPUT: <what got fed back to agent>
```

## 7. Rubric (120 + 25 bonus)

| Bucket | Points |
|---|---|
| Phase A — Voice + Avatar functional (latency, sync, own face) | 30 |
| Phase B — Forge cycles real & complete (≥2 COMMIT + ≥1 ROLLBACK, time-boxed) | 30 |
| Phase C — Bridge call functional (video+audio+share, all three) | 25 |
| Track depth (A/B/C özgü çıktı kalitesi) | 20 |
| Engineering trace (≥10 meaningful commits, DECISIONS.md) | 15 |
| **APK** | ±5 (yoksa −5, varsa 0) |
| Anti-slop (cosine < 0.80, week-2 ile aynı checker) | gate; aşılırsa −35% |
| **Çılgınlık bonus** (demo-day manual award) | +25 |

## 8. Hibrit zekalara not

**İnsan seyyah:** Sen artık sadece geliştirici değilsin, kendi appinin müşterisisin. Audit raporlarını dürüst yaz, kendine yalan söyleme. Agent çıktısını okumadan commit etme.

**Coding agent:** Bu spec referans olarak verildiğinde —
1. CONTRACT'taki paths ve required files non-negotiable
2. Submission klasörü dışına yazma; root'a dokunma
3. FORGE.md cycle'ları gerçek olmak zorunda — sentetik diff/timestamp üretme
4. `avatar.glb` üretmek senin işin değil; bu kullanıcı action'ı, eksikse user'a sor
5. STUCK durumu rapor et, gizleme. Bridge call'un varlık sebebi sensin.

## 9. Submission

```bash
# Fork
gh repo fork seyyah/nokta-nokta --clone
cd nokta-nokta

# Branch
git checkout -b submission/<student-id>-<slug>

# Work in your folder only
mkdir -p submissions/<student-id>-<slug>
# ... build · audit · forge · bridge ...

# PR
git push origin submission/<student-id>-<slug>
gh pr create --title "submission: <student-id>-<slug>" --body "Track: <A|B|C>"
```

CI root-modifications'ı reject eder.

---

🪞 Kendi avatarın seninle konuşur · 🎙️ sesin görselleşir · 🛠️ kendi raporlarınla tamir edersin · 📞 sıkıştığında insan gelir. **Halka tamamlandı.**
