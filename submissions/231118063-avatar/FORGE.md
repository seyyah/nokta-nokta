# FORGE Kayıtları

Bu dosya, Phase B kapsamında yapılan AI destekli hata ayıklama/geliştirme döngülerini (Forge) içerir.

---

## Cycle 1 — avatar — 2026-06-16T10:15
STATUS: COMMIT
INPUT: audit-reports/report-1-lipsync-morph-targets.md
HYPOTHESIS: avatar.glb avaturn.me'den viseme seçeneği kapalı export edilmiş, morph target yok; Head kemiği rotasyonuyla lipsync simüle edilebilir
CHANGES: src/app/index.tsx
TEST: Avatar bileşeni useFrame içinde scene.traverse ile Head kemiğini buluyor, volume > 5 olduğunda rotation.x hedef değere doğru interpolasyonla kayıyor; ses barlarına eşzamanlı tepki veriyor
DURATION_MIN: 14
NOTES: GLB JSON chunk'ı PowerShell ile parse edildi — hiçbir primitive'de "targets" bloğu yok; `mouthOpen`/`jawOpen` dictionary key araması her zaman undefined dönüyordu. Çözüm: isBone + name==='Head' filtrelemesi, negatif X rotasyonu (çene aşağı = ağız açılır etkisi). Smooth interpolation katsayısı 0.3 olarak ayarlandı.

---

## Cycle 2 — avatar — 2026-06-16T10:32
STATUS: COMMIT
INPUT: audit-reports/report-2-debug-box-production.md
HYPOTHESIS: Canvas içindeki debug kırmızı küp yanlışlıkla üretim kodunda kalmış, silinmesi yeterli
CHANGES: src/app/index.tsx
TEST: Canvas artık yalnızca ambient/directional ışıklar ve <Avatar> içeriyor; sahneye ekstra geometry render edilmiyor
DURATION_MIN: 4
NOTES: Aynı dosyada Environment import'u da kullanılmıyordu (@react-three/drei'dan), o da kaldırıldı. React import'u (React 19, JSX transform) ve forEach callback'indeki kullanılmayan `i` parametresi de bu cycle'da temizlendi.

---

## Cycle 3 — avatar — 2026-06-16T10:48
STATUS: ROLLBACK
INPUT: audit-reports/report-3-auditwidget-scrollview-keyboard.md
HYPOTHESIS: AuditWidget'ı ScrollView içinden çıkarıp bağımsız View'a almak Android klavye sorununu çözecek; KeyboardAvoidingView eklemek de gerekebilir
CHANGES: src/app/index.tsx
TEST: AuditWidget ScrollView dışına taşındı; klavye açıldığında widget sabit kalıyor, sohbet listesi bağımsız kayıyor
DURATION_MIN: 18
NOTES: İlk denemede AuditWidget'ın altına KeyboardAvoidingView eklendi — bu footer mic butonunu da yukarı itiyordu ve düzen bozuluyordu. ROLLBACK yapılarak sade çözüme dönüldü: AuditWidget sadece ScrollView dışına alındı, KeyboardAvoidingView eklenmedi. İkinci commit ile sade çözüm kabul edildi.

---

## Cycle 4 — avatar — 2026-06-16T11:05
STATUS: COMMIT
INPUT: audit-reports/report-3-auditwidget-scrollview-keyboard.md
HYPOTHESIS: Cycle 3 ROLLBACK sonrası sade çözüm (sadece ScrollView dışına al, KeyboardAvoidingView olmadan) yeterli ve düzeni bozmaz
CHANGES: src/app/index.tsx
TEST: AuditWidget ScrollView dışında, mic footer'ın üzerinde, ses görselleştirici ile arasında konumlanmış; klavye açıldığında widget kaybolmuyor
DURATION_MIN: 7
NOTES: Challenge gerekliliği karşılandı: Phase B AuditWidget fonksiyonel ve erişilebilir durumda.
