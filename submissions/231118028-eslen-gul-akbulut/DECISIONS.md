# DECISIONS.md — Teknik Kararlar (Technical Decisions)

Bu belgede, Nokta-Nokta challenge kapsamında geliştirilen Expo + TypeScript uygulamasında alınan teknik kararlar ve gerekçeleri yer almaktadır.

---

## 1. Ses İzleme İçin `expo-av` Seçimi
- **Karar:** Mikrofon erişimi ve gerçek zamanlı ses seviyesi izleme için Expo ekosisteminin resmi kütüphanesi olan `expo-av` seçilmiştir.
- **Gerekçe:** 
  - Expo Go ile tam uyumlu çalışır; ek native konfigürasyonlara ihtiyaç duymaz.
  - Mikrofon izinlerini (permission API) yerleşik olarak yönetir.
  - Kayıt esnasında `status.metering` (desibel cinsinden ses seviyesi) değerini periyodik olarak dönerek ek bir ses işleme kütüphanesine gerek kalmadan anlık hacim tespiti sağlar.

---

## 2. RMS ve Hacim Tabanlı Ses Görselleştirici (Voice Visualizer)
- **Karar:** Mikrofonun ürettiği metering verisi `[-160, 0]` desibel aralığından `[0, 1]` lineer RMS/volume ölçeğine dönüştürülmüştür.
- **Gerekçe:** 
  - İnsan kulağının duyarlılığına yakın bir ölçek elde etmek için logaritmik metering değeri normalize edilerek lineerleştirilmiştir.
  - Sessizlik durumunda (volume < 0.05 veya -50dB altı) visualizer'ın idle (sönük/sakin) bir dalga formuna dönmesi sağlanmış, ses geldiğinde ise dinamik React Native `Animated` veya `Reanimated` geçişleri ile barların ses ritmine göre yükselmesi sağlanmıştır.

---

## 3. RMS Tabanlı Lipsync Fallback Simülasyonu
- **Karar:** `avatar.glb` 3D dosyası yüklü değilse, ödev dizinindeki `avatar2.png` dosyasını fallback mascot olarak yüklemek ve anlık RMS/volume değerine göre bu görseli dikey-yatay ölçeklemek (squash & stretch) kararlaştırılmıştır.
- **Gerekçe:** 
  - Gerçek zamanlı 3D viseme analizi yapmak yüksek işlem gücü gerektirir ve Expo Go ortamında native modüller olmadan kararlı çalışmayabilir.
  - `avatar2.png` üzerinde yapılan animasyonlu dikey (`scaleY`) ve yatay (`scaleX`) ölçekleme sayesinde, karakter konuşma esnasında esneyip bükülerek son derece inandırıcı bir konuşma taklidi ve lipsync fallback simülasyonu sunar.
  - CPU veya JS Thread'i bloke etmeden 60 FPS performans alabilmek için bu dönüşümler GPU uyumlu React Native `Animated.Value` interpolasyonu üzerinden yapılmıştır.

---

## 4. Jitsi ile Expert Bridge Bağlantısı
- **Karar:** Uzmana Bağlan butonu, `expo-linking` veya React Native `Linking` API kullanılarak harici tarayıcı veya kurulu Jitsi uygulaması üzerinden `https://meet.jit.si/nokta-forge-231118028` adresini açacak şekilde tasarlanmıştır.
- **Gerekçe:** 
  - Uygulama içi WebRTC entegrasyonu yapmak hem APK boyutunu aşırı büyütebilir hem de uyumluluk sorunlarına (özellikle ses/video donanım erişimlerinde) yol açabilir.
  - Jitsi Meet bağlantısını harici açmak, kullanıcılara Jitsi'nin kendi yerel ve optimize edilmiş video konferans altyapısını sunarak kesintisiz bir 60 saniyelik görüşme planı uygulanmasını sağlar.

---

## 5. Workspace İzolasyonu (Submission Dışına Yazmama Kararı)
- **Karar:** Projeyle ilgili tüm kodlar, yapılar, konfigürasyonlar ve dokümanlar sadece `nokta-nokta/submissions/231118028-eslen-gul-akbulut/` dizini altına yazılmıştır.
- **Gerekçe:** 
  - `nokta` ve `nokta-audit` referans repoları read-only kalmalıdır.
  - Proje tesliminin CI/CD kontrol testlerinden (`validate-pr.yml` gibi) sorunsuz geçmesi için root dizine hiçbir şekilde dokunulmamalıdır.

---

## 6. Expo SDK 54 Uyumluluğu
- **Karar:** Uygulamanın geliştirme ve çalışma ortamı olarak doğrudan Expo SDK 54 (ve ilgili React 19.1 & React Native 0.81 bağımlılıkları) seçilmiştir.
- **Gerekçe:**
  - Expo Go'nun en güncel sürümü (SDK 54) ile çalışması gerektiği için SDK 51 ile oluşan uyumsuzlukların önüne geçilmiştir.
  - TypeScript derlemesi (`npx tsc --noEmit`) ile tam uyumlu hale getirilmiştir.
  - Expo SDK 54 ile gelen modern dosya sistemi API değişiklikleri nedeniyle `expo-file-system/legacy` modülü tercih edilerek kararlılık sağlanmıştır.
