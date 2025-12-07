/**
 * Lex Machina - 游戏常量
 */

// ============================================
// 游戏数值常量
// ============================================

export const GAME_CONSTANTS = {
  /** 默认法官名称 */
  DEFAULT_JUDGE_NAME: '王法官',
  /** 购买提示的费用 */
  HINT_COST: 100,
  /** 陪审团人数 */
  JURY_COUNT: 12,
  /** 最大警告次数 */
  MAX_WARNINGS: 3,
  /** 初始耐心值 */
  INITIAL_PATIENCE: 100,
  /** 初始金钱 */
  INITIAL_MONEY: 500,
  /** 初始声望 */
  INITIAL_REPUTATION: 50,
  /** 初始经验值 */
  INITIAL_XP_TO_NEXT_LEVEL: 100,
} as const;

// ============================================
// 难度解锁等级
// ============================================

export const DIFFICULTY_UNLOCK_LEVELS = {
  easy: 1,
  medium: 3,
  hard: 6,
  legendary: 10,
} as const;

// ============================================
// 文本映射
// ============================================

/** 检察官风格名称映射 */
export const PROSECUTOR_STYLE_NAMES: Record<string, string> = {
  aggressive: '咄咄逼人',
  methodical: '条理分明',
  theatrical: '戏剧夸张',
  cunning: '老谋深算',
};

/** 案件类型名称映射 */
export const CASE_TYPE_NAMES: Record<string, string> = {
  theft: '盗窃案',
  assault: '伤害案',
  fraud: '欺诈案',
  murder: '谋杀案',
  corporate: '公司犯罪',
  cyber: '网络犯罪',
};

/** 证人情绪名称映射 */
export const WITNESS_EMOTION_NAMES: Record<string, { text: string; color: string }> = {
  calm: { text: '平静', color: 'text-pixel-blue' },
  confident: { text: '自信', color: 'text-pixel-green' },
  nervous: { text: '紧张', color: 'text-yellow-400' },
  defensive: { text: '防御', color: 'text-orange-400' },
  angry: { text: '愤怒', color: 'text-pixel-red' },
  scared: { text: '恐惧', color: 'text-purple-400' },
  broken: { text: '崩溃', color: 'text-pixel-red animate-pulse' },
};

/** 线索等级名称映射 */
export const CLUE_LEVEL_NAMES: Record<string, string> = {
  basic: '基础线索',
  advanced: '进阶线索',
  premium: '高级线索',
};

/** 线索等级短名称映射 */
export const CLUE_LEVEL_SHORT_NAMES: Record<string, string> = {
  basic: '基础',
  advanced: '进阶',
  premium: '高级',
};

/** 判决评级颜色映射 */
export const RATING_COLORS: Record<string, string> = {
  S: 'text-yellow-400',
  A: 'text-pixel-green',
  B: 'text-blue-400',
  C: 'text-pixel-light',
  D: 'text-orange-400',
  F: 'text-pixel-red',
};

// ============================================
// 工具函数
// ============================================

/**
 * 获取检察官风格的中文名称
 */
export function getProsecutorStyleName(style: string): string {
  return PROSECUTOR_STYLE_NAMES[style] || style;
}

/**
 * 获取案件类型的中文名称
 */
export function getCaseTypeName(type: string): string {
  return CASE_TYPE_NAMES[type] || type;
}

/**
 * 获取证人情绪显示信息
 */
export function getEmotionDisplay(emotion: string): { text: string; color: string } {
  return WITNESS_EMOTION_NAMES[emotion] || WITNESS_EMOTION_NAMES.calm;
}

/**
 * 获取线索等级名称
 */
export function getClueLevelName(level: string): string {
  return CLUE_LEVEL_NAMES[level] || level;
}

/**
 * 获取线索等级短名称
 */
export function getClueLevelShortName(level: string): string {
  return CLUE_LEVEL_SHORT_NAMES[level] || level;
}

/**
 * 获取评级颜色
 */
export function getRatingColor(rating: string): string {
  return RATING_COLORS[rating] || 'text-pixel-light';
}

