module.exports = {
  extends: [
    'plugin:vue/recommended', // or 'plugin:vue/base'
    'eslint:recommended'
  ],
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  plugins: [
    'html'
  ],
  'rules': {
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'space-before-function-paren': ['error', 'never']
  },
  globals: {
    $: true,
    jQuery: true,
    chrome: true
  }
};

