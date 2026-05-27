const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Allow bundling 3D model assets (avaturn.me export, etc.)
config.resolver.assetExts = Array.from(
  new Set([...(config.resolver.assetExts || []), "glb", "gltf", "hdr"])
);

module.exports = withNativeWind(config, { input: "./global.css" });
