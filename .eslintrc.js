module.exports = {
	parser: "@typescript-eslint/parser", // Specifies the ESLint parser

	parserOptions: {
		ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
		sourceType: "module", // Allows for the use of imports
		ecmaFeatures: {
			jsx: true, // Allows for the parsing of JSX
		},
	},
	plugins: ["jsdoc"],
	settings: {
		react: {
			version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
		},
	},
	extends: [
		"plugin:jsdoc/recommended",
		"plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
		"plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
		"prettier", // Uses eslint-config-prettier to disable ESLint rules that would conflict with prettier
	],
	overrides: [
		{
			files: ["**/*.test.{ts,tsx}"],
			env: {
				jest: true,
			},
		},
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
