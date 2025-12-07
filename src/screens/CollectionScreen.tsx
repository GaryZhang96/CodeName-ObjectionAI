/**
 * 收藏界面 - 查看已完成的故事书
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Book, 
  Star,
  Trophy,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button, Panel, Modal } from '@/components/ui';
import { useGameStore } from '@/store/gameStore';
import { useCollectionStore } from '@/store/collectionStore';
import { getStoryById, getStoryDifficultyInfo } from '@/data/stories';
import type { CollectedStorybook } from '@/data/stories/types';
import { cn } from '@/lib/utils';
import { getRatingColor } from '@/constants/game';

export function CollectionScreen() {
  const { setPhase } = useGameStore();
  const { collection } = useCollectionStore();
  const [selectedBook, setSelectedBook] = useState<CollectedStorybook | null>(null);
  const [showBookDetail, setShowBookDetail] = useState(false);

  const handleViewBook = (book: CollectedStorybook) => {
    setSelectedBook(book);
    setShowBookDetail(true);
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
              <Book className="inline w-6 h-6 mr-2" />
              我的收藏
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* 统计 */}
        <Panel variant="dark" className="mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Trophy className="w-8 h-8 mx-auto text-pixel-gold mb-2" />
              <p className="text-pixel-gold font-pixel-title text-2xl">
                {collection.stats.totalStoriesCompleted}
              </p>
              <p className="text-pixel-gray text-xs">完成案件</p>
            </div>
            <div>
              <Star className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
              <p className="text-yellow-400 font-pixel-title text-2xl">
                {collection.stats.perfectRatings}
              </p>
              <p className="text-pixel-gray text-xs">S评级</p>
            </div>
            <div>
              <CheckCircle className="w-8 h-8 mx-auto text-pixel-green mb-2" />
              <p className="text-pixel-green font-pixel-title text-2xl">
                {collection.achievements.length}
              </p>
              <p className="text-pixel-gray text-xs">成就</p>
            </div>
          </div>
        </Panel>

        {/* 故事书列表 */}
        {collection.storybooks.length === 0 ? (
          <Panel variant="default" className="text-center py-12">
            <Book className="w-16 h-16 mx-auto text-pixel-gray mb-4" />
            <p className="text-pixel-gray">还没有收藏的故事</p>
            <p className="text-pixel-gray text-sm mt-2">完成案件后，故事书将自动加入收藏</p>
            <Button 
              variant="ghost" 
              className="mt-4"
              onClick={() => setPhase('office')}
            >
              前往事务所接案
            </Button>
          </Panel>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collection.storybooks.map(book => {
              const story = getStoryById(book.storyId);
              if (!story) return null;

              const diffInfo = getStoryDifficultyInfo(story.difficulty);

              return (
                <motion.div
                  key={book.storyId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Panel
                    variant="highlight"
                    className="cursor-pointer h-full"
                    onClick={() => handleViewBook(book)}
                  >
                    {/* 封面 */}
                    <div className="h-32 bg-gradient-to-br from-court-accent to-court-secondary mb-3 flex items-center justify-center">
                      <Book className="w-16 h-16 text-pixel-gold/50" />
                    </div>

                    {/* 标题 */}
                    <h3 className="font-pixel-title text-sm text-pixel-gold mb-1">
                      {story.title}
                    </h3>
                    <p className="text-xs text-pixel-gray mb-2">{story.subtitle}</p>

                    {/* 评级 */}
                    <div className="flex items-center justify-between">
                      <span className={cn('text-xs px-2 py-0.5 border', diffInfo.color)}>
                        {diffInfo.name}
                      </span>
                      <span className={cn(
                        'font-pixel-title text-xl',
                        getRatingColor(book.performance.rating)
                      )}>
                        {book.performance.rating}
                      </span>
                    </div>

                    {/* 完成时间 */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-pixel-gray">
                      <Clock className="w-3 h-3" />
                      {new Date(book.completedAt).toLocaleDateString()}
                    </div>
                  </Panel>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 成就展示 */}
        {collection.achievements.length > 0 && (
          <Panel variant="dark" className="mt-6">
            <h3 className="font-pixel-title text-sm text-pixel-gold mb-3">
              <Trophy className="inline w-4 h-4 mr-2" />
              获得的成就
            </h3>
            <div className="flex flex-wrap gap-2">
              {collection.achievements.map(achievementId => (
                <span
                  key={achievementId}
                  className="px-3 py-1 bg-yellow-900/30 border border-yellow-400 text-yellow-400 text-xs"
                >
                  🏆 {achievementId}
                </span>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {/* 故事书详情弹窗 */}
      <Modal
        isOpen={showBookDetail && !!selectedBook}
        onClose={() => setShowBookDetail(false)}
        title="故事书"
        className="max-w-2xl"
      >
        {selectedBook && <StorybookDetailView book={selectedBook} />}
      </Modal>
    </div>
  );
}

// 故事书详情组件
function StorybookDetailView({ book }: { book: CollectedStorybook }) {
  const story = getStoryById(book.storyId);
  const [activeTab, setActiveTab] = useState<'story' | 'characters' | 'timeline' | 'truth'>('story');

  if (!story) return null;

  const { storybook } = story;

  return (
    <div className="space-y-4">
      {/* 表现评价 */}
      <div className="flex items-center justify-between p-3 bg-pixel-dark border border-pixel-gray">
        <div>
          <p className="text-xs text-pixel-gray">你的表现</p>
          <p className={cn(
            'font-pixel-title text-3xl',
            getRatingColor(book.performance.rating)
          )}>
            {book.performance.rating}
          </p>
        </div>
        <div className="text-right text-xs text-pixel-gray">
          <p>逻辑锁: {book.performance.locksFound}/{book.performance.totalLocks}</p>
          <p>使用提示: {book.performance.hintsUsed}</p>
          {book.performance.perfectCross && (
            <p className="text-pixel-green">✓ 完美询问</p>
          )}
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 border-b border-pixel-gray/30 pb-2">
        {['story', 'characters', 'timeline', 'truth'].map(tab => (
          <button
            key={tab}
            className={cn(
              'px-3 py-1 text-xs font-pixel-title',
              activeTab === tab ? 'text-pixel-gold border-b-2 border-pixel-gold' : 'text-pixel-gray'
            )}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab === 'story' && '故事'}
            {tab === 'characters' && '人物'}
            {tab === 'timeline' && '时间线'}
            {tab === 'truth' && '真相'}
          </button>
        ))}
      </div>

      {/* 故事内容 */}
      {activeTab === 'story' && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <p className="text-sm text-pixel-light italic">{storybook.fullNarrative}</p>
          
          {storybook.chapters.map((chapter, i) => (
            <div key={i} className="border-l-2 border-pixel-gold pl-3">
              <h4 className="text-xs text-pixel-gold mb-1">{chapter.title}</h4>
              <p className="text-xs text-pixel-light">{chapter.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 人物档案 */}
      {activeTab === 'characters' && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {storybook.characterProfiles.map((char, i) => (
            <div key={i} className="p-3 bg-pixel-dark border border-pixel-gray">
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel-title text-sm text-pixel-gold">{char.name}</span>
                <span className="text-xs text-pixel-gray">{char.role}</span>
              </div>
              <p className="text-xs text-pixel-light mb-2">{char.description}</p>
              <p className="text-xs text-pixel-green">
                <span className="text-pixel-gold">揭示: </span>
                {char.secretRevealed}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 时间线 */}
      {activeTab === 'timeline' && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {storybook.timeline.map((event, i) => (
            <div 
              key={i} 
              className={cn(
                'flex items-start gap-3 p-2',
                event.isKeyEvent && 'bg-yellow-900/20 border-l-2 border-yellow-400'
              )}
            >
              <span className="text-xs text-pixel-gold font-pixel-title w-24 flex-shrink-0">
                {event.time}
              </span>
              <span className="text-xs text-pixel-light">{event.event}</span>
            </div>
          ))}
        </div>
      )}

      {/* 真相揭露 */}
      {activeTab === 'truth' && (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <div className="p-3 bg-red-900/20 border border-pixel-red">
            <h4 className="text-xs text-pixel-red mb-2">真相揭露</h4>
            <p className="text-sm text-pixel-light">{storybook.truthReveal}</p>
          </div>
          
          <div className="p-3 bg-pixel-dark border border-pixel-gray">
            <h4 className="text-xs text-pixel-gold mb-2">后记</h4>
            <p className="text-sm text-pixel-light">{storybook.epilogue}</p>
          </div>
        </div>
      )}

      {/* 高光时刻 */}
      {book.highlights.length > 0 && (
        <div className="pt-3 border-t border-pixel-gray/30">
          <h4 className="text-xs text-pixel-gold mb-2">你的高光时刻</h4>
          <div className="space-y-1">
            {book.highlights.map((h, i) => (
              <p key={i} className="text-xs text-pixel-light">⚡ {h}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

