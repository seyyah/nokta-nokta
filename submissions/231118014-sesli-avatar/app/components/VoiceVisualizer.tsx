import React, { memo, useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Colors from "@/constants/colors";

type Props = {
  /** 0..1 normalised mic loudness. */
  level: number;
  /** Number of bars rendered. */
  bars?: number;
  /** Idle baseline so the viz still "breathes" in silence. */
  idleAmplitude?: number;
};

/**
 * OpenAI voice-mode-inspired bar visualizer. A single mic level is fanned
 * out across N bars using a sinusoidal envelope + per-bar phase offsets,
 * giving a wave illusion from a single metering value.
 */
function VoiceVisualizerImpl({ level, bars = 28, idleAmplitude = 0.04 }: Props) {
  const animsRef = useRef<Animated.Value[]>(
    Array.from({ length: bars }, () => new Animated.Value(idleAmplitude)),
  );
  const phaseRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const levelRef = useRef<number>(level);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  // Continuous tick — drives idle shimmer and applies envelope to live level.
  useEffect(() => {
    let lastT = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = (now - lastT) / 1000;
      lastT = now;
      phaseRef.current += dt * 4.2; // wave speed

      const l = levelRef.current;
      const energy = Math.max(idleAmplitude, l);
      const N = animsRef.current.length;
      for (let i = 0; i < N; i++) {
        // Bell curve so center bars dominate, edges taper.
        const center = (N - 1) / 2;
        const dist = Math.abs(i - center) / center;
        const bell = Math.pow(1 - dist, 1.4);

        // Per-bar phase produces wave illusion.
        const phase = phaseRef.current + i * 0.55;
        const wave = 0.5 + 0.5 * Math.sin(phase);

        // Mix: in silence -> tiny shimmer; loud -> bell-shaped wave.
        const target = idleAmplitude + energy * bell * (0.55 + 0.45 * wave);
        animsRef.current[i].setValue(Math.min(1, target));
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [idleAmplitude]);

  return (
    <View style={styles.row} testID="voice-visualizer">
      {animsRef.current.map((a, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              transform: [
                {
                  scaleY: a.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.05, 1],
                    extrapolate: "clamp",
                  }),
                },
              ],
              opacity: a.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [0.35, 0.7, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

export const VoiceVisualizer = memo(VoiceVisualizerImpl);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 140,
    gap: 6,
    paddingHorizontal: 16,
  },
  bar: {
    width: 5,
    height: 120,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
});

// Avoid unused import lint
void Easing;
