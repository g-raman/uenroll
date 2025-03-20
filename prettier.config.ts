import type { Config } from 'prettier'

const config: Config = {
  semi: false,
  singleQuote: false,
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 100,
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'lf',
  jsxSingleQuote: false,
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
