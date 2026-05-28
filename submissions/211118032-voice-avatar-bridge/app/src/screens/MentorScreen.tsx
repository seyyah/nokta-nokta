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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Escalation, Message, MentorProfile, RootStackParamList } from '../types';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';
import MessageBubble from '../components/MessageBubble';
import MentorCard from '../components/MentorCard';
import TypingIndicator from '../components/TypingIndicator';
import { EscalationService } from '../services/escalationService';
import { SummaryService } from '../services/summaryService';
import { MENTOR_PROFILES } from '../constants/mockData';
import { askMentor, GrokMessage } from '../services/grokService';

type Props = NativeStackScreenProps<RootStackParamList, 'Mentor'>;

function makeId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export default function MentorScreen({ navigation, route }: Props) {
  const { escalationId } = route.params;
  const insets = useSafeAreaInsets();

  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [endingSession, setEndingSession] = useState(false);

  // Conversation history for Grok API (only user/assistant turns)
  const grokHistory = useRef<GrokMessage[]>([]);

  const listRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, []);

  useEffect(() => {
    (async () => {
      const esc = await EscalationService.getEscalationById(escalationId);
      if (!esc) {
        navigation.goBack();
        return;
      }
      setEscalation(esc);

      const mentorProfile = MENTOR_PROFILES[esc.mentorType] ?? MENTOR_PROFILES['default'];
      setMentor(mentorProfile);

      const welcomeText = `Merhaba! Ben ${mentorProfile.name}, ${mentorProfile.expertise} alanında uzmanım. "${esc.topic}" konusunda seninle konuşmaya hazırım. Sorununu veya ihtiyacını paylaşır mısın?`;

      setMessages([
        {
          id: makeId(),
          text: welcomeText,
          sender: 'mentor',
          senderName: mentorProfile.name,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Seed the Grok history with mentor's welcome as assistant turn
      grokHistory.current = [{ role: 'assistant', content: welcomeText }];

      setLoadingData(false);
    })();
  }, [escalationId, navigation]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !escalation || !mentor || isTyping) return;

    const userMsgId = makeId();
    const userMsg: Message = {
      id: userMsgId,
      text: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    scrollToBottom();

    // Add user turn to Grok history
    grokHistory.current = [...grokHistory.current, { role: 'user', content: trimmed }];

    const reply = await askMentor(escalation.mentorType, grokHistory.current, trimmed);

    // Add assistant reply to Grok history
    grokHistory.current = [...grokHistory.current, { role: 'assistant', content: reply }];

    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        text: reply,
        sender: 'mentor',
        senderName: mentor.name,
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsTyping(false);
    scrollToBottom();
  }, [input, escalation, mentor, isTyping, scrollToBottom]);

  const handleEndSession = useCallback(() => {
    Alert.alert(
      'Oturumu Bitir',
      'Görüşmeyi sonlandırmak ve özet oluşturmak istiyor musun?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Bitir ve Özet Al',
          onPress: async () => {
            if (!escalation) return;
            setEndingSession(true);
            try {
              const summary = await SummaryService.createSummary(
                escalation.id,
                escalation.topic,
                escalation.mentorType,
              );
              await EscalationService.resolveEscalation(escalation.id);
              await EscalationService.addSummaryToEscalation(escalation.id, summary.id);
              navigation.replace('Summary', {
                escalationId: escalation.id,
                summaryId: summary.id,
              });
            } finally {
              setEndingSession(false);
            }
          },
        },
      ],
    );
  }, [escalation, navigation]);

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Uzman bağlanıyor...</Text>
      </View>
    );
  }

  if (!mentor || !escalation) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 56 : 0}
    >
      <View style={styles.headerBlock}>
        <MentorCard mentor={mentor} compact />
      </View>

      <View style={styles.topicBar}>
        <Text style={styles.topicPin}>📌 </Text>
        <Text style={styles.topicText} numberOfLines={1}>
          {escalation.topic}
        </Text>
        <TouchableOpacity
          style={[styles.endBtn, endingSession && styles.endBtnDisabled]}
          onPress={handleEndSession}
          disabled={endingSession}
          activeOpacity={0.8}
        >
          {endingSession ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.endBtnText}>Bitir</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        style={styles.messageList}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          isTyping ? (
            <TypingIndicator
              isMentor
              avatarInitials={mentor.avatarInitials}
              label={`${mentor.name.split(' ')[0]} yazıyor`}
            />
          ) : null
        }
      />

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={`${mentor.name.split(' ')[0]}'a mesaj yaz...`}
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
          returnKeyType="default"
          editable={!isTyping}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!input.trim() || isTyping) && styles.sendBtnDisabled,
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || isTyping}
          activeOpacity={0.85}
        >
          {isTyping ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.sendIcon}>↑</Text>
          )}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  headerBlock: {
    flexShrink: 0,
  },
  messageList: {
    flex: 1,
  },
  topicBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    gap: 4,
    flexShrink: 0,
  },
  topicPin: {
    fontSize: FontSize.sm,
    flexShrink: 0,
  },
  topicText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    flex: 1,
    fontWeight: FontWeight.medium,
  },
  endBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.md,
    minWidth: 52,
    alignItems: 'center',
    flexShrink: 0,
  },
  endBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  endBtnText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
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
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
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
