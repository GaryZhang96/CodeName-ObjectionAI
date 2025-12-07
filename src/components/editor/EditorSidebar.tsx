/**
 * 编辑器侧边栏 - 导航和模式切换
 */

import { motion } from 'framer-motion';
import { useEditorStore } from '@/store/editorStore';
import type { EditorMode } from '@/data/stories/editor-types';
import { cn } from '@/lib/utils';

const EDITOR_MODES: Array<{
  mode: EditorMode;
  label: string;
  icon: string;
  description: string;
}> = [
  { mode: 'basic', label: '基础信息', icon: '📋', description: '标题、难度、背景' },
  { mode: 'evidence', label: '证据管理', icon: '🔍', description: '添加和编辑证据' },
  { mode: 'witnesses', label: '证人设计', icon: '👥', description: '证人角色和证词' },
  { mode: 'characters', label: '角色人设', icon: '🎭', description: '检察官、法官配置' },
  { mode: 'locks', label: '逻辑锁', icon: '🔐', description: '矛盾点设计' },
  { mode: 'ai_assist', label: 'AI助手', icon: '🤖', description: 'AI辅助创作' },
  { mode: 'preview', label: '预览', icon: '👁️', description: '预览和验证' },
];

interface EditorSidebarProps {
  className?: string;
}

export function EditorSidebar({ className }: EditorSidebarProps) {
  const { mode, setMode, currentDraft, savedDrafts, saveDraft, createNewDraft, loadDraft, deleteDraft } = useEditorStore();

  return (
    <aside className={cn(
      'w-64 bg-slate-900/80 border-r border-amber-900/30 flex flex-col',
      className
    )}>
      {/* 草稿列表区域 */}
      <div className="p-4 border-b border-amber-900/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-amber-400 font-semibold text-sm">我的草稿</h3>
          <button
            onClick={() => createNewDraft()}
            className="text-xs px-2 py-1 bg-amber-600/20 text-amber-400 rounded hover:bg-amber-600/40 transition-colors"
          >
            + 新建
          </button>
        </div>
        
        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
          {savedDrafts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-2">暂无草稿</p>
          ) : (
            savedDrafts.map((draft) => (
              <div
                key={draft.id}
                className={cn(
                  'group flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors',
                  currentDraft?.id === draft.id
                    ? 'bg-amber-600/30 text-amber-300'
                    : 'hover:bg-slate-800 text-slate-400'
                )}
                onClick={() => loadDraft(draft.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={draft.isComplete ? 'text-green-400' : 'text-amber-500'}>
                    {draft.isComplete ? '✓' : '○'}
                  </span>
                  <span className="truncate">{draft.title || '未命名'}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('确定删除这个草稿？')) {
                      deleteDraft(draft.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 px-1"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 模式导航 */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {EDITOR_MODES.map((item) => (
            <motion.button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              disabled={!currentDraft}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                mode === item.mode
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-300'
              )}
              whileHover={{ x: currentDraft ? 4 : 0 }}
              whileTap={{ scale: currentDraft ? 0.98 : 1 }}
            >
              <span className="text-lg">{item.icon}</span>
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs opacity-60">{item.description}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </nav>

      {/* 底部操作 */}
      <div className="p-3 border-t border-amber-900/30 space-y-2">
        {currentDraft && (
          <>
            <button
              onClick={saveDraft}
              className="w-full py-2 bg-amber-600 text-black font-semibold rounded hover:bg-amber-500 transition-colors text-sm"
            >
              💾 保存草稿
            </button>
            
            <div className="text-xs text-slate-500 text-center">
              上次保存: {currentDraft.updatedAt instanceof Date 
                ? currentDraft.updatedAt.toLocaleString('zh-CN')
                : new Date(currentDraft.updatedAt).toLocaleString('zh-CN')}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

