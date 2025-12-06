/**
 * 事务所界面 - 选择案件
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, RefreshCw, ArrowLeft, Star, Clock, Target } from 'lucide-react';
import { Button, Panel } from '@/components/ui';
import { StatusBar, LoadingScreen } from '@/components/game';
import { useGameStore } from '@/store/gameStore';
import { generateCaseOptions } from '@/services/ai/caseGenerator';
import { getDifficultyInfo, formatMoney } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Case } from '@/types';

export function OfficeScreen() {
  const { 
    player, 
    availableCases, 
    setAvailableCases, 
    selectCase,
    setPhase,
    isLoading,
    setLoading,
    setError,
  } = useGameStore();

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // 生成案件选项
  const loadCases = async () => {
    setLoading(true, '正在搜索可接案件...');
    try {
      const cases = await generateCaseOptions(player.level, 3);
      setAvailableCases(cases);
    } catch (error) {
      console.error('加载案件失败:', error);
      setError('加载案件失败，请检查网络连接和API配置');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (availableCases.length === 0) {
      loadCases();
    }
  }, []);

  const handleSelectCase = (caseData: Case) => {
    setSelectedCase(caseData);
  };

  const handleAcceptCase = () => {
    if (selectedCase) {
      selectCase(selectedCase);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="正在搜索可接案件..." />;
  }

  return (
    <div className="min-h-screen bg-court-primary">
      <StatusBar />
      
      <div className="pt-16 pb-8 px-4 max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPhase('menu')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
        </motion.div>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-pixel-title text-2xl text-pixel-gold mb-2">
            <Briefcase className="inline w-8 h-8 mr-2" />
            事务所
          </h1>
          <p className="font-pixel-body text-pixel-gray">
            选择一个案件开始工作
          </p>
        </motion.div>

        {/* 案件列表 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {availableCases.map((caseItem, index) => {
            const diffInfo = getDifficultyInfo(caseItem.difficulty);
            const isSelected = selectedCase?.id === caseItem.id;
            
            return (
              <motion.div
                key={caseItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Panel
                  variant={isSelected ? 'highlight' : 'default'}
                  className={cn(
                    'cursor-pointer transition-all h-full',
                    'hover:border-pixel-gold',
                    isSelected && 'ring-2 ring-pixel-gold'
                  )}
                  onClick={() => handleSelectCase(caseItem)}
                >
                  {/* 难度标签 */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn(
                      'font-pixel-title text-xs px-2 py-1 border-2',
                      diffInfo.color,
                      'border-current'
                    )}>
                      {diffInfo.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(diffInfo.multiplier) }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>

                  {/* 案件标题 */}
                  <h3 className="font-pixel-title text-sm text-pixel-gold mb-2">
                    {caseItem.title}
                  </h3>

                  {/* 案件类型 */}
                  <p className="font-pixel-body text-xs text-pixel-gray mb-3">
                    {caseItem.type === 'theft' && '盗窃案'}
                    {caseItem.type === 'assault' && '伤害案'}
                    {caseItem.type === 'fraud' && '欺诈案'}
                    {caseItem.type === 'murder' && '谋杀案'}
                    {caseItem.type === 'corporate' && '公司犯罪'}
                    {caseItem.type === 'cyber' && '网络犯罪'}
                  </p>

                  {/* 案件摘要 */}
                  <p className="font-pixel-body text-sm text-pixel-light mb-4 line-clamp-3">
                    {caseItem.summary}
                  </p>

                  {/* 被告信息 */}
                  <div className="border-t border-pixel-gray/30 pt-3 mb-3">
                    <p className="font-pixel-body text-xs text-pixel-gray">被告</p>
                    <p className="font-pixel-body text-sm text-pixel-light">
                      {caseItem.defendant.name} ({caseItem.defendant.age}岁)
                    </p>
                    <p className="font-pixel-body text-xs text-pixel-gray">
                      {caseItem.defendant.occupation}
                    </p>
                  </div>

                  {/* 奖励预览 */}
                  <div className="flex justify-between items-center pt-3 border-t border-pixel-gray/30">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-pixel-green" />
                      <span className="font-pixel-body text-xs text-pixel-green">
                        +{caseItem.rewards.baseXP} XP
                      </span>
                    </div>
                    <div className="font-pixel-body text-xs text-yellow-400">
                      {formatMoney(caseItem.rewards.baseMoney)}
                    </div>
                  </div>
                </Panel>
              </motion.div>
            );
          })}
        </div>

        {/* 刷新按钮 */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={loadCases}
            disabled={isLoading}
            className="flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            刷新案件列表
          </Button>
        </div>

        {/* 案件详情面板 */}
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Panel variant="default" className="mb-6">
              <h2 className="font-pixel-title text-lg text-pixel-gold mb-4">
                案件详情: {selectedCase.title}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* 案情描述 */}
                <div>
                  <h3 className="font-pixel-title text-xs text-pixel-gray mb-2">案情概要</h3>
                  <div className="font-pixel-body text-sm text-pixel-light whitespace-pre-wrap max-h-48 overflow-y-auto pr-2">
                    {selectedCase.detailedBackground}
                  </div>
                </div>

                {/* 证人和证据预览 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-pixel-title text-xs text-pixel-gray mb-2">
                      证人 ({selectedCase.witnesses.length}人)
                    </h3>
                    <div className="space-y-2">
                      {selectedCase.witnesses.map(witness => (
                        <div key={witness.id} className="flex items-center gap-2 text-sm">
                          <span className="text-pixel-gold">•</span>
                          <span className="text-pixel-light">{witness.name}</span>
                          <span className="text-pixel-gray">({witness.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-pixel-title text-xs text-pixel-gray mb-2">
                      初始证据 ({selectedCase.evidence.filter(e => e.discovered).length}份)
                    </h3>
                    <div className="space-y-1">
                      {selectedCase.evidence.filter(e => e.discovered).map(e => (
                        <div key={e.id} className="flex items-center gap-2 text-sm">
                          <span className="text-pixel-gold">•</span>
                          <span className="text-pixel-light">{e.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-pixel-title text-xs text-pixel-gray mb-2">检察官</h3>
                    <p className="text-sm text-pixel-light">
                      {selectedCase.prosecutor.name}
                    </p>
                    <p className="text-xs text-pixel-gray">
                      风格: {selectedCase.prosecutor.style === 'aggressive' && '咄咄逼人'}
                      {selectedCase.prosecutor.style === 'methodical' && '条理分明'}
                      {selectedCase.prosecutor.style === 'theatrical' && '戏剧夸张'}
                      {selectedCase.prosecutor.style === 'cunning' && '老谋深算'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 接受案件按钮 */}
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleAcceptCase}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  接受此案件
                </Button>
              </div>
            </Panel>
          </motion.div>
        )}
      </div>
    </div>
  );
}

