// Metro config tuned for the monorepo so the app can resolve the `@loop/ui`
// workspace package (shipped as TS source, transpiled here by babel-preset-expo).
// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo (so changes in packages/* hot-reload).
config.watchFolders = [monorepoRoot];

// 2. Resolve modules from the app first, then the hoisted monorepo root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
