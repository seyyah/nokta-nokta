# Nokta Expert Support

AI destekli uzman mentor eşleştirme uygulaması. Kullanıcı bir problem yazar, Nokta Mascot analiz eder ve uygun uzmanı önerir. Uzman kabul edince gerçek zamanlı AI destekli mentor görüşmesi başlar.

## 📱 APK İndir

[APK'yı İndir](https://expo.dev/accounts/beyzaguldemirr/projects/nokta-expert-support/builds/40e57915-1441-4fff-baf1-cfc559e4675a)

> Android telefonda yüklemek için "Bilinmeyen kaynaklardan yükleme" iznini açmanız gerekebilir.

## Özellikler

- Anahtar kelime bazlı otomatik uzman eşleştirme (5 farklı alan)
- Groq API ile gerçek zamanlı AI mentor cevapları
- Escalation lifecycle: pending → accepted → resolved
- Oturum özeti oluşturma ve geçmiş kaydetme
- Offline-first mimari (AsyncStorage)

## Uzman Alanları

| Alan | Uzman |
|------|-------|
| Algoritma & Veri Yapıları | Burak Şahin |
| Startup & Ürün | Elif Demir |
| Yatırım & Finansman | Mert Kaya |
| Veritabanı & Backend | Ayşe Yıldız |
| Siber Güvenlik | Can Arslan |

## Teknolojiler

- **Expo** SDK 54 / React Native 0.81
- **TypeScript** strict mode
- **React Navigation** (Native Stack + Bottom Tabs)
- **Groq API** — llama-3.3-70b-versatile
- **AsyncStorage** — yerel veri saklama

## Kurulum

```bash
npm install
```

`.env` dosyası oluşturun:
```
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

```bash
npx expo start
```

> API key olmadan uygulama Demo Mod'da çalışır.
