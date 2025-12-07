/**
 * 故事系统导出
 */

export * from './types';
export { PRESET_STORIES } from './preset-stories';
export { PRESET_STORIES_PART2 } from './preset-stories-part2';

import { PRESET_STORIES } from './preset-stories';
import { PRESET_STORIES_PART2 } from './preset-stories-part2';
import type { PresetStory, StoryDifficulty, DetailedCaseType } from './types';
import { DIFFICULTY_INFO, CASE_TYPE_INFO } from './types';

/**
 * 所有预设故事合并
 */
export const ALL_PRESET_STORIES: PresetStory[] = [
  ...PRESET_STORIES,
  ...PRESET_STORIES_PART2,
];

/**
 * 按难度分组的故事
 */
export const STORIES_BY_DIFFICULTY: Record<StoryDifficulty, PresetStory[]> = {
  tutorial: ALL_PRESET_STORIES.filter(s => s.difficulty === 'tutorial'),
  beginner: ALL_PRESET_STORIES.filter(s => s.difficulty === 'beginner'),
  intermediate: ALL_PRESET_STORIES.filter(s => s.difficulty === 'intermediate'),
  advanced: ALL_PRESET_STORIES.filter(s => s.difficulty === 'advanced'),
  expert: ALL_PRESET_STORIES.filter(s => s.difficulty === 'expert'),
  legendary: ALL_PRESET_STORIES.filter(s => s.difficulty === 'legendary'),
};

/**
 * 获取故事章节目录
 */
export function getStoryChapters(): Array<{
  chapter: number;
  title: string;
  difficulty: StoryDifficulty;
  stories: PresetStory[];
}> {
  return [
    {
      chapter: 1,
      title: '第一章：新手上路',
      difficulty: 'tutorial',
      stories: ALL_PRESET_STORIES.filter(s => s.chapter === 1),
    },
    {
      chapter: 2,
      title: '第二章：初入法庭',
      difficulty: 'beginner',
      stories: ALL_PRESET_STORIES.filter(s => s.chapter === 2),
    },
    {
      chapter: 3,
      title: '第三章：锋芒初露',
      difficulty: 'intermediate',
      stories: ALL_PRESET_STORIES.filter(s => s.chapter === 3),
    },
    {
      chapter: 4,
      title: '第四章：波谲云诡',
      difficulty: 'advanced',
      stories: ALL_PRESET_STORIES.filter(s => s.chapter === 4),
    },
    {
      chapter: 5,
      title: '第五章：真假难辨',
      difficulty: 'expert',
      stories: ALL_PRESET_STORIES.filter(s => s.chapter === 5),
    },
    {
      chapter: 6,
      title: '第六章：传奇之路',
      difficulty: 'legendary',
      stories: ALL_PRESET_STORIES.filter(s => s.chapter === 6),
    },
  ];
}

/**
 * 根据ID获取故事
 */
export function getStoryById(id: string): PresetStory | undefined {
  return ALL_PRESET_STORIES.find(s => s.id === id);
}

/**
 * 检查故事是否解锁
 */
export function isStoryUnlocked(
  storyId: string,
  playerLevel: number,
  completedStories: string[],
  totalWins: number
): boolean {
  const story = getStoryById(storyId);
  if (!story) return false;

  const { requiredLevel, requiredStories, requiredWins } = story.unlockCondition;

  // 检查等级
  if (playerLevel < requiredLevel) return false;

  // 检查前置故事
  if (!requiredStories.every(id => completedStories.includes(id))) return false;

  // 检查胜场数
  if (totalWins < requiredWins) return false;

  return true;
}

/**
 * 获取玩家可用的故事
 */
export function getAvailableStories(
  playerLevel: number,
  completedStories: string[],
  totalWins: number
): PresetStory[] {
  return ALL_PRESET_STORIES.filter(story =>
    isStoryUnlocked(story.id, playerLevel, completedStories, totalWins) &&
    !completedStories.includes(story.id)
  );
}

/**
 * 获取下一个推荐故事
 */
export function getNextRecommendedStory(
  playerLevel: number,
  completedStories: string[],
  totalWins: number
): PresetStory | null {
  const available = getAvailableStories(playerLevel, completedStories, totalWins);
  if (available.length === 0) return null;

  // 优先推荐主线故事（按chapter和order排序）
  available.sort((a, b) => {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.order - b.order;
  });

  return available[0];
}

/**
 * 将预设故事转换为游戏可用的Case格式
 */
export function convertStoryToCase(story: PresetStory) {
  const { caseData, difficulty, requiresJury } = story;
  
  // 映射难度到原有格式
  const difficultyMap: Record<StoryDifficulty, 'easy' | 'medium' | 'hard' | 'legendary'> = {
    tutorial: 'easy',
    beginner: 'easy',
    intermediate: 'medium',
    advanced: 'hard',
    expert: 'hard',
    legendary: 'legendary',
  };

  return {
    id: story.id,
    title: story.title,
    type: story.detailedType as any,
    difficulty: difficultyMap[difficulty],
    summary: caseData.summary,
    detailedBackground: caseData.detailedBackground,
    hiddenTruth: caseData.hiddenTruth,
    trueGuiltyParty: caseData.trueGuiltyParty,
    defendant: caseData.defendant,
    prosecutor: caseData.prosecutor,
    evidence: caseData.evidence.map(e => ({
      ...e,
      discovered: e.discovered,
    })),
    witnesses: caseData.witnesses.map(w => ({
      ...w,
      currentEmotion: 'calm' as const,
      hasBroken: false,
    })),
    logicalLocks: caseData.logicalLocks.map(l => ({
      ...l,
      isBroken: false,
    })),
    rewards: caseData.rewards,
    // 扩展字段
    requiresJury,
    courtType: story.courtType,
    storyId: story.id,
  };
}

/**
 * 获取难度信息
 */
export function getStoryDifficultyInfo(difficulty: StoryDifficulty) {
  return DIFFICULTY_INFO[difficulty];
}

/**
 * 获取案件类型信息
 */
export function getCaseTypeInfo(type: DetailedCaseType) {
  return CASE_TYPE_INFO[type];
}

