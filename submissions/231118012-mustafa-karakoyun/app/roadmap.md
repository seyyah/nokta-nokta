# Geliştirme Önerisi (Nokta Audit) Entegrasyon Roadmap

Bu belge, bağımsız bir React Native (Expo) uygulamasına dışarıdan müdahalesiz ("Drop-in") bir şekilde geri bildirim, öneri ve hata bildirim aracının nasıl entegre edileceğini adım adım açıklamaktadır. Bu yapı, geliştiricilerin kodlara minimum müdahale ile güçlü bir denetim (audit) aracı kurmalarını sağlar.

## 1. Temel Felsefe (nokta-audit Yaklaşımı)
* **Host-Agnostic (Uygulamadan Bağımsızlık):** Aracımız uygulamanın iç mantığını, state yönetimini veya navigasyonunu bilmek zorunda değildir.
* **Drop-in (Bırak ve Çalıştır):** Tüm araç, uygulamanın en üst katmanına (App.tsx) tek bir satır ile yerleşir ve tüm sayfalarda çalışır.
* **Artifact-Oriented (Belge Odaklı):** Sistem backend'e bağımlı değildir. Tüm çıktılar yerel cihazda Markdown (.md) veya Word (.docx) olarak üretilir ve işletim sisteminin native Share (Paylaş) penceresi üzerinden dışarı aktarılır.

---

## 2. Kullanılan Teknolojiler ve Kurulumlar
Bu yapıyı başka bir projede kurmak isterseniz aşağıdaki paketlere ihtiyacınız olacaktır:

```bash
# Dosya sistemi ve Native Paylaşım için
npx expo install expo-file-system expo-sharing

# Ekran görüntüsü almak için
npx expo install react-native-view-shot

# Word (.docx) çıktısı üretmek ve base64 dönüşümleri için
npm install docx base64-js
```
*(Not: Expo SDK 54 ve sonrasında dosya sistemi API'si güncellendiğinden, stabilite için `expo-file-system/legacy` importu tercih edilmiştir.)*

---

## 3. Adım Adım Entegrasyon Süreci

### Adım 1: Host Uygulama Hazırlığı ve Navigasyon
* Uygulamanın modern ve çok sayfalı bir yapıya sahip olması için `@react-navigation/bottom-tabs` kullanıldı.
* `HomeScreen`, `ProjectsScreen` ve `SettingsScreen` gibi ekranlar oluşturularak `App.tsx` içinde bir `NavigationContainer`'a bağlandı.
* **Kritik Nokta:** `ProposalFAB` bileşenimiz `NavigationContainer`'ın **dışına** yerleştirildi. Böylece ekran geçişlerinden etkilenmeden her zaman en üstte (overlay) kaldı.

### Adım 2: Floating Action Button (FAB) ve Seçim Modu (Inspector)
* Sağ altta duran FAB bileşenine tıklandığında doğrudan form açılmak yerine uygulama **"Seçim Moduna"** geçecek şekilde tasarlandı.
* Ekrana şeffaf bir katman (`rgba(0,0,0,0.15)`) serildi.
* **PanResponder Entegrasyonu:** Kullanıcının ekrana dokunduğu ilk an (`onPanResponderGrant`) ve parmağını sürüklediği anlar (`onPanResponderMove`) takip edilerek ekranda **kırmızı bir seçim kutusu (Bounding Box)** çizdirildi.
* Kullanıcı parmağını çektiğinde (`onPanResponderRelease`) seçilen alanın başlangıç (X, Y) ve boyut (Genişlik, Yükseklik) koordinatları yakalandı.

### Adım 3: Ekran Görüntüsü Yakalama (Burn-in)
* Seçim işlemi biter bitmez (kırmızı kutu ekrandayken), `react-native-view-shot` kütüphanesinin `captureScreen` metodu tetiklendi.
* Görüntü fiziksel bir dosya yerine doğrudan **Base64 string** olarak belleğe alındı. Bu, dosya izinleri ve asenkron IO işlemlerinden kaynaklı gecikmeleri ortadan kaldırdı.

### Adım 4: Form Arayüzü (ProposalModal)
* Yakalanan koordinatlar ve ekran görüntüsü, kullanıcıdan "Başlık" ve "Açıklama" alacağımız `ProposalModal` formuna prop olarak aktarıldı.
* Form içinde `Image` bileşeni kullanılarak çekilen ekran görüntüsünün (`data:image/jpeg;base64,...`) mini bir önizlemesi kullanıcıya gösterildi.

### Adım 5: Belge Üretimi ve Dışa Aktarım (fileManager.ts)
Bu sistemin en karmaşık kısmı verilerin dosyaya dönüştürülmesidir. İki farklı çıktı desteklenmektedir:

**A. Markdown Çıktısı (.md)**
* Metinler standart Markdown başlıkları (`#`, `**`) ile birleştirildi.
* Base64 formatındaki ekran görüntüsü, standart resim gömme sözdizimi ile (`![Resim](data:image/jpeg;base64,...)`) metnin sonuna eklendi.
* `expo-file-system/legacy` kullanılarak geçici belleğe yazıldı ve paylaşıma açıldı.

**B. Word Çıktısı (.docx) ve Buffer Çözümü**
* `docx` kütüphanesi kullanılarak profesyonel bir Microsoft Word hiyerarşisi (Heading_1, TextRun vb.) kuruldu.
* **Karşılaşılan Sorun & Çözüm:** React Native'in yerleşik bellek yönetimi (Buffer), Base64 formatındaki büyük ekran görüntülerini Word'e yazarken bozabiliyordu. 
* Çözüm olarak `base64-js` kütüphanesi entegre edildi. Base64 metni içindeki olası boşluklar (`replace(/\s/g, '')`) temizlendi ve `base64js.toByteArray()` ile saf bir `Uint8Array` byte dizisine dönüştürüldü. Ayrıca resmin formatını sabitlemek için `ImageRun` içine açıkça `type: 'jpg'` tanımlaması yapıldı.

---

## 4. Sonuç ve Kullanım Alanı
Bu modül sayesinde:
1. Son kullanıcı, uygulamanın bozuk olan yerine doğrudan dokunup işaretleyebilir.
2. Arkaplanda sistem hatanın nerede olduğunu, ekranın nasıl göründüğünü saniyeler içinde yakalar.
3. Çıktı bir .md veya .docx dosyası olduğu için, bir Yapay Zeka ajanı (örneğin Cursor, Claude) bu dosyayı alıp **"Şu koordinatlardaki hatayı düzelt"** komutunu tam bağlamla anlayabilir. Backend sunucusuna, loglama araçlarına veya karmaşık API kurulumlarına ihtiyaç kalmaz.
