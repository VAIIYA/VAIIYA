/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        neon: {
          pink: '#FF1B8D',
          blue: '#00D2FF',
          purple: '#8B5CF6',
          cyan: '#06FFA5',
          green: '#00FF88',
          yellow: '#FFD700',
          orange: '#FF8C00',
        },
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 27, 141, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 210, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-cyan': '0 0 20px rgba(6, 255, 165, 0.5)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'glow-yellow': '0 0 20px rgba(255, 215, 0, 0.5)',
      },
    },
  },
  plugins: [],
}