/**
 * Lex Machina - 核心类型定义
 * 所有游戏数据结构的 TypeScript 类型
 */

// ============================================
// 游戏阶段枚举
// ============================================

export type GamePhase = 
  | 'menu'           // 主菜单
  | 'office'         // 事务所（选案）
  | 'investigation'  // 调查阶段
  | 'courtroom'      // 庭审阶段
  | 'verdict'        // 判决阶段
  | 'review'         // 复盘阶段
  | 'collection'     // 收藏界面
  | 'gm';            // GM开发者界面

// ============================================
// 案件相关类型
// ============================================

/** 案件难度 */
export type CaseDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

/** 案件类型 */
export type CaseType = 
  | 'theft'          // 盗窃
  | 'assault'        // 伤害
  | 'fraud'          // 欺诈
  | 'murder'         // 谋杀
  | 'corporate'      // 公司犯罪
  | 'cyber';         // 网络犯罪

/** 证据项 */
export interface Evidence {
  id: string;
  name: string;
  type: 'physical' | 'testimonial' | 'documentary' | 'digital';
  description: string;
  /** 证据的具体内容/细节 - 这是最重要的部分 */
  content: string;
  /** 是否包含与真相矛盾的信息 */
  hasContradiction: boolean;
  /** 矛盾说明（仅供AI裁判使用，玩家不可见） */
  contradictionHint?: string;
  /** 证据来源 */
  source: string;
  /** 是否已被玩家发现/解锁 */
  discovered: boolean;
  /** 是否为关键证据 */
  isKeyEvidence: boolean;
}

/** 证人 */
export interface Witness {
  id: string;
  name: string;
  role: string;  // 职业/身份
  age: number;
  personality: WitnessPersonality;
  appearance: string;  // 外貌描述（用于生成立绘）
  /** 证人的初始证词 */
  initialTestimony: string;
  /** 证人隐藏的秘密（与真相相关） */
  hiddenSecret: string;
  /** 证人的弱点/痛点 */
  weakPoints: string[];
  /** 与其他角色的关系 */
  relationships: Record<string, string>;
  /** 当前情绪状态 */
  currentEmotion: WitnessEmotion;
  /** 是否已经崩溃/坦白 */
  hasBroken: boolean;
}

/** 证人性格 */
export interface WitnessPersonality {
  /** 诚实度 0-100 */
  honesty: number;
  /** 情绪稳定性 0-100 */
  stability: number;
  /** 攻击性 0-100 */
  aggression: number;
  /** 智力 0-100 */
  intelligence: number;
  /** 性格特征标签 */
  traits: string[];
}

/** 证人情绪状态 */
export type WitnessEmotion = 
  | 'calm'      // 平静
  | 'confident' // 自信
  | 'nervous'   // 紧张
  | 'defensive' // 防御
  | 'angry'     // 愤怒
  | 'scared'    // 恐惧
  | 'broken';   // 崩溃

/** 逻辑锁 - 表面证据与真相的矛盾点 */
export interface LogicalLock {
  id: string;
  /** 表面陈述/证据 */
  surfaceClaim: string;
  /** 隐藏的真相 */
  hiddenTruth: string;
  /** 矛盾的类型 */
  contradictionType: 'time' | 'location' | 'physical' | 'motive' | 'testimony';
  /** 破解提示（调查阶段购买） */
  hint: string;
  /** 是否已被玩家破解 */
  isBroken: boolean;
  /** 关联的证据ID */
  relatedEvidenceIds: string[];
  /** 关联的证人ID */
  relatedWitnessIds: string[];
}

/** 完整案件 */
export interface Case {
  id: string;
  title: string;
  type: CaseType;
  difficulty: CaseDifficulty;
  
  /** 表面案情（包含误导信息）- 玩家可见 */
  detailedBackground: string;
  /** 案件摘要 */
  summary: string;
  /** 被告信息 */
  defendant: {
    name: string;
    age: number;
    occupation: string;
    background: string;
  };
  
  /** 唯一客观真相 - 仅供AI裁判使用 */
  hiddenTruth: string;
  /** 真正的罪犯是谁（可能不是被告） */
  trueGuiltyParty: string;
  
  /** 证据列表 */
  evidence: Evidence[];
  /** 证人列表 */
  witnesses: Witness[];
  /** 逻辑锁列表 */
  logicalLocks: LogicalLock[];
  
  /** 检察官信息 */
  prosecutor: {
    name: string;
    personality: string;
    style: 'aggressive' | 'methodical' | 'theatrical' | 'cunning';
  };
  
  /** 奖励信息 */
  rewards: {
    baseXP: number;
    baseMoney: number;
    bonusConditions: Array<{
      condition: string;
      xpBonus: number;
      moneyBonus: number;
    }>;
  };
  
  /** 时间限制（可选，P2功能） */
  timeLimit?: number;
}

// ============================================
// 玩家相关类型
// ============================================

/** 律师等级 */
export type LawyerRank = 
  | 'intern'        // 实习律师
  | 'associate'     // 初级律师
  | 'senior'        // 资深律师
  | 'partner'       // 合伙人
  | 'legend';       // 传奇律师

/** 玩家统计数据 */
export interface PlayerStats {
  name: string;
  rank: LawyerRank;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  money: number;
  reputation: number;  // 0-100
  
  /** 历史战绩 */
  stats: {
    totalCases: number;
    casesWon: number;
    casesLost: number;
    perfectVictories: number;  // 完美胜利（无错误）
    currentWinStreak: number;
    bestWinStreak: number;
  };
  
  /** 成就 */
  achievements: Achievement[];
  
  /** 解锁的特殊能力 */
  abilities: PlayerAbility[];
}

/** 成就 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

/** 玩家能力 */
export interface PlayerAbility {
  id: string;
  name: string;
  description: string;
  /** 冷却时间（案件数） */
  cooldown: number;
  currentCooldown: number;
}

// ============================================
// 庭审相关类型
// ============================================

/** 庭审阶段 */
export type CourtroomPhase = 
  | 'opening'        // 开庭陈述
  | 'examination'    // 询问证人
  | 'cross'          // 交叉询问
  | 'evidence'       // 出示证据
  | 'objection'      // 反对
  | 'closing'        // 结案陈词
  | 'deliberation';  // 陪审团商议

/** 对话消息 */
export interface CourtroomMessage {
  id: string;
  timestamp: Date;
  speaker: 'player' | 'witness' | 'prosecutor' | 'judge' | 'system';
  speakerName: string;
  content: string;
  /** 情绪标记 */
  emotion?: WitnessEmotion;
  /** 是否为关键对话 */
  isKeyMoment: boolean;
  /** 对陪审团的影响 */
  juryImpact: number;  // -10 到 +10
}

/** 法官状态 */
export interface JudgeState {
  name: string;
  patience: number;  // 0-100, 耐心值
  warnings: number;  // 警告次数
  maxWarnings: number;
  mood: 'neutral' | 'pleased' | 'annoyed' | 'angry';
}

/** 陪审团成员 */
export interface JuryMember {
  id: number;
  /** 倾向性 -100(有罪) 到 +100(无罪) */
  sentiment: number;
  /** 当前表情 */
  expression: '😐' | '🤔' | '😠' | '😨' | '😌' | '👍' | '👎';
}

/** 庭审状态 */
export interface CourtroomState {
  phase: CourtroomPhase;
  currentWitnessId: string | null;
  messages: CourtroomMessage[];
  judge: JudgeState;
  jury: JuryMember[];
  /** 平均陪审团倾向 */
  averageJurySentiment: number;
  /** 玩家已使用的提示次数 */
  hintsUsed: number;
  /** 是否已提出结案 */
  closingRequested: boolean;
}

// ============================================
// 调查阶段类型
// ============================================

/** 线索等级 */
export type ClueLevel = 'basic' | 'advanced' | 'premium';

/** 可购买的线索 */
export interface PurchasableClue {
  id: string;
  level: ClueLevel;
  price: number;
  /** 线索预览（不透露具体内容） */
  preview: string;
  /** 实际内容（购买后可见） */
  content: string;
  /** 关联的逻辑锁ID */
  relatedLockId?: string;
  purchased: boolean;
}

/** 调查状态 */
export interface InvestigationState {
  availableClues: PurchasableClue[];
  purchasedClues: PurchasableClue[];
  /** 已花费的金钱 */
  moneySpent: number;
  /** 剩余调查时间（P2功能） */
  timeRemaining?: number;
}

// ============================================
// AI响应类型
// ============================================

/** AI生成的案件响应 */
export interface GeneratedCaseResponse {
  success: boolean;
  case?: Case;
  error?: string;
}

/** 庭审AI响应 */
export interface CourtroomAIResponse {
  /** 角色的回复 */
  response: string;
  /** 说话者 */
  speaker: 'witness' | 'prosecutor' | 'judge';
  /** 情绪变化 */
  emotionChange?: WitnessEmotion;
  /** 对陪审团的影响 */
  juryImpact: number;
  /** 法官耐心变化 */
  judgePatience: number;
  /** 是否触发了逻辑锁破解 */
  lockBroken?: string;
  /** 是否证人崩溃 */
  witnessBroken: boolean;
  /** 系统提示（给玩家的反馈） */
  systemHint?: string;
}

/** 判决结果 */
export interface VerdictResult {
  outcome: 'not_guilty' | 'guilty' | 'mistrial';
  /** 判决理由 */
  reasoning: string;
  /** 最终陪审团倾向 */
  finalJurySentiment: number;
  /** 奖励 */
  rewards: {
    xp: number;
    money: number;
    bonuses: string[];
  };
  /** 复盘分析 */
  review: {
    keyMoments: string[];
    mistakes: string[];
    improvements: string[];
    overallRating: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  };
}

// ============================================
// 存档相关类型
// ============================================

/** 游戏存档 */
export interface GameSave {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  player: PlayerStats;
  /** 当前进行中的案件（如果有） */
  currentCase?: {
    case: Case;
    investigation?: InvestigationState;
    courtroom?: CourtroomState;
    phase: GamePhase;
  };
  /** 设置 */
  settings: GameSettings;
}

/** 游戏设置 */
export interface GameSettings {
  /** 音效开关 */
  soundEnabled: boolean;
  /** 音乐开关 */
  musicEnabled: boolean;
  /** 扫描线效果 */
  scanlineEffect: boolean;
  /** 文字速度 */
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  /** 自动保存 */
  autoSave: boolean;
  /** 语言 */
  language: 'zh-CN' | 'en-US';
}

// ============================================
// 工具类型
// ============================================

/** 深度只读 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** 可选部分字段 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

