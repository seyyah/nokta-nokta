import { Asset } from "expo-asset";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type Props = {
  amplitude: number;
};

const avatarAsset = require("../../assets/avatar.glb");

export function AvatarStage({ amplitude }: Props) {
  const amplitudeRef = useRef(amplitude);
  const mouthRef = useRef<THREE.Object3D | null>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const frameRef = useRef<number | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    amplitudeRef.current = amplitude;
  }, [amplitude]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    []
  );

  const handleContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const renderer = new Renderer({ gl, alpha: true, antialias: true });
    renderer.setClearColor(0xf7f3ea, 0);
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      gl.drawingBufferWidth / Math.max(gl.drawingBufferHeight, 1),
      0.1,
      100
    );
    camera.position.set(0, 0.15, 4.2);

    scene.add(new THREE.AmbientLight(0xffffff, 1.9));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.4, 3.2, 3.6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xd8fff7, 0.9);
    fillLight.position.set(-2.4, 1.6, 2.2);
    scene.add(fillLight);

    try {
      setLoadError(false);
      const asset = Asset.fromModule(avatarAsset);
      await asset.downloadAsync();

      const loader = new GLTFLoader();
      loader.load(
        asset.localUri ?? asset.uri,
        (gltf) => {
          gltf.scene.position.set(0, -0.08, 0);
          gltf.scene.rotation.y = -0.1;
          scene.add(gltf.scene);
          mouthRef.current = gltf.scene.getObjectByName("Mouth") ?? null;
          headRef.current = gltf.scene.getObjectByName("AnalystHead") ?? null;
        },
        undefined,
        () => {
          setLoadError(true);
        }
      );
    } catch {
      setLoadError(true);
    }

    const render = () => {
      const level = amplitudeRef.current;
      const mouth = mouthRef.current;
      const head = headRef.current;
      const now = Date.now() / 1000;

      if (mouth) {
        mouth.scale.y = 1 + level * 3.2;
        mouth.scale.x = 1 + level * 0.18;
        mouth.position.y = -0.24 - level * 0.035;
      }

      if (head) {
        head.rotation.y = Math.sin(now * 0.65) * 0.035;
        head.rotation.x = -0.015 + level * 0.035;
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
      frameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  return (
    <View style={styles.frame}>
      <GLView style={styles.gl} onContextCreate={handleContextCreate} />
      {loadError ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Avatar asset could not be loaded.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 210,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#ece5d9"
  },
  gl: {
    flex: 1
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ece5d9"
  },
  errorText: {
    color: "#6f2f2f",
    fontSize: 13,
    fontWeight: "800"
  }
});
