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
                localStorage: "readonly",
                sessionStorage: "readonly",
                performance: "readonly",
                PerformanceObserver: "readonly",
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
            // TypeScript 규칙 - 점진적 개선을 위해 off
            "@typescript-eslint/no-explicit-any": "off", // 기존 코드 호환성
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-require-imports": "off", // Config 파일 허용

            // Console 규칙 - 개발/디버그 허용
            "no-console": "off",

            // React 관련 - 암묵적 허용
            "react/react-in-jsx-scope": "off",
        },
    },
    {
        // 테스트 파일 전용 규칙
        files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/tests/**"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "no-console": "off",
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
            "*.config.ts",
            "*.setup.js",
            "supabase/**",
            "scripts/**",
        ],
    },
];
