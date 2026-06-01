import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, TextInput, Alert, Animated,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSavedIdeas } from '../../src/hooks/useSavedIdeas';

/**
 * IdeaDetailScreen
 *
 * ── Track B: "Müşterinin Developer Olduğu" Senaryo ──────────────────────────
 *
 * Bu ekran kasıtlı olarak iki eksiklikle başlar:
 *
 * 1. "Kaydet" butonu YOK → kullanıcı 🐛 FAB ile bunu raporlar →
 *    audit-001.md üretilir → Forge cycle 1 ile useSavedIdeas hook +
 *    buton eklenir.
 *
 * 2. "Destekle" butonunda animasyon YOK → kullanıcı 🐛 FAB ile
 *    raporlar → audit-004.md → Forge cycle 5 ile Animated.spring eklenir.
 *
 * Müşteri (tester) raporlar, agent onarır, developer sadece review eder.
 * Bu dosya Forge cycle'ları sonrası halini yansıtır (save + animasyon eklendi).
 */

const IDEAS: Record<string, {
  title: string; tag: string; votes: number;
  desc: string; author: string;
  comments: { user: string; text: string }[];
}> = {
  '1': {
    title: 'Sessiz Alarm',
    tag: 'Yaşam', votes: 142,
    desc: 'Sabah alarmı yerine sadece titreşimle uyandır. Oda arkadaşını uyandırma, sessiz çık.',
    author: 'zeynep_k',
    comments: [
      { user: 'ahmet_d', text: 'Yıllardır böyle bir şey arıyordum!' },
      { user: 'selin_t', text: 'Bebek olan herkesin ihtiyacı bu.' },
    ],
  },
  '2': {
    title: 'Kitap Takas Haritası',
    tag: 'Topluluk', votes: 87,
    desc: 'Yakındaki kitap takası noktalarını haritada göster.',
    author: 'mert_c',
    comments: [{ user: 'fatma_b', text: 'Mahallemizdeki kitap dolabını buraya ekleyebilir miyiz?' }],
  },
  '3': {
    title: 'Nefes Antrenmanı',
    tag: 'Sağlık', votes: 214,
    desc: 'Gün içinde kısa nefes egzersizleri hatırlatır. 4-7-8 tekniği, box breathing.',
    author: 'can_y',
    comments: [
      { user: 'melis_a', text: 'Sabah toplantısından önce çok işe yarıyor.' },
      { user: 'burak_o', text: '4-7-8 gerçekten etkili.' },
    ],
  },
  '4': { title: 'Alışveriş Karbon Sayacı', tag: 'Çevre', votes: 56, desc: 'Sepetteki ürünlerin karbon ayak izi.', author: 'eco_user', comments: [] },
  '5': { title: 'Mahalle Duyuru Panosu', tag: 'Topluluk', votes: 99, desc: 'Hiperlokal duyuru akışı.', author: 'local_user', comments: [] },
  '6': { title: 'Ofis Gürültü Haritası', tag: 'Çalışma', votes: 33, desc: 'Sakin çalışma alanı bul.', author: 'work_user', comments: [] },
};

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idea = IDEAS[id ?? '1'];

  // ── Forge Cycle 1 çıktısı: useSavedIdeas hook ─────────────────────────────
  const { isSaved, toggleSave } = useSavedIdeas();

  // ── Forge Cycle 5 çıktısı: vote animasyonu ────────────────────────────────
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const [voted, setVoted] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(idea?.comments ?? []);

  if (!idea) return (
    <View style={s.root}><Text style={s.err}>Fikir bulunamadı.</Text></View>
  );

  const handleVote = () => {
    // Cycle 5: Animated.spring scale bounce (expo-haptics dep olmadan)
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, bounciness: 8 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 8 }),
    ]).start();
    setVoted(!voted);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.tag}>{idea.tag}</Text>
          <Text style={s.title}>{idea.title}</Text>
          <Text style={s.author}>@{idea.author}</Text>
        </View>

        <Text style={s.desc}>{idea.desc}</Text>

        {/* ── Cycle 5: Animated vote button ─── */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[s.voteBtn, voted && s.votedBtn]}
            onPress={handleVote}
            activeOpacity={0.9}
          >
            <Text style={s.voteBtnText}>
              {voted ? '✓ Destekliyorsun' : '▲ Destekle'}
            </Text>
            <Text style={s.voteCount}>{idea.votes + (voted ? 1 : 0)}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Cycle 1: Save button ─────────────────────────────────────────
            Bu buton audit-001.md raporundan forge cycle ile eklendi.
            Müşteri "kaydet butonu olsa harika olurdu" yazdı → agent ekledi.
        ──────────────────────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[s.saveBtn, isSaved(id ?? '') && s.savedBtn]}
          onPress={() => toggleSave(id ?? '')}
          activeOpacity={0.85}
        >
          <Text style={s.saveBtnText}>
            {isSaved(id ?? '') ? '🔖 Kaydedildi' : '🔖 Kaydet'}
          </Text>
        </TouchableOpacity>

        {/* Yorumlar */}
        <Text style={s.commentsTitle}>Yorumlar ({comments.length})</Text>
        {comments.map((c, i) => (
          <View key={i} style={s.comment}>
            <Text style={s.commentUser}>@{c.user}</Text>
            <Text style={s.commentText}>{c.text}</Text>
          </View>
        ))}

        <View style={s.addComment}>
          <TextInput
            style={s.commentInput}
            placeholder="Yorum ekle…"
            placeholderTextColor="#555"
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity
            style={s.commentBtn}
            onPress={() => {
              if (comment.trim()) {
                setComments([...comments, { user: 'sen', text: comment.trim() }]);
                setComment('');
              }
            }}
          >
            <Text style={s.commentBtnText}>Gönder</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 20, paddingBottom: 140 },
  err: { color: '#f5f0e8', padding: 20, fontSize: 16 },
  header: { marginBottom: 20 },
  tag: { fontSize: 11, color: '#c8a96e', fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#f5f0e8', marginBottom: 6 },
  author: { fontSize: 13, color: '#666' },
  desc: { fontSize: 15, color: '#aaa', lineHeight: 24, marginBottom: 24 },
  voteBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 12,
  },
  votedBtn: { borderColor: '#c8a96e', backgroundColor: '#1e1a12' },
  voteBtnText: { color: '#f5f0e8', fontWeight: '700', fontSize: 15 },
  voteCount: { color: '#c8a96e', fontWeight: '800', fontSize: 18 },
  // ── Cycle 1: save button styles ──
  saveBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 24,
  },
  savedBtn: { borderColor: '#c8a96e', backgroundColor: '#1e1a12' },
  saveBtnText: { color: '#f5f0e8', fontWeight: '600', fontSize: 14 },
  commentsTitle: { fontSize: 13, fontWeight: '700', color: '#888', letterSpacing: 1.5, marginBottom: 12 },
  comment: { backgroundColor: '#161616', borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#222' },
  commentUser: { fontSize: 11, color: '#c8a96e', fontWeight: '700', marginBottom: 4 },
  commentText: { fontSize: 14, color: '#ccc', lineHeight: 20 },
  addComment: { marginTop: 12, flexDirection: 'row', gap: 8 },
  commentInput: {
    flex: 1, backgroundColor: '#1a1a1a', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, color: '#f5f0e8',
    fontSize: 14, borderWidth: 1, borderColor: '#2a2a2a',
  },
  commentBtn: { backgroundColor: '#c8a96e', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  commentBtnText: { color: '#0f0f0f', fontWeight: '700', fontSize: 14 },
});
