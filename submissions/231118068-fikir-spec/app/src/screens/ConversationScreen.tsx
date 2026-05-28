import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { EXPERTS } from '../data/experts';
import { loadMessages, saveMessages } from '../utils/messageStorage';
import type { ExpertMessage } from '../types/messages';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Conversation'>;
  route: RouteProp<RootStackParamList, 'Conversation'>;
};

export default function ConversationScreen({ navigation, route }: Props) {
  const { messageId, expertId } = route.params;
  const expert = EXPERTS.find((e) => e.id === expertId)!;
  const [conversation, setConversation] = useState<ExpertMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [specExpanded, setSpecExpanded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadMessages().then((all) => {
        const found = all.find((m) => m.id === messageId) ?? null;
        setConversation(found);
      });
    }, [messageId])
  );

  async function handleSendReply() {
    if (!replyText.trim() || !conversation) return;
    setSending(true);
    try {
      const all = await loadMessages();
      const now = new Date();
      const updated = all.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            replies: [
              ...m.replies,
              {
                id: Date.now().toString(),
                text: replyText.trim(),
                from: expert.name,
                time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
              },
            ],
            read: true,
          };
        }
        return m;
      });
      await saveMessages(updated);
      const refreshed = updated.find((m) => m.id === messageId) ?? null;
      setConversation(refreshed);
      setReplyText('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  }

  if (!conversation) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Konuşma bulunamadı.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User's original message */}
        <View style={styles.userMsgCard}>
          <View style={styles.msgMeta}>
            <Text style={styles.msgFrom}>👤 Kullanıcı</Text>
            <Text style={styles.msgTime}>{conversation.time}</Text>
          </View>
          <Text style={styles.userMsgText}>{conversation.userMessage}</Text>
        </View>

        {/* Spec section */}
        {conversation.spec ? (
          <TouchableOpacity
            style={styles.specToggle}
            onPress={() => setSpecExpanded((v) => !v)}
          >
            <Text style={styles.specToggleText}>
              📄 Spec {specExpanded ? '▲ gizle' : '▼ göster'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {specExpanded && conversation.spec ? (
          <View style={styles.specBox}>
            {conversation.spec.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return (
                  <Text key={i} style={styles.specH2}>
                    {line.replace('## ', '')}
                  </Text>
                );
              }
              if (line.trim() === '') return <View key={i} style={{ height: 6 }} />;
              return (
                <Text key={i} style={styles.specBody}>
                  {line}
                </Text>
              );
            })}
          </View>
        ) : null}

        {/* Replies */}
        {conversation.replies.map((reply, i) => (
          <View key={i} style={styles.replyBubble}>
            <View style={styles.msgMeta}>
              <Text style={styles.replyFrom}>
                {expert.avatar} {reply.from}
              </Text>
              <Text style={styles.msgTime}>{reply.time}</Text>
            </View>
            <Text style={styles.replyText}>{reply.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Cevabını yaz…"
          placeholderTextColor="#555"
          value={replyText}
          onChangeText={setReplyText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!replyText.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSendReply}
          disabled={!replyText.trim() || sending}
        >
          <Text style={styles.sendIcon}>›</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 20 },
  empty: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  userMsgCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  msgMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  msgFrom: { color: '#6c47ff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  msgTime: { color: '#555', fontSize: 11 },
  userMsgText: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  specToggle: {
    backgroundColor: '#1e1540',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#6c47ff40',
    alignSelf: 'flex-start',
  },
  specToggleText: { color: '#a99ff7', fontSize: 13, fontWeight: '600' },
  specBox: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  specH2: {
    color: '#6c47ff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 4,
  },
  specBody: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  replyBubble: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  replyFrom: { color: '#a99ff7', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  replyText: { color: '#ccc', fontSize: 14, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sendBtn: {
    backgroundColor: '#6c47ff',
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
  sendIcon: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 28 },
});
