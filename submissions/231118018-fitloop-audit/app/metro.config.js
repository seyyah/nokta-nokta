const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  // 3D modeller (avatar.glb) için asset extension eklemesi
  config.resolver.assetExts.push('glb', 'gltf');
  
  return config;
})();
