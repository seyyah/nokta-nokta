const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 3D model ve diğer binary asset uzantılarını Metro'ya tanıt
config.resolver.assetExts.push('glb', 'gltf', 'bin', 'hdr', 'png', 'jpg');

module.exports = config;