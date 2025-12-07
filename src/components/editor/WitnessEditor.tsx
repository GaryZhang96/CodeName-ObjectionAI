/**
 * 证人编辑器 - 管理案件证人
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import type { EditableWitness } from '@/data/stories/editor-types';
import { cn } from '@/lib/utils';
import { generateWitness } from '@/services/ai/storyGenerator';

const PERSONALITY_TRAITS = [
  '诚实', '狡猾', '胆小', '暴躁', '冷静', '善良', '贪婪', '骄傲',
  '多疑', '冲动', '理性', '感性', '固执', '灵活', '内向', '外向',
];

export function WitnessEditor() {
  const {
    currentDraft,
    addWitness,
    updateWitness,
    deleteWitness,
    selectedItemId,
    setSelectedItem,
    isAIGenerating,
    setAIGenerating,
  } = useEditorStore();

  const [aiPrompt, setAiPrompt] = useState('');

  if (!currentDraft) return null;

  const selectedWitness = currentDraft.witnesses.find(w => w.id === selectedItemId);

  const handleAIGenerate = async () => {
    setAIGenerating(true, '正在生成证人...');
    try {
      const generated = await generateWitness(currentDraft, aiPrompt);
      addWitness(generated);
      setAiPrompt('');
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('AI生成失败，请重试');
    } finally {
      setAIGenerating(false);
    }
  };

  const createEmptyWitness = (): EditableWitness => ({
    id: `witness_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: '',
    role: '',
    age: 30,
    personality: {
      honesty: 50,
      stability: 50,
      aggression: 30,
      intelligence: 50,
      traits: [],
    },
    appearance: '',
    initialTestimony: '',
    hiddenSecret: '',
    weakPoints: [],
    relationships: {},
    portraitDescription: '',
    relationToCase: '',
    motivation: '',
    isLocked: false,
    editNotes: '',
  });

  return (
    <div className="flex gap-4 h-full">
      {/* 证人列表 */}
      <div className="w-1/3 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            👥 证人设计
          </h2>
          <span className="text-sm text-slate-400">
            {currentDraft.witnesses.length} 个证人
          </span>
        </div>

        {/* AI生成区 */}
        <div className="bg-purple-900/20 border border-purple-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-400">🤖</span>
            <span className="text-sm text-purple-300">AI生成证人</span>
          </div>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="描述证人特点（可选）"
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
          onClick={() => {
            const newWitness = createEmptyWitness();
            addWitness(newWitness);
            setSelectedItem(newWitness.id);
            setShowAddForm(false);
          }}
          className="w-full py-2 border-2 border-dashed border-amber-900/50 text-amber-400 rounded-lg hover:border-amber-500 hover:bg-amber-900/20 transition-colors"
        >
          + 手动添加证人
        </button>

        {/* 证人列表 */}
        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {currentDraft.witnesses.map((witness) => (
              <motion.div
                key={witness.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => setSelectedItem(witness.id)}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  selectedItemId === witness.id
                    ? 'bg-amber-600/30 border-amber-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-white">
                      {witness.name || '未命名证人'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {witness.role || '身份不明'}
                      {witness.age && ` · ${witness.age}岁`}
                    </div>
                    {witness.personality.traits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {witness.personality.traits.slice(0, 3).map((trait) => (
                          <span
                            key={trait}
                            className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-300"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定删除这个证人？')) {
                        deleteWitness(witness.id);
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

          {currentDraft.witnesses.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              暂无证人，点击上方按钮添加
            </div>
          )}
        </div>
      </div>

      {/* 证人详情/编辑 */}
      <div className="flex-1 bg-slate-800/30 rounded-lg p-4 border border-slate-700 overflow-y-auto custom-scrollbar">
        {selectedWitness ? (
          <WitnessDetailEditor
            witness={selectedWitness}
            onUpdate={(updates) => updateWitness(selectedWitness.id, updates)}
            allCharacters={[
              currentDraft.defendant.name,
              ...currentDraft.witnesses.filter(w => w.id !== selectedWitness.id).map(w => w.name),
            ].filter(Boolean)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            选择一个证人进行编辑，或添加新证人
          </div>
        )}
      </div>
    </div>
  );
}

// 证人详情编辑器
function WitnessDetailEditor({
  witness,
  onUpdate,
  allCharacters,
}: {
  witness: EditableWitness;
  onUpdate: (updates: Partial<EditableWitness>) => void;
  allCharacters: string[];
}) {
  const [newWeakPoint, setNewWeakPoint] = useState('');
  const [newRelationName, setNewRelationName] = useState('');
  const [newRelationDesc, setNewRelationDesc] = useState('');

  const handleAddWeakPoint = () => {
    if (!newWeakPoint.trim()) return;
    onUpdate({ weakPoints: [...witness.weakPoints, newWeakPoint.trim()] });
    setNewWeakPoint('');
  };

  const handleRemoveWeakPoint = (index: number) => {
    onUpdate({ weakPoints: witness.weakPoints.filter((_, i) => i !== index) });
  };

  const handleAddRelation = () => {
    if (!newRelationName.trim() || !newRelationDesc.trim()) return;
    onUpdate({
      relationships: {
        ...witness.relationships,
        [newRelationName.trim()]: newRelationDesc.trim(),
      },
    });
    setNewRelationName('');
    setNewRelationDesc('');
  };

  const handleRemoveRelation = (name: string) => {
    const { [name]: _, ...rest } = witness.relationships;
    onUpdate({ relationships: rest });
  };

  const handleToggleTrait = (trait: string) => {
    const traits = witness.personality.traits.includes(trait)
      ? witness.personality.traits.filter(t => t !== trait)
      : [...witness.personality.traits, trait];
    onUpdate({
      personality: { ...witness.personality, traits },
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-amber-300">编辑证人</h3>

      {/* 基本信息 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">姓名 *</label>
          <input
            type="text"
            value={witness.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="证人姓名"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">身份/职业</label>
          <input
            type="text"
            value={witness.role}
            onChange={(e) => onUpdate({ role: e.target.value })}
            placeholder="例：餐厅服务员"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">年龄</label>
          <input
            type="number"
            value={witness.age}
            onChange={(e) => onUpdate({ age: parseInt(e.target.value) || 0 })}
            min={1}
            max={120}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 外貌描述 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">外貌描述</label>
        <input
          type="text"
          value={witness.appearance}
          onChange={(e) => onUpdate({ appearance: e.target.value })}
          placeholder="描述证人的外貌特征..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* 性格属性滑块 */}
      <div className="border border-slate-700 rounded-lg p-4">
        <h4 className="font-semibold text-amber-300 mb-3">性格属性</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'honesty', label: '诚实度', low: '狡猾', high: '诚实' },
            { key: 'stability', label: '稳定性', low: '不稳定', high: '稳定' },
            { key: 'aggression', label: '攻击性', low: '温和', high: '好斗' },
            { key: 'intelligence', label: '智力', low: '迟钝', high: '聪明' },
          ].map(({ key, label, low, high }) => (
            <div key={key}>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{low}</span>
                <span className="text-amber-300">{label}: {witness.personality[key as keyof typeof witness.personality]}</span>
                <span>{high}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={witness.personality[key as keyof typeof witness.personality] as number}
                onChange={(e) =>
                  onUpdate({
                    personality: {
                      ...witness.personality,
                      [key]: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-amber-500"
              />
            </div>
          ))}
        </div>

        {/* 性格标签 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">性格特征</label>
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_TRAITS.map((trait) => (
              <button
                key={trait}
                onClick={() => handleToggleTrait(trait)}
                className={cn(
                  'px-2 py-1 rounded text-xs transition-colors',
                  witness.personality.traits.includes(trait)
                    ? 'bg-amber-600 text-black'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                {trait}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 与案件关系 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">与案件的关系</label>
          <input
            type="text"
            value={witness.relationToCase}
            onChange={(e) => onUpdate({ relationToCase: e.target.value })}
            placeholder="例：案发时在场的目击者"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">作证动机</label>
          <input
            type="text"
            value={witness.motivation}
            onChange={(e) => onUpdate({ motivation: e.target.value })}
            placeholder="为什么要作证？"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 初始证词 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">初始证词</label>
        <textarea
          value={witness.initialTestimony}
          onChange={(e) => onUpdate({ initialTestimony: e.target.value })}
          placeholder="证人会在庭审中陈述的初始证词..."
          rows={4}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>

      {/* 隐藏秘密 */}
      <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
        <label className="block text-sm font-medium text-red-300 mb-1">🔒 隐藏的秘密</label>
        <textarea
          value={witness.hiddenSecret}
          onChange={(e) => onUpdate({ hiddenSecret: e.target.value })}
          placeholder="证人隐瞒的真相或秘密..."
          rows={3}
          className="w-full px-3 py-2 bg-slate-900 border border-red-900/50 rounded text-white placeholder-slate-500 focus:outline-none resize-none"
        />
      </div>

      {/* 弱点 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">弱点/可追问的点</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newWeakPoint}
            onChange={(e) => setNewWeakPoint(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWeakPoint()}
            placeholder="添加弱点..."
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleAddWeakPoint}
            className="px-4 py-2 bg-amber-600 text-black rounded hover:bg-amber-500 transition-colors"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {witness.weakPoints.map((point, index) => (
            <span
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-sm text-slate-300"
            >
              {point}
              <button
                onClick={() => handleRemoveWeakPoint(index)}
                className="text-red-400 hover:text-red-300 ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 人物关系 */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">与其他角色的关系</label>
        <div className="flex gap-2 mb-2">
          <select
            value={newRelationName}
            onChange={(e) => setNewRelationName(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="">选择角色...</option>
            {allCharacters
              .filter(name => !witness.relationships[name])
              .map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
          </select>
          <input
            type="text"
            value={newRelationDesc}
            onChange={(e) => setNewRelationDesc(e.target.value)}
            placeholder="关系描述"
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleAddRelation}
            disabled={!newRelationName || !newRelationDesc}
            className="px-4 py-2 bg-amber-600 text-black rounded hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            添加
          </button>
        </div>
        <div className="space-y-2">
          {Object.entries(witness.relationships).map(([name, desc]) => (
            <div
              key={name}
              className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded"
            >
              <div>
                <span className="text-amber-300">{name}</span>
                <span className="text-slate-400 mx-2">→</span>
                <span className="text-white">{desc}</span>
              </div>
              <button
                onClick={() => handleRemoveRelation(name)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

