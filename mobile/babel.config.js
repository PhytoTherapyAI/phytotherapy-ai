// Sprint 30 Commit 1 — Expo + NativeWind v4 + Reanimated babel chain.
// Order matters: babel-preset-expo first (with jsxImportSource for NativeWind),
// nativewind/babel preset for class processing, reanimated plugin LAST.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin", // MUST be listed last
    ],
  };
};
