/**
 * 庭审阶段界面 - 核心玩法
 */

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Send,
  User,
  Users,
  Gavel,
} from 'lucide-react';
import { Button, Panel, TextArea, Modal } from '@/components/ui';
import { StatusBar, JuryPanel } from '@/components/game';
import { MobileCourtroomView } from '@/components/game/MobileCourtroomView';
import { useGameStore } from '@/store/gameStore';
import { 
  processPlayerStatement, 
  generateProsecutorStatement,
  generateJudgeStatement,
  generateVerdict,
  createCourtroomMessage,
  getPartnerHint,
} from '@/services/ai/courtSimulator';
import { cn } from '@/lib/utils';
import { getEmotionDisplay, getProsecutorStyleName, GAME_CONSTANTS } from '@/constants/game';
import type { CourtroomMessage, Witness } from '@/types';

export function CourtroomScreen() {
  const {
    currentCase,
    courtroom,
    player,
    addMessage,
    updateWitnessEmotion,
    setCurrentWitness,
    updateJurySentiment,
    updateJudgePatience,
    breakLogicalLock,
    useHint,
    setCourtroomPhase,
    setVerdict,
    setPhase,
  } = useGameStore();

  const [playerInput, setPlayerInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWitnessSelect, setShowWitnessSelect] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [showObjectionEffect, setShowObjectionEffect] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // 移动端工具面板状态已移至 MobileCourtroomView

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [courtroom?.messages]);

  // 使用 useMemo 缓存计算结果
  const { currentWitness, unbrokenLocks, brokenLocks } = useMemo(() => {
    if (!currentCase || !courtroom) {
      return { currentWitness: undefined, unbrokenLocks: [], brokenLocks: [] };
    }
    return {
      currentWitness: currentCase.witnesses.find(w => w.id === courtroom.currentWitnessId),
      unbrokenLocks: currentCase.logicalLocks.filter(l => !l.isBroken),
      brokenLocks: currentCase.logicalLocks.filter(l => l.isBroken),
    };
  }, [currentCase, courtroom?.currentWitnessId]);

  // 开庭流程 - 使用 useCallback 确保稳定引用
  const startTrial = useCallback(async () => {
    if (!currentCase || !courtroom) return;
    // 法官开庭
    const judgeOpening = await generateJudgeStatement('opening');
    addMessage(createCourtroomMessage(
      'judge',
      courtroom.judge.name,
      judgeOpening,
      { isKeyMoment: true }
    ));

    // 检察官开庭陈述
    timerRef.current = setTimeout(async () => {
      if (!currentCase) return;
      const { response, juryImpact } = await generateProsecutorStatement(
        currentCase,
        courtroom.messages,
        'opening'
      );
      addMessage(createCourtroomMessage(
        'prosecutor',
        currentCase.prosecutor.name,
        response,
        { juryImpact }
      ));
      updateJurySentiment(juryImpact);

      // 系统提示
      addMessage(createCourtroomMessage(
        'system',
        '系统',
        '现在轮到辩护律师(你)进行询问。你可以传唤证人并提出问题。',
      ));
    }, 2000);
  }, [currentCase, courtroom, addMessage, updateJurySentiment]);

  // 开庭
  useEffect(() => {
    if (courtroom && courtroom.messages.length === 0) {
      startTrial();
    }
  }, [courtroom?.messages.length, startTrial]);

  if (!currentCase || !courtroom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-court-primary">
        <Panel>
          <p className="text-pixel-light mb-4">案件数据丢失</p>
          <Button onClick={() => setPhase('office')}>返回事务所</Button>
        </Panel>
      </div>
    );
  }

  // 处理玩家发言
  const handleSubmit = async () => {
    if (!playerInput.trim() || isProcessing) return;

    const input = playerInput.trim();
    setPlayerInput('');
    setIsProcessing(true);

    // 添加玩家消息
    addMessage(createCourtroomMessage(
      'player',
      player.name,
      input,
    ));

    try {
      // 调用 AI 处理
      const response = await processPlayerStatement(
        currentCase,
        courtroom.currentWitnessId,
        courtroom.messages,
        input,
        courtroom.judge.patience
      );

      // 处理回应
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

      // 更新状态
      updateJurySentiment(response.juryImpact);
      updateJudgePatience(response.judgePatience);

      // 处理情绪变化
      if (response.emotionChange && courtroom.currentWitnessId) {
        updateWitnessEmotion(courtroom.currentWitnessId, response.emotionChange);
      }

      // 处理逻辑锁破解
      if (response.lockBroken) {
        breakLogicalLock(response.lockBroken);
        addMessage(createCourtroomMessage(
          'system',
          '系统',
          '🔓 你发现了一个关键矛盾！',
          { isKeyMoment: true, juryImpact: 5 }
        ));
      }

      // 处理证人崩溃
      if (response.witnessBroken) {
        setShowObjectionEffect(true);
        setTimeout(() => setShowObjectionEffect(false), 1000);
        
        addMessage(createCourtroomMessage(
          'system',
          '系统',
          '💥 证人崩溃了！真相开始浮出水面...',
          { isKeyMoment: true, juryImpact: 10 }
        ));
      }

      // 系统提示
      if (response.systemHint) {
        addMessage(createCourtroomMessage(
          'system',
          '系统',
          response.systemHint,
        ));
      }

      // 检查是否应该提示结案
      if (brokenLocks.length >= currentCase.logicalLocks.length / 2) {
        addMessage(createCourtroomMessage(
          'system',
          '提示',
          '你已经揭露了多个矛盾，可以考虑申请结案陈词了。',
        ));
      }

    } catch (error) {
      console.error('处理发言失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      addMessage(createCourtroomMessage(
        'system',
        '系统',
        `处理发言时出错: ${errorMessage}`,
      ));
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  // 传唤证人
  const handleCallWitness = (witness: Witness) => {
    setCurrentWitness(witness.id);
    setShowWitnessSelect(false);
    
    addMessage(createCourtroomMessage(
      'player',
      player.name,
      `我方传唤证人 ${witness.name} 出庭作证。`,
    ));

    addMessage(createCourtroomMessage(
      'witness',
      witness.name,
      witness.initialTestimony,
      { emotion: witness.currentEmotion }
    ));
  };

  // 请求提示
  const handleRequestHint = async () => {
    if (!useHint()) {
      addMessage(createCourtroomMessage(
        'system',
        '系统',
        '余额不足，无法购买提示。',
      ));
      return;
    }

    setIsProcessing(true);
    try {
      const hint = await getPartnerHint(
        currentCase,
        courtroom.messages,
        unbrokenLocks.map(l => l.id)
      );
      setCurrentHint(hint);
      setShowHintModal(true);
    } catch (error) {
      console.error('获取提示失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 申请结案
  const handleRequestClosing = async () => {
    setCourtroomPhase('closing');
    
    addMessage(createCourtroomMessage(
      'player',
      player.name,
      '法官大人，辩护方申请进行结案陈词。',
    ));

    // 法官回应
    const judgeResponse = await generateJudgeStatement('closing');
    addMessage(createCourtroomMessage(
      'judge',
      courtroom.judge.name,
      judgeResponse,
    ));

    // 生成判决
    setIsProcessing(true);
    try {
      const verdict = await generateVerdict(
        currentCase,
        courtroom.messages,
        courtroom.averageJurySentiment,
        brokenLocks.map(l => l.id),
        courtroom.judge.patience
      );
      
      timerRef.current = setTimeout(() => {
        setVerdict(verdict);
      }, 2000);
    } catch (error) {
      console.error('生成判决失败:', error);
    }
  };

  // 移动端已使用新组件 MobileCourtroomView

  return (
    <div className={cn(
      "min-h-screen min-h-[100dvh] bg-court-primary",
      showObjectionEffect && "objection-shake"
    )}>
      {/* 移动端使用新的优化布局 */}
      <div className="md:hidden">
        <MobileCourtroomView
          currentCase={currentCase}
          courtroom={courtroom}
          player={player}
          currentWitness={currentWitness}
        />
      </div>

      {/* PC端保持原布局 */}
      <div className="hidden md:block">
        <StatusBar />
      
        {/* 异议效果 */}
        <AnimatePresence>
          {showObjectionEffect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            >
              <div className="font-pixel-title text-4xl sm:text-6xl text-pixel-red glow-text">
                突破！
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PC端网格布局 */}
        <div className="pt-16 pb-4 px-4 h-screen">
        <div className="flex-1 grid grid-cols-12 gap-4 h-[calc(100vh-5rem)]">
          {/* 左侧：玩家信息和工具 */}
          <div className="col-span-3 space-y-3 overflow-y-auto">
            {/* 玩家（辩护律师） */}
            <Panel variant="highlight" className="text-center">
              <User className="w-8 h-8 mx-auto text-pixel-gold mb-2" />
              <p className="font-pixel-title text-xs text-pixel-gold">辩护律师</p>
              <p className="font-pixel-body text-sm text-pixel-light">{player.name}</p>
            </Panel>

            {/* 工具按钮 */}
            <div className="space-y-2">
              <Button
                onClick={() => setShowWitnessSelect(true)}
                variant="ghost"
                className="w-full text-xs"
                disabled={isProcessing}
              >
                <Users className="w-4 h-4 mr-1" />
                传唤证人
              </Button>
              <Button
                onClick={handleRequestHint}
                variant="ghost"
                className="w-full text-xs"
                disabled={isProcessing}
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                求助 (${GAME_CONSTANTS.HINT_COST})
              </Button>
            </div>
          </div>

          {/* 中间：对话区域 */}
          <div className="col-span-6 flex flex-col">
            {/* 法官（上） */}
            <Panel variant="default" className="mb-3 text-center py-2">
              <Gavel className="w-6 h-6 mx-auto text-pixel-gold mb-1" />
              <p className="font-pixel-title text-xs text-pixel-gold">
                {courtroom.judge.name}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xs text-pixel-gray">耐心:</span>
                <div className="w-20 h-2 bg-pixel-dark border border-pixel-gray">
                  <div 
                    className={cn(
                      'h-full transition-all',
                      courtroom.judge.patience > 60 ? 'bg-pixel-green' :
                      courtroom.judge.patience > 30 ? 'bg-yellow-400' : 'bg-pixel-red'
                    )}
                    style={{ width: `${courtroom.judge.patience}%` }}
                  />
                </div>
              </div>
            </Panel>

            {/* 证人（中）*/}
            {currentWitness && (
              <Panel variant="default" className="mb-3 text-center py-2">
                <p className="font-pixel-title text-xs text-pixel-gold">
                  证人: {currentWitness.name}
                </p>
                <p className="text-xs text-pixel-gray">{currentWitness.role}</p>
                <span className={cn(
                  'inline-block mt-1 px-2 py-0.5 border text-xs',
                  getEmotionDisplay(currentWitness.currentEmotion).color
                )}>
                  {getEmotionDisplay(currentWitness.currentEmotion).text}
                </span>
              </Panel>
            )}

            {/* 对话记录 */}
            <Panel variant="dark" className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
                {courtroom.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="border-t border-pixel-gray/30 pt-3">
                <div className="flex gap-2">
                  <TextArea
                    ref={inputRef}
                    value={playerInput}
                    onChange={(e) => setPlayerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="输入你的发言或问题..."
                    className="flex-1 min-h-[60px] max-h-[100px]"
                    disabled={isProcessing}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={!playerInput.trim() || isProcessing}
                      className="px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleRequestClosing}
                      variant="danger"
                      disabled={isProcessing || courtroom.closingRequested}
                      className="px-2 text-xs"
                      title="申请结案"
                    >
                      结案
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* 右侧：检方和陪审团 */}
          <div className="col-span-3 space-y-3 overflow-y-auto">
            {/* 检察官 */}
            <Panel variant="default" className="text-center">
              <User className="w-8 h-8 mx-auto text-pixel-red mb-2" />
              <p className="font-pixel-title text-xs text-pixel-red">检察官</p>
              <p className="font-pixel-body text-sm text-pixel-light">
                {currentCase.prosecutor.name}
              </p>
              <p className="text-xs text-pixel-gray mt-1">
                {getProsecutorStyleName(currentCase.prosecutor.style)}
              </p>
            </Panel>

            {/* 陪审团 */}
            <JuryPanel 
              jury={courtroom.jury}
              averageSentiment={courtroom.averageJurySentiment}
            />

            {/* 案件信息 */}
            <Panel variant="dark">
              <h3 className="font-pixel-title text-xs text-pixel-gold mb-2">
                被告
              </h3>
              <p className="text-sm text-pixel-light">
                {currentCase.defendant.name}
              </p>
              <p className="text-xs text-pixel-gray">
                {currentCase.defendant.occupation}, {currentCase.defendant.age}岁
              </p>
            </Panel>
          </div>
        </div>
      </div>
      </div>

      {/* PC端证人选择弹窗 */}
      <Modal
        isOpen={showWitnessSelect}
        onClose={() => setShowWitnessSelect(false)}
        title="传唤证人"
      >
        <div className="space-y-3">
          {currentCase.witnesses.map(witness => (
            <button
              key={witness.id}
              onClick={() => handleCallWitness(witness)}
              className={cn(
                'w-full p-3 text-left border-2 transition-all',
                'bg-pixel-dark border-pixel-gray hover:border-pixel-gold',
                witness.id === courtroom.currentWitnessId && 'border-pixel-gold bg-court-accent'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-pixel-body text-pixel-light">{witness.name}</p>
                  <p className="text-xs text-pixel-gray">{witness.role}</p>
                </div>
                {witness.hasBroken && (
                  <span className="text-xs text-pixel-red">已崩溃</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* 提示弹窗 */}
      <Modal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        title="合伙人提示"
      >
        <div className="space-y-4">
          <p className="text-pixel-light">{currentHint}</p>
          <p className="text-xs text-pixel-gray">— 来自资深合伙人的建议</p>
        </div>
      </Modal>
    </div>
  );
}

// 消息气泡组件 - 使用 memo 优化渲染
const MessageBubble = memo(function MessageBubble({ message }: { message: CourtroomMessage }) {
  const getSpeakerStyle = () => {
    switch (message.speaker) {
      case 'player':
        return 'bg-court-accent border-pixel-gold ml-4 sm:ml-8';
      case 'witness':
        return 'bg-pixel-dark border-pixel-blue mr-4 sm:mr-8';
      case 'prosecutor':
        return 'bg-red-900/30 border-pixel-red mr-4 sm:mr-8';
      case 'judge':
        return 'bg-yellow-900/30 border-yellow-600 mx-2 sm:mx-8';
      case 'system':
        return 'bg-pixel-dark/50 border-pixel-gray mx-2 sm:mx-12 text-center italic';
      default:
        return 'bg-pixel-dark border-pixel-gray';
    }
  };

  const getSpeakerColor = () => {
    switch (message.speaker) {
      case 'player':
        return 'text-pixel-gold';
      case 'witness':
        return 'text-pixel-blue';
      case 'prosecutor':
        return 'text-pixel-red';
      case 'judge':
        return 'text-yellow-400';
      default:
        return 'text-pixel-gray';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-2 sm:p-3 border-2 rounded',
        getSpeakerStyle(),
        message.isKeyMoment && 'ring-2 ring-yellow-400'
      )}
    >
      {message.speaker !== 'system' && (
        <p className={cn('font-pixel-title text-[10px] sm:text-xs mb-0.5 sm:mb-1', getSpeakerColor())}>
          {message.speakerName}
          {message.emotion && (
            <span className="ml-1 sm:ml-2 text-pixel-gray text-[10px]">
              ({message.emotion})
            </span>
          )}
        </p>
      )}
      <p className="font-pixel-body text-xs sm:text-sm text-pixel-light whitespace-pre-wrap">
        {message.content}
      </p>
      {message.isKeyMoment && (
        <span className="text-[10px] sm:text-xs text-yellow-400 mt-1 block">⚡ 关键</span>
      )}
    </motion.div>
  );
});
