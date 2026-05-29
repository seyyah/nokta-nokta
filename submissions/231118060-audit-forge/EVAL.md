# EVAL

Bu submission icin altin senaryolar:

| id | scenario | expected result | ratchet check |
|---|---|---|---|
| E1 | App `/` route'unda acilir | Capture ekrani render olur ve tab navigasyonu gorunur | `npm run typecheck` |
| E2 | Reports tab'ina gecilir | Reports kopyasi, `format md/docx` metrigi ve export aksiyonu gorunur | `npm run typecheck` |
| E3 | Forge tab'ina gecilir | Success, rollback ve kg metrikleri ayni bantta kalir | `npm run typecheck` |
| E4 | Root layout okunur | `currentScreen` `usePathname()` ile uretilir ve deps icine verilir | `rg -n "AuditWidget" app -g '!node_modules'` |
| E5 | Audit raporlari agent'a verilir | Her raporda burn-in gorsel, ekran adi, musteri notu, bounds ve agent input vardir | `Get-ChildItem audit-reports/*.md` |
| E6 | Demo artifact izlenir | 60.0 sn MP4 Capture, Reports ve Forge burn-in kanitlarini sirayla gosterir | `imageio` duration check |
| E7 | Capture live voice panel acilir | Mic permission istenir, barlar ve avatar ayni amplitude state'ini kullanir | physical Android mic check |
| E8 | Avatar asset dogrulanir | `app/assets/avatar.glb` vardir ve `Mouth` node'u render pipeline'inda aranir | `Get-Item app/assets/avatar.glb` |
| E9 | Bridge route acilir | Jitsi room external flow ile acilir; fake call screen yoktur | tap `Connect expert` |
| E10 | Scope korunur | Diff yalniz submission path altindadir | `git diff --name-only origin/codex/231118060-audit-forge` |

Rollback guard: `AuditWidget` birden fazla satirda mount edilirse veya native paket importlari widget paketinin icine tasinmis gibi davranan ek wrapper yazilirsa degisiklik reddedilir. Track A icin basari olcutu daha fazla ozellik degil, daha az sizinti ve daha net bagimliliktir.
