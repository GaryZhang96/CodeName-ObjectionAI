/**
 * GM 开发者界面 - 查看所有案件故事
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Book, 
  Lock, 
  Unlock, 
  Star,
  Users,
  FileText,
  Scale,
  ChevronDown,
  ChevronRight,
  Eye,
  Play,
} from 'lucide-react';
import { Button, Panel, Modal } from '@/components/ui';
import { useGameStore } from '@/store/gameStore';
import { useCollectionStore } from '@/store/collectionStore';
import { 
  ALL_PRESET_STORIES, 
  getStoryChapters,
  getStoryDifficultyInfo,
  getCaseTypeInfo,
  convertStoryToCase,
} from '@/data/stories';
import type { PresetStory } from '@/data/stories/types';
import { cn } from '@/lib/utils';

export function GMScreen() {
  const { setPhase, selectCase, initInvestigation } = useGameStore();
  const { collection, getCompletedStoryIds } = useCollectionStore();
  const [selectedStory, setSelectedStory] = useState<PresetStory | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([1, 2]);
  const [viewMode, setViewMode] = useState<'chapters' | 'all'>('chapters');
  const [showStoryDetail, setShowStoryDetail] = useState(false);

  const chapters = getStoryChapters();
  const completedIds = getCompletedStoryIds();

  const toggleChapter = (chapter: number) => {
    setExpandedChapters(prev =>
      prev.includes(chapter)
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    );
  };

  const handleStartStory = (story: PresetStory) => {
    const caseData = convertStoryToCase(story);
    selectCase(caseData as any);
    // 生成空线索直接进入庭审（GM模式）
    initInvestigation([]);
    setPhase('investigation');
  };

  const handleViewStory = (story: PresetStory) => {
    setSelectedStory(story);
    setShowStoryDetail(true);
  };

  return (
    <div className="min-h-screen bg-court-primary">
      {/* Header */}
      <div className="bg-court-secondary border-b-4 border-pixel-gold p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPhase('menu')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <h1 className="font-pixel-title text-xl text-pixel-gold">
              🔧 GM 开发者控制台
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-pixel-gray text-sm">
              总故事数: {ALL_PRESET_STORIES.length}
            </span>
            <span className="text-pixel-green text-sm">
              已完成: {completedIds.length}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* 统计面板 */}
        <Panel variant="dark" className="mb-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-pixel-gold font-pixel-title text-2xl">
                {ALL_PRESET_STORIES.length}
              </p>
              <p className="text-pixel-gray text-xs">总案件数</p>
            </div>
            <div>
              <p className="text-pixel-green font-pixel-title text-2xl">
                {collection.stats.totalStoriesCompleted}
              </p>
              <p className="text-pixel-gray text-xs">已完成</p>
            </div>
            <div>
              <p className="text-yellow-400 font-pixel-title text-2xl">
                {collection.stats.perfectRatings}
              </p>
              <p className="text-pixel-gray text-xs">S评级</p>
            </div>
            <div>
              <p className="text-purple-400 font-pixel-title text-2xl">
                {collection.achievements.length}
              </p>
              <p className="text-pixel-gray text-xs">成就</p>
            </div>
          </div>
        </Panel>

        {/* 视图切换 */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'chapters' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('chapters')}
          >
            章节视图
          </Button>
          <Button
            variant={viewMode === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('all')}
          >
            全部列表
          </Button>
        </div>

        {/* 章节视图 */}
        {viewMode === 'chapters' && (
          <div className="space-y-4">
            {chapters.map(chapter => {
              const isExpanded = expandedChapters.includes(chapter.chapter);
              const diffInfo = getStoryDifficultyInfo(chapter.difficulty);
              
              return (
                <Panel key={chapter.chapter} variant="default">
                  {/* 章节标题 */}
                  <button
                    className="w-full flex items-center justify-between p-2 hover:bg-pixel-dark/50"
                    onClick={() => toggleChapter(chapter.chapter)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-pixel-gold" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-pixel-gold" />
                      )}
                      <span className="font-pixel-title text-pixel-gold">
                        {chapter.title}
                      </span>
                      <span className={cn('text-xs px-2 py-0.5 border', diffInfo.color)}>
                        {diffInfo.name}
                      </span>
                    </div>
                    <span className="text-pixel-gray text-sm">
                      {chapter.stories.filter(s => completedIds.includes(s.id)).length}/{chapter.stories.length} 完成
                    </span>
                  </button>

                  {/* 故事列表 */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-pixel-gray/30 pt-3 space-y-2">
                          {chapter.stories.map(story => (
                            <StoryCard
                              key={story.id}
                              story={story}
                              isCompleted={completedIds.includes(story.id)}
                              onView={() => handleViewStory(story)}
                              onStart={() => handleStartStory(story)}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Panel>
              );
            })}
          </div>
        )}

        {/* 全部列表视图 */}
        {viewMode === 'all' && (
          <div className="grid md:grid-cols-2 gap-4">
            {ALL_PRESET_STORIES.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                isCompleted={completedIds.includes(story.id)}
                onView={() => handleViewStory(story)}
                onStart={() => handleStartStory(story)}
                showChapter
              />
            ))}
          </div>
        )}
      </div>

      {/* 故事详情弹窗 */}
      <Modal
        isOpen={showStoryDetail && !!selectedStory}
        onClose={() => setShowStoryDetail(false)}
        title={selectedStory?.title}
        className="max-w-3xl"
      >
        {selectedStory && (
          <StoryDetailView 
            story={selectedStory} 
            onStart={() => {
              setShowStoryDetail(false);
              handleStartStory(selectedStory);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

// 故事卡片组件
interface StoryCardProps {
  story: PresetStory;
  isCompleted: boolean;
  onView: () => void;
  onStart: () => void;
  showChapter?: boolean;
}

function StoryCard({ story, isCompleted, onView, onStart, showChapter }: StoryCardProps) {
  const diffInfo = getStoryDifficultyInfo(story.difficulty);
  const typeInfo = getCaseTypeInfo(story.detailedType);

  return (
    <div className={cn(
      'p-3 border-2 bg-pixel-dark',
      isCompleted ? 'border-pixel-green' : 'border-pixel-gray',
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isCompleted ? (
              <Unlock className="w-4 h-4 text-pixel-green" />
            ) : (
              <Lock className="w-4 h-4 text-pixel-gray" />
            )}
            <span className="font-pixel-title text-sm text-pixel-light">
              {story.title}
            </span>
          </div>
          <p className="text-xs text-pixel-gray">{story.subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn('text-xs px-2 py-0.5 border', diffInfo.color)}>
            {diffInfo.name}
          </span>
          {showChapter && (
            <span className="text-xs text-pixel-gray">Ch.{story.chapter}</span>
          )}
        </div>
      </div>

      <p className="text-xs text-pixel-light mb-2 line-clamp-2">
        {story.caseData.summary}
      </p>

      <div className="flex items-center justify-between text-xs text-pixel-gray mb-2">
        <span>{typeInfo.name}</span>
        <span>{story.requiresJury ? '陪审团' : '法官审判'}</span>
      </div>

      <div className="flex items-center gap-2 text-xs mb-3">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {story.caseData.witnesses.length}证人
        </span>
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {story.caseData.evidence.length}证据
        </span>
        <span className="flex items-center gap-1">
          <Scale className="w-3 h-3" />
          {story.caseData.logicalLocks.length}逻辑锁
        </span>
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onView} className="flex-1">
          <Eye className="w-3 h-3 mr-1" />
          查看
        </Button>
        <Button size="sm" onClick={onStart} className="flex-1">
          <Play className="w-3 h-3 mr-1" />
          开始
        </Button>
      </div>
    </div>
  );
}

// 故事详情视图组件
interface StoryDetailViewProps {
  story: PresetStory;
  onStart: () => void;
}

function StoryDetailView({ story, onStart }: StoryDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'witnesses' | 'locks' | 'storybook'>('overview');
  const diffInfo = getStoryDifficultyInfo(story.difficulty);
  const typeInfo = getCaseTypeInfo(story.detailedType);

  return (
    <div className="space-y-4">
      {/* 标签页 */}
      <div className="flex gap-2 border-b border-pixel-gray/30 pb-2">
        {['overview', 'evidence', 'witnesses', 'locks', 'storybook'].map(tab => (
          <button
            key={tab}
            className={cn(
              'px-3 py-1 text-xs font-pixel-title',
              activeTab === tab ? 'text-pixel-gold border-b-2 border-pixel-gold' : 'text-pixel-gray'
            )}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === 'overview' && '概览'}
            {tab === 'evidence' && '证据'}
            {tab === 'witnesses' && '证人'}
            {tab === 'locks' && '逻辑锁'}
            {tab === 'storybook' && '故事书'}
          </button>
        ))}
      </div>

      {/* 概览 */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <span className={cn('text-xs px-2 py-0.5 border', diffInfo.color)}>
              {diffInfo.name}
            </span>
            <span className="text-xs px-2 py-0.5 border border-pixel-gray text-pixel-gray">
              {typeInfo.name}
            </span>
            <span className="text-xs px-2 py-0.5 border border-pixel-gray text-pixel-gray">
              {story.requiresJury ? '陪审团' : '法官审判'}
            </span>
          </div>

          <div>
            <h4 className="text-xs text-pixel-gold mb-1">案情摘要</h4>
            <p className="text-sm text-pixel-light">{story.caseData.summary}</p>
          </div>

          <div>
            <h4 className="text-xs text-pixel-gold mb-1">详细背景</h4>
            <p className="text-sm text-pixel-light whitespace-pre-wrap max-h-40 overflow-y-auto">
              {story.caseData.detailedBackground}
            </p>
          </div>

          <div className="p-2 bg-red-900/30 border border-pixel-red">
            <h4 className="text-xs text-pixel-red mb-1">⚠️ 隐藏真相（GM可见）</h4>
            <p className="text-sm text-pixel-light">{story.caseData.hiddenTruth}</p>
            <p className="text-xs text-pixel-red mt-1">真凶: {story.caseData.trueGuiltyParty}</p>
          </div>

          <div>
            <h4 className="text-xs text-pixel-gold mb-1">被告</h4>
            <p className="text-sm text-pixel-light">
              {story.caseData.defendant.name} ({story.caseData.defendant.age}岁) - {story.caseData.defendant.occupation}
            </p>
            <p className="text-xs text-pixel-gray">{story.caseData.defendant.background}</p>
          </div>

          <div>
            <h4 className="text-xs text-pixel-gold mb-1">奖励</h4>
            <p className="text-xs text-pixel-light">
              基础: {story.caseData.rewards.baseXP} XP / ${story.caseData.rewards.baseMoney}
            </p>
          </div>
        </div>
      )}

      {/* 证据 */}
      {activeTab === 'evidence' && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {story.caseData.evidence.map(e => (
            <div key={e.id} className="p-2 bg-pixel-dark border border-pixel-gray">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-pixel-gold">{e.name}</span>
                <div className="flex gap-1">
                  {e.isKeyEvidence && (
                    <Star className="w-3 h-3 text-yellow-400" />
                  )}
                  {e.hasContradiction && (
                    <span className="text-xs text-pixel-red">有矛盾</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-pixel-light">{e.content}</p>
              {e.contradictionHint && (
                <p className="text-xs text-pixel-red mt-1">提示: {e.contradictionHint}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 证人 */}
      {activeTab === 'witnesses' && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {story.caseData.witnesses.map(w => (
            <div key={w.id} className="p-2 bg-pixel-dark border border-pixel-gray">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-pixel-gold">{w.name}</span>
                <span className="text-xs text-pixel-gray">{w.role}</span>
              </div>
              <p className="text-xs text-pixel-light mb-1">{w.initialTestimony}</p>
              <p className="text-xs text-pixel-red">秘密: {w.hiddenSecret}</p>
              <p className="text-xs text-yellow-400">弱点: {w.weakPoints.join(', ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* 逻辑锁 */}
      {activeTab === 'locks' && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {story.caseData.logicalLocks.map((l, i) => (
            <div key={l.id} className="p-2 bg-pixel-dark border border-pixel-gray">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-pixel-gold">逻辑锁 #{i + 1}</span>
                <span className="text-xs text-pixel-gray">({l.contradictionType})</span>
              </div>
              <p className="text-xs text-pixel-light">表面: {l.surfaceClaim}</p>
              <p className="text-xs text-pixel-green">真相: {l.hiddenTruth}</p>
              <p className="text-xs text-yellow-400">提示: {l.hint}</p>
              {l.breakDialogue && (
                <p className="text-xs text-pixel-blue mt-1">破解台词: {l.breakDialogue}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 故事书 */}
      {activeTab === 'storybook' && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <div>
            <h4 className="text-xs text-pixel-gold mb-1">叙事</h4>
            <p className="text-sm text-pixel-light">{story.storybook.fullNarrative}</p>
          </div>
          <div>
            <h4 className="text-xs text-pixel-gold mb-1">章节</h4>
            {story.storybook.chapters.map((ch, i) => (
              <div key={i} className="mb-2">
                <p className="text-xs text-pixel-gold">{ch.title}</p>
                <p className="text-xs text-pixel-gray">{ch.content.substring(0, 100)}...</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-xs text-pixel-gold mb-1">真相揭露</h4>
            <p className="text-xs text-pixel-light">{story.storybook.truthReveal}</p>
          </div>
          <div>
            <h4 className="text-xs text-pixel-gold mb-1">后记</h4>
            <p className="text-xs text-pixel-light">{story.storybook.epilogue}</p>
          </div>
        </div>
      )}

      {/* 开始按钮 */}
      <div className="pt-3 border-t border-pixel-gray/30">
        <Button onClick={onStart} className="w-full">
          <Play className="w-4 h-4 mr-2" />
          开始此案件
        </Button>
      </div>
    </div>
  );
}

