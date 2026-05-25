import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from './Themed';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatBubbleProps {
  text: string;
  sender: 'ai' | 'user';
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ text, sender }) => {
  const isUser = sender === 'user';

  if (isUser) {
    return (
      <View style={[styles.userWrapper, { backgroundColor: 'transparent' }]}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.userGradient}
        >
          <Text style={styles.userText}>{text}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.aiContainer, { backgroundColor: '#f8fafc' }]}>
      <Text style={styles.aiText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  userWrapper: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  userGradient: {
    padding: 16,
    paddingHorizontal: 20,
    borderRadius: 32,
    borderBottomRightRadius: 8,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    backgroundColor: '#f8fafc',
    padding: 16,
    paddingHorizontal: 20,
    borderRadius: 32,
    borderBottomLeftRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  aiText: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 22,
  },
});
