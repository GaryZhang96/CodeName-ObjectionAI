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
    <div className="min-h-screen bg-court-primary">
      <StatusBar />
      
      <div className="pt-16 pb-8 px-4 max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
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
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {selectedStory ? '返回故事列表' : selectedChapter !== null ? '返回章节' : '返回菜单'}
          </Button>
        </motion.div>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-pixel-title text-2xl text-pixel-gold mb-2">
            <Briefcase className="inline w-8 h-8 mr-2" />
            案件档案室
          </h1>
          <p className="font-pixel-body text-pixel-gray">
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
              className="space-y-4"
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
                    transition={{ delay: index * 0.1 }}
                  >
                    <Panel
                      variant={isChapterLocked ? 'default' : 'highlight'}
                      className={cn(
                        'cursor-pointer transition-all',
                        isChapterLocked ? 'opacity-60' : 'hover:border-pixel-gold'
                      )}
                      onClick={() => !isChapterLocked && setSelectedChapter(chapter.chapter)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* 章节锁定状态 */}
                          <div className={cn(
                            'w-12 h-12 rounded-lg flex items-center justify-center border-2',
                            isChapterLocked ? 'border-pixel-gray bg-pixel-dark' : 'border-pixel-gold bg-court-secondary'
                          )}>
                            {isChapterLocked ? (
                              <Lock className="w-6 h-6 text-pixel-gray" />
                            ) : (
                              <span className="font-pixel-title text-xl text-pixel-gold">{chapter.chapter}</span>
                            )}
                          </div>

                          {/* 章节信息 */}
                          <div>
                            <h3 className="font-pixel-title text-lg text-pixel-light mb-1">
                              {chapter.title}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                'font-pixel-body text-xs px-2 py-0.5 border',
                                getDifficultyColor(chapter.difficulty)
                              )}>
                                {diffInfo.name}
                              </span>
                              <span className="font-pixel-body text-xs text-pixel-gray">
                                {chapter.stories.length} 个案件
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 进度和箭头 */}
                        <div className="flex items-center gap-4">
                          {/* 完成进度 */}
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Trophy className={cn(
                                'w-4 h-4',
                                progress.completed === progress.total ? 'text-pixel-gold' : 'text-pixel-gray'
                              )} />
                              <span className="font-pixel-body text-sm text-pixel-light">
                                {progress.completed}/{progress.total}
                              </span>
                            </div>
                            {/* 进度条 */}
                            <div className="w-20 h-1 bg-pixel-dark mt-1 rounded">
                              <div 
                                className="h-full bg-pixel-gold rounded"
                                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          {!isChapterLocked && (
                            <ChevronRight className="w-5 h-5 text-pixel-gray" />
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
              <div className="grid md:grid-cols-2 gap-4">
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
                        transition={{ delay: index * 0.1 }}
                      >
                        <Panel
                          variant={completed ? 'highlight' : 'default'}
                          className={cn(
                            'cursor-pointer transition-all h-full',
                            !isUnlocked && 'opacity-50',
                            isUnlocked && !completed && 'hover:border-pixel-gold'
                          )}
                          onClick={() => isUnlocked && setSelectedStory(story)}
                        >
                          {/* 头部 */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              {isUnlocked ? (
                                <Unlock className="w-4 h-4 text-pixel-green" />
                              ) : (
                                <Lock className="w-4 h-4 text-pixel-gray" />
                              )}
                              <span className={cn(
                                'font-pixel-body text-xs px-2 py-0.5 border',
                                getDifficultyColor(story.difficulty)
                              )}>
                                {diffInfo.name}
                              </span>
                            </div>
                            {completed && (
                              <div className="flex items-center gap-1">
                                <Trophy className="w-4 h-4 text-pixel-gold" />
                                <span className="font-pixel-body text-xs text-pixel-gold">已完成</span>
                              </div>
                            )}
                          </div>

                          {/* 标题 */}
                          <h3 className="font-pixel-title text-lg text-pixel-gold mb-1">
                            {story.title}
                          </h3>
                          <p className="font-pixel-body text-xs text-pixel-gray mb-3">
                            {story.subtitle}
                          </p>

                          {/* 案件信息 */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-xs">
                              <Scale className="w-3 h-3 text-pixel-gray" />
                              <span className="text-pixel-light">{caseTypeInfo?.name || story.detailedType}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Users className="w-3 h-3 text-pixel-gray" />
                              <span className="text-pixel-light">
                                {story.requiresJury ? '陪审团审判' : '法官审判'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <FileText className="w-3 h-3 text-pixel-gray" />
                              <span className="text-pixel-light">
                                {story.caseData.witnesses.length} 证人 / {story.caseData.logicalLocks.length} 逻辑锁
                              </span>
                            </div>
                          </div>

                          {/* 描述 */}
                          <p className="font-pixel-body text-sm text-pixel-light mb-4 line-clamp-2">
                            {story.coverDescription}
                          </p>

                          {/* 奖励预览 */}
                          <div className="flex justify-between items-center pt-3 border-t border-pixel-gray/30">
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-pixel-green" />
                              <span className="font-pixel-body text-xs text-pixel-green">
                                +{story.caseData.rewards.baseXP} XP
                              </span>
                            </div>
                            <div className="font-pixel-body text-xs text-yellow-400">
                              {formatMoney(story.caseData.rewards.baseMoney)}
                            </div>
                          </div>

                          {/* 解锁条件提示 */}
                          {!isUnlocked && (
                            <div className="mt-3 pt-3 border-t border-pixel-gray/30">
                              <p className="font-pixel-body text-xs text-pixel-red">
                                解锁条件: 等级 {story.unlockCondition.requiredLevel}+
                                {story.unlockCondition.requiredStories.length > 0 && 
                                  ` / 完成前置故事`}
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
            >
              <Panel variant="highlight" className="mb-6">
                {/* 头部信息 */}
                <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                  {/* 左侧：标题和基本信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={cn(
                        'font-pixel-body text-xs px-2 py-1 border',
                        getDifficultyColor(selectedStory.difficulty)
                      )}>
                        {getStoryDifficultyInfo(selectedStory.difficulty).name}
                      </span>
                      <span className="font-pixel-body text-xs text-pixel-gray">
                        {selectedStory.subtitle}
                      </span>
                    </div>
                    
                    <h2 className="font-pixel-title text-2xl text-pixel-gold mb-3">
                      {selectedStory.title}
                    </h2>
                    
                    <p className="font-pixel-body text-sm text-pixel-light mb-4">
                      {selectedStory.coverDescription}
                    </p>

                    {/* 法庭信息 */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Scale className="w-4 h-4 text-pixel-gray" />
                        <span className="text-pixel-light">
                          {getCaseTypeInfo(selectedStory.detailedType)?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-pixel-gray" />
                        <span className="text-pixel-light">
                          {selectedStory.requiresJury ? '12人陪审团' : '法官独审'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：奖励信息 */}
                  <div className="md:w-48">
                    <Panel variant="default" className="!p-4">
                      <h4 className="font-pixel-title text-xs text-pixel-gray mb-3">预期奖励</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-pixel-gray">基础XP</span>
                          <span className="text-xs text-pixel-green">+{selectedStory.caseData.rewards.baseXP}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-pixel-gray">基础金币</span>
                          <span className="text-xs text-yellow-400">{formatMoney(selectedStory.caseData.rewards.baseMoney)}</span>
                        </div>
                        {selectedStory.caseData.rewards.achievement && (
                          <div className="pt-2 border-t border-pixel-gray/30">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-pixel-gold" />
                              <span className="text-xs text-pixel-gold">
                                {selectedStory.caseData.rewards.achievement.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Panel>
                  </div>
                </div>

                {/* 案情详情 */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* 案情概要 */}
                  <div>
                    <h3 className="font-pixel-title text-sm text-pixel-gray mb-2">案情概要</h3>
                    <div className="font-pixel-body text-sm text-pixel-light whitespace-pre-wrap max-h-48 overflow-y-auto pr-2 bg-pixel-dark/50 p-3 rounded">
                      {selectedStory.caseData.detailedBackground}
                    </div>
                  </div>

                  {/* 人物信息 */}
                  <div className="space-y-4">
                    {/* 被告 */}
                    <div>
                      <h3 className="font-pixel-title text-sm text-pixel-gray mb-2">被告</h3>
                      <div className="bg-pixel-dark/50 p-3 rounded">
                        <p className="font-pixel-body text-sm text-pixel-gold">
                          {selectedStory.caseData.defendant.name}
                        </p>
                        <p className="font-pixel-body text-xs text-pixel-gray">
                          {selectedStory.caseData.defendant.age}岁 · {selectedStory.caseData.defendant.occupation}
                        </p>
                        <p className="font-pixel-body text-xs text-pixel-light mt-1">
                          {selectedStory.caseData.defendant.background}
                        </p>
                      </div>
                    </div>

                    {/* 检察官 */}
                    <div>
                      <h3 className="font-pixel-title text-sm text-pixel-gray mb-2">对手检察官</h3>
                      <div className="bg-pixel-dark/50 p-3 rounded">
                        <p className="font-pixel-body text-sm text-pixel-red">
                          {selectedStory.caseData.prosecutor.name}
                        </p>
                        <p className="font-pixel-body text-xs text-pixel-gray">
                          风格: {getProsecutorStyleName(selectedStory.caseData.prosecutor.style)}
                        </p>
                        <p className="font-pixel-body text-xs text-pixel-light mt-1">
                          {selectedStory.caseData.prosecutor.personality}
                        </p>
                      </div>
                    </div>

                    {/* 证人预览 */}
                    <div>
                      <h3 className="font-pixel-title text-sm text-pixel-gray mb-2">
                        证人 ({selectedStory.caseData.witnesses.length}人)
                      </h3>
                      <div className="space-y-1">
                        {selectedStory.caseData.witnesses.map(witness => (
                          <div key={witness.id} className="flex items-center gap-2 text-sm">
                            <span className="text-pixel-gold">•</span>
                            <span className="text-pixel-light">{witness.name}</span>
                            <span className="text-pixel-gray text-xs">({witness.role})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 挑战信息 */}
                <div className="bg-court-secondary/50 p-4 rounded mb-6">
                  <h3 className="font-pixel-title text-sm text-pixel-gray mb-3">挑战要素</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-pixel-dark flex items-center justify-center">
                        <span className="font-pixel-title text-sm text-pixel-gold">
                          {selectedStory.caseData.logicalLocks.length}
                        </span>
                      </div>
                      <span className="text-xs text-pixel-light">逻辑锁</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-pixel-dark flex items-center justify-center">
                        <span className="font-pixel-title text-sm text-pixel-gold">
                          {selectedStory.caseData.evidence.length}
                        </span>
                      </div>
                      <span className="text-xs text-pixel-light">证据</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-pixel-dark flex items-center justify-center">
                        <span className="font-pixel-title text-sm text-pixel-gold">
                          {selectedStory.caseData.evidence.filter(e => !e.discovered).length}
                        </span>
                      </div>
                      <span className="text-xs text-pixel-light">隐藏证据</span>
                    </div>
                  </div>
                </div>

                {/* 接受案件按钮 */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedStory(null)}
                    className="flex items-center gap-2"
                  >
                    返回列表
                  </Button>
                  <Button
                    onClick={handleAcceptCase}
                    size="lg"
                    className="flex items-center gap-2 min-w-[200px]"
                  >
                    <Briefcase className="w-5 h-5" />
                    接受此案件
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
