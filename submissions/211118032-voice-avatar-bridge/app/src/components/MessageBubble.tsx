import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

type Props = {
  message: Message;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.sender === 'user';
  const isMentor = message.sender === 'mentor';

  const senderLabel = isMentor
    ? `👨‍💼 ${message.senderName ?? 'Mentor'}`
    : '🤖 Nokta';

  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      {!isUser && (
        <View style={[styles.avatar, isMentor ? styles.avatarMentor : styles.avatarMascot]}>
          <Text style={styles.avatarText}>{isMentor ? 'M' : 'N'}</Text>
        </View>
      )}
      <View style={styles.bubbleWrapper}>
        {!isUser && <Text style={styles.senderLabel}>{senderLabel}</Text>}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : isMentor ? styles.bubbleMentor : styles.bubbleMascot,
          ]}
        >
          <Text style={[styles.text, isUser ? styles.textUser : styles.textOther]}>
            {message.text}
          </Text>
        </View>
        <Text style={[styles.time, isUser ? styles.timeRight : styles.timeLeft]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
      {isUser && (
        <View style={styles.avatarUser}>
          <Text style={styles.avatarText}>S</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignItems: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    flexShrink: 0,
  },
  avatarMascot: {
    backgroundColor: Colors.secondary,
  },
  avatarMentor: {
    backgroundColor: Colors.primary,
  },
  avatarUser: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
    flexShrink: 0,
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  bubbleWrapper: {
    maxWidth: '75%',
  },
  senderLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
    marginLeft: 2,
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Radius.sm,
  },
  bubbleMascot: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: Radius.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleMentor: {
    backgroundColor: Colors.secondaryLight,
    borderBottomLeftRadius: Radius.sm,
  },
  text: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  textUser: {
    color: Colors.white,
  },
  textOther: {
    color: Colors.textPrimary,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 3,
  },
  timeRight: {
    textAlign: 'right',
    marginRight: 2,
  },
  timeLeft: {
    textAlign: 'left',
    marginLeft: 2,
  },
});
