import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const CATEGORIES = ['Technical', 'Business', 'Design', 'Other'];
const PRIORITIES  = [
  { key: 'high',   label: '!! High',   color: '#dc2626' },
  { key: 'medium', label: '·  Medium', color: '#f59e0b' },
  { key: 'low',    label: '○  Low',    color: '#16a34a' },
];

export default function IdeaCard({ idea, onUpdate, onDelete, onMoveUp, onMoveDown, theme, allIdeas }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showNote, setShowNote]   = useState(!!idea.comment);
  const [tagInput, setTagInput]   = useState('');
  const [editData, setEditData]   = useState({
    title: idea.title, desc: idea.desc, category: idea.category,
    priority: idea.priority || null, assignee: idea.assignee || '',
    tags: idea.tags || [], linkedIds: idea.linkedIds || [],
  });

  const status   = idea.status || 'pending';
  const priority = PRIORITIES.find(p => p.key === (idea.priority || null));

  const borderColor = status === 'approved' ? '#16a34a' : status === 'rejected' ? '#dc2626' : theme.border;
  const borderWidth = status !== 'pending' ? 2 : 1;

  const handleSave = () => { onUpdate(editData); setIsEditing(false); };
  const handleCancelEdit = () => {
    setEditData({ title: idea.title, desc: idea.desc, category: idea.category, priority: idea.priority || null, assignee: idea.assignee || '', tags: idea.tags || [], linkedIds: idea.linkedIds || [] });
    setIsEditing(false);
  };
  const handleCopy = async () => { await Clipboard.setStringAsync(`[${idea.category}] ${idea.title}\n${idea.desc}`); };
  const toggleApprove = () => onUpdate({ status: status === 'approved' ? 'pending' : 'approved' });
  const toggleReject  = () => onUpdate({ status: status === 'rejected' ? 'pending' : 'rejected' });

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !editData.tags.includes(t)) setEditData(p => ({ ...p, tags: [...p.tags, t] }));
    setTagInput('');
  };
  const removeTag = (tag) => setEditData(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }));
  const toggleLink = (id) => setEditData(p => ({
    ...p, linkedIds: p.linkedIds.includes(id) ? p.linkedIds.filter(x => x !== id) : [...p.linkedIds, id],
  }));

  const s = {
    label: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    sectionTitle: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted, marginBottom: 6 },
    actionBtn: (active, color) => ({ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: active ? color : theme.border, backgroundColor: active ? color + '18' : 'transparent' }),
    actionTxt: (active, color) => ({ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: active ? color : theme.textMuted }),
    input: { borderWidth: 1.5, borderColor: theme.border, borderRadius: 8, padding: 10, color: theme.text, backgroundColor: theme.inputBg },
    pill: (active, color) => ({ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, borderWidth: 1.5, borderColor: active ? color : theme.border, backgroundColor: active ? color + '20' : 'transparent' }),
  };

  return (
    <View style={{ marginBottom: 20, backgroundColor: theme.card, borderRadius: 16, padding: 24, borderWidth, borderColor, opacity: status === 'rejected' ? 0.6 : 1, ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 } : { elevation: 2 }) }}>

      {/* Status badge */}
      {status !== 'pending' && (
        <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
          <View style={{ backgroundColor: status === 'approved' ? '#16a34a' : '#dc2626', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={[s.label, { color: '#fff' }]}>{status === 'approved' ? 'Approved' : 'Rejected'}</Text>
          </View>
        </View>
      )}

      {isEditing ? (
        /* ─── EDIT MODE ─── */
        <View style={{ gap: 14 }}>
          <TextInput value={editData.title} onChangeText={t => setEditData(p => ({ ...p, title: t }))} placeholder="Title" placeholderTextColor={theme.placeholder} style={[s.input, { fontSize: 16, fontWeight: '700' }]} />
          <TextInput value={editData.desc} onChangeText={t => setEditData(p => ({ ...p, desc: t }))} placeholder="Description" placeholderTextColor={theme.placeholder} multiline style={[s.input, { fontSize: 14, minHeight: 72, textAlignVertical: 'top' }]} />

          {/* Category */}
          <View>
            <Text style={s.sectionTitle}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setEditData(p => ({ ...p, category: cat }))}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: editData.category === cat ? theme.tagBg : theme.border, backgroundColor: editData.category === cat ? theme.tagBg : 'transparent' }}>
                  <Text style={[s.label, { color: editData.category === cat ? theme.tagText : theme.textMuted }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View>
            <Text style={s.sectionTitle}>Priority</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {PRIORITIES.map(p => (
                <TouchableOpacity key={p.key} onPress={() => setEditData(prev => ({ ...prev, priority: prev.priority === p.key ? null : p.key }))}
                  style={s.pill(editData.priority === p.key, p.color)}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: editData.priority === p.key ? p.color : theme.textMuted }}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Assignee */}
          <View>
            <Text style={s.sectionTitle}>Assignee</Text>
            <TextInput value={editData.assignee} onChangeText={t => setEditData(p => ({ ...p, assignee: t }))} placeholder="@name" placeholderTextColor={theme.placeholder} style={[s.input, { fontSize: 14 }]} />
          </View>

          {/* Tags */}
          <View>
            <Text style={s.sectionTitle}>Tags</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {editData.tags.map(tag => (
                <TouchableOpacity key={tag} onPress={() => removeTag(tag)}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, gap: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted }}>#{tag}</Text>
                  <Text style={{ fontSize: 10, color: theme.textMuted }}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag} placeholder="add tag..." placeholderTextColor={theme.placeholder} style={[s.input, { flex: 1, fontSize: 13 }]} />
              <TouchableOpacity onPress={addTag} style={{ paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1.5, borderColor: theme.border, borderRadius: 8, backgroundColor: theme.inputBg }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textMuted }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Link to other cards */}
          {allIdeas && allIdeas.filter(i => i.id !== idea.id).length > 0 && (
            <View>
              <Text style={s.sectionTitle}>Link to cards</Text>
              <View style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 10, overflow: 'hidden' }}>
                {allIdeas.filter(i => i.id !== idea.id).map((other, idx, arr) => (
                  <TouchableOpacity key={other.id} onPress={() => toggleLink(other.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: idx < arr.length - 1 ? 1 : 0, borderColor: theme.border, backgroundColor: editData.linkedIds.includes(other.id) ? theme.tagBg + '12' : 'transparent', gap: 10 }}>
                    <View style={{ width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: editData.linkedIds.includes(other.id) ? theme.tagBg : theme.border, backgroundColor: editData.linkedIds.includes(other.id) ? theme.tagBg : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      {editData.linkedIds.includes(other.id) && <Text style={{ fontSize: 9, color: theme.tagText, fontWeight: '900' }}>✓</Text>}
                    </View>
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: theme.text }} numberOfLines={1}>{other.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Save / Cancel */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleSave} style={{ flex: 1, backgroundColor: theme.btnBg, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={[s.label, { color: theme.btnText, letterSpacing: 1 }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelEdit} style={{ flex: 1, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}>
              <Text style={[s.label, { color: theme.textMuted, letterSpacing: 1 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* ─── VIEW MODE ─── */
        <>
          {/* Header row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 12 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
              {priority && (
                <View style={{ backgroundColor: priority.color + '20', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: priority.color }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: priority.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{priority.key}</Text>
                </View>
              )}
              <Text style={{ flex: 1, fontSize: 20, fontWeight: '800', color: theme.text, lineHeight: 26 }} numberOfLines={3}>{idea.title}</Text>
            </View>
            <View style={{ backgroundColor: theme.tagBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, flexShrink: 0, maxWidth: '40%' }}>
              <Text style={[s.label, { color: theme.tagText, letterSpacing: 1.5 }]} numberOfLines={1}>{idea.category}</Text>
            </View>
          </View>

          {/* Assignee */}
          {idea.assignee ? (
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textMuted, marginBottom: 10 }}>@{idea.assignee}</Text>
          ) : null}

          {/* Description */}
          <Text style={{ color: theme.textMuted, lineHeight: 22, marginBottom: 14, fontSize: 14, fontWeight: '500' }}>{idea.desc}</Text>

          {/* Tags */}
          {idea.tags?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {idea.tags.map(tag => (
                <View key={tag} style={{ backgroundColor: theme.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textMuted }}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Linked cards */}
          {idea.linkedIds?.length > 0 && allIdeas && (
            <View style={{ marginBottom: 12 }}>
              {idea.linkedIds.map(id => {
                const linked = allIdeas.find(i => i.id === id);
                return linked ? (
                  <Text key={id} style={{ fontSize: 12, fontWeight: '600', color: theme.textMuted }} numberOfLines={1}>↗ {linked.title}</Text>
                ) : null;
              })}
            </View>
          )}

          {/* Note input */}
          {(showNote || idea.comment) && (
            <TextInput
              value={idea.comment || ''}
              onChangeText={t => onUpdate({ comment: t })}
              multiline
              placeholder="Expert note..."
              placeholderTextColor={theme.placeholder}
              style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 10, fontSize: 13, color: theme.text, minHeight: 56, textAlignVertical: 'top', marginBottom: 14, backgroundColor: theme.inputBg }}
            />
          )}

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <TouchableOpacity onPress={toggleApprove} style={s.actionBtn(status === 'approved', '#16a34a')}>
              <Text style={s.actionTxt(status === 'approved', '#16a34a')}>✓ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleReject} style={s.actionBtn(status === 'rejected', '#dc2626')}>
              <Text style={s.actionTxt(status === 'rejected', '#dc2626')}>✗ Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowNote(true)} style={s.actionBtn(!!idea.comment, theme.borderStrong)}>
              <Text style={s.actionTxt(!!idea.comment, theme.borderStrong)}>Note</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={s.actionBtn(false, theme.borderStrong)}>
              <Text style={s.actionTxt(false, theme.borderStrong)}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCopy} style={s.actionBtn(false, theme.borderStrong)}>
              <Text style={s.actionTxt(false, theme.borderStrong)}>Copy</Text>
            </TouchableOpacity>
            {onMoveUp && (
              <TouchableOpacity onPress={onMoveUp} style={s.actionBtn(false, theme.borderStrong)}>
                <Text style={s.actionTxt(false, theme.borderStrong)}>↑</Text>
              </TouchableOpacity>
            )}
            {onMoveDown && (
              <TouchableOpacity onPress={onMoveDown} style={s.actionBtn(false, theme.borderStrong)}>
                <Text style={s.actionTxt(false, theme.borderStrong)}>↓</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}
