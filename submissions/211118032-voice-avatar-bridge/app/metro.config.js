const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// .glb (3D avatar) + .html (avatar scene) assetlerini metro bundle eder.
config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, 'glb', 'gltf', 'html'])
);

module.exports = config;
