module.exports = {
    extends: 'google',
    installedESLint: true,
    parserOptions: {
        ecmaVersion: 7,
        sourceType: 'module',
        ecmaFeatures: {
            experimentalObjectRestSpread: true
        }
    },
    rules: {
        'brace-style': ['error', '1tbs', { allowSingleLine: true }],
        'comma-dangle': 'off',
        'guard-for-in': 'off',
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'max-len': 'off',
        'max-statements-per-line': ['error', { max: 2 }],
        'no-console': 'off',
        'no-warning-comments': 'off',
        'object-curly-spacing': ['error', 'always'],
        'padded-blocks': 'off',
        'require-jsdoc': 'off'
    }
};
