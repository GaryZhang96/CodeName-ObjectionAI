/**
 * 案件生成器服务
 * 负责使用 AI 动态生成游戏案件
 */

import type { Case, CaseDifficulty, PurchasableClue } from '@/types';
import { callAIWithRetry } from './client';
import { 
  CASE_GENERATION_SYSTEM_PROMPT, 
  getCaseGenerationPrompt,
  getClueGenerationPrompt,
} from './prompts';
import { AI_CONFIG } from './config';

/**
 * 生成新案件
 */
export async function generateCase(
  difficulty: CaseDifficulty,
  existingTitles: string[] = []
): Promise<Case> {
  const result = await callAIWithRetry<Case>({
    systemPrompt: CASE_GENERATION_SYSTEM_PROMPT,
    userPrompt: getCaseGenerationPrompt(difficulty, existingTitles),
    model: AI_CONFIG.reasoningModel,
    temperature: AI_CONFIG.temperature.caseGeneration,
    maxTokens: AI_CONFIG.maxTokens.caseGeneration,
    responseFormat: 'json',
  });

  // 验证案件数据完整性
  validateCase(result);
  
  return result;
}

/**
 * 批量生成案件选项（用于事务所界面）
 */
export async function generateCaseOptions(
  playerLevel: number,
  count: number = 3
): Promise<Case[]> {
  const availableDifficulties = getAvailableDifficultiesForLevel(playerLevel);
  const cases: Case[] = [];
  const usedTitles: string[] = [];

  // 并行生成多个案件
  const promises = Array.from({ length: count }, async (_, index) => {
    // 分配难度：确保有多样性
    const difficulty = availableDifficulties[index % availableDifficulties.length];
    
    try {
      const caseData = await generateCase(difficulty as CaseDifficulty, usedTitles);
      usedTitles.push(caseData.title);
      return caseData;
    } catch (error) {
      console.error(`生成案件 ${index + 1} 失败:`, error);
      // 返回一个备用案件
      return createFallbackCase(difficulty as CaseDifficulty, index);
    }
  });

  const results = await Promise.all(promises);
  cases.push(...results);

  return cases;
}

/**
 * 为案件生成可购买的线索
 */
export async function generateCluesForCase(caseData: Case): Promise<PurchasableClue[]> {
  const result = await callAIWithRetry<{ clues: PurchasableClue[] }>({
    systemPrompt: '你是游戏线索生成器。根据案件信息生成有价值的调查线索。',
    userPrompt: getClueGenerationPrompt(caseData),
    temperature: 0.7,
    maxTokens: 2000,
    responseFormat: 'json',
  });

  // 确保所有线索都有 purchased: false
  return result.clues.map(clue => ({
    ...clue,
    purchased: false,
  }));
}

/**
 * 验证案件数据完整性
 */
function validateCase(caseData: Case): void {
  const errors: string[] = [];

  if (!caseData.id) errors.push('缺少案件 ID');
  if (!caseData.title) errors.push('缺少案件标题');
  if (!caseData.hiddenTruth) errors.push('缺少隐藏真相');
  if (!caseData.evidence?.length) errors.push('缺少证据');
  if (!caseData.witnesses?.length) errors.push('缺少证人');
  if (!caseData.logicalLocks?.length) errors.push('缺少逻辑锁');

  // 验证证据
  caseData.evidence?.forEach((e, i) => {
    if (!e.content) errors.push(`证据 ${i + 1} 缺少具体内容`);
  });

  // 验证逻辑锁
  caseData.logicalLocks?.forEach((l, i) => {
    if (!l.surfaceClaim || !l.hiddenTruth) {
      errors.push(`逻辑锁 ${i + 1} 不完整`);
    }
  });

  if (errors.length > 0) {
    console.warn('案件验证警告:', errors);
  }
}

/**
 * 根据等级获取可用难度
 */
function getAvailableDifficultiesForLevel(level: number): string[] {
  const difficulties = ['easy'];
  if (level >= 3) difficulties.push('medium');
  if (level >= 6) difficulties.push('hard');
  if (level >= 10) difficulties.push('legendary');
  return difficulties;
}

/**
 * 创建备用案件（当 AI 生成失败时使用）
 */
function createFallbackCase(difficulty: CaseDifficulty, index: number): Case {
  const fallbackCases: Record<string, Case> = {
    easy: {
      id: `fallback_easy_${index}`,
      title: '便利店盗窃疑云',
      type: 'theft',
      difficulty: 'easy',
      summary: '一起看似简单的便利店盗窃案，但监控录像中的细节耐人寻味。',
      detailedBackground: `深夜11点，城南便利店发生了一起盗窃案。店员王小明声称看到一名戴帽子的男子偷走了收银台的现金。
      
被告李强恰好在案发时间路过该店，且监控录像显示他当时确实戴着帽子。但李强坚称自己只是进店买水，从未靠近收银台。

警方在李强身上没有找到任何赃款，但店员坚持指认就是他。`,
      hiddenTruth: '真正的小偷是店员王小明自己。他利用监控死角偷走了现金，然后嫁祸给恰好路过的李强。监控录像显示，李强离开时收银台的钱还在，而王小明之后有一段时间处于监控死角。',
      trueGuiltyParty: '店员王小明',
      defendant: {
        name: '李强',
        age: 28,
        occupation: '快递员',
        background: '普通的快递员，当晚送完最后一单后路过便利店想买瓶水。',
      },
      evidence: [
        {
          id: 'evidence_1',
          name: '便利店监控录像',
          type: 'digital',
          description: '案发当晚的店内监控',
          content: '录像显示：23:02 李强进店；23:03 李强在饮料柜前选购；23:05 李强结账离开，此时收银台抽屉关闭正常；23:07-23:12 王小明移动到监控死角区域；23:15 王小明报警称发现被盗。',
          hasContradiction: true,
          contradictionHint: '李强离开时钱还在，但王小明有5分钟在死角',
          source: '便利店监控系统',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'evidence_2',
          name: '店员证词记录',
          type: 'testimonial',
          description: '王小明的书面证词',
          content: '王小明证词："我亲眼看到那个戴帽子的男人（李强）趁我去仓库拿货时，打开收银台偷走了钱。但监控显示我去仓库是在23:07，而李强23:05就离开了。"',
          hasContradiction: true,
          contradictionHint: '时间线矛盾：王小明声称看到的时候，李强已经离开了',
          source: '警方笔录',
          discovered: true,
          isKeyEvidence: true,
        },
      ],
      witnesses: [
        {
          id: 'witness_1',
          name: '王小明',
          role: '便利店店员',
          age: 24,
          personality: {
            honesty: 30,
            stability: 40,
            aggression: 60,
            intelligence: 55,
            traits: ['紧张易怒', '说话有时前后矛盾', '喜欢打断别人'],
          },
          appearance: '瘦弱的年轻男性，戴眼镜，看起来有些神经质',
          initialTestimony: '我看得很清楚，就是那个人偷的钱！他以为我没注意，但我全看到了！',
          hiddenSecret: '他自己偷了钱，想嫁祸给李强来还赌债',
          weakPoints: ['时间线的矛盾', '为什么没有立即报警', '他的经济状况'],
          relationships: {
            '李强': '素不相识，随机选择的替罪羊',
          },
          currentEmotion: 'defensive',
          hasBroken: false,
        },
      ],
      logicalLocks: [
        {
          id: 'lock_1',
          surfaceClaim: '王小明声称亲眼看到李强在23:07偷钱',
          hiddenTruth: '监控显示李强在23:05已经离开，王小明不可能看到',
          contradictionType: 'time',
          hint: '仔细核对监控时间和证词中的时间',
          isBroken: false,
          relatedEvidenceIds: ['evidence_1', 'evidence_2'],
          relatedWitnessIds: ['witness_1'],
        },
      ],
      prosecutor: {
        name: '张检察官',
        personality: '初出茅庐，但很认真',
        style: 'methodical',
      },
      rewards: {
        baseXP: 100,
        baseMoney: 200,
        bonusConditions: [
          { condition: '首次询问就指出时间矛盾', xpBonus: 50, moneyBonus: 100 },
        ],
      },
    },
    medium: {
      id: `fallback_medium_${index}`,
      title: '公司机密泄露案',
      type: 'corporate',
      difficulty: 'medium',
      summary: '一起涉及商业机密的案件，被告是公司的资深员工。',
      detailedBackground: '科技公司的核心代码被泄露给竞争对手，种种证据指向资深程序员张明。',
      hiddenTruth: '真正的泄密者是技术总监刘波，他利用张明的账号进行操作，在张明休假期间完成了数据传输。',
      trueGuiltyParty: '技术总监刘波',
      defendant: {
        name: '张明',
        age: 35,
        occupation: '高级程序员',
        background: '在公司工作8年的老员工，口碑很好。',
      },
      evidence: [
        {
          id: 'evidence_1',
          name: '服务器访问日志',
          type: 'digital',
          description: '显示数据被下载的记录',
          content: '日志显示：数据下载发生在8月15日14:30，使用的是张明的账号。但公司打卡记录显示张明8月14-16日请了年假去外地旅游。',
          hasContradiction: true,
          contradictionHint: '下载时间与张明休假时间重叠',
          source: 'IT部门',
          discovered: true,
          isKeyEvidence: true,
        },
      ],
      witnesses: [
        {
          id: 'witness_1',
          name: '刘波',
          role: '技术总监',
          age: 42,
          personality: {
            honesty: 25,
            stability: 70,
            aggression: 45,
            intelligence: 85,
            traits: ['城府很深', '善于表演', '贪婪'],
          },
          appearance: '中年男性，穿着考究的西装，总是面带微笑',
          initialTestimony: '我对张明的行为感到非常失望，他是我一手带出来的。',
          hiddenSecret: '他才是真正的泄密者，欠下巨额赌债',
          weakPoints: ['他有最高权限可以用任何人的账号', '他的财务状况', '案发时他在公司'],
          relationships: {
            '张明': '下属，平时关系不错，但暗中嫉妒',
          },
          currentEmotion: 'calm',
          hasBroken: false,
        },
      ],
      logicalLocks: [
        {
          id: 'lock_1',
          surfaceClaim: '张明的账号在8月15日下载了机密数据',
          hiddenTruth: '张明当天在外地旅游，有机票和酒店记录证明',
          contradictionType: 'location',
          hint: '核实张明在数据下载时的行踪',
          isBroken: false,
          relatedEvidenceIds: ['evidence_1'],
          relatedWitnessIds: ['witness_1'],
        },
        {
          id: 'lock_2',
          surfaceClaim: '只有账号持有者才能登录系统',
          hiddenTruth: '技术总监有管理员权限，可以使用任何账号',
          contradictionType: 'testimony',
          hint: '询问谁还有权限使用其他人的账号',
          isBroken: false,
          relatedEvidenceIds: ['evidence_1'],
          relatedWitnessIds: ['witness_1'],
        },
      ],
      prosecutor: {
        name: '李检察官',
        personality: '经验丰富，咄咄逼人',
        style: 'aggressive',
      },
      rewards: {
        baseXP: 200,
        baseMoney: 400,
        bonusConditions: [
          { condition: '揭露技术总监的权限问题', xpBonus: 100, moneyBonus: 200 },
        ],
      },
    },
  };

  return fallbackCases[difficulty] || fallbackCases.easy;
}

