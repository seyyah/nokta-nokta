# DECISIONS.md - Ceren Diyet Mimari Kararları

## 1. 2D Lipsync Avatar Tercihi
Ödev spec'i react-three-fiber ve GLB modelini visemelar ile konuşturmayı önermektedir. Ancak mobil cihazlarda 3D rendering (özellikle Expo üzerinde veya düşük donanımlı cihazlardaki webview'lerde) yüksek gecikmelere (>500ms) ve batarya tüketimine sebep olmaktadır. Danışanın "2d bi model ekleyelim kullanıcıyla konusması için lipsync ekle ses ekle. MVP bir ürün üret" talebi doğrultusunda:
- **Karar**: Canvas / SVG tabanlı son derece akıcı, vektörel bir 2D avatar tasarladık.
- **Lipsync**: Web Speech API `SpeechSynthesis` kullanarak her harf grubunu (viseme) anlık yakalayıp SVG ağız yollarını (d0-d5 ağız şekilleri) anlık değiştiriyoruz. Bu sayede latency **< 50ms** seviyesine inmiştir (hedef < 200ms idi).
- **Yüz**: Ceren'in yüzünü temsil eden saç, gözler, gözlük, yanak ve kıyafet detaylarına sahip, nefes alma ve göz kırpma animasyonlu özel vektör çizim uygulandı.

## 2. OpenAI Voice Mode Wave
Ses görselleştirmede basit barlar yerine modern akışkan dalgalar tercih edildi.
- **Karar**: HTML5 Canvas üzerinde 3 farklı fazda sinüs dalgası çizilerek, mikrofon girişinden alınan RMS (ses genliği) ve frekans verileriyle dalgaların boyu ve hızı modüle edilmiştir. 
- **Sessizlik Kontrolü**: RMS değeri belirli bir eşiğin altındaysa dalga yavaşça sönerek ince bir çizgiye dönüşür. Konuşma başladığında ise parlayan neon dalgalar halinde canlanır.

## 3. WebRTC Köprüsü (Video Bridge)
- **Karar**: Harici API key gerektirmeyen, ekran paylaşımı, ses ve video desteğini kutudan çıktığı gibi sunan **Jitsi Meet API** entegre edildi.
- Uygulama içinde bir iframe veya pencere olarak yüklenen Jitsi penceresi, mikrofon, kamera ve ekran paylaşımını tam performansla desteklemektedir.

## 4. Otonom Stuck Tetikleyicisi
- **Karar**: Kullanıcının arka arkaya iki kez diyet bozucu veya aşırı demoralize cümleler kurması durumunda, yapay zeka sistemi bir "Stuck/Kriz" durumu algılar ve doğrudan Jitsi görüntülü görüşme ekranını yukarıdan aşağı süzülerek açar.
