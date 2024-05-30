import tseslint from 'typescript-eslint';
import pluginJs from '@eslint/js';
import globals from 'globals';

export default tseslint.config(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    pluginJs.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            globals: globals.browser,
            parser: tseslint.parser,
            sourceType: 'module',
            ecmaVersion: 2022,
            parserOptions: { project: './tsconfig.json' },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        ignores: ['**/.logs/', '**/.assets/', '**/*.md', '**/*.json', '**/*.png'],
        rules: {
            '@typescript-eslint/no-unsafe-call': ['off'],
            '@typescript-eslint/no-var-requires': ['off'],
            '@typescript-eslint/no-inferrable-types': ['off'],
            '@typescript-eslint/consistent-type-definitions': ['off', 'type'],
            '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true, fixToUnknown: true }],
            '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
            '@typescript-eslint/adjacent-overload-signatures': ['error'],
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
            '@typescript-eslint/no-non-null-assertion': ['off'],
            '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
            'no-duplicate-imports': ['error'],
            'no-constructor-return': ['error'],
            'no-inner-declarations': ['error'],
            'no-self-compare': ['error'],
            'no-template-curly-in-string': ['error'],
            'no-unmodified-loop-condition': ['error'],
            'no-unreachable-loop': ['error'],
            'arrow-body-style': ['error', 'as-needed'],
            'block-scoped-var': ['error'],
            curly: ['error'],
            'default-case-last': ['error'],
            'default-param-last': ['error'],
            eqeqeq: ['error'],
            'grouped-accessor-pairs': ['error'],
            'max-classes-per-file': ['error', { max: 1 }],
            'max-depth': ['error', { max: 3 }],
            'max-lines': ['error', { max: 500, skipComments: true, skipBlankLines: true }],
            'no-else-return': ['error', { allowElseIf: true }],
        },
    }
);
