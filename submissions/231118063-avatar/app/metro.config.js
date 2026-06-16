const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 3D model extensions to assetExts
config.resolver.assetExts.push('glb', 'gltf', 'mtl', 'obj');

module.exports = config;
