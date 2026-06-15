# IDEA: Müşterinin Ortak Geliştirici (Co-Developer) Olduğu Senaryo

**Track B - Yaratıcılık**

Geleneksel hata bildirim araçları (Crashlytics, Sentry) veya geri bildirim formları genellikle teknik sorunları (çökmeler, UI kaymaları) raporlamak için tasarlanmıştır. Bu kompozisyonda fark ettiğimiz yeni "use case" ise **Müşterinin Geliştirici (Co-Developer) olarak konumlanmasıdır**.

Kullanıcı sadece bir hata bildirmiyor; uygulamanın arayüzünde eksik gördüğü bir işlevi (feature request) tam olarak nerede ve nasıl görmek istediğini fiziksel olarak çizerek (bounding box) belirtiyor. Örneğin, ana sayfada gezinirken "Burada doğrudan yeni proje oluşturma kısayolu olsa güzel olurdu" diyerek boş bir alanı işaretliyor. 

Bu sayede yapay zeka ajanı (Coding Agent), kullanıcının soyut "şuraya buton ekle" talebini, Nokta Audit'in sağladığı koordinat ve ekran görüntüsü (visual ground truth) bağlamıyla birleştirerek *tam olarak istenen noktaya*, *istenen işlevi* kodluyor. Müşteri, hiçbir kod yazmadan uygulamanın özellik setini doğrudan yönlendiren bir ürün yöneticisine ve geliştiriciye dönüşüyor.
