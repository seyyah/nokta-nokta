# IDEA.md — Müşterinin Geliştirici Olduğu Use Case

## Fikir: Hata Raporlama Yerine Otonom UX / UI İyileştirme Motoru

Audit widget'ının sadece kodsal mantık hatalarını (bug) değil, doğrudan tasarım ve kullanıcı deneyimi (UX) eleştirilerini iletmek için kullanılması. Gelen raporlarda "Bu butonun rengi hoş değil", "Sembol çok küçük kalmış" veya "Burası çok sade, gelişmesi lazım" gibi sübjektif tasarım talepleri yer alıyor. Normalde geliştiricinin bu tasarımları tek tek Figma'dan geçirip koda dökmesi gerekirdi.

Ancak bu kurguda Audit aracı, bir hata yakalama mekanizmasından ziyade bir **"Tasarım Stüdyosuna"** dönüşüyor. Müşterinin / testçinin ekrandan widget ile işaretlediği ve eleştirdiği arayüz parçaları, coding agent'a (Antigravity) gidiyor ve agent bir "UI Designer + Developer" gibi davranıp otonom olarak (dark mode, glassmorphism vb.) yepyeni görünümler önerip anında koda işliyor. Müşteri (kullanıcı) tasarım sürecine doğrudan şahitlik ediyor ve uygulamayı yönlendiriyor.
