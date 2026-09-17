import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactNative from "eslint-plugin-react-native";

export default [
  { ignores: ["node_modules/**", "android/**", "ios/**", "build/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, __DEV__: "readonly" },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    plugins: {
      "react-hooks": pluginReactHooks,
      "react-native": pluginReactNative
    },
    rules: {
      "react-native/no-unused-styles": "error",
      "react-native/split-platform-components": "error",
      "react-hooks/rules-of-hooks": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off"
    },
    settings: { react: { version: "detect" } }
  }
];