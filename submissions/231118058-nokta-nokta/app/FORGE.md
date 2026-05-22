# FORGE.md - Cycle Ledger

| Cycle | Rapor Adı | Hipotez | Sonuç | Değişen Dosyalar | Test Sonucu | Commit Hash | kg | Human Touch Points |
|---|---|---|---|---|---|---|---|---|
| 1 | bug2.md #1 | "sembol küçük" -> Profil avatarının/sembolünün boyutunu büyüt ve tasarım dilini modernize et. | SUCCESS | `src/screens/ProfileScreen.tsx` | Sembol büyütüldü ve UI stabil. | - | 2kg | 0 |
| 2 | bug2.md #2 | "Dashboard rengi hoş değil" -> Arka planı koyu tema (dark mode) ve hafif degrade (gradient) ile daha premium bir görünüme kavuştur. | SUCCESS | `src/screens/DashboardScreen.tsx`, `src/theme/index.ts` | Renk paleti başarıyla uygulandı, metinler okunabilir. | - | 3.5kg | 1 (Kullanıcı renk paletini onayladı) |
| 3 | bug2.md #5 | "Videolar açılmıyor" -> Video oynatıcı (player) kütüphanesini güncelle ve eksik native dependency'leri ekle. | ROLLBACK | `src/screens/EducationScreen.tsx`, `package.json` | Native modül hatası (crash) alındı, Expo development build gerektirdiği için geri alındı. | - | 1kg | 2 (Hatayı görüp manuel iptal edildi) |
| 4 | bug2.md #3 | "Butonlar üst üste biniyor" -> Ekranı KeyboardAvoidingView içine al, Flex oranlarını düzelt. | SUCCESS | `src/screens/JournalScreen.tsx` | Klavye açılınca butonlar artık üst üste binmiyor ve akış pürüzsüz. | - | 4kg | 0 |
| 5 | bug2.md #4 | "Bu kısım gelişmesi lazım" -> Haftalık özet kartını (summaryCard) sade görünümden kurtarıp primary renk ve kontrastıyla daha premium bir görünüme kavuştur. | SUCCESS | `src/screens/JournalScreen.tsx` | Görsel tasarım (glassmorphism/premium) başarıyla uygulandı. | - | 5kg | 0 |
