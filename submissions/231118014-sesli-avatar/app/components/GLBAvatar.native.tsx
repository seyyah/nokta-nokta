import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

type Props = {
  level: number;
  label?: string;
};

/**
 * Native fallback — GLB rendering on Expo Go requires expo-gl + r3f/native
 * which aren't part of this Go build. The runtime lipsync signal still drives
 * the SVG avatar on the same screen; this card confirms the GLB is bundled
 * and ready to swap in once a custom dev client is available.
 *
 * `.native.tsx` ensures Metro never tries to require avatar.glb or pull
 * @react-three/* into the native bundle.
 */
function GLBAvatarImpl({ label }: Props) {
  return (
    <View style={styles.fallback}>
      <View style={styles.fallbackBadge}>
        <Text style={styles.fallbackBadgeText}>GLB · avaturn</Text>
      </View>
      <Text style={styles.fallbackTitle}>avatar.glb hazır</Text>
      <Text style={styles.fallbackBody}>
        Kendi yüzün repoda. Web önizlemede tam 3D render edilir; Expo Go iOS/Android
        runtime'ında SVG ayna lipsync sinyalini tüketir — aynı 0..1 jawOpen değeri.
      </Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

export const GLBAvatar = memo(GLBAvatarImpl);

const styles = StyleSheet.create({
  fallback: {
    width: "100%",
    padding: 18,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    alignItems: "flex-start",
    gap: 8,
  },
  fallbackBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: Colors.accent,
    marginBottom: 4,
  },
  fallbackBadgeText: {
    color: Colors.accent,
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: "600",
  },
  fallbackTitle: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  fallbackBody: { color: Colors.textMuted, fontSize: 13, lineHeight: 19 },
  label: {
    marginTop: 8,
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
