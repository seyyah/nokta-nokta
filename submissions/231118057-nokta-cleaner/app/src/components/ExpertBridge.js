// ExpertBridge — minimum-impl Phase C (Track 1).
// When the user (or agent loop) is stuck, open a Jitsi Meet room with a
// random nokta-stuck-<timestamp> name. Jitsi is free, anonymous, supports
// screen-share + camera + mic with no API key. After the call, the user
// captures notes into a BRIDGE.md-shaped block they can paste into
// submissions/<no>/BRIDGE.md.

import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView, TextInput,
  Linking, Alert, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

const JITSI_BASE = 'https://meet.jit.si/';

function pad(n) { return n.toString().padStart(2, '0'); }
function nowStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function makeRoom() {
  // Avoid Jitsi's "common name" lobby/queue by using a long random suffix.
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `nokta-stuck-${ts}-${rnd}`;
}

function buildBridgeBlock({ room, trigger, expert, notes, outcome }) {
  const url = JITSI_BASE + room;
  return [
    `## Session ${nowStamp()}`,
    '',
    `- **Room:** \`${url}\``,
    `- **Triggered by:** ${trigger?.trim() || '_TBD_'}`,
    `- **Expert:** ${expert?.trim() || '_TBD (classmate)_'}`,
    `- **Screen-shared:** yes (code + browser)`,
    '',
    `**Summary**`,
    '',
    (notes?.trim() || '_TBD — what did the expert point out?_'),
    '',
    `**Outcome**`,
    '',
    (outcome?.trim() || '_TBD — which cycle resumed / what new hypothesis?_'),
    '',
    '---',
    '',
  ].join('\n');
}

export function ExpertHeaderButton({ theme, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>
        Expert
      </Text>
    </TouchableOpacity>
  );
}

export default function ExpertBridge({ theme, visible, onClose }) {
  // Generate a fresh room name each time the modal mounts.
  const [room, setRoom] = useState(() => makeRoom());
  const [trigger, setTrigger] = useState('');
  const [expert, setExpert] = useState('');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState(null);

  const url = useMemo(() => JITSI_BASE + room, [room]);

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`); // eslint-disable-line no-alert
    else Alert.alert(title, msg);
  };

  const handleOpen = async () => {
    setError(null);
    try {
      if (Platform.OS === 'web') {
        // open in a new tab so app + call live side-by-side
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        await Linking.openURL(url);
      }
      setOpened(true);
    } catch (e) {
      setError('Could not open call: ' + (e?.message ?? e));
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(url);
    showAlert('Link copied', `Send this to your expert:\n\n${url}`);
  };

  const handleCopyBridgeBlock = async () => {
    const md = buildBridgeBlock({ room, trigger, expert, notes, outcome });
    await Clipboard.setStringAsync(md);
    showAlert(
      'BRIDGE block copied',
      'Paste this under "## Sessions" in submissions/231118057-nokta-cleaner/BRIDGE.md.'
    );
  };

  const handleNewRoom = () => {
    setRoom(makeRoom());
    setOpened(false);
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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}>
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
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}>Uzmana Bağlan</Text>
                <Text style={{ color: theme.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>
                  Stuck cycle &middot; Jitsi Meet
                </Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, color: theme.textMuted }}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* room block */}
            <View style={{ padding: 14, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1.5, borderColor: theme.borderStrong, gap: 10 }}>
              {fieldLabel('Room URL')}
              <Text selectable style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: theme.text }}>
                {url}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <TouchableOpacity onPress={handleOpen}
                  style={{ flex: 1, minWidth: 140, backgroundColor: opened ? theme.btnDisabledBg : theme.btnBg, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: theme.borderStrong }}>
                  <Text style={{ color: opened ? theme.btnDisabledText : theme.btnText, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {opened ? 'Opened ✓' : '📞 Open call'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCopyLink}
                  style={{ flex: 1, minWidth: 140, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: theme.border }}>
                  <Text style={{ color: theme.text, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Copy link</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNewRoom}
                  style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: theme.border }}>
                  <Text style={{ color: theme.textMuted, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>↻</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* form */}
            <View><View>{fieldLabel('Why are you stuck? (which cycle / issue)')}<TextInput value={trigger} onChangeText={setTrigger} multiline placeholder="e.g. Cycle 4 — expo-audio metering returns 0 on real device" placeholderTextColor={theme.placeholder} style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]} /></View></View>
            <View>{fieldLabel('Expert (classmate / TA name)')}<TextInput value={expert} onChangeText={setExpert} placeholder="e.g. Ahmet (231118XXX)" placeholderTextColor={theme.placeholder} style={inputStyle} /></View>
            <View>{fieldLabel('Post-call notes (what did they point out?)')}<TextInput value={notes} onChangeText={setNotes} multiline placeholder="Fill this AFTER the call." placeholderTextColor={theme.placeholder} style={[inputStyle, { minHeight: 90, textAlignVertical: 'top' }]} /></View>
            <View>{fieldLabel('Outcome (next cycle / new hypothesis)')}<TextInput value={outcome} onChangeText={setOutcome} multiline placeholder="e.g. Cycle 5 resumes with isMeteringEnabled in options" placeholderTextColor={theme.placeholder} style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]} /></View>

            {error && (
              <View style={{ padding: 10, borderRadius: 8, backgroundColor: '#dc262615', borderWidth: 1, borderColor: '#dc2626' }}>
                <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '700' }}>{error}</Text>
              </View>
            )}

            <TouchableOpacity onPress={handleCopyBridgeBlock}
              style={{ backgroundColor: theme.btnBg, paddingVertical: 13, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: theme.borderStrong }}>
              <Text style={{ color: theme.btnText, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Copy BRIDGE.md block</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 10, color: theme.textMuted, lineHeight: 14 }}>
              Track 1 minimum impl: button-triggered Jitsi room. Demo requirement: ≥60 sn screen-shared call with classmate as expert. Auto-stuck detection (Track 3) intentionally not implemented.
            </Text>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
