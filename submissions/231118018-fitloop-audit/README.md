Track: C

# FitLoop - Audit-to-Forge & Faz 3 Teslimatı

**Track C Teslimatı: "Sade ama kusursuz" (Akıcılık ve Senkronizasyon).**

## Uygulama Özeti
FitLoop, günlük fitness mikro-koçluk takibi için geliştirilmiş minimal bir Expo + TypeScript React Native uygulamasıdır. Kullanıcılar öğün, su ve fiziksel aktivitelerini girerek yerel bir `FitScore` ve kısa koçluk geri bildirimleri alırlar.

## Faz 3: Yapay Zeka (AI) & Uzman İşbirliği
- **Sesli Dikte (Voice STT):** Entegre `@react-native-voice/voice` ile kullanıcılar doğrudan konuşarak Audit Widget üzerinden burn-in raporlarını (Markdown) sese dayalı olarak oluşturabiliyor.
- **3D Avatar & Dudak Senkronizasyonu (Lip-Sync):** `@react-three/fiber` ve `three` kullanılarak `.glb` tabanlı 3D avatar sisteme dahil edildi. Mikrofondan alınan ses dalgalarına (`expo-av` Audio Recording) göre barlar zıplıyor ve avatarın dudakları eşzamanlı (Lip-Sync) hareket ediyor. Gecikme (latency) hedefi 200ms altında tutularak Track C'nin "akıcılık" şartı sağlandı. Avatar sahnesi yalnızca mobil platformlarda çalışır.
- **STUCK Tespiti (Heuristic) & Jitsi WebRTC:** Eğer ajan Forge döngüsünde tıkanırsa (Örn: rapora "hata" veya çözülemeyen kelimeler dikte edilirse), uygulama otomatik olarak bir Heuristic STUCK tespiti yapıyor ve tam ekran bir Jitsi Meet (Uzmana Bağlan) görüntülü görüşme modülü açıyor.
- **BRIDGE.md Logları:** Uzmanla yapılan görüşmelerin transkript / özet bilgisi otomatik olarak bir sonraki Forge döngüsüne bağlam (context) olarak `BRIDGE.md` dosyasına kaydediliyor. 
## Audit Widget (Denetim Aracı)
- Sisteme dahil edildiği yer: `app/App.tsx`
- Widget kaynak kodu: `app/src/audit/AuditWidget.tsx`
- Rapor dizini: `audit-reports/`
- Rapor formatı: Ekran görüntüsü kanıtı içeren Markdown hata raporları.
- Mimari Kural: Yerel dosya sistemi ve ekran görüntüsü (screenshot) işlemleri bileşene `deps` (bağımlılıklar) üzerinden dışarıdan enjekte edilir; widget `expo-file-system` veya `react-native-view-shot` kütüphanelerini doğrudan projenin içine import etmez.

## Forge Döngüsü
- Akış: OKU (READ) -> BUL (LOCATE) -> HİPOTEZ KUR (HYPOTHESIZE) -> ONAR (REPAIR) -> TEST ET (TEST) -> DOĞRULA (VERIFY) -> KAYDET/GERİ AL (COMMIT/ROLLBACK).
- Hedef süre: Her döngü için 15 dakika.
- Kayıt Defteri: `FORGE.md` ve `BRIDGE.md` (Tıkanma anlarında).
- Doğrulama komutu: `npx tsc --noEmit`.
- İstenen zorunlu commit formatı: `[FORGE: EkranAdı] Açıklama — Xkg`.

## İnsan Temas Noktaları (Human Touch Points)
- **Sayısı: 4**
- Döngü 01: Audit raporundaki arka plan rengi değişikliği insan tarafından onaylandı.
- Döngü 02: Kaydet butonunun köşe yumuşatma (radius) değişikliği insan tarafından onaylandı.
- Döngü 03: Kaydet butonunun yazı boyutu değişikliği insan tarafından onaylandı.
- Döngü 04: Geçersiz/hatalı kırmızı buton rengi insan tarafından reddedildi ve otomatik geri alma (rollback) tetiklendi.

## Kanıtlar (Evidence)
- Audit raporları: `audit-reports/audit_01.md`, `audit-reports/audit_02.md`, `audit-reports/audit_03.md` (Sesle dikte edilmiş)
- Burn-in ekran görüntüleri: `audit-reports/audit_01.png`, `audit-reports/audit_02.png`, `audit-reports/audit_03.png`
- Değerlendirme notları: `EVAL.md`
- AI/Uzman Görüşme Logu: `BRIDGE.md`
- Android APK: `apk-release.apk` (Bulut EAS Derlemesi)

## Expo / Demo Linkleri
- Expo Projesi: https://expo.dev/accounts/eexnmy/projects/FitLoop
- Demo Videosu: https://youtube.com/shorts/C2e2Pw2Tlcg (klasör içinde de demo video mevcut)

## Mimari Karar Defteri (Decision Log)
- "Sade ama kusursuz" görsel akıcılığı, hassas dudak senkronizasyonunu ve <200ms gecikmeyi vurgulamak için Track C seçildi.
- Gradle derlemesi sırasında eski `react-native-voice` kütüphanesinin neden olduğu "çift sınıf" (duplicate class) çakışmalarını çözmek için Yeni Mimari devre dışı bırakıldı (`"newArchEnabled": false`) ve projeye özel bir `withJetifier.js` Expo eklentisi enjekte edildi.
- Jitsi Meet entegrasyonu, Android'deki iç içe geçmiş (nested) `Modal` çökme sorunlarını atlatmak için ekranı tamamen kaplayan güvenli bir `StyleSheet.absoluteFill` container içine sarıldı.
- Ses yüksekliği (audio metering) ölçümleri, `expo-av` kayıt güncellemeleri aracılığıyla alındı ve Three.js state'i (durumu) ile doğrudan senkronize edilerek yüksek performanslı görsel animasyonlar sağlandı.
