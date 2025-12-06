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
    <div className="min-h-screen bg-court-primary">
      <StatusBar />
      
      <div className="pt-16 pb-8 px-4 max-w-6xl mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-pixel-title text-2xl text-pixel-gold mb-2">
            <Search className="inline w-8 h-8 mr-2" />
            调查阶段
          </h1>
          <p className="font-pixel-body text-pixel-gray">
            购买线索来了解案件的更多信息
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：案件信息 */}
          <div className="lg:col-span-1 space-y-4">
            <Panel variant="default">
              <h2 className="font-pixel-title text-sm text-pixel-gold mb-3">
                {currentCase.title}
              </h2>
              <p className="font-pixel-body text-sm text-pixel-light mb-4">
                {currentCase.summary}
              </p>
              <div className="border-t border-pixel-gray/30 pt-3">
                <p className="text-xs text-pixel-gray mb-1">被告</p>
                <p className="text-sm text-pixel-light">{currentCase.defendant.name}</p>
              </div>
            </Panel>

            {/* 已有证据 */}
            <EvidencePanel evidence={currentCase.evidence} />

            {/* 已购买线索 */}
            {investigation && investigation.purchasedClues.length > 0 && (
              <Panel variant="dark">
                <h3 className="font-pixel-title text-xs text-pixel-gold mb-3">
                  已购买的线索 ({investigation.purchasedClues.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {investigation.purchasedClues.map(clue => (
                    <div
                      key={clue.id}
                      className="p-2 bg-pixel-black border border-pixel-green text-sm cursor-pointer hover:bg-pixel-dark"
                      onClick={() => setSelectedClue(clue)}
                    >
                      <p className="text-pixel-green text-xs mb-1">
                        {clue.level === 'basic' && '基础线索'}
                        {clue.level === 'advanced' && '进阶线索'}
                        {clue.level === 'premium' && '高级线索'}
                      </p>
                      <p className="text-pixel-light">{clue.content}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>

          {/* 中间和右侧：可购买线索 */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* 提示信息 */}
            <Panel variant="dark" className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-400 font-pixel-title text-xs mb-1">提示</p>
                <p className="text-pixel-light">
                  线索可以帮助你在庭审中找到证人证词的漏洞。
                  高级线索通常直接指向关键矛盾点。
                  但即使不购买任何线索，你也可以通过仔细询问来发现真相。
                </p>
              </div>
            </Panel>

            {/* 进入庭审按钮 */}
            <div className="flex justify-end">
              <Button
                onClick={handleProceedToCourtroom}
                size="lg"
                className="flex items-center gap-2"
              >
                进入庭审
                <ArrowRight className="w-5 h-5" />
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
                {selectedClue.level === 'basic' && '基础'}
                {selectedClue.level === 'advanced' && '进阶'}
                {selectedClue.level === 'premium' && '高级'}
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-pixel-title text-sm text-pixel-gold">{title}</h3>
        <span className="font-pixel-body text-yellow-400 text-sm">
          <Coins className="inline w-4 h-4 mr-1" />
          {formatMoney(price)}/条
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {clues.map((clue, index) => (
          <motion.button
            key={clue.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onClueClick(clue)}
            className={cn(
              'p-3 text-left border-2 transition-all',
              clue.purchased
                ? 'bg-pixel-dark border-pixel-green'
                : playerMoney >= price
                  ? 'bg-pixel-dark border-pixel-gray hover:border-pixel-gold'
                  : 'bg-pixel-dark border-pixel-gray opacity-50',
            )}
          >
            <div className="flex items-start gap-2">
              {clue.purchased ? (
                <Unlock className="w-4 h-4 text-pixel-green flex-shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-4 h-4 text-pixel-gray flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-pixel-body text-sm text-pixel-light">
                  {clue.purchased ? clue.content : clue.preview}
                </p>
                {!clue.purchased && playerMoney < price && (
                  <p className="text-xs text-pixel-red mt-1">余额不足</p>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </Panel>
  );
}
