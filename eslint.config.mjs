import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const baseVitals = nextVitals.map((conf, index) => {
  if (index === 0 && conf.rules) {
    return {
      ...conf,
      rules: {
        ...conf.rules,
        "react-hooks/set-state-in-effect": "warn",
        "react-hooks/purity": "warn",
        "react/no-unescaped-entities": "warn",
      },
    };
  }
  return conf;
});

const baseTs = nextTs.map((conf) => {
  if (conf.rules) {
    return {
      ...conf,
      rules: {
        ...conf.rules,
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "prefer-const": "warn",
      },
    };
  }
  return conf;
});

const eslintConfig = defineConfig([
  ...baseVitals,
  ...baseTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "*.cjs",
    "*.mjs",
    "*.js",
    "scripts/**",
    "tests/**",
    "experience-backup/**",
  ]),
]);

export default eslintConfig;
