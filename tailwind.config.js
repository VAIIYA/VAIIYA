/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'metamask-orange': '#ff5c16',
        'metamask-black': '#0a0a0a',
        'metamask-purple': '#3d065f',
        'metamask-gray-50': '#f7f9fc',
        'metamask-gray-100': '#e9edf6',
        'solana-purple': '#9945FF',
        'solana-green': '#14F195',
      },
      backgroundImage: {
        'gradient-solana': 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
        'gradient-solana-reverse': 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)',
      },
      fontFamily: {
        serif: ['"Poly"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '32px',
      },
    },
  },
  plugins: [],
}
