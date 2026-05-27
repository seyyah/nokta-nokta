# BRIDGE.md — Expert Bridge (Uzman Köprüsü) Raporu

Bu dosya, `STUCK` (tıkanma) durumunda kalınan bir Forge döngüsünden kurtulmak amacıyla düzenlenen Jitsi Uzman Çağrısı'nı, 60 saniyelik görüşme planını, görüşme transkript özetini ve sonraki döngüye aktarılan teknik girdileri belgelemektedir.

---

## 1. Jitsi Uzman Çağrısı Detayları
- **Bağlantı Linki:** [https://meet.jit.si/nokta-forge-231118028](https://meet.jit.si/nokta-forge-231118028)
- **Katılımcılar:** Eslen Gül Akbulut (Geliştirici/Müşteri), Nokta Mobil Mimarlık Uzmanı (Uzman Danışman)
- **Amaç:** `avatar.glb` dosyasının yüklenmesi esnasında karşılaşılan yerel bellek sızıntısı ve lipsync simülasyonundaki gecikme (latency) problemini çözmek.

---

## 2. STUCK Cycle Referansı
- **Cycle ID:** Cycle 2 — Avatar GLB Yükleme & Bellek Sızıntısı Problemi (STATUS: STUCK)
- **Tıkanma Nedeni:** Uygulama içinde Üç Boyutlu GLB modelini `@react-three/fiber` kullanarak yüklemeye çalışırken Expo Go ortamında `WebGL Context` oluşturulamadı ve uygulama her mikrofon seviyesi değişiminde (re-render) çöktü/dondu.

---

## 3. 60 Saniyelik Görüşme Planı (60-Second Consultation Plan)
Her saniyenin kritik olduğu bu görüşme için aşağıdaki zaman planı harfiyen uygulanmıştır:
*   **00:00 - 00:10 (Giriş & Konsept):** Sorunun genel olarak tanıtılması (Expo Go + Three.js GLB yükleme hatası).
*   **00:10 - 00:40 (Teknik Detay & Hata Gösterimi):** Metriklerin (RMS) her güncellenmesinde oluşan re-render döngüsünün WebGL Context'i aşırı yüklemesi ve bellek sızıntısına yol açması durumunun paylaşılması.
*   **00:40 - 00:55 (Uzman Tavsiyesi):** Uzmandan çözüm önerisi talep edilmesi (GLB fallback mimarisi ve event-driven lipsync optimizasyonu).
*   **00:55 - 01:00 (Kapanış & Aksiyon):** Teşekkür ve bir sonraki cycle için çözüm stratejisinin netleştirilmesi.

---

## 4. Transcript Summary (Görüşme Özeti)
- **Geliştirici:** *"Merhaba Hocam, Expo Go üzerinde 3D model yüklerken mikrofon ses seviyesini her 50ms'de bir güncellediğimiz için WebGL sürekli re-render oluyor ve uygulama çöküyor. Ne önerirsiniz?"*
- **Uzman:** *"Çok sık karşılaşılan bir durum. Expo Go ortamında WebGL render döngüsünü ayırmak gerekiyor. İlk olarak, GLB yükleme işlemini lazy-load yapmalısın. İkinci olarak, eğer model bulunamazsa veya WebGL hata verirse, uygulamanın çökmesini engellemek için şık bir 2D SVG/Canvas tabanlı 'fallback avatar' yapısı kur. Lipsync için doğrudan state güncellemek yerine, Animated API'nin `useNativeDriver: false` (veya Reanimated shared value) özelliğini kullanarak doğrudan GPU veya yerel katmanda scale güncellemesi yapmalısın."*
- **Geliştirici:** *"Anladım. Yani ses seviyesini her değiştiğinde React state'e yazmak yerine, Animated.Value üzerinden doğrudan transformlara bağlayacağız. Ve GLB dosyası yoksa veya yüklenemezse şık bir 2D ağız animasyonu devralacak."*
- **Uzman:** *"Tam olarak öyle. Bu sayede JS thread'i bloke etmeden 60 FPS lipsync ve sıfır çökme elde edersin."*

---

## 5. Next Cycle Input (Sonraki Cycle Girdisi)
Uzmandan alınan teknik yönlendirmelere göre sonraki başarılı döngü (Cycle 4) için girdi parametreleri şunlardır:
1.  **Fallback Mekanizması:** Avatar ekranında `avatar.glb` dosyasının mevcudiyeti `expo-file-system` veya `require` asset çözümleyicisiyle kontrol edilecek. Bulunamazsa çökme yerine kullanıcı dostu bir "3D model bulunamadı, fallback avatar devrede" uyarısı ve 2D Lipsync animasyonu gösterilecek.
2.  **Performans İyileştirmesi:** RMS/volume değerine bağlı dudak hareketi (`mouthOpen`) React State'i yerine doğrudan React Native `Animated.Value` kullanılarak tetiklenecek ve render yükü ortadan kaldırılacak.
