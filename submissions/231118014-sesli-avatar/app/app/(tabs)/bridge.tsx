import * as WebBrowser from "expo-web-browser";
import { ExternalLink, PhoneCall, ScreenShare, Video } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "@/constants/colors";
import { useForge, type CycleStatus } from "@/providers/ForgeProvider";

/**
 * Phase C — HITL bridge. Opens a Jitsi room (video + audio + screen share)
 * for the cases where agent + dev are both STUCK. Jitsi is chosen because
 * it needs no API key and works in any mobile browser — Expo Go cannot
 * load custom WebRTC native modules.
 */
export default function BridgeScreen() {
  const { cycles } = useForge();
  const [room, setRoom] = useState<string>("");

  const defaultRoom = useMemo(() => {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `nokta-nokta-${stamp}`;
  }, []);

  const stuckCycles = useMemo(() => cycles.filter((c) => c.status === "STUCK"), [cycles]);

  /**
   * Bridge is "armed" only when the last 2 cycles in a row are failing
   * (ROLLBACK or STUCK). cycles[] is stored newest-first, so we look at
   * the first two entries.
   */
  const isArmed = useMemo(() => {
    if (cycles.length < 2) return false;
    const failing = (s: CycleStatus) => s === "ROLLBACK" || s === "STUCK";
    return failing(cycles[0].status) && failing(cycles[1].status);
  }, [cycles]);

  const openCall = async () => {
    if (!isArmed) return;
    const slug = (room.trim() || defaultRoom).replace(/\s+/g, "-").toLowerCase();
    const url = `https://meet.jit.si/${encodeURIComponent(slug)}#config.prejoinPageEnabled=false`;
    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: Colors.accent,
      });
    } catch (e) {
      console.log("[bridge] open error", e);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Phase C — Köprü</Text>
        <Text style={styles.title}>Sıkıştığında{"\n"}bir insan gelir.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.featureRow}>
          <Feature icon={<Video color={Colors.accent} size={18} />} label="Video" />
          <Feature icon={<PhoneCall color={Colors.accent} size={18} />} label="Ses" />
          <Feature icon={<ScreenShare color={Colors.accent} size={18} />} label="Ekran" />
        </View>

        <Text style={styles.label}>Oda adı</Text>
        <TextInput
          value={room}
          onChangeText={setRoom}
          placeholder={defaultRoom}
          placeholderTextColor={Colors.textDim}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          Aynı oda adını uzmana ilet; ikiniz de bu butondan girince görüşme açılır.
        </Text>

        <Pressable
          onPress={openCall}
          disabled={!isArmed}
          accessibilityState={{ disabled: !isArmed }}
          style={({ pressed }) => [
            styles.cta,
            !isArmed && styles.ctaDisabled,
            isArmed && pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
          ]}
          testID="open-bridge-call"
        >
          <PhoneCall color={isArmed ? Colors.bg : Colors.textDim} size={18} />
          <Text style={[styles.ctaText, !isArmed && styles.ctaTextDisabled]}>Uzmana Bağlan</Text>
          <ExternalLink color={isArmed ? Colors.bg : Colors.textDim} size={14} />
        </Pressable>

        <Text style={[styles.hint, { marginTop: 10 }]}>
          {isArmed
            ? "Son 2 cycle üst üste başarısız — köprü aktif."
            : "Köprü yalnızca son 2 cycle üst üste ROLLBACK veya STUCK olduğunda etkinleşir."}
        </Text>
      </View>

      <View style={styles.stuckBlock}>
        <Text style={styles.sectionTitle}>STUCK cycles</Text>
        {stuckCycles.length === 0 ? (
          <Text style={styles.emptyText}>
            Henüz STUCK cycle yok. Bir cycle'ı kasıtlı olarak STUCK işaretle, ardından
            yukarıdan görüşmeyi başlat.
          </Text>
        ) : (
          stuckCycles.map((c) => (
            <View key={c.id} style={styles.stuckRow}>
              <View style={styles.dot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stuckSlug}>{c.slug}</Text>
                {c.hypothesis ? (
                  <Text style={styles.stuckHyp} numberOfLines={2}>
                    {c.hypothesis}
                  </Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.footnote}>
        <Text style={styles.footnoteTitle}>Neden Jitsi?</Text>
        <Text style={styles.footnoteBody}>
          Anahtar gerektirmez, mobil tarayıcıda ekran paylaşımını destekler ve Expo Go custom
          native WebRTC modülü yükleyemediği için tarayıcı-tabanlı köprü en güvenilir yoldur.
          Track C için demo'da ≥60sn video+ses+ekran üçünü birden aktif gör.
        </Text>
      </View>
    </ScrollView>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.feature}>
      {icon}
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 80, gap: 16 },
  header: { marginBottom: 4 },
  eyebrow: {
    color: Colors.accent,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: { color: Colors.text, fontSize: 28, fontWeight: "700", lineHeight: 34 },
  card: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 18,
  },
  featureRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  feature: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  featureLabel: { color: Colors.text, fontSize: 12, fontWeight: "600" },
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    borderWidth: 0.5,
    borderColor: Colors.border,
    fontSize: 14,
  },
  hint: { color: Colors.textDim, fontSize: 12, marginTop: 8, lineHeight: 17 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 16,
  },
  ctaText: { color: Colors.bg, fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  ctaDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  ctaTextDisabled: { color: Colors.textDim },
  stuckBlock: { gap: 10 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: "600", marginBottom: 4 },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.bgElevated,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  stuckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.bgElevated,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  stuckSlug: { color: Colors.text, fontSize: 14, fontWeight: "600" },
  stuckHyp: { color: Colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  footnote: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  footnoteTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  footnoteBody: { color: Colors.text, fontSize: 13, lineHeight: 20 },
});
