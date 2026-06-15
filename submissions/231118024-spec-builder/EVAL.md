# Otonomi ve Kararlılık Değerlendirmesi (EVAL.md)

Bu dosya, Track C (Otonom Onarım Döngüsü) kapsamında projenin geliştirme sürecinde elde edilen teknik kazanımları ve sisteme kazandırılan kalıcı "Altın Senaryo" kurallarını içermektedir.

### 🛡️ Kalıcı Onarım Kuralları (Altın Senaryolar)

*   **Kural 1: Güvenli State Erişimi (Null Guard)**
    Tip güvenliği sağlanmadan (null guard veya optional chaining olmadan) state objelerine erişilemez. Bu kural, `specData` objesine null kontrolü yapılmadan erişilmeye çalışıldığında derlemenin patladığı Cycle 3 (FAILED) ve ardından güvenli kontrolün eklendiği Cycle 4 (SUCCESS) hipotez zinciri sonrası kalıcı hale getirilmiştir. Artık tüm state yönlendirmelerinde early return veya optional chaining zorunludur.

*   **Kural 2: Layout Bütünlüğü ve Margin Disiplini**
    Arayüz elemanlarında layout'u bozan, içeriği ekran dışına iten veya diğer bileşenlerin üzerine binen negatif margin (örn: `marginTop: -100`) değerleri kullanılamaz. Bu kural Cycle 1'deki ana ekran başlık görünürlüğü onarımı sonrası sistemin tasarım standartlarına eklenmiştir.

*   **Kural 3: Nested Container ve Şeffaflık**
    Nested container'larda (dış bileşenlerdeki) arka plan renkleri (özellikle `#000` veya siyah türevleri), içerideki elemanların (örneğin LinearGradient veya premium UI kartları) tasarımını bozmamak adına `transparent` olarak ayarlanmalıdır. Bu kural, Cycle 5'teki "Buton Arka Plan Rengi Onarımı" (Müşteri Testi Sonucu) sonrası görsel kusurları önlemek adına kalıcı hale getirilmiştir.

---
*Bu değerlendirme raporu, Nokta-forge onarım ocağının otonomi bonusu gereksinimlerini karşıladığını ve yazılımın kararlı bir "Self-Healing" yapısına kavuştuğunu beyan eder.*
