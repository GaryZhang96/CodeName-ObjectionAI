/**
 * 逻辑锁编辑器 - 设计证据与真相之间的矛盾点
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import type { EditableLogicalLock } from '@/data/stories/editor-types';
import { cn } from '@/lib/utils';
import { generateLogicalLock } from '@/services/ai/storyGenerator';

const CONTRADICTION_TYPES: Array<{
  value: EditableLogicalLock['contradictionType'];
  label: string;
  icon: string;
  description: string;
}> = [
  { value: 'time', label: '时间矛盾', icon: '⏰', description: '时间线不一致' },
  { value: 'location', label: '地点矛盾', icon: '📍', description: '地点或位置冲突' },
  { value: 'physical', label: '物理矛盾', icon: '🔬', description: '物证与陈述不符' },
  { value: 'motive', label: '动机矛盾', icon: '💭', description: '行为动机不合理' },
  { value: 'testimony', label: '证词矛盾', icon: '💬', description: '证词之间冲突' },
];

export function LogicalLockEditor() {
  const {
    currentDraft,
    addLogicalLock,
    updateLogicalLock,
    deleteLogicalLock,
    selectedItemId,
    setSelectedItem,
    isAIGenerating,
    setAIGenerating,
  } = useEditorStore();

  const [aiPrompt, setAiPrompt] = useState('');

  if (!currentDraft) return null;

  const selectedLock = currentDraft.logicalLocks.find(l => l.id === selectedItemId);

  const handleAIGenerate = async () => {
    if (currentDraft.evidence.length === 0 || currentDraft.witnesses.length === 0) {
      alert('请先添加证据和证人，以便AI生成相关联的逻辑锁');
      return;
    }
    
    setAIGenerating(true, '正在生成逻辑锁...');
    try {
      const generated = await generateLogicalLock(currentDraft, aiPrompt);
      addLogicalLock(generated);
      setAiPrompt('');
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('AI生成失败，请重试');
    } finally {
      setAIGenerating(false);
    }
  };

  const createEmptyLock = (): EditableLogicalLock => ({
    id: `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    surfaceClaim: '',
    hiddenTruth: '',
    contradictionType: 'testimony',
    hint: '',
    relatedEvidenceIds: [],
    relatedWitnessIds: [],
    breakDialogue: '',
    difficultyRating: 3,
    isLocked: false,
    editNotes: '',
  });

  return (
    <div className="flex gap-4 h-full">
      {/* 逻辑锁列表 */}
      <div className="w-1/3 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            🔐 逻辑锁
          </h2>
          <span className="text-sm text-slate-400">
            {currentDraft.logicalLocks.length} 个逻辑锁
          </span>
        </div>

        {/* AI生成区 */}
        <div className="bg-purple-900/20 border border-purple-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-400">🤖</span>
            <span className="text-sm text-purple-300">AI生成逻辑锁</span>
          </div>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="描述矛盾点特点（可选）"
            className="w-full px-2 py-1 bg-slate-800 border border-purple-900/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none mb-2"
          />
          <button
            onClick={handleAIGenerate}
            disabled={isAIGenerating}
            className="w-full py-1.5 bg-purple-600/50 text-purple-200 rounded text-sm hover:bg-purple-600/70 disabled:opacity-50 transition-colors"
          >
            {isAIGenerating ? '生成中...' : '✨ AI生成'}
          </button>
        </div>

        {/* 提示信息 */}
        <div className="bg-amber-900/20 border border-amber-900/30 rounded p-2 text-xs text-amber-300/80">
          💡 逻辑锁是表面证词/证据与隐藏真相之间的矛盾点。玩家需要通过交叉询问和出示证据来破解它们。
        </div>

        {/* 添加按钮 */}
        <button
          onClick={() => {
            const newLock = createEmptyLock();
            addLogicalLock(newLock);
            setSelectedItem(newLock.id);
          }}
          className="w-full py-2 border-2 border-dashed border-amber-900/50 text-amber-400 rounded-lg hover:border-amber-500 hover:bg-amber-900/20 transition-colors"
        >
          + 手动添加逻辑锁
        </button>

        {/* 逻辑锁列表 */}
        <div className="space-y-2 max-h-[calc(100vh-480px)] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {currentDraft.logicalLocks.map((lock, index) => (
              <motion.div
                key={lock.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => setSelectedItem(lock.id)}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  selectedItemId === lock.id
                    ? 'bg-amber-600/30 border-amber-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">#{index + 1}</span>
                      <span className="text-lg">
                        {CONTRADICTION_TYPES.find(t => t.value === lock.contradictionType)?.icon}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={cn(
                              'text-xs',
                              star <= lock.difficultyRating ? 'text-amber-400' : 'text-slate-600'
                            )}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-white mt-1 truncate">
                      {lock.surfaceClaim || '（未设置表面陈述）'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {lock.relatedEvidenceIds.length} 证据 · {lock.relatedWitnessIds.length} 证人
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定删除这个逻辑锁？')) {
                        deleteLogicalLock(lock.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 px-2"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {currentDraft.logicalLocks.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              暂无逻辑锁，点击上方按钮添加
            </div>
          )}
        </div>
      </div>

      {/* 逻辑锁详情/编辑 */}
      <div className="flex-1 bg-slate-800/30 rounded-lg p-4 border border-slate-700 overflow-y-auto custom-scrollbar">
        {selectedLock ? (
          <LogicalLockDetailEditor
            lock={selectedLock}
            onUpdate={(updates) => updateLogicalLock(selectedLock.id, updates)}
            evidence={currentDraft.evidence}
            witnesses={currentDraft.witnesses}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            选择一个逻辑锁进行编辑，或添加新逻辑锁
          </div>
        )}
      </div>
    </div>
  );
}

// 逻辑锁详情编辑器
function LogicalLockDetailEditor({
  lock,
  onUpdate,
  evidence,
  witnesses,
}: {
  lock: EditableLogicalLock;
  onUpdate: (updates: Partial<EditableLogicalLock>) => void;
  evidence: Array<{ id: string; name: string }>;
  witnesses: Array<{ id: string; name: string }>;
}) {
  const toggleEvidence = (evidenceId: string) => {
    const ids = lock.relatedEvidenceIds.includes(evidenceId)
      ? lock.relatedEvidenceIds.filter(id => id !== evidenceId)
      : [...lock.relatedEvidenceIds, evidenceId];
    onUpdate({ relatedEvidenceIds: ids });
  };

  const toggleWitness = (witnessId: string) => {
    const ids = lock.relatedWitnessIds.includes(witnessId)
      ? lock.relatedWitnessIds.filter(id => id !== witnessId)
      : [...lock.relatedWitnessIds, witnessId];
    onUpdate({ relatedWitnessIds: ids });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-amber-300">编辑逻辑锁</h3>

      {/* 矛盾类型 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">矛盾类型</label>
        <div className="grid grid-cols-5 gap-2">
          {CONTRADICTION_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onUpdate({ contradictionType: type.value })}
              className={cn(
                'p-2 rounded border text-center transition-all',
                lock.contradictionType === type.value
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
              )}
            >
              <div className="text-xl">{type.icon}</div>
              <div className="text-xs mt-1">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 难度评级 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          难度评级
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              onClick={() => onUpdate({ difficultyRating: rating as 1 | 2 | 3 | 4 | 5 })}
              className={cn(
                'text-2xl transition-colors',
                rating <= lock.difficultyRating ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
              )}
            >
              ★
            </button>
          ))}
          <span className="text-sm text-slate-400 ml-2">
            {lock.difficultyRating === 1 && '简单'}
            {lock.difficultyRating === 2 && '较易'}
            {lock.difficultyRating === 3 && '中等'}
            {lock.difficultyRating === 4 && '困难'}
            {lock.difficultyRating === 5 && '极难'}
          </span>
        </div>
      </div>

      {/* 表面陈述 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">表面陈述/证据 *</label>
        <textarea
          value={lock.surfaceClaim}
          onChange={(e) => onUpdate({ surfaceClaim: e.target.value })}
          placeholder="看起来正确但实际可被推翻的陈述..."
          rows={3}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      {/* 隐藏真相 */}
      <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
        <label className="block text-sm font-medium text-red-300 mb-1">🔒 隐藏真相 *</label>
        <textarea
          value={lock.hiddenTruth}
          onChange={(e) => onUpdate({ hiddenTruth: e.target.value })}
          placeholder="实际的真相是什么？"
          rows={3}
          className="w-full px-3 py-2 bg-slate-900 border border-red-900/50 rounded text-white placeholder-slate-500 focus:outline-none resize-none"
        />
      </div>

      {/* 破解提示 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">破解提示</label>
        <textarea
          value={lock.hint}
          onChange={(e) => onUpdate({ hint: e.target.value })}
          placeholder="给玩家的提示（可在调查阶段购买）"
          rows={2}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      {/* 关联证据 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">关联证据</label>
        {evidence.length === 0 ? (
          <p className="text-xs text-slate-500">请先添加证据</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {evidence.map((e) => (
              <button
                key={e.id}
                onClick={() => toggleEvidence(e.id)}
                className={cn(
                  'px-3 py-1 rounded text-sm transition-colors',
                  lock.relatedEvidenceIds.includes(e.id)
                    ? 'bg-amber-600 text-black'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                🔍 {e.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 关联证人 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">关联证人</label>
        {witnesses.length === 0 ? (
          <p className="text-xs text-slate-500">请先添加证人</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {witnesses.map((w) => (
              <button
                key={w.id}
                onClick={() => toggleWitness(w.id)}
                className={cn(
                  'px-3 py-1 rounded text-sm transition-colors',
                  lock.relatedWitnessIds.includes(w.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                👤 {w.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 破解对话 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">破解时的对话（可选）</label>
        <textarea
          value={lock.breakDialogue || ''}
          onChange={(e) => onUpdate({ breakDialogue: e.target.value })}
          placeholder="当玩家成功破解这个逻辑锁时，显示的特殊对话..."
          rows={2}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      {/* 编辑备注 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">编辑备注（仅自己可见）</label>
        <input
          type="text"
          value={lock.editNotes}
          onChange={(e) => onUpdate({ editNotes: e.target.value })}
          placeholder="添加备注..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
        />
      </div>
    </div>
  );
}


