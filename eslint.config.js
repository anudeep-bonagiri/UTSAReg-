import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            '**/storybook-static/**',
            '**/coverage/**',
            '**/.claude/**',
            '**/*.zip',
            '**/build_log.txt',
            'apps/extension/test/**',
            'apps/extension/src/scripts/**',
            'eslint.config.js',
            '**/vite.config.ts',
            '**/vite.content.config.ts',
            '**/vitest.config.ts'
        ]
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                chrome: 'readonly'
            },
            parserOptions: {
                project: ['./tsconfig.eslint.json'],
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
            ],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
            eqeqeq: ['error', 'always']
        }
    },
    {
        files: ['**/*.{tsx,jsx}'],
        ...reactPlugin.configs.flat.recommended,
        ...reactPlugin.configs.flat['jsx-runtime'],
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y
        },
        languageOptions: {
            ...reactPlugin.configs.flat.recommended.languageOptions,
            globals: { ...globals.browser, chrome: 'readonly' }
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.flatConfigs.recommended.rules,
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off'
        },
        settings: {
            react: { version: 'detect' }
        }
    },
    {
        files: [
            '**/*.config.{js,ts,mjs,cjs}',
            '**/vite.config.ts',
            '**/vite.content.config.ts',
            '**/vitest.config.ts',
            '**/scripts/**/*.{js,ts}'
        ],
        languageOptions: {
            globals: { ...globals.node }
        },
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-floating-promises': 'off'
        }
    },
    {
        files: ['**/tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off'
        }
    }
    // The legacy v0 override block was retired once the popup, dashboard, and
    // background were rewritten on top of the design system + data adapters
    // and the four legacy components (PremiumCourseCard, CourseDetailsPopup,
    // SearchHeader, GradeChart) were deleted as dead code.
);
