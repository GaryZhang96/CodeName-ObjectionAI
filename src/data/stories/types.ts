/**
 * Lex Machina - 故事系统类型定义
 * 
 * 基于美国司法体系的案件分类
 */

// ============================================
// 美国司法体系案件分类
// ============================================

/**
 * 法庭类型
 * - small_claims: 小额法庭 (只需法官)
 * - municipal: 市政法庭/轻罪法庭 (可选择法官或陪审团)
 * - superior: 高等法院 (重罪，有陪审团权利)
 * - federal: 联邦法院 (跨州/联邦犯罪)
 */
export type CourtType = 'small_claims' | 'municipal' | 'superior' | 'federal';

/**
 * 案件大类
 * - civil: 民事案件 (个人/公司纠纷)
 * - criminal: 刑事案件 (政府起诉犯罪)
 */
export type CaseCategory = 'civil' | 'criminal';

/**
 * 刑事案件严重程度
 * - infraction: 违规 (交通罚单等，通常只罚款)
 * - misdemeanor: 轻罪 (最高1年监禁)
 * - felony: 重罪 (1年以上监禁)
 */
export type CriminalSeverity = 'infraction' | 'misdemeanor' | 'felony';

/**
 * 详细案件类型 - 按美国法律分类
 */
export type DetailedCaseType = 
  // 民事案件
  | 'contract_dispute'      // 合同纠纷
  | 'personal_injury'       // 人身伤害
  | 'property_dispute'      // 财产纠纷
  | 'employment'            // 雇佣纠纷
  | 'medical_malpractice'   // 医疗事故
  
  // 轻罪
  | 'petty_theft'           // 小额盗窃 (<$950)
  | 'simple_assault'        // 简单袭击
  | 'vandalism'             // 故意破坏
  | 'dui'                   // 酒驾
  | 'trespassing'           // 非法侵入
  
  // 重罪
  | 'grand_theft'           // 大额盗窃
  | 'burglary'              // 入室盗窃
  | 'robbery'               // 抢劫
  | 'aggravated_assault'    // 严重伤害
  | 'fraud'                 // 欺诈
  | 'drug_trafficking'      // 毒品贩运
  | 'arson'                 // 纵火
  
  // 最严重犯罪
  | 'voluntary_manslaughter'  // 故意杀人(激情)
  | 'involuntary_manslaughter' // 过失杀人
  | 'second_degree_murder'   // 二级谋杀
  | 'first_degree_murder'    // 一级谋杀(预谋)
  | 'corporate_crime';       // 公司犯罪

/**
 * 案件难度等级
 */
export type StoryDifficulty = 
  | 'tutorial'    // 教程级 - 学习基础
  | 'beginner'    // 新手级 - 简单案件
  | 'intermediate' // 中级 - 需要技巧
  | 'advanced'    // 高级 - 复杂推理
  | 'expert'      // 专家级 - 多重反转
  | 'legendary';  // 传奇级 - 极限挑战

// ============================================
// 故事结构
// ============================================

/**
 * 预设故事 - 完整的游戏案件
 */
export interface PresetStory {
  /** 唯一ID */
  id: string;
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
  /** 故事封面描述（用于生成封面） */
  coverDescription: string;
  /** 章节/难度系列 */
  chapter: number;
  /** 系列内顺序 */
  order: number;
  /** 解锁条件 */
  unlockCondition: StoryUnlockCondition;
  /** 完整案件数据 */
  caseData: PresetCaseData;
  /** 故事书数据（完成后解锁） */
  storybook: StorybookData;
}

/**
 * 解锁条件
 */
export interface StoryUnlockCondition {
  /** 需要的玩家等级 */
  requiredLevel: number;
  /** 需要先完成的故事ID列表 */
  requiredStories: string[];
  /** 需要的总胜场数 */
  requiredWins: number;
}

/**
 * 预设案件数据
 */
export interface PresetCaseData {
  /** 案情摘要 */
  summary: string;
  /** 详细背景 */
  detailedBackground: string;
  /** 隐藏真相 */
  hiddenTruth: string;
  /** 真正的罪犯 */
  trueGuiltyParty: string;
  /** 被告信息 */
  defendant: {
    name: string;
    age: number;
    occupation: string;
    background: string;
    portrait?: string;
  };
  /** 检察官信息 */
  prosecutor: {
    name: string;
    personality: string;
    style: 'aggressive' | 'methodical' | 'theatrical' | 'cunning';
    portrait?: string;
  };
  /** 法官信息（小额法庭/轻罪） */
  judge?: {
    name: string;
    personality: string;
    strictness: number; // 1-10
  };
  /** 证据列表 */
  evidence: PresetEvidence[];
  /** 证人列表 */
  witnesses: PresetWitness[];
  /** 逻辑锁列表 */
  logicalLocks: PresetLogicalLock[];
  /** 奖励 */
  rewards: {
    baseXP: number;
    baseMoney: number;
    bonusConditions: Array<{
      condition: string;
      xpBonus: number;
      moneyBonus: number;
    }>;
    /** 特殊成就 */
    achievement?: {
      id: string;
      name: string;
      description: string;
    };
  };
}

/**
 * 预设证据
 */
export interface PresetEvidence {
  id: string;
  name: string;
  type: 'physical' | 'testimonial' | 'documentary' | 'digital';
  description: string;
  content: string;
  hasContradiction: boolean;
  contradictionHint?: string;
  source: string;
  discovered: boolean;
  isKeyEvidence: boolean;
  /** 证据图片描述 */
  imageDescription?: string;
}

/**
 * 预设证人
 */
export interface PresetWitness {
  id: string;
  name: string;
  role: string;
  age: number;
  personality: {
    honesty: number;
    stability: number;
    aggression: number;
    intelligence: number;
    traits: string[];
  };
  appearance: string;
  initialTestimony: string;
  hiddenSecret: string;
  weakPoints: string[];
  relationships: Record<string, string>;
  /** 立绘描述 */
  portraitDescription?: string;
}

/**
 * 预设逻辑锁
 */
export interface PresetLogicalLock {
  id: string;
  surfaceClaim: string;
  hiddenTruth: string;
  contradictionType: 'time' | 'location' | 'physical' | 'motive' | 'testimony';
  hint: string;
  relatedEvidenceIds: string[];
  relatedWitnessIds: string[];
  /** 破解时的特殊对话 */
  breakDialogue?: string;
}

// ============================================
// 故事书/收藏系统
// ============================================

/**
 * 故事书数据 - 完成案件后解锁
 */
export interface StorybookData {
  /** 完整故事叙述 */
  fullNarrative: string;
  /** 章节列表 */
  chapters: StorybookChapter[];
  /** 角色档案 */
  characterProfiles: CharacterProfile[];
  /** 时间线 */
  timeline: TimelineEvent[];
  /** 真相揭露 */
  truthReveal: string;
  /** 后记/案件影响 */
  epilogue: string;
}

/**
 * 故事书章节
 */
export interface StorybookChapter {
  title: string;
  content: string;
  illustration?: string;
}

/**
 * 角色档案
 */
export interface CharacterProfile {
  name: string;
  role: string;
  description: string;
  secretRevealed: string;
  portrait?: string;
}

/**
 * 时间线事件
 */
export interface TimelineEvent {
  time: string;
  event: string;
  isKeyEvent: boolean;
}

// ============================================
// 玩家收藏
// ============================================

/**
 * 玩家收藏的故事书
 */
export interface CollectedStorybook {
  storyId: string;
  completedAt: Date;
  /** 玩家的庭审表现 */
  performance: {
    rating: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
    locksFound: number;
    totalLocks: number;
    hintsUsed: number;
    perfectCross: boolean; // 完美交叉询问
  };
  /** 玩家的关键时刻记录 */
  highlights: string[];
  /** 是否解锁隐藏内容 */
  hiddenContentUnlocked: boolean;
}

/**
 * 玩家收藏库
 */
export interface PlayerCollection {
  /** 已收藏的故事书 */
  storybooks: CollectedStorybook[];
  /** 获得的成就 */
  achievements: string[];
  /** 统计数据 */
  stats: {
    totalStoriesCompleted: number;
    perfectRatings: number;
    totalPlayTime: number;
  };
}

// ============================================
// 案件类型信息
// ============================================

/**
 * 获取案件类型的详细信息
 */
export const CASE_TYPE_INFO: Record<DetailedCaseType, {
  name: string;
  category: CaseCategory;
  severity?: CriminalSeverity;
  courtType: CourtType;
  requiresJury: boolean;
  description: string;
  maxPenalty: string;
}> = {
  // 民事案件
  contract_dispute: {
    name: '合同纠纷',
    category: 'civil',
    courtType: 'small_claims',
    requiresJury: false,
    description: '涉及合同违约或解释争议的民事案件',
    maxPenalty: '赔偿损失',
  },
  personal_injury: {
    name: '人身伤害',
    category: 'civil',
    courtType: 'superior',
    requiresJury: true,
    description: '因他人过失导致人身伤害的赔偿案件',
    maxPenalty: '高额赔偿',
  },
  property_dispute: {
    name: '财产纠纷',
    category: 'civil',
    courtType: 'small_claims',
    requiresJury: false,
    description: '涉及财产归属或损害的民事案件',
    maxPenalty: '赔偿/归还',
  },
  employment: {
    name: '雇佣纠纷',
    category: 'civil',
    courtType: 'superior',
    requiresJury: true,
    description: '涉及不当解雇、歧视等劳动争议',
    maxPenalty: '赔偿/复职',
  },
  medical_malpractice: {
    name: '医疗事故',
    category: 'civil',
    courtType: 'superior',
    requiresJury: true,
    description: '医疗人员因疏忽造成患者伤害',
    maxPenalty: '高额赔偿',
  },

  // 轻罪
  petty_theft: {
    name: '小额盗窃',
    category: 'criminal',
    severity: 'misdemeanor',
    courtType: 'municipal',
    requiresJury: false,
    description: '盗窃价值低于$950的财物',
    maxPenalty: '6个月监禁',
  },
  simple_assault: {
    name: '简单袭击',
    category: 'criminal',
    severity: 'misdemeanor',
    courtType: 'municipal',
    requiresJury: false,
    description: '造成轻微伤害或威胁伤害的行为',
    maxPenalty: '1年监禁',
  },
  vandalism: {
    name: '故意破坏',
    category: 'criminal',
    severity: 'misdemeanor',
    courtType: 'municipal',
    requiresJury: false,
    description: '故意损坏他人财物',
    maxPenalty: '1年监禁',
  },
  dui: {
    name: '酒驾',
    category: 'criminal',
    severity: 'misdemeanor',
    courtType: 'municipal',
    requiresJury: false,
    description: '醉酒或药物影响下驾驶',
    maxPenalty: '6个月监禁',
  },
  trespassing: {
    name: '非法侵入',
    category: 'criminal',
    severity: 'misdemeanor',
    courtType: 'municipal',
    requiresJury: false,
    description: '未经许可进入他人财产',
    maxPenalty: '6个月监禁',
  },

  // 重罪
  grand_theft: {
    name: '大额盗窃',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '盗窃价值超过$950的财物',
    maxPenalty: '3年监禁',
  },
  burglary: {
    name: '入室盗窃',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '非法进入建筑物实施犯罪',
    maxPenalty: '6年监禁',
  },
  robbery: {
    name: '抢劫',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '使用暴力或威胁取得他人财物',
    maxPenalty: '9年监禁',
  },
  aggravated_assault: {
    name: '严重伤害',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '使用致命武器或造成严重伤害',
    maxPenalty: '4年监禁',
  },
  fraud: {
    name: '欺诈',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '通过欺骗手段获取钱财',
    maxPenalty: '5年监禁',
  },
  drug_trafficking: {
    name: '毒品贩运',
    category: 'criminal',
    severity: 'felony',
    courtType: 'federal',
    requiresJury: true,
    description: '制造、运输或销售受控物质',
    maxPenalty: '终身监禁',
  },
  arson: {
    name: '纵火',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '故意放火烧毁建筑或财产',
    maxPenalty: '9年监禁',
  },

  // 最严重犯罪
  voluntary_manslaughter: {
    name: '故意杀人(激情)',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '在激情状态下故意杀人',
    maxPenalty: '11年监禁',
  },
  involuntary_manslaughter: {
    name: '过失杀人',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '因疏忽或鲁莽导致他人死亡',
    maxPenalty: '4年监禁',
  },
  second_degree_murder: {
    name: '二级谋杀',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '故意杀人但无预谋',
    maxPenalty: '终身监禁',
  },
  first_degree_murder: {
    name: '一级谋杀',
    category: 'criminal',
    severity: 'felony',
    courtType: 'superior',
    requiresJury: true,
    description: '有预谋的故意杀人',
    maxPenalty: '死刑/终身监禁',
  },
  corporate_crime: {
    name: '公司犯罪',
    category: 'criminal',
    severity: 'felony',
    courtType: 'federal',
    requiresJury: true,
    description: '公司或高管的金融/环境犯罪',
    maxPenalty: '20年监禁',
  },
};

/**
 * 难度信息
 */
export const DIFFICULTY_INFO: Record<StoryDifficulty, {
  name: string;
  description: string;
  color: string;
  requiredLevel: number;
  xpMultiplier: number;
}> = {
  tutorial: {
    name: '教程',
    description: '学习基础操作和庭审流程',
    color: 'text-gray-400',
    requiredLevel: 1,
    xpMultiplier: 0.5,
  },
  beginner: {
    name: '新手',
    description: '简单案件，矛盾点明显',
    color: 'text-green-400',
    requiredLevel: 1,
    xpMultiplier: 1,
  },
  intermediate: {
    name: '中级',
    description: '需要关联多个证据',
    color: 'text-blue-400',
    requiredLevel: 3,
    xpMultiplier: 1.5,
  },
  advanced: {
    name: '高级',
    description: '复杂推理，多重证人',
    color: 'text-yellow-400',
    requiredLevel: 5,
    xpMultiplier: 2,
  },
  expert: {
    name: '专家',
    description: '多层反转，高难度',
    color: 'text-orange-400',
    requiredLevel: 8,
    xpMultiplier: 2.5,
  },
  legendary: {
    name: '传奇',
    description: '极限挑战，考验一切',
    color: 'text-purple-400',
    requiredLevel: 10,
    xpMultiplier: 3,
  },
};

