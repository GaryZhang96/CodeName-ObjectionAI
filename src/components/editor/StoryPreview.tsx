/**
 * 故事预览 - 预览和验证故事
 */

import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import { CASE_TYPE_INFO, DIFFICULTY_INFO } from '@/data/stories/types';
import { cn } from '@/lib/utils';

export function StoryPreview() {
  const {
    currentDraft,
    validateDraft,
    showValidation,
    setShowValidation,
    exportDraft,
  } = useEditorStore();

  if (!currentDraft) return null;

  const handleValidate = () => {
    const status = validateDraft();
    if (status.isValid) {
      alert('✅ 故事验证通过！可以导出或开始游戏。');
    }
  };

  const handleExport = () => {
    const exported = exportDraft();
    if (!exported) return;

    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDraft.title || 'story'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const caseTypeInfo = CASE_TYPE_INFO[currentDraft.detailedType];
  const difficultyInfo = DIFFICULTY_INFO[currentDraft.difficulty];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
          👁️ 故事预览
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleValidate}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
          >
            ✓ 验证故事
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
          >
            📤 导出JSON
          </button>
        </div>
      </div>

      {/* 验证结果 */}
      {showValidation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-4 rounded-lg border',
            currentDraft.validationStatus.isValid
              ? 'bg-green-900/20 border-green-500'
              : 'bg-red-900/20 border-red-500'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={cn(
              'font-semibold',
              currentDraft.validationStatus.isValid ? 'text-green-300' : 'text-red-300'
            )}>
              {currentDraft.validationStatus.isValid ? '✅ 验证通过' : '❌ 验证失败'}
            </h3>
            <button
              onClick={() => setShowValidation(false)}
              className="text-slate-400 hover:text-slate-300"
            >
              ×
            </button>
          </div>
          
          {currentDraft.validationStatus.errors.length > 0 && (
            <div className="space-y-1 mb-2">
              {currentDraft.validationStatus.errors.map((error, i) => (
                <div key={i} className="text-sm text-red-400">
                  ❌ {error.message}
                </div>
              ))}
            </div>
          )}
          
          {currentDraft.validationStatus.warnings.length > 0 && (
            <div className="space-y-1">
              {currentDraft.validationStatus.warnings.map((warning, i) => (
                <div key={i} className="text-sm text-amber-400">
                  ⚠️ {warning.message}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* 预览内容 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 主要信息 */}
        <div className="col-span-2 space-y-4">
          {/* 标题卡片 */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-900/50 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">{currentDraft.subtitle || 'Case #???'}</div>
                <h1 className="text-3xl font-bold text-amber-400">
                  {currentDraft.title || '未命名故事'}
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <span className={cn('px-2 py-1 rounded text-sm font-medium', difficultyInfo.color, 'bg-slate-800')}>
                    {difficultyInfo.name}
                  </span>
                  <span className="text-slate-400 text-sm">{caseTypeInfo.name}</span>
                  {currentDraft.requiresJury && (
                    <span className="text-blue-400 text-sm">👥 陪审团</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">作者</div>
                <div className="text-slate-300">{currentDraft.author}</div>
              </div>
            </div>
            
            {currentDraft.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {currentDraft.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 案情摘要 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">📋 案情摘要</h3>
            <p className="text-slate-300 whitespace-pre-wrap">
              {currentDraft.summary || '（未填写）'}
            </p>
          </div>

          {/* 详细背景 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-2">📖 详细背景</h3>
            <p className="text-slate-300 whitespace-pre-wrap text-sm">
              {currentDraft.detailedBackground || '（未填写）'}
            </p>
          </div>

          {/* 被告信息 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">👤 被告</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-slate-500">姓名</div>
                <div className="text-white">{currentDraft.defendant.name || '未设定'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">年龄</div>
                <div className="text-white">{currentDraft.defendant.age}岁</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">职业</div>
                <div className="text-white">{currentDraft.defendant.occupation || '未设定'}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-500 mb-1">背景</div>
              <p className="text-slate-400 text-sm">{currentDraft.defendant.background || '（未填写）'}</p>
            </div>
          </div>

          {/* 隐藏真相（警告框） */}
          <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-300 mb-2">🔒 隐藏真相</h3>
            <p className="text-red-200/80 whitespace-pre-wrap text-sm">
              {currentDraft.hiddenTruth || '（未填写）'}
            </p>
            <div className="mt-3 pt-3 border-t border-red-900/30">
              <span className="text-xs text-red-400">真正的罪犯: </span>
              <span className="text-red-300">{currentDraft.trueGuiltyParty || '未指定'}</span>
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-4">
          {/* 角色卡片 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">🎭 角色</h3>
            
            {/* 检察官 */}
            <div className="mb-4 pb-4 border-b border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-400">⚔️</span>
                <span className="font-medium text-red-300">
                  {currentDraft.prosecutor.name || '检察官'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {currentDraft.prosecutor.personality || '（未设置性格）'}
              </div>
              {currentDraft.prosecutor.catchphrase && (
                <div className="text-xs text-amber-400/80 mt-1 italic">
                  "{currentDraft.prosecutor.catchphrase}"
                </div>
              )}
            </div>

            {/* 法官 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400">👨‍⚖️</span>
                <span className="font-medium text-blue-300">
                  {currentDraft.judge.name || '法官'}
                </span>
                <span className="text-xs text-slate-500">
                  严厉度 {currentDraft.judge.strictness}/10
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {currentDraft.judge.personality || '（未设置性格）'}
              </div>
            </div>
          </div>

          {/* 证据列表 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">
              🔍 证据 ({currentDraft.evidence.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {currentDraft.evidence.length === 0 ? (
                <p className="text-xs text-slate-500">暂无证据</p>
              ) : (
                currentDraft.evidence.map((e) => (
                  <div key={e.id} className="text-sm">
                    <span className="text-white">{e.name}</span>
                    {e.isKeyEvidence && <span className="ml-1 text-amber-400">⭐</span>}
                    {e.hasContradiction && <span className="ml-1 text-red-400">⚡</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 证人列表 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">
              👥 证人 ({currentDraft.witnesses.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {currentDraft.witnesses.length === 0 ? (
                <p className="text-xs text-slate-500">暂无证人</p>
              ) : (
                currentDraft.witnesses.map((w) => (
                  <div key={w.id} className="text-sm">
                    <span className="text-white">{w.name || '未命名'}</span>
                    <span className="text-slate-500 ml-2 text-xs">{w.role || '身份不明'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 逻辑锁列表 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">
              🔐 逻辑锁 ({currentDraft.logicalLocks.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {currentDraft.logicalLocks.length === 0 ? (
                <p className="text-xs text-slate-500">暂无逻辑锁</p>
              ) : (
                currentDraft.logicalLocks.map((l, i) => (
                  <div key={l.id} className="text-sm">
                    <span className="text-amber-400">#{i + 1}</span>
                    <span className="text-white ml-2 truncate">
                      {l.surfaceClaim?.substring(0, 30) || '（未设置）'}...
                    </span>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {l.relatedEvidenceIds.length} 证据 · {l.relatedWitnessIds.length} 证人
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


