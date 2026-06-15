const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 3D avatar/model assets
config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, 'glb', 'gltf', 'bin', 'hdr'])
);

module.exports = config;
