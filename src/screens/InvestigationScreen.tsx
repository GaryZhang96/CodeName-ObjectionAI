/**
 * 调查阶段界面 - 简化版
 * 仅展示案件信息,快速进入庭审
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, Scale, User } from 'lucide-react';
import { Button, Panel } from '@/components/ui';
import { StatusBar } from '@/components/game';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

export function InvestigationScreen() {
  const {
    currentCase,
    initCourtroom,
    setPhase,
  } = useGameStore();

  const [readFullBackground, setReadFullBackground] = useState(false);

  const handleProceedToCourtroom = () => {
    initCourtroom();
  };

  if (!currentCase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-pixel-light">没有选中的案件</p>
        <Button onClick={() => setPhase('office')}>返回事务所</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-court-primary">
      <StatusBar />
      
      <div className="pt-14 sm:pt-16 pb-6 sm:pb-8 px-3 sm:px-4 max-w-4xl mx-auto safe-area-inset">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <h1 className="font-pixel-title text-lg sm:text-2xl text-pixel-gold mb-1 sm:mb-2">
            <FileText className="inline w-6 h-6 sm:w-8 sm:h-8 mr-1 sm:mr-2" />
            案件详情
          </h1>
          <p className="font-pixel-body text-xs sm:text-sm text-pixel-gray">
            阅读案件背景,准备庭审
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-6">
          {/* 案件信息卡片 */}
          <Panel variant="default">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="font-pixel-title text-sm sm:text-lg text-pixel-gold mb-1 sm:mb-2">
                  {currentCase.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className={cn(
                    'text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 border-2 font-pixel-title',
                    currentCase.difficulty === 'easy' && 'border-pixel-green text-pixel-green',
                    currentCase.difficulty === 'medium' && 'border-yellow-400 text-yellow-400',
                    currentCase.difficulty === 'hard' && 'border-pixel-red text-pixel-red',
                    currentCase.difficulty === 'legendary' && 'border-purple-400 text-purple-400',
                  )}>
                    {currentCase.difficulty.toUpperCase()}
                  </span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 border-2 border-pixel-gray text-pixel-light font-pixel-body">
                    {currentCase.type}
                  </span>
                </div>
              </div>
              <Scale className="w-8 h-8 sm:w-12 sm:h-12 text-pixel-gold opacity-50" />
            </div>

            {/* 案件摘要 */}
            <div className="mb-3 sm:mb-4">
              <p className="font-pixel-body text-xs sm:text-sm text-pixel-light leading-relaxed">
                {currentCase.summary}
              </p>
            </div>

            {/* 详细背景 */}
            <div className="border-t border-pixel-gray/30 pt-3 sm:pt-4">
              <button
                onClick={() => setReadFullBackground(!readFullBackground)}
                className="font-pixel-title text-[10px] sm:text-xs text-pixel-gold hover:text-amber-glow transition-colors mb-2"
              >
                {readFullBackground ? '▼ 收起详情' : '▶ 查看详细背景'}
              </button>
              {readFullBackground && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <p className="font-pixel-body text-xs sm:text-sm text-pixel-light leading-relaxed whitespace-pre-wrap">
                    {currentCase.detailedBackground}
                  </p>
                </motion.div>
              )}
            </div>
          </Panel>

          {/* 被告信息 */}
          <Panel variant="dark">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-pixel-blue" />
              <h3 className="font-pixel-title text-xs sm:text-sm text-pixel-gold">
                被告信息
              </h3>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] sm:text-xs text-pixel-gray">姓名:</span>
                <span className="text-xs sm:text-sm text-pixel-light font-pixel-body">
                  {currentCase.defendant.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] sm:text-xs text-pixel-gray">年龄:</span>
                <span className="text-xs sm:text-sm text-pixel-light font-pixel-body">
                  {currentCase.defendant.age} 岁
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] sm:text-xs text-pixel-gray">职业:</span>
                <span className="text-xs sm:text-sm text-pixel-light font-pixel-body">
                  {currentCase.defendant.occupation}
                </span>
              </div>
              {currentCase.defendant.background && (
                <div className="mt-2 pt-2 border-t border-pixel-gray/30">
                  <p className="text-xs sm:text-sm text-pixel-light font-pixel-body leading-relaxed">
                    {currentCase.defendant.background}
                  </p>
                </div>
              )}
            </div>
          </Panel>

          {/* 检察官信息 */}
          <Panel variant="dark">
            <h3 className="font-pixel-title text-xs sm:text-sm text-pixel-red mb-2 sm:mb-3">
              对手: {currentCase.prosecutor.name}
            </h3>
            <p className="text-xs sm:text-sm text-pixel-light font-pixel-body">
              {currentCase.prosecutor.personality}
            </p>
          </Panel>

          {/* 奖励信息 */}
          <Panel variant="dark">
            <h3 className="font-pixel-title text-xs sm:text-sm text-pixel-gold mb-2 sm:mb-3">
              潜在奖励
            </h3>
            <div className="flex gap-4 sm:gap-6">
              <div>
                <span className="text-[10px] sm:text-xs text-pixel-gray">经验值:</span>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-pixel-green font-pixel-body">
                  +{currentCase.rewards.baseXP} XP
                </span>
              </div>
              <div>
                <span className="text-[10px] sm:text-xs text-pixel-gray">报酬:</span>
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-yellow-400 font-pixel-body">
                  ${currentCase.rewards.baseMoney}
                </span>
              </div>
            </div>
          </Panel>

          {/* 进入庭审按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-end pt-2 sm:pt-4">
            <Button
              onClick={() => setPhase('office')}
              variant="ghost"
              className="w-full sm:w-auto"
            >
              返回事务所
            </Button>
            <Button
              onClick={handleProceedToCourtroom}
              size="lg"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              进入庭审
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
