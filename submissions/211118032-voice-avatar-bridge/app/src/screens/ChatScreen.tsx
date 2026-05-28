import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Message } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import { MockMascotService } from '../services/mockMascotService';
import { EscalationService } from '../services/escalationService';
import {
  ChatThreadId,
  loadThread,
  saveThread,
  clearThread,
} from '../services/chatThreadService';
import { MENTOR_PROFILES } from '../constants/mockData';

function makeId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function threadLabel(threadId: ChatThreadId): string {
  if (threadId === 'general') return 'Genel';
  const profile = MENTOR_PROFILES[threadId];
  if (profile) {
    const short = profile.expertise.split('&')[0].trim();
    return short.length > 18 ? `${short.slice(0, 16)}…` : short;
  }
  return threadId;
}

export default function ChatScreen() {
  const [activeThread, setActiveThread] = useState<ChatThreadId>('general');
  const [openThreads, setOpenThreads] = useState<ChatThreadId[]>(['general']);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expertSuggestion, setExpertSuggestion] = useState<{
    keyword: string;
    mentorType: string;
  } | null>(null);
  const [creatingEscalation, setCreatingEscalation] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [threadsReady, setThreadsReady] = useState(false);

  const listRef = useRef<FlatList>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, []);

  const persistCurrentThread = useCallback(async (msgs: Message[]) => {
    await saveThread(activeThread, msgs);
  }, [activeThread]);

  useEffect(() => {
    (async () => {
      const loaded = await loadThread(activeThread);
      setMessages(loaded);
      setThreadsReady(true);
    })();
  }, [activeThread]);

  const switchThread = useCallback(
    async (next: ChatThreadId) => {
      if (next === activeThread) return;
      await saveThread(activeThread, messagesRef.current);
      setActiveThread(next);
      setExpertSuggestion(null);
      setInput('');
      setCharCount(0);
    },
    [activeThread],
  );

  const openAreaThread = useCallback(
    async (mentorType: string) => {
      setOpenThreads((prev) =>
        prev.includes(mentorType) ? prev : [...prev, mentorType],
      );
      await saveThread(activeThread, messagesRef.current);
      setActiveThread(mentorType);
      setExpertSuggestion(null);
      setInput('');
      setCharCount(0);
    },
    [activeThread],
  );

  const handleChangeText = useCallback((text: string) => {
    setInput(text);
    setCharCount(text.length);
  }, []);

  const clearChat = useCallback(async () => {
    await clearThread(activeThread);
    const loaded = await loadThread(activeThread);
    setMessages(loaded);
    setExpertSuggestion(null);
    setInput('');
    setCharCount(0);
  }, [activeThread]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    if (trimmed.toLowerCase() === 'temizle') {
      await clearChat();
      return;
    }

    const userMsg: Message = {
      id: makeId(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const withUser = [...messagesRef.current, userMsg];
    setMessages(withUser);
    setInput('');
    setCharCount(0);
    setIsTyping(true);
    setExpertSuggestion(null);
    scrollToBottom();

    await new Promise<void>((r) => setTimeout(r, 1200 + Math.random() * 800));

    const response = MockMascotService.generateResponse(trimmed);
    const mascotMsg: Message = {
      id: makeId(),
      text: response,
      sender: 'mascot',
      timestamp: new Date().toISOString(),
    };

    const withMascot = [...withUser, mascotMsg];
    setMessages(withMascot);
    setIsTyping(false);
    await persistCurrentThread(withMascot);
    scrollToBottom();

    if (activeThread === 'general' && MockMascotService.shouldSuggestExpert(trimmed)) {
      const keyword = MockMascotService.getDetectedKeyword(trimmed);
      if (keyword) {
        const mentorType = MockMascotService.getMentorTypeForKeyword(keyword);
        setTimeout(() => {
          setExpertSuggestion({ keyword, mentorType });
          scrollToBottom();
        }, 400);
      }
    }
  }, [input, isTyping, scrollToBottom, activeThread, clearChat, persistCurrentThread]);

  const handleRequestExpert = useCallback(async () => {
    if (!expertSuggestion || creatingEscalation) return;
    setCreatingEscalation(true);

    try {
      const kw = expertSuggestion.keyword;
      const topic = `${kw.charAt(0).toUpperCase()}${kw.slice(1)} konusunda destek talebi`;
      await EscalationService.createEscalation(topic, expertSuggestion.mentorType);

      setExpertSuggestion(null);

      const updated = [
        ...messagesRef.current,
        {
          id: makeId(),
          text: '✅ Uzman desteği talebiniz oluşturuldu! Birkaç saniye içinde bir mentor sizi kabul edecek. "Talepler" sekmesinden durumu takip edebilirsiniz.',
          sender: 'mascot' as const,
          timestamp: new Date().toISOString(),
        },
      ];
      setMessages(updated);
      await persistCurrentThread(updated);
      scrollToBottom();
    } finally {
      setCreatingEscalation(false);
    }
  }, [expertSuggestion, creatingEscalation, scrollToBottom, persistCurrentThread]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <MessageBubble message={item} />,
    [],
  );

  const showCharCount = charCount > 400;

  if (!threadsReady) {
    return <View style={styles.container} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.topBar}>
        <View style={styles.mascotIndicator}>
          <View style={styles.mascotDot} />
          <Text style={styles.mascotLabel}>Nokta • Çevrimiçi</Text>
        </View>
        <View style={styles.topBarRight}>
          <Text style={styles.clearHint}>"temizle" yaz veya</Text>
          <TouchableOpacity onPress={clearChat} style={styles.clearBtn} activeOpacity={0.7}>
            <Text style={styles.clearBtnText}>🗑️ Temizle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.threadBar}>
        <Text style={styles.threadBarLabel}>Sohbet kanalı:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {openThreads.map((tid) => (
            <TouchableOpacity
              key={tid}
              style={[styles.threadChip, activeThread === tid && styles.threadChipActive]}
              onPress={() => switchThread(tid)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.threadChipText,
                  activeThread === tid && styles.threadChipTextActive,
                ]}
              >
                {threadLabel(tid)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        ref={listRef}
        style={styles.messageList}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            {isTyping && <TypingIndicator />}
            {expertSuggestion && !isTyping && activeThread === 'general' && (
              <View style={styles.suggestionCard}>
                <View style={styles.suggestionHeader}>
                  <Text style={styles.suggestionIcon}>🎯</Text>
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionTitle}>Uzman Desteği Önerilir</Text>
                    <Text style={styles.suggestionDesc}>
                      Bu konu için ayrı bir sohbet kanalı açabilirsin.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.areaChatBtn}
                  onPress={() => openAreaThread(expertSuggestion.mentorType)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.areaChatBtnText}>
                    💬 {threadLabel(expertSuggestion.mentorType)} kanalına geç
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.expertBtn,
                    creatingEscalation && styles.expertBtnDisabled,
                  ]}
                  onPress={handleRequestExpert}
                  disabled={creatingEscalation}
                  activeOpacity={0.85}
                >
                  <Text style={styles.expertBtnText}>
                    {creatingEscalation ? 'Oluşturuluyor...' : '⚡ Uzman Desteği Al'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
      />

      <View style={styles.inputBar}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={handleChangeText}
            placeholder={
              activeThread === 'general'
                ? 'Bir şeyler yaz...'
                : `${threadLabel(activeThread)} kanalına yaz...`
            }
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
          {showCharCount && (
            <Text style={[styles.charCount, charCount > 480 && styles.charCountWarning]}>
              {500 - charCount}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || isTyping}
          activeOpacity={0.85}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  threadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  threadBarLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  threadChip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
  },
  threadChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  threadChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  threadChipTextActive: {
    color: Colors.white,
  },
  messageList: {
    flex: 1,
  },
  mascotIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mascotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  mascotLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  clearHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  clearBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  suggestionCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  suggestionIcon: {
    fontSize: FontSize.xl,
  },
  suggestionText: {
    flex: 1,
    gap: 3,
  },
  suggestionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  suggestionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  areaChatBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  areaChatBtnText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  expertBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  expertBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  expertBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    paddingRight: 44,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: 10,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  charCountWarning: {
    color: Colors.error,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  sendIcon: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
});
