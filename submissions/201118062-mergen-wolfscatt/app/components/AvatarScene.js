import React, { Component, Suspense, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Asset } from "expo-asset";
import { Canvas, useThree } from "@react-three/fiber/native";
import { colors, radius, spacing, typography } from "../constants/theme";
import { Model as Avatar } from "./Avatar";

const AVATAR_ASSET = Asset.fromModule(require("../avatar-runtime.glb"));
const AVATAR_PRESETS = {
  upperBody: {
    modelScale: 1.25,
    modelPosition: [0, -0.35, 0],
    modelRotation: [0, 0, 0],
    cameraPosition: [0, 1.25, 2.8],
    lookAt: [0, 1.05, 0],
    fov: 34
  },
  closerFace: {
    modelScale: 1.35,
    modelPosition: [0, -0.45, 0],
    modelRotation: [0, 0, 0],
    cameraPosition: [0, 1.32, 2.45],
    lookAt: [0, 1.16, 0],
    fov: 30
  },
  fullBody: {
    modelScale: 0.95,
    modelPosition: [0, -0.85, 0],
    modelRotation: [0, 0, 0],
    cameraPosition: [0, 1.1, 3.8],
    lookAt: [0, 0.95, 0],
    fov: 38
  }
};
const AVATAR_VIEW = AVATAR_PRESETS.upperBody;
const AVATAR_TRANSFORM = {
  position: AVATAR_VIEW.modelPosition,
  rotation: AVATAR_VIEW.modelRotation,
  scale: AVATAR_VIEW.modelScale
};
const CAMERA = {
  position: AVATAR_VIEW.cameraPosition,
  lookAt: AVATAR_VIEW.lookAt,
  fov: AVATAR_VIEW.fov
};

class AvatarRenderBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.warn("[AvatarScene] avatar render failed:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Avatar render edilemedi</Text>
          <Text style={styles.placeholderText}>
            Konsol loglarini kontrol edin ve Metro cache temizleyin: npx expo start -c
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function CameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...CAMERA.position);
    camera.lookAt(...CAMERA.lookAt);
    camera.fov = CAMERA.fov;
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function AvatarLoading() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>avatar.glb yukleniyor</Text>
      <Text style={styles.placeholderText}>Expo runtime asset URI hazirlaniyor ve Avatar.jsx sahneye alinacak.</Text>
    </View>
  );
}

export default function AvatarScene({ voiceLevel, demoPlaybackId }) {
  const [assetUri, setAssetUri] = useState(null);
  const [assetError, setAssetError] = useState(null);
  const [mouthDebug, setMouthDebug] = useState({
    mode: "loading",
    morphMeshes: [],
    morphTargets: [],
    liveTargets: {}
  });

  useEffect(() => {
    let mounted = true;

    async function resolveAvatar() {
      try {
        const asset = await AVATAR_ASSET.downloadAsync();
        const uri = asset.localUri || asset.uri;
        console.log("AvatarScene runtime asset URI:", uri);

        if (mounted) {
          setAssetUri(uri);
          setAssetError(null);
        }
      } catch (error) {
        console.warn("[AvatarScene] avatar.glb asset could not be resolved:", error);

        if (mounted) {
          setAssetError(error);
        }
      }
    }

    resolveAvatar();

    return () => {
      mounted = false;
    };
  }, []);

  if (assetError) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>avatar.glb yuklenemedi</Text>
        <Text style={styles.placeholderText}>
          Avatar runtime asset URI cozulmedi. `npx expo start -c` ile Metro cache temizlenip tekrar denenmeli.
        </Text>
      </View>
    );
  }

  if (!assetUri) {
    return <AvatarLoading />;
  }

  const targetSummary = Object.values(mouthDebug.liveTargets || {}).filter(Boolean).join(", ") || "target bekleniyor";

  return (
    <View style={styles.sceneWrapper}>
      <View style={styles.canvasShell}>
        <AvatarRenderBoundary>
          <Canvas
            dpr={[1, 1]}
            gl={{ antialias: false, alpha: true }}
            camera={{ position: CAMERA.position, fov: CAMERA.fov }}
          >
            <CameraRig />
            <ambientLight intensity={0.95} />
            <hemisphereLight args={["#FFFFFF", "#B7C3D7", 0.75]} />
            <directionalLight position={[0, 2.4, 3]} intensity={1.15} />
            <Suspense fallback={null}>
              <Avatar
                glbUrl={assetUri}
                voiceLevel={voiceLevel}
                demoPlaybackId={demoPlaybackId}
                onMouthDebugChange={setMouthDebug}
                position={AVATAR_TRANSFORM.position}
                rotation={AVATAR_TRANSFORM.rotation}
                scale={AVATAR_TRANSFORM.scale}
              />
            </Suspense>
          </Canvas>
        </AvatarRenderBoundary>
      </View>
      <Text style={styles.debugText}>
        Mouth mode: {mouthDebug.mode}. Live targets: {targetSummary}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sceneWrapper: {
    gap: spacing.xs
  },
  canvasShell: {
    height: 340,
    overflow: "hidden",
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border
  },
  placeholder: {
    minHeight: 320,
    gap: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  placeholderTitle: {
    ...typography.titleSm,
    color: colors.text,
    textAlign: "center"
  },
  placeholderText: {
    ...typography.bodySm,
    color: colors.textMuted,
    textAlign: "center"
  },
  debugText: {
    ...typography.caption,
    color: colors.textSoft,
    textAlign: "center"
  }
});
