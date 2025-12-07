/**
 * 基础信息编辑器 - 编辑故事的基本信息
 */

import { useEditorStore } from '@/store/editorStore';
import { CASE_TYPE_INFO, DIFFICULTY_INFO, type DetailedCaseType, type StoryDifficulty, type CourtType, type CaseCategory } from '@/data/stories/types';
import { cn } from '@/lib/utils';

const COURT_TYPES: Array<{ value: CourtType; label: string; description: string }> = [
  { value: 'small_claims', label: '小额法庭', description: '只需法官，无陪审团' },
  { value: 'municipal', label: '市政法庭', description: '可选择法官或陪审团' },
  { value: 'superior', label: '高等法院', description: '重罪案件，有陪审团权利' },
  { value: 'federal', label: '联邦法院', description: '跨州/联邦犯罪' },
];

export function BasicInfoEditor() {
  const { currentDraft, updateBasicInfo, updateDefendant } = useEditorStore();

  if (!currentDraft) return null;

  const handleCaseTypeChange = (detailedType: DetailedCaseType) => {
    const typeInfo = CASE_TYPE_INFO[detailedType];
    updateBasicInfo({
      detailedType,
      category: typeInfo.category,
      courtType: typeInfo.courtType,
      requiresJury: typeInfo.requiresJury,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
        📋 基础信息
      </h2>

      {/* 标题和副标题 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-amber-300 mb-1">故事标题 *</label>
          <input
            type="text"
            value={currentDraft.title}
            onChange={(e) => updateBasicInfo({ title: e.target.value })}
            placeholder="例：消失的珠宝案"
            className="w-full px-3 py-2 bg-slate-800 border border-amber-900/50 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-300 mb-1">副标题/案件编号</label>
          <input
            type="text"
            value={currentDraft.subtitle}
            onChange={(e) => updateBasicInfo({ subtitle: e.target.value })}
            placeholder="例：Case #2024-0123"
            className="w-full px-3 py-2 bg-slate-800 border border-amber-900/50 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 难度选择 */}
      <div>
        <label className="block text-sm font-medium text-amber-300 mb-2">难度等级 *</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(DIFFICULTY_INFO) as [StoryDifficulty, typeof DIFFICULTY_INFO[StoryDifficulty]][]).map(([key, info]) => (
            <button
              key={key}
              onClick={() => updateBasicInfo({ difficulty: key })}
              className={cn(
                'p-3 rounded border text-left transition-all',
                currentDraft.difficulty === key
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              )}
            >
              <div className={cn('font-semibold', info.color)}>{info.name}</div>
              <div className="text-xs opacity-70 mt-1">{info.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 案件类型选择 */}
      <div>
        <label className="block text-sm font-medium text-amber-300 mb-2">案件类型 *</label>
        <div className="grid grid-cols-2 gap-4">
          {/* 分类显示 */}
          <div>
            <div className="text-xs text-slate-500 mb-2">民事案件</div>
            <div className="space-y-1">
              {(Object.entries(CASE_TYPE_INFO) as [DetailedCaseType, typeof CASE_TYPE_INFO[DetailedCaseType]][])
                .filter(([, info]) => info.category === 'civil')
                .map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => handleCaseTypeChange(key)}
                    className={cn(
                      'w-full px-3 py-2 rounded border text-left text-sm transition-all',
                      currentDraft.detailedType === key
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {info.name}
                  </button>
                ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-2">刑事案件</div>
            <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
              {(Object.entries(CASE_TYPE_INFO) as [DetailedCaseType, typeof CASE_TYPE_INFO[DetailedCaseType]][])
                .filter(([, info]) => info.category === 'criminal')
                .map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => handleCaseTypeChange(key)}
                    className={cn(
                      'w-full px-3 py-2 rounded border text-left text-sm transition-all',
                      currentDraft.detailedType === key
                        ? 'bg-red-600/30 border-red-500 text-red-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <span>{info.name}</span>
                    {info.severity && (
                      <span className="ml-2 text-xs opacity-50">
                        ({info.severity === 'misdemeanor' ? '轻罪' : '重罪'})
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 法庭类型和陪审团 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-amber-300 mb-2">法庭类型</label>
          <select
            value={currentDraft.courtType}
            onChange={(e) => updateBasicInfo({ courtType: e.target.value as CourtType })}
            className="w-full px-3 py-2 bg-slate-800 border border-amber-900/50 rounded text-white focus:border-amber-500 focus:outline-none"
          >
            {COURT_TYPES.map((court) => (
              <option key={court.value} value={court.value}>
                {court.label} - {court.description}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-300 mb-2">陪审团</label>
          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentDraft.requiresJury}
                onChange={(e) => updateBasicInfo({ requiresJury: e.target.checked })}
                className="w-4 h-4 accent-amber-500"
              />
              <span className="text-white">需要陪审团审判</span>
            </label>
          </div>
        </div>
      </div>

      {/* 案情摘要 */}
      <div>
        <label className="block text-sm font-medium text-amber-300 mb-1">案情摘要 * (100字以内)</label>
        <textarea
          value={currentDraft.summary}
          onChange={(e) => updateBasicInfo({ summary: e.target.value })}
          placeholder="简要描述案件的表面情况..."
          rows={2}
          className="w-full px-3 py-2 bg-slate-800 border border-amber-900/50 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
        />
        <div className="text-xs text-slate-500 text-right mt-1">{currentDraft.summary.length}/100</div>
      </div>

      {/* 详细背景 */}
      <div>
        <label className="block text-sm font-medium text-amber-300 mb-1">详细背景 *</label>
        <textarea
          value={currentDraft.detailedBackground}
          onChange={(e) => updateBasicInfo({ detailedBackground: e.target.value })}
          placeholder="详细描述案件背景、事件经过、相关人物关系等（玩家可见）..."
          rows={6}
          className="w-full px-3 py-2 bg-slate-800 border border-amber-900/50 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      {/* 隐藏真相 */}
      <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
        <label className="block text-sm font-medium text-red-300 mb-1">🔒 隐藏真相 * (AI和系统使用)</label>
        <textarea
          value={currentDraft.hiddenTruth}
          onChange={(e) => updateBasicInfo({ hiddenTruth: e.target.value })}
          placeholder="真正发生了什么？真相是什么？（仅AI裁判可见）"
          rows={4}
          className="w-full px-3 py-2 bg-slate-900 border border-red-900/50 rounded text-white placeholder-slate-500 focus:border-red-500 focus:outline-none resize-none"
        />
      </div>

      {/* 真正的罪犯 */}
      <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
        <label className="block text-sm font-medium text-red-300 mb-1">🎯 真正的罪犯</label>
        <input
          type="text"
          value={currentDraft.trueGuiltyParty}
          onChange={(e) => updateBasicInfo({ trueGuiltyParty: e.target.value })}
          placeholder="谁是真正的罪犯？（可以不是被告）"
          className="w-full px-3 py-2 bg-slate-900 border border-red-900/50 rounded text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
        />
      </div>

      {/* 被告信息 */}
      <div className="border border-amber-900/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-amber-300 mb-3">👤 被告信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">姓名 *</label>
            <input
              type="text"
              value={currentDraft.defendant.name}
              onChange={(e) => updateDefendant({ name: e.target.value })}
              placeholder="被告姓名"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">年龄</label>
            <input
              type="number"
              value={currentDraft.defendant.age}
              onChange={(e) => updateDefendant({ age: parseInt(e.target.value) || 0 })}
              min={1}
              max={120}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">职业</label>
            <input
              type="text"
              value={currentDraft.defendant.occupation}
              onChange={(e) => updateDefendant({ occupation: e.target.value })}
              placeholder="被告的职业"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">是否真的有罪</label>
            <select
              value={currentDraft.defendant.isActuallyGuilty ? 'true' : 'false'}
              onChange={(e) => updateDefendant({ isActuallyGuilty: e.target.value === 'true' })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="false">无辜（可反转剧情）</option>
              <option value="true">有罪</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-1">背景</label>
          <textarea
            value={currentDraft.defendant.background}
            onChange={(e) => updateDefendant({ background: e.target.value })}
            placeholder="被告的背景故事..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-1">外貌描述</label>
          <input
            type="text"
            value={currentDraft.defendant.appearance}
            onChange={(e) => updateDefendant({ appearance: e.target.value })}
            placeholder="用于生成立绘的描述..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium text-amber-300 mb-1">标签（用逗号分隔）</label>
        <input
          type="text"
          value={currentDraft.tags.join(', ')}
          onChange={(e) => updateBasicInfo({ 
            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
          })}
          placeholder="例：悬疑, 反转, 家庭纠纷"
          className="w-full px-3 py-2 bg-slate-800 border border-amber-900/50 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

