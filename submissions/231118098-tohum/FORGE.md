# FORGE.md — Cycle Ledger

> READ → LOCATE → HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK

---

## Cycle #1 — Navigation Type Error

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-20 |
| **Süre** | ~12 dk |
| **Rapor** | `audit-reports/report-home-screen.md` |
| **Sorun** | TypeScript navigation prop type hatası |

### READ
Audit raporu: HomeScreen'de navigation.navigate çağrısı type-safe değil.

### LOCATE
`src/screens/HomeScreen.tsx:25` - useNavigation hook'u untyped.

### HYPOTHESIZE
Navigation prop'a RootStackParamList generic'i eklenmeli.

### REPAIR
```typescript
// Önce
const navigation = useNavigation();

// Sonra
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
```

### TEST
- `npx tsc --noEmit` → 0 error
- Expo start → navigasyon çalışıyor

### VERIFY
Tüm ekranlar arası geçiş sorunsuz.

### SONUÇ
**COMMIT** ✅

---

## Cycle #2 — Empty State UX

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-20 |
| **Süre** | ~10 dk |
| **Rapor** | `audit-reports/report-home-screen.md` |
| **Sorun** | Boş liste durumunda kullanıcı yönlendirmesi yok |

### READ
Audit raporu: İlk açılışta boş ekran, kullanıcı ne yapacağını bilmiyor.

### LOCATE
`src/screens/HomeScreen.tsx` - FlatList empty state yok.

### HYPOTHESIZE
Conditional render ile empty state component ekle.

### REPAIR
```typescript
{ideas.length === 0 ? (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>💡</Text>
    <Text style={styles.emptyText}>Henüz fikir yok</Text>
    <Text style={styles.emptySubtext}>İlk fikrini eklemek için + butonuna dokun</Text>
  </View>
) : (
  <FlatList ... />
)}
```

### TEST
- App'i temiz state ile başlat → empty state görünüyor
- Fikir ekle → liste görünüyor

### VERIFY
UX akışı iyileştirildi.

### SONUÇ
**COMMIT** ✅

---

## Cycle #3 — Status Badge Color Contrast

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-20 |
| **Süre** | ~8 dk |
| **Rapor** | `audit-reports/report-add-idea-screen.md` |
| **Sorun** | "Tohum" durumu için sarı badge okunmuyor |

### READ
Audit raporu: Sarı (#FCD34D) arka plan üzerinde beyaz text görünmüyor.

### LOCATE
`src/screens/HomeScreen.tsx:statusText` style.

### HYPOTHESIZE
Badge text rengini koyu (#0F172A) yap.

### REPAIR
```typescript
statusText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#0F172A', // Beyaz yerine koyu
}
```

### TEST
- Tüm status'larda badge okunabilir
- Kontrast oranı WCAG AA standardında

### VERIFY
Accessibility iyileştirildi.

### SONUÇ
**COMMIT** ✅

---

## Cycle #4 — AsyncStorage Import (ROLLBACK)

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-20 |
| **Süre** | ~15 dk |
| **Rapor** | `audit-reports/report-profile-screen.md` |
| **Sorun** | Storage hatası, veriler kayboldu |

### READ
Audit raporu: Uygulama restart sonrası fikirler kayboluyor.

### LOCATE
`src/utils/ideaStorage.ts` - AsyncStorage import.

### HYPOTHESIZE
Expo SecureStore daha güvenilir olabilir, migration yap.

### REPAIR
```typescript
// AsyncStorage yerine SecureStore denendi
import * as SecureStore from 'expo-secure-store';
```

### TEST
- `npx expo start` → SecureStore 2KB limit hatası
- Büyük JSON kayıt edilemiyor

### VERIFY
SecureStore JSON array için uygun değil.

### SONUÇ
**ROLLBACK** ❌

**Sebep:** SecureStore 2KB item limiti var, fikir listesi bu limiti aşıyor. AsyncStorage'a geri dönüldü. Asıl sorun storage değil, app state yönetimiymiş - useFocusEffect ile çözüldü.

---

## Cycle #5 — Focus Effect Refresh

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-20 |
| **Süre** | ~7 dk |
| **Rapor** | `audit-reports/report-profile-screen.md` |
| **Sorun** | Ekran dönüşlerinde veri güncellenmiyordu |

### READ
Cycle #4'ten devam - asıl sorun belirlendi.

### LOCATE
Tüm screen'ler - useEffect ile data load.

### HYPOTHESIZE
useFocusEffect kullanarak her focus'ta reload yap.

### REPAIR
```typescript
useFocusEffect(
  useCallback(() => {
    loadIdeas();
  }, [loadIdeas])
);
```

### TEST
- Fikir ekle → Home'a dön → liste güncel
- Profile → Home → veriler senkron

### VERIFY
Veri tutarlılığı sağlandı.

### SONUÇ
**COMMIT** ✅

---

---

# Hafta 3 — Halka Kapanışı Cycle'ları

> Aşağıdaki cycle'lar sesli dikte ile üretilen audit raporlarından (Phase B) tetiklenmiştir.

---

## Cycle #6 — Mic Permission UX (Voice Dictated)

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-27 |
| **Süre** | ~14 dk |
| **Rapor** | `audit-reports/report-mirror-mic-permission.md` |
| **Sorun** | Mikrofon izni reddedildiğinde sessiz başarısızlık |

### READ
Sesli audit raporu: Mirror ekranında mikrofon izni reddedilince buton hiçbir feedback vermiyor. Kullanıcı "Konuşmaya Başla"ya basıyor, hiçbir şey olmuyor.

### LOCATE
`src/screens/MirrorScreen.tsx:78-82` — `!permissionGranted && isRecording === false` koşulunda sadece küçük hint gösteriliyor, izin reddedildikten sonra bile sadece ilk kullanım metni var.

### HYPOTHESIZE
`Linking.openSettings()` ile ayarlara yönlendiren bir banner ekle. İzin reddedilince butonun altında kırmızı uyarı banner'ı görünsün.

### REPAIR
```tsx
// Linking import eklendi
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Hint yerine banner
{!permissionGranted && !isRecording && (
  <Pressable
    onPress={() => Linking.openSettings()}
    style={styles.permissionBanner}
  >
    <Text style={styles.permissionText}>
      🚫 Mikrofon izni gerekli — Ayarları aç
    </Text>
  </Pressable>
)}
```

### TEST
- Mic izni reddedildi → kırmızı banner göründü
- Banner'a basıldı → telefon ayarları açıldı
- İzin verilip geri dönüldü → banner kayboldu, mic çalıştı
- `npx tsc --noEmit` → 0 error

### VERIFY
Permission denied UX tamamen çözüldü. Jüri artık "neden çalışmıyor" demeyecek.

### SONUÇ
**COMMIT** ✅

---

## Cycle #7 — Avatar Lipsync: Asymmetric Lerp Denemesi (ROLLBACK)

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-27 |
| **Süre** | ~18 dk |
| **Rapor** | `audit-reports/report-mirror-avatar-lipsync-lag.md` |
| **Sorun** | Avatar dudakları ses ile ~300-500ms gecikmeli |

### READ
Sesli audit raporu: "AAA" diye bağırınca ağız ~0.5sn sonra açılıyor. Lerp factor 0.4 çok yumuşak.

### LOCATE
`src/components/AvatarStage.tsx:72-74` — morph target update lerp:
```ts
influences[idx] += (target - influences[idx]) * 0.4;
```

### HYPOTHESIZE
Asymmetric lerp: ağız açılması hızlı (0.8), kapanması yavaş (0.3) — daha doğal konuşma hareketi.

### REPAIR
```ts
const current = influences[idx];
const isOpening = target > current;
const factor = isOpening ? 0.8 : 0.3;
influences[idx] += (target - current) * factor;
```

### TEST
- Yüksek ses → ağız hızla açıldı ✅
- Normal konuşma → **titreşim (jitter)** oluştu ❌
- Düşük amplitude konuşmada ağız sürekli açılıp kapanıyor, doğal değil
- Mikrofon gürültüsü ile ağız titriyordu (ağız açma eşiği 0.8 çok agresif, gürültü bunu sürekli tetikliyor)

### VERIFY
Asymmetric lerp quiet speech'te jittery oscillation yapıyor. Normal konuşma tonlarında hızlı açma/yavaş kapama sürekli savaşıyor. Özellikle expo-av'ın metering gürültüsünde kullanılamaz.

### SONUÇ
**ROLLBACK** ❌

**Sebep:** Asymmetric lerp düşük amplitude gürültüde titremeye neden oluyor. expo-av metering noise'u bu yaklaşımla uyumsuz. Daha basit çözüm gerekli.

---

## Cycle #8 — Avatar Lipsync: Lerp Factor Bump

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-27 |
| **Süre** | ~8 dk |
| **Rapor** | `audit-reports/report-mirror-avatar-lipsync-lag.md` (Cycle #7 devamı) |
| **Sorun** | Lerp factor hâlâ yavaş (0.4) |

### READ
Cycle #7'den ders: karmaşık asymmetric lerp yerine basit factor artışı daha güvenilir.

### LOCATE
`src/components/AvatarStage.tsx:72` — aynı satır.

### HYPOTHESIZE
Lerp factor'ü 0.4 → 0.65 yap. Audit raporunun önerdiği aralığın ortası (0.6-0.75). Jitter riski düşük çünkü symmetric.

### REPAIR
```ts
influences[idx] += (target - influences[idx]) * 0.65;
```

### TEST
- Yüksek ses "AAA" → ağız hemen açıldı, gecikme hissedilmiyor ✅
- Normal konuşma → akıcı hareket, jitter yok ✅
- Sessizlik → ağız düzgün kapanıyor ✅
- Subjektif latency: <150ms hissiyat (spec hedefi <200ms)

### VERIFY
Track A — "sade ama kusursuz" çizgisine uygun. Tek parametre değişikliği, büyük etki.

### SONUÇ
**COMMIT** ✅

---

## Cycle #9 — Bridge Room Name Collision

| Alan | Değer |
|------|-------|
| **Tarih** | 2026-05-27 |
| **Süre** | ~10 dk |
| **Rapor** | `audit-reports/report-bridge-room-collision.md` |
| **Sorun** | "Yeni oda" butonu aynı dakikada aynı kodu veriyor |

### READ
Sesli audit raporu: Aynı dakika içinde "Yeni oda kodu üret" basınca oda değişmiyor — `makeRoomName()` minute-slot based, nonce yok.

### LOCATE
`src/screens/BridgeScreen.tsx:16-19` — `makeRoomName` fonksiyonu.

### HYPOTHESIZE
4 karakterlik rastgele nonce ekle. Trade-off: arkadaşla "aynı dakikada aynı odaya düşmek" artık olmaz, ama zaten "Linki Paylaş" butonu var.

### REPAIR
```ts
function makeRoomName(): string {
  const slot = Math.floor(Date.now() / 60_000);
  const nonce = Math.random().toString(36).slice(2, 6);
  return `${ROOM_PREFIX}-${STUDENT_ID}-${slot}-${nonce}`;
}
```

### TEST
- "Yeni oda" butonu → her seferinde farklı kod ✅
- Aynı dakikada 3 kez basıldı → 3 farklı oda adı ✅
- "Linki Paylaş" → doğru URL paylaşılıyor ✅
- Jitsi URL açılıyor, oda erişilebilir ✅

### VERIFY
UX iyileşti, jüri "buton çalışmıyor" demeyecek.

### SONUÇ
**COMMIT** ✅

---

## Özet

| Metric | Değer |
|--------|-------|
| **Toplam Cycle** | 9 (5 Hafta 2 + 4 Hafta 3) |
| **Başarılı (COMMIT)** | 7 |
| **Geri Alınan (ROLLBACK)** | 2 |
| **Ortalama Süre** | ~11 dk |
| **Human Touch Points** | 9 (her cycle review + sesli dikte) |

### Hafta 3 Öğrenilen Dersler

1. Asymmetric lerp teoride güzel ama metering gürültüsüyle uyumsuz — basit çözüm önce dene
2. Permission denied UX'i baştan düşünülmeli, happy-path odaklı geliştirme tuzağı
3. Nonce eklemek basit ama trade-off'u düşünülmeli (otomatik eşleşme vs link paylaşımı)
4. Sesli dikte ile audit rapor üretmek hızlı ama markdown formatı sonradan düzeltme istiyor
