const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add glb and gltf as asset extensions so Metro can bundle 3D models
config.resolver.assetExts.push('glb', 'gltf', 'bin');

module.exports = config;
