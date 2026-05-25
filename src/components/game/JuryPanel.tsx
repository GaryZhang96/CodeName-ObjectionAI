/**
 * 陪审团面板 - 像素风
 *
 * 设计：
 * - 12 个像素小人（用 emoji 表情代替头像），按情绪着色边框
 * - 底部用像素天平条直观显示整体倾向（左有罪 / 右无罪）
 * - 集体情绪变化时会有触发性脉冲，提供视觉反馈
 */

import { motion } from 'framer-motion';
import { Panel } from '@/components/ui';
import { Users } from 'lucide-react';
import type { JuryMember } from '@/types';
import { cn } from '@/lib/utils';

interface JuryPanelProps {
  jury: JuryMember[];
  averageSentiment: number;
  /** 紧凑模式（移动端） */
  compact?: boolean;
}

export function JuryPanel({
  jury,
  averageSentiment,
  compact = false,
}: JuryPanelProps) {
  const getSentimentClass = (sentiment: number) => {
    if (sentiment >= 30) return 'bg-game-green/20 border-game-green';
    if (sentiment <= -30) return 'bg-game-red/20 border-game-red';
    return 'bg-surface-overlay border-ink-line';
  };

  const verdict = (() => {
    if (averageSentiment >= 30)
      return {
        text: '倾向无罪',
        class: 'text-game-green',
        emoji: '⚖️',
      };
    if (averageSentiment <= -30)
      return {
        text: '倾向有罪',
        class: 'text-game-red',
        emoji: '⚠️',
      };
    return {
      text: '意见胶着',
      class: 'text-brand-gold',
      emoji: '🤔',
    };
  })();

  // -100 ~ 100 映射到 0 ~ 100
  const indicatorPercent = Math.max(0, Math.min(100, 50 + averageSentiment / 2));

  return (
    <Panel variant="dark" padding={compact ? 'sm' : 'md'} className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-brand-gold" />
          <h3 className="font-pixel-title text-[10px] sm:text-xs text-brand-gold uppercase tracking-wider">
            陪审团
          </h3>
        </div>
        <span
          className={cn(
            'font-pixel-title text-[10px] sm:text-xs flex items-center gap-1',
            verdict.class
          )}
        >
          <span>{verdict.emoji}</span>
          {verdict.text}
        </span>
      </div>

      {/* 12 人陪审团网格 */}
      <div
        className={cn(
          'grid grid-cols-6 sm:grid-cols-6 gap-1 sm:gap-1.5 mb-3',
          compact && 'mb-2.5'
        )}
      >
        {jury.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: index * 0.03,
              type: 'spring',
              stiffness: 240,
            }}
            className={cn(
              'aspect-square flex items-center justify-center',
              'border-2 transition-all duration-300',
              'text-base sm:text-lg shadow-pixel-sm',
              getSentimentClass(member.sentiment),
              member.sentiment >= 50 && 'animate-pixel-pulse',
              member.sentiment <= -50 && 'animate-pixel-pulse'
            )}
            title={`陪审员 ${member.id}: ${member.sentiment > 0 ? '+' : ''}${Math.round(member.sentiment)}`}
          >
            {member.expression}
          </motion.div>
        ))}
      </div>

      {/* 倾向天平条 */}
      <div className="relative">
        <div className="flex justify-between font-pixel-title text-[9px] sm:text-[10px] mb-1">
          <span className="text-game-red">◀ 有罪</span>
          <span className="text-ink-tertiary tabular-nums">
            {averageSentiment > 0 ? '+' : ''}
            {Math.round(averageSentiment)}
          </span>
          <span className="text-game-green">无罪 ▶</span>
        </div>
        <div className="relative h-3 bg-surface-base border-2 border-ink-line overflow-hidden">
          {/* 左半红色渐变 */}
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-game-red/30 to-transparent" />
          {/* 右半绿色渐变 */}
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-game-green/30 to-transparent" />
          {/* 中线 */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-ink-line/80" />
          {/* 金色指示器 */}
          <motion.div
            className="absolute inset-y-0 w-2 bg-brand-gold shadow-glow-gold"
            animate={{ left: `calc(${indicatorPercent}% - 4px)` }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          />
        </div>
      </div>
    </Panel>
  );
}
