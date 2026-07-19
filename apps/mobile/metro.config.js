const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// pnpm hoists workspace packages as symlinks outside apps/mobile/node_modules,
// so Metro needs to watch the monorepo root and follow symlinks to find them.
// Unlike the classic npm/yarn monorepo recipe, hierarchical lookup must stay
// enabled — pnpm nests each package's own dependencies (e.g. react-native's
// "invariant") inside that package's private store folder, and disabling
// hierarchical lookup stops Metro from ever walking into those folders.
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
