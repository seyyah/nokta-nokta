// AuditWidget — FAB + modal that turns a spoken observation into an audit
// report markdown file. Voice → Gemini multimodal STT → editable form →
// clipboard. The user pastes the result into a new file under
// audit-reports/. Burn-in screenshot remains a separate, manual step.

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView, TextInput,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { createRecorder } from '../lib/audioRecorder';
import { transcribeAudio } from '../services/GeminiService';

const REPORTER_ID = 'customer-developer (231118057)';
const SEVERITIES = ['low', 'medium', 'high'];

function pad(n) { return n.toString().padStart(2, '0'); }
function nowStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'untitled';
}

function buildMarkdown({ title, screen, severity, type, transcript, wants }) {
  const cleanTranscript = (transcript || '').trim() || '_(no transcript captured)_';
  const wantsBlock = (wants || '').trim()
    ? wants.trim()
    : '_TBD — dictate a second take or write manually._';

  return [
    `# Audit Report — ${title || 'untitled'}`,
    '',
    `**ID:** \`audit-NNN\` _(rename when saving to audit-reports/0X-${slugify(title)}.md)_`,
    `**Screen:** \`${screen || 'TBD'}\``,
    `**Captured:** ${nowStamp()} (${Platform.OS} — dictated via AuditWidget)`,
    `**Reporter:** ${REPORTER_ID}`,
    `**Severity:** ${severity || 'medium'}`,
    `**Type:** ${type || 'TBD'}`,
    '',
    '---',
    '',
    '## Burn-in Screenshot',
    '',
    `> _TBD — save screenshot to \`audit-reports/assets/NN-${slugify(title)}.png\` and reference here._`,
    '',
    '---',
    '',
    '## What the customer sees',
    '',
    cleanTranscript,
    '',
    '---',
    '',
    '## What the customer wants',
    '',
    wantsBlock,
    '',
    '---',
    '',
    '## Source context (agent için ipucu)',
    '',
    '> _TBD — point the agent to relevant files / lines._',
    '',
    '---',
    '',
    '## Suggested forge hypothesis',
    '',
    '> _TBD — propose a minimal diff and expected impact._',
    '',
  ].join('\n');
}

// ─────────────────────── FAB (export) ───────────────────────
export function AuditFab({ theme, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        position: 'absolute', right: 20, bottom: 24,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: theme.btnBg,
        borderWidth: 2, borderColor: theme.borderStrong,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    >
      <Text style={{ color: theme.btnText, fontSize: 22, fontWeight: '900' }}>◉</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────── widget (export) ───────────────────────
export default function AuditWidget({ theme, visible, onClose }) {
  const recorder = useMemo(() => createRecorder(), []);
  const [target, setTarget] = useState('sees'); // 'sees' or 'wants' — which take we are recording
  const [phase, setPhase] = useState('idle'); // 'idle' | 'recording' | 'transcribing'
  const [transcript, setTranscript] = useState('');
  const [wants, setWants] = useState('');
  const [title, setTitle] = useState('');
  const [screen, setScreen] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [type, setType] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);

  // Tick timer while recording
  const [tickSec, setTickSec] = useState(0);
  useEffect(() => {
    if (phase !== 'recording') return;
    setTickSec(0);
    const start = Date.now();
    const id = setInterval(() => setTickSec(Math.floor((Date.now() - start) / 1000)), 250);
    return () => clearInterval(id);
  }, [phase]);

  // Stop on unmount
  useEffect(() => () => { recorder.stop().catch(() => {}); }, [recorder]);

  const handleToggleRecord = useCallback(async (which) => {
    setError(null);
    try {
      if (phase === 'recording') {
        setPhase('transcribing');
        const result = await recorder.stop();
        if (!result || !result.base64) {
          throw new Error('Recording produced no audio data.');
        }
        const text = await transcribeAudio(result.base64, result.mimeType);
        if (target === 'sees') setTranscript((prev) => (prev ? prev + ' ' + text : text));
        else setWants((prev) => (prev ? prev + ' ' + text : text));
        setPhase('idle');
      } else {
        setTarget(which);
        await recorder.start();
        setPhase('recording');
      }
    } catch (e) {
      const msg = e?.message ?? String(e);
      setError(msg);
      setPhase('idle');
    }
  }, [phase, recorder, target]);

  const markdown = buildMarkdown({ title, screen, severity, type, transcript, wants });
  const suggestedFilename = `audit-reports/NN-${slugify(title)}.md`;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(markdown);
      const msg = `Markdown copied. Paste into:\n\n${suggestedFilename}\n\n(rename NN to the next sequential number, e.g. 04, 05...)`;
      if (Platform.OS === 'web') {
        // eslint-disable-next-line no-alert
        window.alert(msg);
      } else {
        Alert.alert('Copied', msg);
      }
    } catch (e) {
      setError('Clipboard write failed: ' + (e?.message ?? e));
    }
  };

  // Web-only: trigger a browser download with the markdown body.
  // Filename uses 'NN' placeholder; user renames in their Downloads folder
  // (or drops it straight into audit-reports/ and renames there).
  const handleDownload = () => {
    try {
      const filename = `audit-NN-${slugify(title)}.md`;
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a);
      a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 200);
    } catch (e) {
      setError('Download failed: ' + (e?.message ?? e));
    }
  };

  const handleReset = () => {
    setTranscript(''); setWants(''); setTitle(''); setScreen('');
    setSeverity('medium'); setType(''); setShowPreview(false); setError(null);
  };

  const recordBtn = (which, label) => {
    const isThis = phase === 'recording' && target === which;
    const disabled = phase === 'transcribing' || (phase === 'recording' && !isThis);
    return (
      <TouchableOpacity
        onPress={() => handleToggleRecord(which)}
        disabled={disabled}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          paddingHorizontal: 14, paddingVertical: 9,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: isThis ? '#dc2626' : theme.borderStrong,
          backgroundColor: isThis ? '#dc2626' : (disabled ? theme.btnDisabledBg : theme.btnBg),
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <View style={{
          width: 10, height: 10, borderRadius: isThis ? 2 : 5,
          backgroundColor: isThis ? '#fff' : theme.btnText,
        }} />
        <Text style={{
          fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1,
          color: isThis ? '#fff' : (disabled ? theme.btnDisabledText : theme.btnText),
        }}>
          {isThis ? `Stop · ${pad(Math.floor(tickSec/60))}:${pad(tickSec%60)}` : label}
        </Text>
      </TouchableOpacity>
    );
  };

  const fieldLabel = (s) => (
    <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted, marginBottom: 4 }}>
      {s}
    </Text>
  );

  const inputStyle = {
    borderWidth: 1.5, borderColor: theme.border, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 14, color: theme.text, backgroundColor: theme.inputBg,
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="overFullScreen" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{
          flex: 1, marginTop: 60,
          backgroundColor: theme.bg,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          borderWidth: 1.5, borderColor: theme.borderStrong,
        }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80, gap: 16 }} keyboardShouldPersistTaps="handled">
            {/* header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}>Audit Report</Text>
                <Text style={{ color: theme.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>
                  Voice · STT · Markdown
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* metadata fields */}
            <View style={{ gap: 10 }}>
              <View>{fieldLabel('Title (short and punchy)')}<TextInput value={title} onChangeText={setTitle} placeholder="e.g. ActionRow overflow on narrow screen" placeholderTextColor={theme.placeholder} style={inputStyle} /></View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 2 }}>{fieldLabel('Screen / location')}<TextInput value={screen} onChangeText={setScreen} placeholder="e.g. IdeaCard" placeholderTextColor={theme.placeholder} style={inputStyle} /></View>
                <View style={{ flex: 1 }}>{fieldLabel('Type')}<TextInput value={type} onChangeText={setType} placeholder="layout / copy / bug" placeholderTextColor={theme.placeholder} style={inputStyle} /></View>
              </View>
              <View>
                {fieldLabel('Severity')}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {SEVERITIES.map((s) => {
                    const active = severity === s;
                    return (
                      <TouchableOpacity key={s} onPress={() => setSeverity(s)}
                        style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99, borderWidth: 1.5, borderColor: active ? theme.borderStrong : theme.border, backgroundColor: active ? theme.borderStrong : 'transparent' }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, color: active ? theme.bg : theme.textMuted }}>{s}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* sees take */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                {fieldLabel('What the customer sees (transcript — editable)')}
                {recordBtn('sees', transcript ? 'Re-record + append' : 'Record')}
              </View>
              <TextInput
                value={transcript} onChangeText={setTranscript} multiline
                placeholder="Hit record and describe the issue. Transcript lands here when you stop."
                placeholderTextColor={theme.placeholder}
                style={[inputStyle, { minHeight: 90, textAlignVertical: 'top' }]}
              />
            </View>

            {/* wants take */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                {fieldLabel('What the customer wants (optional — second take)')}
                {recordBtn('wants', wants ? 'Re-record + append' : 'Record')}
              </View>
              <TextInput
                value={wants} onChangeText={setWants} multiline
                placeholder="Optional. Describe the desired fix or expected behavior."
                placeholderTextColor={theme.placeholder}
                style={[inputStyle, { minHeight: 70, textAlignVertical: 'top' }]}
              />
            </View>

            {/* status / error */}
            {phase === 'transcribing' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
                <ActivityIndicator size="small" color={theme.text} />
                <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>Transcribing via Gemini...</Text>
              </View>
            )}
            {error && (
              <View style={{ padding: 10, borderRadius: 8, backgroundColor: '#dc262615', borderWidth: 1, borderColor: '#dc2626' }}>
                <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700' }}>{error}</Text>
              </View>
            )}

            {/* preview toggle */}
            <TouchableOpacity onPress={() => setShowPreview((v) => !v)}>
              <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>
                {showPreview ? '▾ Hide markdown preview' : '▸ Show markdown preview'}
              </Text>
            </TouchableOpacity>
            {showPreview && (
              <View style={{ padding: 12, borderRadius: 8, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
                <Text selectable style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, color: theme.text, lineHeight: 16 }}>
                  {markdown}
                </Text>
              </View>
            )}

            {/* actions */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={handleCopy}
                disabled={!transcript.trim() && !wants.trim()}
                style={{
                  flex: 2, backgroundColor: theme.btnBg, paddingVertical: 13, borderRadius: 10, alignItems: 'center',
                  opacity: (!transcript.trim() && !wants.trim()) ? 0.4 : 1,
                }}>
                <Text style={{ color: theme.btnText, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Copy markdown</Text>
              </TouchableOpacity>
              {Platform.OS === 'web' && (
                <TouchableOpacity onPress={handleDownload}
                  disabled={!transcript.trim() && !wants.trim()}
                  style={{
                    flex: 2, borderWidth: 1.5, borderColor: theme.borderStrong,
                    paddingVertical: 13, borderRadius: 10, alignItems: 'center',
                    opacity: (!transcript.trim() && !wants.trim()) ? 0.4 : 1,
                  }}>
                  <Text style={{ color: theme.text, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>⬇ Download .md</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleReset}
                style={{ flex: 1, borderWidth: 1.5, borderColor: theme.border, paddingVertical: 13, borderRadius: 10, alignItems: 'center' }}>
                <Text style={{ color: theme.textMuted, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Reset</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 10, color: theme.textMuted, lineHeight: 14 }}>
              Suggested filename: <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: theme.text }}>{suggestedFilename}</Text>
              {'\n'}Burn-in screenshot is a separate step — drop a .png into <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: theme.text }}>audit-reports/assets/</Text> and update the markdown reference.
            </Text>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
