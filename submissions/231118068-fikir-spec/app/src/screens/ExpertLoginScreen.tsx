import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { EXPERTS } from '../data/experts';
import { loadMessages } from '../utils/messageStorage';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ExpertLogin'>;
};

export default function ExpertLoginScreen({ navigation }: Props) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useFocusEffect(
    React.useCallback(() => {
      loadMessages().then((msgs) => {
        const counts: Record<string, number> = {};
        EXPERTS.forEach((e) => {
          counts[e.id] = msgs.filter((m) => m.expertId === e.id && !m.read).length;
        });
        setUnreadCounts(counts);
      });
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.hint}>Hangi uzman olarak giriş yapmak istiyorsun?</Text>

        {EXPERTS.map((expert) => {
          const count = unreadCounts[expert.id] ?? 0;
          return (
            <TouchableOpacity
              key={expert.id}
              style={styles.card}
              onPress={() => navigation.navigate('ExpertPanel', { expertId: expert.id })}
              activeOpacity={0.8}
            >
              <Text style={styles.avatar}>{expert.avatar}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{expert.name}</Text>
                <Text style={styles.title}>{expert.title} · {expert.company}</Text>
              </View>
              {count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { padding: 16, gap: 12, paddingBottom: 40 },
  hint: { color: '#888', fontSize: 14, marginBottom: 4 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  avatar: { fontSize: 32 },
  name: { color: '#fff', fontSize: 15, fontWeight: '700' },
  title: { color: '#888', fontSize: 13, marginTop: 2 },
  badge: {
    backgroundColor: '#6c47ff',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
