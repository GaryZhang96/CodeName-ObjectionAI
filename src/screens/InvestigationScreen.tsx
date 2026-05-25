/**
 * 调查阶段 - 案件准备
 *
 * 设计：
 * - 卷宗封面式布局：标题 + 摘要 + 关键信息
 * - 三栏卡片：被告 / 检察官 / 奖励
 * - 大尺寸"进入庭审"CTA
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ArrowRight,
  Scale,
  Shield,
  Sword,
  TrendingUp,
  Coins,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react';
import { Button, Panel } from '@/components/ui';
import { StatusBar } from '@/components/game';
import { useGameStore } from '@/store/gameStore';
import { cn, formatMoney } from '@/lib/utils';
import { getProsecutorStyleName } from '@/constants/game';

export function InvestigationScreen() {
  const { currentCase, initCourtroom, setPhase } = useGameStore();
  const [showFullBackground, setShowFullBackground] = useState(false);

  if (!currentCase) {
    return (
      <div className="min-h-dvh flex items-center justify-center pixel-court-bg p-4">
        <Panel className="text-center max-w-md">
          <p className="font-pixel-body text-base text-ink-primary mb-4">
            没有选中的案件
          </p>
          <Button onClick={() => setPhase('office')} fullWidth>
            返回事务所
          </Button>
        </Panel>
      </div>
    );
  }

  const difficultyMeta: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    easy: {
      label: 'EASY',
      color: 'text-game-green',
      bg: 'bg-game-green/15',
    },
    medium: {
      label: 'MEDIUM',
      color: 'text-game-yellow',
      bg: 'bg-game-yellow/15',
    },
    hard: {
      label: 'HARD',
      color: 'text-game-red',
      bg: 'bg-game-red/15',
    },
    legendary: {
      label: 'LEGENDARY',
      color: 'text-game-purple',
      bg: 'bg-game-purple/15',
    },
  };

  const diff = difficultyMeta[currentCase.difficulty] || difficultyMeta.easy;

  return (
    <div className="min-h-dvh pixel-court-bg">
      <StatusBar />

      <div className="pt-16 sm:pt-20 pb-8 px-3 sm:px-4 max-w-4xl mx-auto safe-x">
        {/* 返回 */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-3 sm:mb-5"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPhase('office')}
            className="!min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回事务所
          </Button>
        </motion.div>

        {/* 顶部 - 卷宗封面 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-5 sm:mb-7"
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-brand-gold" />
            <h1 className="font-pixel-title text-lg sm:text-2xl text-brand-gold pixel-title-glow">
              案件准备
            </h1>
          </div>
          <p className="font-pixel-body text-sm text-ink-tertiary">
            阅读案情，准备进入庭审
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* 案件主面板 */}
          <Panel variant="highlight" padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
              <Scale className="w-12 h-12 sm:w-14 sm:h-14 text-brand-gold shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={cn('pixel-badge !text-[10px]', diff.bg, diff.color)}>
                    {diff.label}
                  </span>
                  <span className="pixel-badge !text-[10px]">
                    {currentCase.type}
                  </span>
                </div>
                <h2 className="font-pixel-title text-xl sm:text-2xl text-ink-primary mb-2 leading-tight">
                  {currentCase.title}
                </h2>
                <p className="font-pixel-body text-base text-ink-primary leading-relaxed">
                  {currentCase.summary}
                </p>
              </div>
            </div>

            {/* 详细背景 - 可展开 */}
            <div className="pt-4 border-t-[3px] border-brand-gold/40">
              <button
                onClick={() => setShowFullBackground(!showFullBackground)}
                className="flex items-center gap-2 font-pixel-title text-xs text-brand-gold hover:text-brand-gold-soft transition-colors mb-2"
              >
                {showFullBackground ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {showFullBackground ? '收起详情' : '查看详细案情'}
              </button>
              {showFullBackground && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <Panel variant="dark" padding="md" className="mt-2">
                    <p className="font-pixel-body text-base text-ink-primary leading-relaxed whitespace-pre-wrap">
                      {currentCase.detailedBackground}
                    </p>
                  </Panel>
                </motion.div>
              )}
            </div>
          </Panel>

          {/* 三栏：被告 / 检察官 / 奖励 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* 被告 */}
            <Panel variant="default" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-game-blue" />
                <h3 className="font-pixel-title text-xs text-game-blue uppercase tracking-wider">
                  你的当事人
                </h3>
              </div>
              <p className="font-pixel-body text-lg text-ink-primary mb-1">
                {currentCase.defendant.name}
              </p>
              <p className="font-pixel-body text-sm text-ink-tertiary mb-3">
                {currentCase.defendant.age} 岁 ·{' '}
                {currentCase.defendant.occupation}
              </p>
              {currentCase.defendant.background && (
                <p className="font-pixel-body text-sm text-ink-secondary leading-relaxed border-t-2 border-ink-line pt-3">
                  {currentCase.defendant.background}
                </p>
              )}
            </Panel>

            {/* 检察官 */}
            <Panel variant="default" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <Sword className="w-5 h-5 text-game-red" />
                <h3 className="font-pixel-title text-xs text-game-red uppercase tracking-wider">
                  对手检察官
                </h3>
              </div>
              <p className="font-pixel-body text-lg text-ink-primary mb-1">
                {currentCase.prosecutor.name}
              </p>
              <p className="font-pixel-body text-sm text-ink-tertiary mb-3">
                风格: {getProsecutorStyleName(currentCase.prosecutor.style)}
              </p>
              <p className="font-pixel-body text-sm text-ink-secondary leading-relaxed border-t-2 border-ink-line pt-3">
                {currentCase.prosecutor.personality}
              </p>
            </Panel>

            {/* 奖励 */}
            <Panel variant="default" padding="md">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-brand-gold" />
                <h3 className="font-pixel-title text-xs text-brand-gold uppercase tracking-wider">
                  胜诉奖励
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-surface-overlay border-2 border-ink-line">
                  <span className="flex items-center gap-1.5 font-pixel-body text-sm text-ink-secondary">
                    <TrendingUp className="w-3.5 h-3.5 text-game-green" />
                    经验值
                  </span>
                  <span className="font-pixel-title text-sm text-game-green tabular-nums">
                    +{currentCase.rewards.baseXP}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-surface-overlay border-2 border-ink-line">
                  <span className="flex items-center gap-1.5 font-pixel-body text-sm text-ink-secondary">
                    <Coins className="w-3.5 h-3.5 text-brand-gold" />
                    报酬
                  </span>
                  <span className="font-pixel-title text-sm text-brand-gold tabular-nums">
                    {formatMoney(currentCase.rewards.baseMoney)}
                  </span>
                </div>
              </div>
            </Panel>
          </div>

          {/* 进入庭审 - 大 CTA */}
          <Panel variant="dark" padding="lg">
            <div className="text-center mb-4">
              <p className="font-pixel-title text-xs text-brand-gold uppercase tracking-widest mb-2">
                ▼ 准备好了吗 ▼
              </p>
              <p className="font-pixel-body text-base text-ink-secondary">
                一旦进入庭审，将无法回头
              </p>
            </div>
            <Button
              onClick={() => initCourtroom()}
              size="lg"
              fullWidth
              className="!py-5 animate-pixel-glow"
            >
              <ArrowRight className="w-5 h-5" />
              进入庭审
            </Button>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}
