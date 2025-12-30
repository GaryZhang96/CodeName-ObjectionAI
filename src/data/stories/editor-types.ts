/**
 * Lex Machina - UGC故事编辑器类型定义
 * 
 * 用于玩家自定义故事创作系统
 */

import type {
  CaseCategory,
  CourtType,
  DetailedCaseType,
  StoryDifficulty,
  PresetEvidence,
  PresetWitness,
  PresetLogicalLock,
} from './types';

// ============================================
// 编辑器状态
// ============================================

/**
 * 编辑器模式
 */
export type EditorMode = 
  | 'basic'        // 基础信息编辑
  | 'evidence'     // 证据编辑
  | 'witnesses'    // 证人编辑
  | 'characters'   // 角色人设（检察官、法官）
  | 'locks'        // 逻辑锁编辑
  | 'preview'      // 预览模式
  | 'ai_assist';   // AI辅助生成

/**
 * 编辑中的故事草稿
 */
export interface StoryDraft {
  /** 唯一ID */
  id: string;
  /** 创建时间 */
  createdAt: Date;
  /** 最后修改时间 */
  updatedAt: Date;
  /** 是否完成（可以游玩） */
  isComplete: boolean;
  /** 验证状态 */
  validationStatus: ValidationStatus;
  
  // ====== 基础信息 ======
  /** 故事标题 */
  title: string;
  /** 副标题/案件编号 */
  subtitle: string;
  /** 难度 */
  difficulty: StoryDifficulty;
  /** 案件大类 */
  category: CaseCategory;
  /** 详细类型 */
  detailedType: DetailedCaseType;
  /** 法庭类型 */
  courtType: CourtType;
  /** 是否需要陪审团 */
  requiresJury: boolean;
  
  // ====== 故事内容 ======
  /** 案情摘要（玩家可见） */
  summary: string;
  /** 详细背景 */
  detailedBackground: string;
  /** 隐藏真相 */
  hiddenTruth: string;
  /** 真正的罪犯 */
  trueGuiltyParty: string;
  
  // ====== 被告信息 ======
  defendant: DefendantConfig;
  
  // ====== 角色配置 ======
  /** 检察官配置 */
  prosecutor: ProsecutorConfig;
  /** 法官配置 */
  judge: JudgeConfig;
  
  // ====== 游戏元素 ======
  /** 证据列表 */
  evidence: EditableEvidence[];
  /** 证人列表 */
  witnesses: EditableWitness[];
  /** 逻辑锁列表 */
  logicalLocks: EditableLogicalLock[];
  
  // ====== 奖励配置 ======
  rewards: RewardConfig;
  
  // ====== 元数据 ======
  /** 作者名称 */
  author: string;
  /** 标签 */
  tags: string[];
  /** 描述/备注 */
  notes: string;
}

/**
 * 验证状态
 */
export interface ValidationStatus {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning';
}

// ============================================
// 角色配置
// ============================================

/**
 * 被告配置
 */
export interface DefendantConfig {
  name: string;
  age: number;
  occupation: string;
  background: string;
  /** 外貌描述 */
  appearance: string;
  /** 是否真正有罪 */
  isActuallyGuilty: boolean;
}

/**
 * 检察官配置
 */
export interface ProsecutorConfig {
  name: string;
  /** 年龄 */
  age: number;
  /** 外貌描述 */
  appearance: string;
  /** 性格描述 */
  personality: string;
  /** 诉讼风格 */
  style: 'aggressive' | 'methodical' | 'theatrical' | 'cunning';
  /** 背景故事 */
  backstory: string;
  /** 口头禅 */
  catchphrase: string;
  /** 弱点 */
  weakness: string;
  /** 与被告的关系 */
  relationToCase: string;
}

/**
 * 法官配置
 */
export interface JudgeConfig {
  name: string;
  /** 年龄 */
  age: number;
  /** 外貌描述 */
  appearance: string;
  /** 性格描述 */
  personality: string;
  /** 严厉程度 1-10 */
  strictness: number;
  /** 审判风格 */
  style: 'lenient' | 'strict' | 'by_the_book' | 'unpredictable';
  /** 特殊偏好 */
  preferences: string;
  /** 背景故事 */
  backstory: string;
}

// ============================================
// 可编辑的游戏元素
// ============================================

/**
 * 可编辑的证据
 */
export interface EditableEvidence extends Omit<PresetEvidence, 'id'> {
  id: string;
  /** 是否锁定（AI生成后锁定） */
  isLocked: boolean;
  /** 编辑备注 */
  editNotes: string;
}

/**
 * 可编辑的证人
 */
export interface EditableWitness extends Omit<PresetWitness, 'id'> {
  id: string;
  /** 是否锁定 */
  isLocked: boolean;
  /** 编辑备注 */
  editNotes: string;
  /** 证人与案件的关系 */
  relationToCase: string;
  /** 作证动机 */
  motivation: string;
}

/**
 * 可编辑的逻辑锁
 */
export interface EditableLogicalLock extends Omit<PresetLogicalLock, 'id'> {
  id: string;
  /** 是否锁定 */
  isLocked: boolean;
  /** 编辑备注 */
  editNotes: string;
  /** 难度评估 */
  difficultyRating: 1 | 2 | 3 | 4 | 5;
}

/**
 * 奖励配置
 */
export interface RewardConfig {
  baseXP: number;
  baseMoney: number;
  bonusConditions: BonusCondition[];
}

export interface BonusCondition {
  id: string;
  condition: string;
  xpBonus: number;
  moneyBonus: number;
}

// ============================================
// AI辅助生成
// ============================================

/**
 * AI生成请求
 */
export interface AIGenerationRequest {
  type: AIGenerationType;
  context: Partial<StoryDraft>;
  specificPrompt?: string;
}

export type AIGenerationType = 
  | 'full_story'        // 生成完整故事
  | 'story_outline'     // 生成故事大纲
  | 'evidence'          // 生成证据
  | 'witness'           // 生成证人
  | 'logical_lock'      // 生成逻辑锁
  | 'prosecutor'        // 生成检察官
  | 'judge'             // 生成法官
  | 'polish'            // 润色文本
  | 'contradiction';    // 生成矛盾点

/**
 * AI生成响应
 */
export interface AIGenerationResponse {
  success: boolean;
  data?: Partial<StoryDraft>;
  error?: string;
  suggestions?: string[];
}

// ============================================
// 编辑器操作历史
// ============================================

/**
 * 编辑操作类型
 */
export type EditAction = 
  | { type: 'UPDATE_BASIC'; payload: Partial<StoryDraft> }
  | { type: 'ADD_EVIDENCE'; payload: EditableEvidence }
  | { type: 'UPDATE_EVIDENCE'; payload: { id: string; updates: Partial<EditableEvidence> } }
  | { type: 'DELETE_EVIDENCE'; payload: string }
  | { type: 'ADD_WITNESS'; payload: EditableWitness }
  | { type: 'UPDATE_WITNESS'; payload: { id: string; updates: Partial<EditableWitness> } }
  | { type: 'DELETE_WITNESS'; payload: string }
  | { type: 'ADD_LOCK'; payload: EditableLogicalLock }
  | { type: 'UPDATE_LOCK'; payload: { id: string; updates: Partial<EditableLogicalLock> } }
  | { type: 'DELETE_LOCK'; payload: string }
  | { type: 'UPDATE_PROSECUTOR'; payload: Partial<ProsecutorConfig> }
  | { type: 'UPDATE_JUDGE'; payload: Partial<JudgeConfig> }
  | { type: 'UPDATE_DEFENDANT'; payload: Partial<DefendantConfig> }
  | { type: 'AI_GENERATE'; payload: Partial<StoryDraft> }
  | { type: 'IMPORT'; payload: StoryDraft }
  | { type: 'RESET'; payload: null };

/**
 * 历史记录项
 */
export interface HistoryEntry {
  timestamp: Date;
  action: EditAction;
  previousState: Partial<StoryDraft>;
}

// ============================================
// 导出/导入
// ============================================

/**
 * 可导出的故事格式
 */
export interface ExportableStory {
  version: string;
  exportedAt: string;
  story: StoryDraft;
  checksum: string;
}

// ============================================
// 默认值
// ============================================

export const DEFAULT_DEFENDANT: DefendantConfig = {
  name: '',
  age: 30,
  occupation: '',
  background: '',
  appearance: '',
  isActuallyGuilty: false,
};

export const DEFAULT_PROSECUTOR: ProsecutorConfig = {
  name: '',
  age: 35,
  appearance: '',
  personality: '',
  style: 'methodical',
  backstory: '',
  catchphrase: '',
  weakness: '',
  relationToCase: '',
};

export const DEFAULT_JUDGE: JudgeConfig = {
  name: '',
  age: 55,
  appearance: '',
  personality: '',
  strictness: 5,
  style: 'by_the_book',
  preferences: '',
  backstory: '',
};

export const DEFAULT_REWARDS: RewardConfig = {
  baseXP: 100,
  baseMoney: 200,
  bonusConditions: [],
};

/**
 * 创建空白故事草稿
 */
export function createEmptyDraft(author: string = '匿名'): StoryDraft {
  const now = new Date();
  return {
    id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    isComplete: false,
    validationStatus: {
      isValid: false,
      errors: [],
      warnings: [],
    },
    title: '',
    subtitle: '',
    difficulty: 'beginner',
    category: 'criminal',
    detailedType: 'petty_theft',
    courtType: 'municipal',
    requiresJury: false,
    summary: '',
    detailedBackground: '',
    hiddenTruth: '',
    trueGuiltyParty: '',
    defendant: { ...DEFAULT_DEFENDANT },
    prosecutor: { ...DEFAULT_PROSECUTOR },
    judge: { ...DEFAULT_JUDGE },
    evidence: [],
    witnesses: [],
    logicalLocks: [],
    rewards: { ...DEFAULT_REWARDS },
    author,
    tags: [],
    notes: '',
  };
}


