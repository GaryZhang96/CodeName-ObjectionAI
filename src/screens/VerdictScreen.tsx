/**
 * 判决与复盘 - 像素风
 *
 * 设计：
 * - 顶部：法槌敲下动画 + 判决结果震撼揭示
 * - 中部：奖励像 RPG 一样依次"叮"地出现
 * - 底部：复盘 - 精彩 / 失误 / 改进，S/A/B/C 勋章评级
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  XCircle,
  AlertTriangle,
  Coins,
  TrendingUp,
  CheckCircle,
  XOctagon,
  Lightbulb,
  ArrowRight,
  Star,
  Gavel,
  Award,
} from 'lucide-react';
import { Button, Panel } from '@/components/ui';
import { useGameStore } from '@/store/gameStore';
import { formatMoney, cn } from '@/lib/utils';
import { getRatingColor } from '@/constants/game';

export function VerdictScreen() {
  const {
    verdict,
    currentCase,
    addXP,
    addMoney,
    applyVerdictRewards,
    clearCurrentCase,
    setPhase,
  } = useGameStore();

  const [showRewards, setShowRewards] = useState(false);
  const [rewardsApplied, setRewardsApplied] = useState(false);
  const [gavelStruck, setGavelStruck] = useState(false);

  useEffect(() => {
    // 法槌敲下
    const t1 = setTimeout(() => setGavelStruck(true), 600);
    // 显示奖励
    const t2 = setTimeout(() => setShowRewards(true), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!verdict || !currentCase) {
    return (
      <div className="min-h-dvh flex items-center justify-center pixel-court-bg p-4">
        <Panel className="max-w-md text-center">
          <p className="font-pixel-body text-base text-ink-primary mb-4">
            判决数据丢失
          </p>
          <Button onClick={() => setPhase('office')} fullWidth>
            返回事务所
          </Button>
        </Panel>
      </div>
    );
  }

  const handleClaimRewards = () => {
    if (!rewardsApplied) {
      addXP(verdict.rewards.xp);
      addMoney(verdict.rewards.money);
      applyVerdictRewards();
      setRewardsApplied(true);
    }
  };

  const handleContinue = () => {
    clearCurrentCase();
    setPhase('office');
  };

  const verdictDisplay = (() => {
    switch (verdict.outcome) {
      case 'not_guilty':
        return {
          icon: Trophy,
          text: '无 罪 释 放',
          subtext: 'NOT GUILTY',
          color: 'text-game-green',
          bgClass: 'bg-game-green/15',
          borderClass: 'border-game-green',
          shadow: 'shadow-pixel-green',
        };
      case 'guilty':
        return {
          icon: XCircle,
          text: '有 罪 判 决',
          subtext: 'GUILTY',
          color: 'text-game-red',
          bgClass: 'bg-game-red/15',
          borderClass: 'border-game-red',
          shadow: 'shadow-pixel-red',
        };
      case 'mistrial':
        return {
          icon: AlertTriangle,
          text: '案 件 流 审',
          subtext: 'MISTRIAL',
          color: 'text-game-yellow',
          bgClass: 'bg-game-yellow/15',
          borderClass: 'border-game-yellow',
          shadow: 'shadow-pixel',
        };
    }
  })();

  const VerdictIcon = verdictDisplay.icon;
  const ratingColor = getRatingColor(verdict.review.overallRating);

  return (
    <div className="min-h-dvh pixel-court-bg overflow-y-auto safe-x">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 safe-top safe-bottom">
        {/* ============== 法槌敲下 + 结果 ============== */}
        <div className="relative h-48 sm:h-56 mb-6 sm:mb-8 flex items-center justify-center">
          {/* 法槌 */}
          <motion.div
            initial={{ y: -100, rotate: -45, opacity: 0 }}
            animate={
              gavelStruck
                ? { y: 0, rotate: 0, opacity: 1 }
                : { y: -80, rotate: -45, opacity: 1 }
            }
            transition={{ duration: 0.4, type: 'spring', damping: 14 }}
            className="absolute"
          >
            <Gavel
              className="w-20 h-20 sm:w-24 sm:h-24 text-brand-gold"
              style={{
                filter:
                  'drop-shadow(4px 4px 0 rgba(14,8,32,0.9)) drop-shadow(0 0 24px rgba(255,182,39,0.6))',
              }}
            />
          </motion.div>

          {/* 震击波 */}
          {gavelStruck && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute w-32 h-32 border-4 border-brand-gold rounded-full"
            />
          )}
        </div>

        {/* 判决面板 */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={
            gavelStruck
              ? { scale: 1, opacity: 1 }
              : { scale: 0.7, opacity: 0 }
          }
          transition={{ duration: 0.4, type: 'spring' }}
          className={cn(
            'mb-5 sm:mb-7 p-6 sm:p-8 text-center',
            'border-[3px] bg-surface-raised',
            verdictDisplay.borderClass,
            verdictDisplay.shadow
          )}
        >
          <motion.div
            animate={
              gavelStruck
                ? {
                    scale: [1, 1.15, 1],
                    rotate: verdict.outcome === 'not_guilty' ? [0, -5, 5, 0] : 0,
                  }
                : {}
            }
            transition={{ duration: 1, repeat: verdict.outcome === 'not_guilty' ? 1 : 0 }}
            className="inline-block mb-3"
          >
            <VerdictIcon
              className={cn(
                'w-16 h-16 sm:w-20 sm:h-20',
                verdictDisplay.color
              )}
            />
          </motion.div>
          <h1
            className={cn(
              'font-pixel-title text-2xl sm:text-4xl mb-2 tracking-widest',
              verdictDisplay.color
            )}
            style={{
              textShadow:
                '3px 3px 0 rgba(14,8,32,0.95), 0 0 24px currentColor',
            }}
          >
            {verdictDisplay.text}
          </h1>
          <p
            className={cn(
              'font-pixel-title text-sm sm:text-base tracking-[0.3em]',
              verdictDisplay.color
            )}
          >
            {verdictDisplay.subtext}
          </p>
        </motion.div>

        {/* ============== 案件 + 判决理由 ============== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={
            gavelStruck ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
          }
          transition={{ delay: 0.3 }}
          className="mb-5"
        >
          <Panel variant="default" padding="lg">
            <h2 className="font-pixel-title text-sm text-brand-gold mb-3 uppercase tracking-wider">
              判决书 ·《{currentCase.title}》
            </h2>
            <p className="font-pixel-body text-base text-ink-primary leading-relaxed mb-4">
              {verdict.reasoning}
            </p>
            <div className="flex items-center justify-between pt-3 border-t-2 border-ink-line">
              <span className="font-pixel-body text-sm text-ink-tertiary">
                陪审团最终倾向
              </span>
              <span
                className={cn(
                  'font-pixel-title text-base tabular-nums',
                  verdict.finalJurySentiment >= 0
                    ? 'text-game-green'
                    : 'text-game-red'
                )}
              >
                {verdict.finalJurySentiment > 0 ? '+' : ''}
                {Math.round(verdict.finalJurySentiment)}
              </span>
            </div>
          </Panel>
        </motion.div>

        {/* ============== 奖励 ============== */}
        {showRewards && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5"
          >
            <Panel variant="highlight" padding="lg">
              <h2 className="font-pixel-title text-sm sm:text-base text-brand-gold mb-5 text-center uppercase tracking-widest">
                <Trophy className="inline w-5 h-5 mr-2" />
                胜诉奖励
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <RewardCard
                  delay={0.1}
                  icon={TrendingUp}
                  value={`+${verdict.rewards.xp}`}
                  label="经验值"
                  color="text-game-green"
                  border="border-game-green"
                />
                <RewardCard
                  delay={0.25}
                  icon={Coins}
                  value={formatMoney(verdict.rewards.money)}
                  label="报酬"
                  color="text-brand-gold"
                  border="border-brand-gold"
                />
              </div>

              {/* 额外奖励 */}
              {verdict.rewards.bonuses.length > 0 && (
                <div className="border-t-2 border-brand-gold/40 pt-4">
                  <p className="font-pixel-title text-xs text-brand-gold mb-2.5 uppercase tracking-wider">
                    ★ 额外奖励
                  </p>
                  <div className="space-y-1.5">
                    {verdict.rewards.bonuses.map((bonus, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-2 px-3 py-2 bg-surface-overlay border-2 border-ink-line"
                      >
                        <Star className="w-4 h-4 text-brand-gold fill-brand-gold shrink-0" />
                        <span className="font-pixel-body text-sm text-ink-primary">
                          {bonus}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {!rewardsApplied && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-5"
                >
                  <Button
                    onClick={handleClaimRewards}
                    size="lg"
                    fullWidth
                    className="animate-pixel-glow"
                  >
                    <Coins className="w-5 h-5" />
                    领取奖励
                  </Button>
                </motion.div>
              )}
              {rewardsApplied && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-4 font-pixel-title text-xs text-game-green uppercase tracking-widest"
                >
                  ✓ 奖励已发放
                </motion.p>
              )}
            </Panel>
          </motion.div>
        )}

        {/* ============== 复盘 ============== */}
        {showRewards && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <Panel variant="dark" padding="lg">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-pixel-title text-sm sm:text-base text-brand-gold uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  复盘报告
                </h2>
                <div className="flex flex-col items-end">
                  <span className="font-pixel-title text-[10px] text-ink-tertiary uppercase tracking-wider">
                    评级
                  </span>
                  <span
                    className={cn(
                      'font-pixel-title text-4xl leading-none',
                      ratingColor
                    )}
                    style={{
                      textShadow:
                        '3px 3px 0 rgba(14,8,32,0.95), 0 0 16px currentColor',
                    }}
                  >
                    {verdict.review.overallRating}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ReviewSection
                  icon={CheckCircle}
                  title="精彩操作"
                  color="text-game-green"
                  items={verdict.review.keyMoments}
                  emptyText="无特别亮眼的表现"
                />
                <ReviewSection
                  icon={XOctagon}
                  title="失误"
                  color="text-game-red"
                  items={verdict.review.mistakes}
                  emptyText="表现完美"
                />
                <ReviewSection
                  icon={Lightbulb}
                  title="改进建议"
                  color="text-game-yellow"
                  items={verdict.review.improvements}
                  emptyText="继续保持！"
                />
              </div>
            </Panel>
          </motion.div>
        )}

        {/* ============== 继续按钮 ============== */}
        {rewardsApplied && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center pb-4"
          >
            <Button
              onClick={handleContinue}
              size="lg"
              className="min-w-[200px]"
            >
              继续
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function RewardCard({
  delay,
  icon: Icon,
  value,
  label,
  color,
  border,
}: {
  delay: number;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  color: string;
  border: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay,
        type: 'spring',
        damping: 12,
        stiffness: 200,
      }}
      className={cn(
        'flex flex-col items-center justify-center p-5',
        'bg-surface-overlay border-[3px] shadow-pixel',
        border
      )}
    >
      <Icon className={cn('w-8 h-8 mb-2', color)} />
      <p className={cn('font-pixel-title text-2xl sm:text-3xl tabular-nums', color)}>
        {value}
      </p>
      <p className="font-pixel-body text-xs text-ink-tertiary mt-1 uppercase tracking-wider">
        {label}
      </p>
    </motion.div>
  );
}

function ReviewSection({
  icon: Icon,
  title,
  color,
  items,
  emptyText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  color: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <Panel variant="overlay" padding="sm">
      <h3
        className={cn(
          'flex items-center gap-1.5 font-pixel-title text-[10px] uppercase tracking-wider mb-2.5',
          color
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        {title}
      </h3>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 font-pixel-body text-sm text-ink-primary leading-relaxed"
            >
              <span className={color}>•</span>
              <span className="flex-1 min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-pixel-body text-sm text-ink-tertiary italic">
          {emptyText}
        </p>
      )}
    </Panel>
  );
}
