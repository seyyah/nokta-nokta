import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const ALL_IDEAS = [
  { id: '1', title: 'Sessiz Alarm', tag: 'Yaşam', votes: 142, desc: 'Titreşimle uyandırma.' },
  { id: '2', title: 'Kitap Takas Haritası', tag: 'Topluluk', votes: 87, desc: 'Yakınlardaki kitap takasları.' },
  { id: '3', title: 'Nefes Antrenmanı', tag: 'Sağlık', votes: 214, desc: 'Günlük nefes egzersizi hatırlatıcısı.' },
  { id: '4', title: 'Alışveriş Karbon Sayacı', tag: 'Çevre', votes: 56, desc: 'Sepetteki ürünlerin karbon ayak izi.' },
  { id: '5', title: 'Mahalle Duyuru Panosu', tag: 'Topluluk', votes: 99, desc: 'Hiperlokal duyuru akışı.' },
  { id: '6', title: 'Ofis Gürültü Haritası', tag: 'Çalışma', votes: 33, desc: 'Sakin çalışma alanı bul.' },
];

export default function IdeaListScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = ALL_IDEAS.filter(i =>
    i.title.toLowerCase().includes(query.toLowerCase()) ||
    i.tag.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Fikir ara…"
          placeholderTextColor="#555"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/idea/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.row}>
              <Text style={styles.tag}>{item.tag}</Text>
              <Text style={styles.votes}>▲ {item.votes}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  searchRow: { padding: 16, paddingBottom: 8 },
  search: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f5f0e8',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  list: { padding: 16, paddingBottom: 120 },
  card: { backgroundColor: '#161616', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tag: { fontSize: 10, color: '#c8a96e', fontWeight: '700', letterSpacing: 1 },
  votes: { fontSize: 11, color: '#666' },
  title: { fontSize: 17, fontWeight: '700', color: '#f5f0e8', marginBottom: 4 },
  desc: { fontSize: 13, color: '#888', lineHeight: 18 },
  sep: { height: 10 },
});
