import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDF8F1',
          100: '#F6ECDA',
          200: '#EBDEC4',
        },
        coral: {
          50: '#FFF1EF',
          100: '#FFE2DD',
          500: '#FF6F61',
          600: '#FF5547',
          700: '#E54637',
        },
        sea: {
          50: '#EEF2FF',
          100: '#DCE3FF',
          500: '#2E5BFF',
          600: '#1A47EB',
          700: '#0F39D6',
        },
        ink: {
          DEFAULT: '#2A2620',
          400: '#7C746A',
          500: '#5C544A',
          600: '#3F392F',
          900: '#2A2620',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(35, 25, 15, 0.04), 0 4px 16px rgba(35, 25, 15, 0.05)',
        cardHover: '0 2px 4px rgba(35, 25, 15, 0.06), 0 10px 28px rgba(35, 25, 15, 0.08)',
        soft: '0 1px 2px rgba(35, 25, 15, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
