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
          50:  '#FAFAFA',
          100: '#F7F7F5',
          150: '#F2F2F0',
          200: '#EFEFEF',
          250: '#E8E8E6',
          300: '#D9D9D9',
          350: '#C8C8C6',
          400: '#9A9A9A',
          500: '#6B6B6B',
          600: '#444444',
          700: '#2A2A2A',
          800: '#1A1A1A',
          900: '#111111',
          950: '#0A0A0A',
        },
        blue: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        tight: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'xs':   '0 1px 2px 0 rgba(0,0,0,0.04)',
        'sm':   '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card': '0 1px 4px 0 rgba(0,0,0,0.06)',
        'md':   '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'lg':   '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.04)',
        'xl':   '0 20px 25px -5px rgba(0,0,0,0.07), 0 8px 10px -6px rgba(0,0,0,0.04)',
        'dropdown': '0 4px 24px 0 rgba(0,0,0,0.09)',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
