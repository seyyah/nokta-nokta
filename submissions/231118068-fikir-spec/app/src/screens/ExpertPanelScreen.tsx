import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { EXPERTS } from '../data/experts';
import { loadMessages, saveMessages } from '../utils/messageStorage';
import type { ExpertMessage } from '../types/messages';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ExpertPanel'>;
  route: RouteProp<RootStackParamList, 'ExpertPanel'>;
};

export default function ExpertPanelScreen({ navigation, route }: Props) {
  const { expertId } = route.params;
  const expert = EXPERTS.find((e) => e.id === expertId)!;
  const [messages, setMessages] = useState<ExpertMessage[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadMessages().then((all) => {
        setMessages(all.filter((m) => m.expertId === expertId));
      });
    }, [expertId])
  );

  async function handleOpen(msg: ExpertMessage) {
    if (!msg.read) {
      const all = await loadMessages();
      const updated = all.map((m) => (m.id === msg.id ? { ...m, read: true } : m));
      await saveMessages(updated);
    }
    navigation.navigate('Conversation', { messageId: msg.id, expertId });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.expertAvatar}>{expert.avatar}</Text>
        <View>
          <Text style={styles.expertName}>{expert.name}</Text>
          <Text style={styles.panelLabel}>Uzman Paneli</Text>
        </View>
      </View>

      {messages.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Henüz mesaj yok</Text>
          <Text style={styles.emptySub}>Kullanıcılar sana mesaj gönderdiğinde burada görünecek.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.inner}>
          <Text style={styles.sectionLabel}>📬 GELEN MESAJLAR ({messages.length})</Text>
          {messages.map((msg) => (
            <TouchableOpacity
              key={msg.id}
              style={[styles.card, !msg.read && styles.cardUnread]}
              onPress={() => handleOpen(msg)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={styles.userAvatar}>
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>Anonim Kullanıcı</Text>
                  <Text style={styles.cardDate}>{msg.date} · {msg.time}</Text>
                </View>
                {!msg.read && <View style={styles.unreadDot} />}
                {msg.replies.length > 0 && (
                  <Text style={styles.replyCount}>{msg.replies.length} cevap</Text>
                )}
              </View>
              <Text style={styles.preview} numberOfLines={2}>{msg.userMessage}</Text>
              {msg.spec ? (
                <View style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>📄 Spec eklendi</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    backgroundColor: '#111',
  },
  expertAvatar: { fontSize: 28 },
  expertName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  panelLabel: { color: '#888', fontSize: 12, marginTop: 2 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptySub: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  inner: { padding: 16, gap: 12, paddingBottom: 40 },
  sectionLabel: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 10,
  },
  cardUnread: { borderColor: '#6c47ff60' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e1540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cardDate: { color: '#555', fontSize: 12, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6c47ff' },
  replyCount: { color: '#a99ff7', fontSize: 11, fontWeight: '600' },
  preview: { color: '#888', fontSize: 13, lineHeight: 20 },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d2e1a',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1a5c33',
  },
  specBadgeText: { color: '#4ecdc4', fontSize: 12, fontWeight: '600' },
});
