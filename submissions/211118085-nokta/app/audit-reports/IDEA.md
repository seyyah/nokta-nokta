# IDEA.md — Müşteri-Geliştirici Use Case

## Nokta'da Keşfedilen Kompozisyon

Nokta uygulaması kullanıcısı alışılmadık bir roldedir: kendi fikrini sisteme sorar, 4 departmandan analiz alır, kurumsal karar üretir. Bu akış sırasında kullanıcı hem ürünün müşterisi hem de ürünün test edicisidir. Bir buton yanlış yerde, bir metin taşmış, bir kart okunaksız — bu hataları en erken gören kişi uygulamayı aktif kullanan kişidir. nokta-audit bu anı yakalar: FAB'a tek dokunuş, ekran görüntüsü, sarı burn-in kutusu, doğal dil notu. Rapor üretilir, paylaşılır, agent'a verilir.

## Neden Bu Kompozisyon Değerli

Klasik bug raporlama döngüsünde müşteri ile geliştirici ayrı kişilerdir: müşteri sorunu bildirir, geliştirici backlog'a alır, sprint'e sokar, fix yapar. Nokta'da bu iki rol tek kişide birleşir — kullanıcı hem sorunu görür hem raporlar hem de (OpenCode aracılığıyla) fix'i tetikler. Agent `.md` raporunu okur, `App.js`'de ilgili bileşeni bulur, fix uygular, commit atar. İnsan sadece review eder. Bu "müşterinin geliştirici olduğu hafta"nın somut ve çalışır bir örneğidir: fikir analizi yapan bir uygulamada UX hatası yakalamak, aynı zamanda o uygulamayı geliştirmek demektir.