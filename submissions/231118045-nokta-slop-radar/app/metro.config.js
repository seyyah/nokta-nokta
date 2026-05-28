const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('glb', 'gltf');
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'memoize-one': path.resolve(__dirname, 'node_modules/memoize-one'),
};

module.exports = config;
