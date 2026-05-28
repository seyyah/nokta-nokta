import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { EXPERTS } from '../data/experts';
import { loadMessages, saveMessages } from '../utils/messageStorage';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ExpertDetail'>;
  route: RouteProp<RootStackParamList, 'ExpertDetail'>;
};

export default function ExpertDetailScreen({ navigation, route }: Props) {
  const { expertId, spec } = route.params;
  const expert = EXPERTS.find((e) => e.id === expertId)!;
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!messageText.trim()) return;
    setSending(true);
    try {
      const msgs = await loadMessages();
      const now = new Date();
      const newMsg = {
        id: Date.now().toString(),
        expertId: expert.id,
        expertName: expert.name,
        userMessage: messageText.trim(),
        spec: spec ?? '',
        date: now.toLocaleDateString('tr-TR'),
        time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        replies: [],
        read: false,
      };
      await saveMessages([newMsg, ...msgs]);
      setMessageText('');
      Alert.alert('✅ Gönderildi', `${expert.name} en kısa sürede cevap verecek.`, [
        { text: 'Tamam', onPress: () => navigation.navigate('Experts', { spec }) },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.profileCard}>
          <Text style={styles.avatar}>{expert.avatar}</Text>
          <Text style={styles.name}>{expert.name}</Text>
          <Text style={styles.expertTitle}>{expert.title}</Text>
          <Text style={styles.company}>{expert.company}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {expert.rating}</Text>
              <Text style={styles.statLabel}>Puan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{expert.sessions}</Text>
              <Text style={styles.statLabel}>Oturum</Text>
            </View>
          </View>

          <Text style={styles.bio}>{expert.bio}</Text>

          <View style={styles.tags}>
            {expert.expertise.map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Mesaj Gönder</Text>
          <Text style={styles.messageSub}>Fikrin ve spec'in hakkında uzmanına yaz.</Text>

          {spec ? (
            <View style={styles.specBadge}>
              <Text style={styles.specBadgeText}>📄 Spec otomatik eklenecek</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Merhaba, fikrim hakkında görüşünüzü almak istiyorum..."
            placeholderTextColor="#555"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!messageText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            <Text style={styles.sendBtnText}>{sending ? 'Gönderiliyor…' : 'Gönder'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { padding: 20, gap: 20, paddingBottom: 40 },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  avatar: { fontSize: 56, marginBottom: 4 },
  name: { color: '#fff', fontSize: 22, fontWeight: '800' },
  expertTitle: { color: '#a99ff7', fontSize: 14, fontWeight: '600' },
  company: { color: '#888', fontSize: 13 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginVertical: 8 },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#888', fontSize: 11 },
  statDivider: { width: 1, height: 30, backgroundColor: '#2a2a2a' },
  bio: { color: '#ccc', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  tag: {
    backgroundColor: '#1e1540',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#6c47ff40',
  },
  tagText: { color: '#a99ff7', fontSize: 11, fontWeight: '600' },
  messageCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  messageTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  messageSub: { color: '#888', fontSize: 13 },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d2e1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1a5c33',
  },
  specBadgeText: { color: '#4ecdc4', fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sendBtn: {
    backgroundColor: '#6c47ff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
  sendBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
