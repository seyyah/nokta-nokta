import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { IdeaCard } from '../services/claudeApi';
import { RootStackParamList } from '../App';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Review'>;
  route: RouteProp<RootStackParamList, 'Review'>;
};

const CATEGORY_EMOJI: Record<IdeaCard['category'], string> = {
  recipe: '🍳',
  study: '📚',
  reminder: '⏰',
  tip: '💡',
  other: '📌',
};

const CATEGORY_COLOR: Record<IdeaCard['category'], string> = {
  recipe: '#ff6b35',
  study: '#4a9eff',
  reminder: '#f5c518',
  tip: '#4caf50',
  other: '#9e9e9e',
};

export default function ReviewScreen({ navigation, route }: Props) {
  const { cards } = route.params;

  const [index, setIndex] = useState(0);
  const [approved, setApproved] = useState<IdeaCard[]>([]);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectedReasons, setRejectedReasons] = useState<Record<string, string>>({});

  const card = cards[index];
  const isLast = index === cards.length - 1;
  const color = CATEGORY_COLOR[card.category];
  const emoji = CATEGORY_EMOJI[card.category];

  function advance(nextApproved: IdeaCard[]) {
    setEditing(false);
    if (isLast) {
      if (nextApproved.length === 0) return; // empty-state shown below
      navigation.navigate('Cards', { cards: nextApproved });
    } else {
      setIndex(i => i + 1);
    }
  }

  function handleKeep() {
    const kept = editing
      ? { ...card, title: editTitle.trim() || card.title, summary: editSummary.trim() || card.summary }
      : card;
    const next = [...approved, kept];
    setApproved(next);
    advance(next);
  }

  function handleReject() {
    setRejectReason('');
    setRejectModalVisible(true);
  }

  function confirmReject() {
    if (rejectReason.trim()) {
      setRejectedReasons(prev => ({ ...prev, [card.id]: rejectReason.trim() }));
    }
    setRejectModalVisible(false);
    advance(approved);
  }

  function handleEdit() {
    setEditTitle(card.title);
    setEditSummary(card.summary);
    setEditing(true);
  }

  function handleBack() {
    Alert.alert(
      'Leave Review?',
      'Going back will lose your review progress.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Go Back', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  }

  // All rejected on the last card
  const allRejected = isLast && approved.length === 0 && !editing;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Review Ideas ({index + 1} / {cards.length})
        </Text>
        <Text style={styles.approvedBadge}>{approved.length} ✓</Text>
      </View>

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: color + '22', borderColor: color }]}>
          <Text style={styles.categoryEmoji}>{emoji}</Text>
          <Text style={[styles.categoryLabel, { color }]}>{card.category.toUpperCase()}</Text>
        </View>

        {/* Card content */}
        <View style={[styles.card, { borderLeftColor: color }]}>
          {editing ? (
            <>
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                style={styles.editInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholderTextColor="#555"
                selectionColor="#6c47ff"
              />
              <Text style={styles.fieldLabel}>Summary</Text>
              <TextInput
                style={[styles.editInput, styles.editInputMulti]}
                value={editSummary}
                onChangeText={setEditSummary}
                multiline
                textAlignVertical="top"
                placeholderTextColor="#555"
                selectionColor="#6c47ff"
              />
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSummary}>{card.summary}</Text>
            </>
          )}

          <Text style={styles.mergedFrom}>
            🔗 Lines: {card.mergedFrom.join(', ')}
          </Text>

          {rejectedReasons[card.id] ? (
            <View style={styles.rejectReasonBadge}>
              <Text style={styles.rejectReasonLabel}>✗ Rejected: </Text>
              <Text style={styles.rejectReasonText}>{rejectedReasons[card.id]}</Text>
            </View>
          ) : null}

          <View style={styles.tagsRow}>
            {card.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* All rejected empty state */}
        {allRejected && (
          <Text style={styles.allRejectedNote}>
            All cards rejected. Go back to re-analyze?
          </Text>
        )}

        {/* Action row */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnReject} onPress={handleReject}>
            <Text style={styles.btnRejectText}>✗ Reject</Text>
          </TouchableOpacity>

          {editing ? null : (
            <TouchableOpacity style={styles.btnEdit} onPress={handleEdit}>
              <Text style={styles.btnEditText}>✏ Edit</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.btnKeep} onPress={handleKeep}>
            <Text style={styles.btnKeepText}>{editing ? '✓ Save' : '✓ Keep'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Rejection reason modal */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Why are you rejecting this?</Text>
            <Text style={styles.modalSub}>Optional — helps you remember later</Text>
            <TextInput
              style={styles.modalInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="e.g. Already knew this, irrelevant topic…"
              placeholderTextColor="#555"
              multiline
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSkipBtn}
                onPress={confirmReject}
              >
                <Text style={styles.modalSkipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalRejectBtn}
                onPress={confirmReject}
              >
                <Text style={styles.modalRejectText}>✗ Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 44,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e2e',
  },
  backBtn: {},
  backText: { color: '#6c47ff', fontSize: 15 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  approvedBadge: { color: '#4caf50', fontSize: 13, fontWeight: '700' },

  inner: { padding: 20, paddingBottom: 40 },

  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
    gap: 6,
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  card: {
    backgroundColor: '#1a1a24',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  cardSummary: { color: '#ccc', fontSize: 14, lineHeight: 21, marginBottom: 14 },
  mergedFrom: { color: '#555', fontSize: 11, marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#2a2a38', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { color: '#888', fontSize: 11 },

  fieldLabel: { color: '#666', fontSize: 11, fontWeight: '600', marginBottom: 4, letterSpacing: 0.4 },
  editInput: {
    backgroundColor: '#12121a',
    color: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#6c47ff',
    marginBottom: 14,
  },
  editInputMulti: { minHeight: 80 },

  allRejectedNote: {
    color: '#666',
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 20,
  },

  rejectReasonBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2a1a1a',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  rejectReasonLabel: { color: '#ff6b6b', fontSize: 11, fontWeight: '700' },
  rejectReasonText: { color: '#ff6b6b', fontSize: 11, flex: 1 },
  // Rejection modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1a1a24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  modalSub: { color: '#666', fontSize: 12, marginBottom: 16 },
  modalInput: {
    backgroundColor: '#12121a',
    color: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#2a2a38',
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalSkipBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#2a2a38',
    alignItems: 'center',
  },
  modalSkipText: { color: '#888', fontWeight: '600', fontSize: 14 },
  modalRejectBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    alignItems: 'center',
  },
  modalRejectText: { color: '#ff6b6b', fontWeight: '700', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 10 },
  btnReject: {
    flex: 1,
    backgroundColor: '#2a1a1a',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnRejectText: { color: '#ff6b6b', fontWeight: '700', fontSize: 15 },
  btnEdit: {
    flex: 1,
    backgroundColor: '#1a1a2a',
    borderWidth: 1,
    borderColor: '#4a9eff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnEditText: { color: '#4a9eff', fontWeight: '700', fontSize: 15 },
  btnKeep: {
    flex: 1,
    backgroundColor: '#1a2a1a',
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnKeepText: { color: '#4caf50', fontWeight: '700', fontSize: 15 },
});
