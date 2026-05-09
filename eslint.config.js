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
            '**/*.zip',
            '**/build_log.txt',
            'apps/extension/test/**',
            'apps/extension/src/scripts/**',
            'eslint.config.js',
            '**/vite.config.ts',
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
    },
    // Legacy v0 surface scheduled for replacement once @utsaregplus/ui and
    // packages/adapter-utsa land. Strict rules downgraded to warn so CI stays
    // green while we rebuild on top of the design system + data adapters.
    // Remove a path from this list as soon as its rewrite ships.
    {
        files: [
            'apps/extension/src/popup/App.tsx',
            'apps/extension/src/dashboard/App.tsx',
            'apps/extension/src/content/index.tsx',
            'apps/extension/src/background/index.ts',
            'apps/extension/src/components/CourseDetailsPopup.tsx',
            'apps/extension/src/components/PremiumCourseCard.tsx',
            'apps/extension/src/components/SearchHeader.tsx',
            'apps/extension/src/components/GradeChart.tsx'
        ],
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/no-unsafe-call': 'warn',
            '@typescript-eslint/no-misused-promises': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
            '@typescript-eslint/dot-notation': 'warn'
        }
    }
);
