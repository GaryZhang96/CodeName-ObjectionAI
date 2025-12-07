/**
 * Lex Machina - 预设案件故事
 * 
 * 10个代表性案件，按难度从易到难排列
 */

import type { PresetStory } from './types';

export const PRESET_STORIES: PresetStory[] = [
  // ============================================
  // 第一章：教程 - 学习基础
  // ============================================
  {
    id: 'tutorial_001',
    title: '消失的钱包',
    subtitle: 'Case #T-001',
    difficulty: 'tutorial',
    category: 'civil',
    detailedType: 'property_dispute',
    courtType: 'small_claims',
    requiresJury: false,
    coverDescription: '一个简单的小额法庭，年轻律师的第一案',
    chapter: 1,
    order: 1,
    unlockCondition: {
      requiredLevel: 1,
      requiredStories: [],
      requiredWins: 0,
    },
    caseData: {
      summary: '一位咖啡店顾客声称服务员偷了他的钱包，但事情可能没那么简单。',
      detailedBackground: `2024年3月15日下午，商人张伟在"晨曦咖啡"消费后声称丢失了钱包，内有现金500美元和多张信用卡。

张伟指控当班服务员李小梅在收拾桌子时偷走了他的钱包。咖啡店老板拒绝赔偿，张伟遂将咖啡店告上小额法庭。

李小梅坚称自己没有拿钱包，她表示张伟离开时手里拿着手机，似乎在打电话，走得很匆忙。

监控录像显示张伟在14:32离开，但录像不够清晰，无法看清他手里是否拿着钱包。`,
      hiddenTruth: '张伟的钱包其实掉在了他自己的车里。他当天心神不宁是因为接到了公司裁员的电话，完全忘记了钱包的位置。他是真的以为钱包丢了，并非故意诬陷。',
      trueGuiltyParty: '无人有罪（误会）',
      defendant: {
        name: '晨曦咖啡（李小梅）',
        age: 23,
        occupation: '咖啡店服务员',
        background: '勤工俭学的大学生，在咖啡店工作两年，从未有过任何投诉记录。',
      },
      prosecutor: {
        name: '张伟（原告）',
        personality: '焦虑、急躁，但本质上是正直的人',
        style: 'aggressive',
      },
      judge: {
        name: '刘明华法官',
        personality: '温和但严谨，喜欢引导双方理性对话',
        strictness: 4,
      },
      evidence: [
        {
          id: 'ev_t001_1',
          name: '咖啡店监控录像',
          type: 'digital',
          description: '案发当天的监控录像',
          content: '录像显示14:32张伟起身离开，他一边看手机一边走向门口。由于角度问题，无法确认他手中是否有钱包。14:35李小梅开始收拾桌子，动作正常，没有任何藏匿物品的可疑行为。',
          hasContradiction: false,
          source: '咖啡店',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_t001_2',
          name: '张伟的通话记录',
          type: 'documentary',
          description: '张伟手机的通话记录',
          content: '记录显示14:30-14:45期间，张伟接到了一通来自公司HR部门的电话，时长15分钟。',
          hasContradiction: true,
          contradictionHint: '张伟声称离开时注意到钱包不在，但通话记录显示他当时正在接重要电话',
          source: '电话公司',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_t001_3',
          name: '李小梅的工作记录',
          type: 'documentary',
          description: '李小梅两年的工作评价',
          content: '评价显示李小梅工作认真负责，两年内零投诉，多次获得顾客好评。她还曾捡到顾客遗落的手机主动归还。',
          hasContradiction: false,
          source: '咖啡店人事档案',
          discovered: true,
          isKeyEvidence: false,
        },
      ],
      witnesses: [
        {
          id: 'wit_t001_1',
          name: '李小梅',
          role: '被告/服务员',
          age: 23,
          personality: {
            honesty: 90,
            stability: 70,
            aggression: 20,
            intelligence: 75,
            traits: ['诚实', '有些紧张', '委屈'],
          },
          appearance: '年轻女性，穿着咖啡店制服，看起来很紧张',
          initialTestimony: '我绝对没有拿那位先生的钱包！我收拾桌子的时候只有咖啡杯和一些纸巾，根本没有钱包！',
          hiddenSecret: '她注意到张伟离开时神情恍惚，走路踉跄，但不确定是否应该提这件事',
          weakPoints: ['会因为紧张而表达不清'],
          relationships: {
            '张伟': '不认识，只是普通顾客',
          },
        },
        {
          id: 'wit_t001_2',
          name: '王阿姨',
          role: '目击者/其他顾客',
          age: 58,
          personality: {
            honesty: 85,
            stability: 80,
            aggression: 30,
            intelligence: 65,
            traits: ['热心', '爱管闲事', '观察力强'],
          },
          appearance: '中年妇女，穿着朴素，表情认真',
          initialTestimony: '我当时坐在旁边桌子，那个男的接了个电话后脸色很难看，走的时候急急忙忙的，我还看到他差点撞到门。',
          hiddenSecret: '她看到张伟把什么东西掉在了地上，但捡起来后塞进口袋就走了，她以为是手机',
          weakPoints: ['记忆可能有偏差'],
          relationships: {
            '张伟': '不认识',
            '李小梅': '熟客，认识',
          },
        },
      ],
      logicalLocks: [
        {
          id: 'lock_t001_1',
          surfaceClaim: '张伟声称离开时就发现钱包不见了',
          hiddenTruth: '通话记录显示他当时正在接重要电话，不可能注意到钱包',
          contradictionType: 'testimony',
          hint: '一个人在接重要电话时，会注意到其他事情吗？',
          relatedEvidenceIds: ['ev_t001_2'],
          relatedWitnessIds: ['wit_t001_2'],
          breakDialogue: '等等...如果您当时正在接那通重要电话，您怎么可能同时注意到钱包不见了呢？',
        },
      ],
      rewards: {
        baseXP: 50,
        baseMoney: 100,
        bonusConditions: [
          {
            condition: '不使用任何提示',
            xpBonus: 25,
            moneyBonus: 50,
          },
        ],
        achievement: {
          id: 'first_case',
          name: '初出茅庐',
          description: '完成你的第一个案件',
        },
      },
    },
    storybook: {
      fullNarrative: '这是一个关于误解与真相的故事。在繁忙的都市生活中，一通改变命运的电话，一个心神不宁的商人，一个无辜的服务员，共同编织了这场小小的法庭风波...',
      chapters: [
        {
          title: '第一章：消失的500美元',
          content: '张伟是一家科技公司的中层管理者，那天下午，他像往常一样来到常去的咖啡店...',
        },
        {
          title: '第二章：指控',
          content: '当张伟回到公司才发现钱包不见时，他的第一反应是有人偷了它...',
        },
        {
          title: '第三章：真相大白',
          content: '在法庭上，通过仔细分析证据和证词，真相终于浮出水面...',
        },
      ],
      characterProfiles: [
        {
          name: '张伟',
          role: '原告',
          description: '35岁，科技公司项目经理，正面临职业危机',
          secretRevealed: '那通电话是公司的裁员通知，他当时完全慌了神',
        },
        {
          name: '李小梅',
          role: '被告',
          description: '23岁，勤工俭学的大学生',
          secretRevealed: '她一直想说张伟离开时的异常，但害怕被认为是找借口',
        },
      ],
      timeline: [
        { time: '14:25', event: '张伟到达咖啡店', isKeyEvent: false },
        { time: '14:30', event: '张伟接到HR电话', isKeyEvent: true },
        { time: '14:32', event: '张伟匆忙离开', isKeyEvent: true },
        { time: '14:35', event: '李小梅收拾桌子', isKeyEvent: false },
        { time: '16:00', event: '张伟发现钱包不见', isKeyEvent: true },
      ],
      truthReveal: '张伟的钱包从未被偷。当他接到裁员电话时，震惊之下把钱包掉在了座位旁边的地上，他下意识捡起来塞进外套口袋就离开了。由于当时心神恍惚，他完全不记得这个动作。钱包一直在他的外套口袋里。',
      epilogue: '案件以和解告终。张伟向李小梅真诚道歉，并给咖啡店留下了一笔小费。这次经历让他学会了在压力下保持冷静，也让他重新审视自己的职业规划。三个月后，他成功跳槽到了一家更好的公司。',
    },
  },

  // ============================================
  // 第二章：新手案件
  // ============================================
  {
    id: 'beginner_001',
    title: '午夜便利店',
    subtitle: 'Case #B-001',
    difficulty: 'beginner',
    category: 'criminal',
    detailedType: 'petty_theft',
    courtType: 'municipal',
    requiresJury: false,
    coverDescription: '霓虹灯下的便利店，一起看似简单的盗窃案',
    chapter: 2,
    order: 1,
    unlockCondition: {
      requiredLevel: 1,
      requiredStories: ['tutorial_001'],
      requiredWins: 1,
    },
    caseData: {
      summary: '便利店深夜被盗，监控拍到了"嫌疑人"，但真相可能出人意料。',
      detailedBackground: `2024年4月2日凌晨2点，"24小时便利"店发生盗窃案。

店员王明声称他去仓库取货时（约10分钟），收银台的现金（约800美元）被盗。监控录像显示，在此期间只有一名戴帽子的男子——外卖员陈强——进入过店内。

陈强被逮捕并被指控盗窃。他坚称自己只是进店买水，从未靠近收银台。警方在他身上没有找到任何赃款。

检方以监控录像和店员证词为主要证据。`,
      hiddenTruth: '真正的小偷是店员王明自己。他利用监控的死角偷走了现金，然后嫁祸给恰好路过的陈强。王明最近欠下了赌债，急需用钱。',
      trueGuiltyParty: '店员王明',
      defendant: {
        name: '陈强',
        age: 28,
        occupation: '外卖员',
        background: '来自农村的务工人员，工作勤恳，无犯罪记录。每天凌晨送完最后一单会路过便利店买水。',
      },
      prosecutor: {
        name: '林检察官',
        personality: '经验尚浅但很认真',
        style: 'methodical',
      },
      judge: {
        name: '陈法官',
        personality: '严肃但公正',
        strictness: 6,
      },
      evidence: [
        {
          id: 'ev_b001_1',
          name: '便利店监控录像',
          type: 'digital',
          description: '案发当晚的店内监控',
          content: '录像显示：01:58 陈强进店；01:59 陈强在饮料柜前选购；02:01 陈强到收银台结账，此时收银台抽屉关闭正常；02:02 陈强离开。02:05-02:12 王明移动到监控死角区域（仓库入口）；02:15 王明报警称发现被盗。',
          hasContradiction: true,
          contradictionHint: '陈强离开时钱还在，但王明有7分钟在死角区域',
          source: '便利店监控系统',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_b001_2',
          name: '王明的证词记录',
          type: 'testimonial',
          description: '王明的书面证词',
          content: '王明证词："我在02:05去仓库拿货，回来时是02:15，发现收银台被撬开，现金不见了。那个外卖员是唯一进过店的人。"',
          hasContradiction: true,
          contradictionHint: '王明说收银台被撬开，但监控显示陈强结账时抽屉正常',
          source: '警方笔录',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_b001_3',
          name: '陈强的购物小票',
          type: 'documentary',
          description: '陈强购买矿泉水的收据',
          content: '收据显示：购买时间02:01，商品：矿泉水x1，金额$1.50，支付方式：现金，找零：$8.50（支付$10）',
          hasContradiction: false,
          source: '便利店收银系统',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_b001_4',
          name: '王明的银行记录',
          type: 'documentary',
          description: '王明近期的银行流水',
          content: '记录显示王明在过去一个月内有多笔大额现金存款，总计约3000美元，与其工资收入不符。同时有多笔转账到一个赌博网站关联的账户。',
          hasContradiction: true,
          contradictionHint: '王明的资金流向非常可疑',
          source: '银行',
          discovered: false,
          isKeyEvidence: true,
        },
      ],
      witnesses: [
        {
          id: 'wit_b001_1',
          name: '王明',
          role: '便利店店员/控方证人',
          age: 32,
          personality: {
            honesty: 25,
            stability: 40,
            aggression: 55,
            intelligence: 60,
            traits: ['油滑', '紧张时爱出汗', '说话前后矛盾'],
          },
          appearance: '中年男性，微胖，穿着便利店制服，眼神闪烁',
          initialTestimony: '我看得清清楚楚！那个外卖员就是趁我不在的时候偷的钱！他以为监控拍不到，但我知道是他！',
          hiddenSecret: '他自己偷了钱用来还赌债，陈强只是倒霉的替罪羊',
          weakPoints: ['时间线矛盾', '收银台"被撬"的说法', '他的财务状况'],
          relationships: {
            '陈强': '不认识，随机选择嫁祸',
          },
        },
      ],
      logicalLocks: [
        {
          id: 'lock_b001_1',
          surfaceClaim: '王明声称收银台被撬开',
          hiddenTruth: '监控显示陈强结账时收银台完好，"被撬"是王明的谎言',
          contradictionType: 'physical',
          hint: '收银台真的被撬了吗？监控里的细节值得仔细看看',
          relatedEvidenceIds: ['ev_b001_1', 'ev_b001_2'],
          relatedWitnessIds: ['wit_b001_1'],
          breakDialogue: '您说收银台被撬开了，但监控显示陈强02:01结账时，收银台明明是正常打开和关闭的！',
        },
        {
          id: 'lock_b001_2',
          surfaceClaim: '陈强是唯一有机会作案的人',
          hiddenTruth: '王明自己有7分钟在监控死角，他才是真正有机会的人',
          contradictionType: 'time',
          hint: '仔细看看监控的时间线，谁真正有作案时间？',
          relatedEvidenceIds: ['ev_b001_1'],
          relatedWitnessIds: ['wit_b001_1'],
          breakDialogue: '陈强02:02就离开了，而您直到02:15才报警。这中间的13分钟，您一直在"监控死角"的仓库入口，不是吗？',
        },
      ],
      rewards: {
        baseXP: 100,
        baseMoney: 200,
        bonusConditions: [
          {
            condition: '成功揭露真正的小偷',
            xpBonus: 50,
            moneyBonus: 100,
          },
          {
            condition: '破解所有逻辑锁',
            xpBonus: 30,
            moneyBonus: 50,
          },
        ],
      },
    },
    storybook: {
      fullNarrative: '霓虹灯闪烁的城市夜晚，一家24小时便利店里，一场精心策划的陷害正在上演...',
      chapters: [
        {
          title: '第一章：深夜来客',
          content: '陈强结束了一天的外卖工作，像往常一样走进那家便利店...',
        },
        {
          title: '第二章：完美的替罪羊',
          content: '王明已经计划这件事很久了，他只需要一个倒霉的路人...',
        },
        {
          title: '第三章：正义不会缺席',
          content: '在法庭上，细心的辩护律师发现了证词中的漏洞...',
        },
      ],
      characterProfiles: [
        {
          name: '陈强',
          role: '被告（无辜）',
          description: '28岁外卖员，每天工作12小时以上',
          secretRevealed: '他只是想买瓶水解渴，却差点因此坐牢',
        },
        {
          name: '王明',
          role: '真凶',
          description: '32岁便利店员，沉迷赌博',
          secretRevealed: '他欠下两万美元赌债，便利店的800美元只是杯水车薪',
        },
      ],
      timeline: [
        { time: '01:58', event: '陈强进入便利店', isKeyEvent: false },
        { time: '02:01', event: '陈强结账购买矿泉水', isKeyEvent: true },
        { time: '02:02', event: '陈强离开，此时收银台正常', isKeyEvent: true },
        { time: '02:05', event: '王明进入监控死角', isKeyEvent: true },
        { time: '02:12', event: '王明从死角出来', isKeyEvent: true },
        { time: '02:15', event: '王明报警', isKeyEvent: false },
      ],
      truthReveal: '王明早就计划好了这一切。他知道监控的死角在哪里，也知道凌晨时分会有外卖员经过。他等到陈强离开后，利用死角时间偷走了现金，然后伪装成被盗现场。那800美元被他藏在仓库的一个隐蔽角落，打算过几天再取走。',
      epilogue: '陈强被无罪释放。王明因作伪证和盗窃被逮捕。在审讯中，他承认了自己的赌博问题和所有罪行。便利店老板向陈强道歉，并给了他一份兼职工作作为补偿。',
    },
  },

  // ============================================
  // 第三章：中级案件
  // ============================================
  {
    id: 'intermediate_001',
    title: '遗产风波',
    subtitle: 'Case #I-001',
    difficulty: 'intermediate',
    category: 'civil',
    detailedType: 'property_dispute',
    courtType: 'superior',
    requiresJury: true,
    coverDescription: '一份遗嘱，三个继承人，无数的秘密',
    chapter: 3,
    order: 1,
    unlockCondition: {
      requiredLevel: 3,
      requiredStories: ['beginner_001'],
      requiredWins: 2,
    },
    caseData: {
      summary: '富商去世后，三个子女为遗产对簿公堂。看似简单的遗嘱争议，背后却隐藏着家族的惊天秘密。',
      detailedBackground: `富商赵德明于2024年2月去世，留下价值约500万美元的遗产。

根据遗嘱，他将80%的财产留给了小女儿赵雪，仅给大儿子赵刚和二女儿赵梅各10%。大儿子和二女儿联合起诉，声称遗嘱是伪造的，或者父亲在立遗嘱时精神状态不正常。

赵雪聘请律师为遗嘱的有效性辩护。她声称父亲是清醒的，这是他的真实意愿。

遗嘱由赵德明的老友、律师周伟见证并公证。`,
      hiddenTruth: '遗嘱是真实的。赵德明之所以把大部分财产留给小女儿，是因为赵刚和赵梅多年来一直在挪用公司资金，总额超过200万美元。赵德明发现后没有报警，而是选择通过遗嘱"清算"。赵雪是唯一一直诚实对待父亲的孩子。',
      trueGuiltyParty: '赵刚和赵梅（挪用公款）',
      defendant: {
        name: '赵雪',
        age: 28,
        occupation: '医生',
        background: '赵德明的小女儿，医学院毕业后成为急诊科医生。与父亲关系亲密，经常照顾父亲晚年生活。',
      },
      prosecutor: {
        name: '赵刚（原告）',
        personality: '傲慢、贪婪，习惯性撒谎',
        style: 'aggressive',
      },
      evidence: [
        {
          id: 'ev_i001_1',
          name: '赵德明遗嘱原件',
          type: 'documentary',
          description: '由律师周伟见证的遗嘱',
          content: '遗嘱明确写道："我将80%财产留给小女儿赵雪，因为她是唯一没有背叛我信任的孩子。赵刚和赵梅知道自己做了什么。"日期为2023年10月15日，签名经笔迹鉴定为真。',
          hasContradiction: false,
          source: '律师周伟',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_i001_2',
          name: '赵德明的医疗记录',
          type: 'documentary',
          description: '立遗嘱前后的医疗检查',
          content: '2023年10月10日的全面体检显示赵德明身体健康，精神状态良好。医生特别注明"认知功能正常，无任何痴呆迹象"。',
          hasContradiction: false,
          source: '私人医院',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_i001_3',
          name: '公司财务审计报告',
          type: 'documentary',
          description: '赵氏集团近5年的财务审计',
          content: '审计发现2019-2023年间有多笔异常支出，总计约230万美元。这些支出名义上是"业务开发费用"，但没有任何相关业务记录。支出授权签名为赵刚和赵梅。',
          hasContradiction: true,
          contradictionHint: '赵刚和赵梅声称对父亲忠心耿耿，但财务记录说明了什么？',
          source: '会计师事务所',
          discovered: false,
          isKeyEvidence: true,
        },
        {
          id: 'ev_i001_4',
          name: '赵德明的日记',
          type: 'documentary',
          description: '赵德明生前的私人日记',
          content: '2023年9月的日记写道："今天发现了赵刚和赵梅的把戏。五年了，他们从公司偷了两百多万。我老了，不想闹上法庭让家丑外扬。但我会通过遗嘱让他们知道，我什么都知道。只有雪儿是清白的。"',
          hasContradiction: true,
          contradictionHint: '日记揭示了赵德明立遗嘱的真正原因',
          source: '赵雪提供',
          discovered: false,
          isKeyEvidence: true,
        },
      ],
      witnesses: [
        {
          id: 'wit_i001_1',
          name: '赵刚',
          role: '原告/长子',
          age: 45,
          personality: {
            honesty: 20,
            stability: 50,
            aggression: 75,
            intelligence: 70,
            traits: ['傲慢', '贪婪', '善于狡辩'],
          },
          appearance: '中年男性，西装革履，表情傲慢',
          initialTestimony: '父亲晚年明显糊涂了！他怎么可能把大部分财产给一个常年不在身边的女儿？我们才是一直管理公司的人！',
          hiddenSecret: '他和赵梅合谋挪用了公司230万美元',
          weakPoints: ['财务异常', '为什么父亲说"他们知道自己做了什么"'],
          relationships: {
            '赵梅': '同谋',
            '赵雪': '嫉妒',
            '赵德明': '表面孝顺，实际利用',
          },
        },
        {
          id: 'wit_i001_2',
          name: '周伟律师',
          role: '遗嘱见证人',
          age: 62,
          personality: {
            honesty: 95,
            stability: 90,
            aggression: 20,
            intelligence: 85,
            traits: ['正直', '谨慎', '专业'],
          },
          appearance: '老年男性，银发，戴眼镜，气质儒雅',
          initialTestimony: '我与赵德明相交40年。他立遗嘱那天精神非常好，思路清晰。他特意告诉我，这是他深思熟虑后的决定。',
          hiddenSecret: '赵德明曾向他透露发现了子女挪用公款的事',
          weakPoints: ['无'],
          relationships: {
            '赵德明': '40年挚友',
          },
        },
        {
          id: 'wit_i001_3',
          name: '赵梅',
          role: '原告/次女',
          age: 40,
          personality: {
            honesty: 25,
            stability: 45,
            aggression: 60,
            intelligence: 65,
            traits: ['虚伪', '紧张时话多', '爱推卸责任'],
          },
          appearance: '中年女性，打扮精致，眼神躲闪',
          initialTestimony: '我们一直照顾父亲的生意，赵雪呢？她只会偶尔回来看看！父亲肯定是被人蛊惑了！',
          hiddenSecret: '她是挪用公款的主要执行者，赵刚只是帮忙掩护',
          weakPoints: ['财务签字', '紧张时容易说漏嘴'],
          relationships: {
            '赵刚': '同谋',
            '赵雪': '嫉妒',
          },
        },
      ],
      logicalLocks: [
        {
          id: 'lock_i001_1',
          surfaceClaim: '赵刚和赵梅声称是忠诚的子女',
          hiddenTruth: '财务审计显示他们挪用了230万美元',
          contradictionType: 'testimony',
          hint: '忠诚的子女会对公司做什么？看看财务记录',
          relatedEvidenceIds: ['ev_i001_3'],
          relatedWitnessIds: ['wit_i001_1', 'wit_i001_3'],
          breakDialogue: '如果您们如此忠诚，那公司账上消失的230万美元是怎么回事？这些支出都是您们签字授权的！',
        },
        {
          id: 'lock_i001_2',
          surfaceClaim: '赵德明立遗嘱时精神不正常',
          hiddenTruth: '医疗记录证明他精神完全正常',
          contradictionType: 'physical',
          hint: '精神状态可以被医学证明',
          relatedEvidenceIds: ['ev_i001_2'],
          relatedWitnessIds: ['wit_i001_2'],
          breakDialogue: '医疗记录清楚显示，赵先生在立遗嘱前5天接受了全面检查，"认知功能正常，无任何痴呆迹象"！',
        },
        {
          id: 'lock_i001_3',
          surfaceClaim: '遗嘱内容不合理，偏心小女儿',
          hiddenTruth: '赵德明是故意惩罚挪用公款的子女',
          contradictionType: 'motive',
          hint: '为什么遗嘱里说"他们知道自己做了什么"？',
          relatedEvidenceIds: ['ev_i001_1', 'ev_i001_4'],
          relatedWitnessIds: ['wit_i001_1', 'wit_i001_3'],
          breakDialogue: '遗嘱里写得很清楚："赵刚和赵梅知道自己做了什么。"赵先生的日记也证实了这一点——他发现了你们的挪用行为！',
        },
      ],
      rewards: {
        baseXP: 200,
        baseMoney: 400,
        bonusConditions: [
          {
            condition: '揭露财务丑闻',
            xpBonus: 100,
            moneyBonus: 200,
          },
          {
            condition: '破解所有逻辑锁',
            xpBonus: 50,
            moneyBonus: 100,
          },
        ],
        achievement: {
          id: 'family_secrets',
          name: '家族秘密',
          description: '揭开豪门背后的真相',
        },
      },
    },
    storybook: {
      fullNarrative: '在赵氏家族光鲜的外表下，隐藏着贪婪、背叛与最后的清算。一个父亲用遗嘱说出了他来不及说的话...',
      chapters: [
        {
          title: '第一章：父亲的遗愿',
          content: '赵德明躺在病床上，看着窗外的夕阳，想起了这些年的点点滴滴...',
        },
        {
          title: '第二章：贪婪的代价',
          content: '五年前的一个深夜，赵刚和赵梅第一次从公司账户转出那笔钱时，他们以为父亲永远不会发现...',
        },
        {
          title: '第三章：沉默的审判',
          content: '赵德明选择不报警，不是因为软弱，而是因为他有自己的方式...',
        },
        {
          title: '第四章：真相大白',
          content: '法庭上，当财务记录和日记被一一呈堂时，赵刚和赵梅的谎言彻底崩塌...',
        },
      ],
      characterProfiles: [
        {
          name: '赵德明',
          role: '已故富商',
          description: '白手起家的商人，晚年看透了人性',
          secretRevealed: '他早就知道大儿子和二女儿的所作所为，选择用遗嘱进行最后的审判',
        },
        {
          name: '赵雪',
          role: '被告/小女儿',
          description: '唯一诚实的孩子，选择从医帮助他人',
          secretRevealed: '她一直不知道哥哥姐姐的事，只是单纯地爱着父亲',
        },
        {
          name: '赵刚',
          role: '原告/长子',
          description: '公司表面上的继承人，实际上的蛀虫',
          secretRevealed: '五年来陆续挪用了230万美元用于奢侈消费和投资失败',
        },
      ],
      timeline: [
        { time: '2019年', event: '赵刚开始挪用公司资金', isKeyEvent: true },
        { time: '2021年', event: '赵梅加入挪用行列', isKeyEvent: true },
        { time: '2023年9月', event: '赵德明发现真相', isKeyEvent: true },
        { time: '2023年10月', event: '赵德明立下遗嘱', isKeyEvent: true },
        { time: '2024年2月', event: '赵德明去世', isKeyEvent: false },
      ],
      truthReveal: '赵德明不是一个糊涂的老人，恰恰相反，他比谁都清醒。当他发现自己最信任的两个孩子背叛了自己时，他没有选择法律诉讼让家丑外扬，而是决定用遗嘱进行最后的清算。那句"他们知道自己做了什么"不是随便写的——它是一个父亲最后的控诉。',
      epilogue: '法庭驳回了赵刚和赵梅的诉讼，遗嘱被判定有效。随后，赵雪代表父亲的遗产，对两人提起了刑事诉讼。赵刚和赵梅最终因挪用公款被判处监禁。赵雪用继承的财产设立了一个慈善基金会，专门资助贫困学生学医。',
    },
  },

  // ============================================
  // 第四章：高级案件
  // ============================================
  {
    id: 'advanced_001',
    title: '致命处方',
    subtitle: 'Case #A-001',
    difficulty: 'advanced',
    category: 'criminal',
    detailedType: 'involuntary_manslaughter',
    courtType: 'superior',
    requiresJury: true,
    coverDescription: '一个病人死亡，一位医生被控过失杀人',
    chapter: 4,
    order: 1,
    unlockCondition: {
      requiredLevel: 5,
      requiredStories: ['intermediate_001'],
      requiredWins: 4,
    },
    caseData: {
      summary: '知名心脏科医生被控因医疗过失导致病人死亡，但这起案件远比表面看起来复杂。',
      detailedBackground: `2024年1月20日，45岁的企业家林建国在圣心医院死亡，死因是心脏病发作。

死者家属指控主治医生陈医生犯有过失杀人罪，理由是：
1. 陈医生开具了不适当的药物
2. 忽视了病人的过敏史
3. 没有进行必要的检查

检方声称陈医生当天同时处理多个病人，"疏忽大意"导致了这场悲剧。

然而，陈医生坚称自己的诊断和处方完全正确，病人的死亡另有原因。`,
      hiddenTruth: '林建国的死不是医疗过失，而是其妻子张美玲的谋杀。张美玲在丈夫的药物中掺入了会引发心脏病的违禁药物。她的动机是获得高额保险金和丈夫的出轨。陈医生完全是被冤枉的。',
      trueGuiltyParty: '张美玲（死者妻子）',
      defendant: {
        name: '陈志远',
        age: 52,
        occupation: '心脏科主任医师',
        background: '从医25年的资深医生，曾获多项医学荣誉。从未有过任何医疗事故记录。',
      },
      prosecutor: {
        name: '郑检察官',
        personality: '咄咄逼人，喜欢煽动情绪',
        style: 'theatrical',
      },
      evidence: [
        {
          id: 'ev_a001_1',
          name: '陈医生的处方记录',
          type: 'documentary',
          description: '陈医生开给林建国的处方',
          content: '处方显示：常规心脏病药物，剂量在正常范围内。处方前陈医生查阅了病人的完整病历，包括过敏史。处方药物与病人已知过敏原无关。',
          hasContradiction: false,
          source: '医院系统',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_a001_2',
          name: '林建国的尸检报告',
          type: 'documentary',
          description: '法医的尸检结果',
          content: '死因：急性心肌梗死。血液检测发现除处方药物外，还含有高浓度的麻黄碱（一种可诱发心脏病的兴奋剂）。麻黄碱不在处方范围内。',
          hasContradiction: true,
          contradictionHint: '麻黄碱从哪里来的？这不是医生开的药',
          source: '法医',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_a001_3',
          name: '林建国的保险单',
          type: 'documentary',
          description: '林建国的人寿保险资料',
          content: '林建国在去世前6个月新投保了一份500万美元的人寿保险，受益人是妻子张美玲。同时，他还有一份意外险，受益人同样是张美玲。',
          hasContradiction: true,
          contradictionHint: '这么高额的保险，受益人是谁？',
          source: '保险公司',
          discovered: false,
          isKeyEvidence: true,
        },
        {
          id: 'ev_a001_4',
          name: '张美玲的购物记录',
          type: 'digital',
          description: '张美玲的网购历史',
          content: '记录显示张美玲在丈夫去世前两个月，从海外网站购买了含麻黄碱的"减肥补充剂"。收货地址是她的办公室，而非家庭住址。',
          hasContradiction: true,
          contradictionHint: '为什么要买含麻黄碱的东西？为什么不寄到家里？',
          source: '海关记录',
          discovered: false,
          isKeyEvidence: true,
        },
        {
          id: 'ev_a001_5',
          name: '林建国的私人邮件',
          type: 'digital',
          description: '林建国的电子邮件记录',
          content: '邮件显示林建国正在与离婚律师联系，准备与张美玲离婚。邮件中提到"她已经知道了我的外遇，但我受不了她的控制欲了"。',
          hasContradiction: true,
          contradictionHint: '如果丈夫要离婚，妻子会失去什么？',
          source: '林建国电脑',
          discovered: false,
          isKeyEvidence: true,
        },
      ],
      witnesses: [
        {
          id: 'wit_a001_1',
          name: '张美玲',
          role: '死者妻子/控方证人',
          age: 42,
          personality: {
            honesty: 15,
            stability: 55,
            aggression: 45,
            intelligence: 80,
            traits: ['擅长表演悲伤', '城府极深', '心理素质强'],
          },
          appearance: '中年女性，穿着素雅，表情悲痛',
          initialTestimony: '我丈夫一直很信任陈医生...谁知道...他就这样走了...我只想要正义，让害死他的人付出代价！',
          hiddenSecret: '她是真正的凶手，用麻黄碱毒杀了丈夫',
          weakPoints: ['麻黄碱的来源', '保险单的时机', '丈夫的离婚计划'],
          relationships: {
            '林建国': '表面恩爱，实则貌合神离',
            '陈医生': '故意嫁祸对象',
          },
        },
        {
          id: 'wit_a001_2',
          name: '护士刘晓燕',
          role: '医院护士',
          age: 35,
          personality: {
            honesty: 85,
            stability: 75,
            aggression: 25,
            intelligence: 70,
            traits: ['细心', '正直', '胆小'],
          },
          appearance: '年轻女性，穿护士服，表情紧张',
          initialTestimony: '陈医生那天的工作都是按程序来的，我全程都在旁边。他对每个病人都很认真。',
          hiddenSecret: '她注意到张美玲在探视时总是亲自给丈夫喂药，不让护士插手',
          weakPoints: ['害怕得罪人'],
          relationships: {
            '陈医生': '同事',
          },
        },
        {
          id: 'wit_a001_3',
          name: '法医王教授',
          role: '法医专家',
          age: 58,
          personality: {
            honesty: 95,
            stability: 90,
            aggression: 20,
            intelligence: 95,
            traits: ['严谨', '专业', '实事求是'],
          },
          appearance: '老年男性，戴眼镜，白大褂',
          initialTestimony: '死者血液中的麻黄碱浓度非常高，这不可能来自正常的医疗处方。这种浓度必须通过额外摄入才能达到。',
          hiddenSecret: '他私下认为这是一起谋杀案，但没有证据指向具体嫌疑人',
          weakPoints: ['无'],
          relationships: {},
        },
      ],
      logicalLocks: [
        {
          id: 'lock_a001_1',
          surfaceClaim: '陈医生开了不当药物',
          hiddenTruth: '处方完全正确，麻黄碱不是医生开的',
          contradictionType: 'physical',
          hint: '尸检报告里的麻黄碱是从哪里来的？',
          relatedEvidenceIds: ['ev_a001_1', 'ev_a001_2'],
          relatedWitnessIds: ['wit_a001_3'],
          breakDialogue: '尸检报告清楚显示，致命的麻黄碱根本不在陈医生的处方中！这药是从别处来的！',
        },
        {
          id: 'lock_a001_2',
          surfaceClaim: '林建国的死是意外',
          hiddenTruth: '他的妻子有购买麻黄碱的记录',
          contradictionType: 'physical',
          hint: '谁会购买含麻黄碱的药物？为什么？',
          relatedEvidenceIds: ['ev_a001_4'],
          relatedWitnessIds: ['wit_a001_1'],
          breakDialogue: '张女士，请解释一下，为什么您在丈夫去世前两个月从海外购买了含麻黄碱的补充剂？',
        },
        {
          id: 'lock_a001_3',
          surfaceClaim: '张美玲是悲痛的寡妇',
          hiddenTruth: '她即将因离婚失去一切，还有500万保险金的动机',
          contradictionType: 'motive',
          hint: '林建国去世，谁获益最大？',
          relatedEvidenceIds: ['ev_a001_3', 'ev_a001_5'],
          relatedWitnessIds: ['wit_a001_1'],
          breakDialogue: '您丈夫正在准备离婚，离婚后您将一无所有。但他死了，您就能获得500万美元保险金。这不是巧合吧？',
        },
      ],
      rewards: {
        baseXP: 350,
        baseMoney: 700,
        bonusConditions: [
          {
            condition: '揭露真凶',
            xpBonus: 150,
            moneyBonus: 300,
          },
          {
            condition: '完美庭审（无警告）',
            xpBonus: 100,
            moneyBonus: 200,
          },
        ],
        achievement: {
          id: 'lifesaver',
          name: '救人一命',
          description: '为被冤枉的医生洗清罪名',
        },
      },
    },
    storybook: {
      fullNarrative: '一起看似医疗事故的案件，背后却是精心策划的谋杀。当正义站在悬崖边缘，真相需要被找到...',
      chapters: [
        {
          title: '第一章：死亡病房',
          content: '圣心医院的ICU里，心电监护仪发出长长的警报声...',
        },
        {
          title: '第二章：完美的嫌疑人',
          content: '张美玲知道，把责任推给医生是最安全的选择...',
        },
        {
          title: '第三章：麻黄碱的秘密',
          content: '那瓶减肥补充剂从海外寄来时，她已经计划好了一切...',
        },
        {
          title: '第四章：真相只有一个',
          content: '法庭上，一个接一个的证据被揭开...',
        },
      ],
      characterProfiles: [
        {
          name: '陈志远',
          role: '被告（无辜）',
          description: '25年从医经验的心脏科专家',
          secretRevealed: '他一直在自责是否有什么疏漏，直到真相大白',
        },
        {
          name: '张美玲',
          role: '真凶',
          description: '外表优雅的企业家妻子',
          secretRevealed: '她无法接受丈夫的出轨和即将到来的离婚，选择了最极端的方式',
        },
        {
          name: '林建国',
          role: '死者',
          description: '成功的企业家，婚姻不幸',
          secretRevealed: '他想离开这段窒息的婚姻，却付出了生命的代价',
        },
      ],
      timeline: [
        { time: '2023年7月', event: '林建国开始筹划离婚', isKeyEvent: true },
        { time: '2023年8月', event: '林建国投保500万人寿险', isKeyEvent: true },
        { time: '2023年11月', event: '张美玲网购麻黄碱补充剂', isKeyEvent: true },
        { time: '2024年1月', event: '林建国开始服用"补充剂"', isKeyEvent: true },
        { time: '2024年1月20日', event: '林建国死亡', isKeyEvent: true },
      ],
      truthReveal: '张美玲早就发现了丈夫的出轨和离婚计划。她知道一旦离婚，根据婚前协议，她几乎什么都得不到。但如果丈夫"意外"死亡，她就能获得全部遗产和500万保险金。她购买了含高浓度麻黄碱的补充剂，在丈夫住院期间以"爱心照顾"的名义亲自喂药，神不知鬼不觉地让他摄入致命剂量。陈医生只是她选中的替罪羊。',
      epilogue: '陈医生被无罪释放。张美玲因一级谋杀罪被判终身监禁。这个案件后来被医学院用作教学案例，提醒医生们注意"病人身边人"的可疑行为。陈医生重返工作岗位后，专门建立了一个基金会，帮助被冤枉的医疗工作者。',
    },
  },

  // ============================================
  // 第五章：专家级案件
  // ============================================
  {
    id: 'expert_001',
    title: '镜中人',
    subtitle: 'Case #E-001',
    difficulty: 'expert',
    category: 'criminal',
    detailedType: 'first_degree_murder',
    courtType: 'superior',
    requiresJury: true,
    coverDescription: '双胞胎兄弟，一人死亡，一人被控谋杀',
    chapter: 5,
    order: 1,
    unlockCondition: {
      requiredLevel: 8,
      requiredStories: ['advanced_001'],
      requiredWins: 6,
    },
    caseData: {
      summary: '双胞胎弟弟被发现死于家中，检方指控哥哥是凶手。但当两人几乎一模一样时，真相究竟是什么？',
      detailedBackground: `2024年3月5日，32岁的周明被发现死于自己的公寓，死因是钝器击打头部。

他的双胞胎哥哥周亮成为首要嫌疑人。警方在周亮家中发现了血迹和凶器（一把铁锤），DNA检测显示血迹属于周明。

周亮被逮捕并被指控一级谋杀。他坚称自己是无辜的，案发时他不在现场。

然而，多名目击者声称在案发时间看到"周亮"出现在周明公寓附近。

这对双胞胎长相几乎完全相同，连指纹都有90%的相似度。`,
      hiddenTruth: '死者周明其实是杀人犯。他伪装成哥哥周亮杀死了另一个人——一个同样长相相似的男子林浩，然后将尸体放在自己公寓，制造自己被杀的假象。周明的目的是骗取保险金并嫁祸哥哥，好独吞家族遗产。但他在逃亡时出了车祸死亡，真相才最终浮出水面。',
      trueGuiltyParty: '周明（死者本人是凶手，受害者是林浩）',
      defendant: {
        name: '周亮',
        age: 32,
        occupation: '建筑师',
        background: '周家长子，性格温和，与弟弟周明关系一直不好。周明总认为父母偏心哥哥。',
      },
      prosecutor: {
        name: '钱检察官',
        personality: '老练、狡猾，擅长设置陷阱',
        style: 'cunning',
      },
      evidence: [
        {
          id: 'ev_e001_1',
          name: '周亮家中的血迹',
          type: 'physical',
          description: '在周亮家中发现的血迹',
          content: 'DNA检测显示血迹属于周明。血迹分布在门廊和洗手间，呈现拖拽痕迹。',
          hasContradiction: true,
          contradictionHint: '血迹是怎么到周亮家的？凶案现场不是周明的公寓吗？',
          source: '刑侦科',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_e001_2',
          name: '尸体指纹比对',
          type: 'documentary',
          description: '尸体的指纹鉴定报告',
          content: '由于双胞胎指纹高度相似（90%），常规比对无法完全确定身份。但法医注意到尸体右手小指有陈旧性骨折愈合痕迹。',
          hasContradiction: true,
          contradictionHint: '周明还是周亮的小指骨折过？',
          source: '法医',
          discovered: true,
          isKeyEvidence: true,
        },
        {
          id: 'ev_e001_3',
          name: '目击者证词汇总',
          type: 'testimonial',
          description: '多名目击者的证词',
          content: '三名目击者声称在案发当晚看到"周亮"进入周明的公寓。但由于双胞胎长相一致，他们都表示"可能是周亮，也可能是周明假扮的"。',
          hasContradiction: true,
          contradictionHint: '目击者真的能分清双胞胎吗？',
          source: '警方',
          discovered: true,
          isKeyEvidence: false,
        },
        {
          id: 'ev_e001_4',
          name: '林浩失踪报告',
          type: 'documentary',
          description: '一名男子的失踪报告',
          content: '林浩，31岁，3月3日被报失踪。他与周家兄弟长相有六成相似，身材相仿。他的家人至今未能找到他。',
          hasContradiction: true,
          contradictionHint: '为什么会有一个长相相似的人失踪？',
          source: '警方',
          discovered: false,
          isKeyEvidence: true,
        },
        {
          id: 'ev_e001_5',
          name: '周明的保险单',
          type: 'documentary',
          description: '周明的人寿保险资料',
          content: '周明在案发前一个月新投保了300万美元人寿险，受益人是"哥哥周亮"。但有一条附加条款：如果周亮因犯罪入狱，受益人变更为周明指定的海外账户。',
          hasContradiction: true,
          contradictionHint: '这个保险条款太奇怪了...',
          source: '保险公司',
          discovered: false,
          isKeyEvidence: true,
        },
        {
          id: 'ev_e001_6',
          name: '周明的车祸报告',
          type: 'documentary',
          description: '一起车祸的调查报告',
          content: '3月7日，一名男子在高速公路上发生严重车祸身亡。尸体烧焦难以辨认，但车辆登记在周明名下。车内发现了周明的钱包和一张飞往开曼群岛的机票。',
          hasContradiction: true,
          contradictionHint: '周明不是已经死了吗？为什么还有他的车祸？',
          source: '交通警察',
          discovered: false,
          isKeyEvidence: true,
        },
        {
          id: 'ev_e001_7',
          name: '周亮的医疗记录',
          type: 'documentary',
          description: '周亮童年的医疗记录',
          content: '记录显示周亮8岁时右手小指骨折，进行了手术治疗。而周明的记录显示他从未有过任何骨折。',
          hasContradiction: true,
          contradictionHint: '小指骨折的是周亮，那尸体上的骨折痕迹说明了什么？',
          source: '医院',
          discovered: false,
          isKeyEvidence: true,
        },
      ],
      witnesses: [
        {
          id: 'wit_e001_1',
          name: '周母',
          role: '被告母亲',
          age: 60,
          personality: {
            honesty: 75,
            stability: 40,
            aggression: 30,
            intelligence: 65,
            traits: ['悲伤', '困惑', '想保护两个儿子'],
          },
          appearance: '老年女性，憔悴，眼含泪水',
          initialTestimony: '我的两个儿子...我不相信亮亮会杀明明...但明明也不会陷害哥哥...我不知道发生了什么...',
          hiddenSecret: '她一直偏心周亮，这是周明怨恨的根源',
          weakPoints: ['对儿子们的关系判断可能不准'],
          relationships: {
            '周亮': '偏爱的长子',
            '周明': '忽视的次子',
          },
        },
        {
          id: 'wit_e001_2',
          name: '法医张教授',
          role: '法医专家',
          age: 55,
          personality: {
            honesty: 95,
            stability: 90,
            aggression: 15,
            intelligence: 95,
            traits: ['严谨', '细致', '追求真相'],
          },
          appearance: '中年男性，戴眼镜，表情严肃',
          initialTestimony: '尸体的身份确认存在困难。虽然DNA显示是周家血统，但由于是同卵双胞胎，无法通过DNA区分是周亮还是周明。',
          hiddenSecret: '他发现尸体上有些特征与周明的已知记录不符，但还在进一步调查',
          weakPoints: ['无'],
          relationships: {},
        },
        {
          id: 'wit_e001_3',
          name: '林浩的妻子',
          role: '失踪者家属',
          age: 29,
          personality: {
            honesty: 90,
            stability: 50,
            aggression: 35,
            intelligence: 70,
            traits: ['焦急', '困惑', '想找到丈夫'],
          },
          appearance: '年轻女性，神情憔悴',
          initialTestimony: '我丈夫3月2日出门后就再也没回来。警察说周家的案子和我们无关，但我总觉得有什么联系...',
          hiddenSecret: '她丈夫曾提到有个叫周明的人找他做"一笔大生意"',
          weakPoints: ['情绪不稳定'],
          relationships: {
            '林浩': '丈夫',
            '周明': '丈夫曾提到过这个名字',
          },
        },
      ],
      logicalLocks: [
        {
          id: 'lock_e001_1',
          surfaceClaim: '尸体是周明',
          hiddenTruth: '尸体上的小指骨折痕迹属于周亮，而周亮还活着，说明尸体另有其人',
          contradictionType: 'physical',
          hint: '小指骨折的人是谁？尸体上的痕迹说明什么？',
          relatedEvidenceIds: ['ev_e001_2', 'ev_e001_7'],
          relatedWitnessIds: ['wit_e001_2'],
          breakDialogue: '等等！医疗记录显示，小指骨折过的人是周亮，不是周明！而周亮明明坐在被告席上！那这具尸体到底是谁？',
        },
        {
          id: 'lock_e001_2',
          surfaceClaim: '周明已经死亡',
          hiddenTruth: '周明在3月7日的车祸中才真正死亡',
          contradictionType: 'time',
          hint: '3月5日的尸体，3月7日的车祸，时间线对吗？',
          relatedEvidenceIds: ['ev_e001_6'],
          relatedWitnessIds: [],
          breakDialogue: '如果周明3月5日就死了，为什么3月7日会有一辆登记在他名下的车出车祸？车里还有他的钱包和逃往海外的机票！',
        },
        {
          id: 'lock_e001_3',
          surfaceClaim: '周亮是凶手',
          hiddenTruth: '真正的受害者是林浩，周明才是凶手',
          contradictionType: 'testimony',
          hint: '失踪的林浩去哪了？他和周明有什么联系？',
          relatedEvidenceIds: ['ev_e001_4'],
          relatedWitnessIds: ['wit_e001_3'],
          breakDialogue: '林浩在3月3日失踪，与周明长相相似，而周明的公寓3月5日出现尸体...林浩的妻子说丈夫提到过周明要找他做"大生意"...这一切串起来了！',
        },
        {
          id: 'lock_e001_4',
          surfaceClaim: '这是一起普通的兄弟相残',
          hiddenTruth: '这是一场精心设计的保险诈骗和嫁祸计划',
          contradictionType: 'motive',
          hint: '那份奇怪的保险条款说明了什么？',
          relatedEvidenceIds: ['ev_e001_5'],
          relatedWitnessIds: [],
          breakDialogue: '周明的保险有一条诡异的条款：如果周亮因犯罪入狱，受益人就变成海外账户！这分明是设计好的圈套！周明杀了林浩，伪装成自己的死亡，嫁祸给哥哥，然后带着保险金逃到海外！',
        },
      ],
      rewards: {
        baseXP: 500,
        baseMoney: 1000,
        bonusConditions: [
          {
            condition: '完全揭开真相',
            xpBonus: 250,
            moneyBonus: 500,
          },
          {
            condition: '破解所有4个逻辑锁',
            xpBonus: 150,
            moneyBonus: 300,
          },
        ],
        achievement: {
          id: 'mirror_master',
          name: '镜像大师',
          description: '在双胞胎迷局中找到真相',
        },
      },
    },
    storybook: {
      fullNarrative: '当镜子里映出两张相同的脸，谁是善，谁是恶？这是一个关于嫉妒、贪婪和身份的故事...',
      chapters: [
        {
          title: '第一章：双生子',
          content: '周亮和周明，从出生起就像一个人的两面。但在镜子后面，命运给了他们截然不同的剧本...',
        },
        {
          title: '第二章：完美计划',
          content: '周明花了两年时间策划这一切。他找到了林浩——一个和他们有几分相像的可怜人...',
        },
        {
          title: '第三章：镜中谜题',
          content: '当尸体躺在公寓里，当血迹指向周亮，一切看起来如此确凿...',
        },
        {
          title: '第四章：破碎的镜子',
          content: '但真相就像镜子，总会在某个角度反射出它本来的面目...',
        },
      ],
      characterProfiles: [
        {
          name: '周亮',
          role: '被告（无辜）',
          description: '双胞胎哥哥，从小被父母偏爱',
          secretRevealed: '他一直试图弥补和弟弟的关系，却不知道弟弟的恨意已经深入骨髓',
        },
        {
          name: '周明',
          role: '真凶',
          description: '双胞胎弟弟，活在哥哥阴影下',
          secretRevealed: '他策划了这场骗局：杀死一个相似的人冒充自己，嫁祸哥哥，骗取保险金后逃往海外',
        },
        {
          name: '林浩',
          role: '真正的受害者',
          description: '被周明利用的无辜者',
          secretRevealed: '他被周明以"投资机会"诱骗，最终成为这场骗局的牺牲品',
        },
      ],
      timeline: [
        { time: '两年前', event: '周明开始策划', isKeyEvent: true },
        { time: '案发前1月', event: '周明投保300万美元', isKeyEvent: true },
        { time: '3月2日', event: '林浩被周明诱骗', isKeyEvent: true },
        { time: '3月3日', event: '周明杀害林浩', isKeyEvent: true },
        { time: '3月5日', event: '尸体被发现，周亮被捕', isKeyEvent: true },
        { time: '3月7日', event: '周明逃亡途中车祸身亡', isKeyEvent: true },
      ],
      truthReveal: '周明从小就活在哥哥的阴影下，父母的偏心让他的怨恨日益加深。他策划了一个完美的计划：找一个和他们兄弟相似的人杀掉，冒充自己的死亡，栽赃给哥哥，然后带着保险金和家族遗产远走高飞。他找到了林浩，一个急需用钱的可怜人，以投资机会为饵诱骗了他。但天网恢恢，周明在逃往机场的高速公路上发生车祸，当场死亡。命运给了这个精心策划的骗局一个讽刺的结局。',
      epilogue: '周亮被无罪释放。林浩的遗体被重新确认并归还家属，他的家人获得了应有的抚恤。这个案件成为刑侦教科书上的经典案例，被称为"镜中人案"。周亮后来成立了一个帮助冤案受害者的基金会。每年周明的忌日，他都会独自去弟弟坟前站一会儿——他始终不理解，究竟是什么让自己的亲弟弟走上了这条路。',
    },
  },
];

export default PRESET_STORIES;

