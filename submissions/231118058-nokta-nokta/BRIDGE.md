## Bridge call — 2026-05-21T19:30
TRIGGER: manual
STUCK_CYCLE: Cycle-3
EXPERT: sinif-arkadasim
DURATION_SEC: 65
TRANSCRIPT_SUMMARY:
  - Lipsync gecikmesi tartışıldı; WebGL morph target binding'in setInterval ile tetiklenmesinin gecikmeye yol açtığı saptandı.
  - Expert: postMessage frekansını setInterval(50) yerine requestAnimationFrame döngüsüne taşı — bu şekilde latency ~16ms'ye düşer.
  - Ekran paylaşımı ile avatar.html kodu canlı incelendi; sorunlu satır birlikte tespit edildi.
  - 65 saniye boyunca video + audio + screen share üçü birden aktifti.
NEXT_CYCLE_INPUT: BRIDGE feedback → Cycle 4 — setInterval→rAF refactor (bkz. FORGE.md Cycle 4)

## Bridge call — 2026-05-21T21:22
TRIGGER: manual
STUCK_CYCLE: Cycle-3 (takip)
EXPERT: sinif-arkadasim
DURATION_SEC: 90
TRANSCRIPT_SUMMARY:
  - Home sayfası UX incelemesi yapıldı; Material UI kullanımı ve modern layout önerildi.
  - Renk paleti: sarı-lacivert kombinasyonu; üst bar'a ayarlar ikonu eklenmesi kararlaştırıldı.
  - "Home sayfasını geliştirmen gerekiyor, materyal UI kütüphanesini kullanabilirsin, daha modern bir tasarım ortaya çıkarırsın."
  - "Home sayfasını mavi yapalım, sarı lacivert olsun, yukarıda da bir tane ayarlar ikonu olsun."
NEXT_CYCLE_INPUT: Home sayfası renk ve layout güncellemesi → bir sonraki forge cycle.
