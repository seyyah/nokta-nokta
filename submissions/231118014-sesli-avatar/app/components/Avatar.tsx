import React, { memo, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View, Text } from "react-native";
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import Colors from "@/constants/colors";

type Props = {
  /** 0..1 mic level — drives mouth aperture. */
  level: number;
  /** Optional label under the avatar (e.g. persona name). */
  label?: string;
};

/**
 * Stylised "ayna" avatar — a face whose mouth opens with the mic level.
 * Acts as a viseme placeholder until a real avatar.glb (avaturn export)
 * is wired through r3f. The lipsync math here is identical to what would
 * drive the GLB's jawOpen morph target, so swapping is trivial later.
 *
 * NOTE: We intentionally avoid Animated.createAnimatedComponent on
 * react-native-svg primitives because on web that leaks the `collapsable`
 * prop to the DOM. Instead, we drive SVG attrs via React state with a
 * lightweight rAF loop — same 60fps, zero warnings.
 */
function AvatarImpl({ level, label }: Props) {
  const breathAnim = useRef<Animated.Value>(new Animated.Value(0)).current;

  // Smoothed mouth aperture (0..1) with asymmetric attack/release.
  const [mouth, setMouth] = useState<number>(0);
  const mouthRef = useRef<number>(0);
  const targetRef = useRef<number>(0);

  // Blink state: 1 = open, 0.05 = closed.
  const [eye, setEye] = useState<number>(1);

  useEffect(() => {
    targetRef.current = Math.min(1, Math.max(0, level));
  }, [level]);

  // rAF loop — smooth mouth toward target with fast attack / slow release.
  useEffect(() => {
    let raf: number | null = null;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = targetRef.current;
      const cur = mouthRef.current;
      const attack = 18; // 1/s — fast open
      const release = 7; // 1/s — slower close
      const k = t > cur ? attack : release;
      const next = cur + (t - cur) * Math.min(1, k * dt);
      mouthRef.current = next;
      setMouth(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, []);

  // Periodic blink so the face feels alive even in silence.
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const blink = () => {
      if (!active) return;
      setEye(0.05);
      timer = setTimeout(() => {
        if (!active) return;
        setEye(1);
        const delay = 2200 + Math.random() * 3200;
        timer = setTimeout(blink, delay);
      }, 110);
    };
    timer = setTimeout(blink, 1400);
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Soft idle breathing (slight head scale) — Animated on View is safe.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathAnim]);

  const mouthRy = 3 + mouth * 23;
  const mouthRx = 14 + mouth * 8;
  const cheekOpacity = mouth * 0.12;
  const headScale = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scale: headScale }] }}>
        <Svg width={220} height={260} viewBox="0 0 220 260">
          <Defs>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#1A1A22" />
              <Stop offset="100%" stopColor="#0B0B10" />
            </LinearGradient>
            <LinearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#2A2A33" />
              <Stop offset="100%" stopColor="#16161B" />
            </LinearGradient>
            <LinearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={Colors.accent} stopOpacity={0.9} />
              <Stop offset="100%" stopColor={Colors.accent} stopOpacity={0.2} />
            </LinearGradient>
          </Defs>

          <Rect x={0} y={0} width={220} height={260} rx={24} fill="url(#bgGrad)" />

          {/* Halo */}
          <Circle cx={110} cy={120} r={96} fill="none" stroke="url(#rim)" strokeWidth={1.5} />

          {/* Head */}
          <Ellipse cx={110} cy={120} rx={78} ry={92} fill="url(#skin)" />

          {/* Hair / silhouette top */}
          <Path
            d="M 32 110 C 40 50 80 28 110 28 C 140 28 180 50 188 110 C 178 78 158 64 110 64 C 62 64 42 78 32 110 Z"
            fill="#0F0F13"
          />

          {/* Eyes */}
          <Ellipse cx={84} cy={120} rx={5.5} ry={0.5 + eye * 5.5} fill={Colors.text} />
          <Ellipse cx={136} cy={120} rx={5.5} ry={0.5 + eye * 5.5} fill={Colors.text} />

          {/* Nose hint */}
          <Path d="M 110 132 L 104 158 L 116 158 Z" fill="#0B0B10" opacity={0.55} />

          {/* Mouth — drives lipsync */}
          <Ellipse cx={110} cy={188} rx={mouthRx} ry={mouthRy} fill="#0A0A0E" />
          {/* Lower lip highlight */}
          <Ellipse cx={110} cy={196} rx={mouthRx} ry={2} fill={Colors.accentDim} opacity={0.5} />

          {/* Cheek glow when talking */}
          <Circle cx={64} cy={170} r={10} fill={Colors.accent} opacity={cheekOpacity} />
          <Circle cx={156} cy={170} r={10} fill={Colors.accent} opacity={cheekOpacity} />
        </Svg>
      </Animated.View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

export const Avatar = memo(AvatarImpl);

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  label: {
    marginTop: 12,
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
