module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "tsconfigRootDir": __dirname,
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "quotes": [
      "warn",
      "single"
    ],
    "comma-dangle": [
      "warn",
      "always-multiline"
    ],
    "semi": [
      "warn",
      "always"
    ],
    "@typescript-eslint/no-non-null-assertion": [
      "off"
    ],
    "indent": [
      "warn",
      2
    ],
    "react-hooks/exhaustive-deps": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off"
  }
}
