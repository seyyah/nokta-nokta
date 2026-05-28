# FORGE.md — Cycle Ledger

Student: 231118033  
Project: Nokta Nokta Voice Forge  
Track: A  

---

## Cycle 01 — voice-viz-optimization — 2026-05-25T14:00

STATUS: COMMIT  
INPUT: audit-reports/report-01-voice.md  

HYPOTHESIS: Mikrofon seviyesini bar yüksekliklerine bağlarsam visualizer konuşmaya tepki verir, sessizlikte idle kalır.

CHANGES: app/App.tsx içinde mikrofon başlatma/durdurma akışı, RMS/level state’i, animated waveform barları ve idle davranışı eklendi.

TEST: Mikrofon başlatıldı, konuşma sırasında barların hareket ettiği, sessizlikte ise baseline seviyesine döndüğü gözlemlendi. RMS/level değeri UI üzerinde gösterildi.

DURATION_MIN: 20  

NOTES: Web demo tarafında mikrofon görselleştirme için Web Audio API tercih edildi. Bu karar DECISIONS.md Decision 01 altında belgelendi.

---

## Cycle 02 — avatar-rms-fallback — 2026-05-25T14:25

STATUS: COMMIT  
INPUT: audit-reports/report-02-avatar.md  

HYPOTHESIS: Avaturn GLB modelini React Three Fiber sahnesine yükleyip RMS seviyesini avatar hareketine bağlarsam avatar konuşma sırasında canlı görünebilir.

CHANGES: app/AvatarScene.tsx içinde GLTFLoader ile kişisel avatar.glb yüklendi. Avatar sahnesi, ışıklandırma, kamera kadrajı ve RMS tabanlı hareket fallback’i oluşturuldu.

TEST: avatar.glb başarıyla yüklendi. Sahne render edildi. Konuşma/TTS seviyesi geldiğinde avatarın hafif scale/position/rotation hareketi yaptığı gözlemlendi.

DURATION_MIN: 20  

NOTES: Avaturn export dosyasında güvenilir mouth/jaw/viseme morph target bulunamadığı için tam viseme lipsync yerine RMS-based avatar motion fallback kullanıldı. Bu sınırlama README.md, DECISIONS.md ve BRIDGE.md içinde açıkça belgelendi.

---

## Cycle 03 — experimental-mouth-overlay — 2026-05-25T14:50

STATUS: ROLLBACK  
INPUT: audit-reports/report-02-avatar.md  

HYPOTHESIS: Kamera zoom ve sahte ağız overlay kullanarak avatarın konuşma etkisi daha belirgin gösterilebilir.

CHANGES: app/AvatarScene.tsx üzerinde agresif kamera yakınlaştırma ve RMS ile büyüyüp küçülen siyah ağız overlay denendi.

TEST: Kamera yüzün alt kısmını kesmeye başladı. Siyah ağız overlay doğal görünmedi ve uncanny valley etkisi oluşturdu.

DURATION_MIN: 20  

NOTES: Bu deneme demo kalitesini düşürdüğü için geri alındı. Temiz face/shoulder avatar kadrajına ve RMS-based motion fallback çözümüne dönüldü. ROLLBACK nedeni DECISIONS.md Decision 08 altında belgelendi.

---

## Cycle 04 — stuck-expert-bridge — 2026-05-25T15:15

STATUS: STUCK  
INPUT: audit-reports/report-03-bridge.md  

HYPOTHESIS: GLB dosyası güvenilir viseme/morph target sağlamadığı için tam lipsync problemi agent tarafından kod seviyesinde çözülemeyebilir ve uzman köprüsüne taşınmalıdır.

CHANGES: app/App.tsx içinde forge state butonları, failCount takibi, STUCK durumu, bridgeRequired heuristic’i ve Uzmana Bağlan butonu eklendi.

TEST: FAIL/ROLLBACK durumları ile failCount artırıldı. failCount >= 2 olduğunda bridgeRequired true oldu. STUCK seçildiğinde Jitsi expert bridge doğrudan aktifleşti.

DURATION_MIN: 20  

NOTES: STUCK sebebi asset-level limitation olarak değerlendirildi. Mevcut avatar.glb dosyasında mouth/jaw/viseme morph target olmadığı için sorun BRIDGE.md içinde uzman görüşmesine taşındı.

---

## Cycle 05 — persona-report-reader — 2026-05-28T16:30

STATUS: COMMIT  
INPUT: PERSONAS.md  

HYPOTHESIS: Junior-Sen ve Senior-Sen persona modları sadece metin değiştirmek yerine raporu farklı tonlarda okuyabilirse track isterindeki “2+ avatar varyantı / feedback verir” şartı daha güçlü karşılanır.

CHANGES: app/App.tsx içine Türkçe SpeechSynthesis tabanlı persona okuma eklendi. Junior-Sen daha destekleyici ve canlı, Senior-Sen daha yavaş, teknik ve doğrulama odaklı olacak şekilde rate/pitch ayarları yapıldı. TTS sırasında avatarın hareket etmesi için ttsLevel state’i eklendi.

TEST: Junior-Sen seçildiğinde destekleyici Türkçe feedback okundu. Senior-Sen seçildiğinde daha teknik bir değerlendirme okundu. Okuma sırasında avatarın RMS benzeri TTS hareketiyle canlandığı gözlemlendi.

DURATION_MIN: 20  

NOTES: Tarayıcıda Türkçe erkek ses varsa otomatik seçilmeye çalışılır. Uygun ses bulunamazsa tarayıcı varsayılan sesi kullanılır. Bu sınırlama PERSONAS.md içinde belgelendi.

---

## Cycle 06 — audit-markdown-and-demo-fallback — 2026-05-28T17:10

STATUS: COMMIT  
INPUT: audit-reports/report-01-voice.md, audit-reports/report-02-avatar.md, audit-reports/report-03-bridge.md  

HYPOTHESIS: Dikte ve mikrofon özellikleri tarayıcı/cihaz izinlerine bağlı olduğundan demo sırasında akışı korumak için gerçek deneme korunmalı, ancak güvenli demo fallback butonları da sunulmalıdır.

CHANGES: app/App.tsx içinde Voice → Audit Markdown bölümü güçlendirildi. Temiz Demo Audit Metni Yükle, Demo STT Metni Ekle, Markdown Audit Raporu Üret ve Visualizer Manuel Test kontrolleri eklendi. Dikte durumu UI üzerinde ayrıca gösterildi.

TEST: Demo metni text area’ya yüklendi. Markdown audit raporu üretildi. Rapor içinde Student, Screen, Dictated Finding, Audio Signal, Avatar, Forge Trigger ve Next Action alanları oluştu.

DURATION_MIN: 20  

NOTES: Gerçek STT denemesi korunur; cihaz veya tarayıcı STT desteği çalışmazsa Demo STT Metni Ekle butonu ile demo akışı bozulmadan sürdürülebilir.

---

## Cycle 07 — native-apk-fallback-build — 2026-05-28T19:00

STATUS: COMMIT  
INPUT: README.md, DECISIONS.md  

HYPOTHESIS: Web demo tarafındaki window, navigator, AudioContext, SpeechRecognition ve speechSynthesis gibi API’ler native Android build sırasında risk oluşturabilir. Native build için sade bir fallback ekranı kullanılırsa APK teslim şartı güvenli karşılanabilir.

CHANGES: app/App.native.tsx dosyası eklendi. Bu dosya sadece SafeAreaView, ScrollView, View, Text ve StyleSheet gibi standart React Native bileşenlerini kullanır. Web demo App.tsx içinde korunur, Android/iOS native build sırasında App.native.tsx kullanılır.

TEST: npx tsc --noEmit çalıştırıldı ve hata alınmadı. npx expo install --check çıktısı temiz geldi. react-native-reanimated peer dependency uyarısı için react-native-worklets eklendi. APK build süreci native-safe fallback ile tamamlandı.

DURATION_MIN: 20  

NOTES: APK içindeki ekran tam interaktif web demosu değildir; kurulabilir teslim paketi için native-safe fallback sağlar. Tam etkileşimli mikrofon, STT, TTS, avatar ve bridge demosu web demo videosunda gösterilir. Bu karar DECISIONS.md Decision 09 altında belgelendi.

---

## Final Forge State

```text
Voice visualizer: implemented
AvatarScene: implemented
Personal avatar.glb: included
Viseme lipsync: limited by GLB export
RMS-based avatar fallback: implemented
Persona switch: implemented
Turkish persona report reading: implemented
TTS-driven avatar motion: implemented
Audit markdown generation: implemented
Forge timeline: implemented
ROLLBACK cycle: documented
STUCK cycle: documented
Expert bridge: implemented with Jitsi
Bridge session: completed with Alperen Eri
Native APK fallback: implemented
APK: app-release.apk included