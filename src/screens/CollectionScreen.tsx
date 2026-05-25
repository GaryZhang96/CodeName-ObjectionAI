/**
 * 收藏 - 已完成案件档案本
 *
 * 设计：
 * - 顶部：3 张大数字统计卡
 * - 中部：案件书墙（卷宗封面 + 评级勋章）
 * - 详情弹窗：4 个标签页（故事/人物/时间线/真相）
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
  BookOpen,
  Users,
  Calendar,
  Scroll,
} from 'lucide-react';
import { Button, Panel, Modal } from '@/components/ui';
import { useGameStore } from '@/store/gameStore';
import { useCollectionStore } from '@/store/collectionStore';
import { getStoryById, getStoryDifficultyInfo } from '@/data/stories';
import type { CollectedStorybook } from '@/data/stories/types';
import { cn } from '@/lib/utils';
import { getRatingColor } from '@/constants/game';

type TabId = 'story' | 'characters' | 'timeline' | 'truth';

export function CollectionScreen() {
  const { setPhase } = useGameStore();
  const { collection } = useCollectionStore();
  const [selectedBook, setSelectedBook] = useState<CollectedStorybook | null>(
    null
  );

  return (
    <div className="min-h-dvh pixel-court-bg safe-x">
      {/* Header */}
      <div className="bg-surface-sunken/95 backdrop-blur-md border-b-[3px] border-brand-gold safe-top">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPhase('menu')}
            className="!min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="font-pixel-title text-sm sm:text-base text-brand-gold flex items-center gap-2 truncate">
            <Book className="w-5 h-5" />
            我的收藏
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-5 sm:py-6">
        {/* 统计卡 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
          <StatCard
            icon={Trophy}
            value={collection.stats.totalStoriesCompleted}
            label="完成案件"
            color="text-brand-gold"
            borderColor="border-brand-gold"
          />
          <StatCard
            icon={Star}
            value={collection.stats.perfectRatings}
            label="S 评级"
            color="text-game-yellow"
            borderColor="border-game-yellow"
          />
          <StatCard
            icon={CheckCircle}
            value={collection.achievements.length}
            label="成就"
            color="text-game-green"
            borderColor="border-game-green"
          />
        </div>

        {/* 案件书墙 */}
        {collection.storybooks.length === 0 ? (
          <Panel variant="default" padding="lg" className="text-center py-12">
            <Book className="w-16 h-16 mx-auto text-ink-tertiary mb-3" />
            <p className="font-pixel-body text-base text-ink-secondary mb-1">
              还没有收藏的故事
            </p>
            <p className="font-pixel-body text-sm text-ink-tertiary mb-5">
              完成案件后，故事书将自动加入收藏
            </p>
            <Button variant="default" onClick={() => setPhase('office')}>
              前往事务所接案
            </Button>
          </Panel>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
            {collection.storybooks.map((book, index) => {
              const story = getStoryById(book.storyId);
              if (!story) return null;
              const diffInfo = getStoryDifficultyInfo(story.difficulty);
              const ratingColor = getRatingColor(book.performance.rating);

              return (
                <motion.button
                  key={book.storyId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -3 }}
                  onClick={() => setSelectedBook(book)}
                  className={cn(
                    'group text-left flex flex-col',
                    'bg-surface-raised border-[3px] border-brand-gold',
                    'shadow-pixel hover:shadow-pixel-gold',
                    'transition-all duration-150'
                  )}
                >
                  {/* 封面 */}
                  <div className="relative aspect-[3/2] bg-gradient-to-br from-brand-gold/30 to-game-purple/30 border-b-[3px] border-brand-gold flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                      <div
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(45deg, rgba(255, 182, 39, 0.2) 0 2px, transparent 2px 8px)',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </div>
                    <BookOpen className="w-12 h-12 text-brand-gold relative" />

                    {/* 评级勋章 - 右上角 */}
                    <div
                      className={cn(
                        'absolute top-1.5 right-1.5 w-9 h-9 flex items-center justify-center',
                        'bg-surface-base border-[3px] shadow-pixel-sm',
                        ratingColor.includes('brand-gold')
                          ? 'border-brand-gold'
                          : 'border-ink-line'
                      )}
                    >
                      <span
                        className={cn(
                          'font-pixel-title text-base',
                          ratingColor
                        )}
                      >
                        {book.performance.rating}
                      </span>
                    </div>
                  </div>

                  {/* 信息 */}
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-pixel-title text-xs sm:text-sm text-brand-gold mb-1 leading-tight line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="font-pixel-body text-xs text-ink-tertiary mb-2 line-clamp-1">
                      {story.subtitle}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-1.5">
                      <span className="pixel-badge !text-[9px]">
                        {diffInfo.name}
                      </span>
                      <span className="font-pixel-body text-[10px] text-ink-tertiary flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(book.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* 成就展示 */}
        {collection.achievements.length > 0 && (
          <Panel variant="dark" padding="md">
            <h3 className="font-pixel-title text-xs text-brand-gold mb-3 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              获得的成就 ({collection.achievements.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {collection.achievements.map((achievementId) => (
                <span
                  key={achievementId}
                  className="pixel-badge-gold !text-[10px] !px-2 !py-1"
                >
                  <Trophy className="w-2.5 h-2.5 mr-0.5" />
                  {achievementId}
                </span>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {/* 详情弹窗 */}
      <Modal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        title="故事档案"
        icon={<Book className="w-4 h-4" />}
        size="xl"
      >
        {selectedBook && <StorybookDetailView book={selectedBook} />}
      </Modal>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
  borderColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  color: string;
  borderColor: string;
}) {
  return (
    <div
      className={cn(
        'bg-surface-raised border-[3px] shadow-pixel-sm',
        'p-3 sm:p-4 text-center',
        borderColor
      )}
    >
      <Icon className={cn('w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5', color)} />
      <p
        className={cn(
          'font-pixel-title text-xl sm:text-3xl tabular-nums',
          color
        )}
      >
        {value}
      </p>
      <p className="font-pixel-body text-[10px] sm:text-xs text-ink-tertiary uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}

function StorybookDetailView({ book }: { book: CollectedStorybook }) {
  const story = getStoryById(book.storyId);
  const [activeTab, setActiveTab] = useState<TabId>('story');

  if (!story) return null;
  const { storybook } = story;
  const ratingColor = getRatingColor(book.performance.rating);

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'story', label: '故事', icon: Scroll },
    { id: 'characters', label: '人物', icon: Users },
    { id: 'timeline', label: '时间线', icon: Calendar },
    { id: 'truth', label: '真相', icon: Star },
  ];

  return (
    <div className="space-y-4">
      {/* 表现评价 */}
      <Panel variant="overlay" padding="sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-pixel-title text-[10px] text-ink-tertiary uppercase tracking-wider">
              你的表现
            </p>
            <p className={cn('font-pixel-title text-3xl mt-1', ratingColor)}>
              {book.performance.rating}
            </p>
          </div>
          <div className="text-right font-pixel-body text-xs text-ink-tertiary space-y-0.5">
            <p>
              逻辑锁:{' '}
              <span className="text-ink-primary">
                {book.performance.locksFound} / {book.performance.totalLocks}
              </span>
            </p>
            <p>
              使用提示:{' '}
              <span className="text-ink-primary">
                {book.performance.hintsUsed}
              </span>
            </p>
            {book.performance.perfectCross && (
              <p className="text-game-green font-pixel-title">✓ 完美询问</p>
            )}
          </div>
        </div>
      </Panel>

      {/* 标签栏 */}
      <div className="flex gap-1 border-b-[3px] border-ink-line overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 shrink-0',
              'font-pixel-title text-xs uppercase tracking-wider',
              'border-b-[3px] -mb-[3px] transition-colors',
              activeTab === id
                ? 'text-brand-gold border-brand-gold'
                : 'text-ink-tertiary border-transparent hover:text-ink-primary'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* 标签内容 */}
      <div className="max-h-[50vh] overflow-y-auto touch-scroll">
        {activeTab === 'story' && (
          <div className="space-y-3">
            <p className="font-pixel-body text-base text-ink-secondary italic leading-relaxed">
              {storybook.fullNarrative}
            </p>
            {storybook.chapters.map((chapter, i) => (
              <Panel key={i} variant="overlay" padding="sm">
                <h4 className="font-pixel-title text-xs text-brand-gold mb-1.5 uppercase tracking-wider">
                  {chapter.title}
                </h4>
                <p className="font-pixel-body text-sm text-ink-primary leading-relaxed">
                  {chapter.content}
                </p>
              </Panel>
            ))}
          </div>
        )}

        {activeTab === 'characters' && (
          <div className="space-y-3">
            {storybook.characterProfiles.map((char, i) => (
              <Panel key={i} variant="overlay" padding="sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel-title text-sm text-brand-gold">
                    {char.name}
                  </span>
                  <span className="pixel-badge">{char.role}</span>
                </div>
                <p className="font-pixel-body text-sm text-ink-primary leading-relaxed mb-2">
                  {char.description}
                </p>
                <Panel variant="dark" padding="sm">
                  <p className="font-pixel-body text-sm text-game-green leading-relaxed">
                    <span className="text-brand-gold font-pixel-title text-xs mr-1">
                      揭示:
                    </span>
                    {char.secretRevealed}
                  </p>
                </Panel>
              </Panel>
            ))}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-1.5">
            {storybook.timeline.map((event, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-3 p-2.5 border-2',
                  event.isKeyEvent
                    ? 'border-game-yellow bg-game-yellow/10'
                    : 'border-ink-line bg-surface-overlay'
                )}
              >
                <span className="font-pixel-title text-xs text-brand-gold w-24 shrink-0 tabular-nums">
                  {event.time}
                </span>
                <span className="font-pixel-body text-sm text-ink-primary leading-relaxed">
                  {event.event}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'truth' && (
          <div className="space-y-3">
            <Panel variant="danger" padding="md">
              <h4 className="font-pixel-title text-xs text-game-red mb-2 uppercase tracking-wider">
                真相揭露
              </h4>
              <p className="font-pixel-body text-base text-ink-primary leading-relaxed">
                {storybook.truthReveal}
              </p>
            </Panel>
            <Panel variant="overlay" padding="md">
              <h4 className="font-pixel-title text-xs text-brand-gold mb-2 uppercase tracking-wider">
                后记
              </h4>
              <p className="font-pixel-body text-base text-ink-primary leading-relaxed">
                {storybook.epilogue}
              </p>
            </Panel>
          </div>
        )}
      </div>

      {/* 高光时刻 */}
      {book.highlights.length > 0 && (
        <Panel variant="overlay" padding="sm">
          <h4 className="font-pixel-title text-xs text-brand-gold mb-2 uppercase tracking-wider">
            ★ 你的高光时刻
          </h4>
          <div className="space-y-1">
            {book.highlights.map((h, i) => (
              <p
                key={i}
                className="font-pixel-body text-sm text-ink-primary flex items-start gap-1.5 leading-relaxed"
              >
                <span className="text-brand-gold">⚡</span>
                {h}
              </p>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
