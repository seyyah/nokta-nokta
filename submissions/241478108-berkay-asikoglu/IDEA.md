# IDEA.md — Müşteri-Geliştirici Use Case'i

## "Nokta Ağı"nda Keşfettiğim: Müşteri Aynı Zamanda Geliştirici

### Use Case

Nokta, bir fikri en küçük "nokta"ndan (tek bir kelime) başlatarak AI destekli bir ürün spec'ine dönüştüren bir mobil uygulama. Kullanıcı (genellikle bir PM, kurucu veya solo geliştirici) telefonunda yürüyüş yaparken veya kahve molasında bir fikir flash'ı yaşar: "Acaba ikinci el araba + yapay zeka + pazaryeri birleşimi bir şey çıkar mı?" Elindeki şey telefon; bilgisayar değil. Nokta'ya girer, "araba" yazar, AI ilişkili kavramları (galeri, ekspertiz, satış) grafik olarak sunar. Birkaç tane daha bağlar; sistem bunları bir ürün hipotezine döker.

### Müşteri = Geliştirici Rol Birliği

Ama işte kritik nokta: bu kullanıcı aynı zamanda uygulamanın geliştiricisi. Nokta'yı kullanan kişi, uygulamanın sahibi. Başka birinin raporlayıp başkasının fixlemesini bekleyecek bir QA ekibi yok. "Keşke burada arşivleme olsa", "Keşke burada sıralama olsa" dediği an, aynı anda bir feature request üretiyor. Ve bu request'in kod tabanına yansımasını bekleyecek bir sprint board'u da yok.

nokta-audit + nokta-forge bu boşluğu kapatır: kullanıcı (müşteri rolünde) uygulamada bir eksiklik veya aksaklık görür → FAB'a dokunur → ekranı yakalar → sarı kutuyla işaretler → not düşer → `.md` export alır. Aynı gece (veya aynı oturumda) bu `.md` raporunu bir coding agent'a (Groq, Gemini, Claude Code) verir → agent `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT` döngüsünü koşturur → sabahleyin (veya birkaç dakika sonra) geliştirici (artık geliştirici rolünde) PR'ı review eder ve merge eder.

### Fark Ettiğim Şey

Klasik "müşteri issue açar → geliştirici backlog'a alır → sprint'e sokar → fix yapar → test eder → deploy eder" zincirini radikal şekilde kısaltan şey, **raporun formatıdır**. Markdown + burn-in screenshot, agent'ın ihtiyaç duyduğu her şeyi tek bir artifact'ta taşır: görsel kanıt (nerede), doğal dil not (ne isteniyor), ekran adı (hangi dosya). Agent "ne olduğunu anlamak" için zaman harcamaz; doğrudan "nasıl çözeceğini" düşünür.

Web-Audit'te (ParzivalSANN/Web-Audit) bu döngüyü web'de Cypress ile kurmuştuk. Mobilde ise nokta-audit'in drop-in widget'ı + nokta-forge'un ratchet disiplini ile aynı loop, ama backend'siz, hesapsız, telemetrisiz. Host uygulamanın kendi içinde başlayıp host uygulamanın kendi paylaşım kanallarında bitiyor.

### Somut Örnek: Cycle 1 (Swipe-to-Archive)

Kullanıcı CaptureScreen'de 12 nöron oluşturmuş. "Bunlardan birini silmek için tüm akışı baştan mı geçmeliyim?" diye düşünüyor. FAB'a dokunuyor, nodes alanını sarı kutuyla işaretliyor, not düşüyor: "sağa sürükleyince arşivleme çıksa". Rapor export ediliyor. Groq API agent'ı raporu okuyor, `CaptureScreen.js`'i locate ediyor, `onNodeLongPress` hipotezi kuruyor, minimal değişiklik uyguluyor, lint + metro testi geçiyor, commit atıyor. İnsan sadece review ediyor.

Bu, solo girişimci veya küçük ekip için anlamı net: bir UX bug'ı görüp not düştükten sonra onarımın büyük kısmı gece çalışan bir agent tarafından kapatılabilir; sabah geliştirici sadece review eder.
