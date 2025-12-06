/**
 * 庭审模拟器服务
 * 负责处理庭审中的 AI 交互
 */

import type { 
  Case, 
  CourtroomMessage, 
  CourtroomAIResponse,
  VerdictResult,
  WitnessEmotion,
} from '@/types';
import { callAIWithRetry } from './client';
import { 
  COURTROOM_SYSTEM_PROMPT, 
  getCourtroomPrompt,
  VERDICT_SYSTEM_PROMPT,
  getVerdictPrompt,
} from './prompts';
import { AI_CONFIG } from './config';
import { generateId } from '@/lib/utils';

/**
 * 处理玩家在庭审中的发言
 */
export async function processPlayerStatement(
  caseData: Case,
  currentWitnessId: string | null,
  messages: CourtroomMessage[],
  playerInput: string,
  judgePatience: number
): Promise<CourtroomAIResponse> {
  const result = await callAIWithRetry<CourtroomAIResponse>({
    systemPrompt: COURTROOM_SYSTEM_PROMPT,
    userPrompt: getCourtroomPrompt(
      caseData, 
      currentWitnessId, 
      messages, 
      playerInput,
      judgePatience
    ),
    model: AI_CONFIG.defaultModel,
    temperature: AI_CONFIG.temperature.courtroom,
    maxTokens: AI_CONFIG.maxTokens.courtroom,
    responseFormat: 'json',
  });

  // 确保返回值有效
  return {
    response: result.response || '（无回应）',
    speaker: result.speaker || 'witness',
    emotionChange: result.emotionChange || undefined,
    juryImpact: clampValue(result.juryImpact || 0, -10, 10),
    judgePatience: clampValue(result.judgePatience || 0, -20, 5),
    lockBroken: result.lockBroken || undefined,
    witnessBroken: result.witnessBroken || false,
    systemHint: result.systemHint || undefined,
  };
}

/**
 * 生成 AI 角色的主动发言（检察官反驳等）
 */
export async function generateProsecutorStatement(
  caseData: Case,
  messages: CourtroomMessage[],
  context: 'opening' | 'objection' | 'cross' | 'closing'
): Promise<{ response: string; juryImpact: number }> {
  const prompts = {
    opening: `作为检察官 ${caseData.prosecutor.name}，请发表开庭陈词。风格: ${caseData.prosecutor.style}。指控被告 ${caseData.defendant.name}，陈述案情要点。`,
    objection: `作为检察官，对辩护律师最近的发言提出反对。风格: ${caseData.prosecutor.style}。`,
    cross: `作为检察官，对当前证人进行交叉询问。风格: ${caseData.prosecutor.style}。`,
    closing: `作为检察官，发表结案陈词。总结控方观点，要求陪审团判被告有罪。风格: ${caseData.prosecutor.style}。`,
  };

  const result = await callAIWithRetry<{ response: string; juryImpact: number }>({
    systemPrompt: `你是一名检察官，正在法庭上。保持角色，风格为: ${caseData.prosecutor.style}。永远不要说"作为AI"之类的话。输出JSON格式: { "response": "你的发言", "juryImpact": -5到5的数字 }`,
    userPrompt: `${prompts[context]}\n\n最近对话:\n${messages.slice(-5).map(m => `[${m.speakerName}]: ${m.content}`).join('\n')}`,
    temperature: 0.8,
    maxTokens: 500,
    responseFormat: 'json',
  });

  return {
    response: result.response || '（检察官沉默）',
    juryImpact: clampValue(result.juryImpact || 0, -5, 5),
  };
}

/**
 * 生成法官的发言
 */
export async function generateJudgeStatement(
  context: 'opening' | 'warning' | 'sustain' | 'overrule' | 'order' | 'closing',
  details?: string
): Promise<string> {
  const prompts = {
    opening: '宣布开庭，介绍案件，提醒双方遵守法庭规则。',
    warning: `对辩护律师发出警告: ${details || '请注意法庭礼仪'}`,
    sustain: '支持反对意见，要求辩护律师换一个问题。',
    overrule: '驳回反对意见，允许辩护律师继续。',
    order: `维持法庭秩序: ${details || '请保持安静'}`,
    closing: '宣布休庭，陪审团开始商议。',
  };

  const result = await callAIWithRetry<{ response: string }>({
    systemPrompt: '你是一名威严的法官。说话简洁有力，维护法庭秩序。永远不要说"作为AI"。输出JSON: { "response": "你的发言" }',
    userPrompt: prompts[context],
    temperature: 0.5,
    maxTokens: 200,
    responseFormat: 'json',
  });

  return result.response || '请继续。';
}

/**
 * 生成最终判决
 */
export async function generateVerdict(
  caseData: Case,
  messages: CourtroomMessage[],
  finalJurySentiment: number,
  brokenLocks: string[],
  judgePatience: number
): Promise<VerdictResult> {
  const result = await callAIWithRetry<VerdictResult>({
    systemPrompt: VERDICT_SYSTEM_PROMPT,
    userPrompt: getVerdictPrompt(
      caseData,
      messages,
      finalJurySentiment,
      brokenLocks,
      judgePatience
    ),
    model: AI_CONFIG.reasoningModel,
    temperature: AI_CONFIG.temperature.judgment,
    maxTokens: AI_CONFIG.maxTokens.judgment,
    responseFormat: 'json',
  });

  // 验证并填充默认值
  return {
    outcome: result.outcome || 'guilty',
    reasoning: result.reasoning || '陪审团做出了决定。',
    finalJurySentiment: result.finalJurySentiment || finalJurySentiment,
    rewards: {
      xp: result.rewards?.xp || caseData.rewards.baseXP,
      money: result.rewards?.money || caseData.rewards.baseMoney,
      bonuses: result.rewards?.bonuses || [],
    },
    review: {
      keyMoments: result.review?.keyMoments || [],
      mistakes: result.review?.mistakes || [],
      improvements: result.review?.improvements || [],
      overallRating: result.review?.overallRating || 'C',
    },
  };
}

/**
 * 创建庭审消息对象
 */
export function createCourtroomMessage(
  speaker: CourtroomMessage['speaker'],
  speakerName: string,
  content: string,
  options: Partial<CourtroomMessage> = {}
): CourtroomMessage {
  return {
    id: generateId(),
    timestamp: new Date(),
    speaker,
    speakerName,
    content,
    isKeyMoment: false,
    juryImpact: 0,
    ...options,
  };
}

/**
 * 检测玩家发言是否可能触发逻辑锁
 */
export function detectPotentialLockTrigger(
  playerInput: string,
  caseData: Case
): string[] {
  const triggeredLocks: string[] = [];
  const input = playerInput.toLowerCase();

  for (const lock of caseData.logicalLocks) {
    if (lock.isBroken) continue;

    // 简单的关键词匹配
    const keywords = [
      ...lock.surfaceClaim.toLowerCase().split(/\s+/),
      ...lock.hiddenTruth.toLowerCase().split(/\s+/),
    ].filter(w => w.length > 2);

    const matchCount = keywords.filter(kw => input.includes(kw)).length;
    
    if (matchCount >= 2) {
      triggeredLocks.push(lock.id);
    }
  }

  return triggeredLocks;
}

/**
 * 获取庭审提示（合伙人帮助）
 */
export async function getPartnerHint(
  caseData: Case,
  messages: CourtroomMessage[],
  unbrokenLocks: string[]
): Promise<string> {
  const targetLock = caseData.logicalLocks.find(
    l => unbrokenLocks.includes(l.id)
  );

  if (!targetLock) {
    return '你已经发现了所有关键矛盾，尝试总结你的发现并申请结案吧。';
  }

  const result = await callAIWithRetry<{ hint: string }>({
    systemPrompt: '你是玩家的资深合伙人律师，给予简短但有用的提示。不要直接说出答案，只是引导方向。输出JSON: { "hint": "你的提示" }',
    userPrompt: `
案件: ${caseData.title}
当前未破解的逻辑锁: ${targetLock.surfaceClaim}
真相: ${targetLock.hiddenTruth}

请给玩家一个暗示性的提示，帮助他们发现这个矛盾，但不要直接说出答案。
`,
    temperature: 0.6,
    maxTokens: 200,
    responseFormat: 'json',
  });

  return result.hint || targetLock.hint;
}

/**
 * 辅助函数：限制数值范围
 */
function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

