import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Camera, Check, Copy, ExternalLink, Mic, MonitorUp } from 'lucide-react-native';
import { colors } from '../theme';

const fallbackRoomUrl = 'https://meet.jit.si/nokta-231118040-final-bridge';
const meetingUrl = process.env.EXPO_PUBLIC_BRIDGE_ROOM_URL || fallbackRoomUrl;

const capabilities = [
  { Icon: Camera, label: 'Video', detail: 'izin ver' },
  { Icon: Mic, label: 'Audio', detail: 'izin ver' },
  { Icon: MonitorUp, label: 'Share', detail: 'odada baslat' },
];

export function BridgeScreen() {
  const [copied, setCopied] = useState(false);

  async function copyRoom() {
    await Clipboard.setStringAsync(meetingUrl);
    setCopied(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.alert}>
        <Text style={styles.alertLabel}>ESCALATION ACTIVE</Text>
        <Text style={styles.alertTitle}>Cycle 4 / STUCK</Text>
        <Text style={styles.alertText}>
          Dudak senkronu ve gercek cihaz gecikmesi bir uzmanla ekran paylasimli dogrulama bekliyor.
        </Text>
      </View>

      <View style={styles.surface}>
        <Text style={styles.sectionTitle}>Canli kopru gereksinimleri</Text>
        <View style={styles.capabilities}>
          {capabilities.map(({ Icon, detail, label }) => (
            <View key={label} style={styles.capability}>
              <Icon color={colors.accent} size={21} />
              <Text style={styles.capabilityLabel}>{label}</Text>
              <Text style={styles.capabilityDetail}>{detail}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.surface}>
        <Text style={styles.sectionTitle}>Jitsi expert room</Text>
        <View style={styles.shareInstruction}>
          <MonitorUp color={colors.accent} size={19} />
          <View style={styles.shareInstructionCopy}>
            <Text style={styles.shareInstructionLabel}>EKRAN PAYLASIMI</Text>
            <Text style={styles.shareInstructionText}>
              Odaya girdikten sonra Jitsi icindeki ekran paylas eylemini baslat.
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.link}>{meetingUrl}</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => void Linking.openURL(meetingUrl)} style={styles.primary}>
            <ExternalLink color="#ffffff" size={18} />
            <Text style={styles.primaryText}>Uzmana Baglan</Text>
          </Pressable>
          <Pressable onPress={() => void copyRoom()} style={styles.secondary}>
            {copied ? <Check color={colors.voice} size={18} /> : <Copy color={colors.ink} size={18} />}
          </Pressable>
        </View>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Demo kaydi</Text>
        <Text style={styles.noteText}>
          Sinif arkadasi odaya video ve ses ile katilir. Bu cihazdan ekran paylasimi acilir ve gorusme
          kayitta en az 60 saniye gorunur.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 92,
    paddingHorizontal: 18,
  },
  alert: {
    backgroundColor: '#fff0f2',
    borderColor: '#f5bdc5',
    borderRadius: 8,
    borderWidth: 1,
    padding: 15,
  },
  alertLabel: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '800',
  },
  alertTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '800',
    marginTop: 6,
  },
  alertText: {
    color: '#5f4450',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  surface: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  capabilities: {
    flexDirection: 'row',
    gap: 8,
  },
  capability: {
    alignItems: 'center',
    backgroundColor: colors.canvas,
    borderRadius: 7,
    flex: 1,
    gap: 5,
    paddingVertical: 12,
  },
  capabilityLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  capabilityDetail: {
    color: colors.muted,
    fontSize: 10,
  },
  link: {
    backgroundColor: colors.canvas,
    borderRadius: 6,
    color: colors.accent,
    fontSize: 12,
    lineHeight: 18,
    padding: 10,
  },
  shareInstruction: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 7,
    flexDirection: 'row',
    gap: 9,
    marginBottom: 10,
    padding: 10,
  },
  shareInstructionCopy: {
    flex: 1,
  },
  shareInstructionLabel: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
  },
  shareInstructionText: {
    color: colors.ink,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  primary: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 7,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondary: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    justifyContent: 'center',
    width: 54,
  },
  note: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 15,
  },
  noteTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  noteText: {
    color: '#cfd7e2',
    fontSize: 12,
    lineHeight: 19,
  },
});
