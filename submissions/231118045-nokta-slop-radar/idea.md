# Nokta: Slop Radar (Due Diligence Ağı)

## 1. Vizyon
Slop Radar, "AI tarafından üretilmiş içi boş fikirler" (slop) ile "gerçekten üzerinde çalışılmış mühendislik harikaları" arasındaki çizgiyi çeken bir filtredir. Kullanıcıların veya yatırımcıların önüne gelen bir fikrin ne kadar gerçekçi olduğunu, teknik zorluklarını ve pazar uyumunu saniyeler içinde analiz eder.

## 📝 Decision Log
0. **Bonus Capability (+10):** "Share Audit Report" özelliği eklendi. Bu özellik sayesinde kullanıcılar 'slop-free' kanıtlarını yatırımcılarla veya takımlarıyla anında paylaşabilir.
1. **Track Seçimi:** Yatırımcı perspektifinden "due diligence" sürecini otomatize etmenin Nokta felsefesine en uygun (anti-slop) uygulama olduğunu düşünerek Track B seçildi.

## 2. Hedef Kitle
- **Melek Yatırımcılar:** Her gün gelen yüzlerce pitch deck arasından "slop" olanları ayıklamak isteyenler.
- **Solo-Girişimciler:** Kendi fikirlerinin "ayağı yere basıyor mu" yoksa "sadece bir hayal mi" olduğunu test etmek isteyenler.
- **Kurumsal İnovasyon Ekipleri:** İçerideki fikir havuzunu rasyonel bir süzgeçten geçirmek isteyen yöneticiler.

## 3. Temel Özellikler (MVP)
- **Pitch Girişi:** Serbest metin formatında fikir girişi.
- **Slop Score Analizi:** 0-100 arası bir puanlama (Yüksek puan = daha fazla 'slop' / boş laf).
- **Gerçeklik Kontrolü (Reality Check):** Fikrin neden imkansız veya neden çok zor olduğuna dair 3 ana madde.
- **Pazar Çakışması:** Mevcut rakiplerle kıyaslama ve pazar doygunluk analizi.
- **Kuluçka Kararı:** Eğer fikir sağlamsa (Slop Score < 30), "Nokta Kuluçka" sistemine geçiş önerisi.
- **Bonus Feature - Denetim Paylaşımı:** Analiz sonuçlarını (Score, Verdict, Reasoning) şık bir rapor halinde paylaşma özelliği (Plus +10 bonus capability).

## 4. Teknik Mimari
- **Frontend:** React Native + Expo (Modern, Dark Mode, Premium UI).
- **Backend/AI:** LLM tabanlı analiz motoru (Simüle edilmiş veya API bağlantılı).
- **Veri Yapısı:** Her analiz bir "Audit Artifact" olarak saklanır.

## 5. Slop Metrikleri
- **Jeneriklik Oranı:** "Dünyayı değiştireceğiz", "Yapay zeka ile devrim" gibi klişelerin yoğunluğu.
- **Teknik Spesifikasyon Eksikliği:** Mimari ve uygulama detaylarının ne kadar boş bırakıldığı.
- **Pazar Bilgisizliği:** Mevcut dev rakiplerin göz ardı edilip edilmediği.
