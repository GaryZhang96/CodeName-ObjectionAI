/**
 * 主菜单 - 像素逆转裁判风（v2 — 优化"脸面"设计）
 *
 * 设计意图：
 *   玩家打开游戏的第一眼，必须 1 秒认出「这是个像素法庭辩论游戏」，
 *   并毫不犹豫地找到「开始游戏」按钮。
 *
 * 关键设计决策：
 *   1. 主 CTA 永远亮金色实底，hover 仅"上抬 + 加金光环"，不反转颜色
 *      （避免颜色反转破坏「这就是开始按钮」的稳定感）
 *   2. 次菜单按钮 hover 时只动「左侧金色 indicator + 边框」，
 *      文字始终保持 ink-primary，避免金字+金边互相吃色
 *   3. 所有副文字 ≥ ink-secondary (6.5:1 对比度，过 WCAG AA)
 *   4. Hero 用「双柱 + 法槌徽章 + 顶底金线」营造法庭仪式感
 *   5. 加 "PRESS START" 经典 GBA 闪烁提示，强化"游戏"识别度
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  Play,
  Settings,
  Info,
  Volume2,
  VolumeX,
  Book,
  Wrench,
  PenTool,
  Wifi,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button, Modal, Panel } from '@/components/ui';
import { AIDiagnostics } from '@/components/game/AIDiagnostics';
import { useGameStore } from '@/store/gameStore';
import { useCollectionStore } from '@/store/collectionStore';
import { cn } from '@/lib/utils';

export function MenuScreen() {
  const { setPhase, player, settings, updateSettings, resetGame } =
    useGameStore();
  const { collection } = useCollectionStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showGMAccess, setShowGMAccess] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleStartGame = () => setPhase('office');

  const handleNewGame = () => {
    if (window.confirm('确定要开始新游戏吗？当前进度将被清除。')) {
      resetGame();
    }
  };

  const hasProgress = player.stats.totalCases > 0;
  const winRate = hasProgress
    ? Math.round((player.stats.casesWon / player.stats.totalCases) * 100)
    : 0;

  // 次要菜单项（只有这些用 secondary 样式，主 CTA 单独渲染）
  const secondaryItems = [
    ...(hasProgress
      ? [
          {
            id: 'new',
            label: '新游戏',
            sub: '清空进度并重新开始',
            icon: Scale,
            onClick: handleNewGame,
          },
        ]
      : []),
    ...(collection.storybooks.length > 0
      ? [
          {
            id: 'collection',
            label: `我的收藏 (${collection.storybooks.length})`,
            sub: '查看完成的故事档案',
            icon: Book,
            onClick: () => setPhase('collection'),
          },
        ]
      : []),
    {
      id: 'editor',
      label: '故事编辑器',
      sub: 'UGC · 自己出案件',
      icon: PenTool,
      onClick: () => setPhase('editor'),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="min-h-dvh flex flex-col pixel-court-bg safe-x relative overflow-hidden">
      {/* ====================== 背景装饰层 ====================== */}

      {/* 顶部紫色光晕（深处的庭审光） */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[420px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(255, 182, 39, 0.16) 0%, rgba(165, 94, 234, 0.08) 35%, transparent 70%)',
        }}
      />

      {/* 顶部金色细线（屏幕分割） */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />

      {/* 底部金色细线 */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

      {/* 漂浮金色像素粒子（装饰） */}
      <FloatingPixels />

      {/* ====================== 主内容 ====================== */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 safe-top safe-bottom relative">
        {/* ---------- HERO 区域 ---------- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12 max-w-2xl"
        >
          {/* 上方装饰条：[案件编号 No.001] 风 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-7"
          >
            <span className="h-[2px] w-8 sm:w-12 bg-brand-gold/50" />
            <span className="font-pixel-title text-[9px] sm:text-[10px] text-brand-gold tracking-[0.4em]">
              EST · 2026
            </span>
            <span className="h-[2px] w-8 sm:w-12 bg-brand-gold/50" />
          </motion.div>

          {/* 法槌徽章 - 双柱框出 */}
          <div className="relative inline-flex items-center justify-center mb-4 sm:mb-6">
            {/* 左柱 */}
            <PixelPillar className="hidden sm:block absolute -left-16 top-1/2 -translate-y-1/2" />
            {/* 右柱 */}
            <PixelPillar className="hidden sm:block absolute -right-16 top-1/2 -translate-y-1/2" />

            {/* 法槌图标 */}
            <motion.div
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '50% 85%' }}
              className="relative"
            >
              <Scale
                className="w-20 h-20 sm:w-28 sm:h-28 text-brand-gold"
                strokeWidth={1.5}
                style={{
                  filter:
                    'drop-shadow(4px 4px 0 rgba(14,8,32,0.95)) drop-shadow(0 0 32px rgba(255,182,39,0.55))',
                }}
              />
              {/* 装饰星屑 */}
              <Sparkles
                className="absolute -top-2 -right-3 w-4 h-4 text-brand-gold-soft animate-pixel-pulse"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,217,128,0.9))' }}
              />
              <Sparkles
                className="absolute -bottom-1 -left-3 w-3 h-3 text-brand-gold-soft animate-pixel-pulse"
                style={{ animationDelay: '0.7s' }}
              />
            </motion.div>
          </div>

          {/* 大标题 */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="font-pixel-title text-3xl sm:text-5xl md:text-6xl text-brand-gold mb-3 tracking-widest pixel-title-glow"
          >
            LEX·MACHINA
          </motion.h1>

          {/* 中文副标 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex items-center justify-center gap-3 sm:gap-4 font-pixel-title text-[11px] sm:text-sm text-ink-primary tracking-[0.45em]"
          >
            <span className="h-px w-6 sm:w-10 bg-ink-secondary/60" />
            律 政 先 锋
            <span className="h-px w-6 sm:w-10 bg-ink-secondary/60" />
          </motion.div>

          {/* 副标语 — 改用 ink-secondary 提对比度 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="font-pixel-body text-base sm:text-lg text-ink-secondary mt-4"
          >
            ✦ AI 驱动 · 像素法庭辩论 RPG ✦
          </motion.p>
        </motion.div>

        {/* ---------- MENU 区域 ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-md space-y-3"
        >
          {/* 主 CTA — 永远显眼 */}
          <PrimaryStartButton
            label={hasProgress ? '继续游戏' : '开始游戏'}
            sub={
              hasProgress
                ? `Lv.${player.level} · 胜率 ${winRate}%`
                : '从第一案开始'
            }
            onClick={handleStartGame}
          />

          {/* 次菜单 */}
          {secondaryItems.map((item) => (
            <SecondaryMenuButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              sub={item.sub}
              onClick={item.onClick}
              hideOnMobile={item.hideOnMobile}
            />
          ))}
        </motion.div>

        {/* ---------- 玩家统计（仅有进度时） ---------- */}
        {hasProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 }}
            className="mt-7 sm:mt-9 w-full max-w-md"
          >
            <Panel variant="dark" padding="sm">
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat
                  label="等级"
                  value={`Lv.${player.level}`}
                  color="text-brand-gold"
                />
                <Stat
                  label="胜率"
                  value={`${winRate}%`}
                  color="text-game-green"
                />
                <Stat
                  label="连胜"
                  value={`×${player.stats.currentWinStreak}`}
                  color="text-game-yellow"
                />
              </div>
            </Panel>
          </motion.div>
        )}
      </div>

      {/* ====================== 底部信息条 ====================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="shrink-0 px-4 pb-4 safe-bottom safe-x relative"
      >
        {/* 顶部细分割线 */}
        <div className="max-w-md mx-auto h-px bg-gradient-to-r from-transparent via-ink-line to-transparent mb-3" />

        <div className="max-w-md mx-auto flex items-center justify-center gap-2 sm:gap-3">
          <ToolButton
            icon={Wifi}
            label="AI 诊断"
            onClick={() => setShowDiagnostics(true)}
          />
          <ToolButton
            icon={Settings}
            label="设置"
            onClick={() => setShowSettings(true)}
          />
          <ToolButton
            icon={Info}
            label="关于"
            onClick={() => setShowInfo(true)}
          />
          <ToolButton
            icon={settings.soundEnabled ? Volume2 : VolumeX}
            label={settings.soundEnabled ? '静音' : '开声'}
            onClick={() =>
              updateSettings({ soundEnabled: !settings.soundEnabled })
            }
          />
          <ToolButton
            icon={Wrench}
            label="GM"
            onClick={() => setShowGMAccess(true)}
            className="hidden sm:flex"
          />
        </div>

        {/* 底部 footer：版本 + 状态点 */}
        <div className="max-w-md mx-auto flex items-center justify-between mt-3 px-1">
          <span className="font-pixel-title text-[9px] sm:text-[10px] text-ink-tertiary tracking-widest">
            v1.0.0
          </span>
          <span className="font-pixel-body text-[11px] sm:text-xs text-ink-secondary">
            Made with 🕹️ · Powered by OpenRouter
          </span>
          <span className="flex items-center gap-1.5 font-pixel-title text-[9px] sm:text-[10px] text-game-green tracking-widest">
            <span className="w-1.5 h-1.5 bg-game-green animate-pixel-pulse" />
            ONLINE
          </span>
        </div>
      </motion.div>

      {/* ====================== 弹窗 ====================== */}

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="设置"
        icon={<Settings className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <SettingItem label="扫描线 CRT 效果">
            <Switch
              checked={settings.scanlineEffect}
              onChange={(v) => updateSettings({ scanlineEffect: v })}
            />
          </SettingItem>
          <SettingItem label="音效">
            <Switch
              checked={settings.soundEnabled}
              onChange={(v) => updateSettings({ soundEnabled: v })}
            />
          </SettingItem>
          <SettingItem label="文字速度">
            <select
              value={settings.textSpeed}
              onChange={(e) =>
                updateSettings({
                  textSpeed: e.target.value as
                    | 'slow'
                    | 'normal'
                    | 'fast'
                    | 'instant',
                })
              }
              className="bg-surface-sunken border-[3px] border-ink-line text-ink-primary font-pixel-body text-base px-3 py-1.5 focus:outline-none focus:border-brand-gold"
            >
              <option value="slow">慢</option>
              <option value="normal">正常</option>
              <option value="fast">快</option>
              <option value="instant">即时</option>
            </select>
          </SettingItem>
        </div>
      </Modal>

      <Modal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="关于 Lex Machina"
        icon={<Info className="w-4 h-4" />}
      >
        <div className="space-y-4 font-pixel-body text-base text-ink-primary leading-relaxed">
          <p>
            <span className="text-brand-gold font-pixel-title text-sm">
              LEX·MACHINA
            </span>{' '}
            是一款由 AI 驱动的像素风法庭辩论游戏。
          </p>
          <p>
            扮演一名辩护律师，通过质询证人、出示证据、捕捉矛盾，为被告争取无罪判决。
          </p>
          <div className="border-t-2 border-ink-line pt-4 space-y-1 text-sm text-ink-secondary">
            <p>引擎: React 18 + Vite + Tailwind</p>
            <p>AI: OpenRouter (DeepSeek / Claude)</p>
            <p>灵感: Phoenix Wright · Ace Attorney</p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        title="AI 连接诊断"
        icon={<Wifi className="w-4 h-4" />}
        size="lg"
      >
        <AIDiagnostics />
      </Modal>

      <Modal
        isOpen={showGMAccess}
        onClose={() => setShowGMAccess(false)}
        title="开发者模式 (GM)"
        icon={<Wrench className="w-4 h-4" />}
      >
        <div className="space-y-4 font-pixel-body text-base text-ink-primary">
          <p>GM 模式可查看所有预设案件，包括隐藏真相和逻辑锁。</p>
          <ul className="list-disc list-inside text-sm text-ink-secondary space-y-1">
            <li>查看所有案件故事和细节</li>
            <li>跳过解锁条件，直接进入</li>
            <li>测试预设案件的逻辑</li>
          </ul>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                setShowGMAccess(false);
                setPhase('gm');
              }}
              variant="default"
              fullWidth
            >
              <Wrench className="w-4 h-4 mr-1" />
              进入
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowGMAccess(false)}
              fullWidth
            >
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============== 内部小组件 ==============

/**
 * 主 CTA 按钮 — 永远金色实底，hover 时上抬 + 加金光环
 * 颜色不反转，玩家始终能识别「这是开始」
 */
function PrimaryStartButton({
  label,
  sub,
  onClick,
}: {
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ y: 1, x: 1 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'group relative w-full text-left',
        'flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 sm:py-5',
        'bg-brand-gold text-brand-ink',
        'border-[3px] border-brand-gold-deep',
        'shadow-pixel-lg',
        'transition-shadow duration-150',
        'hover:shadow-[6px_6px_0_0_rgba(14,8,32,0.9),0_0_28px_rgba(255,182,39,0.55)]',
        'active:shadow-pixel'
      )}
    >
      {/* PRESS START 闪烁三角 */}
      <motion.div
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        className="shrink-0"
      >
        <Play
          className="w-6 h-6 sm:w-7 sm:h-7 text-brand-ink"
          fill="currentColor"
          strokeWidth={0}
        />
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className="font-pixel-title text-sm sm:text-base uppercase tracking-[0.18em] text-brand-ink">
          {label}
        </p>
        <p className="font-pixel-body text-sm sm:text-base text-brand-ink/75 mt-0.5">
          {sub}
        </p>
      </div>

      {/* 右侧 "PRESS START" 闪烁徽 */}
      <span className="hidden sm:block shrink-0 font-pixel-title text-[10px] tracking-[0.25em] text-brand-ink/70 animate-pixel-blink">
        START
      </span>
    </motion.button>
  );
}

/**
 * 次级菜单按钮
 * Hover 时：左侧出现金色 indicator bar + 边框变金 + 微微亮度提升
 * 但文字始终保持 ink-primary（避免文字吃边框颜色）
 */
function SecondaryMenuButton({
  icon: Icon,
  label,
  sub,
  onClick,
  hideOnMobile,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  onClick: () => void;
  hideOnMobile?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ x: 1, y: 1 }}
      className={cn(
        'group relative w-full text-left',
        'flex items-center gap-3 sm:gap-4 pl-4 pr-4 py-3 sm:py-4',
        'bg-surface-raised border-[3px] border-ink-line',
        'shadow-pixel',
        'transition-[border-color,background-color,box-shadow] duration-100',
        'hover:border-brand-gold hover:bg-surface-overlay hover:shadow-pixel-lg',
        'active:shadow-pixel-sm',
        hideOnMobile && 'hidden sm:flex'
      )}
    >
      {/* 左侧 indicator bar - hover 时显示 */}
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 bg-brand-gold',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-100'
        )}
      />

      {/* ▶ pointer，hover 时浮现 */}
      <span
        aria-hidden
        className={cn(
          'shrink-0 text-brand-gold transition-opacity duration-100',
          'opacity-0 group-hover:opacity-100'
        )}
      >
        <ChevronRight className="w-5 h-5" />
      </span>

      {/* 图标 */}
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-brand-gold" />

      <div className="flex-1 min-w-0">
        <p className="font-pixel-title text-xs sm:text-sm uppercase tracking-wider text-ink-primary">
          {label}
        </p>
        {/* sub 升级到 ink-secondary，过 WCAG AA */}
        <p className="font-pixel-body text-sm sm:text-base text-ink-secondary mt-0.5">
          {sub}
        </p>
      </div>
    </motion.button>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p className="font-pixel-title text-[9px] text-ink-secondary uppercase tracking-wider">
        {label}
      </p>
      <p className={cn('font-pixel-title text-base mt-1', color)}>{value}</p>
    </div>
  );
}

/**
 * 工具按钮 — hover 时 tooltip 上浮
 */
function ToolButton({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div className={cn('relative group', className)}>
      <button
        onClick={onClick}
        title={label}
        aria-label={label}
        className={cn(
          'flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12',
          'bg-surface-raised border-[3px] border-ink-line',
          'text-ink-secondary',
          'shadow-pixel-sm',
          'transition-all duration-100',
          'hover:text-brand-gold hover:border-brand-gold hover:shadow-pixel',
          'active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
        )}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      {/* tooltip */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-1/2 -translate-x-1/2 -top-7',
          'font-pixel-title text-[9px] text-brand-gold tracking-widest whitespace-nowrap',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
        )}
      >
        {label}
      </span>
    </div>
  );
}

function SettingItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b-2 border-ink-line/40 last:border-0">
      <span className="font-pixel-body text-base text-ink-primary">{label}</span>
      {children}
    </div>
  );
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-12 h-6 border-[3px] shadow-pixel-sm transition-colors',
        checked
          ? 'bg-game-green border-game-green-deep'
          : 'bg-surface-sunken border-ink-line'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        className={cn(
          'absolute top-0 w-4 h-4 bg-ink-primary',
          checked ? 'right-0' : 'left-0'
        )}
      />
    </button>
  );
}

/**
 * 像素罗马柱 — Hero 区域装饰
 * 4 段几何叠加营造庄严感
 */
function PixelPillar({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none', className)} aria-hidden>
      <div className="flex flex-col items-center gap-[2px] opacity-50">
        {/* 柱顶 */}
        <div className="w-7 h-2 bg-brand-gold-deep" />
        <div className="w-5 h-1.5 bg-brand-gold" />
        {/* 柱身 */}
        <div className="w-4 h-16 bg-gradient-to-b from-brand-gold-deep via-brand-gold-deep/70 to-brand-gold-deep border-x-2 border-brand-gold/40" />
        {/* 柱底 */}
        <div className="w-5 h-1.5 bg-brand-gold" />
        <div className="w-7 h-2 bg-brand-gold-deep" />
      </div>
    </div>
  );
}

/**
 * 漂浮的像素粒子（背景装饰，营造氛围）
 */
function FloatingPixels() {
  // 固定种子，避免每次 render 跳位
  const pixels = [
    { left: '8%', top: '15%', size: 3, delay: 0 },
    { left: '18%', top: '70%', size: 2, delay: 1.2 },
    { left: '85%', top: '20%', size: 3, delay: 0.6 },
    { left: '92%', top: '55%', size: 2, delay: 2.1 },
    { left: '12%', top: '45%', size: 2, delay: 1.6 },
    { left: '78%', top: '78%', size: 3, delay: 0.3 },
    { left: '50%', top: '85%', size: 2, delay: 2.4 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {pixels.map((p, i) => (
        <motion.span
          key={i}
          className="absolute bg-brand-gold-soft"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            boxShadow: '0 0 8px rgba(255,217,128,0.7)',
          }}
          animate={{
            opacity: [0.2, 0.9, 0.2],
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
