/* eslint-env node */
module.exports = {
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_"}],
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/prefer-spread": ["off"]
    },
    env: {
        browser: true,
        node: true
    }}
