require('./scripts/array-polyfills');

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { resolve } = require('metro-resolver');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

const tslibPath = path.resolve(__dirname, 'node_modules/tslib/tslib.js');
const defaultResolveRequest = config.resolver.resolveRequest ?? resolve;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // ✅ Fix Hangar dependency
  if (moduleName === 'react-native-linear-gradient') {
    return defaultResolveRequest(
      context,
      require.resolve('expo-linear-gradient'),
      platform,
    );
  }

  if (moduleName === 'tslib') {
    return defaultResolveRequest(context, tslibPath, platform);
  }

  return defaultResolveRequest(context, moduleName, platform);
};

module.exports = config;
