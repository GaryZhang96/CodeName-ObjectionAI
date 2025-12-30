/**
 * 陪审团面板组件
 */

import { motion } from 'framer-motion';
import { Panel } from '@/components/ui';
import type { JuryMember } from '@/types';
import { cn } from '@/lib/utils';

interface JuryPanelProps {
  jury: JuryMember[];
  averageSentiment: number;
}

export function JuryPanel({ jury, averageSentiment }: JuryPanelProps) {
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 30) return 'border-pixel-green bg-green-900/30';
    if (sentiment <= -30) return 'border-pixel-red bg-red-900/30';
    return 'border-pixel-gray bg-pixel-dark';
  };

  const getOverallVerdict = () => {
    if (averageSentiment >= 30) return { text: '倾向无罪', color: 'text-pixel-green' };
    if (averageSentiment <= -30) return { text: '倾向有罪', color: 'text-pixel-red' };
    return { text: '意见不一', color: 'text-yellow-400' };
  };

  const verdict = getOverallVerdict();

  return (
    <Panel variant="dark" className="w-full">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="font-pixel-title text-[10px] sm:text-xs text-pixel-gold">陪审团</h3>
        <span className={cn('font-pixel-title text-[10px] sm:text-xs', verdict.color)}>
          {verdict.text}
        </span>
      </div>

      {/* 陪审团网格 - 移动端更紧凑 */}
      <div className="grid grid-cols-6 gap-0.5 sm:gap-1">
        {jury.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
              'w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center',
              'border sm:border-2 text-sm sm:text-lg transition-all duration-300',
              getSentimentColor(member.sentiment)
            )}
            title={`陪审员 ${member.id}: ${member.sentiment > 0 ? '+' : ''}${Math.round(member.sentiment)}`}
          >
            {member.expression}
          </motion.div>
        ))}
      </div>

      {/* 总体倾向条 */}
      <div className="mt-2 sm:mt-3">
        <div className="flex justify-between text-[10px] sm:text-xs font-pixel-body mb-1">
          <span className="text-pixel-red">有罪</span>
          <span className="text-pixel-green">无罪</span>
        </div>
        <div className="relative h-2 sm:h-3 bg-pixel-dark border sm:border-2 border-pixel-gray">
          {/* 中线 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-pixel-gray" />
          
          {/* 指示器 */}
          <motion.div
            className="absolute top-0 bottom-0 w-1.5 sm:w-2 bg-pixel-gold"
            animate={{
              left: `${50 + (averageSentiment / 2)}%`,
            }}
            transition={{ type: 'spring', stiffness: 100 }}
            style={{ transform: 'translateX(-50%)' }}
          />
        </div>
      </div>
    </Panel>
  );
}

