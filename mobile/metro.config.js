// Sprint 30 Commit 1 — NativeWind v4 metro pipeline.
// withNativeWind wraps Expo's default metro config so Tailwind classes
// compile into RN-compatible style objects at bundle time.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
