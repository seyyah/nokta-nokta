import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const FEATURED_IDEAS = [
  { id: '1', title: 'Sessiz Alarm', tag: 'Yaşam', votes: 142, hot: true },
  { id: '2', title: 'Kitap Takas Haritası', tag: 'Topluluk', votes: 87, hot: false },
  { id: '3', title: 'Nefes Antrenmanı', tag: 'Sağlık', votes: 214, hot: true },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>BUGÜNÜN FIRSATI</Text>
          <Text style={styles.heroTitle}>Aklındaki fikri{'\n'}nokta'ya düş.</Text>
          <TouchableOpacity style={styles.cta} onPress={() => router.push('/onboarding')}>
            <Text style={styles.ctaText}>Nasıl çalışır? →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Öne Çıkanlar</Text>

        {FEATURED_IDEAS.map((idea) => (
          <TouchableOpacity
            key={idea.id}
            style={styles.card}
            onPress={() => router.push(`/idea/${idea.id}`)}
            activeOpacity={0.82}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTag}>{idea.tag}</Text>
              {idea.hot && <Text style={styles.hotBadge}>🔥 Trend</Text>}
            </View>
            <Text style={styles.cardTitle}>{idea.title}</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.votes}>▲ {idea.votes}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.allIdeas} onPress={() => router.push('/ideas')}>
          <Text style={styles.allIdeasText}>Tüm Fikirleri Gör →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, paddingBottom: 120 },
  hero: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  heroLabel: { fontSize: 11, letterSpacing: 2, color: '#c8a96e', marginBottom: 8, fontWeight: '700' },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#f5f0e8', lineHeight: 36, marginBottom: 20 },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: '#c8a96e',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaText: { color: '#0f0f0f', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', letterSpacing: 1.5, marginBottom: 12 },
  card: {
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTag: { fontSize: 11, color: '#c8a96e', fontWeight: '700', letterSpacing: 1 },
  hotBadge: { fontSize: 11, color: '#ff6b35' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#f5f0e8', marginBottom: 12 },
  cardBottom: { flexDirection: 'row' },
  votes: { fontSize: 12, color: '#666' },
  allIdeas: { alignItems: 'center', marginTop: 8, paddingVertical: 16 },
  allIdeasText: { color: '#c8a96e', fontWeight: '700', fontSize: 14 },
});
