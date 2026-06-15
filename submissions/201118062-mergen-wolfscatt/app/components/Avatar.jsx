/*
Auto-generated base: npx gltfjsx avatar.glb -o components/Avatar.jsx
Expo adaptation: local asset URI is passed from AvatarScene, and live/demo
lipsync drives the model's own morph targets.
*/

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber/native";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import demoLipsync from "../lipsync/demo-mouth-cues.json";

const DEMO_DURATION_SECONDS = 2.7;

const CUE_TARGETS = {
  A: ["viseme_PP", "PP"],
  B: ["viseme_kk", "kk"],
  C: ["viseme_I", "ih", "I"],
  D: ["viseme_AA", "viseme_aa", "aa", "AA"],
  E: ["viseme_O", "oh", "O"],
  F: ["viseme_U", "ou", "U"],
  G: ["viseme_FF", "FF"],
  H: ["viseme_TH", "TH"],
  X: ["viseme_sil", "sil"]
};

const MOUTH_TARGET_NAMES = [
  "viseme_sil",
  "viseme_PP",
  "viseme_FF",
  "viseme_TH",
  "viseme_DD",
  "viseme_kk",
  "viseme_CH",
  "viseme_SS",
  "viseme_nn",
  "viseme_RR",
  "viseme_aa",
  "viseme_E",
  "viseme_I",
  "viseme_O",
  "viseme_U",
  "viseme_AA",
  "CH",
  "DD",
  "E",
  "FF",
  "PP",
  "RR",
  "SS",
  "TH",
  "aa",
  "ih",
  "kk",
  "nn",
  "oh",
  "ou",
  "sil",
  "jawOpen",
  "mouthOpen",
  "MouthOpen",
  "JawOpen"
];
const LIVE_OPEN_CANDIDATES = ["jawOpen", "mouthOpen", "MouthOpen", "JawOpen"];
const LIVE_WIDE_CANDIDATES = ["viseme_AA", "viseme_aa", "aa", "AA"];
const LIVE_ROUND_CANDIDATES = ["viseme_O", "oh", "O", "viseme_U", "ou", "U"];

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function isMouthTarget(name) {
  return MOUTH_TARGET_NAMES.includes(name) || /mouth|jaw|viseme/i.test(name);
}

function getTargetName(meshes, candidates) {
  for (const candidate of candidates) {
    if (meshes.some((mesh) => mesh.morphTargetDictionary?.[candidate] !== undefined)) {
      return candidate;
    }
  }

  return null;
}

function getControllers(meshes, names) {
  return names.map((name) => ({
    name,
    entries: meshes
      .map((mesh) => ({
        mesh,
        index: mesh.morphTargetDictionary?.[name]
      }))
      .filter((entry) => entry.index !== undefined)
  }));
}

function getCue(elapsedSeconds) {
  const cues = demoLipsync.mouthCues || [];
  const cueTime = elapsedSeconds % Math.max(0.01, cues[cues.length - 1]?.end || 0.9);
  return cues.find((cue) => cueTime >= cue.start && cueTime < cue.end);
}

function setMorphIndex(mesh, index, value, smoothing = 0.32) {
  if (index === undefined || !mesh.morphTargetInfluences) {
    return;
  }

  mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
    mesh.morphTargetInfluences[index] || 0,
    value,
    smoothing
  );
}

function prepareAvatarScene(scene) {
  scene.traverse((node) => {
    if (!node.isMesh && !node.isSkinnedMesh) {
      return;
    }

    node.visible = true;
    node.frustumCulled = false;

    const materialList = Array.isArray(node.material) ? node.material : [node.material];
    materialList.forEach((material) => {
      if (!material) {
        return;
      }

      material.side = THREE.DoubleSide;

      // Embedded JPEG textures from GLB exports can crash or spam huge data-uri
      // warnings in Expo/RN. Keep the real mesh, rig, and morph targets; render
      // with stable material colors instead of uploading those texture maps.
      material.map = null;
      material.normalMap = null;
      material.roughnessMap = null;
      material.metalnessMap = null;
      material.aoMap = null;
      material.emissiveMap = null;
      material.alphaMap = null;

      if (/head|body/i.test(material.name || "")) {
        material.color?.set("#C58C72");
      } else if (/lash|hair/i.test(material.name || "")) {
        material.color?.set("#211A18");
      } else if (/teeth/i.test(material.name || "")) {
        material.color?.set("#F5F1E8");
      } else if (/cornea|eyeball/i.test(material.name || "")) {
        material.color?.set("#F8F8F2");
      } else if (/outfit/i.test(material.name || "")) {
        material.color?.set("#3E5066");
      }

      if (typeof material.metalness === "number") {
        material.metalness = Math.min(material.metalness, 0.08);
      }

      if (typeof material.roughness === "number") {
        material.roughness = Math.max(material.roughness, 0.72);
      }

      material.needsUpdate = true;
    });
  });

  return scene;
}

function collectMorphMeshes(scene) {
  const meshes = [];

  scene.traverse((node) => {
    if (node?.morphTargetDictionary && node?.morphTargetInfluences) {
      meshes.push(node);
    }
  });

  return meshes;
}

export function Model({
  glbUrl,
  voiceLevel = 0,
  demoPlaybackId = 0,
  onMouthDebugChange,
  ...props
}) {
  const group = useRef();
  const demoStartRef = useRef(null);
  const currentValues = useRef({});
  const loggedRef = useRef(false);
  const { scene } = useLoader(GLTFLoader, glbUrl);
  const clonedScene = useMemo(() => prepareAvatarScene(clone(scene)), [scene]);
  const morphMeshes = useMemo(() => collectMorphMeshes(clonedScene), [clonedScene]);

  const mouthTargets = useMemo(() => {
    const names = new Set();
    morphMeshes.forEach((mesh) => {
      Object.keys(mesh.morphTargetDictionary || {}).forEach((name) => {
        if (isMouthTarget(name)) {
          names.add(name);
        }
      });
    });
    return Array.from(names);
  }, [morphMeshes]);

  const liveTargets = useMemo(
    () => ({
      open: getTargetName(morphMeshes, LIVE_OPEN_CANDIDATES),
      wide: getTargetName(morphMeshes, LIVE_WIDE_CANDIDATES),
      round: getTargetName(morphMeshes, LIVE_ROUND_CANDIDATES)
    }),
    [morphMeshes]
  );

  const animatedTargets = useMemo(
    () => Array.from(new Set([liveTargets.open, liveTargets.wide].filter(Boolean))),
    [liveTargets]
  );
  const demoTargets = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(CUE_TARGETS)
            .map((candidates) => getTargetName(morphMeshes, candidates))
            .filter(Boolean)
        )
      ),
    [morphMeshes]
  );
  const targetControllers = useMemo(
    () => getControllers(morphMeshes, Array.from(new Set([...animatedTargets, ...demoTargets]))),
    [animatedTargets, demoTargets, morphMeshes]
  );
  const animatedTargetSet = useMemo(() => new Set(animatedTargets), [animatedTargets]);
  const demoTargetSet = useMemo(() => new Set([...animatedTargets, ...demoTargets]), [animatedTargets, demoTargets]);

  useEffect(() => {
    if (!demoPlaybackId) {
      return;
    }

    demoStartRef.current = null;
  }, [demoPlaybackId]);

  useEffect(() => {
    const morphDebug = morphMeshes.map((mesh) => ({
      mesh: mesh.name,
      targets: Object.keys(mesh.morphTargetDictionary || {})
    }));
    const allTargets = Array.from(
      new Set(morphDebug.flatMap((entry) => entry.targets))
    );
    const mode = mouthTargets.length ? "morph" : "unsupported";

    if (__DEV__ && !loggedRef.current) {
      loggedRef.current = true;
      console.log("Avatar.jsx morph meshes:", morphDebug);
      console.log("Avatar.jsx morph targets:", allTargets.length ? allTargets : ["none"]);
      console.log("Avatar.jsx live mouth targets:", liveTargets);
      console.log("Avatar.jsx mouth mode:", mode);
    }

    onMouthDebugChange?.({
      mode,
      morphMeshes: morphDebug.map((entry) => entry.mesh),
      morphTargets: allTargets,
      liveTargets
    });
  }, [liveTargets, morphMeshes, mouthTargets, onMouthDebugChange]);

  useFrame((_, delta) => {
    const now = (currentValues.current.elapsed || 0) + delta;
    currentValues.current.elapsed = now;

    if (group.current) {
      group.current.rotation.y = Math.sin(now * 0.7) * 0.04;
    }

    let demoElapsed = null;

    if (demoPlaybackId) {
      if (demoStartRef.current === null) {
        demoStartRef.current = now;
      }

      demoElapsed = now - demoStartRef.current;
    }

    const demoActive = demoElapsed !== null && demoElapsed <= DEMO_DURATION_SECONDS;
    const desired = {};

    if (demoActive) {
      const cue = getCue(demoElapsed);
      const targetName = cue ? getTargetName(morphMeshes, CUE_TARGETS[cue.value] || []) : null;

      if (targetName && targetName !== "sil" && targetName !== "viseme_sil") {
        desired[targetName] = 1;
      }
    } else {
      const level = clamp01(voiceLevel * 1.2);

      if (liveTargets.open) {
        desired[liveTargets.open] = level * 0.9;
      }

      if (liveTargets.wide) {
        desired[liveTargets.wide] = level > 0.18 ? level * 0.55 : 0;
      }
    }

    const targetsToUpdate = demoActive ? demoTargetSet : animatedTargetSet;

    targetControllers.forEach(({ name, entries }) => {
      if (!targetsToUpdate.has(name)) {
        return;
      }

      currentValues.current[name] = desired[name] || 0;
      entries.forEach(({ mesh, index }) => {
        setMorphIndex(mesh, index, currentValues.current[name]);
      });
    });
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={clonedScene} />
    </group>
  );
}
