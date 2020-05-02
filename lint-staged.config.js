module.exports = {
  'src/**/*.{ts,tsx}': ['eslint --ext js --ext jsx --ext ts --ext tsx --fix'],
  '**/*.{js,jsx,mjs,ts,tsx,json,md,css,yml,yaml,less,scss}': [
    'prettier --write',
  ],
}
