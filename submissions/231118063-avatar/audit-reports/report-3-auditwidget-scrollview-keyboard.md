# Audit Raporu — #3: AuditWidget Klavye Açılınca Kullanılamaz Hale Geliyor

**Tarih:** 2026-06-16  
**Rapor Eden:** 231118063  
**Faz:** Phase B — Kendi Müşterin (Self-as-User Forge)  
**Önem:** Orta-Yüksek (Phase B fonksiyonelliği etkileniyor)

---

## Sorun / Bulgu

AuditWidget'taki metin alanına dokunduğumda Android klavyesi açılıyor. Klavye açılınca ekranın alt yarısı kapanıyor ve **widget tamamen görünmez hale geliyor**. Yukarı kaydırmayı denediğimde sohbet geçmişi kayıyor ama widget'ın içindeki TextInput odağını kaybediyor. Raporu kaydetmek için üç-dört deneme gerekiyor.

## Adımlar (Reproduce)

1. Uygulamayı aç, ana ekrana gel.
2. Sohbet listesinin altına kadar kaydır.
3. AuditWidget'ın "Gördüğünüz hatayı açıklayın..." alanına dokun.
4. Android soft klavyesi açılır.
5. Widget klavyenin arkasına kayar, ScrollView yukarı zıplar, odak kırılır.

## Kök Neden Analizi

`index.tsx`'te `<AuditWidget />` bileşeni ana `<ScrollView>` içine, sohbet baloncuklarının hemen altına yerleştirilmiş:

```jsx
<ScrollView ...>
  {chat.map(...)}     {/* sohbet balonları */}
  {isLoading && ...}
  <AuditWidget />     {/* ← burada sorun */}
</ScrollView>
```

Android'de `ScrollView` içine gömülü `TextInput` bileşenlerinde klavye açılma davranışı tahmin edilemez hale geliyor: `ScrollView`, klavye için yer açmaya çalışırken hem içeriği hem odağı karıştırıyor.

## Önerilen Çözüm

`<AuditWidget />` `ScrollView`'ın **dışına** alınmalı; sohbet ScrollView'ı ile ses görselleştirici arasında bağımsız bir `<View>` içine yerleştirilmeli. Böylece klavye açıldığında sohbet bağımsız kayar, widget sabit kalır.

```jsx
</ScrollView>
<AuditWidget />          {/* ScrollView dışında, bağımsız */}
{/* Voice viz ve footer */}
```
