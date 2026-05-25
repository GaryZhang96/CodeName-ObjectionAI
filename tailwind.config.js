/** @type {import('tailwindcss').Config} */

/**
 * Lex Machina —— 像素逆转裁判风设计令牌
 *
 * 灵感来源：
 * - Phoenix Wright（GBA/NDS 原作）的硬边框、纯色块、戏剧化情绪表达
 * - 现代像素游戏（Stardew Valley、Octopath Traveler）的色彩克制和精致感
 *
 * 设计原则：
 * - 硬边框（border-2 / border-4），不用阴影模糊
 * - 8-bit 调色板，但有完整的灰阶过渡保证可读性
 * - 信息层级靠 surface 提升 + 边框对比，而不是渐变
 * - 警示色保留逆转裁判经典的红/蓝/黄/绿
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'pixel-title': ['"Press Start 2P"', 'cursive'],
        'pixel-body': ['"VT323"', 'monospace'],
        'pixel-mono': ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      colors: {
        // ============================================================
        // 表面 (Surface) - 从最深到最浅的层级，用于背景分层
        // 命名：surface-base 是 canvas，越往上 elevation 越高
        // ============================================================
        surface: {
          base: '#1a1330', // 深紫法庭主背景（庄严神秘）
          raised: '#241a45', // 卡片、面板背景
          overlay: '#2e225a', // 弹窗、下拉
          sunken: '#0e0820', // 输入框、嵌入区域
          inverse: '#f4ead2', // 浅色场景背景（菜单、卷宗）
        },

        // ============================================================
        // 文字 (Ink) - 4 级层级，保证 WCAG AA 对比度
        // ============================================================
        ink: {
          primary: '#fff8e7', // 主文字 (在深色背景上)
          secondary: '#c9bfd9', // 次要文字
          tertiary: '#857a99', // 标签、辅助
          muted: '#5a516d', // 禁用、占位
          line: '#3a2e5e', // 描边、分隔线
          'on-light': '#1f1a3a', // 浅色背景上的主文字
          'on-light-muted': '#5e5778', // 浅色背景上的次要文字
        },

        // ============================================================
        // 品牌色 (Brand) - 律法金色，传递权威感
        // ============================================================
        brand: {
          gold: '#ffb627', // 主品牌金（律政之光）
          'gold-deep': '#d4900a', // 加深，用于按下/边框
          'gold-soft': '#ffd980', // 高光、装饰
          ink: '#3a2400', // 金色背景上的文字
        },

        // ============================================================
        // 游戏语义色 (Game) - 致敬逆转裁判经典配色
        // ============================================================
        game: {
          red: '#ff4757', // 异议红、检察官、失败
          'red-deep': '#c92a39',
          blue: '#3742fa', // 证据蓝、辩护
          'blue-deep': '#1e2bcc',
          green: '#2ed573', // 真相绿、胜诉
          'green-deep': '#1a9f51',
          yellow: '#ffa502', // 警告黄、关键时刻
          'yellow-deep': '#cc7a00',
          purple: '#a55eea', // 神秘紫、逻辑锁
          'purple-deep': '#7c3aed',
        },

        // 兼容旧 API（逐步移除，但保留以防破坏遗留代码）
        court: {
          primary: '#1a1330',
          secondary: '#241a45',
          accent: '#ffb627',
          highlight: '#a55eea',
        },
        pixel: {
          black: '#0e0820',
          dark: '#241a45',
          gray: '#857a99',
          light: '#fff8e7',
          white: '#ffffff',
          gold: '#ffb627',
          red: '#ff4757',
          green: '#2ed573',
          blue: '#3742fa',
        },
        amber: {
          glow: '#ffd980',
          dim: '#d4900a',
          dark: '#3a2400',
        },
      },

      // ============================================================
      // 阴影 - 像素风用 box-shadow 做"硬偏移"投影，不用模糊
      // ============================================================
      boxShadow: {
        'pixel-sm': '2px 2px 0 0 rgba(14, 8, 32, 0.7)',
        pixel: '4px 4px 0 0 rgba(14, 8, 32, 0.7)',
        'pixel-lg': '6px 6px 0 0 rgba(14, 8, 32, 0.8)',
        'pixel-xl': '8px 8px 0 0 rgba(14, 8, 32, 0.85)',
        'pixel-gold': '4px 4px 0 0 #d4900a',
        'pixel-red': '4px 4px 0 0 #c92a39',
        'pixel-blue': '4px 4px 0 0 #1e2bcc',
        'pixel-green': '4px 4px 0 0 #1a9f51',
        'pixel-inset': 'inset 2px 2px 0 0 rgba(14, 8, 32, 0.4)',
        'glow-gold': '0 0 16px rgba(255, 182, 39, 0.5)',
        'glow-red': '0 0 16px rgba(255, 71, 87, 0.5)',
        'glow-blue': '0 0 16px rgba(55, 66, 250, 0.5)',
        'glow-green': '0 0 16px rgba(46, 213, 115, 0.5)',
      },

      // ============================================================
      // 圆角 - 像素风原则上不要圆角；预留小圆角用于现代化场景
      // ============================================================
      borderRadius: {
        none: '0',
        pixel: '0', // 强制 0，提醒"我们是像素风"
        'pixel-soft': '2px', // 仅在确实需要时的最小圆角
      },

      // ============================================================
      // 动画 - 戏剧化、有冲击感
      // ============================================================
      animation: {
        'pixel-pulse': 'pixel-pulse 1.5s ease-in-out infinite',
        'pixel-blink': 'pixel-blink 1s steps(2) infinite',
        'pixel-shake': 'pixel-shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'pixel-shake-strong':
          'pixel-shake-strong 0.6s cubic-bezier(.36,.07,.19,.97) both',
        'pixel-bounce-in': 'pixel-bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
        'pixel-slide-up': 'pixel-slide-up 0.3s steps(8, end)',
        'pixel-typing': 'pixel-typing 1.5s steps(40, end)',
        'pixel-flash': 'pixel-flash 0.15s linear infinite',
        'pixel-glow': 'pixel-glow 2s ease-in-out infinite',
        'pixel-heartbeat': 'pixel-heartbeat 0.8s ease-in-out infinite',
        'pixel-scan': 'pixel-scan 6s linear infinite',
        'pixel-zoom-in': 'pixel-zoom-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pixel-float-up': 'pixel-float-up 1.4s ease-out forwards',
      },
      keyframes: {
        'pixel-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        'pixel-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pixel-shake': {
          '10%, 90%': { transform: 'translate3d(-2px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(3px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-5px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(5px, 0, 0)' },
        },
        'pixel-shake-strong': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '10%': { transform: 'translate3d(-12px, -4px, 0) rotate(-2deg)' },
          '20%': { transform: 'translate3d(12px, 4px, 0) rotate(2deg)' },
          '30%': { transform: 'translate3d(-10px, -3px, 0) rotate(-1.5deg)' },
          '40%': { transform: 'translate3d(10px, 3px, 0) rotate(1.5deg)' },
          '50%': { transform: 'translate3d(-8px, 0, 0)' },
          '60%': { transform: 'translate3d(8px, 0, 0)' },
          '70%': { transform: 'translate3d(-5px, 0, 0)' },
          '80%': { transform: 'translate3d(5px, 0, 0)' },
        },
        'pixel-bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pixel-slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pixel-typing': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'pixel-flash': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'pixel-glow': {
          '0%, 100%': {
            'box-shadow':
              '4px 4px 0 0 rgba(14, 8, 32, 0.7), 0 0 12px rgba(255, 182, 39, 0.3)',
          },
          '50%': {
            'box-shadow':
              '4px 4px 0 0 rgba(14, 8, 32, 0.7), 0 0 28px rgba(255, 182, 39, 0.7)',
          },
        },
        'pixel-heartbeat': {
          '0%, 100%': { transform: 'scale(1)' },
          '20%': { transform: 'scale(1.06)' },
          '40%': { transform: 'scale(0.98)' },
          '60%': { transform: 'scale(1.04)' },
          '80%': { transform: 'scale(0.99)' },
        },
        'pixel-scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'pixel-zoom-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pixel-float-up': {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '20%': { transform: 'translateY(-10px) scale(1)', opacity: '1' },
          '100%': {
            transform: 'translateY(-80px) scale(1.05)',
            opacity: '0',
          },
        },
      },

      // ============================================================
      // 间距 - 基础 4px，但鼓励使用 8/12/16/24/32 这些"像素友好"值
      // ============================================================
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
    },
  },
  plugins: [],
};
