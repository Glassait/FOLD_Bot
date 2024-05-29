import tseslint from 'typescript-eslint';
import pluginJs from '@eslint/js';
import globals from 'globals';

export default tseslint.config(
    pluginJs.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            globals: globals.browser,
            parser: tseslint.parser,
            sourceType: 'module',
            ecmaVersion: 2022,
            parserOptions: { project: ['./tsconfig.json'] },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        ignores: ['**/.logs/', '**/.assets/', '**/*.md', '**/*.json', '**/*.png'],
        rules: {
            '@typescript-eslint/no-unsafe-call': ['off'],
            '@typescript-eslint/no-var-requires': ['off'],
            '@typescript-eslint/no-inferrable-types': ['off'],
        },
    }
);

// {
//     rules: {
//         'no-console': ['error'],
//             '@typescript-eslint/no-var-requires': ['off'],
//             '@typescript-eslint/no-explicit-any': ['off'],
//             'no-duplicate-imports': ['error'],
//             'no-constructor-return': ['error'],
//             'no-inner-declarations': ['error'],
//             'no-promise-executor-return': ['error'],
//             'no-self-compare': ['error'],
//             'no-template-curly-in-string': ['error'],
//             'no-unmodified-loop-condition': ['error'],
//             'no-unreachable-loop': ['error'],
//             'no-useless-assignment': ['error'],
//             'arrow-body-style': ['error', 'as-needed'],
//             'block-scoped-var': ['error'],
//             camelcase: [
//             'error',
//             {
//                 properties: 'always',
//                 ignoreImports: true,
//                 ignoreDestructuring: false,
//             },
//         ],
//             complexity: [
//             'error',
//             {
//                 max: 2,
//             },
//         ],
//             curly: ['error'],
//             'default-case-last': ['error'],
//             'default-param-last': ['error'],
//             eqeqeq: ['error'],
//             'grouped-accessor-pairs': ['error'],
//             'max-classes-per-file': [
//             'error',
//             {
//                 max: 1,
//             },
//         ],
//             'max-depth': [
//             'error',
//             {
//                 max: 2,
//             },
//         ],
//             'max-lines': [
//             'error',
//             {
//                 max: 500,
//                 skipComments: true,
//                 skipBlankLines: true,
//             },
//         ],
//             'no-else-return': [
//             'error',
//             {
//                 allowElseIf: true,
//             },
//         ],
//     }
// },
