/**
 * 调查阶段界面
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Coins, Lock, Unlock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Panel, Modal } from '@/components/ui';
import { StatusBar, LoadingScreen, EvidencePanel } from '@/components/game';
import { useGameStore } from '@/store/gameStore';
import { generateCluesForCase } from '@/services/ai/caseGenerator';
import { formatMoney, cn } from '@/lib/utils';
import { getClueLevelName, getClueLevelShortName } from '@/constants/game';
import type { PurchasableClue } from '@/types';

export function InvestigationScreen() {
  const {
    currentCase,
    player,
    investigation,
    initInvestigation,
    purchaseClue,
    initCourtroom,
    setPhase,
    isLoading,
    setLoading,
  } = useGameStore();

  const [selectedClue, setSelectedClue] = useState<PurchasableClue | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // 初始化调查阶段
  useEffect(() => {
    if (currentCase && !investigation) {
      loadClues();
    }
  }, [currentCase, investigation]);

  const loadClues = async () => {
    if (!currentCase) return;
    
    setLoading(true, '正在调查线索...');
    try {
      const clues = await generateCluesForCase(currentCase);
      initInvestigation(clues);
    } catch (error) {
      console.error('加载线索失败:', error);
      // 使用默认线索
      initInvestigation([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClueClick = (clue: PurchasableClue) => {
    setSelectedClue(clue);
    if (!clue.purchased) {
      setShowPurchaseModal(true);
    }
  };

  const handlePurchase = () => {
    if (selectedClue) {
      const success = purchaseClue(selectedClue.id);
      if (success) {
        setShowPurchaseModal(false);
      }
    }
  };

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

  if (isLoading) {
    return <LoadingScreen message="正在调查线索..." />;
  }

  const cluesByLevel = {
    basic: investigation?.availableClues.filter(c => c.level === 'basic') || [],
    advanced: investigation?.availableClues.filter(c => c.level === 'advanced') || [],
    premium: investigation?.availableClues.filter(c => c.level === 'premium') || [],
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-court-primary">
      <StatusBar />
      
      <div className="pt-14 sm:pt-16 pb-6 sm:pb-8 px-3 sm:px-4 max-w-6xl mx-auto safe-area-inset">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <h1 className="font-pixel-title text-lg sm:text-2xl text-pixel-gold mb-1 sm:mb-2">
            <Search className="inline w-6 h-6 sm:w-8 sm:h-8 mr-1 sm:mr-2" />
            调查阶段
          </h1>
          <p className="font-pixel-body text-xs sm:text-sm text-pixel-gray">
            购买线索了解案件更多信息
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 左侧：案件信息 */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            <Panel variant="default">
              <h2 className="font-pixel-title text-xs sm:text-sm text-pixel-gold mb-2 sm:mb-3">
                {currentCase.title}
              </h2>
              <p className="font-pixel-body text-xs sm:text-sm text-pixel-light mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                {currentCase.summary}
              </p>
              <div className="border-t border-pixel-gray/30 pt-2 sm:pt-3">
                <p className="text-[10px] sm:text-xs text-pixel-gray mb-0.5 sm:mb-1">被告</p>
                <p className="text-xs sm:text-sm text-pixel-light">{currentCase.defendant.name}</p>
              </div>
            </Panel>

            {/* 已有证据 */}
            <EvidencePanel evidence={currentCase.evidence} />

            {/* 已购买线索 */}
            {investigation && investigation.purchasedClues.length > 0 && (
              <Panel variant="dark">
                <h3 className="font-pixel-title text-[10px] sm:text-xs text-pixel-gold mb-2 sm:mb-3">
                  已购买线索 ({investigation.purchasedClues.length})
                </h3>
                <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto touch-scroll">
                  {investigation.purchasedClues.map(clue => (
                    <div
                      key={clue.id}
                      className="p-1.5 sm:p-2 bg-pixel-black border border-pixel-green text-xs sm:text-sm cursor-pointer active:bg-pixel-dark"
                      onClick={() => setSelectedClue(clue)}
                    >
                      <p className="text-pixel-green text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                        {getClueLevelName(clue.level)}
                      </p>
                      <p className="text-pixel-light line-clamp-2">{clue.content}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>

          {/* 中间和右侧：可购买线索 */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* 基础线索 */}
            <ClueSection
              title="基础线索"
              price={50}
              clues={cluesByLevel.basic}
              onClueClick={handleClueClick}
              playerMoney={player.money}
            />

            {/* 进阶线索 */}
            <ClueSection
              title="进阶线索"
              price={150}
              clues={cluesByLevel.advanced}
              onClueClick={handleClueClick}
              playerMoney={player.money}
            />

            {/* 高级线索 */}
            <ClueSection
              title="高级线索"
              price={300}
              clues={cluesByLevel.premium}
              onClueClick={handleClueClick}
              playerMoney={player.money}
            />

            {/* 提示信息 - 移动端简化 */}
            <Panel variant="dark" className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="text-yellow-400 font-pixel-title text-[10px] sm:text-xs mb-0.5 sm:mb-1">提示</p>
                <p className="text-pixel-light">
                  <span className="hidden sm:inline">线索可以帮助你在庭审中找到证人证词的漏洞。高级线索通常直接指向关键矛盾点。</span>
                  <span className="sm:hidden">线索帮助发现证词漏洞。</span>
                  不购买线索也可通过仔细询问发现真相。
                </p>
              </div>
            </Panel>

            {/* 进入庭审按钮 */}
            <div className="flex justify-center sm:justify-end">
              <Button
                onClick={handleProceedToCourtroom}
                size="lg"
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                进入庭审
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 购买确认弹窗 */}
      <Modal
        isOpen={showPurchaseModal && !!selectedClue}
        onClose={() => setShowPurchaseModal(false)}
        title="购买线索"
      >
        {selectedClue && !selectedClue.purchased && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={cn(
                'font-pixel-title text-xs px-2 py-1 border-2',
                selectedClue.level === 'basic' && 'text-pixel-green border-pixel-green',
                selectedClue.level === 'advanced' && 'text-yellow-400 border-yellow-400',
                selectedClue.level === 'premium' && 'text-purple-400 border-purple-400',
              )}>
                {getClueLevelShortName(selectedClue.level)}
              </span>
              <span className="font-pixel-title text-yellow-400">
                {formatMoney(selectedClue.price)}
              </span>
            </div>

            <p className="text-pixel-light">{selectedClue.preview}</p>

            <div className="flex items-center justify-between pt-4 border-t border-pixel-gray/30">
              <span className="text-sm text-pixel-gray">
                当前余额: {formatMoney(player.money)}
              </span>
              {player.money >= selectedClue.price ? (
                <Button onClick={handlePurchase}>
                  确认购买
                </Button>
              ) : (
                <span className="text-pixel-red text-sm">余额不足</span>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 线索内容弹窗 */}
      <Modal
        isOpen={!!selectedClue && selectedClue.purchased && !showPurchaseModal}
        onClose={() => setSelectedClue(null)}
        title="线索内容"
      >
        {selectedClue && selectedClue.purchased && (
          <div className="space-y-4">
            <p className="text-pixel-light">{selectedClue.content}</p>
            {selectedClue.relatedLockId && (
              <p className="text-xs text-pixel-gray">
                此线索与案件的某个关键矛盾点有关
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// 线索分组组件
interface ClueSectionProps {
  title: string;
  price: number;
  clues: PurchasableClue[];
  onClueClick: (clue: PurchasableClue) => void;
  playerMoney: number;
}

function ClueSection({ title, price, clues, onClueClick, playerMoney }: ClueSectionProps) {
  if (clues.length === 0) return null;

  return (
    <Panel variant="dark">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className="font-pixel-title text-xs sm:text-sm text-pixel-gold">{title}</h3>
        <span className="font-pixel-body text-yellow-400 text-xs sm:text-sm">
          <Coins className="inline w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
          {formatMoney(price)}/条
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {clues.map((clue, index) => (
          <motion.button
            key={clue.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onClueClick(clue)}
            className={cn(
              'p-2 sm:p-3 text-left border sm:border-2 transition-all active:scale-[0.98] min-h-[44px]',
              clue.purchased
                ? 'bg-pixel-dark border-pixel-green'
                : playerMoney >= price
                  ? 'bg-pixel-dark border-pixel-gray active:border-pixel-gold'
                  : 'bg-pixel-dark border-pixel-gray opacity-50',
            )}
          >
            <div className="flex items-start gap-1.5 sm:gap-2">
              {clue.purchased ? (
                <Unlock className="w-3 h-3 sm:w-4 sm:h-4 text-pixel-green flex-shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-pixel-gray flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-pixel-body text-xs sm:text-sm text-pixel-light line-clamp-2 sm:line-clamp-none">
                  {clue.purchased ? clue.content : clue.preview}
                </p>
                {!clue.purchased && playerMoney < price && (
                  <p className="text-[10px] sm:text-xs text-pixel-red mt-0.5 sm:mt-1">余额不足</p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </Panel>
  );
}
