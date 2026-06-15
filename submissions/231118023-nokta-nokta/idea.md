# Nokta StoryForge - Senaryo ve Hikaye Kuluçka Asistanı

## 1. Fikir

Yazarlar, oyun tasarımcıları veya film yapımcıları akıllarına gelen ham bir sahne veya hikaye fikrini kaydederken genellikle detayları (karakter motivasyonu, evren kuralları, çatışma) eksik bırakırlar.

**StoryForge**, kullanıcının girdiği "ham fikri" alır, AI aracılığıyla dramatik yapıya uygun 4 kritik soru sorarak fikri genişletir ve günün sonunda tek sayfalık profesyonel bir **"Story Spec" (Hikaye/Senaryo Dokümanı)** üretir.

## 2. Kullanıcı Hikayesi (User Journey)

1. **Fikir Girişi (Dot):** Kullanıcı uygulamayı açar ve sohbet ekranına ham fikrini yazar. Örnek: _"Siber güvenlik uzmanı olan bir kadın, çalıştığı bankayı içeriden hackleyerek soyacak."_
2. **AI Genişletmesi (Enrich):** Nokta AI bu fikri alır ve yazara 4 adet "yapılandırıcı" soru sorar:
   - _Protagonist:_ Ana karakterin bankayı soymak için kişisel motivasyonu ne?
   - _Antagonist:_ Karşısındaki en büyük engel/kötü karakter kim?
   - _Setting:_ Bankanın bulunduğu şehir ve fiziksel güvenlik düzeyi nasıl?
   - _Twist:_ Hikayenin sonunda nasıl bir ters köşe olacak?
3. **Spec Üretimi:** Kullanıcı sorulara cevap verdikçe, uygulamanın "Doküman" sekmesinde profesyonel bir senaryo iskeleti (Story Spec) otomatik olarak oluşturulur. İstenirse bu kurgu manuel olarak veya AI ile sohbet ederek değiştirilebilir.
4. **(Hoop Uzman Devri):** Eğer kullanıcı teknik bir konuda tıkanırsa (Örn: "Bankaların sunucu odası güvenliği nasıldır?"), uygulamadaki **"Hoop: Uzman Görüşü Al"** butonuna basar. Sistem sahte bir görüntülü görüşme başlatır, ancak **arka planda Groq API hikayeye özel dinamik bir uzman tavsiyesi üretir**. Görüşme bitince bu tavsiye Story Spec dokümanına (Writeback) yedirilerek doküman baştan yazılır.
5. **Çoklu Proje:** Ana sayfadan (Hikayelerim) sınırsız sayıda yeni fikir/proje başlatılabilir.

## 3. Sistem Mimarisi

- **Frontend:** React Native + Expo
- **AI Katmanı:** Groq API (`llama-3.3-70b-versatile`) ile dinamik prompt mühendisliği.
- **Veri Saklama:** React State (Çoklu hikaye yönetimi)
- **Ekranlar:**
  - `Home Screen`: Hikayelerin listelendiği ana sayfa.
  - `Chat Screen`: Kullanıcının Nokta AI ile konuştuğu yer.
  - `Spec Screen`: Canlı olarak güncellenen ve manuel/sohbet ile düzenlenebilen Senaryo Dokümanı.
  - `Hoop Call Screen (Modal)`: Dinamik uzman tavsiyesi üreten görüşme simülasyonu.

## 4. Başarı Kriterleri

- Kullanıcının yazdığı metinleri alıp anlamlı sorular üretebilmesi.
- Verilen cevapların düzgün formatlanmış bir Markdown dokümanına (Spec) dönüşmesi.
- "Hoop Uzman" butonunun çalışması ve uzman tavsiyesinin Spec'e eklenmesi.
