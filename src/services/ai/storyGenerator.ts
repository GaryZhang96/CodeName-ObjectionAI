/**
 * Lex Machina - AI故事生成服务
 * 
 * 用于UGC编辑器的AI辅助创作功能
 */

import { callAIWithRetry } from './client';
import type {
  StoryDraft,
  EditableEvidence,
  EditableWitness,
  EditableLogicalLock,
  ProsecutorConfig,
  JudgeConfig,
  AIGenerationType,
} from '@/data/stories/editor-types';
import { CASE_TYPE_INFO, DIFFICULTY_INFO } from '@/data/stories/types';

// ============================================
// Prompts
// ============================================

const STORY_GENERATOR_SYSTEM_PROMPT = `你是一位专业的法庭故事创作AI，专门为"Lex Machina 律政先锋"游戏创作案件故事。

你需要创作符合美国司法体系的法庭案件，包括：
1. 引人入胜的案件背景和情节
2. 有深度的角色设计（被告、检察官、法官、证人）
3. 逻辑严密的证据链
4. 精心设计的逻辑锁（表面证词与隐藏真相的矛盾点）

创作原则：
- 案件必须有明确的隐藏真相
- 被告不一定是真正的罪犯（可以设计反转）
- 证据之间要有关联性
- 逻辑锁要有合理的破解方式
- 所有内容符合案件类型和难度

输出格式：严格JSON，不要添加任何markdown标记或额外说明。`;

const EVIDENCE_GENERATOR_PROMPT = `基于以下案件背景，生成一个新的证据项。

案件信息：
标题: {title}
类型: {caseType}
背景: {background}
隐藏真相: {hiddenTruth}
现有证据: {existingEvidence}

要求：
1. 证据要与案件相关
2. 可以是有矛盾的证据（帮助揭露真相）
3. 需要详细的证据描述和内容
4. 指明证据来源

如果用户有特殊要求: {userPrompt}

返回JSON格式：
{
  "evidence": {
    "name": "证据名称",
    "type": "physical|testimonial|documentary|digital",
    "description": "证据描述（玩家可见）",
    "content": "证据详细内容",
    "hasContradiction": true/false,
    "contradictionHint": "矛盾提示（如果有）",
    "source": "证据来源",
    "isKeyEvidence": true/false,
    "imageDescription": "证据图片描述（用于生成图像）"
  }
}`;

const WITNESS_GENERATOR_PROMPT = `基于以下案件背景，生成一个新的证人角色。

案件信息：
标题: {title}
类型: {caseType}
背景: {background}
隐藏真相: {hiddenTruth}
被告: {defendant}
现有证人: {existingWitnesses}

要求：
1. 证人要与案件有合理关联
2. 设计独特的性格特征
3. 证人应该有隐藏的秘密
4. 需要设计弱点和可追问的点
5. 初始证词可以包含可被揭穿的谎言

如果用户有特殊要求: {userPrompt}

返回JSON格式：
{
  "witness": {
    "name": "证人姓名",
    "role": "职业/身份",
    "age": 35,
    "personality": {
      "honesty": 0-100,
      "stability": 0-100,
      "aggression": 0-100,
      "intelligence": 0-100,
      "traits": ["特征1", "特征2"]
    },
    "appearance": "外貌描述",
    "initialTestimony": "初始证词",
    "hiddenSecret": "隐藏的秘密",
    "weakPoints": ["弱点1", "弱点2"],
    "relationships": {"角色名": "关系描述"},
    "portraitDescription": "立绘描述",
    "relationToCase": "与案件的关系",
    "motivation": "作证动机"
  }
}`;

const LOGICAL_LOCK_GENERATOR_PROMPT = `基于以下案件背景，生成一个新的逻辑锁。

逻辑锁是表面陈述/证据与隐藏真相之间的矛盾点，玩家需要通过交叉询问和出示证据来破解。

案件信息：
标题: {title}
背景: {background}
隐藏真相: {hiddenTruth}
现有证据: {evidenceList}
现有证人: {witnessList}
现有逻辑锁: {existingLocks}

要求：
1. 逻辑锁要基于现有证据和证人
2. 表面陈述要看起来合理但实际可被推翻
3. 需要关联相关证据和证人ID
4. 提供破解提示

如果用户有特殊要求: {userPrompt}

返回JSON格式：
{
  "logicalLock": {
    "surfaceClaim": "表面陈述",
    "hiddenTruth": "隐藏真相",
    "contradictionType": "time|location|physical|motive|testimony",
    "hint": "破解提示",
    "relatedEvidenceIds": ["证据ID1"],
    "relatedWitnessIds": ["证人ID1"],
    "breakDialogue": "破解时的对话",
    "difficultyRating": 1-5
  }
}`;

const PROSECUTOR_GENERATOR_PROMPT = `基于以下案件背景，生成一个检察官角色。

案件信息：
标题: {title}
类型: {caseType}
难度: {difficulty}
背景: {background}

要求：
1. 检察官风格要与案件难度匹配
2. 设计独特的性格和背景
3. 需要有标志性的口头禅
4. 设计合理的弱点

如果用户有特殊要求: {userPrompt}

返回JSON格式：
{
  "prosecutor": {
    "name": "检察官姓名",
    "age": 35-55,
    "appearance": "外貌描述",
    "personality": "性格描述",
    "style": "aggressive|methodical|theatrical|cunning",
    "backstory": "背景故事",
    "catchphrase": "口头禅",
    "weakness": "弱点",
    "relationToCase": "与案件的关系"
  }
}`;

const JUDGE_GENERATOR_PROMPT = `基于以下案件背景，生成一个法官角色。

案件信息：
标题: {title}
法庭类型: {courtType}
案件类型: {caseType}

要求：
1. 法官风格要与法庭类型匹配
2. 设计独特的审判风格
3. 需要有合理的严厉程度

如果用户有特殊要求: {userPrompt}

返回JSON格式：
{
  "judge": {
    "name": "法官姓名",
    "age": 50-70,
    "appearance": "外貌描述",
    "personality": "性格描述",
    "strictness": 1-10,
    "style": "lenient|strict|by_the_book|unpredictable",
    "preferences": "特殊偏好",
    "backstory": "背景故事"
  }
}`;

const FULL_STORY_GENERATOR_PROMPT = `创作一个完整的法庭案件故事。

要求：
- 难度: {difficulty} ({difficultyDesc})
- 案件类型: {caseType} ({caseTypeDesc})
- 法庭: {courtType}
- 是否需要陪审团: {requiresJury}

如果用户有特殊要求: {userPrompt}

返回完整的案件JSON，包含：
{
  "title": "案件标题",
  "subtitle": "副标题/案件编号",
  "summary": "案情摘要（100字以内）",
  "detailedBackground": "详细背景（500字左右）",
  "hiddenTruth": "隐藏真相",
  "trueGuiltyParty": "真正的罪犯",
  "defendant": {
    "name": "被告姓名",
    "age": 数字,
    "occupation": "职业",
    "background": "背景",
    "appearance": "外貌描述",
    "isActuallyGuilty": true/false
  },
  "prosecutor": {...},
  "judge": {...},
  "evidence": [...至少3个证据],
  "witnesses": [...至少2个证人],
  "logicalLocks": [...至少2个逻辑锁],
  "tags": ["标签1", "标签2"]
}`;

const POLISH_TEXT_PROMPT = `请润色以下文本，使其更加生动、专业，符合法庭案件的叙述风格：

原文：
{text}

要求：
1. 保持原意不变
2. 提升文学性和可读性
3. 使用专业的法律术语（如适用）
4. 控制字数在原文的1.2倍以内

返回JSON格式：
{
  "polishedText": "润色后的文本"
}`;

// ============================================
// 生成函数
// ============================================

/**
 * 生成ID
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 生成单个证据
 */
export async function generateEvidence(
  draft: Partial<StoryDraft>,
  userPrompt?: string
): Promise<EditableEvidence> {
  const prompt = EVIDENCE_GENERATOR_PROMPT
    .replace('{title}', draft.title || '未命名案件')
    .replace('{caseType}', draft.detailedType ? CASE_TYPE_INFO[draft.detailedType].name : '未知')
    .replace('{background}', draft.detailedBackground || '无')
    .replace('{hiddenTruth}', draft.hiddenTruth || '未设定')
    .replace('{existingEvidence}', JSON.stringify(draft.evidence?.map(e => e.name) || []))
    .replace('{userPrompt}', userPrompt || '无');

  const result = await callAIWithRetry<{ evidence: Omit<EditableEvidence, 'id' | 'isLocked' | 'editNotes' | 'discovered'> }>({
    systemPrompt: STORY_GENERATOR_SYSTEM_PROMPT,
    userPrompt: prompt,
    temperature: 0.8,
    maxTokens: 1500,
  });

  return {
    id: generateId('evidence'),
    ...result.evidence,
    discovered: false,
    isLocked: false,
    editNotes: '',
  };
}

/**
 * 生成单个证人
 */
export async function generateWitness(
  draft: Partial<StoryDraft>,
  userPrompt?: string
): Promise<EditableWitness> {
  const prompt = WITNESS_GENERATOR_PROMPT
    .replace('{title}', draft.title || '未命名案件')
    .replace('{caseType}', draft.detailedType ? CASE_TYPE_INFO[draft.detailedType].name : '未知')
    .replace('{background}', draft.detailedBackground || '无')
    .replace('{hiddenTruth}', draft.hiddenTruth || '未设定')
    .replace('{defendant}', draft.defendant?.name || '未设定')
    .replace('{existingWitnesses}', JSON.stringify(draft.witnesses?.map(w => w.name) || []))
    .replace('{userPrompt}', userPrompt || '无');

  const result = await callAIWithRetry<{ witness: Omit<EditableWitness, 'id' | 'isLocked' | 'editNotes' | 'portraitDescription'> & { portraitDescription?: string } }>({
    systemPrompt: STORY_GENERATOR_SYSTEM_PROMPT,
    userPrompt: prompt,
    temperature: 0.8,
    maxTokens: 2000,
  });

  return {
    id: generateId('witness'),
    ...result.witness,
    portraitDescription: result.witness.portraitDescription || result.witness.appearance,
    isLocked: false,
    editNotes: '',
  };
}

/**
 * 生成单个逻辑锁
 */
export async function generateLogicalLock(
  draft: Partial<StoryDraft>,
  userPrompt?: string
): Promise<EditableLogicalLock> {
  const prompt = LOGICAL_LOCK_GENERATOR_PROMPT
    .replace('{title}', draft.title || '未命名案件')
    .replace('{background}', draft.detailedBackground || '无')
    .replace('{hiddenTruth}', draft.hiddenTruth || '未设定')
    .replace('{evidenceList}', JSON.stringify(draft.evidence?.map(e => ({ id: e.id, name: e.name })) || []))
    .replace('{witnessList}', JSON.stringify(draft.witnesses?.map(w => ({ id: w.id, name: w.name })) || []))
    .replace('{existingLocks}', JSON.stringify(draft.logicalLocks?.map(l => l.surfaceClaim.substring(0, 30)) || []))
    .replace('{userPrompt}', userPrompt || '无');

  const result = await callAIWithRetry<{ logicalLock: Omit<EditableLogicalLock, 'id' | 'isLocked' | 'editNotes'> }>({
    systemPrompt: STORY_GENERATOR_SYSTEM_PROMPT,
    userPrompt: prompt,
    temperature: 0.8,
    maxTokens: 1500,
  });

  return {
    id: generateId('lock'),
    ...result.logicalLock,
    isLocked: false,
    editNotes: '',
  };
}

/**
 * 生成检察官
 */
export async function generateProsecutor(
  draft: Partial<StoryDraft>,
  userPrompt?: string
): Promise<ProsecutorConfig> {
  const prompt = PROSECUTOR_GENERATOR_PROMPT
    .replace('{title}', draft.title || '未命名案件')
    .replace('{caseType}', draft.detailedType ? CASE_TYPE_INFO[draft.detailedType].name : '未知')
    .replace('{difficulty}', draft.difficulty ? DIFFICULTY_INFO[draft.difficulty].name : '未知')
    .replace('{background}', draft.detailedBackground || '无')
    .replace('{userPrompt}', userPrompt || '无');

  const result = await callAIWithRetry<{ prosecutor: ProsecutorConfig }>({
    systemPrompt: STORY_GENERATOR_SYSTEM_PROMPT,
    userPrompt: prompt,
    temperature: 0.8,
    maxTokens: 1500,
  });

  return result.prosecutor;
}

/**
 * 生成法官
 */
export async function generateJudge(
  draft: Partial<StoryDraft>,
  userPrompt?: string
): Promise<JudgeConfig> {
  const prompt = JUDGE_GENERATOR_PROMPT
    .replace('{title}', draft.title || '未命名案件')
    .replace('{courtType}', draft.courtType || 'municipal')
    .replace('{caseType}', draft.detailedType ? CASE_TYPE_INFO[draft.detailedType].name : '未知')
    .replace('{userPrompt}', userPrompt || '无');

  const result = await callAIWithRetry<{ judge: JudgeConfig }>({
    systemPrompt: STORY_GENERATOR_SYSTEM_PROMPT,
    userPrompt: prompt,
    temperature: 0.8,
    maxTokens: 1500,
  });

  return result.judge;
}

/**
 * 生成完整故事
 */
export async function generateFullStory(
  difficulty: StoryDraft['difficulty'],
  detailedType: StoryDraft['detailedType'],
  courtType: StoryDraft['courtType'],
  requiresJury: boolean,
  userPrompt?: string
): Promise<Partial<StoryDraft>> {
  const caseTypeInfo = CASE_TYPE_INFO[detailedType];
  const difficultyInfo = DIFFICULTY_INFO[difficulty];

  const prompt = FULL_STORY_GENERATOR_PROMPT
    .replace('{difficulty}', difficultyInfo.name)
    .replace('{difficultyDesc}', difficultyInfo.description)
    .replace('{caseType}', caseTypeInfo.name)
    .replace('{caseTypeDesc}', caseTypeInfo.description)
    .replace('{courtType}', courtType)
    .replace('{requiresJury}', requiresJury ? '是' : '否')
    .replace('{userPrompt}', userPrompt || '无特殊要求');

  const result = await callAIWithRetry<{
    title: string;
    subtitle: string;
    summary: string;
    detailedBackground: string;
    hiddenTruth: string;
    trueGuiltyParty: string;
    defendant: StoryDraft['defendant'];
    prosecutor: ProsecutorConfig;
    judge: JudgeConfig;
    evidence: Array<Omit<EditableEvidence, 'id' | 'isLocked' | 'editNotes'>>;
    witnesses: Array<Omit<EditableWitness, 'id' | 'isLocked' | 'editNotes'>>;
    logicalLocks: Array<Omit<EditableLogicalLock, 'id' | 'isLocked' | 'editNotes'>>;
    tags: string[];
  }>({
    systemPrompt: STORY_GENERATOR_SYSTEM_PROMPT,
    userPrompt: prompt,
    temperature: 0.9,
    maxTokens: 4000,
  });

  // 添加ID和默认值
  const evidence: EditableEvidence[] = result.evidence.map((e, i) => ({
    ...e,
    id: generateId(`evidence_${i}`),
    discovered: false,
    isLocked: false,
    editNotes: '',
  }));

  const witnesses: EditableWitness[] = result.witnesses.map((w, i) => ({
    ...w,
    id: generateId(`witness_${i}`),
    portraitDescription: w.portraitDescription || w.appearance,
    relationToCase: (w as EditableWitness).relationToCase || '',
    motivation: (w as EditableWitness).motivation || '',
    isLocked: false,
    editNotes: '',
  }));

  // 更新逻辑锁的关联ID
  const logicalLocks: EditableLogicalLock[] = result.logicalLocks.map((l, i) => ({
    ...l,
    id: generateId(`lock_${i}`),
    // 尝试匹配关联ID，如果原始数据使用的是名称则需要转换
    relatedEvidenceIds: l.relatedEvidenceIds?.length > 0 
      ? l.relatedEvidenceIds.map(id => {
          // 如果ID已经是正确格式，直接返回
          if (evidence.find(e => e.id === id)) return id;
          // 否则尝试按名称匹配
          const found = evidence.find(e => e.name === id);
          return found?.id || id;
        })
      : [],
    relatedWitnessIds: l.relatedWitnessIds?.length > 0
      ? l.relatedWitnessIds.map(id => {
          if (witnesses.find(w => w.id === id)) return id;
          const found = witnesses.find(w => w.name === id);
          return found?.id || id;
        })
      : [],
    difficultyRating: l.difficultyRating || 3,
    isLocked: false,
    editNotes: '',
  }));

  return {
    title: result.title,
    subtitle: result.subtitle,
    summary: result.summary,
    detailedBackground: result.detailedBackground,
    hiddenTruth: result.hiddenTruth,
    trueGuiltyParty: result.trueGuiltyParty,
    defendant: result.defendant,
    prosecutor: result.prosecutor,
    judge: result.judge,
    evidence,
    witnesses,
    logicalLocks,
    tags: result.tags || [],
  };
}

/**
 * 润色文本
 */
export async function polishText(text: string): Promise<string> {
  const prompt = POLISH_TEXT_PROMPT.replace('{text}', text);

  const result = await callAIWithRetry<{ polishedText: string }>({
    systemPrompt: STORY_GENERATOR_SYSTEM_PROMPT,
    userPrompt: prompt,
    temperature: 0.6,
    maxTokens: 2000,
  });

  return result.polishedText;
}

/**
 * 统一的AI生成入口
 */
export async function generateStoryContent(
  type: AIGenerationType,
  draft: Partial<StoryDraft>,
  userPrompt?: string
): Promise<Partial<StoryDraft>> {
  switch (type) {
    case 'full_story':
      return generateFullStory(
        draft.difficulty || 'beginner',
        draft.detailedType || 'petty_theft',
        draft.courtType || 'municipal',
        draft.requiresJury || false,
        userPrompt
      );

    case 'evidence':
      const newEvidence = await generateEvidence(draft, userPrompt);
      return { evidence: [newEvidence] };

    case 'witness':
      const newWitness = await generateWitness(draft, userPrompt);
      return { witnesses: [newWitness] };

    case 'logical_lock':
      const newLock = await generateLogicalLock(draft, userPrompt);
      return { logicalLocks: [newLock] };

    case 'prosecutor':
      const prosecutor = await generateProsecutor(draft, userPrompt);
      return { prosecutor };

    case 'judge':
      const judge = await generateJudge(draft, userPrompt);
      return { judge };

    case 'polish':
      // 润色需要指定字段，这里作为示例润色背景
      if (draft.detailedBackground) {
        const polished = await polishText(draft.detailedBackground);
        return { detailedBackground: polished };
      }
      return {};

    default:
      throw new Error(`不支持的生成类型: ${type}`);
  }
}


