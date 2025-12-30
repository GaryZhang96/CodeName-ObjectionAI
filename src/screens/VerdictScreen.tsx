/**
 * 判决和复盘界面
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Trophy, 
  XCircle, 
  AlertTriangle,
  Star,
  Coins,
  TrendingUp,
  CheckCircle,
  XOctagon,
  Lightbulb,
  ArrowRight,
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

  useEffect(() => {
    // 延迟显示奖励动画
    const timer = setTimeout(() => {
      setShowRewards(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!verdict || !currentCase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-court-primary">
        <Panel>
          <p className="text-pixel-light mb-4">判决数据丢失</p>
          <Button onClick={() => setPhase('office')}>返回事务所</Button>
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

  const getVerdictDisplay = () => {
    switch (verdict.outcome) {
      case 'not_guilty':
        return {
          icon: Trophy,
          text: '无罪释放',
          subtext: '辩护成功！',
          color: 'text-pixel-green',
          bgColor: 'bg-green-900/30',
          borderColor: 'border-pixel-green',
        };
      case 'guilty':
        return {
          icon: XCircle,
          text: '有罪判决',
          subtext: '辩护失败',
          color: 'text-pixel-red',
          bgColor: 'bg-red-900/30',
          borderColor: 'border-pixel-red',
        };
      case 'mistrial':
        return {
          icon: AlertTriangle,
          text: '流审',
          subtext: '案件作废',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/30',
          borderColor: 'border-yellow-400',
        };
    }
  };

  const verdictDisplay = getVerdictDisplay();
  const VerdictIcon = verdictDisplay.icon;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-court-primary py-4 sm:py-8 px-3 sm:px-4 overflow-y-auto safe-area-inset">
      <div className="max-w-4xl mx-auto">
        {/* 判决结果 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.div
            animate={{ 
              rotate: verdict.outcome === 'not_guilty' ? [0, 10, -10, 0] : 0,
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 1, repeat: verdict.outcome === 'not_guilty' ? 2 : 0 }}
            className="mb-3 sm:mb-4"
          >
            <VerdictIcon className={cn('w-16 h-16 sm:w-24 sm:h-24 mx-auto', verdictDisplay.color)} />
          </motion.div>
          
          <h1 className={cn(
            'font-pixel-title text-2xl sm:text-4xl mb-1 sm:mb-2 glow-text',
            verdictDisplay.color
          )}>
            {verdictDisplay.text}
          </h1>
          <p className="font-pixel-title text-sm sm:text-lg text-pixel-gray">
            {verdictDisplay.subtext}
          </p>
        </motion.div>

        {/* 案件信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Panel variant="default" className="mb-4 sm:mb-6">
            <h2 className="font-pixel-title text-sm sm:text-base text-pixel-gold mb-2 sm:mb-3">
              案件: {currentCase.title}
            </h2>
            <p className="font-pixel-body text-xs sm:text-sm text-pixel-light mb-3 sm:mb-4">
              {verdict.reasoning}
            </p>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="text-pixel-gray">陪审团倾向:</span>
              <span className={cn(
                verdict.finalJurySentiment >= 0 ? 'text-pixel-green' : 'text-pixel-red'
              )}>
                {verdict.finalJurySentiment > 0 ? '+' : ''}{Math.round(verdict.finalJurySentiment)}
              </span>
            </div>
          </Panel>
        </motion.div>

        {/* 奖励面板 */}
        {showRewards && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Panel variant="highlight" className="mb-4 sm:mb-6">
              <h2 className="font-pixel-title text-sm sm:text-base text-pixel-gold mb-3 sm:mb-4 text-center">
                <Trophy className="inline w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
                奖励
              </h2>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* XP */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-pixel-green mb-1 sm:mb-2" />
                  <p className="font-pixel-title text-xl sm:text-2xl text-pixel-green">
                    +{verdict.rewards.xp}
                  </p>
                  <p className="font-pixel-body text-[10px] sm:text-sm text-pixel-gray">经验值</p>
                </motion.div>

                {/* 金钱 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <Coins className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-yellow-400 mb-1 sm:mb-2" />
                  <p className="font-pixel-title text-xl sm:text-2xl text-yellow-400">
                    {formatMoney(verdict.rewards.money)}
                  </p>
                  <p className="font-pixel-body text-[10px] sm:text-sm text-pixel-gray">报酬</p>
                </motion.div>
              </div>

              {/* 额外奖励 */}
              {verdict.rewards.bonuses.length > 0 && (
                <div className="border-t border-pixel-gold/30 pt-3 sm:pt-4">
                  <p className="font-pixel-title text-[10px] sm:text-xs text-pixel-gold mb-2">额外奖励</p>
                  <div className="space-y-1">
                    {verdict.rewards.bonuses.map((bonus, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                        <span className="text-xs sm:text-sm text-pixel-light">{bonus}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 领取按钮 */}
              {!rewardsApplied && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4 sm:mt-6 text-center"
                >
                  <Button onClick={handleClaimRewards} size="lg" className="w-full sm:w-auto">
                    领取奖励
                  </Button>
                </motion.div>
              )}
            </Panel>
          </motion.div>
        )}

        {/* 复盘分析 */}
        {showRewards && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Panel variant="dark" className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="font-pixel-title text-sm sm:text-base text-pixel-gold">
                  <Scale className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  复盘
                </h2>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="font-pixel-title text-[10px] sm:text-xs text-pixel-gray">评级:</span>
                  <span className={cn(
                    'font-pixel-title text-2xl sm:text-3xl',
                    getRatingColor(verdict.review.overallRating)
                  )}>
                    {verdict.review.overallRating}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {/* 精彩操作 */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-pixel-title text-[10px] sm:text-xs text-pixel-green flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    精彩操作
                  </h3>
                  {verdict.review.keyMoments.length > 0 ? (
                    <ul className="space-y-0.5 sm:space-y-1">
                      {verdict.review.keyMoments.map((moment, i) => (
                        <li key={i} className="text-[10px] sm:text-sm text-pixel-light flex items-start gap-1 sm:gap-2">
                          <span className="text-pixel-green">•</span>
                          <span className="line-clamp-2">{moment}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10px] sm:text-sm text-pixel-gray">无特别亮眼的表现</p>
                  )}
                </div>

                {/* 失误 */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-pixel-title text-[10px] sm:text-xs text-pixel-red flex items-center gap-1">
                    <XOctagon className="w-3 h-3 sm:w-4 sm:h-4" />
                    失误
                  </h3>
                  {verdict.review.mistakes.length > 0 ? (
                    <ul className="space-y-0.5 sm:space-y-1">
                      {verdict.review.mistakes.map((mistake, i) => (
                        <li key={i} className="text-[10px] sm:text-sm text-pixel-light flex items-start gap-1 sm:gap-2">
                          <span className="text-pixel-red">•</span>
                          <span className="line-clamp-2">{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10px] sm:text-sm text-pixel-gray">表现完美</p>
                  )}
                </div>

                {/* 改进建议 */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-pixel-title text-[10px] sm:text-xs text-yellow-400 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                    建议
                  </h3>
                  {verdict.review.improvements.length > 0 ? (
                    <ul className="space-y-0.5 sm:space-y-1">
                      {verdict.review.improvements.map((improvement, i) => (
                        <li key={i} className="text-[10px] sm:text-sm text-pixel-light flex items-start gap-1 sm:gap-2">
                          <span className="text-yellow-400">•</span>
                          <span className="line-clamp-2">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10px] sm:text-sm text-pixel-gray">继续保持！</p>
                  )}
                </div>
              </div>
            </Panel>
          </motion.div>
        )}

        {/* 继续按钮 */}
        {rewardsApplied && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center pb-4"
          >
            <Button onClick={handleContinue} size="lg" className="flex items-center gap-2 mx-auto w-full sm:w-auto">
              继续
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
