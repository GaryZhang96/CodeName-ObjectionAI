/**
 * 庭审界面 - 像素逆转裁判风（统一 PC + 移动端）
 *
 * 核心设计：
 * 1. 顶部：法官席（耐心条 + 当前阶段）
 * 2. 主区域（PC 左右双栏 / 移动单栏）：
 *    - 角色舞台：左检察官、右辩护律师 + 当前证人（中央）
 *    - 对话流（占主要空间）
 * 3. 底部：输入栏 + 异议/证据/证人/求助快捷按钮
 * 4. 右侧栏（PC 端）：陪审团 + 证据卷宗
 *
 * 关键反馈：
 * - 「异议！」全屏冲击 + 屏幕震动
 * - 飘字反馈陪审团情绪变化
 * - 关键时刻消息有金色边 + 微光
 */

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Send,
  Users,
  Gavel,
  Scale,
  AlertTriangle,
  Flag,
  Shield,
  Sword,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { Button, TextArea, Modal, Panel } from '@/components/ui';
import {
  JuryPanel,
  EvidencePanel,
  ObjectionEffect,
  FloatingTextLayer,
  useFloatingTexts,
} from '@/components/game';
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
import {
  getEmotionDisplay,
  getProsecutorStyleName,
  GAME_CONSTANTS,
} from '@/constants/game';
import type { CourtroomMessage, Witness, Evidence } from '@/types';

type ObjectionKind = 'objection' | 'hold-it' | 'take-that' | 'breakthrough';

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
    useHint: spendHint,
    setCourtroomPhase,
    setVerdict,
    setPhase,
  } = useGameStore();

  const [playerInput, setPlayerInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWitnessSelect, setShowWitnessSelect] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false); // 移动端右侧抽屉
  const [currentHint, setCurrentHint] = useState('');
  const [objectionEffect, setObjectionEffect] = useState<{
    visible: boolean;
    kind: ObjectionKind;
  }>({ visible: false, kind: 'objection' });
  const [shakeScreen, setShakeScreen] = useState(false);
  const { items: floatingItems, push: pushFloating, remove: removeFloating } =
    useFloatingTexts();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const objectionTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (objectionTimerRef.current) clearTimeout(objectionTimerRef.current);
    };
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [courtroom?.messages.length]);

  const { currentWitness, unbrokenLocks, brokenLocks } = useMemo(() => {
    if (!currentCase || !courtroom) {
      return {
        currentWitness: undefined,
        unbrokenLocks: [],
        brokenLocks: [],
      };
    }
    return {
      currentWitness: currentCase.witnesses.find(
        (w) => w.id === courtroom.currentWitnessId
      ),
      unbrokenLocks: currentCase.logicalLocks.filter((l) => !l.isBroken),
      brokenLocks: currentCase.logicalLocks.filter((l) => l.isBroken),
    };
  }, [currentCase, courtroom]);

  // 触发异议效果
  const triggerObjection = useCallback(
    (kind: ObjectionKind) => {
      setObjectionEffect({ visible: true, kind });
      setShakeScreen(true);
      if (objectionTimerRef.current) clearTimeout(objectionTimerRef.current);
      objectionTimerRef.current = setTimeout(() => {
        setObjectionEffect({ visible: false, kind });
        setShakeScreen(false);
      }, 1200);
    },
    []
  );

  // 开庭流程
  const startTrial = useCallback(async () => {
    if (!currentCase || !courtroom) return;

    try {
      const judgeOpening = await generateJudgeStatement('opening');
      addMessage(
        createCourtroomMessage(
          'judge',
          courtroom.judge.name,
          judgeOpening,
          { isKeyMoment: true }
        )
      );

      timerRef.current = setTimeout(async () => {
        if (!currentCase) return;
        try {
          const { response, juryImpact } = await generateProsecutorStatement(
            currentCase,
            courtroom.messages,
            'opening'
          );
          addMessage(
            createCourtroomMessage(
              'prosecutor',
              currentCase.prosecutor.name,
              response,
              { juryImpact }
            )
          );
          updateJurySentiment(juryImpact);

          addMessage(
            createCourtroomMessage(
              'system',
              '系统',
              '现在轮到辩护律师(你)进行询问。你可以传唤证人并提出问题。'
            )
          );
        } catch (e) {
          console.error(e);
          addMessage(
            createCourtroomMessage(
              'system',
              '系统',
              `检察官开庭失败: ${(e as Error).message}`
            )
          );
        }
      }, 1800);
    } catch (e) {
      console.error(e);
      addMessage(
        createCourtroomMessage(
          'system',
          '系统',
          `法官开庭失败: ${(e as Error).message}`
        )
      );
    }
  }, [currentCase, courtroom, addMessage, updateJurySentiment]);

  useEffect(() => {
    if (courtroom && courtroom.messages.length === 0) {
      startTrial();
    }
  }, [courtroom?.messages.length, startTrial]);

  if (!currentCase || !courtroom) {
    return (
      <div className="min-h-dvh flex items-center justify-center pixel-court-bg p-4">
        <Panel variant="default" className="max-w-md text-center">
          <p className="font-pixel-body text-base text-ink-primary mb-4">
            案件数据丢失
          </p>
          <Button onClick={() => setPhase('office')} fullWidth>
            返回事务所
          </Button>
        </Panel>
      </div>
    );
  }

  // 飘字反馈：根据陪审团 impact 弹出
  const pushImpactFeedback = (impact: number) => {
    if (impact === 0) return;
    pushFloating({
      text: impact > 0 ? `+${impact} 陪审团好感` : `${impact} 陪审团好感`,
      kind: impact > 0 ? 'positive' : 'negative',
      x: 50 + (Math.random() - 0.5) * 30,
      y: 40 + (Math.random() - 0.5) * 10,
    });
  };

  // 玩家发言（含 prefix 模式：异议、出示证据）
  const sendPlayerStatement = async (
    input: string,
    options?: { objectionKind?: ObjectionKind; evidenceUsed?: Evidence }
  ) => {
    if (!input.trim() || isProcessing) return;
    setIsProcessing(true);

    if (options?.objectionKind) {
      triggerObjection(options.objectionKind);
    }

    addMessage(createCourtroomMessage('player', player.name, input));

    try {
      const response = await processPlayerStatement(
        currentCase,
        courtroom.currentWitnessId,
        courtroom.messages,
        input,
        courtroom.judge.patience
      );

      const speakerName =
        response.speaker === 'witness'
          ? currentWitness?.name || '证人'
          : response.speaker === 'prosecutor'
            ? currentCase.prosecutor.name
            : courtroom.judge.name;

      addMessage(
        createCourtroomMessage(
          response.speaker,
          speakerName,
          response.response,
          {
            emotion: response.emotionChange,
            juryImpact: response.juryImpact,
            isKeyMoment: !!response.lockBroken || response.witnessBroken,
          }
        )
      );

      updateJurySentiment(response.juryImpact);
      updateJudgePatience(response.judgePatience);
      pushImpactFeedback(response.juryImpact);

      if (response.emotionChange && courtroom.currentWitnessId) {
        updateWitnessEmotion(courtroom.currentWitnessId, response.emotionChange);
      }

      if (response.lockBroken) {
        breakLogicalLock(response.lockBroken);
        triggerObjection('breakthrough');
        addMessage(
          createCourtroomMessage(
            'system',
            '系统',
            '🔓 你发现了一个关键矛盾！',
            { isKeyMoment: true, juryImpact: 5 }
          )
        );
      }

      if (response.witnessBroken) {
        triggerObjection('breakthrough');
        addMessage(
          createCourtroomMessage(
            'system',
            '系统',
            '💥 证人崩溃了！真相开始浮出水面...',
            { isKeyMoment: true, juryImpact: 10 }
          )
        );
      }

      if (response.systemHint) {
        addMessage(
          createCourtroomMessage('system', '系统', response.systemHint)
        );
      }

      if (brokenLocks.length >= currentCase.logicalLocks.length / 2) {
        addMessage(
          createCourtroomMessage(
            'system',
            '提示',
            '你已经揭露了多个矛盾，可以考虑申请结案陈词了。'
          )
        );
      }
    } catch (error) {
      console.error('处理发言失败:', error);
      const errorMessage =
        error instanceof Error ? error.message : '未知错误';
      addMessage(
        createCourtroomMessage(
          'system',
          '系统',
          `❌ 处理发言出错: ${errorMessage}`
        )
      );
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = () => {
    const input = playerInput.trim();
    if (!input) return;
    setPlayerInput('');
    sendPlayerStatement(input);
  };

  const handleObjection = () => {
    const input = playerInput.trim();
    if (!input) {
      pushFloating({
        text: '需要先输入异议内容',
        kind: 'negative',
        x: 50,
        y: 60,
      });
      return;
    }
    setPlayerInput('');
    sendPlayerStatement(`【异议！】${input}`, { objectionKind: 'objection' });
  };

  const handlePresentEvidence = (evidence: Evidence) => {
    setShowEvidenceModal(false);
    sendPlayerStatement(
      `【出示证据：${evidence.name}】${evidence.description}`,
      { objectionKind: 'take-that', evidenceUsed: evidence }
    );
  };

  const handleCallWitness = (witness: Witness) => {
    setCurrentWitness(witness.id);
    setShowWitnessSelect(false);

    addMessage(
      createCourtroomMessage(
        'player',
        player.name,
        `我方传唤证人 ${witness.name} 出庭作证。`
      )
    );

    addMessage(
      createCourtroomMessage('witness', witness.name, witness.initialTestimony, {
        emotion: witness.currentEmotion,
      })
    );
  };

  const handleRequestHint = async () => {
    if (!spendHint()) {
      addMessage(
        createCourtroomMessage('system', '系统', '余额不足，无法购买提示。')
      );
      return;
    }

    setIsProcessing(true);
    try {
      const hint = await getPartnerHint(
        currentCase,
        courtroom.messages,
        unbrokenLocks.map((l) => l.id)
      );
      setCurrentHint(hint);
      setShowHintModal(true);
    } catch (error) {
      console.error('获取提示失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestClosing = async () => {
    setCourtroomPhase('closing');

    addMessage(
      createCourtroomMessage(
        'player',
        player.name,
        '法官大人，辩护方申请进行结案陈词。'
      )
    );

    try {
      const judgeResponse = await generateJudgeStatement('closing');
      addMessage(
        createCourtroomMessage('judge', courtroom.judge.name, judgeResponse)
      );

      setIsProcessing(true);
      const verdict = await generateVerdict(
        currentCase,
        courtroom.messages,
        courtroom.averageJurySentiment,
        brokenLocks.map((l) => l.id),
        courtroom.judge.patience
      );

      timerRef.current = setTimeout(() => setVerdict(verdict), 2000);
    } catch (error) {
      console.error('生成判决失败:', error);
      addMessage(
        createCourtroomMessage(
          'system',
          '系统',
          `生成判决失败: ${(error as Error).message}`
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={cn(
        'min-h-dvh flex flex-col pixel-court-bg relative overflow-hidden',
        shakeScreen && 'shake-screen'
      )}
    >
      {/* 异议效果 */}
      <ObjectionEffect
        isVisible={objectionEffect.visible}
        kind={objectionEffect.kind}
      />

      {/* 飘字层 */}
      <FloatingTextLayer items={floatingItems} onItemExpire={removeFloating} />

      {/* ============== 顶部：法官席 ============== */}
      <JudgeHeader
        judgeName={courtroom.judge.name}
        patience={courtroom.judge.patience}
        phase={courtroom.phase}
        onExit={() => {
          if (window.confirm('确定离开庭审？当前进度将丢失。')) {
            setPhase('office');
          }
        }}
        onTogglePanel={() => setShowSidePanel((s) => !s)}
      />

      {/* ============== 主区域：角色 + 对话 + 侧边栏 ============== */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 max-w-7xl w-full mx-auto px-3 sm:px-4 pt-3 lg:pt-4 gap-3 lg:gap-4 pb-3 lg:pb-4 safe-x">
        {/* 中间：对话流 */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* 角色舞台 */}
          <CharacterStage
            prosecutorName={currentCase.prosecutor.name}
            prosecutorStyle={currentCase.prosecutor.style}
            playerName={player.name}
            currentWitness={currentWitness}
            defendantName={currentCase.defendant.name}
          />

          {/* 对话消息流 */}
          <Panel
            variant="default"
            padding="none"
            className="flex-1 min-h-0 flex flex-col mt-3"
          >
            <div className="flex-1 overflow-y-auto touch-scroll p-3 sm:p-4 space-y-2 sm:space-y-3">
              {courtroom.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isProcessing && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="border-t-[3px] border-ink-line bg-surface-sunken p-3 sm:p-4 space-y-2">
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
                  placeholder={
                    currentWitness
                      ? `向 ${currentWitness.name} 提问...`
                      : '请先传唤一位证人...'
                  }
                  className="flex-1 min-h-[52px] max-h-[120px]"
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!playerInput.trim() || isProcessing}
                  size="md"
                  className="self-stretch px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* 快捷按钮行 */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  onClick={handleObjection}
                  variant="danger"
                  size="sm"
                  disabled={isProcessing || !playerInput.trim()}
                  className="!min-h-[40px]"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  异议
                </Button>
                <Button
                  onClick={() => setShowEvidenceModal(true)}
                  variant="info"
                  size="sm"
                  disabled={isProcessing}
                  className="!min-h-[40px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  出示
                </Button>
                <Button
                  onClick={() => setShowWitnessSelect(true)}
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing}
                  className="!min-h-[40px]"
                >
                  <Users className="w-3.5 h-3.5" />
                  传唤
                </Button>
                <Button
                  onClick={handleRequestHint}
                  variant="ghost"
                  size="sm"
                  disabled={isProcessing}
                  className="!min-h-[40px]"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  提示 ${GAME_CONSTANTS.HINT_COST}
                </Button>
                <Button
                  onClick={handleRequestClosing}
                  variant="success"
                  size="sm"
                  disabled={isProcessing || courtroom.closingRequested}
                  className="!min-h-[40px] ml-auto"
                  title="申请结案陈词"
                >
                  <Flag className="w-3.5 h-3.5" />
                  结案
                </Button>
              </div>
            </div>
          </Panel>
        </div>

        {/* 右侧：陪审团 + 证据卷宗（PC 端常显，移动端抽屉） */}
        <SidePanel
          showOnMobile={showSidePanel}
          onCloseMobile={() => setShowSidePanel(false)}
          jury={courtroom.jury}
          averageSentiment={courtroom.averageJurySentiment}
          evidence={currentCase.evidence}
          brokenLocks={brokenLocks.length}
          totalLocks={currentCase.logicalLocks.length}
        />
      </div>

      {/* ============== 弹窗 ============== */}

      {/* 传唤证人 */}
      <Modal
        isOpen={showWitnessSelect}
        onClose={() => setShowWitnessSelect(false)}
        title="传唤证人"
        icon={<Users className="w-4 h-4" />}
      >
        <div className="space-y-2">
          {currentCase.witnesses.map((witness) => {
            const emotion = getEmotionDisplay(witness.currentEmotion);
            const isActive = witness.id === courtroom.currentWitnessId;
            return (
              <button
                key={witness.id}
                onClick={() => handleCallWitness(witness)}
                className={cn(
                  'w-full p-3 text-left border-[3px] transition-all min-h-[64px]',
                  'shadow-pixel-sm hover:shadow-pixel',
                  'flex items-center gap-3',
                  isActive
                    ? 'bg-brand-gold/15 border-brand-gold'
                    : 'bg-surface-overlay border-ink-line hover:border-brand-gold'
                )}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-surface-sunken border-2 border-ink-line text-2xl shrink-0">
                  {emotion.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-pixel-body text-base text-ink-primary truncate">
                      {witness.name}
                    </p>
                    {isActive && (
                      <span className="pixel-badge-gold">作证中</span>
                    )}
                    {witness.hasBroken && (
                      <span className="pixel-badge-red">崩溃</span>
                    )}
                  </div>
                  <p className="font-pixel-body text-sm text-ink-tertiary mt-0.5">
                    {witness.role} · {witness.age} 岁
                  </p>
                </div>
                <span
                  className={cn('text-xs font-pixel-title', emotion.color)}
                >
                  {emotion.text}
                </span>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* 出示证据 */}
      <Modal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        title="出示证据"
        icon={<FileText className="w-4 h-4" />}
      >
        <p className="font-pixel-body text-sm text-ink-tertiary mb-3">
          选择一份证据出示给法庭：
        </p>
        <div className="space-y-2 max-h-96 overflow-y-auto touch-scroll">
          {currentCase.evidence
            .filter((e) => e.discovered)
            .map((e) => (
              <button
                key={e.id}
                onClick={() => handlePresentEvidence(e)}
                className={cn(
                  'w-full p-3 text-left border-[3px] transition-all',
                  'shadow-pixel-sm hover:shadow-pixel min-h-[60px]',
                  e.isKeyEvidence
                    ? 'bg-brand-gold/10 border-brand-gold'
                    : 'bg-surface-overlay border-ink-line hover:border-brand-gold'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-pixel-body text-base text-ink-primary">
                    {e.name}
                  </p>
                  {e.isKeyEvidence && (
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                  )}
                </div>
                <p className="font-pixel-body text-xs text-ink-tertiary line-clamp-2">
                  {e.description}
                </p>
              </button>
            ))}
        </div>
      </Modal>

      {/* 提示 */}
      <Modal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        title="合伙人的建议"
        icon={<HelpCircle className="w-4 h-4" />}
      >
        <div className="space-y-3">
          <Panel variant="overlay" padding="md">
            <p className="font-pixel-body text-base text-ink-primary leading-relaxed">
              {currentHint}
            </p>
          </Panel>
          <p className="font-pixel-body text-xs text-ink-tertiary text-right">
            — 来自资深合伙人
          </p>
          <Button
            onClick={() => setShowHintModal(false)}
            fullWidth
            size="md"
          >
            收到
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ============== 顶部法官席 ==============
function JudgeHeader({
  judgeName,
  patience,
  phase,
  onExit,
  onTogglePanel,
}: {
  judgeName: string;
  patience: number;
  phase: string;
  onExit: () => void;
  onTogglePanel: () => void;
}) {
  const isPatienceLow = patience < 30;
  const isPatienceHigh = patience > 60;
  const patienceColor = isPatienceHigh
    ? 'bg-game-green'
    : isPatienceLow
      ? 'bg-game-red'
      : 'bg-game-yellow';

  const phaseLabel = {
    opening: '开庭',
    examination: '质询',
    objection: '辩论',
    closing: '结案',
  }[phase] || '庭审';

  return (
    <div className="shrink-0 bg-surface-sunken/95 backdrop-blur-md border-b-[3px] border-brand-gold safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-3">
        <button
          onClick={onExit}
          className="shrink-0 w-9 h-9 flex items-center justify-center border-[3px] border-ink-line bg-surface-overlay hover:border-game-red hover:text-game-red text-ink-secondary transition-colors"
          title="退出庭审"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-brand-gold border-[3px] border-brand-gold-deep flex items-center justify-center shadow-pixel-sm">
          <Gavel
            className={cn(
              'w-4 h-4 sm:w-5 sm:h-5 text-brand-ink',
              isPatienceLow && 'animate-pixel-heartbeat'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <p className="font-pixel-title text-xs sm:text-sm text-brand-gold truncate">
              {judgeName}
            </p>
            <span className="pixel-badge text-[9px]">{phaseLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-pixel-title text-[9px] text-ink-tertiary uppercase tracking-wider hidden sm:inline">
              耐心
            </span>
            <div
              className={cn(
                'pixel-bar-track flex-1 max-w-xs',
                isPatienceLow && 'animate-pixel-heartbeat'
              )}
            >
              <motion.div
                className={cn('pixel-bar-fill', patienceColor)}
                initial={{ width: '100%' }}
                animate={{ width: `${patience}%` }}
              />
            </div>
            <span className="font-pixel-title text-xs tabular-nums text-ink-secondary shrink-0">
              {Math.round(patience)}
            </span>
          </div>
        </div>

        <button
          onClick={onTogglePanel}
          className="shrink-0 w-9 h-9 flex items-center justify-center border-[3px] border-ink-line bg-surface-overlay hover:border-brand-gold text-ink-secondary lg:hidden"
          title="陪审团 / 证据"
        >
          <Users className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============== 角色舞台 ==============
function CharacterStage({
  prosecutorName,
  prosecutorStyle,
  playerName,
  currentWitness,
  defendantName,
}: {
  prosecutorName: string;
  prosecutorStyle: string;
  playerName: string;
  currentWitness?: Witness;
  defendantName: string;
}) {
  const witnessEmotion = currentWitness
    ? getEmotionDisplay(currentWitness.currentEmotion)
    : null;

  return (
    <div className="shrink-0 grid grid-cols-3 gap-2 sm:gap-3">
      {/* 检察官 */}
      <CharacterCard
        side="left"
        icon={<Sword className="w-4 h-4" />}
        title="检察官"
        name={prosecutorName}
        sub={getProsecutorStyleName(prosecutorStyle)}
        color="game-red"
        emoji="👨‍⚖️"
      />

      {/* 证人/被告 */}
      <CharacterCard
        side="center"
        icon={
          witnessEmotion ? (
            <span className="text-base">{witnessEmotion.emoji}</span>
          ) : (
            <span className="text-base">🧑</span>
          )
        }
        title={currentWitness ? '证人' : '被告'}
        name={currentWitness?.name || defendantName}
        sub={currentWitness?.role || '等待传唤'}
        color="game-yellow"
        emoji=""
        meta={
          witnessEmotion ? (
            <span className={cn('font-pixel-title text-[9px]', witnessEmotion.color)}>
              {witnessEmotion.text}
            </span>
          ) : undefined
        }
      />

      {/* 辩护律师 */}
      <CharacterCard
        side="right"
        icon={<Shield className="w-4 h-4" />}
        title="辩护律师"
        name={playerName}
        sub="你"
        color="game-blue"
        emoji="🤵"
      />
    </div>
  );
}

function CharacterCard({
  icon,
  title,
  name,
  sub,
  color,
  emoji,
  meta,
}: {
  side?: 'left' | 'center' | 'right';
  icon: React.ReactNode;
  title: string;
  name: string;
  sub: string;
  color: 'game-red' | 'game-blue' | 'game-yellow';
  emoji: string;
  meta?: React.ReactNode;
}) {
  const colorClasses = {
    'game-red': 'border-game-red',
    'game-blue': 'border-game-blue',
    'game-yellow': 'border-game-yellow',
  };
  const textColorClasses = {
    'game-red': 'text-game-red',
    'game-blue': 'text-game-blue',
    'game-yellow': 'text-game-yellow',
  };
  return (
    <div
      className={cn(
        'p-2 sm:p-2.5 bg-surface-raised border-[3px] shadow-pixel-sm flex flex-col items-center text-center min-h-[80px] sm:min-h-[92px]',
        colorClasses[color]
      )}
    >
      <div className="flex items-center gap-1 mb-1">
        {emoji && <span className="text-lg sm:text-xl">{emoji}</span>}
        {icon && <span className={textColorClasses[color]}>{icon}</span>}
      </div>
      <p
        className={cn(
          'font-pixel-title text-[9px] uppercase tracking-wider',
          textColorClasses[color]
        )}
      >
        {title}
      </p>
      <p className="font-pixel-body text-xs sm:text-sm text-ink-primary mt-0.5 truncate max-w-full">
        {name}
      </p>
      <p className="font-pixel-body text-[10px] sm:text-xs text-ink-tertiary truncate max-w-full">
        {sub}
      </p>
      {meta && <div className="mt-1">{meta}</div>}
    </div>
  );
}

// ============== 侧边栏 ==============
function SidePanel({
  showOnMobile,
  onCloseMobile,
  jury,
  averageSentiment,
  evidence,
  brokenLocks,
  totalLocks,
}: {
  showOnMobile: boolean;
  onCloseMobile: () => void;
  jury: import('@/types').JuryMember[];
  averageSentiment: number;
  evidence: Evidence[];
  brokenLocks: number;
  totalLocks: number;
}) {
  return (
    <>
      {/* PC 端常显 */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 space-y-3 overflow-y-auto touch-scroll">
        <JuryPanel jury={jury} averageSentiment={averageSentiment} />
        <EvidencePanel evidence={evidence} defaultExpanded />
        <ProgressPanel broken={brokenLocks} total={totalLocks} />
      </aside>

      {/* 移动端抽屉 */}
      <AnimatePresence>
        {showOnMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="lg:hidden fixed inset-0 z-40 bg-surface-base/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-0 right-0 bottom-0 w-[88vw] max-w-sm bg-surface-base border-l-[3px] border-brand-gold flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b-[3px] border-ink-line bg-surface-overlay">
                <h3 className="font-pixel-title text-sm text-brand-gold">
                  战场信息
                </h3>
                <button
                  onClick={onCloseMobile}
                  className="w-9 h-9 flex items-center justify-center border-[3px] border-ink-line bg-surface-sunken text-ink-secondary hover:border-game-red hover:text-game-red"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto touch-scroll p-3 space-y-3 safe-bottom">
                <JuryPanel
                  jury={jury}
                  averageSentiment={averageSentiment}
                  compact
                />
                <EvidencePanel evidence={evidence} defaultExpanded />
                <ProgressPanel broken={brokenLocks} total={totalLocks} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProgressPanel({ broken, total }: { broken: number; total: number }) {
  const percent = total > 0 ? (broken / total) * 100 : 0;
  return (
    <Panel variant="dark" padding="sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-game-purple" />
          <h3 className="font-pixel-title text-[10px] text-game-purple uppercase tracking-wider">
            破解进度
          </h3>
        </div>
        <span className="font-pixel-title text-xs text-ink-primary tabular-nums">
          {broken} / {total}
        </span>
      </div>
      <div className="pixel-bar-track">
        <motion.div
          className="pixel-bar-fill bg-game-purple"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <p className="font-pixel-body text-xs text-ink-tertiary mt-2 leading-snug">
        破解一半逻辑锁后可申请结案
      </p>
    </Panel>
  );
}

// ============== 消息气泡 ==============
const MessageBubble = memo(function MessageBubble({
  message,
}: {
  message: CourtroomMessage;
}) {
  if (message.speaker === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-2"
      >
        <div
          className={cn(
            'pixel-dialog-system px-3 py-1.5 max-w-[85%]',
            message.isKeyMoment &&
              'border-brand-gold bg-brand-gold/10 text-brand-gold'
          )}
        >
          <p className="font-pixel-body text-sm">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  const isPlayer = message.speaker === 'player';
  const styleByRole: Record<string, { dialog: string; speaker: string }> = {
    player: {
      dialog: 'pixel-dialog-player',
      speaker: 'text-game-blue',
    },
    witness: {
      dialog: 'pixel-dialog-witness',
      speaker: 'text-ink-primary',
    },
    prosecutor: {
      dialog: 'pixel-dialog-prosecutor',
      speaker: 'text-game-red',
    },
    judge: {
      dialog: 'pixel-dialog-judge',
      speaker: 'text-brand-gold',
    },
  };

  const style = styleByRole[message.speaker] || styleByRole.witness;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn('flex', isPlayer ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[88%] sm:max-w-[80%]',
          style.dialog,
          message.isKeyMoment && 'animate-pixel-glow border-brand-gold'
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <p
            className={cn(
              'font-pixel-title text-[10px] sm:text-xs uppercase tracking-wider',
              style.speaker
            )}
          >
            {message.speakerName}
          </p>
          {message.emotion && (
            <span className="font-pixel-body text-[10px] text-ink-tertiary">
              [{message.emotion}]
            </span>
          )}
          {message.isKeyMoment && (
            <span className="pixel-badge-gold !text-[8px] !px-1.5 !py-0">
              <Sparkles className="w-2.5 h-2.5" />
              关键
            </span>
          )}
        </div>
        <p className="font-pixel-body text-sm sm:text-base text-ink-primary leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
});

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="pixel-dialog px-3 py-2 inline-flex items-center gap-1.5">
        <span className="w-2 h-2 bg-brand-gold animate-pixel-pulse" />
        <span
          className="w-2 h-2 bg-brand-gold animate-pixel-pulse"
          style={{ animationDelay: '0.2s' }}
        />
        <span
          className="w-2 h-2 bg-brand-gold animate-pixel-pulse"
          style={{ animationDelay: '0.4s' }}
        />
      </div>
    </motion.div>
  );
}
