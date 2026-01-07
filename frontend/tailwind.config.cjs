// tailwind.config.cjs
// Premium SaaS Modernism Design System
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Framist Brand Colors
        mint: '#98FF98',
        paper: '#F7F7F5',
        ink: '#2D2D2D',
        mist: '#8E8E8E',
        coral: '#FF6B6B',
        'solid-white': '#FFFFFF',

        // Semantic Mappings (Legacy Support)
        primary: '#98FF98',           // Mint
        'primary-dark': '#80E880',    // Slightly darker mint/hover
        'primary-light': '#B8FFB8',   // Light mint

        secondary: '#2D2D2D',         // Ink as secondary interaction
        accent: '#FF6B6B',            // Coral for alerts

        // Text Colors
        textmain: '#2D2D2D',          // Ink
        'text-secondary': '#8E8E8E',  // Mist
        'text-muted': '#B0B0B0',      // Lighter Mist

        // Backgrounds
        background: '#F7F7F5',        // Paper
        'background-alt': '#FFFFFF',  // Solid White for cards

        // Surfaces
        surface: '#FFFFFF',
        'surface-hover': '#FAFAFA',

        // Borders
        border: '#E5E5E5',            // Subtle gray for dividers
        'border-ink': '#2D2D2D',      // Strong border for buttons/icons
      },
      fontFamily: {
        sans: ['DM Sans', 'Noto Sans SC', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',    // 12px (Buttons)
        '2xl': '1rem',      // 16px (Images)
        '3xl': '1.5rem',    // 24px (Cards)
        'full': '9999px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.05)', // Reduced opacity
        'float': '0 20px 40px -10px rgba(45, 45, 45, 0.05)', // Ink shadow
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
        },
      },
    },
  },
  plugins: [],
};
