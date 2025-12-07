/**
 * 主菜单界面
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Play, Settings, Info, Volume2, VolumeX, Book, Wrench, PenTool } from 'lucide-react';
import { Button, Panel, Modal } from '@/components/ui';
import { useGameStore } from '@/store/gameStore';
import { useCollectionStore } from '@/store/collectionStore';
import { isAPIConfigured } from '@/services/ai/config';

export function MenuScreen() {
  const { setPhase, player, settings, updateSettings, resetGame } = useGameStore();
  const { collection } = useCollectionStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showAPIWarning, setShowAPIWarning] = useState(false);
  const [showGMAccess, setShowGMAccess] = useState(false);

  const handleStartGame = () => {
    if (!isAPIConfigured()) {
      setShowAPIWarning(true);
      return;
    }
    setPhase('office');
  };

  const handleNewGame = () => {
    if (window.confirm('确定要开始新游戏吗？当前进度将被清除。')) {
      resetGame();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-b from-court-primary via-court-secondary to-court-primary" />
      
      {/* 网格背景 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,215,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,215,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 扫描线效果 */}
      {settings.scanlineEffect && <div className="scanline-overlay" />}

      {/* 主内容 */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center"
      >
        {/* Logo */}
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <Scale className="w-32 h-32 mx-auto text-pixel-gold drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]" />
        </motion.div>

        {/* 标题 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="font-pixel-title text-4xl md:text-5xl text-pixel-gold mb-4 glow-text"
        >
          LEX MACHINA
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-pixel-title text-lg text-amber-glow mb-2"
        >
          律 政 先 锋
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="font-pixel-body text-pixel-gray mb-12"
        >
          AI驱动的法庭模拟游戏
        </motion.p>

        {/* 菜单按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          <Button
            onClick={handleStartGame}
            size="lg"
            className="w-64 flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5" />
            {player.stats.totalCases > 0 ? '继续游戏' : '开始游戏'}
          </Button>

          {player.stats.totalCases > 0 && (
            <Button
              onClick={handleNewGame}
              variant="ghost"
              size="md"
              className="w-64"
            >
              新游戏
            </Button>
          )}

          {/* 收藏入口 */}
          {collection.storybooks.length > 0 && (
            <Button
              onClick={() => setPhase('collection')}
              variant="ghost"
              size="md"
              className="w-64 flex items-center justify-center gap-2"
            >
              <Book className="w-4 h-4" />
              我的收藏 ({collection.storybooks.length})
            </Button>
          )}

          {/* 故事编辑器入口 */}
          <Button
            onClick={() => setPhase('editor')}
            variant="ghost"
            size="md"
            className="w-64 flex items-center justify-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            故事编辑器 (UGC)
          </Button>

          <div className="flex gap-4 justify-center pt-4">
            <Button
              onClick={() => setShowSettings(true)}
              variant="ghost"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowInfo(true)}
              variant="ghost"
              size="sm"
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              variant="ghost"
              size="sm"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            {/* GM入口（开发者） */}
            <Button
              onClick={() => setShowGMAccess(true)}
              variant="ghost"
              size="sm"
              title="开发者模式"
            >
              <Wrench className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* 玩家统计 */}
        {player.stats.totalCases > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-12"
          >
            <Panel variant="dark" className="inline-block">
              <div className="flex gap-8 px-4">
                <div className="text-center">
                  <p className="font-pixel-title text-xs text-pixel-gray">等级</p>
                  <p className="font-pixel-title text-lg text-pixel-gold">{player.level}</p>
                </div>
                <div className="text-center">
                  <p className="font-pixel-title text-xs text-pixel-gray">胜率</p>
                  <p className="font-pixel-title text-lg text-pixel-green">
                    {player.stats.totalCases > 0 
                      ? Math.round((player.stats.casesWon / player.stats.totalCases) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-pixel-title text-xs text-pixel-gray">连胜</p>
                  <p className="font-pixel-title text-lg text-yellow-400">
                    {player.stats.currentWinStreak}
                  </p>
                </div>
              </div>
            </Panel>
          </motion.div>
        )}
      </motion.div>

      {/* 版本信息 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 font-pixel-body text-xs text-pixel-gray"
      >
        v1.0.0 | Powered by AI
      </motion.p>

      {/* 设置弹窗 */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="设置"
      >
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span>扫描线效果</span>
            <input
              type="checkbox"
              checked={settings.scanlineEffect}
              onChange={(e) => updateSettings({ scanlineEffect: e.target.checked })}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>音效</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-5 h-5"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>文字速度</span>
            <select
              value={settings.textSpeed}
              onChange={(e) => updateSettings({ textSpeed: e.target.value as any })}
              className="bg-pixel-dark border-2 border-pixel-gray px-2 py-1 text-pixel-light"
            >
              <option value="slow">慢</option>
              <option value="normal">正常</option>
              <option value="fast">快</option>
              <option value="instant">即时</option>
            </select>
          </label>
        </div>
      </Modal>

      {/* 关于弹窗 */}
      <Modal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="关于游戏"
      >
        <div className="space-y-4 text-sm">
          <p>
            <strong className="text-pixel-gold">Lex Machina</strong> 是一款AI驱动的律政模拟游戏。
          </p>
          <p>
            每个案件都由AI动态生成，包含独特的证据、证人和逻辑谜题。
            你需要通过询问证人、分析证据来揭露真相。
          </p>
          <div className="border-t border-pixel-gray pt-4">
            <p className="text-pixel-gray">开发: AI Assistant</p>
            <p className="text-pixel-gray">引擎: React + Vite</p>
            <p className="text-pixel-gray">AI: OpenRouter API</p>
          </div>
        </div>
      </Modal>

      {/* API Key 警告弹窗 */}
      <Modal
        isOpen={showAPIWarning}
        onClose={() => setShowAPIWarning(false)}
        title="⚠️ 需要配置 API Key"
      >
        <div className="space-y-4 text-sm">
          <p>
            游戏需要 OpenRouter API Key 来生成案件和进行AI对话。
          </p>
          <div className="p-3 bg-pixel-black border-2 border-pixel-gray">
            <p className="text-pixel-gray mb-2">请按以下步骤配置:</p>
            <ol className="list-decimal list-inside space-y-1 text-pixel-light">
              <li>在项目根目录创建 <code className="text-pixel-gold">.env.local</code> 文件</li>
              <li>添加: <code className="text-pixel-gold">VITE_OPENROUTER_API_KEY=你的key</code></li>
              <li>重启开发服务器</li>
            </ol>
          </div>
          <p className="text-pixel-gray">
            获取 API Key: <a href="https://openrouter.ai/keys" target="_blank" className="text-pixel-gold underline">openrouter.ai/keys</a>
          </p>
          <Button onClick={() => setShowAPIWarning(false)} className="w-full">
            知道了
          </Button>
        </div>
      </Modal>

      {/* GM入口弹窗 */}
      <Modal
        isOpen={showGMAccess}
        onClose={() => setShowGMAccess(false)}
        title="🔧 开发者模式"
      >
        <div className="space-y-4 text-sm">
          <p className="text-pixel-light">
            GM模式允许开发者查看和测试所有预设案件，包括：
          </p>
          <ul className="list-disc list-inside text-pixel-gray space-y-1">
            <li>查看所有案件故事和细节</li>
            <li>查看隐藏真相和逻辑锁</li>
            <li>直接开始任意案件</li>
            <li>跳过解锁条件</li>
          </ul>
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => {
                setShowGMAccess(false);
                setPhase('gm');
              }}
              className="flex-1"
            >
              <Wrench className="w-4 h-4 mr-2" />
              进入GM模式
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setShowGMAccess(false)}
              className="flex-1"
            >
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

