/**
 * UGC故事编辑器主屏幕
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import { useGameStore } from '@/store/gameStore';
import {
  EditorSidebar,
  BasicInfoEditor,
  EvidenceEditor,
  WitnessEditor,
  CharacterEditor,
  LogicalLockEditor,
  AIAssistPanel,
  StoryPreview,
} from '@/components/editor';
import { cn } from '@/lib/utils';

export function EditorScreen() {
  const { setPhase, player } = useGameStore();
  const { mode, currentDraft, createNewDraft, resetEditor } = useEditorStore();

  // 如果没有当前草稿，自动创建一个
  useEffect(() => {
    if (!currentDraft) {
      createNewDraft(player.name);
    }
  }, [currentDraft, createNewDraft, player.name]);

  const handleBack = () => {
    if (currentDraft) {
      const confirm = window.confirm('确定返回主菜单？请确保已保存草稿。');
      if (!confirm) return;
    }
    resetEditor();
    setPhase('menu');
  };

  const renderEditor = () => {
    switch (mode) {
      case 'basic':
        return <BasicInfoEditor />;
      case 'evidence':
        return <EvidenceEditor />;
      case 'witnesses':
        return <WitnessEditor />;
      case 'characters':
        return <CharacterEditor />;
      case 'locks':
        return <LogicalLockEditor />;
      case 'ai_assist':
        return <AIAssistPanel />;
      case 'preview':
        return <StoryPreview />;
      default:
        return <BasicInfoEditor />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 顶部标题栏 */}
      <header className="bg-slate-900/80 border-b border-amber-900/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← 返回
          </button>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <h1 className="text-xl font-bold text-amber-400">
              📝 故事编辑器
            </h1>
            <p className="text-xs text-slate-500">
              创作你的法庭故事 | UGC Mode
            </p>
          </div>
        </div>
        
        {currentDraft && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-white">
                {currentDraft.title || '未命名故事'}
              </div>
              <div className="text-xs text-slate-500">
                {currentDraft.isComplete ? (
                  <span className="text-green-400">✓ 已完成</span>
                ) : (
                  <span className="text-amber-400">○ 编辑中</span>
                )}
              </div>
            </div>
            <div className={cn(
              'w-2 h-2 rounded-full',
              currentDraft.isComplete ? 'bg-green-500' : 'bg-amber-500'
            )} />
          </div>
        )}
      </header>

      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <EditorSidebar />

        {/* 编辑区域 */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            {renderEditor()}
          </motion.div>
        </main>
      </div>

      {/* 底部状态栏 */}
      <footer className="bg-slate-900/80 border-t border-amber-900/30 px-4 py-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>
            证据: {currentDraft?.evidence.length || 0}
          </span>
          <span>
            证人: {currentDraft?.witnesses.length || 0}
          </span>
          <span>
            逻辑锁: {currentDraft?.logicalLocks.length || 0}
          </span>
        </div>
        <div>
          按 Ctrl+S 保存草稿
        </div>
      </footer>
    </div>
  );
}


