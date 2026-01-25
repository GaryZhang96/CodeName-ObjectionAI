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
        // 主色调 - 温暖卡通风格
        amber: {
          glow: '#ffb000',
          dim: '#996600',
          dark: '#332200',
        },
        // 温暖律所风格 - 卡通化配色
        court: {
          primary: '#f5f0e8',     // 温暖米黄色背景
          secondary: '#fff8f0',   // 纸张白色
          accent: '#6b8e23',      // 橄榄绿(律师事务所感)
          highlight: '#d4a574',   // 暖棕色高光
        },
        // 卡通游戏风格
        pixel: {
          black: '#2d2d2d',
          dark: '#4a4a4a',
          gray: '#7a7a7a',
          light: '#3a3a3a',       // 深色文字用于浅背景
          white: '#ffffff',
          gold: '#f4a460',        // 暖金色
          red: '#ff6b6b',         // 柔和红色
          green: '#51cf66',       // 生机绿色
          blue: '#4dabf7',        // 明亮蓝色
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
        'pixel': '4px 4px 0px 0px rgba(0,0,0,0.15)',
        'pixel-sm': '2px 2px 0px 0px rgba(0,0,0,0.1)',
        'pixel-lg': '6px 6px 0px 0px rgba(0,0,0,0.2)',
        'glow-amber': '0 0 20px rgba(255, 176, 0, 0.3)',
        'glow-red': '0 0 20px rgba(255, 107, 107, 0.3)',
        'glow-green': '0 0 20px rgba(81, 207, 102, 0.3)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'cartoon': '12px',
        'cartoon-lg': '20px',
        'cartoon-xl': '28px',
      },
    },
  },
  plugins: [],
}

