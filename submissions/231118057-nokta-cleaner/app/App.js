import './global.css';

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import InputSection from './src/components/InputSection';
import IdeaCard from './src/components/IdeaCard';
import VoiceAvatarScreen from './src/components/VoiceAvatarScreen';
import AuditWidget, { AuditFab } from './src/components/AuditWidget';
import ExpertBridge, { ExpertHeaderButton } from './src/components/ExpertBridge';
import { processNotes } from './src/services/GeminiService';
import { loadSessions, saveSession } from './src/utils/storage';

const CATEGORIES = ['Technical', 'Business', 'Design', 'Other'];
const EMPTY_CARD  = { title: '', desc: '', category: 'Other', priority: null, assignee: '', tags: [], linkedIds: [] };

const LIGHT = {
  bg: '#e0f2fe', card: '#ffffff', text: '#000000', textMuted: '#6b7280',
  placeholder: '#a1a1aa', border: '#e5e7eb', borderStrong: '#000000',
  tagBg: '#000000', tagText: '#ffffff', inputBg: '#ffffff',
  btnBg: '#000000', btnText: '#ffffff', btnDisabledBg: '#f3f4f6', btnDisabledText: '#9ca3af',
  separator: '#000000', historyBg: '#ffffff', historyBorder: '#e5e7eb',
};
const DARK = {
  bg: '#111111', card: '#1c1c1c', text: '#ffffff', textMuted: '#9ca3af',
  placeholder: '#4b5563', border: '#2d2d2d', borderStrong: '#ffffff',
  tagBg: '#ffffff', tagText: '#000000', inputBg: '#161616',
  btnBg: '#ffffff', btnText: '#000000', btnDisabledBg: '#1c1c1c', btnDisabledText: '#4b5563',
  separator: '#ffffff', historyBg: '#1c1c1c', historyBorder: '#2d2d2d',
};

const newIdea = (idea) => ({ ...idea, status: 'pending', comment: '', priority: null, assignee: '', tags: [], linkedIds: [] });

export default function App() {
  const [ideas, setIdeas]                   = useState([]);
  const [isLoading, setIsLoading]           = useState(false);
  const [isReanalyzing, setIsReanalyzing]   = useState(false);
  const [showAddForm, setShowAddForm]       = useState(false);
  const [newCard, setNewCard]               = useState(EMPTY_CARD);
  const [isDark, setIsDark]                 = useState(false);
  const [search, setSearch]                 = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [sessions, setSessions]             = useState([]);
  const [showHistory, setShowHistory]       = useState(false);
  const [showReport, setShowReport]         = useState(false);
  const [mode, setMode]                     = useState('main'); // 'main' | 'voice'
  const [auditOpen, setAuditOpen]           = useState(false);
  const [expertOpen, setExpertOpen]         = useState(false);

  const theme = isDark ? DARK : LIGHT;

  useEffect(() => { setSessions(loadSessions()); }, []);

  const stats = {
    pending:  ideas.filter(i => (i.status || 'pending') === 'pending').length,
    approved: ideas.filter(i => i.status === 'approved').length,
    rejected: ideas.filter(i => i.status === 'rejected').length,
  };

  const displayed = ideas.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      i.title.toLowerCase().includes(q) ||
      i.desc.toLowerCase().includes(q) ||
      (i.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (i.assignee || '').toLowerCase().includes(q);
    const matchCat = !activeCategory || i.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleProcessNotes = async (text) => {
    setIsLoading(true);
    setIdeas([]);
    setSearch('');
    setActiveCategory(null);
    try {
      const result  = await processNotes(text);
      const newIdeas = result.map(newIdea);
      setIdeas(newIdeas);
      setSessions(saveSession(newIdeas));
    } catch (error) {
      Alert.alert('Error processing notes', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIdea = (id, changes) =>
    setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, ...changes } : idea));
  const handleDeleteIdea = (id) =>
    setIdeas(prev => prev.filter(idea => idea.id !== id));

  const handleMoveUp = (id) => setIdeas(prev => {
    const i = prev.findIndex(x => x.id === id);
    if (i <= 0) return prev;
    const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a;
  });
  const handleMoveDown = (id) => setIdeas(prev => {
    const i = prev.findIndex(x => x.id === id);
    if (i >= prev.length - 1) return prev;
    const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a;
  });

  const handleAddCard = () => {
    if (!newCard.title.trim()) return;
    setIdeas(prev => [...prev, { ...newCard, id: Date.now(), status: 'pending', comment: '' }]);
    setNewCard(EMPTY_CARD);
    setShowAddForm(false);
  };

  const handleClear = () => { setIdeas([]); setShowAddForm(false); setSearch(''); setActiveCategory(null); setShowReport(false); };
  const handleBulkApprove = () => setIdeas(prev => prev.map(i => ({ ...i, status: 'approved' })));
  const handleBulkReject  = () => setIdeas(prev => prev.map(i => ({ ...i, status: 'rejected' })));

  const handleExportApproved = async () => {
    const approved = ideas.filter(i => i.status === 'approved');
    if (approved.length === 0) { Alert.alert('No approved cards', 'Approve at least one card first.'); return; }
    const text = approved.map(i =>
      `[${i.category}]${i.priority ? ` [${i.priority.toUpperCase()}]` : ''}${i.assignee ? ` @${i.assignee}` : ''} ${i.title}\n${i.desc}${i.tags?.length ? `\nTags: ${i.tags.map(t => '#' + t).join(' ')}` : ''}${i.comment ? `\nNote: ${i.comment}` : ''}`
    ).join('\n\n');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${approved.length} approved card(s) copied to clipboard.`);
  };

  const handleReanalyzeRejected = async () => {
    const rejected = ideas.filter(i => i.status === 'rejected');
    if (rejected.length === 0) return;
    setIsReanalyzing(true);
    try {
      const result   = await processNotes(rejected.map(i => `${i.title}: ${i.desc}`).join('\n'));
      const newIdeas = result.map(idea => ({ ...newIdea(idea), id: Date.now() + Math.random() }));
      setIdeas(prev => [...prev.filter(i => i.status !== 'rejected'), ...newIdeas]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleLoadSession = (session) => {
    setIdeas(session.ideas);
    setSearch('');
    setActiveCategory(null);
    setShowHistory(false);
  };

  const handleExportReport = async () => {
    const pct  = (n) => ideas.length ? `${Math.round(n / ideas.length * 100)}%` : '0%';
    const assignees = [...new Set(ideas.map(i => i.assignee).filter(Boolean))];
    const allTags   = [...new Set(ideas.flatMap(i => i.tags || []))];
    const priorityCount = (p) => ideas.filter(i => (i.priority || null) === p).length;

    const text = [
      '=== NOKTA SESSION REPORT ===',
      `Date: ${new Date().toLocaleString('tr-TR')}`,
      `Total: ${ideas.length} cards`,
      '',
      '— STATUS —',
      `Approved : ${stats.approved} (${pct(stats.approved)})`,
      `Rejected : ${stats.rejected} (${pct(stats.rejected)})`,
      `Pending  : ${stats.pending} (${pct(stats.pending)})`,
      '',
      '— CATEGORIES —',
      ...CATEGORIES.map(c => { const n = ideas.filter(i => i.category === c).length; return n ? `${c}: ${n}` : null; }).filter(Boolean),
      '',
      '— PRIORITY —',
      ...['high', 'medium', 'low'].map(p => { const n = priorityCount(p); return n ? `${p.charAt(0).toUpperCase() + p.slice(1)}: ${n}` : null; }).filter(Boolean),
      `Unset: ${priorityCount(null)}`,
      '',
      assignees.length ? `— ASSIGNEES —\n${assignees.map(a => `@${a}: ${ideas.filter(i => i.assignee === a).length} cards`).join('\n')}` : null,
      allTags.length   ? `\n— TAGS —\n${allTags.map(t => '#' + t).join('  ')}` : null,
      '',
      '— APPROVED CARDS —',
      ...ideas.filter(i => i.status === 'approved').map(i =>
        `[${i.category}]${i.priority ? ` [${i.priority.toUpperCase()}]` : ''}${i.assignee ? ` @${i.assignee}` : ''} ${i.title}\n${i.desc}${i.comment ? `\nNote: ${i.comment}` : ''}`
      ),
    ].filter(x => x !== null).join('\n');

    await Clipboard.setStringAsync(text);
    Alert.alert('Report Copied', 'Full session report copied to clipboard.');
  };

  const isWeb = Platform.OS === 'web';

  const pill = (label, active, onPress) => (
    <TouchableOpacity onPress={onPress}
      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: active ? theme.borderStrong : theme.border, backgroundColor: active ? theme.borderStrong : 'transparent' }}>
      <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: active ? theme.bg : theme.textMuted }}>{label}</Text>
    </TouchableOpacity>
  );

  const content = (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 80, flexGrow: 1, maxWidth: 680, alignSelf: 'center', width: '100%' }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={{ flex: 1, width: '100%' }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <View>
            <Text style={{ color: theme.text, fontSize: 30, fontWeight: '900', letterSpacing: -1 }}>Nokta</Text>
            <Text style={{ color: theme.textMuted, fontWeight: '700', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>Migration & Dedup</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setMode('voice')}>
              <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Voice</Text>
            </TouchableOpacity>
            <ExpertHeaderButton theme={theme} onPress={() => setExpertOpen(true)} />
            {ideas.length > 0 && (
              <TouchableOpacity onPress={() => { setShowReport(v => !v); setShowHistory(false); }}>
                <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: showReport ? theme.text : theme.textMuted }}>Report</Text>
              </TouchableOpacity>
            )}
            {sessions.length > 0 && (
              <TouchableOpacity onPress={() => { setShowHistory(v => !v); setShowReport(false); }}>
                <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: showHistory ? theme.text : theme.textMuted }}>History</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setIsDark(v => !v)}
              style={{ width: 36, height: 20, borderRadius: 10, backgroundColor: isDark ? '#fff' : '#000', justifyContent: 'center', paddingHorizontal: 3 }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: isDark ? '#000' : '#fff', alignSelf: isDark ? 'flex-end' : 'flex-start' }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Report panel ── */}
        {showReport && ideas.length > 0 && (
          <View style={{ borderWidth: 1.5, borderColor: theme.borderStrong, borderRadius: 16, padding: 20, marginBottom: 16, backgroundColor: theme.card, gap: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, color: theme.text }}>Session Report</Text>

            {/* Status */}
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Status</Text>
              {[['Approved', stats.approved, '#16a34a'], ['Rejected', stats.rejected, '#dc2626'], ['Pending', stats.pending, '#9ca3af']].map(([l, n, c]) => (
                <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: c }}>{l}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{n} <Text style={{ color: theme.textMuted }}>({ideas.length ? Math.round(n / ideas.length * 100) : 0}%)</Text></Text>
                </View>
              ))}
            </View>

            {/* Categories */}
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Categories</Text>
              {CATEGORIES.map(c => { const n = ideas.filter(i => i.category === c).length; return n ? (
                <View key={c} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>{c}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{n}</Text>
                </View>
              ) : null; })}
            </View>

            {/* Priority */}
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Priority</Text>
              {[['High', 'high', '#dc2626'], ['Medium', 'medium', '#f59e0b'], ['Low', 'low', '#16a34a']].map(([l, k, c]) => { const n = ideas.filter(i => i.priority === k).length; return n ? (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: c }}>{l}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{n}</Text>
                </View>
              ) : null; })}
              { (() => { const n = ideas.filter(i => !i.priority).length; return n > 0 ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textMuted }}>Unset</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{n}</Text>
                </View>
              ) : null; })() }
            </View>

            {/* Assignees */}
            { (() => { const list = [...new Set(ideas.map(i => i.assignee).filter(Boolean))]; return list.length > 0 ? (
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Assignees</Text>
                {list.map(a => (
                  <View key={a} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: theme.text }}>@{a}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{ideas.filter(i => i.assignee === a).length} cards</Text>
                  </View>
                ))}
              </View>
            ) : null; })() }

            {/* Tags */}
            { (() => { const tags = [...new Set(ideas.flatMap(i => i.tags || []))]; return tags.length > 0 ? (
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Tags Used</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {tags.map(t => (
                    <View key={t} style={{ backgroundColor: theme.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted }}>#{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null; })() }

            {/* Export button */}
            <TouchableOpacity onPress={handleExportReport} style={{ backgroundColor: theme.btnBg, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ color: theme.btnText, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Export Full Report</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── History panel ── */}
        {showHistory && sessions.length > 0 && (
          <View style={{ borderWidth: 1, borderColor: theme.historyBorder, borderRadius: 12, marginBottom: 16, backgroundColor: theme.historyBg, overflow: 'hidden' }}>
            {sessions.map((s, i) => (
              <TouchableOpacity key={s.id} onPress={() => handleLoadSession(s)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: i < sessions.length - 1 ? 1 : 0, borderColor: theme.historyBorder }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{s.date}</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted }}>{s.count} cards</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Input ── */}
        <View style={{ marginBottom: 32, marginTop: 16 }}>
          <InputSection onSubmit={handleProcessNotes} isLoading={isLoading} theme={theme} />
        </View>

        {/* ── Results ── */}
        {ideas.length > 0 && (
          <View style={{ width: '100%' }}>

            {/* Section header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderColor: theme.separator, paddingBottom: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, color: theme.text }}>Extracted</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>{ideas.length}</Text>
                <TouchableOpacity onPress={() => setShowAddForm(v => !v)}>
                  <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.text }}>+ Add</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClear}>
                  <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats bar */}
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
              {[['Pending', '#6b7280', stats.pending], ['Approved', '#16a34a', stats.approved], ['Rejected', '#dc2626', stats.rejected]].map(([l, c, n]) => (
                <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c }} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: c }}>{l} {n}</Text>
                </View>
              ))}
            </View>

            {/* Search */}
            <TextInput value={search} onChangeText={setSearch} placeholder="Search cards, tags, assignees..." placeholderTextColor={theme.placeholder}
              style={{ borderWidth: 1.5, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: theme.text, backgroundColor: theme.inputBg, marginBottom: 12 }} />

            {/* Category filter */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <React.Fragment key="all">{pill('All', !activeCategory, () => setActiveCategory(null))}</React.Fragment>
              {CATEGORIES.map(cat => <React.Fragment key={cat}>{pill(cat, activeCategory === cat, () => setActiveCategory(activeCategory === cat ? null : cat))}</React.Fragment>)}
            </View>

            {/* Action bar */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              <TouchableOpacity onPress={handleBulkApprove} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#16a34a', backgroundColor: '#16a34a18' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#16a34a' }}>Approve All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkReject} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#dc2626', backgroundColor: '#dc262618' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: '#dc2626' }}>Reject All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExportApproved} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: theme.borderStrong, backgroundColor: theme.btnBg }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: theme.btnText }}>Export Approved</Text>
              </TouchableOpacity>
              {stats.rejected > 0 && (
                <TouchableOpacity onPress={handleReanalyzeRejected} disabled={isReanalyzing} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: theme.border }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: theme.textMuted }}>
                    {isReanalyzing ? 'Analyzing...' : `Re-analyze ${stats.rejected}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Manual add form */}
            {showAddForm && (
              <View style={{ borderWidth: 1.5, borderColor: theme.borderStrong, borderRadius: 16, padding: 20, marginBottom: 20, backgroundColor: theme.card, gap: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.text }}>New Card</Text>
                <TextInput value={newCard.title} onChangeText={t => setNewCard(p => ({ ...p, title: t }))} placeholder="Title" placeholderTextColor={theme.placeholder}
                  style={{ borderWidth: 1.5, borderColor: theme.border, borderRadius: 8, padding: 10, fontSize: 15, fontWeight: '700', color: theme.text, backgroundColor: theme.inputBg }} />
                <TextInput value={newCard.desc} onChangeText={t => setNewCard(p => ({ ...p, desc: t }))} placeholder="Description" placeholderTextColor={theme.placeholder} multiline
                  style={{ borderWidth: 1.5, borderColor: theme.border, borderRadius: 8, padding: 10, fontSize: 14, color: theme.text, minHeight: 64, textAlignVertical: 'top', backgroundColor: theme.inputBg }} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setNewCard(p => ({ ...p, category: cat }))}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: newCard.category === cat ? theme.tagBg : theme.border, backgroundColor: newCard.category === cat ? theme.tagBg : 'transparent' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: newCard.category === cat ? theme.tagText : theme.textMuted }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={handleAddCard} style={{ flex: 1, backgroundColor: theme.btnBg, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: theme.btnText, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Add Card</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowAddForm(false); setNewCard(EMPTY_CARD); }} style={{ flex: 1, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
                    <Text style={{ color: theme.textMuted, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Cards */}
            {displayed.length === 0 ? (
              <View style={{ borderWidth: 1.5, borderColor: theme.border, borderRadius: 12, paddingVertical: 32, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textMuted }}>No cards match your filter.</Text>
              </View>
            ) : (
              displayed.map((idea, index) => (
                <IdeaCard
                  key={idea.id || index}
                  idea={idea}
                  theme={theme}
                  allIdeas={ideas}
                  onUpdate={changes => handleUpdateIdea(idea.id, changes)}
                  onDelete={() => handleDeleteIdea(idea.id)}
                  onMoveUp={ideas.indexOf(idea) > 0 ? () => handleMoveUp(idea.id) : null}
                  onMoveDown={ideas.indexOf(idea) < ideas.length - 1 ? () => handleMoveDown(idea.id) : null}
                />
              ))
            )}
          </View>
        )}

        {/* ── Empty state ── */}
        {ideas.length === 0 && (
          <View style={{ borderWidth: 2, borderColor: theme.borderStrong, borderRadius: 12, paddingVertical: 64, paddingHorizontal: 24, alignItems: 'center', opacity: isLoading ? 0.5 : 1 }}>
            <Text style={{ color: theme.text, fontWeight: '900', fontSize: 24, textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 8 }}>
              {isLoading ? 'Structuring...' : 'Void'}
            </Text>
            <Text style={{ color: theme.textMuted, textAlign: 'center', fontWeight: '500', fontSize: 14, lineHeight: 22 }}>
              {isLoading ? 'Ordering chaos.' : 'Feed your notes.'}
            </Text>
          </View>
        )}

      </View>
    </ScrollView>
  );

  if (mode === 'voice') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <VoiceAvatarScreen theme={theme} onBack={() => setMode('main')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {isWeb ? content : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          {content}
        </KeyboardAvoidingView>
      )}
      <AuditFab theme={theme} onPress={() => setAuditOpen(true)} />
      <AuditWidget theme={theme} visible={auditOpen} onClose={() => setAuditOpen(false)} />
      <ExpertBridge theme={theme} visible={expertOpen} onClose={() => setExpertOpen(false)} />
    </SafeAreaView>
  );
}