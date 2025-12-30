/**
 * 角色人设编辑器 - 配置检察官和法官
 */

import { useEditorStore } from '@/store/editorStore';
import type { ProsecutorConfig, JudgeConfig } from '@/data/stories/editor-types';
import { cn } from '@/lib/utils';
import { generateProsecutor, generateJudge } from '@/services/ai/storyGenerator';

const PROSECUTOR_STYLES: Array<{
  value: ProsecutorConfig['style'];
  label: string;
  icon: string;
  description: string;
}> = [
  { value: 'aggressive', label: '咄咄逼人', icon: '🔥', description: '强势进攻，施加压力' },
  { value: 'methodical', label: '条理分明', icon: '📊', description: '逻辑严密，步步为营' },
  { value: 'theatrical', label: '戏剧夸张', icon: '🎭', description: '表演性强，煽动情绪' },
  { value: 'cunning', label: '老谋深算', icon: '🦊', description: '狡猾多变，设置陷阱' },
];

const JUDGE_STYLES: Array<{
  value: JudgeConfig['style'];
  label: string;
  icon: string;
  description: string;
}> = [
  { value: 'lenient', label: '宽容温和', icon: '😊', description: '倾向于给被告机会' },
  { value: 'strict', label: '严厉公正', icon: '⚖️', description: '严格遵循程序' },
  { value: 'by_the_book', label: '按章办事', icon: '📖', description: '完全照搬法律条文' },
  { value: 'unpredictable', label: '难以捉摸', icon: '🎲', description: '判断标准飘忽不定' },
];

export function CharacterEditor() {
  const {
    currentDraft,
    updateProsecutor,
    updateJudge,
    isAIGenerating,
    setAIGenerating,
  } = useEditorStore();

  if (!currentDraft) return null;

  const handleGenerateProsecutor = async () => {
    setAIGenerating(true, '正在生成检察官...');
    try {
      const generated = await generateProsecutor(currentDraft);
      updateProsecutor(generated);
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('AI生成失败，请重试');
    } finally {
      setAIGenerating(false);
    }
  };

  const handleGenerateJudge = async () => {
    setAIGenerating(true, '正在生成法官...');
    try {
      const generated = await generateJudge(currentDraft);
      updateJudge(generated);
    } catch (error) {
      console.error('AI生成失败:', error);
      alert('AI生成失败，请重试');
    } finally {
      setAIGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
        🎭 角色人设
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {/* 检察官编辑 */}
        <div className="bg-slate-800/50 border border-red-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-red-300 flex items-center gap-2">
              ⚔️ 检察官
            </h3>
            <button
              onClick={handleGenerateProsecutor}
              disabled={isAIGenerating}
              className="px-3 py-1 bg-purple-600/50 text-purple-200 rounded text-sm hover:bg-purple-600/70 disabled:opacity-50 transition-colors"
            >
              {isAIGenerating ? '...' : '🤖 AI生成'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">姓名 *</label>
                <input
                  type="text"
                  value={currentDraft.prosecutor.name}
                  onChange={(e) => updateProsecutor({ name: e.target.value })}
                  placeholder="检察官姓名"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">年龄</label>
                <input
                  type="number"
                  value={currentDraft.prosecutor.age}
                  onChange={(e) => updateProsecutor({ age: parseInt(e.target.value) || 35 })}
                  min={25}
                  max={80}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">外貌描述</label>
              <input
                type="text"
                value={currentDraft.prosecutor.appearance}
                onChange={(e) => updateProsecutor({ appearance: e.target.value })}
                placeholder="描述外貌特征..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">诉讼风格</label>
              <div className="grid grid-cols-2 gap-2">
                {PROSECUTOR_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => updateProsecutor({ style: style.value })}
                    className={cn(
                      'p-2 rounded border text-left transition-all',
                      currentDraft.prosecutor.style === style.value
                        ? 'bg-red-600/30 border-red-500 text-red-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{style.icon}</span>
                      <span className="font-medium">{style.label}</span>
                    </div>
                    <div className="text-xs opacity-60 mt-1">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">性格描述</label>
              <textarea
                value={currentDraft.prosecutor.personality}
                onChange={(e) => updateProsecutor({ personality: e.target.value })}
                placeholder="检察官的性格特点..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-red-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">背景故事</label>
              <textarea
                value={currentDraft.prosecutor.backstory}
                onChange={(e) => updateProsecutor({ backstory: e.target.value })}
                placeholder="检察官的经历和背景..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-red-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">口头禅</label>
                <input
                  type="text"
                  value={currentDraft.prosecutor.catchphrase}
                  onChange={(e) => updateProsecutor({ catchphrase: e.target.value })}
                  placeholder="例：正义必将降临！"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">弱点</label>
                <input
                  type="text"
                  value={currentDraft.prosecutor.weakness}
                  onChange={(e) => updateProsecutor({ weakness: e.target.value })}
                  placeholder="例：容易被激怒"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">与案件的关系</label>
              <input
                type="text"
                value={currentDraft.prosecutor.relationToCase}
                onChange={(e) => updateProsecutor({ relationToCase: e.target.value })}
                placeholder="为什么接手这个案件？"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 法官编辑 */}
        <div className="bg-slate-800/50 border border-blue-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-300 flex items-center gap-2">
              👨‍⚖️ 法官
            </h3>
            <button
              onClick={handleGenerateJudge}
              disabled={isAIGenerating}
              className="px-3 py-1 bg-purple-600/50 text-purple-200 rounded text-sm hover:bg-purple-600/70 disabled:opacity-50 transition-colors"
            >
              {isAIGenerating ? '...' : '🤖 AI生成'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">姓名 *</label>
                <input
                  type="text"
                  value={currentDraft.judge.name}
                  onChange={(e) => updateJudge({ name: e.target.value })}
                  placeholder="法官姓名"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">年龄</label>
                <input
                  type="number"
                  value={currentDraft.judge.age}
                  onChange={(e) => updateJudge({ age: parseInt(e.target.value) || 55 })}
                  min={35}
                  max={90}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">外貌描述</label>
              <input
                type="text"
                value={currentDraft.judge.appearance}
                onChange={(e) => updateJudge({ appearance: e.target.value })}
                placeholder="描述外貌特征..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">严厉程度</label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">宽容</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={currentDraft.judge.strictness}
                  onChange={(e) => updateJudge({ strictness: parseInt(e.target.value) })}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-sm text-slate-400">严厉</span>
                <span className="text-blue-300 font-bold w-8 text-center">
                  {currentDraft.judge.strictness}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">审判风格</label>
              <div className="grid grid-cols-2 gap-2">
                {JUDGE_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => updateJudge({ style: style.value })}
                    className={cn(
                      'p-2 rounded border text-left transition-all',
                      currentDraft.judge.style === style.value
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{style.icon}</span>
                      <span className="font-medium">{style.label}</span>
                    </div>
                    <div className="text-xs opacity-60 mt-1">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">性格描述</label>
              <textarea
                value={currentDraft.judge.personality}
                onChange={(e) => updateJudge({ personality: e.target.value })}
                placeholder="法官的性格特点..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">特殊偏好</label>
              <input
                type="text"
                value={currentDraft.judge.preferences}
                onChange={(e) => updateJudge({ preferences: e.target.value })}
                placeholder="例：讨厌冗长的陈述"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">背景故事</label>
              <textarea
                value={currentDraft.judge.backstory}
                onChange={(e) => updateJudge({ backstory: e.target.value })}
                placeholder="法官的经历和背景..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 快速预览 */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
        <h4 className="font-semibold text-amber-300 mb-3">💡 角色预览</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-900/50 rounded p-3">
            <div className="text-red-300 font-medium mb-2">
              {currentDraft.prosecutor.name || '检察官'}
              <span className="text-slate-500 ml-2">
                {PROSECUTOR_STYLES.find(s => s.value === currentDraft.prosecutor.style)?.label}
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              {currentDraft.prosecutor.personality || '（未设置性格）'}
            </p>
            {currentDraft.prosecutor.catchphrase && (
              <p className="text-amber-400/80 text-xs mt-2 italic">
                "{currentDraft.prosecutor.catchphrase}"
              </p>
            )}
          </div>
          <div className="bg-slate-900/50 rounded p-3">
            <div className="text-blue-300 font-medium mb-2">
              {currentDraft.judge.name || '法官'}
              <span className="text-slate-500 ml-2">
                严厉度 {currentDraft.judge.strictness}/10
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              {currentDraft.judge.personality || '（未设置性格）'}
            </p>
            {currentDraft.judge.preferences && (
              <p className="text-amber-400/80 text-xs mt-2">
                偏好：{currentDraft.judge.preferences}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


