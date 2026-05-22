const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// GLB / GLTF 3D model dosyalarını asset olarak tanımla
config.resolver.assetExts = [
  ...(config.resolver.assetExts || []),
  'glb',
  'gltf',
  'bin',
];

module.exports = config;
