module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser

  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  extends: [
    "plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "prettier", // Uses eslint-config-prettier to disable ESLint rules that would conflict with prettier
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "prettier/react", // Uses eslint-config-prettier to disable ESLint rules relating to React that would conflict with prettier
    // "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],

  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    // Base.
    // "comma-dangle": ["error", "always-multiline"],
    // "no-console": "warn",
    // "no-use-before-define": "off",
    // "spaced-comment": "off",
    // Import:
    // "import/prefer-default-export": "off",
    // Prettier:
    // "prettier/prettier": 2,
    // React:
    "react/display-name": "off",
    // "react/jsx-filename-extension": ["error", { "extensions": [".tsx"] }],
    // "react/jsx-uses-react": "error",
    // "react/jsx-uses-vars": "warn",
    // "react/prop-types": "off",
    // React hooks:
    // "react-hooks/exhaustive-deps": "warn",
    // "react-hooks/rules-of-hooks": "error",
    // Typescript:
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "off",
  },
};
