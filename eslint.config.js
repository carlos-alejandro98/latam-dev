// eslint.config.js
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default [
  /* =================================================
   * Global ignores (Flat Config)
   * ================================================= */
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.expo/**',
      '.expo-shared/**',
      'coverage/**',
    ],
  },

  /* =================================================
   * Base JS & TypeScript
   * ================================================= */
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  /* =================================================
   * Global TS / React configuration
   * ================================================= */
  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },

    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      'unused-imports': unusedImports,
    },

    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },

    rules: {
      /* -----------------------------
       * Naming & style
       * ----------------------------- */
      camelcase: 'error',

      /* -----------------------------
       * Imports
       * ----------------------------- */
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-default-export': 'off', // Expo Router
      'import/no-unresolved': 'off',

      /* -----------------------------
       * TypeScript
       * ----------------------------- */
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true },
      ],

      /* -----------------------------
       * React / Hooks
       * ----------------------------- */
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      /* -----------------------------
       * Unused code
       * ----------------------------- */
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      /* -----------------------------
       * Code size (team rules)
       * ----------------------------- */
      'max-lines-per-function': [
        'warn',
        { max: 20, skipBlankLines: true, skipComments: true },
      ],
      'max-lines': [
        'warn',
        { max: 200, skipBlankLines: true, skipComments: true },
      ],

      /* -----------------------------
       * Global safety
       * ----------------------------- */
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
    },
  },

  /* =================================================
   * Tests overrides
   * ================================================= */
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'max-lines-per-function': 'off',
      'require-jsdoc': 'off',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-undef': 'off',
    },
  },

  /* =================================================
   * Architecture Guard – Controllers
   * ================================================= */
  {
    files: ['presentation/controllers/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/infrastructure/**', '@/store/**', '**/store/**'],
          message:
            '❌ Controllers must not import infrastructure or Redux directly. Use adapters.',
        },
      ],
    },
  },

  {
    files: [
      'presentation/controllers/**/*.test.ts',
      'presentation/controllers/**/*.test.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/store/**', '**/store/**'],
          message:
            '❌ Controllers tests must NOT import Redux store. Mock the adapter instead.',
        },
      ],
    },
  },

  /* =================================================
   * Architecture Guard – Dependency Injection
   * ================================================= */
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/dependencyInjection/**', '**/dependencyInjection/**'],
          message:
            '❌ DI container must only be used inside store/ or dependencyInjection/.',
        },
      ],
    },
  },
  {
    files: ['store/**/*.{ts,tsx}', 'dependencyInjection/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },

  /* =================================================
   * Architecture Guard – Environment
   * ================================================= */
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message:
            '❌ Do not access process.env directly. Use config/environment.ts.',
        },
      ],
    },
  },
  {
    files: ['config/environment.ts'],
    rules: { 'no-restricted-properties': 'off' },
  },

  /* =================================================
   * Architecture Guard – Redux encapsulation
   * ================================================= */
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/store/**', '**/store/**'],
          message:
            '❌ Redux store must only be accessed via presentation/adapters/redux.',
        },
      ],
    },
  },
  {
    files: ['presentation/adapters/redux/**/*.{ts,tsx}', 'store/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },

  /* =================================================
   * Architecture Guard – Domain purity
   * ================================================= */
  {
    files: ['domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'react',
            'react-native',
            'axios',
            '@reduxjs/toolkit',
            '@/shared/**',
            '@/presentation/**',
            '@/application/**',
            '@/infrastructure/**',
            '@/store/**',
          ],
          message:
            '❌ Domain must be pure. No framework, store or shared utilities allowed.',
        },
      ],
    },
  },

  /* =================================================
   * Architecture Guard – Application isolation
   * ================================================= */
  {
    files: ['application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['@/presentation/**', '@/store/**', '@/shared/**'],
          message:
            '❌ Application layer must not depend on presentation, Redux or shared utilities.',
        },
      ],
    },
  },

  /* =================================================
   * Architecture Guard – Axios usage
   * ================================================= */
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message: '❌ Axios must only be used inside infrastructure/http.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['infrastructure/http/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },

  /* =================================================
   * Performance – Screens
   * ================================================= */
  {
    files: ['presentation/screens/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='map']",
          message: '❌ Do not use .map() in screens. Use FlatList instead.',
        },
        {
          selector:
            "CallExpression[callee.property.name='map'] CallExpression[callee.property.name='filter']",
          message:
            '❌ Avoid chained .filter().map() in screens. Use FlatList with filtered data.',
        },
      ],
    },
  },

  /* =================================================
   * DX – Relative imports
   * ================================================= */
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../..', '../../..', '../../../..'],
              message:
                '❌ Avoid deep relative imports. Use alias (@/) instead.',
            },
          ],
        },
      ],
    },
  },
];
