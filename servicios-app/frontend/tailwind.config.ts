import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0a',
          925: '#0f0f0f',
          900: '#111111',
          850: '#161616',
          800: '#1a1a1a',
          750: '#1f1f1f',
          700: '#262626',
          600: '#333333',
          500: '#555555',
          400: '#888888',
          300: '#aaaaaa',
          200: '#cccccc',
          100: '#e5e5e5',
          50: '#f5f5f5',
        },
        blue: {
          950: '#0a1628',
          900: '#0f2040',
          800: '#1a3a6b',
          700: '#1e40af',
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
