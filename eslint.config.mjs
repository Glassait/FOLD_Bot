import tseslint from 'typescript-eslint';
import pluginJs from '@eslint/js';
import globals from 'globals';

export default tseslint.config(
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
            '@typescript-eslint/no-unsafe-member-access': ['off'],
            '@typescript-eslint/prefer-nullish-coalescing': ['off'],
            'no-duplicate-imports': ['error'],
            'no-constructor-return': ['error'],
            'object-shorthand': ['error', 'always'],
            'no-useless-rename': ['error'],
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
            '@typescript-eslint/member-ordering': [
                'error',
                {
                    default: {
                        memberTypes: [
                            // Index signature
                            'signature',
                            'call-signature',

                            // Statics
                            'public-static-field',
                            'protected-static-field',
                            'private-static-field',
                            '#private-static-field',

                            'static-initialization',

                            'public-static-accessor',
                            'protected-static-accessor',
                            'private-static-accessor',
                            '#private-static-accessor',

                            'public-static-method',
                            'protected-static-method',
                            'private-static-method',
                            '#private-static-method',

                            // Fields
                            'public-decorated-field',
                            'protected-decorated-field',
                            'private-decorated-field',

                            'public-instance-field',
                            'protected-instance-field',
                            'private-instance-field',
                            '#private-instance-field',

                            'public-abstract-field',
                            'protected-abstract-field',

                            'public-field',
                            'protected-field',
                            'private-field',
                            '#private-field',

                            'static-field',
                            'instance-field',
                            'abstract-field',

                            'decorated-field',

                            'field',

                            // Constructors
                            'public-constructor',
                            'protected-constructor',
                            'private-constructor',

                            'constructor',

                            // Accessors
                            'public-decorated-accessor',
                            'protected-decorated-accessor',
                            'private-decorated-accessor',

                            'public-instance-accessor',
                            'protected-instance-accessor',
                            'private-instance-accessor',
                            '#private-instance-accessor',

                            'public-abstract-accessor',
                            'protected-abstract-accessor',

                            'public-accessor',
                            'protected-accessor',
                            'private-accessor',
                            '#private-accessor',

                            'static-accessor',
                            'instance-accessor',
                            'abstract-accessor',

                            'decorated-accessor',

                            'accessor',

                            // Methods
                            'public-decorated-method',
                            'protected-decorated-method',
                            'private-decorated-method',

                            'public-instance-method',
                            'protected-instance-method',
                            'private-instance-method',
                            '#private-instance-method',

                            'public-abstract-method',
                            'protected-abstract-method',

                            'public-method',
                            'protected-method',
                            'private-method',
                            '#private-method',

                            'static-method',
                            'instance-method',
                            'abstract-method',

                            'decorated-method',

                            'method',
                        ],
                    },
                },
            ],
        },
    }
);
