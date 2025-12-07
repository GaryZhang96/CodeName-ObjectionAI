/**
 * Lex Machina - UGC故事编辑器状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  StoryDraft,
  EditorMode,
  EditableEvidence,
  EditableWitness,
  EditableLogicalLock,
  ProsecutorConfig,
  JudgeConfig,
  DefendantConfig,
  ValidationStatus,
  ValidationError,
  ValidationWarning,
  HistoryEntry,
  EditAction,
  ExportableStory,
} from '@/data/stories/editor-types';
import { createEmptyDraft } from '@/data/stories/editor-types';

// ============================================
// Store 类型定义
// ============================================

interface EditorState {
  // 编辑器状态
  mode: EditorMode;
  currentDraft: StoryDraft | null;
  savedDrafts: StoryDraft[];
  
  // 历史记录（撤销/重做）
  history: HistoryEntry[];
  historyIndex: number;
  
  // UI 状态
  isAIGenerating: boolean;
  aiGeneratingMessage: string;
  showValidation: boolean;
  selectedItemId: string | null; // 当前选中的证据/证人/锁ID
  
  // Actions - 基础操作
  setMode: (mode: EditorMode) => void;
  createNewDraft: (author?: string) => void;
  loadDraft: (draftId: string) => void;
  saveDraft: () => void;
  deleteDraft: (draftId: string) => void;
  
  // Actions - 基础信息
  updateBasicInfo: (updates: Partial<StoryDraft>) => void;
  
  // Actions - 被告
  updateDefendant: (updates: Partial<DefendantConfig>) => void;
  
  // Actions - 证据
  addEvidence: (evidence: EditableEvidence) => void;
  updateEvidence: (id: string, updates: Partial<EditableEvidence>) => void;
  deleteEvidence: (id: string) => void;
  
  // Actions - 证人
  addWitness: (witness: EditableWitness) => void;
  updateWitness: (id: string, updates: Partial<EditableWitness>) => void;
  deleteWitness: (id: string) => void;
  
  // Actions - 逻辑锁
  addLogicalLock: (lock: EditableLogicalLock) => void;
  updateLogicalLock: (id: string, updates: Partial<EditableLogicalLock>) => void;
  deleteLogicalLock: (id: string) => void;
  
  // Actions - 角色
  updateProsecutor: (updates: Partial<ProsecutorConfig>) => void;
  updateJudge: (updates: Partial<JudgeConfig>) => void;
  
  // Actions - AI辅助
  setAIGenerating: (isGenerating: boolean, message?: string) => void;
  applyAIGeneration: (generatedData: Partial<StoryDraft>) => void;
  
  // Actions - 验证
  validateDraft: () => ValidationStatus;
  setShowValidation: (show: boolean) => void;
  
  // Actions - 历史记录
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Actions - 导入/导出
  exportDraft: () => ExportableStory | null;
  importDraft: (data: ExportableStory) => boolean;
  
  // Actions - UI
  setSelectedItem: (id: string | null) => void;
  
  // Actions - 重置
  resetEditor: () => void;
}

// ============================================
// 辅助函数
// ============================================

/**
 * 生成校验和
 */
function generateChecksum(story: StoryDraft): string {
  const str = JSON.stringify(story);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * 验证故事草稿
 */
function validateStoryDraft(draft: StoryDraft): ValidationStatus {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // 基础信息验证
  if (!draft.title.trim()) {
    errors.push({ field: 'title', message: '请填写故事标题', severity: 'error' });
  }
  if (!draft.summary.trim()) {
    errors.push({ field: 'summary', message: '请填写案情摘要', severity: 'error' });
  }
  if (!draft.detailedBackground.trim()) {
    errors.push({ field: 'detailedBackground', message: '请填写详细背景', severity: 'error' });
  }
  if (!draft.hiddenTruth.trim()) {
    errors.push({ field: 'hiddenTruth', message: '请填写隐藏真相', severity: 'error' });
  }
  if (!draft.trueGuiltyParty.trim()) {
    errors.push({ field: 'trueGuiltyParty', message: '请指定真正的罪犯', severity: 'error' });
  }
  
  // 被告验证
  if (!draft.defendant.name.trim()) {
    errors.push({ field: 'defendant.name', message: '请填写被告姓名', severity: 'error' });
  }
  
  // 检察官验证
  if (!draft.prosecutor.name.trim()) {
    errors.push({ field: 'prosecutor.name', message: '请填写检察官姓名', severity: 'error' });
  }
  
  // 法官验证
  if (!draft.judge.name.trim()) {
    errors.push({ field: 'judge.name', message: '请填写法官姓名', severity: 'error' });
  }
  
  // 证据验证
  if (draft.evidence.length === 0) {
    errors.push({ field: 'evidence', message: '至少需要添加1个证据', severity: 'error' });
  } else if (draft.evidence.length < 3) {
    warnings.push({ field: 'evidence', message: '建议添加至少3个证据以丰富案件', severity: 'warning' });
  }
  
  const keyEvidence = draft.evidence.filter(e => e.isKeyEvidence);
  if (keyEvidence.length === 0) {
    errors.push({ field: 'evidence', message: '至少需要1个关键证据', severity: 'error' });
  }
  
  // 证人验证
  if (draft.witnesses.length === 0) {
    errors.push({ field: 'witnesses', message: '至少需要添加1个证人', severity: 'error' });
  }
  
  // 逻辑锁验证
  if (draft.logicalLocks.length === 0) {
    errors.push({ field: 'logicalLocks', message: '至少需要添加1个逻辑锁', severity: 'error' });
  }
  
  // 逻辑锁关联验证
  draft.logicalLocks.forEach((lock, index) => {
    if (lock.relatedEvidenceIds.length === 0 && lock.relatedWitnessIds.length === 0) {
      warnings.push({
        field: `logicalLocks[${index}]`,
        message: `逻辑锁"${lock.surfaceClaim.substring(0, 20)}..."未关联任何证据或证人`,
        severity: 'warning',
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// Store 实现
// ============================================

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // 初始状态
      mode: 'basic',
      currentDraft: null,
      savedDrafts: [],
      history: [],
      historyIndex: -1,
      isAIGenerating: false,
      aiGeneratingMessage: '',
      showValidation: false,
      selectedItemId: null,
      
      // 基础操作
      setMode: (mode) => set({ mode, selectedItemId: null }),
      
      createNewDraft: (author = '玩家') => {
        const newDraft = createEmptyDraft(author);
        set({
          currentDraft: newDraft,
          mode: 'basic',
          history: [],
          historyIndex: -1,
          showValidation: false,
          selectedItemId: null,
        });
      },
      
      loadDraft: (draftId) => {
        const { savedDrafts } = get();
        const draft = savedDrafts.find(d => d.id === draftId);
        if (draft) {
          set({
            currentDraft: { ...draft },
            mode: 'basic',
            history: [],
            historyIndex: -1,
            showValidation: false,
            selectedItemId: null,
          });
        }
      },
      
      saveDraft: () => {
        const { currentDraft, savedDrafts } = get();
        if (!currentDraft) return;
        
        const updatedDraft = {
          ...currentDraft,
          updatedAt: new Date(),
          validationStatus: validateStoryDraft(currentDraft),
        };
        updatedDraft.isComplete = updatedDraft.validationStatus.isValid;
        
        const existingIndex = savedDrafts.findIndex(d => d.id === currentDraft.id);
        const newSavedDrafts = existingIndex >= 0
          ? savedDrafts.map((d, i) => i === existingIndex ? updatedDraft : d)
          : [...savedDrafts, updatedDraft];
        
        set({
          currentDraft: updatedDraft,
          savedDrafts: newSavedDrafts,
        });
      },
      
      deleteDraft: (draftId) => {
        const { savedDrafts, currentDraft } = get();
        set({
          savedDrafts: savedDrafts.filter(d => d.id !== draftId),
          currentDraft: currentDraft?.id === draftId ? null : currentDraft,
        });
      },
      
      // 基础信息更新
      updateBasicInfo: (updates) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        // 记录历史
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'UPDATE_BASIC', payload: updates },
          previousState: { ...currentDraft },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            ...updates,
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      // 被告更新
      updateDefendant: (updates) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'UPDATE_DEFENDANT', payload: updates },
          previousState: { defendant: { ...currentDraft.defendant } },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            defendant: { ...currentDraft.defendant, ...updates },
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      // 证据操作
      addEvidence: (evidence) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'ADD_EVIDENCE', payload: evidence },
          previousState: { evidence: [...currentDraft.evidence] },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            evidence: [...currentDraft.evidence, evidence],
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      updateEvidence: (id, updates) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'UPDATE_EVIDENCE', payload: { id, updates } },
          previousState: { evidence: [...currentDraft.evidence] },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            evidence: currentDraft.evidence.map(e =>
              e.id === id ? { ...e, ...updates } : e
            ),
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      deleteEvidence: (id) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'DELETE_EVIDENCE', payload: id },
          previousState: { evidence: [...currentDraft.evidence] },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            evidence: currentDraft.evidence.filter(e => e.id !== id),
            // 同时更新逻辑锁中的关联
            logicalLocks: currentDraft.logicalLocks.map(lock => ({
              ...lock,
              relatedEvidenceIds: lock.relatedEvidenceIds.filter(eId => eId !== id),
            })),
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
          selectedItemId: null,
        });
      },
      
      // 证人操作
      addWitness: (witness) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'ADD_WITNESS', payload: witness },
          previousState: { witnesses: [...currentDraft.witnesses] },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            witnesses: [...currentDraft.witnesses, witness],
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      updateWitness: (id, updates) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'UPDATE_WITNESS', payload: { id, updates } },
          previousState: { witnesses: [...currentDraft.witnesses] },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            witnesses: currentDraft.witnesses.map(w =>
              w.id === id ? { ...w, ...updates } : w
            ),
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      deleteWitness: (id) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'DELETE_WITNESS', payload: id },
          previousState: { witnesses: [...currentDraft.witnesses] },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            witnesses: currentDraft.witnesses.filter(w => w.id !== id),
            // 同时更新逻辑锁中的关联
            logicalLocks: currentDraft.logicalLocks.map(lock => ({
              ...lock,
              relatedWitnessIds: lock.relatedWitnessIds.filter(wId => wId !== id),
            })),
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
          selectedItemId: null,
        });
      },
      
      // 逻辑锁操作
      addLogicalLock: (lock) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'ADD_LOCK', payload: lock },
          previousState: { logicalLocks: [...currentDraft.logicalLocks] },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            logicalLocks: [...currentDraft.logicalLocks, lock],
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      updateLogicalLock: (id, updates) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'UPDATE_LOCK', payload: { id, updates } },
          previousState: { logicalLocks: [...currentDraft.logicalLocks] },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            logicalLocks: currentDraft.logicalLocks.map(l =>
              l.id === id ? { ...l, ...updates } : l
            ),
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      deleteLogicalLock: (id) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'DELETE_LOCK', payload: id },
          previousState: { logicalLocks: [...currentDraft.logicalLocks] },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            logicalLocks: currentDraft.logicalLocks.filter(l => l.id !== id),
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
          selectedItemId: null,
        });
      },
      
      // 角色更新
      updateProsecutor: (updates) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'UPDATE_PROSECUTOR', payload: updates },
          previousState: { prosecutor: { ...currentDraft.prosecutor } },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            prosecutor: { ...currentDraft.prosecutor, ...updates },
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      updateJudge: (updates) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'UPDATE_JUDGE', payload: updates },
          previousState: { judge: { ...currentDraft.judge } },
        });
        
        set({
          currentDraft: {
            ...currentDraft,
            judge: { ...currentDraft.judge, ...updates },
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      // AI辅助
      setAIGenerating: (isGenerating, message = '') => set({
        isAIGenerating: isGenerating,
        aiGeneratingMessage: message,
      }),
      
      applyAIGeneration: (generatedData) => {
        const { currentDraft, history, historyIndex } = get();
        if (!currentDraft) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          timestamp: new Date(),
          action: { type: 'AI_GENERATE', payload: generatedData },
          previousState: { ...currentDraft },
        });
        
        // 深度合并
        const merged = { ...currentDraft };
        Object.keys(generatedData).forEach(key => {
          const k = key as keyof StoryDraft;
          if (generatedData[k] !== undefined) {
            if (Array.isArray(generatedData[k])) {
              // 数组类型：合并而非覆盖
              (merged[k] as unknown[]) = [
                ...(currentDraft[k] as unknown[]),
                ...(generatedData[k] as unknown[]),
              ];
            } else if (typeof generatedData[k] === 'object' && generatedData[k] !== null) {
              // 对象类型：深度合并
              (merged[k] as object) = {
                ...(currentDraft[k] as object),
                ...(generatedData[k] as object),
              };
            } else {
              // 基本类型：直接覆盖
              (merged as Record<string, unknown>)[k] = generatedData[k];
            }
          }
        });
        
        set({
          currentDraft: {
            ...merged,
            updatedAt: new Date(),
          },
          history: newHistory,
          historyIndex: newHistory.length - 1,
          isAIGenerating: false,
          aiGeneratingMessage: '',
        });
      },
      
      // 验证
      validateDraft: () => {
        const { currentDraft } = get();
        if (!currentDraft) {
          return { isValid: false, errors: [], warnings: [] };
        }
        
        const status = validateStoryDraft(currentDraft);
        set({
          currentDraft: {
            ...currentDraft,
            validationStatus: status,
            isComplete: status.isValid,
          },
          showValidation: true,
        });
        return status;
      },
      
      setShowValidation: (show) => set({ showValidation: show }),
      
      // 历史记录
      undo: () => {
        const { history, historyIndex, currentDraft } = get();
        if (historyIndex < 0 || !currentDraft) return;
        
        const entry = history[historyIndex];
        const restored = { ...currentDraft, ...entry.previousState };
        
        set({
          currentDraft: restored,
          historyIndex: historyIndex - 1,
        });
      },
      
      redo: () => {
        const { history, historyIndex, currentDraft } = get();
        if (historyIndex >= history.length - 1 || !currentDraft) return;
        
        const nextEntry = history[historyIndex + 1];
        // 应用下一个操作
        let updated = { ...currentDraft };
        switch (nextEntry.action.type) {
          case 'UPDATE_BASIC':
            updated = { ...updated, ...nextEntry.action.payload };
            break;
          // 其他操作类型可以根据需要扩展
        }
        
        set({
          currentDraft: updated,
          historyIndex: historyIndex + 1,
        });
      },
      
      clearHistory: () => set({ history: [], historyIndex: -1 }),
      
      // 导入/导出
      exportDraft: () => {
        const { currentDraft } = get();
        if (!currentDraft) return null;
        
        return {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          story: currentDraft,
          checksum: generateChecksum(currentDraft),
        };
      },
      
      importDraft: (data) => {
        try {
          // 验证校验和
          const expectedChecksum = generateChecksum(data.story);
          if (data.checksum !== expectedChecksum) {
            console.warn('故事文件校验和不匹配，可能已被修改');
          }
          
          // 生成新ID避免冲突
          const importedDraft: StoryDraft = {
            ...data.story,
            id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          const { savedDrafts } = get();
          set({
            currentDraft: importedDraft,
            savedDrafts: [...savedDrafts, importedDraft],
            mode: 'basic',
            history: [],
            historyIndex: -1,
          });
          
          return true;
        } catch (error) {
          console.error('导入故事失败:', error);
          return false;
        }
      },
      
      // UI
      setSelectedItem: (id) => set({ selectedItemId: id }),
      
      // 重置
      resetEditor: () => set({
        mode: 'basic',
        currentDraft: null,
        history: [],
        historyIndex: -1,
        isAIGenerating: false,
        aiGeneratingMessage: '',
        showValidation: false,
        selectedItemId: null,
      }),
    }),
    {
      name: 'lex-machina-editor',
      partialize: (state) => ({
        savedDrafts: state.savedDrafts,
      }),
    }
  )
);

// 选择器
export const selectCurrentDraft = (state: EditorState) => state.currentDraft;
export const selectSavedDrafts = (state: EditorState) => state.savedDrafts;
export const selectEditorMode = (state: EditorState) => state.mode;
export const selectIsAIGenerating = (state: EditorState) => state.isAIGenerating;

