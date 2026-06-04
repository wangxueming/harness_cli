import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "node_modules/**",
      ".cursor/**",
      "artifacts/**",
    ],
  },
  {
    files: ["packages/demo-domain/src/types/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/config/**", "**/repo/**", "**/service/**", "**/runtime/**", "**/ui/**"],
              message: "types/ cannot import higher layers. See docs/architecture/LAYERS.md",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/demo-domain/src/config/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/repo/**", "**/service/**", "**/runtime/**", "**/ui/**"],
              message: "config/ cannot import higher layers. See docs/architecture/LAYERS.md",
            },
          ],
        },
      ],
    },
  },
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  }
);
