// Live lipsync avatar.
//   1. Tries to load app/assets/avatar.glb (your avaturn.me export).
//   2. Maps mic amplitude → jawOpen, dominant band cluster → viseme morph blend.
//   3. Falls back to a stylized "talking head proxy" if no .glb is bundled,
//      so the screen never goes blank during development.

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { View, Text, Platform } from 'react-native';
import * as THREE from 'three';

// Platform-specific Canvas import.
// Web: @react-three/fiber (renders to <canvas>).
// Native: @react-three/fiber/native (renders into expo-gl GLView).
let Canvas;
try {
  Canvas =
    Platform.OS === 'web'
      ? require('@react-three/fiber').Canvas
      : require('@react-three/fiber/native').Canvas;
} catch {
  Canvas = null;
}

const useFrame =
  (() => {
    try {
      return Platform.OS === 'web'
        ? require('@react-three/fiber').useFrame
        : require('@react-three/fiber/native').useFrame;
    } catch {
      return () => {};
    }
  })();

// ──────────────────────── .glb loader (lazy / optional) ────────────────────────
async function tryLoadAvatar() {
  try {
    // avatarSource.js exports `null` until the user opts in to their .glb.
    // Doing it this way keeps the bundler happy when no asset is shipped.
    const mod = require('../lib/avatarSource').default;
    if (!mod) return null;
    const { Asset } = require('expo-asset');
    const asset = Asset.fromModule(mod);
    await asset.downloadAsync();

    const { GLTFLoader } =
      // three-stdlib is the npm-friendly mirror of three/examples
      // Fallback to three/examples path for environments that ship it.
      (() => {
        try { return require('three-stdlib'); }
        catch { return require('three/examples/jsm/loaders/GLTFLoader.js'); }
      })();

    const url = asset.localUri || asset.uri;
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const loader = new GLTFLoader();
    return await new Promise((resolve, reject) => {
      loader.parse(buf, '', resolve, reject);
    });
  } catch (err) {
    return null;
  }
}

// ──────────────────────── viseme blend logic ────────────────────────
// avaturn.me / ReadyPlayerMe exports usually include ARKit + Oculus visemes.
// We hunt for any of these morph target names — case-sensitive AND case-
// insensitive lookups happen in applyMorph below.
const MORPH_KEYS = {
  jaw: [
    'jawOpen', 'jaw_open', 'JawOpen',
    'mouthOpen', 'mouth_open', 'Mouth_Open',
    'viseme_aa', 'aa',
  ],
  aa:  [
    'viseme_aa', 'viseme_AA', 'viseme_A',
    'aa', 'mouthFunnel', 'mouth_funnel',
  ],
  o:   [
    'viseme_O', 'viseme_oh', 'viseme_OO',
    'oh', 'mouthPucker', 'mouth_pucker', 'mouthPuckerOpen',
  ],
  ee:  [
    'viseme_E', 'viseme_EE', 'viseme_I', 'viseme_II',
    'mouthSmile', 'mouthSmileLeft', 'mouthSmileRight',
    'mouthStretchLeft', 'mouthStretchRight',
  ],
  u:   [
    'viseme_U', 'viseme_UU',
    'mouthPucker', 'mouth_pucker',
  ],
};

// pick the strongest band cluster → returns blend weights for AA / O / EE / U
function bandsToViseme(bands) {
  if (!bands || bands.length < 4) return { aa: 0, o: 0, ee: 0, u: 0 };
  const n = bands.length;
  let low = 0, mid = 0, high = 0;
  for (let i = 0; i < n; i++) {
    if (i < n * 0.25) low += bands[i];
    else if (i < n * 0.65) mid += bands[i];
    else high += bands[i];
  }
  const total = low + mid + high + 1e-6;
  // O / U are low-band dominant, AA is mid, EE is high
  return {
    o:  (low / total) * 0.6,
    u:  (low / total) * 0.4,
    aa: (mid / total) * 1.0,
    ee: (high / total) * 1.0,
  };
}

function applyMorph(mesh, key, value) {
  if (!mesh?.morphTargetInfluences || !mesh?.morphTargetDictionary) return false;
  const dict = mesh.morphTargetDictionary;
  const v = Math.max(0, Math.min(1, value));
  // exact match first
  for (const name of MORPH_KEYS[key]) {
    const idx = dict[name];
    if (idx != null) { mesh.morphTargetInfluences[idx] = v; return true; }
  }
  // case-insensitive fallback — handles odd exporter casing variants
  const ciDict = mesh.__ciDict || (mesh.__ciDict = Object.fromEntries(
    Object.entries(dict).map(([k, i]) => [k.toLowerCase(), i])
  ));
  for (const name of MORPH_KEYS[key]) {
    const idx = ciDict[name.toLowerCase()];
    if (idx != null) { mesh.morphTargetInfluences[idx] = v; return true; }
  }
  return false;
}

// ──────────────────────── loaded-avatar component ────────────────────────
function LoadedAvatar({ scene, frameRef }) {
  const groupRef = useRef();
  const meshesRef = useRef([]);

  useEffect(() => {
    // collect morph-target-bearing meshes
    const meshes = [];
    scene.traverse((obj) => {
      if (obj.isSkinnedMesh || (obj.isMesh && obj.morphTargetInfluences)) {
        meshes.push(obj);
      }
    });
    meshesRef.current = meshes;

    // ── one-time discovery log so we can see exactly which morph targets the
    //    loaded avatar exposes. Hunt the console for "[AvatarScene] morphs:"
    //    if lipsync silent → no entries here means the .glb was exported
    //    without blendshapes (re-export with visemes/ARKit enabled).
    try {
      const morphReport = meshes.map((m) => ({
        mesh: m.name || '(unnamed)',
        keys: m.morphTargetDictionary ? Object.keys(m.morphTargetDictionary) : [],
      }));
      // eslint-disable-next-line no-console
      console.log('[AvatarScene] morphs:', morphReport);
    } catch {}

    // ── auto-frame: scale + shift so the head sits centered at the origin ──
    // Avaturn / RPM exports are usually full-body with the avatar standing on
    // y=0. We want the camera (at +z) to see the head, so we shift the model
    // down by ~total-height and uniformly scale so the head is a sane size.
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Empirical head-region heuristic: top ~13% of the bounding box for an
    // adult full-body model. Works for avaturn/RPM exports; if the export
    // is already a bust/head-only mesh, this still does the right thing.
    const headRegionHeight = size.y * 0.13;
    const targetHeadHeight = 0.55; // tuned so head ~45% of canvas vertical at cam z=2.6
    const scale = headRegionHeight > 1e-4 ? targetHeadHeight / headRegionHeight : 1;
    scene.scale.setScalar(scale);

    // recompute bbox after scaling
    const box2 = new THREE.Box3().setFromObject(scene);
    const center2 = box2.getCenter(new THREE.Vector3());
    const top2 = box2.max.y;
    // place the head center near y=0 (just below top of bbox by half head)
    const headCenterY = top2 - (targetHeadHeight * 0.5);
    scene.position.set(-center2.x, -headCenterY, -center2.z);
  }, [scene]);

  useFrame(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const viseme = bandsToViseme(frame.bands);
    // Amplitude lives in 0..1 but speech rarely exceeds 0.4-0.5, so we boost.
    // Clamped inside applyMorph.
    const jaw = Math.min(1, frame.amplitude * 2.6);
    const visemeGain = 2.2; // each viseme weight gets pushed higher too
    for (const mesh of meshesRef.current) {
      applyMorph(mesh, 'jaw', jaw);
      applyMorph(mesh, 'aa', viseme.aa * jaw * visemeGain);
      applyMorph(mesh, 'o',  viseme.o  * jaw * visemeGain);
      applyMorph(mesh, 'ee', viseme.ee * jaw * visemeGain);
      applyMorph(mesh, 'u',  viseme.u  * jaw * visemeGain);
    }
    // subtle head idle
    if (groupRef.current) {
      const t = performance.now() * 0.001;
      groupRef.current.rotation.y = Math.sin(t * 0.7) * 0.04;
      groupRef.current.rotation.x = Math.sin(t * 0.9) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// ──────────────────────── proxy stylized head ────────────────────────
// Renders without an avatar.glb. Sphere = head, ellipsoid = mouth that opens
// vertically with amplitude. Looks intentional, not broken.
function ProxyHead({ frameRef }) {
  const headRef = useRef();
  const mouthRef = useRef();
  const eyeL = useRef();
  const eyeR = useRef();

  useFrame(() => {
    const frame = frameRef.current;
    const amp = frame?.amplitude ?? 0;
    if (mouthRef.current) {
      // open the mouth vertically with amplitude
      mouthRef.current.scale.y = 0.05 + amp * 0.55;
      mouthRef.current.scale.x = 0.45 - amp * 0.18; // mouth narrows a touch
    }
    if (headRef.current) {
      const t = performance.now() * 0.001;
      headRef.current.rotation.y = Math.sin(t * 0.6) * 0.08;
      headRef.current.rotation.x = Math.sin(t * 0.85) * 0.04;
    }
    // blink occasionally
    const t = performance.now() * 0.001;
    const blink = Math.max(0, Math.sin(t * 1.7) - 0.95) * 20;
    if (eyeL.current) eyeL.current.scale.y = 1 - blink;
    if (eyeR.current) eyeR.current.scale.y = 1 - blink;
  });

  return (
    <group ref={headRef}>
      {/* head */}
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#ffd9b8" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* eyes */}
      <mesh ref={eyeL} position={[-0.32, 0.18, 0.88]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh ref={eyeR} position={[0.32, 0.18, 0.88]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* mouth */}
      <mesh ref={mouthRef} position={[0, -0.35, 0.92]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial color="#3a1010" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ──────────────────────── exported screen-piece ────────────────────────
export default function AvatarScene({ analyzer, theme, height = 280 }) {
  const [gltf, setGltf] = useState(null);
  const [tried, setTried] = useState(false);
  const frameRef = useRef({ amplitude: 0, bands: [] });

  // pump analyzer frames into a ref (no re-renders per frame)
  useEffect(() => {
    if (!analyzer) return;
    const unsub = analyzer.subscribe((f) => { frameRef.current = f; });
    return () => unsub();
  }, [analyzer]);

  useEffect(() => {
    let cancelled = false;
    tryLoadAvatar().then((g) => {
      if (cancelled) return;
      setGltf(g);
      setTried(true);
    });
    return () => { cancelled = true; };
  }, []);

  if (!Canvas) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme?.textMuted, fontSize: 12 }}>3D canvas unavailable.</Text>
      </View>
    );
  }

  return (
    <View style={{ height, width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: theme?.card ?? '#fafafa' }}>
      <Canvas camera={{ position: [0, 0.1, 2.6], fov: 35 }} dpr={[1, 2]}>
        <color attach="background" args={[theme?.card ?? '#fafafa']} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 4, 5]} intensity={1.0} />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        <Suspense fallback={null}>
          {gltf?.scene ? (
            <LoadedAvatar scene={gltf.scene} frameRef={frameRef} />
          ) : (
            <ProxyHead frameRef={frameRef} />
          )}
        </Suspense>
      </Canvas>
      {tried && !gltf && (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: theme?.textMuted, textTransform: 'uppercase' }}>
            Proxy head — drop your avatar.glb in /assets
          </Text>
        </View>
      )}
    </View>
  );
}
