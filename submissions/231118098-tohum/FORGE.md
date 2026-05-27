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

## Özet

| Metric | Değer |
|--------|-------|
| **Toplam Cycle** | 5 |
| **Başarılı (COMMIT)** | 4 |
| **Geri Alınan (ROLLBACK)** | 1 |
| **Ortalama Süre** | ~10 dk |
| **Human Touch Points** | 5 (her cycle review) |

### Öğrenilen Dersler

1. SecureStore büyük veriler için uygun değil
2. Navigation typing proaktif yapılmalı
3. useFocusEffect data freshness için kritik
4. Accessibility (contrast) baştan düşünülmeli
