import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import importPlugin from 'eslint-plugin-import';
import preferArrow from 'eslint-plugin-prefer-arrow-functions';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {
      sonarjs: sonarjs,
      unicorn: unicorn,
      import: importPlugin,
      'prefer-arrow-functions': preferArrow
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './test/tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-duplicate-imports': 'off',
      'no-console': 'error',
      'max-params': ['error', 4],
      'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
      complexity: ['warn', 10],
      'max-depth': ['error', 4],
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'always'],
      'arrow-spacing': 'error',
      'prefer-arrow-functions/prefer-arrow-functions': 'error',
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
            'object'
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/prefer-default-export': 'off',
      'import/no-mutable-exports': 'error',
      'import/no-extraneous-dependencies': 'off',
      'import/extensions': 'off',
      'import/newline-after-import': 'error',
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true
        }
      ],
      'sort-keys': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            arguments: false,
            attributes: false
          }
        }
      ],
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/lines-between-class-members': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'should', 'has', 'can', 'did', 'will', 'are']
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'function',
          format: ['camelCase']
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'class',
          format: ['PascalCase']
        },
        {
          selector: 'interface',
          format: ['PascalCase']
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase']
        },
        {
          selector: 'enum',
          format: ['PascalCase']
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE']
        }
      ],
      'import/no-duplicates': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports'
        }
      ],
      'prefer-promise-reject-errors': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'off',
      'require-await': 'off',
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', { threshold: 4 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-ternary': 'warn',
      'unicorn/error-message': 'error',
      'unicorn/throw-new-error': 'error',
      'unicorn/catch-error-name': ['error', { name: 'error' }],
      indent: 'off',
      'comma-dangle': 'off',
      'spaced-comment': 'off',
      'no-underscore-dangle': 'off'
    }
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'max-lines-per-function': 'off'
    }
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.mjs',
      'commitlint.config.js',
      'jest.config.ts'
    ]
  }
);
