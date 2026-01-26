/**
 * 移动端庭审界面优化版
 * 专注于清晰的布局和易读性
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, HelpCircle, X, Gavel } from 'lucide-react';
import { Button } from '@/components/ui';
import { useGameStore } from '@/store/gameStore';
import { 
  processPlayerStatement,
  createCourtroomMessage,
  getPartnerHint,
} from '@/services/ai/courtSimulator';
import { cn } from '@/lib/utils';
import type { CourtroomMessage, Witness, Case, CourtroomState, PlayerStats } from '@/types';

interface MobileCourtroomViewProps {
  currentCase: Case;
  courtroom: CourtroomState;
  player: PlayerStats;
  currentWitness?: Witness;
}

export function MobileCourtroomView({ 
  currentCase, 
  courtroom, 
  player,
  currentWitness 
}: MobileCourtroomViewProps) {
  const {
    addMessage,
    updateWitnessEmotion,
    setCurrentWitness,
    updateJurySentiment,
    updateJudgePatience,
    breakLogicalLock,
    useHint,
  } = useGameStore();

  const [playerInput, setPlayerInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWitnessSelect, setShowWitnessSelect] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [showHintModal, setShowHintModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [courtroom.messages]);

  // 处理玩家发言
  const handleSubmit = async () => {
    if (!playerInput.trim() || isProcessing) return;

    const input = playerInput.trim();
    setPlayerInput('');
    setIsProcessing(true);

    addMessage(createCourtroomMessage('player', player.name, input));

    try {
      const response = await processPlayerStatement(
        currentCase,
        courtroom.currentWitnessId,
        courtroom.messages,
        input,
        courtroom.judge.patience
      );

      const speakerName = response.speaker === 'witness' 
        ? currentWitness?.name || '证人'
        : response.speaker === 'prosecutor'
          ? currentCase.prosecutor.name
          : courtroom.judge.name;

      addMessage(createCourtroomMessage(
        response.speaker,
        speakerName,
        response.response,
        {
          emotion: response.emotionChange,
          juryImpact: response.juryImpact,
          isKeyMoment: !!response.lockBroken || response.witnessBroken,
        }
      ));

      updateJurySentiment(response.juryImpact);
      updateJudgePatience(response.judgePatience);

      if (response.emotionChange && courtroom.currentWitnessId) {
        updateWitnessEmotion(courtroom.currentWitnessId, response.emotionChange);
      }

      if (response.lockBroken) {
        breakLogicalLock(response.lockBroken);
        addMessage(createCourtroomMessage(
          'system',
          '系统',
          '🔓 发现了关键矛盾！',
          { isKeyMoment: true, juryImpact: 5 }
        ));
      }

      if (response.witnessBroken) {
        addMessage(createCourtroomMessage(
          'system',
          '系统',
          '💥 证人崩溃了！',
          { isKeyMoment: true, juryImpact: 10 }
        ));
      }

      if (response.systemHint) {
        addMessage(createCourtroomMessage('system', '提示', response.systemHint));
      }
    } catch (error) {
      console.error('处理发言失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      addMessage(createCourtroomMessage('system', '系统', `❌ 错误: ${errorMessage}`));
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  // 传唤证人
  const handleCallWitness = (witness: Witness) => {
    setCurrentWitness(witness.id);
    setShowWitnessSelect(false);
    
    addMessage(createCourtroomMessage('player', player.name, `传唤证人 ${witness.name}。`));
    addMessage(createCourtroomMessage('witness', witness.name, witness.initialTestimony, { emotion: witness.currentEmotion }));
  };

  // 请求提示
  const handleRequestHint = async () => {
    if (!useHint()) {
      addMessage(createCourtroomMessage('system', '系统', '💰 余额不足'));
      return;
    }

    setIsProcessing(true);
    try {
      const hint = await getPartnerHint(
        currentCase,
        courtroom.messages,
        currentCase.logicalLocks.filter((l: any) => !l.isBroken).map((l: any) => l.id)
      );
      setCurrentHint(hint);
      setShowHintModal(true);
    } catch (error) {
      console.error('获取提示失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-court-primary">
      {/* 顶部状态栏 - 简化版 */}
      <div className="bg-white border-b-2 border-court-accent/20 px-3 py-2 safe-area-top">
        <div className="flex items-center justify-between">
          {/* 法官耐心 */}
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-court-accent" />
            <div className="flex-1">
              <div className="text-[10px] text-pixel-gray mb-0.5">法官耐心</div>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all rounded-full',
                    courtroom.judge.patience > 60 ? 'bg-pixel-green' :
                    courtroom.judge.patience > 30 ? 'bg-yellow-400' : 'bg-pixel-red'
                  )}
                  style={{ width: `${courtroom.judge.patience}%` }}
                />
              </div>
            </div>
          </div>

          {/* 当前证人 */}
          {currentWitness && (
            <div className="text-right">
              <div className="text-[10px] text-pixel-gray">当前证人</div>
              <div className="text-xs font-medium text-pixel-dark">{currentWitness.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {courtroom.messages.map((msg: CourtroomMessage) => (
          <MessageBubbleMobile key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区域 */}
      <div className="bg-white border-t-2 border-court-accent/20 safe-area-bottom">
        {/* 快捷操作按钮 */}
        <div className="px-3 py-2 flex gap-2 border-b border-pixel-gray/10">
          <button
            onClick={() => setShowWitnessSelect(true)}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-court-accent text-white rounded-lg text-xs font-medium active:bg-court-accent/80 disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            传唤证人
          </button>
          <button
            onClick={handleRequestHint}
            disabled={isProcessing}
            className="flex items-center justify-center gap-1 py-2 px-3 bg-court-highlight text-white rounded-lg text-xs font-medium active:bg-court-highlight/80 disabled:opacity-50"
          >
            <HelpCircle className="w-4 h-4" />
            提示
          </button>
        </div>

        {/* 输入框 */}
        <div className="px-3 py-3 flex gap-2">
          <textarea
            ref={inputRef}
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder="输入你的提问或陈述..."
            className="flex-1 px-4 py-3 bg-gray-50 text-pixel-dark placeholder-pixel-gray/50 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-court-accent focus:ring-2 focus:ring-court-accent/20 transition-colors"
            style={{ fontSize: '16px', minHeight: '48px', maxHeight: '120px' }}
            rows={1}
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!playerInput.trim() || isProcessing}
            className="p-3 bg-court-accent text-white rounded-xl active:bg-court-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 证人选择弹窗 */}
      <AnimatePresence>
        {showWitnessSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowWitnessSelect(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-white rounded-t-2xl p-4 pb-safe max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-pixel-dark">选择证人</h3>
                <button
                  onClick={() => setShowWitnessSelect(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {currentCase.witnesses.map((witness: Witness) => (
                  <button
                    key={witness.id}
                    onClick={() => handleCallWitness(witness)}
                    className={cn(
                      'w-full p-4 text-left rounded-xl border-2 transition-all',
                      witness.id === courtroom.currentWitnessId
                        ? 'border-court-accent bg-court-accent/5'
                        : 'border-gray-200 bg-white active:bg-gray-50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-pixel-dark">{witness.name}</p>
                        <p className="text-sm text-pixel-gray mt-0.5">{witness.role}</p>
                      </div>
                      {witness.hasBroken && (
                        <span className="text-xs text-pixel-red bg-pixel-red/10 px-2 py-1 rounded">已崩溃</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示弹窗 */}
      <AnimatePresence>
        {showHintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-pixel-dark mb-3">💡 合伙人提示</h3>
              <p className="text-pixel-dark leading-relaxed mb-4">{currentHint}</p>
              <Button onClick={() => setShowHintModal(false)} className="w-full">
                知道了
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 移动端消息气泡
function MessageBubbleMobile({ message }: { message: CourtroomMessage }) {
  const isPlayer = message.speaker === 'player';
  const isSystem = message.speaker === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-100 text-pixel-gray text-xs px-4 py-2 rounded-full max-w-[80%] text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex', isPlayer ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
          isPlayer
            ? 'bg-court-accent text-white rounded-br-sm'
            : 'bg-white text-pixel-dark rounded-bl-sm border-2 border-gray-100'
        )}
      >
        <div className={cn(
          'text-[10px] font-medium mb-1',
          isPlayer ? 'text-white/80' : 'text-pixel-gray'
        )}>
          {message.speakerName}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        {message.isKeyMoment && (
          <div className="mt-2 text-xs text-yellow-400">⚡ 关键时刻</div>
        )}
      </div>
    </div>
  );
}
