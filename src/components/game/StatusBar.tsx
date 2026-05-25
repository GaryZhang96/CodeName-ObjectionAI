/**
 * 顶部状态栏 - 像素风
 *
 * 显示等级 / 经验 / 金钱 / 声望
 * 经典 RPG 状态栏布局，HUD 风格
 */

import { motion } from 'framer-motion';
import { Coins, Award, Star } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney, getRankName } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function StatusBar() {
  const player = useGameStore((state) => state.player);

  const xpPercent = Math.min(
    100,
    (player.currentXP / Math.max(1, player.xpToNextLevel)) * 100
  );

  return (
    <motion.div
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 safe-top',
        'bg-surface-sunken/95 backdrop-blur-md',
        'border-b-[3px] border-brand-gold'
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2 flex items-center gap-3 sm:gap-6">
        {/* 等级 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-brand-gold border-[3px] border-brand-gold-deep flex items-center justify-center shadow-pixel-sm">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-brand-ink" />
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="font-pixel-title text-[9px] text-ink-tertiary leading-none">
              LEVEL
            </p>
            <p className="font-pixel-title text-sm text-brand-gold leading-tight mt-0.5">
              {player.level}
              <span className="ml-1.5 text-[10px] text-ink-secondary">
                {getRankName(player.rank)}
              </span>
            </p>
          </div>
          <span className="sm:hidden font-pixel-title text-xs text-brand-gold">
            Lv.{player.level}
          </span>
        </div>

        {/* 经验条 */}
        <div className="flex-1 min-w-0 max-w-xs">
          <div className="hidden sm:flex justify-between font-pixel-body text-[10px] text-ink-tertiary mb-1">
            <span>EXP</span>
            <span>
              {player.currentXP} / {player.xpToNextLevel}
            </span>
          </div>
          <div className="h-2.5 sm:h-3 bg-surface-base border-2 border-ink-line relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-game-green"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* 进度条扫光（持续微动效） */}
            <motion.div
              className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '2000%'] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                repeatDelay: 1,
              }}
            />
          </div>
        </div>

        {/* 标题（仅大屏幕） */}
        <div className="hidden lg:block shrink-0">
          <p className="font-pixel-title text-sm text-brand-gold tracking-widest pixel-title-glow">
            LEX·MACHINA
          </p>
        </div>

        {/* 金钱 + 声望 */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Coins
              className={cn(
                'w-4 h-4 sm:w-5 sm:h-5',
                player.money < 100
                  ? 'text-game-red animate-pixel-blink'
                  : 'text-brand-gold'
              )}
            />
            <span
              className={cn(
                'font-pixel-title text-xs sm:text-sm tabular-nums',
                player.money < 100 ? 'text-game-red' : 'text-brand-gold'
              )}
            >
              {formatMoney(player.money)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 border-l-2 border-ink-line pl-2 sm:pl-4">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-game-purple" />
            <span className="font-pixel-title text-xs sm:text-sm text-game-purple tabular-nums">
              {player.reputation}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
