import React, { memo, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Asset } from "expo-asset";
import Colors from "@/constants/colors";

type Props = {
  level: number;
  label?: string;
};

// Resolve the bundled GLB to a URL usable by <model-viewer>.
function useAvatarUri(): { uri: string | null; error: string | null } {
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = require("@/assets/avatar.glb");
        // On web, require can return a string URI, an object { uri }, or a module id.
        let resolved: string | null = null;
        if (typeof mod === "string") {
          resolved = mod;
        } else if (mod && typeof mod === "object" && typeof mod.uri === "string") {
          resolved = mod.uri;
        }
        if (!resolved) {
          const asset = Asset.fromModule(mod);
          await asset.downloadAsync();
          resolved = asset.localUri ?? asset.uri ?? null;
        }
        if (!mounted) return;
        if (!resolved) {
          setError("GLB URI çözümlenemedi");
          return;
        }
        setUri(resolved);
      } catch (e) {
        console.warn("[GLBAvatar.web] failed to resolve avatar.glb", e);
        if (mounted) setError(String((e as Error)?.message ?? e));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return { uri, error };
}

// Lazy-load the model-viewer web component on the client only.
let modelViewerLoaded = false;
function ensureModelViewer(): void {
  if (modelViewerLoaded) return;
  if (typeof window === "undefined") return;
  modelViewerLoaded = true;
  const s = document.createElement("script");
  s.type = "module";
  s.src = "https://unpkg.com/@google/model-viewer@4.0.0/dist/model-viewer.min.js";
  document.head.appendChild(s);
}

/**
 * Web implementation — Google's <model-viewer> custom element renders the GLB
 * without spawning a second React reconciler (which is what triggered the
 * "Detected multiple renderers" warning when using @react-three/fiber).
 *
 * We animate `jawOpen` / `mouthOpen` morph targets via the model-viewer JS API
 * driven by the same 0..1 mic level used everywhere else.
 */
function GLBAvatarImpl({ level, label }: Props) {
  const { uri, error } = useAvatarUri();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mvRef = useRef<any>(null);
  const levelRef = useRef<number>(0);
  const smoothedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const morphIdxRef = useRef<{ jaw: number | null; mouth: number | null }>({
    jaw: null,
    mouth: null,
  });

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    ensureModelViewer();
  }, []);

  useEffect(() => {
    if (!uri || !hostRef.current) return;
    const host = hostRef.current;
    host.innerHTML = "";
    const mv: any = document.createElement("model-viewer");
    mv.setAttribute("src", uri);
    mv.setAttribute("camera-orbit", "0deg 90deg 0.75m");
    mv.setAttribute("camera-target", "0m 1.55m 0m");
    mv.setAttribute("field-of-view", "22deg");
    mv.setAttribute("disable-zoom", "");
    mv.setAttribute("interaction-prompt", "none");
    mv.setAttribute("exposure", "1");
    mv.setAttribute("shadow-intensity", "0.6");
    mv.style.width = "100%";
    mv.style.height = "100%";
    mv.style.background = "transparent";
    mv.addEventListener("load", () => {
      try {
        const symbols = mv.model?.materials ? mv.model : null;
        const findMorph = (names: string[]): number | null => {
          // model-viewer exposes morph targets via `mv.availableMorphTargets`
          // when models include them; we try generic ARKit names.
          const list: string[] = mv.availableAnimations ?? [];
          // morph access path (model-viewer 4.x): mv.model.scene? Not stable.
          // We rely on the public `mv.morph()` API:
          for (const n of names) {
            try {
              mv.morph?.(n, 0);
              return -1; // sentinel: name is supported, we'll drive by name
            } catch {
              // ignore
            }
          }
          return null;
        };
        // Just try-drive by name in the rAF loop; record what worked.
        morphIdxRef.current = {
          jaw: findMorph(["jawOpen", "JawOpen", "jaw_open"]),
          mouth: findMorph(["mouthOpen", "viseme_aa"]),
        };
        // silence the unused symbol warning
        void symbols;
      } catch (e) {
        console.warn("[GLBAvatar.web] morph discovery failed", e);
      }
    });
    host.appendChild(mv);
    mvRef.current = mv;

    const tick = () => {
      const target = Math.min(1, Math.max(0, levelRef.current));
      const cur = smoothedRef.current;
      const k = target > cur ? 0.35 : 0.15;
      const next = cur + (target - cur) * k;
      smoothedRef.current = next;

      const m = mvRef.current;
      if (m && typeof m.morph === "function") {
        try {
          m.morph("jawOpen", next * 0.85);
        } catch {
          // ignore unsupported morph
        }
        try {
          m.morph("mouthOpen", next * 0.4);
        } catch {
          // ignore
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      host.innerHTML = "";
      mvRef.current = null;
    };
  }, [uri]);

  return (
    <View style={styles.wrap}>
      <View style={styles.canvasFrame}>
        {uri ? (
          <div ref={hostRef as unknown as React.RefObject<HTMLDivElement>} style={hostStyle} />
        ) : (
          <View style={styles.placeholderInner}>
            <Text style={styles.placeholderText}>
              {error ? `Avatar yüklenemedi: ${error}` : "Avatar yükleniyor…"}
            </Text>
          </View>
        )}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

export const GLBAvatar = memo(GLBAvatarImpl);

const hostStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", width: "100%" },
  canvasFrame: {
    width: 260,
    height: 320,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: "#0B0B10",
  },
  placeholderInner: { flex: 1, alignItems: "center", justifyContent: "center" },
  placeholderText: { color: Colors.textMuted, fontSize: 13 },
  label: {
    marginTop: 12,
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
