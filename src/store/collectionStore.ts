/**
 * Lex Machina - 收藏系统状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CollectedStorybook, PlayerCollection } from '@/data/stories/types';

interface CollectionState {
  collection: PlayerCollection;
  
  // Actions
  addStorybook: (storybook: CollectedStorybook) => void;
  hasStorybook: (storyId: string) => boolean;
  getStorybook: (storyId: string) => CollectedStorybook | undefined;
  addAchievement: (achievementId: string) => void;
  hasAchievement: (achievementId: string) => boolean;
  updateStats: (updates: Partial<PlayerCollection['stats']>) => void;
  getCompletedStoryIds: () => string[];
  resetCollection: () => void;
}

const createInitialCollection = (): PlayerCollection => ({
  storybooks: [],
  achievements: [],
  stats: {
    totalStoriesCompleted: 0,
    perfectRatings: 0,
    totalPlayTime: 0,
  },
});

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      collection: createInitialCollection(),

      addStorybook: (storybook) => {
        const { collection } = get();
        
        // 检查是否已存在
        if (collection.storybooks.some(s => s.storyId === storybook.storyId)) {
          // 更新现有记录（可能是更好的成绩）
          set({
            collection: {
              ...collection,
              storybooks: collection.storybooks.map(s =>
                s.storyId === storybook.storyId
                  ? {
                      ...s,
                      // 如果新成绩更好，更新评级
                      performance: getRatingValue(storybook.performance.rating) > getRatingValue(s.performance.rating)
                        ? storybook.performance
                        : s.performance,
                    }
                  : s
              ),
            },
          });
        } else {
          // 添加新记录
          set({
            collection: {
              ...collection,
              storybooks: [...collection.storybooks, storybook],
              stats: {
                ...collection.stats,
                totalStoriesCompleted: collection.stats.totalStoriesCompleted + 1,
                perfectRatings: storybook.performance.rating === 'S'
                  ? collection.stats.perfectRatings + 1
                  : collection.stats.perfectRatings,
              },
            },
          });
        }
      },

      hasStorybook: (storyId) => {
        return get().collection.storybooks.some(s => s.storyId === storyId);
      },

      getStorybook: (storyId) => {
        return get().collection.storybooks.find(s => s.storyId === storyId);
      },

      addAchievement: (achievementId) => {
        const { collection } = get();
        if (!collection.achievements.includes(achievementId)) {
          set({
            collection: {
              ...collection,
              achievements: [...collection.achievements, achievementId],
            },
          });
        }
      },

      hasAchievement: (achievementId) => {
        return get().collection.achievements.includes(achievementId);
      },

      updateStats: (updates) => {
        set((state) => ({
          collection: {
            ...state.collection,
            stats: {
              ...state.collection.stats,
              ...updates,
            },
          },
        }));
      },

      getCompletedStoryIds: () => {
        return get().collection.storybooks.map(s => s.storyId);
      },

      resetCollection: () => {
        set({ collection: createInitialCollection() });
      },
    }),
    {
      name: 'lex-machina-collection',
    }
  )
);

/**
 * 评级数值转换（用于比较）
 */
function getRatingValue(rating: string): number {
  const values: Record<string, number> = {
    'S': 6,
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 2,
    'F': 1,
  };
  return values[rating] || 0;
}

// 选择器
export const selectCollection = (state: CollectionState) => state.collection;
export const selectStorybooks = (state: CollectionState) => state.collection.storybooks;
export const selectAchievements = (state: CollectionState) => state.collection.achievements;

