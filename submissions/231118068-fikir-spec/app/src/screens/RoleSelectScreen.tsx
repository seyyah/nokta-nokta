import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'RoleSelect'>;
};

export default function RoleSelectScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.title}>NOKTA</Text>
          <Text style={styles.subtitle}>Fikir Yakalama ve Geliştirme</Text>
        </View>

        <Text style={styles.prompt}>Nasıl giriş yapmak istiyorsun?</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.85}
        >
          <Text style={styles.cardIcon}>💡</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Kullanıcı Olarak Gir</Text>
            <Text style={styles.cardSub}>Fikir yaz, spec üret, uzman desteği al</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardExpert]}
          onPress={() => navigation.navigate('ExpertLogin')}
          activeOpacity={0.85}
        >
          <Text style={styles.cardIcon}>👨‍💼</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Uzman Olarak Gir</Text>
            <Text style={styles.cardSub}>Gelen mesajları gör, cevap ver</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, justifyContent: 'center', padding: 24, gap: 20 },
  header: { alignItems: 'center', marginBottom: 16 },
  dot: { fontSize: 64, color: '#6c47ff', lineHeight: 64 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 6 },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4, letterSpacing: 2 },
  prompt: { color: '#aaa', fontSize: 15, textAlign: 'center' },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardExpert: { borderColor: '#6c47ff40' },
  cardIcon: { fontSize: 32 },
  cardText: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardSub: { color: '#888', fontSize: 13, marginTop: 3 },
  arrow: { color: '#6c47ff', fontSize: 24 },
});
