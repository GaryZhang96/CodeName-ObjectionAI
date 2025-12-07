/**
 * AI辅助面板 - 一键生成和润色功能
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import { CASE_TYPE_INFO, DIFFICULTY_INFO, type DetailedCaseType, type StoryDifficulty, type CourtType } from '@/data/stories/types';
import { generateFullStory, polishText } from '@/services/ai/storyGenerator';
import { cn } from '@/lib/utils';

export function AIAssistPanel() {
  const {
    currentDraft,
    updateBasicInfo,
    applyAIGeneration,
    isAIGenerating,
    setAIGenerating,
    aiGeneratingMessage,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'generate' | 'polish' | 'suggest'>('generate');
  const [generateConfig, setGenerateConfig] = useState({
    difficulty: 'beginner' as StoryDifficulty,
    detailedType: 'petty_theft' as DetailedCaseType,
    courtType: 'municipal' as CourtType,
    requiresJury: false,
    customPrompt: '',
  });
  const [polishField, setPolishField] = useState<'summary' | 'detailedBackground' | 'hiddenTruth'>('detailedBackground');

  if (!currentDraft) return null;

  const handleGenerateFullStory = async () => {
    setAIGenerating(true, '正在生成完整故事，请稍候...');
    try {
      const generated = await generateFullStory(
        generateConfig.difficulty,
        generateConfig.detailedType,
        generateConfig.courtType,
        generateConfig.requiresJury,
        generateConfig.customPrompt
      );
      
      // 更新基础配置
      updateBasicInfo({
        difficulty: generateConfig.difficulty,
        detailedType: generateConfig.detailedType,
        category: CASE_TYPE_INFO[generateConfig.detailedType].category,
        courtType: generateConfig.courtType,
        requiresJury: generateConfig.requiresJury,
      });
      
      // 应用生成的内容
      applyAIGeneration(generated);
      
      alert('✨ 故事生成成功！请检查并编辑各个部分。');
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请检查网络连接和API配置后重试');
    } finally {
      setAIGenerating(false);
    }
  };

  const handlePolishText = async () => {
    const fieldMap = {
      summary: '案情摘要',
      detailedBackground: '详细背景',
      hiddenTruth: '隐藏真相',
    };
    
    const text = currentDraft[polishField];
    if (!text.trim()) {
      alert(`请先填写${fieldMap[polishField]}`);
      return;
    }
    
    setAIGenerating(true, `正在润色${fieldMap[polishField]}...`);
    try {
      const polished = await polishText(text);
      updateBasicInfo({ [polishField]: polished });
      alert('✨ 润色完成！');
    } catch (error) {
      console.error('润色失败:', error);
      alert('润色失败，请重试');
    } finally {
      setAIGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
        🤖 AI助手
      </h2>

      {/* 加载遮罩 */}
      {isAIGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
        >
          <div className="bg-slate-900 border border-amber-500 rounded-lg p-8 max-w-md text-center">
            <div className="text-4xl mb-4 animate-bounce">🤖</div>
            <div className="text-xl text-amber-400 mb-2">AI正在工作中</div>
            <div className="text-slate-400">{aiGeneratingMessage}</div>
            <div className="mt-4 flex justify-center">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-amber-500 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 标签页 */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {[
          { id: 'generate', label: '一键生成', icon: '✨' },
          { id: 'polish', label: '文本润色', icon: '📝' },
          { id: 'suggest', label: '建议与帮助', icon: '💡' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'px-4 py-2 rounded-t transition-colors',
              activeTab === tab.id
                ? 'bg-purple-600/30 text-purple-300 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-slate-300'
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 一键生成 */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <div className="bg-purple-900/20 border border-purple-900/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">
              ✨ 生成完整故事
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              AI将根据以下配置生成完整的案件故事，包括背景、证据、证人和逻辑锁。
              生成后你可以自由编辑和调整。
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">难度</label>
                <select
                  value={generateConfig.difficulty}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, difficulty: e.target.value as StoryDifficulty })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-purple-500 focus:outline-none"
                >
                  {(Object.entries(DIFFICULTY_INFO) as [StoryDifficulty, typeof DIFFICULTY_INFO[StoryDifficulty]][]).map(([key, info]) => (
                    <option key={key} value={key}>{info.name} - {info.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">法庭</label>
                <select
                  value={generateConfig.courtType}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, courtType: e.target.value as CourtType })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="small_claims">小额法庭</option>
                  <option value="municipal">市政法庭</option>
                  <option value="superior">高等法院</option>
                  <option value="federal">联邦法院</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">案件类型</label>
              <select
                value={generateConfig.detailedType}
                onChange={(e) => {
                  const type = e.target.value as DetailedCaseType;
                  setGenerateConfig({
                    ...generateConfig,
                    detailedType: type,
                    courtType: CASE_TYPE_INFO[type].courtType,
                    requiresJury: CASE_TYPE_INFO[type].requiresJury,
                  });
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-purple-500 focus:outline-none"
              >
                <optgroup label="民事案件">
                  {(Object.entries(CASE_TYPE_INFO) as [DetailedCaseType, typeof CASE_TYPE_INFO[DetailedCaseType]][])
                    .filter(([, info]) => info.category === 'civil')
                    .map(([key, info]) => (
                      <option key={key} value={key}>{info.name}</option>
                    ))}
                </optgroup>
                <optgroup label="刑事案件 - 轻罪">
                  {(Object.entries(CASE_TYPE_INFO) as [DetailedCaseType, typeof CASE_TYPE_INFO[DetailedCaseType]][])
                    .filter(([, info]) => info.category === 'criminal' && info.severity === 'misdemeanor')
                    .map(([key, info]) => (
                      <option key={key} value={key}>{info.name}</option>
                    ))}
                </optgroup>
                <optgroup label="刑事案件 - 重罪">
                  {(Object.entries(CASE_TYPE_INFO) as [DetailedCaseType, typeof CASE_TYPE_INFO[DetailedCaseType]][])
                    .filter(([, info]) => info.category === 'criminal' && info.severity === 'felony')
                    .map(([key, info]) => (
                      <option key={key} value={key}>{info.name}</option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateConfig.requiresJury}
                  onChange={(e) => setGenerateConfig({ ...generateConfig, requiresJury: e.target.checked })}
                  className="w-4 h-4 accent-purple-500"
                />
                <span className="text-slate-300">需要陪审团</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">自定义要求（可选）</label>
              <textarea
                value={generateConfig.customPrompt}
                onChange={(e) => setGenerateConfig({ ...generateConfig, customPrompt: e.target.value })}
                placeholder="例如：故事发生在纽约，涉及科技公司高管..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleGenerateFullStory}
              disabled={isAIGenerating}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isAIGenerating ? '生成中...' : '🚀 一键生成完整故事'}
            </button>

            <p className="text-xs text-slate-500 mt-2 text-center">
              生成需要调用AI服务，可能需要10-30秒
            </p>
          </div>
        </div>
      )}

      {/* 文本润色 */}
      {activeTab === 'polish' && (
        <div className="space-y-6">
          <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-4">
              📝 文本润色
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              选择需要润色的字段，AI将帮助你改善文字表达，使其更加生动专业。
            </p>

            <div className="space-y-3 mb-4">
              {[
                { field: 'summary', label: '案情摘要', content: currentDraft.summary },
                { field: 'detailedBackground', label: '详细背景', content: currentDraft.detailedBackground },
                { field: 'hiddenTruth', label: '隐藏真相', content: currentDraft.hiddenTruth },
              ].map(item => (
                <label
                  key={item.field}
                  className={cn(
                    'block p-3 rounded border cursor-pointer transition-all',
                    polishField === item.field
                      ? 'bg-blue-600/30 border-blue-500'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="polishField"
                      checked={polishField === item.field}
                      onChange={() => setPolishField(item.field as typeof polishField)}
                      className="accent-blue-500"
                    />
                    <span className="font-medium text-white">{item.label}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {item.content || '（未填写）'}
                  </p>
                </label>
              ))}
            </div>

            <button
              onClick={handlePolishText}
              disabled={isAIGenerating || !currentDraft[polishField]}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAIGenerating ? '润色中...' : '✨ 开始润色'}
            </button>
          </div>
        </div>
      )}

      {/* 建议与帮助 */}
      {activeTab === 'suggest' && (
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-300 mb-3">
              💡 创作建议
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex gap-3">
                <span className="text-green-400">1.</span>
                <p>先确定故事的<strong className="text-amber-300">核心反转</strong>——真正的罪犯是谁？被告为什么被冤枉？</p>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400">2.</span>
                <p>设计<strong className="text-amber-300">3-5个逻辑锁</strong>，每个逻辑锁都应该关联至少1个证据和1个证人。</p>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400">3.</span>
                <p>证人的<strong className="text-amber-300">证词应该包含破绽</strong>，但不要太明显，让玩家有挑战感。</p>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400">4.</span>
                <p>检察官和法官的<strong className="text-amber-300">性格会影响游戏体验</strong>，考虑他们会如何反应。</p>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400">5.</span>
                <p>最后使用<strong className="text-amber-300">预览功能</strong>检查整体逻辑是否通顺。</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-900/20 border border-amber-900/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">
              📊 当前状态
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="text-slate-400">标题</span>
                <span className={currentDraft.title ? 'text-green-400' : 'text-red-400'}>
                  {currentDraft.title ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">背景</span>
                <span className={currentDraft.detailedBackground ? 'text-green-400' : 'text-red-400'}>
                  {currentDraft.detailedBackground ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">证据</span>
                <span className={currentDraft.evidence.length > 0 ? 'text-green-400' : 'text-red-400'}>
                  {currentDraft.evidence.length} 个
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">证人</span>
                <span className={currentDraft.witnesses.length > 0 ? 'text-green-400' : 'text-red-400'}>
                  {currentDraft.witnesses.length} 个
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">逻辑锁</span>
                <span className={currentDraft.logicalLocks.length > 0 ? 'text-green-400' : 'text-red-400'}>
                  {currentDraft.logicalLocks.length} 个
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">检察官</span>
                <span className={currentDraft.prosecutor.name ? 'text-green-400' : 'text-red-400'}>
                  {currentDraft.prosecutor.name ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

