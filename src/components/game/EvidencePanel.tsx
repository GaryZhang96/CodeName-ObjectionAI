/**
 * 证据面板组件
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Camera, Mic, Monitor, ChevronDown, ChevronUp } from 'lucide-react';
import { Panel, Button, Modal } from '@/components/ui';
import type { Evidence } from '@/types';
import { cn } from '@/lib/utils';

interface EvidencePanelProps {
  evidence: Evidence[];
  onSelectEvidence?: (evidence: Evidence) => void;
}

const evidenceIcons = {
  physical: Camera,
  testimonial: Mic,
  documentary: FileText,
  digital: Monitor,
};

export function EvidencePanel({ evidence, onSelectEvidence }: EvidencePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const discoveredEvidence = evidence.filter(e => e.discovered);

  const handleEvidenceClick = (e: Evidence) => {
    setSelectedEvidence(e);
  };

  const handleUseEvidence = () => {
    if (selectedEvidence && onSelectEvidence) {
      onSelectEvidence(selectedEvidence);
      setSelectedEvidence(null);
    }
  };

  return (
    <>
      <Panel variant="dark" className="w-full">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-1.5 sm:mb-2 min-h-[36px] sm:min-h-0"
        >
          <h3 className="font-pixel-title text-[10px] sm:text-xs text-pixel-gold">
            证据卷宗 ({discoveredEvidence.length})
          </h3>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-pixel-gold" />
          ) : (
            <ChevronDown className="w-4 h-4 text-pixel-gold" />
          )}
        </button>

        {/* 证据列表 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 sm:space-y-2 max-h-36 sm:max-h-48 overflow-y-auto pr-1 sm:pr-2 touch-scroll">
                {discoveredEvidence.map((item) => {
                  const Icon = evidenceIcons[item.type];
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEvidenceClick(item)}
                      className={cn(
                        'w-full p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2',
                        'bg-pixel-dark border sm:border-2 border-pixel-gray',
                        'active:border-pixel-gold transition-colors',
                        'text-left min-h-[40px]',
                        item.isKeyEvidence && 'border-yellow-600'
                      )}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-pixel-gold flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-pixel-body text-xs sm:text-sm text-pixel-light truncate">
                          {item.name}
                        </p>
                        {item.isKeyEvidence && (
                          <span className="text-[10px] sm:text-xs text-yellow-400">★ 关键</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 折叠状态下显示简要信息 */}
        {!isExpanded && discoveredEvidence.length > 0 && (
          <div className="flex gap-0.5 sm:gap-1 flex-wrap">
            {discoveredEvidence.slice(0, 4).map((item) => {
              const Icon = evidenceIcons[item.type];
              return (
                <div
                  key={item.id}
                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-pixel-dark border border-pixel-gray"
                  title={item.name}
                >
                  <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-pixel-gold" />
                </div>
              );
            })}
            {discoveredEvidence.length > 4 && (
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-pixel-dark border border-pixel-gray">
                <span className="text-[10px] sm:text-xs text-pixel-gold">
                  +{discoveredEvidence.length - 4}
                </span>
              </div>
            )}
          </div>
        )}
      </Panel>

      {/* 证据详情弹窗 */}
      <Modal
        isOpen={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        title={selectedEvidence?.name}
      >
        {selectedEvidence && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-pixel-gray">
              <span className="text-[10px] sm:text-xs">类型: </span>
              <span className="text-pixel-light text-xs sm:text-sm">
                {selectedEvidence.type === 'physical' && '物证'}
                {selectedEvidence.type === 'testimonial' && '证词'}
                {selectedEvidence.type === 'documentary' && '书证'}
                {selectedEvidence.type === 'digital' && '电子证据'}
              </span>
            </div>

            <div>
              <p className="text-[10px] sm:text-xs text-pixel-gray mb-1">描述:</p>
              <p className="text-pixel-light text-xs sm:text-sm">{selectedEvidence.description}</p>
            </div>

            <div className="p-2 sm:p-3 bg-pixel-black border sm:border-2 border-pixel-gray">
              <p className="text-[10px] sm:text-xs text-pixel-gray mb-1">详细内容:</p>
              <p className="text-pixel-light text-xs sm:text-sm whitespace-pre-wrap max-h-32 sm:max-h-48 overflow-y-auto touch-scroll">
                {selectedEvidence.content}
              </p>
            </div>

            <div className="text-[10px] sm:text-xs text-pixel-gray">
              来源: {selectedEvidence.source}
            </div>

            {onSelectEvidence && (
              <Button 
                onClick={handleUseEvidence}
                className="w-full mt-3 sm:mt-4"
              >
                出示此证据
              </Button>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

