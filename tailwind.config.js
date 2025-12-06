/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel-title': ['"Press Start 2P"', 'cursive'],
        'pixel-body': ['"VT323"', 'monospace'],
      },
      colors: {
        // 主色调 - 琥珀色复古终端风格
        amber: {
          glow: '#ffb000',
          dim: '#996600',
          dark: '#332200',
        },
        // 深蓝法庭风格
        court: {
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#0f3460',
          highlight: '#e94560',
        },
        // 像素游戏风格
        pixel: {
          black: '#0d0d0d',
          dark: '#1a1a1a',
          gray: '#333333',
          light: '#cccccc',
          white: '#f0f0f0',
          gold: '#ffd700',
          red: '#ff4444',
          green: '#44ff44',
          blue: '#4444ff',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'flicker': 'flicker 0.15s infinite',
        'typing': 'typing 2s steps(20) infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0,0,0,1)',
        'pixel-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'pixel-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'glow-amber': '0 0 20px rgba(255, 176, 0, 0.5)',
        'glow-red': '0 0 20px rgba(255, 68, 68, 0.5)',
        'glow-green': '0 0 20px rgba(68, 255, 68, 0.5)',
      },
    },
  },
  plugins: [],
}

