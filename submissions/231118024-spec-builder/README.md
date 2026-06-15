Track: C

# Nokta AI: Dot-to-Spec Engine

> **Öğrenci No:** 231118024  
> **Slug:** spec-builder  
> **AI Aracı:** Antigravity

## Human Touch Points (İnsan Müdahalesi)
Sisteme widget üzerinden sesli dikte ile 3 kez hata raporu girdim (müşteri rolü). 3D modelin T-Pose'dan animasyonlu modele geçişinde ve arayüzdeki iOS çentik hizalama sorunlarında ajana kaba kuvvet (brute-force) düzeltme yönlendirmesi yaptım. Toplam müdahale: 5

## Decision Log (Forge & Ratchet Disiplini)
Nokta-forge onarım ocağı, uygulamanın yaşam döngüsü boyunca karşılaşılan teknik borçları ve hataları otonom olarak iyileştiren bir 'Self-Healing' mekanizmasıdır. Bu sistem, Karpathy-style 'Ratchet' disiplini üzerine kurulu olup, her onarımın sistemi daha ileriye taşımasını ve geriye doğru bozulmamasını (rollback güvenliği) hedefler. Geliştirme sürecinde `nokta-audit` widget'ı üzerinden toplanan 'cevherler' (hata raporları), ajan tarafından `READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT` zinciriyle titizlikle işlenmiştir. 

Özellikle Cycle 3 ve 4 aşamalarında, sistemin hata yapma ve ondan öğrenme kabiliyetini test etmek amacıyla kasıtlı bir ROLLBACK senaryosu işletilmiştir: Tip güvenliği (null-guard) eklenmeden yapılan zorunlu tip ataması TypeScript derlemesinde yakalanmış, Ratchet disiplini gereği kod otomatik olarak eski kararlı haline döndürülmüştür. Ardından doğru null-guard kontrolü eklenerek kalıcı onarım sağlanmıştır. Bu 'Müşterinin Geliştirici Olduğu Hafta' konsepti, yazılımın sadece son kullanıcı için değil, bakım ve onarım süreçleri için de otonom bir ekosisteme dönüştüğünü kanıtlamaktadır. Cycle 1'deki negatif margin kaynaklı UI kaymalarından, Cycle 5'teki tema uyumsuzluğu kaynaklı siyah arka plan kusurlarına kadar her aşama, otonom bir araştırma ve onarım başarısıdır.

Bu final aşamasında sistemin hata yapma ve ondan öğrenme kabiliyeti **Track C otonomisine** taşınmıştır. Otonom ajan, üst üste 2 kez FAIL/ROLLBACK durumuyla karşılaştığında bunu bir "STUCK" (tıkanma) heuristiği olarak algılamış, inisiyatif alarak Jitsi altyapısı üzerinden WebRTC uzman köprüsünü otonom olarak kurmuştur. Uzman tavsiyesi `BRIDGE.md`'ye aktarılarak bir sonraki onarım döngüsüne bağlam olarak beslenmiştir.

---

## 🎯 Proje Vizyonu ve Mimari (Executive Summary)

Nokta AI, sıradan bir "LLM Wrapper" olmanın çok ötesinde, fikirlerin mühendislik spesifikasyonlarına dönüşümünü **Zero-Trust (Sıfır Güven)** and **Dumb Client (Aptal İstemci)** prensipleriyle yöneten uçtan uca bir mimaridir. Akış dört ana bileşenden oluşur:

1. **PII Edge Guardrail:** Mobil istemciden gelen tüm ham veri, doğrudan dil modeline (LLM) gitmeden önce bu kalkan tarafından preslenir. "TC Kimlik", "Apple", "Amazon" gibi önceden tanımlanmış kısıtlı kelimeler (PII ve yasaklı entity'ler) tespit edilirse, sistem otonom olarak alarm üretir.
2. **Hoop Decision Engine (Karar Motoru):** PII skorlamasına dayalı olarak trafiği iki farklı kanala yönlendirir:
   * **HOOTL (Human-Out-Of-The-Loop):** Risk tespit edilmezse, süreç tam otonom işler.
   * **HITL (Human-In-The-Loop):** Yüksek risk (CRITICAL) tespit edilirse, süreç Veri Gizlilik Uzmanına (DPO) bilet olarak düşer.
3. **Spec Engine (Clean Room LLM):** PII temizliğinden veya DPO onayından geçmiş güvenli metni Groq API (Llama-3) üzerinden işler. Structured Output moduyla, doğrudan mühendislik spesifikasyonları döner.
4. **Voice & Autonomous Agent Layer (Track C):** Sistemin ön yüzü, <200ms gecikmeli gerçek zamanlı dudak senkronizasyonu (Lipsync) yapabilen 3D bir Avatar ve Reanimated tabanlı ses görselleştirici ile donatılmıştır. Kullanıcılar arayüzdeki hataları sesli dikte ile bildirebilir ve ajan bu raporları kendi onarım döngüsünde işler.

---

## 🚀 Kurulum ve Çalıştırma

### 1. Backend (Node.js) Servisi
```bash
cd backend
npm install
npx ts-node src/server.ts


```
*Sunucu çalıştığında DPO konsoluna `http://localhost:3000` adresinden ulaşabilirsiniz.*

### 2. Frontend (Expo / React Native)
```bash
cd app
npm install
npm run start
```

---

🔗 Demo Video: [[Demo](https://youtube.com/shorts/dC3973E4iBo?si=O9woOD_PfoaLCOcQ)]
📦 APK Çıktısı: `app-release-final.apk` klasörde mevcut
- **Expo QR / Yayın Bağlantısı:** [https://expo.dev/accounts/begummmm/projects/nokta/builds/dd750374-e808-4957-874a-c60a37675bcd]