import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名的工具函数
 * 使用 clsx 处理条件类名，使用 tailwind-merge 合并冲突的类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 格式化金钱显示
 */
export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * 计算升级所需经验
 */
export function calculateXPToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * 根据等级获取可用难度
 */
export function getAvailableDifficulties(level: number): string[] {
  const difficulties = ['easy'];
  if (level >= 3) difficulties.push('medium');
  if (level >= 6) difficulties.push('hard');
  if (level >= 10) difficulties.push('legendary');
  return difficulties;
}

/**
 * 获取难度的显示名称和颜色
 */
export function getDifficultyInfo(difficulty: string): { name: string; color: string; multiplier: number } {
  const info: Record<string, { name: string; color: string; multiplier: number }> = {
    easy: { name: '简单', color: 'text-green-400', multiplier: 1 },
    medium: { name: '普通', color: 'text-yellow-400', multiplier: 1.5 },
    hard: { name: '困难', color: 'text-orange-400', multiplier: 2 },
    legendary: { name: '传奇', color: 'text-purple-400', multiplier: 3 },
  };
  return info[difficulty] || info.easy;
}

/**
 * 获取律师等级名称
 */
export function getRankName(rank: string): string {
  const ranks: Record<string, string> = {
    intern: '实习律师',
    associate: '初级律师',
    senior: '资深律师',
    partner: '合伙人',
    legend: '传奇律师',
  };
  return ranks[rank] || '未知';
}

/**
 * 根据等级获取律师等级
 */
export function getLawyerRank(level: number): string {
  if (level >= 15) return 'legend';
  if (level >= 10) return 'partner';
  if (level >= 5) return 'senior';
  if (level >= 2) return 'associate';
  return 'intern';
}

/**
 * 获取陪审团表情
 */
export function getJuryExpression(sentiment: number): string {
  if (sentiment >= 60) return '👍';
  if (sentiment >= 30) return '😌';
  if (sentiment >= 0) return '🤔';
  if (sentiment >= -30) return '😐';
  if (sentiment >= -60) return '😠';
  return '👎';
}

/**
 * 随机选择数组中的元素
 */
export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 打乱数组顺序
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 限制数值范围
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 本地存储工具
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
};

