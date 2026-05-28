import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { EXPERTS } from '../data/experts';
import { loadMessages } from '../utils/messageStorage';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Experts'>;
  route: RouteProp<RootStackParamList, 'Experts'>;
};

export default function ExpertsScreen({ navigation, route }: Props) {
  const spec = route.params?.spec;
  const [hasMessages, setHasMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadMessages().then((msgs) => {
        setHasMessages(msgs.length > 0);
        setUnreadCount(msgs.filter((m) => m.replies.length > 0).length);
      });
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        {spec ? (
          <View style={styles.specBadge}>
            <Text style={styles.specBadgeText}>📄 Spec otomatik eklenecek</Text>
          </View>
        ) : null}

        {hasMessages && (
          <TouchableOpacity
            style={styles.inboxBanner}
            onPress={() => navigation.navigate('UserInbox')}
          >
            <Text style={styles.inboxBannerIcon}>📬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.inboxBannerTitle}>Gönderilen Mesajlarım</Text>
              <Text style={styles.inboxBannerSub}>
                {unreadCount > 0 ? `${unreadCount} uzman cevap verdi` : 'Cevap bekleniyor'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>{EXPERTS.length} UZMAN MEVCUT</Text>

        {EXPERTS.map((expert) => (
          <TouchableOpacity
            key={expert.id}
            style={styles.card}
            onPress={() => navigation.navigate('ExpertDetail', { expertId: expert.id, spec })}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <Text style={styles.avatar}>{expert.avatar}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{expert.name}</Text>
                <Text style={styles.title}>{expert.title} · {expert.company}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {expert.rating}</Text>
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

            <View style={styles.cardFooter}>
              <Text style={styles.sessions}>{expert.sessions} oturum</Text>
              <Text style={styles.contactText}>İletişime Geç ›</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.expertLoginLink}
          onPress={() => navigation.navigate('ExpertLogin')}
        >
          <Text style={styles.expertLoginText}>👤 Ben bir uzmansam →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { padding: 16, gap: 14, paddingBottom: 40 },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d2e1a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#1a5c33',
  },
  specBadgeText: { color: '#4ecdc4', fontSize: 13, fontWeight: '600' },
  inboxBanner: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  inboxBannerIcon: { fontSize: 28 },
  inboxBannerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  inboxBannerSub: { color: '#888', fontSize: 12, marginTop: 2 },
  chevron: { color: '#6c47ff', fontSize: 22 },
  sectionLabel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { fontSize: 36 },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  title: { color: '#888', fontSize: 13, marginTop: 2 },
  ratingBadge: {
    backgroundColor: '#2a2000',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#4a3a00',
  },
  ratingText: { color: '#f59e0b', fontSize: 13, fontWeight: '700' },
  bio: { color: '#ccc', fontSize: 13, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#1e1540',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#6c47ff40',
  },
  tagText: { color: '#a99ff7', fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessions: { color: '#555', fontSize: 12 },
  contactText: { color: '#6c47ff', fontSize: 13, fontWeight: '600' },
  expertLoginLink: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  expertLoginText: { color: '#555', fontSize: 13 },
});
