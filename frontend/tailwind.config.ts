import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#209dd7',
          purple: '#753991',
          yellow: '#ecad0a',
          navy: '#032147',
          gray: '#888888',
        },
      },
    },
  },
  plugins: [],
};
export default config;
