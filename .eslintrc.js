module.exports = {
  extends: [
    'plugin:vue-libs/recommended', // or 'plugin:vue/base'
    'eslint:recommended'
  ],
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
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

