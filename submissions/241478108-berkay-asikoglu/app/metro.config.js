const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add custom asset extensions
config.resolver.assetExts.push('glb');
config.resolver.assetExts.push('html');

module.exports = config;
