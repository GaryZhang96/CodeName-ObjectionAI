/**
 * Lex Machina - 游戏状态管理
 * 使用 Zustand 进行状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GamePhase,
  PlayerStats,
  Case,
  CourtroomState,
  InvestigationState,
  CourtroomMessage,
  JuryMember,
  GameSettings,
  VerdictResult,
  PurchasableClue,
  WitnessEmotion,
} from '@/types';
import { 
  calculateXPToNextLevel, 
  getLawyerRank, 
  getJuryExpression,
  clamp,
} from '@/lib/utils';
import { GAME_CONSTANTS } from '@/constants/game';

// ============================================
// 初始状态
// ============================================

const createInitialPlayer = (): PlayerStats => ({
  name: '新人律师',
  rank: 'intern',
  level: 1,
  currentXP: 0,
  xpToNextLevel: GAME_CONSTANTS.INITIAL_XP_TO_NEXT_LEVEL,
  money: GAME_CONSTANTS.INITIAL_MONEY,
  reputation: GAME_CONSTANTS.INITIAL_REPUTATION,
  stats: {
    totalCases: 0,
    casesWon: 0,
    casesLost: 0,
    perfectVictories: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
  },
  achievements: [],
  abilities: [],
});

const createInitialSettings = (): GameSettings => ({
  soundEnabled: true,
  musicEnabled: true,
  scanlineEffect: true,
  textSpeed: 'normal',
  autoSave: true,
  language: 'zh-CN',
});

const createInitialJury = (): JuryMember[] => {
  return Array.from({ length: GAME_CONSTANTS.JURY_COUNT }, (_, i) => ({
    id: i + 1,
    sentiment: 0,
    expression: '😐' as const,
  }));
};

const createInitialCourtroomState = (): CourtroomState => ({
  phase: 'opening',
  currentWitnessId: null,
  messages: [],
  judge: {
    name: GAME_CONSTANTS.DEFAULT_JUDGE_NAME,
    patience: GAME_CONSTANTS.INITIAL_PATIENCE,
    warnings: 0,
    maxWarnings: GAME_CONSTANTS.MAX_WARNINGS,
    mood: 'neutral',
  },
  jury: createInitialJury(),
  averageJurySentiment: 0,
  hintsUsed: 0,
  closingRequested: false,
});

// ============================================
// Store 类型定义
// ============================================

interface GameState {
  // 核心状态
  phase: GamePhase;
  player: PlayerStats;
  settings: GameSettings;
  
  // 当前游戏数据
  availableCases: Case[];
  currentCase: Case | null;
  investigation: InvestigationState | null;
  courtroom: CourtroomState | null;
  verdict: VerdictResult | null;
  
  // 加载状态
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  
  // 玩家相关
  updatePlayer: (updates: Partial<PlayerStats>) => void;
  addXP: (amount: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  
  // 案件相关
  setAvailableCases: (cases: Case[]) => void;
  selectCase: (caseData: Case) => void;
  clearCurrentCase: () => void;
  
  // 调查阶段
  initInvestigation: (clues: PurchasableClue[]) => void;
  purchaseClue: (clueId: string) => boolean;
  
  // 庭审阶段
  initCourtroom: () => void;
  addMessage: (message: CourtroomMessage) => void;
  updateWitnessEmotion: (witnessId: string, emotion: WitnessEmotion) => void;
  setCurrentWitness: (witnessId: string | null) => void;
  updateJurySentiment: (impact: number) => void;
  updateJudgePatience: (delta: number) => void;
  breakLogicalLock: (lockId: string) => void;
  useHint: () => boolean;
  setCourtroomPhase: (phase: CourtroomState['phase']) => void;
  
  // 结算
  setVerdict: (verdict: VerdictResult) => void;
  applyVerdictRewards: () => void;
  
  // 设置
  updateSettings: (settings: Partial<GameSettings>) => void;
  
  // 存档
  resetGame: () => void;
}

// ============================================
// Store 实现
// ============================================

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // 初始状态
      phase: 'menu',
      player: createInitialPlayer(),
      settings: createInitialSettings(),
      availableCases: [],
      currentCase: null,
      investigation: null,
      courtroom: null,
      verdict: null,
      isLoading: false,
      loadingMessage: '',
      error: null,

      // 基础 Actions
      setPhase: (phase) => set({ phase }),
      
      setLoading: (isLoading, message = '') => set({ 
        isLoading, 
        loadingMessage: message,
        error: isLoading ? null : get().error,
      }),
      
      setError: (error) => set({ error, isLoading: false }),

      // 玩家相关 Actions
      updatePlayer: (updates) => set((state) => ({
        player: { ...state.player, ...updates },
      })),

      addXP: (amount) => set((state) => {
        let newXP = state.player.currentXP + amount;
        let newLevel = state.player.level;
        let xpToNext = state.player.xpToNextLevel;

        // 检查升级
        while (newXP >= xpToNext) {
          newXP -= xpToNext;
          newLevel++;
          xpToNext = calculateXPToNextLevel(newLevel);
        }

        const newRank = getLawyerRank(newLevel);

        return {
          player: {
            ...state.player,
            currentXP: newXP,
            level: newLevel,
            xpToNextLevel: xpToNext,
            rank: newRank as PlayerStats['rank'],
          },
        };
      }),

      addMoney: (amount) => set((state) => ({
        player: {
          ...state.player,
          money: state.player.money + amount,
        },
      })),

      spendMoney: (amount) => {
        const { player } = get();
        if (player.money < amount) return false;
        
        set((state) => ({
          player: {
            ...state.player,
            money: state.player.money - amount,
          },
        }));
        return true;
      },

      // 案件相关 Actions
      setAvailableCases: (cases) => set({ availableCases: cases }),

      selectCase: (caseData) => set({ 
        currentCase: caseData,
        phase: 'investigation',
      }),

      clearCurrentCase: () => set({
        currentCase: null,
        investigation: null,
        courtroom: null,
        verdict: null,
      }),

      // 调查阶段 Actions
      initInvestigation: (clues) => set({
        investigation: {
          availableClues: clues,
          purchasedClues: [],
          moneySpent: 0,
        },
      }),

      purchaseClue: (clueId) => {
        const { investigation, player } = get();
        if (!investigation) return false;

        const clue = investigation.availableClues.find(c => c.id === clueId);
        if (!clue || clue.purchased || player.money < clue.price) return false;

        set((state) => ({
          player: {
            ...state.player,
            money: state.player.money - clue.price,
          },
          investigation: {
            ...state.investigation!,
            availableClues: state.investigation!.availableClues.map(c =>
              c.id === clueId ? { ...c, purchased: true } : c
            ),
            purchasedClues: [...state.investigation!.purchasedClues, { ...clue, purchased: true }],
            moneySpent: state.investigation!.moneySpent + clue.price,
          },
        }));
        return true;
      },

      // 庭审阶段 Actions
      initCourtroom: () => set({
        courtroom: createInitialCourtroomState(),
        phase: 'courtroom',
      }),

      addMessage: (message) => set((state) => {
        if (!state.courtroom) return state;
        
        return {
          courtroom: {
            ...state.courtroom,
            messages: [...state.courtroom.messages, message],
          },
        };
      }),

      updateWitnessEmotion: (witnessId, emotion) => set((state) => {
        if (!state.currentCase) return state;

        return {
          currentCase: {
            ...state.currentCase,
            witnesses: state.currentCase.witnesses.map(w =>
              w.id === witnessId 
                ? { ...w, currentEmotion: emotion, hasBroken: emotion === 'broken' } 
                : w
            ),
          },
        };
      }),

      setCurrentWitness: (witnessId) => set((state) => {
        if (!state.courtroom) return state;
        
        return {
          courtroom: {
            ...state.courtroom,
            currentWitnessId: witnessId,
            phase: witnessId ? 'examination' : state.courtroom.phase,
          },
        };
      }),

      updateJurySentiment: (impact) => set((state) => {
        if (!state.courtroom) return state;

        const newJury: JuryMember[] = state.courtroom.jury.map(member => {
          // 随机波动，但趋势跟随 impact
          const variance = (Math.random() - 0.5) * 4;
          const newSentiment = clamp(
            member.sentiment + impact + variance,
            -100,
            100
          );
          return {
            ...member,
            sentiment: newSentiment,
            expression: getJuryExpression(newSentiment) as JuryMember['expression'],
          };
        });

        const avgSentiment = newJury.reduce((sum, m) => sum + m.sentiment, 0) / GAME_CONSTANTS.JURY_COUNT;

        return {
          courtroom: {
            ...state.courtroom,
            jury: newJury,
            averageJurySentiment: avgSentiment,
          },
        };
      }),

      updateJudgePatience: (delta) => set((state) => {
        if (!state.courtroom) return state;

        const newPatience = clamp(state.courtroom.judge.patience + delta, 0, 100);
        const warnings = delta < -10 
          ? state.courtroom.judge.warnings + 1 
          : state.courtroom.judge.warnings;
        
        let mood: typeof state.courtroom.judge.mood = 'neutral';
        if (newPatience < 30) mood = 'angry';
        else if (newPatience < 60) mood = 'annoyed';
        else if (newPatience > 80) mood = 'pleased';

        return {
          courtroom: {
            ...state.courtroom,
            judge: {
              ...state.courtroom.judge,
              patience: newPatience,
              warnings,
              mood,
            },
          },
        };
      }),

      breakLogicalLock: (lockId) => set((state) => {
        if (!state.currentCase) return state;

        return {
          currentCase: {
            ...state.currentCase,
            logicalLocks: state.currentCase.logicalLocks.map(lock =>
              lock.id === lockId ? { ...lock, isBroken: true } : lock
            ),
          },
        };
      }),

      useHint: () => {
        const { courtroom, player } = get();
        
        if (!courtroom || player.money < GAME_CONSTANTS.HINT_COST) return false;

        set((state) => ({
          player: {
            ...state.player,
            money: state.player.money - GAME_CONSTANTS.HINT_COST,
          },
          courtroom: {
            ...state.courtroom!,
            hintsUsed: state.courtroom!.hintsUsed + 1,
          },
        }));
        return true;
      },

      setCourtroomPhase: (phase) => set((state) => {
        if (!state.courtroom) return state;
        
        return {
          courtroom: {
            ...state.courtroom,
            phase,
            closingRequested: phase === 'closing',
          },
        };
      }),

      // 结算 Actions
      setVerdict: (verdict) => set({ 
        verdict,
        phase: 'verdict',
      }),

      applyVerdictRewards: () => set((state) => {
        const { verdict, player, currentCase } = state;
        if (!verdict || !currentCase) return state;

        const isWin = verdict.outcome === 'not_guilty';
        const newStats = {
          ...player.stats,
          totalCases: player.stats.totalCases + 1,
          casesWon: isWin ? player.stats.casesWon + 1 : player.stats.casesWon,
          casesLost: !isWin ? player.stats.casesLost + 1 : player.stats.casesLost,
          currentWinStreak: isWin ? player.stats.currentWinStreak + 1 : 0,
          bestWinStreak: isWin 
            ? Math.max(player.stats.bestWinStreak, player.stats.currentWinStreak + 1)
            : player.stats.bestWinStreak,
        };

        // 完美胜利检查
        if (isWin && verdict.review.overallRating === 'S') {
          newStats.perfectVictories++;
        }

        return {
          player: {
            ...player,
            stats: newStats,
          },
        };
      }),

      // 设置 Actions
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),

      // 重置游戏
      resetGame: () => set({
        phase: 'menu',
        player: createInitialPlayer(),
        availableCases: [],
        currentCase: null,
        investigation: null,
        courtroom: null,
        verdict: null,
        error: null,
      }),
    }),
    {
      name: 'lex-machina-save',
      partialize: (state) => ({
        player: state.player,
        settings: state.settings,
      }),
    }
  )
);

// ============================================
// 选择器
// ============================================

export const selectPlayer = (state: GameState) => state.player;
export const selectPhase = (state: GameState) => state.phase;
export const selectCurrentCase = (state: GameState) => state.currentCase;
export const selectCourtroom = (state: GameState) => state.courtroom;
export const selectIsLoading = (state: GameState) => state.isLoading;
