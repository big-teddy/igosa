import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                // Browser globals
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                console: "readonly",
                fetch: "readonly",
                setTimeout: "readonly",
                setInterval: "readonly",
                clearTimeout: "readonly",
                clearInterval: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
                FormData: "readonly",
                Blob: "readonly",
                File: "readonly",
                FileReader: "readonly",
                Response: "readonly",
                Request: "readonly",
                Headers: "readonly",
                AbortController: "readonly",
                ReadableStream: "readonly",
                TextEncoder: "readonly",
                TextDecoder: "readonly",
                // Node globals
                process: "readonly",
                global: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                require: "readonly",
                Buffer: "readonly",
                // Jest globals
                jest: "readonly",
                describe: "readonly",
                it: "readonly",
                test: "readonly",
                expect: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                afterAll: "readonly",
                afterEach: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "coverage/**",
            "test-results/**",
            "*.config.js",
            "*.config.mjs",
            "*.setup.js",
        ],
    },
];
