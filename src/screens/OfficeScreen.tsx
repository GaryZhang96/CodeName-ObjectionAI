/**
 * 事务所界面 - 选择预设案件
 * 纯预设模式：使用预先设计好的故事
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  ArrowLeft, 
  Target,
  Lock,
  Unlock,
  ChevronRight,
  Scale,
  Users,
  FileText,
  Trophy
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
  const { 
    player, 
    selectCase,
    setPhase,
  } = useGameStore();
  
  const { collection } = useCollectionStore();
  
  // 当前选择的章节
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  // 当前选择的故事
  const [selectedStory, setSelectedStory] = useState<PresetStory | null>(null);

  // 获取已完成的故事
  const completedStories = useMemo(() => 
    collection.storybooks.map(s => s.storyId),
    [collection.storybooks]
  );

  // 总胜场数
  const totalWins = player.stats.casesWon;

  // 章节目录
  const chapters = useMemo(() => getStoryChapters(), []);

  // 检查故事解锁状态
  const checkUnlocked = (storyId: string) => 
    isStoryUnlocked(storyId, player.level, completedStories, totalWins);

  // 检查故事是否已完成
  const isCompleted = (storyId: string) => completedStories.includes(storyId);

  // 获取章节完成进度
  const getChapterProgress = (chapter: { stories: PresetStory[] }) => {
    const completed = chapter.stories.filter(s => isCompleted(s.id)).length;
    return { completed, total: chapter.stories.length };
  };

  // 接受案件
  const handleAcceptCase = () => {
    if (selectedStory) {
      const caseData = convertStoryToCase(selectedStory);
      selectCase(caseData);
    }
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: StoryDifficulty) => {
    const colors: Record<StoryDifficulty, string> = {
      tutorial: 'text-gray-400 border-gray-400',
      beginner: 'text-green-400 border-green-400',
      intermediate: 'text-blue-400 border-blue-400',
      advanced: 'text-yellow-400 border-yellow-400',
      expert: 'text-orange-400 border-orange-400',
      legendary: 'text-purple-400 border-purple-400',
    };
    return colors[difficulty];
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-court-primary">
      <StatusBar />
      
      <div className="pt-14 sm:pt-16 pb-6 sm:pb-8 px-3 sm:px-4 max-w-6xl mx-auto safe-area-inset">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 sm:mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (selectedStory) {
                setSelectedStory(null);
              } else if (selectedChapter !== null) {
                setSelectedChapter(null);
              } else {
                setPhase('menu');
              }
            }}
            className="flex items-center gap-2 !min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm">
              {selectedStory ? '返回故事列表' : selectedChapter !== null ? '返回章节' : '返回菜单'}
            </span>
          </Button>
        </motion.div>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <h1 className="font-pixel-title text-lg sm:text-2xl text-pixel-gold mb-1 sm:mb-2">
            <Briefcase className="inline w-6 h-6 sm:w-8 sm:h-8 mr-1 sm:mr-2" />
            案件档案室
          </h1>
          <p className="font-pixel-body text-xs sm:text-sm text-pixel-gray px-2">
            {selectedChapter === null ? '选择一个章节开始你的律师生涯' : 
             selectedStory ? `案件详情 - ${selectedStory.title}` :
             chapters.find(c => c.chapter === selectedChapter)?.title}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* 章节选择视图 */}
          {selectedChapter === null && !selectedStory && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 sm:space-y-4"
            >
              {chapters.map((chapter, index) => {
                const diffInfo = getStoryDifficultyInfo(chapter.difficulty);
                const progress = getChapterProgress(chapter);
                const hasUnlockedStories = chapter.stories.some(s => checkUnlocked(s.id));
                const isChapterLocked = !hasUnlockedStories;

                return (
                  <motion.div
                    key={chapter.chapter}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Panel
                      variant={isChapterLocked ? 'default' : 'highlight'}
                      className={cn(
                        'cursor-pointer transition-all active:scale-[0.98]',
                        isChapterLocked ? 'opacity-60' : 'hover:border-pixel-gold'
                      )}
                      onClick={() => !isChapterLocked && setSelectedChapter(chapter.chapter)}
                    >
                      <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                          {/* 章节锁定状态 */}
                          <div className={cn(
                            'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center border-2 shrink-0',
                            isChapterLocked ? 'border-pixel-gray bg-pixel-dark' : 'border-pixel-gold bg-court-secondary'
                          )}>
                            {isChapterLocked ? (
                              <Lock className="w-4 h-4 sm:w-6 sm:h-6 text-pixel-gray" />
                            ) : (
                              <span className="font-pixel-title text-lg sm:text-xl text-pixel-gold">{chapter.chapter}</span>
                            )}
                          </div>

                          {/* 章节信息 */}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-pixel-title text-sm sm:text-lg text-pixel-light mb-0.5 sm:mb-1 truncate">
                              {chapter.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <span className={cn(
                                'font-pixel-body text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 border',
                                getDifficultyColor(chapter.difficulty)
                              )}>
                                {diffInfo.name}
                              </span>
                              <span className="font-pixel-body text-[10px] sm:text-xs text-pixel-gray">
                                {chapter.stories.length} 案件
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 进度和箭头 */}
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                          {/* 完成进度 */}
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Trophy className={cn(
                                'w-3 h-3 sm:w-4 sm:h-4',
                                progress.completed === progress.total ? 'text-pixel-gold' : 'text-pixel-gray'
                              )} />
                              <span className="font-pixel-body text-xs sm:text-sm text-pixel-light">
                                {progress.completed}/{progress.total}
                              </span>
                            </div>
                            {/* 进度条 */}
                            <div className="w-12 sm:w-20 h-1 bg-pixel-dark mt-1 rounded">
                              <div 
                                className="h-full bg-pixel-gold rounded"
                                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          {!isChapterLocked && (
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-pixel-gray" />
                          )}
                        </div>
                      </div>
                    </Panel>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* 故事列表视图 */}
          {selectedChapter !== null && !selectedStory && (
            <motion.div
              key="stories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {chapters
                  .find(c => c.chapter === selectedChapter)
                  ?.stories.map((story, index) => {
                    const isUnlocked = checkUnlocked(story.id);
                    const completed = isCompleted(story.id);
                    const diffInfo = getStoryDifficultyInfo(story.difficulty);
                    const caseTypeInfo = getCaseTypeInfo(story.detailedType);

                    return (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Panel
                          variant={completed ? 'highlight' : 'default'}
                          className={cn(
                            'cursor-pointer transition-all h-full active:scale-[0.98]',
                            !isUnlocked && 'opacity-50',
                            isUnlocked && !completed && 'hover:border-pixel-gold'
                          )}
                          onClick={() => isUnlocked && setSelectedStory(story)}
                        >
                          {/* 头部 */}
                          <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <div className="flex items-center gap-2">
                              {isUnlocked ? (
                                <Unlock className="w-3 h-3 sm:w-4 sm:h-4 text-pixel-green" />
                              ) : (
                                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-pixel-gray" />
                              )}
                              <span className={cn(
                                'font-pixel-body text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 border',
                                getDifficultyColor(story.difficulty)
                              )}>
                                {diffInfo.name}
                              </span>
                            </div>
                            {completed && (
                              <div className="flex items-center gap-1">
                                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-pixel-gold" />
                                <span className="font-pixel-body text-[10px] sm:text-xs text-pixel-gold">已完成</span>
                              </div>
                            )}
                          </div>

                          {/* 标题 */}
                          <h3 className="font-pixel-title text-base sm:text-lg text-pixel-gold mb-0.5 sm:mb-1">
                            {story.title}
                          </h3>
                          <p className="font-pixel-body text-[10px] sm:text-xs text-pixel-gray mb-2 sm:mb-3">
                            {story.subtitle}
                          </p>

                          {/* 案件信息 - 移动端简化 */}
                          <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-3 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-1">
                              <Scale className="w-3 h-3 text-pixel-gray" />
                              <span className="text-pixel-light">{caseTypeInfo?.name || story.detailedType}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-pixel-gray" />
                              <span className="text-pixel-light">
                                {story.requiresJury ? '陪审团' : '法官'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-pixel-gray" />
                              <span className="text-pixel-light">
                                {story.caseData.witnesses.length}证人/{story.caseData.logicalLocks.length}锁
                              </span>
                            </div>
                          </div>

                          {/* 描述 */}
                          <p className="font-pixel-body text-xs sm:text-sm text-pixel-light mb-3 sm:mb-4 line-clamp-2">
                            {story.coverDescription}
                          </p>

                          {/* 奖励预览 */}
                          <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-pixel-gray/30">
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-pixel-green" />
                              <span className="font-pixel-body text-[10px] sm:text-xs text-pixel-green">
                                +{story.caseData.rewards.baseXP} XP
                              </span>
                            </div>
                            <div className="font-pixel-body text-[10px] sm:text-xs text-yellow-400">
                              {formatMoney(story.caseData.rewards.baseMoney)}
                            </div>
                          </div>

                          {/* 解锁条件提示 */}
                          {!isUnlocked && (
                            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-pixel-gray/30">
                              <p className="font-pixel-body text-[10px] sm:text-xs text-pixel-red">
                                需要: Lv.{story.unlockCondition.requiredLevel}+
                                {story.unlockCondition.requiredStories.length > 0 && 
                                  ` + 前置`}
                              </p>
                            </div>
                          )}
                        </Panel>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* 故事详情视图 */}
          {selectedStory && (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-safe"
            >
              <Panel variant="highlight" className="mb-4 sm:mb-6">
                {/* 头部信息 */}
                <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* 左侧：标题和基本信息 */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <span className={cn(
                        'font-pixel-body text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 border',
                        getDifficultyColor(selectedStory.difficulty)
                      )}>
                        {getStoryDifficultyInfo(selectedStory.difficulty).name}
                      </span>
                      <span className="font-pixel-body text-[10px] sm:text-xs text-pixel-gray">
                        {selectedStory.subtitle}
                      </span>
                    </div>
                    
                    <h2 className="font-pixel-title text-xl sm:text-2xl text-pixel-gold mb-2 sm:mb-3">
                      {selectedStory.title}
                    </h2>
                    
                    <p className="font-pixel-body text-xs sm:text-sm text-pixel-light mb-3 sm:mb-4">
                      {selectedStory.coverDescription}
                    </p>

                    {/* 法庭信息 */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Scale className="w-3 h-3 sm:w-4 sm:h-4 text-pixel-gray" />
                        <span className="text-pixel-light">
                          {getCaseTypeInfo(selectedStory.detailedType)?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-pixel-gray" />
                        <span className="text-pixel-light">
                          {selectedStory.requiresJury ? '陪审团审判' : '法官独审'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：奖励信息 - 移动端横向显示 */}
                  <div className="w-full md:w-48">
                    <Panel variant="default" className="!p-3 sm:!p-4">
                      <h4 className="font-pixel-title text-[10px] sm:text-xs text-pixel-gray mb-2 sm:mb-3">预期奖励</h4>
                      <div className="flex md:flex-col gap-4 md:gap-2">
                        <div className="flex justify-between flex-1 md:flex-none">
                          <span className="text-[10px] sm:text-xs text-pixel-gray">XP</span>
                          <span className="text-[10px] sm:text-xs text-pixel-green">+{selectedStory.caseData.rewards.baseXP}</span>
                        </div>
                        <div className="flex justify-between flex-1 md:flex-none">
                          <span className="text-[10px] sm:text-xs text-pixel-gray">金币</span>
                          <span className="text-[10px] sm:text-xs text-yellow-400">{formatMoney(selectedStory.caseData.rewards.baseMoney)}</span>
                        </div>
                        {selectedStory.caseData.rewards.achievement && (
                          <div className="flex items-center gap-1 flex-1 md:flex-none md:pt-2 md:border-t md:border-pixel-gray/30">
                            <Trophy className="w-3 h-3 text-pixel-gold" />
                            <span className="text-[10px] sm:text-xs text-pixel-gold truncate">
                              {selectedStory.caseData.rewards.achievement.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </Panel>
                  </div>
                </div>

                {/* 案情详情 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* 案情概要 */}
                  <div>
                    <h3 className="font-pixel-title text-xs sm:text-sm text-pixel-gray mb-1.5 sm:mb-2">案情概要</h3>
                    <div className="font-pixel-body text-xs sm:text-sm text-pixel-light whitespace-pre-wrap max-h-36 sm:max-h-48 overflow-y-auto touch-scroll pr-2 bg-pixel-dark/50 p-2 sm:p-3 rounded">
                      {selectedStory.caseData.detailedBackground}
                    </div>
                  </div>

                  {/* 人物信息 */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* 被告 */}
                    <div>
                      <h3 className="font-pixel-title text-xs sm:text-sm text-pixel-gray mb-1.5 sm:mb-2">被告</h3>
                      <div className="bg-pixel-dark/50 p-2 sm:p-3 rounded">
                        <p className="font-pixel-body text-xs sm:text-sm text-pixel-gold">
                          {selectedStory.caseData.defendant.name}
                        </p>
                        <p className="font-pixel-body text-[10px] sm:text-xs text-pixel-gray">
                          {selectedStory.caseData.defendant.age}岁 · {selectedStory.caseData.defendant.occupation}
                        </p>
                        <p className="font-pixel-body text-[10px] sm:text-xs text-pixel-light mt-1 line-clamp-2">
                          {selectedStory.caseData.defendant.background}
                        </p>
                      </div>
                    </div>

                    {/* 检察官 */}
                    <div>
                      <h3 className="font-pixel-title text-xs sm:text-sm text-pixel-gray mb-1.5 sm:mb-2">对手检察官</h3>
                      <div className="bg-pixel-dark/50 p-2 sm:p-3 rounded">
                        <p className="font-pixel-body text-xs sm:text-sm text-pixel-red">
                          {selectedStory.caseData.prosecutor.name}
                        </p>
                        <p className="font-pixel-body text-[10px] sm:text-xs text-pixel-gray">
                          风格: {getProsecutorStyleName(selectedStory.caseData.prosecutor.style)}
                        </p>
                      </div>
                    </div>

                    {/* 证人预览 - 移动端简化 */}
                    <div>
                      <h3 className="font-pixel-title text-xs sm:text-sm text-pixel-gray mb-1.5 sm:mb-2">
                        证人 ({selectedStory.caseData.witnesses.length}人)
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStory.caseData.witnesses.map(witness => (
                          <span key={witness.id} className="text-[10px] sm:text-xs text-pixel-light bg-pixel-dark/50 px-2 py-1 rounded">
                            {witness.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 挑战信息 */}
                <div className="bg-court-secondary/50 p-3 sm:p-4 rounded mb-4 sm:mb-6">
                  <h3 className="font-pixel-title text-xs sm:text-sm text-pixel-gray mb-2 sm:mb-3">挑战要素</h3>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-pixel-dark flex items-center justify-center">
                        <span className="font-pixel-title text-xs sm:text-sm text-pixel-gold">
                          {selectedStory.caseData.logicalLocks.length}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-pixel-light">逻辑锁</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-pixel-dark flex items-center justify-center">
                        <span className="font-pixel-title text-xs sm:text-sm text-pixel-gold">
                          {selectedStory.caseData.evidence.length}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-pixel-light">证据</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-pixel-dark flex items-center justify-center">
                        <span className="font-pixel-title text-xs sm:text-sm text-pixel-gold">
                          {selectedStory.caseData.evidence.filter(e => !e.discovered).length}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs text-pixel-light">隐藏</span>
                    </div>
                  </div>
                </div>

                {/* 接受案件按钮 */}
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedStory(null)}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
                  >
                    返回列表
                  </Button>
                  <Button
                    onClick={handleAcceptCase}
                    size="lg"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[200px] order-1 sm:order-2"
                  >
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                    接受案件
                  </Button>
                </div>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
