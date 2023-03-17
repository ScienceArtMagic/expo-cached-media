module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['react-hooks', 'react-native', 'jsx-a11y'],
  extends: [
    'plugin:jsx-a11y/recommended',
    'universe',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 2,
    'react-hooks/exhaustive-deps': 2,
    '@typescript-eslint/no-unused-vars': 2,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/prefer-interface': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/array-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-parameter-properties': 0,
    'standard/computed-property-even-spacing': 0,
    'standard/array-bracket-even-spacing': 0,
    'prettier/prettier': 0,
    'react/prop-types': 0,
    'react-native/no-inline-styles': 0,
    'react/no-did-mount-set-state': 0,
    'dot-notation': 2,
    'no-shadow': 0,
    radix: 0,
    'no-bitwise': 0,
    'no-useless-constructor': 0,
    'prefer-const': 1,
  },
}
