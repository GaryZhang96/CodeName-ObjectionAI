/**
 * 事务所 - 案件档案室
 *
 * 设计：
 * - 章节列表：每章节是一个"卷宗夹"
 * - 案件列表：每个案件是一份带印章的档案，未解锁的有像素封条
 * - 案件详情：左侧 = 案情概要 + 角色，右侧 = 挑战要素 + 接受按钮
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  ArrowLeft,
  Lock,
  ChevronRight,
  Scale,
  Users,
  FileText,
  Trophy,
  Star,
  Sword,
  Shield,
  Sparkles,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { Button, Panel } from '@/components/ui';
import { StatusBar } from '@/components/game';
import { useGameStore } from '@/store/gameStore';
import { useCollectionStore } from '@/store/collectionStore';
import {
  getStoryChapters,
  isStoryUnlocked,
  convertStoryToCase,
  getStoryDifficultyInfo,
  getCaseTypeInfo,
} from '@/data/stories';
import type { PresetStory, StoryDifficulty } from '@/data/stories';
import { formatMoney, cn } from '@/lib/utils';
import { getProsecutorStyleName } from '@/constants/game';

export function OfficeScreen() {
  const { player, selectCase, setPhase } = useGameStore();
  const { collection } = useCollectionStore();

  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedStory, setSelectedStory] = useState<PresetStory | null>(null);

  const completedStories = useMemo(
    () => collection.storybooks.map((s) => s.storyId),
    [collection.storybooks]
  );

  const totalWins = player.stats.casesWon;
  const chapters = useMemo(() => getStoryChapters(), []);

  const checkUnlocked = (storyId: string) =>
    isStoryUnlocked(storyId, player.level, completedStories, totalWins);

  const isCompleted = (storyId: string) =>
    completedStories.includes(storyId);

  const getChapterProgress = (chapter: { stories: PresetStory[] }) => {
    const completed = chapter.stories.filter((s) => isCompleted(s.id)).length;
    return { completed, total: chapter.stories.length };
  };

  const handleAcceptCase = () => {
    if (selectedStory) {
      const caseData = convertStoryToCase(selectedStory);
      selectCase(caseData);
    }
  };

  const getDifficultyMeta = (
    difficulty: StoryDifficulty
  ): { color: string; bg: string; stars: number } => {
    const map: Record<
      StoryDifficulty,
      { color: string; bg: string; stars: number }
    > = {
      tutorial: { color: 'text-ink-tertiary', bg: 'bg-ink-line/30', stars: 1 },
      beginner: {
        color: 'text-game-green',
        bg: 'bg-game-green/15',
        stars: 1,
      },
      intermediate: {
        color: 'text-game-blue',
        bg: 'bg-game-blue/15',
        stars: 2,
      },
      advanced: {
        color: 'text-game-yellow',
        bg: 'bg-game-yellow/15',
        stars: 3,
      },
      expert: { color: 'text-game-red', bg: 'bg-game-red/15', stars: 4 },
      legendary: {
        color: 'text-game-purple',
        bg: 'bg-game-purple/15',
        stars: 5,
      },
    };
    return map[difficulty];
  };

  const handleBack = () => {
    if (selectedStory) setSelectedStory(null);
    else if (selectedChapter !== null) setSelectedChapter(null);
    else setPhase('menu');
  };

  return (
    <div className="min-h-dvh pixel-court-bg">
      <StatusBar />

      <div className="pt-16 sm:pt-20 pb-8 px-3 sm:px-4 max-w-5xl mx-auto safe-x">
        {/* 返回 */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-3 sm:mb-5"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="!min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            {selectedStory
              ? '返回案件列表'
              : selectedChapter !== null
                ? '返回章节'
                : '返回菜单'}
          </Button>
        </motion.div>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-5 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-2">
            <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-brand-gold" />
            <h1 className="font-pixel-title text-lg sm:text-2xl text-brand-gold pixel-title-glow">
              案件档案室
            </h1>
          </div>
          <p className="font-pixel-body text-sm sm:text-base text-ink-tertiary">
            {selectedChapter === null
              ? '选择一个章节开始你的律师生涯'
              : selectedStory
                ? `案件详情 · ${selectedStory.title}`
                : chapters.find((c) => c.chapter === selectedChapter)?.title}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ============== 章节列表 ============== */}
          {selectedChapter === null && !selectedStory && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5 sm:space-y-3"
            >
              {chapters.map((chapter, index) => {
                const diffMeta = getDifficultyMeta(chapter.difficulty);
                const diffInfo = getStoryDifficultyInfo(chapter.difficulty);
                const progress = getChapterProgress(chapter);
                const hasUnlocked = chapter.stories.some((s) =>
                  checkUnlocked(s.id)
                );
                const isLocked = !hasUnlocked;
                const isComplete = progress.completed === progress.total;
                const progressPercent =
                  (progress.completed / progress.total) * 100;

                return (
                  <motion.button
                    key={chapter.chapter}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    disabled={isLocked}
                    onClick={() => !isLocked && setSelectedChapter(chapter.chapter)}
                    className={cn(
                      'group w-full text-left',
                      'flex items-center gap-3 sm:gap-4 p-3 sm:p-4',
                      'bg-surface-raised border-[3px]',
                      'shadow-pixel transition-all duration-150',
                      isLocked
                        ? 'opacity-60 cursor-not-allowed border-ink-line'
                        : isComplete
                          ? 'border-brand-gold shadow-pixel-gold hover:bg-brand-gold/5'
                          : 'border-ink-line hover:border-brand-gold hover:bg-surface-overlay'
                    )}
                  >
                    {/* 章节图标 */}
                    <div
                      className={cn(
                        'shrink-0 w-12 h-12 sm:w-14 sm:h-14',
                        'flex items-center justify-center',
                        'border-[3px] shadow-pixel-sm',
                        isLocked
                          ? 'border-ink-line bg-surface-sunken'
                          : 'border-brand-gold bg-brand-gold/15'
                      )}
                    >
                      {isLocked ? (
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-ink-tertiary" />
                      ) : (
                        <span className="font-pixel-title text-lg sm:text-xl text-brand-gold">
                          {chapter.chapter}
                        </span>
                      )}
                    </div>

                    {/* 章节信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-pixel-title text-xs sm:text-sm text-ink-primary mb-1 truncate">
                        {chapter.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'pixel-badge !text-[9px]',
                            diffMeta.bg,
                            diffMeta.color
                          )}
                        >
                          <DifficultyStars count={diffMeta.stars} />
                          {diffInfo.name}
                        </span>
                        <span className="font-pixel-body text-xs text-ink-tertiary">
                          {chapter.stories.length} 个案件
                        </span>
                      </div>
                    </div>

                    {/* 进度 */}
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 justify-end mb-1.5">
                        <Trophy
                          className={cn(
                            'w-3.5 h-3.5',
                            isComplete
                              ? 'text-brand-gold'
                              : 'text-ink-tertiary'
                          )}
                        />
                        <span className="font-pixel-title text-xs text-ink-primary tabular-nums">
                          {progress.completed}/{progress.total}
                        </span>
                      </div>
                      <div className="pixel-bar-track w-20 sm:w-24">
                        <div
                          className="pixel-bar-fill bg-brand-gold"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {!isLocked && (
                      <ChevronRight className="shrink-0 w-5 h-5 text-ink-tertiary group-hover:text-brand-gold group-hover:translate-x-0.5 transition-all" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* ============== 案件网格 ============== */}
          {selectedChapter !== null && !selectedStory && (
            <motion.div
              key="stories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
            >
              {chapters
                .find((c) => c.chapter === selectedChapter)
                ?.stories.map((story, index) => {
                  const isUnlocked = checkUnlocked(story.id);
                  const completed = isCompleted(story.id);
                  const diffMeta = getDifficultyMeta(story.difficulty);
                  const diffInfo = getStoryDifficultyInfo(story.difficulty);
                  const caseTypeInfo = getCaseTypeInfo(story.detailedType);

                  return (
                    <motion.button
                      key={story.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      disabled={!isUnlocked}
                      onClick={() => isUnlocked && setSelectedStory(story)}
                      className={cn(
                        'relative text-left flex flex-col',
                        'p-4 bg-surface-raised border-[3px] shadow-pixel',
                        'transition-all duration-150',
                        !isUnlocked &&
                          'opacity-50 cursor-not-allowed border-ink-line',
                        isUnlocked &&
                          !completed &&
                          'border-ink-line hover:border-brand-gold hover:bg-surface-overlay',
                        completed && 'border-brand-gold shadow-pixel-gold'
                      )}
                    >
                      {/* 封条 - 未解锁 */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-game-red text-ink-primary border-[3px] border-game-red-deep px-4 py-1 rotate-[-12deg] shadow-pixel-red">
                            <span className="font-pixel-title text-xs uppercase tracking-widest">
                              已封存
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 头部徽章 */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              'pixel-badge !text-[9px]',
                              diffMeta.bg,
                              diffMeta.color
                            )}
                          >
                            <DifficultyStars count={diffMeta.stars} />
                            {diffInfo.name}
                          </span>
                          {completed && (
                            <span className="pixel-badge-gold !text-[9px]">
                              <Trophy className="w-2.5 h-2.5" />
                              已完成
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-pixel-title text-sm sm:text-base text-brand-gold mb-1 leading-tight">
                        {story.title}
                      </h3>
                      <p className="font-pixel-body text-xs text-ink-tertiary mb-3">
                        {story.subtitle}
                      </p>

                      <p className="font-pixel-body text-sm text-ink-primary leading-relaxed line-clamp-3 mb-3 flex-1">
                        {story.coverDescription}
                      </p>

                      {/* 案件元数据 */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-tertiary pt-3 border-t-2 border-ink-line/60">
                        <span className="flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          {caseTypeInfo?.name || story.detailedType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {story.caseData.witnesses.length} 证人
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {story.caseData.logicalLocks.length} 锁
                        </span>
                      </div>

                      {/* 奖励行 */}
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t-2 border-ink-line/60">
                        <span className="flex items-center gap-1 text-game-green text-xs font-pixel-title">
                          <TrendingUp className="w-3 h-3" />
                          +{story.caseData.rewards.baseXP} XP
                        </span>
                        <span className="flex items-center gap-1 text-brand-gold text-xs font-pixel-title">
                          <Coins className="w-3 h-3" />
                          {formatMoney(story.caseData.rewards.baseMoney)}
                        </span>
                      </div>

                      {/* 解锁条件 */}
                      {!isUnlocked && (
                        <div className="mt-2.5 pt-2.5 border-t-2 border-game-red/40">
                          <p className="font-pixel-body text-xs text-game-red text-center">
                            需要 Lv.{story.unlockCondition.requiredLevel}+
                            {story.unlockCondition.requiredStories.length >
                              0 && ' · 先完成前置案件'}
                          </p>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
            </motion.div>
          )}

          {/* ============== 案件详情 ============== */}
          {selectedStory && (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* 头部信息 */}
              <Panel variant="highlight" padding="lg">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={cn(
                          'pixel-badge !text-[10px]',
                          getDifficultyMeta(selectedStory.difficulty).bg,
                          getDifficultyMeta(selectedStory.difficulty).color
                        )}
                      >
                        <DifficultyStars
                          count={
                            getDifficultyMeta(selectedStory.difficulty).stars
                          }
                        />
                        {getStoryDifficultyInfo(selectedStory.difficulty).name}
                      </span>
                      <span className="font-pixel-body text-xs text-ink-tertiary">
                        {selectedStory.subtitle}
                      </span>
                    </div>

                    <h2 className="font-pixel-title text-xl sm:text-2xl text-brand-gold mb-3 leading-tight">
                      {selectedStory.title}
                    </h2>

                    <p className="font-pixel-body text-base text-ink-primary leading-relaxed mb-4">
                      {selectedStory.coverDescription}
                    </p>

                    <div className="flex flex-wrap gap-3 text-sm">
                      <MetaPill
                        icon={Scale}
                        text={
                          getCaseTypeInfo(selectedStory.detailedType)?.name ||
                          selectedStory.detailedType
                        }
                      />
                      <MetaPill
                        icon={Users}
                        text={
                          selectedStory.requiresJury
                            ? '陪审团审判'
                            : '法官独审'
                        }
                      />
                    </div>
                  </div>

                  {/* 奖励 */}
                  <div className="md:w-48 shrink-0">
                    <Panel variant="dark" padding="sm">
                      <h4 className="font-pixel-title text-[10px] text-ink-tertiary mb-2.5 uppercase tracking-wider">
                        预期奖励
                      </h4>
                      <div className="space-y-2 text-sm">
                        <RewardRow
                          icon={TrendingUp}
                          label="经验"
                          value={`+${selectedStory.caseData.rewards.baseXP}`}
                          color="text-game-green"
                        />
                        <RewardRow
                          icon={Coins}
                          label="金币"
                          value={formatMoney(
                            selectedStory.caseData.rewards.baseMoney
                          )}
                          color="text-brand-gold"
                        />
                        {selectedStory.caseData.rewards.achievement && (
                          <div className="pt-2 mt-2 border-t-2 border-ink-line">
                            <div className="flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                              <span className="font-pixel-body text-xs text-brand-gold truncate">
                                {selectedStory.caseData.rewards.achievement.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Panel>
                  </div>
                </div>
              </Panel>

              {/* 案情详情 + 人物 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 案情 */}
                <Panel variant="default" padding="md">
                  <h3 className="font-pixel-title text-xs text-brand-gold mb-2 uppercase tracking-wider">
                    案情概要
                  </h3>
                  <div className="font-pixel-body text-sm text-ink-primary leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto touch-scroll pr-2">
                    {selectedStory.caseData.detailedBackground}
                  </div>
                </Panel>

                {/* 角色 */}
                <Panel variant="default" padding="md" className="space-y-3">
                  <h3 className="font-pixel-title text-xs text-brand-gold uppercase tracking-wider">
                    人物档案
                  </h3>

                  {/* 被告 */}
                  <RoleCard
                    icon={Shield}
                    title="被告"
                    name={selectedStory.caseData.defendant.name}
                    sub={`${selectedStory.caseData.defendant.age} 岁 · ${selectedStory.caseData.defendant.occupation}`}
                    bio={selectedStory.caseData.defendant.background}
                    color="text-game-blue"
                  />

                  {/* 检察官 */}
                  <RoleCard
                    icon={Sword}
                    title="对手检察官"
                    name={selectedStory.caseData.prosecutor.name}
                    sub={`风格: ${getProsecutorStyleName(selectedStory.caseData.prosecutor.style)}`}
                    color="text-game-red"
                  />

                  {/* 证人 */}
                  <div>
                    <p className="font-pixel-title text-[10px] text-ink-tertiary uppercase tracking-wider mb-1.5">
                      证人 ({selectedStory.caseData.witnesses.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStory.caseData.witnesses.map((witness) => (
                        <span
                          key={witness.id}
                          className="font-pixel-body text-xs text-ink-primary bg-surface-overlay border-2 border-ink-line px-2 py-0.5"
                        >
                          {witness.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Panel>
              </div>

              {/* 挑战要素 */}
              <Panel variant="dark" padding="md">
                <h3 className="font-pixel-title text-xs text-game-purple mb-3 uppercase tracking-wider">
                  <Sparkles className="inline w-3.5 h-3.5 mr-1" />
                  挑战要素
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <ChallengeStat
                    label="逻辑锁"
                    value={selectedStory.caseData.logicalLocks.length}
                  />
                  <ChallengeStat
                    label="证据"
                    value={selectedStory.caseData.evidence.length}
                  />
                  <ChallengeStat
                    label="隐藏"
                    value={
                      selectedStory.caseData.evidence.filter(
                        (e) => !e.discovered
                      ).length
                    }
                    accent
                  />
                </div>
              </Panel>

              {/* 操作 */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-center pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedStory(null)}
                  className="sm:min-w-[140px]"
                >
                  返回列表
                </Button>
                <Button
                  onClick={handleAcceptCase}
                  size="lg"
                  className="sm:min-w-[200px]"
                >
                  <Briefcase className="w-4 h-4" />
                  接受案件
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DifficultyStars({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center mr-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-2 h-2 fill-current" />
      ))}
    </span>
  );
}

function MetaPill({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-secondary">
      <Icon className="w-3.5 h-3.5 text-brand-gold" />
      {text}
    </span>
  );
}

function RewardRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-ink-tertiary">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className={cn('font-pixel-title text-xs tabular-nums', color)}>
        {value}
      </span>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  name,
  sub,
  bio,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  name: string;
  sub: string;
  bio?: string;
  color: string;
}) {
  return (
    <Panel variant="overlay" padding="sm">
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 shrink-0 bg-surface-sunken border-2 border-ink-line flex items-center justify-center">
          <Icon className={cn('w-4 h-4', color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-pixel-title text-[10px] text-ink-tertiary uppercase tracking-wider">
            {title}
          </p>
          <p className={cn('font-pixel-body text-sm mt-0.5 truncate', color)}>
            {name}
          </p>
          <p className="font-pixel-body text-xs text-ink-secondary">{sub}</p>
          {bio && (
            <p className="font-pixel-body text-xs text-ink-primary mt-1.5 line-clamp-2 leading-relaxed">
              {bio}
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function ChallengeStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center bg-surface-overlay border-2 border-ink-line py-3">
      <span
        className={cn(
          'font-pixel-title text-2xl tabular-nums',
          accent ? 'text-game-purple' : 'text-brand-gold'
        )}
      >
        {value}
      </span>
      <span className="font-pixel-body text-xs text-ink-tertiary mt-0.5">
        {label}
      </span>
    </div>
  );
}
