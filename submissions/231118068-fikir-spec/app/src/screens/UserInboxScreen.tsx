import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { EXPERTS } from '../data/experts';
import { loadMessages } from '../utils/messageStorage';
import type { ExpertMessage } from '../types/messages';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'UserInbox'>;
};

export default function UserInboxScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<ExpertMessage[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadMessages().then(setMessages);
    }, [])
  );

  if (messages.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyTitle}>Henüz mesaj yok</Text>
        <Text style={styles.emptySub}>Bir uzmana mesaj gönderdiğinde burada görünecek.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        {messages.map((msg) => {
          const expert = EXPERTS.find((e) => e.id === msg.expertId);
          return (
            <View key={msg.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.expertLabel}>
                  {expert?.avatar} {msg.expertName}
                </Text>
                <Text style={styles.date}>{msg.date} · {msg.time}</Text>
              </View>

              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>{msg.userMessage}</Text>
              </View>

              {msg.spec ? (
                <View style={styles.specBadge}>
                  <Text style={styles.specBadgeText}>📄 Spec eklendi</Text>
                </View>
              ) : null}

              {msg.replies.length === 0 ? (
                <View style={styles.waitingRow}>
                  <ActivityIndicator size="small" color="#555" />
                  <Text style={styles.waitingText}>Uzman cevap bekliyor…</Text>
                </View>
              ) : (
                msg.replies.map((reply, i) => (
                  <View key={i} style={styles.replyBubble}>
                    <View style={styles.replyHeader}>
                      <Text style={styles.replyFrom}>{expert?.avatar} {reply.from}</Text>
                      <Text style={styles.replyTime}>{reply.time}</Text>
                    </View>
                    <Text style={styles.replyText}>{reply.text}</Text>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { padding: 16, gap: 16, paddingBottom: 40 },
  empty: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptySub: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expertLabel: { color: '#a99ff7', fontSize: 14, fontWeight: '700' },
  date: { color: '#555', fontSize: 12 },
  userBubble: {
    backgroundColor: '#1e1540',
    borderRadius: 12,
    padding: 12,
    alignSelf: 'flex-end',
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: '#6c47ff40',
  },
  userBubbleText: { color: '#fff', fontSize: 14, lineHeight: 20 },
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
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 10,
  },
  waitingText: { color: '#888', fontSize: 13 },
  replyBubble: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  replyFrom: { color: '#6c47ff', fontSize: 11, fontWeight: '700' },
  replyTime: { color: '#555', fontSize: 11 },
  replyText: { color: '#ccc', fontSize: 14, lineHeight: 22 },
});
