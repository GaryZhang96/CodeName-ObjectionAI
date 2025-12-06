/**
 * 状态栏组件 - 显示玩家状态
 */

import { motion } from 'framer-motion';
import { Coins, Star, Award, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney, getRankName } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function StatusBar() {
  const player = useGameStore(state => state.player);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40 bg-court-primary/95 border-b-4 border-pixel-gold"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* 左侧：玩家信息 */}
        <div className="flex items-center gap-6">
          {/* 等级 */}
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-pixel-gold" />
            <span className="font-pixel-title text-xs text-pixel-gold">
              Lv.{player.level}
            </span>
            <span className="font-pixel-body text-sm text-pixel-light">
              {getRankName(player.rank)}
            </span>
          </div>

          {/* 经验条 */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-pixel-green" />
            <div className="w-24 h-3 bg-pixel-dark border-2 border-pixel-gray">
              <motion.div
                className="h-full bg-pixel-green"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(player.currentXP / player.xpToNextLevel) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="font-pixel-body text-xs text-pixel-gray">
              {player.currentXP}/{player.xpToNextLevel}
            </span>
          </div>
        </div>

        {/* 中间：游戏标题 */}
        <h1 className="font-pixel-title text-sm text-pixel-gold glow-text hidden md:block">
          LEX MACHINA
        </h1>

        {/* 右侧：资源 */}
        <div className="flex items-center gap-6">
          {/* 金钱 */}
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className={cn(
              "font-pixel-title text-sm",
              player.money < 100 ? "text-pixel-red" : "text-yellow-400"
            )}>
              {formatMoney(player.money)}
            </span>
          </div>

          {/* 声望 */}
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="font-pixel-body text-sm text-purple-400">
              {player.reputation}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

