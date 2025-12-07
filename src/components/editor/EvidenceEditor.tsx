/**
 * 证据编辑器 - 管理案件证据
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import type { EditableEvidence } from '@/data/stories/editor-types';
import { cn } from '@/lib/utils';
import { generateEvidence } from '@/services/ai/storyGenerator';

const EVIDENCE_TYPES: Array<{ value: EditableEvidence['type']; label: string; icon: string }> = [
  { value: 'physical', label: '物证', icon: '🔬' },
  { value: 'testimonial', label: '证词', icon: '💬' },
  { value: 'documentary', label: '文书', icon: '📄' },
  { value: 'digital', label: '数字', icon: '💻' },
];

export function EvidenceEditor() {
  const { 
    currentDraft, 
    addEvidence, 
    updateEvidence, 
    deleteEvidence,
    selectedItemId,
    setSelectedItem,
    isAIGenerating,
    setAIGenerating,
  } = useEditorStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [newEvidence, setNewEvidence] = useState<Partial<EditableEvidence>>({
    name: '',
    type: 'physical',
    description: '',
    content: '',
    hasContradiction: false,
    contradictionHint: '',
    source: '',
    isKeyEvidence: false,
    imageDescription: '',
  });

  if (!currentDraft) return null;

  const selectedEvidence = currentDraft.evidence.find(e => e.id === selectedItemId);

  const handleAddEvidence = () => {
    if (!newEvidence.name?.trim()) return;

    const evidence: EditableEvidence = {
      id: `evidence_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: newEvidence.name || '',
      type: newEvidence.type || 'physical',
      description: newEvidence.description || '',
      content: newEvidence.content || '',
      hasContradiction: newEvidence.hasContradiction || false,
      contradictionHint: newEvidence.contradictionHint,
      source: newEvidence.source || '',
      discovered: false,
      isKeyEvidence: newEvidence.isKeyEvidence || false,
      imageDescription: newEvidence.imageDescription,
      isLocked: false,
      editNotes: '',
    };

    addEvidence(evidence);
    setShowAddForm(false);
    setNewEvidence({
      name: '',
      type: 'physical',
      description: '',
      content: '',
      hasContradiction: false,
      source: '',
      isKeyEvidence: false,
    });
  };

  const handleAIGenerate = async () => {
    setAIGenerating(true, '正在生成证据...');
    try {
      const generated = await generateEvidence(currentDraft, aiPrompt);
      addEvidence(generated);
      setAiPrompt('');
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('AI生成失败，请重试');
    } finally {
      setAIGenerating(false);
    }
  };

  return (
    <div className="flex gap-4 h-full">
      {/* 证据列表 */}
      <div className="w-1/3 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            🔍 证据管理
          </h2>
          <span className="text-sm text-slate-400">
            {currentDraft.evidence.length} 个证据
          </span>
        </div>

        {/* AI生成区 */}
        <div className="bg-purple-900/20 border border-purple-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-400">🤖</span>
            <span className="text-sm text-purple-300">AI生成证据</span>
          </div>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="描述你想要的证据（可选）"
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

        {/* 添加按钮 */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 border-2 border-dashed border-amber-900/50 text-amber-400 rounded-lg hover:border-amber-500 hover:bg-amber-900/20 transition-colors"
        >
          + 手动添加证据
        </button>

        {/* 证据列表 */}
        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {currentDraft.evidence.map((evidence) => (
              <motion.div
                key={evidence.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => setSelectedItem(evidence.id)}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  selectedItemId === evidence.id
                    ? 'bg-amber-600/30 border-amber-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {EVIDENCE_TYPES.find(t => t.value === evidence.type)?.icon}
                    </span>
                    <div>
                      <div className="font-medium text-white">{evidence.name}</div>
                      <div className="text-xs text-slate-400">
                        {EVIDENCE_TYPES.find(t => t.value === evidence.type)?.label}
                        {evidence.isKeyEvidence && (
                          <span className="ml-2 text-amber-400">⭐ 关键</span>
                        )}
                        {evidence.hasContradiction && (
                          <span className="ml-2 text-red-400">⚡ 矛盾</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定删除这个证据？')) {
                        deleteEvidence(evidence.id);
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

          {currentDraft.evidence.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              暂无证据，点击上方按钮添加
            </div>
          )}
        </div>
      </div>

      {/* 证据详情/编辑 */}
      <div className="flex-1 bg-slate-800/30 rounded-lg p-4 border border-slate-700">
        {selectedEvidence ? (
          <EvidenceDetailEditor
            evidence={selectedEvidence}
            onUpdate={(updates) => updateEvidence(selectedEvidence.id, updates)}
          />
        ) : showAddForm ? (
          <NewEvidenceForm
            evidence={newEvidence}
            onChange={setNewEvidence}
            onSubmit={handleAddEvidence}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            选择一个证据进行编辑，或添加新证据
          </div>
        )}
      </div>
    </div>
  );
}

// 证据详情编辑器
function EvidenceDetailEditor({ 
  evidence, 
  onUpdate 
}: { 
  evidence: EditableEvidence; 
  onUpdate: (updates: Partial<EditableEvidence>) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-amber-300">编辑证据</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">证据名称 *</label>
          <input
            type="text"
            value={evidence.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">类型</label>
          <select
            value={evidence.type}
            onChange={(e) => onUpdate({ type: e.target.value as EditableEvidence['type'] })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-amber-500 focus:outline-none"
          >
            {EVIDENCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">描述（玩家可见）</label>
        <textarea
          value={evidence.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">详细内容</label>
        <textarea
          value={evidence.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">来源</label>
        <input
          type="text"
          value={evidence.source}
          onChange={(e) => onUpdate({ source: e.target.value })}
          placeholder="证据的来源"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={evidence.isKeyEvidence}
            onChange={(e) => onUpdate({ isKeyEvidence: e.target.checked })}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-amber-300">⭐ 关键证据</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={evidence.hasContradiction}
            onChange={(e) => onUpdate({ hasContradiction: e.target.checked })}
            className="w-4 h-4 accent-red-500"
          />
          <span className="text-red-300">⚡ 包含矛盾</span>
        </label>
      </div>

      {evidence.hasContradiction && (
        <div className="bg-red-900/20 border border-red-900/50 rounded p-3">
          <label className="block text-sm font-medium text-red-300 mb-1">矛盾提示（AI使用）</label>
          <textarea
            value={evidence.contradictionHint || ''}
            onChange={(e) => onUpdate({ contradictionHint: e.target.value })}
            placeholder="描述这个证据与真相之间的矛盾..."
            rows={2}
            className="w-full px-3 py-2 bg-slate-900 border border-red-900/50 rounded text-white placeholder-slate-500 focus:outline-none resize-none"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">图片描述（用于生成图像）</label>
        <input
          type="text"
          value={evidence.imageDescription || ''}
          onChange={(e) => onUpdate({ imageDescription: e.target.value })}
          placeholder="描述证据的视觉外观..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

// 新证据表单
function NewEvidenceForm({
  evidence,
  onChange,
  onSubmit,
  onCancel,
}: {
  evidence: Partial<EditableEvidence>;
  onChange: (evidence: Partial<EditableEvidence>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-amber-300">添加新证据</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">证据名称 *</label>
          <input
            type="text"
            value={evidence.name || ''}
            onChange={(e) => onChange({ ...evidence, name: e.target.value })}
            placeholder="例：血迹样本"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">类型</label>
          <select
            value={evidence.type || 'physical'}
            onChange={(e) => onChange({ ...evidence, type: e.target.value as EditableEvidence['type'] })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-amber-500 focus:outline-none"
          >
            {EVIDENCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">描述</label>
        <textarea
          value={evidence.description || ''}
          onChange={(e) => onChange({ ...evidence, description: e.target.value })}
          rows={2}
          placeholder="证据的简要描述..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">详细内容</label>
        <textarea
          value={evidence.content || ''}
          onChange={(e) => onChange({ ...evidence, content: e.target.value })}
          rows={4}
          placeholder="证据的详细内容..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={evidence.isKeyEvidence || false}
            onChange={(e) => onChange({ ...evidence, isKeyEvidence: e.target.checked })}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-amber-300">⭐ 关键证据</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={evidence.hasContradiction || false}
            onChange={(e) => onChange({ ...evidence, hasContradiction: e.target.checked })}
            className="w-4 h-4 accent-red-500"
          />
          <span className="text-red-300">⚡ 包含矛盾</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onSubmit}
          disabled={!evidence.name?.trim()}
          className="flex-1 py-2 bg-amber-600 text-black font-semibold rounded hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          添加证据
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}

