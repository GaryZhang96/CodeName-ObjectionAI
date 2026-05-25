/**
 * 证据卷宗面板 - 像素风
 *
 * 设计：
 * - 列表项卡片化，关键证据带金色边
 * - 类型用图标区分（物证/证词/书证/电子）
 * - 点击查看详情弹窗，可"出示"
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Camera,
  Mic,
  Monitor,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';
import { Panel, Button, Modal } from '@/components/ui';
import type { Evidence } from '@/types';
import { cn } from '@/lib/utils';

interface EvidencePanelProps {
  evidence: Evidence[];
  onSelectEvidence?: (evidence: Evidence) => void;
  /** 默认展开，移动端可能想要默认折叠 */
  defaultExpanded?: boolean;
}

const evidenceIcons = {
  physical: Camera,
  testimonial: Mic,
  documentary: FileText,
  digital: Monitor,
};

const evidenceTypeNames = {
  physical: '物证',
  testimonial: '证词',
  documentary: '书证',
  digital: '电子',
};

export function EvidencePanel({
  evidence,
  onSelectEvidence,
  defaultExpanded = false,
}: EvidencePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(
    null
  );

  const discoveredEvidence = evidence.filter((e) => e.discovered);
  const keyCount = discoveredEvidence.filter((e) => e.isKeyEvidence).length;

  return (
    <>
      <Panel variant="dark" padding="sm" className="w-full">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between min-h-[36px] gap-2"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-gold" />
            <h3 className="font-pixel-title text-[10px] sm:text-xs text-brand-gold uppercase tracking-wider">
              证据卷宗
            </h3>
            <span className="font-pixel-title text-[10px] text-ink-tertiary tabular-nums">
              {discoveredEvidence.length}
              {keyCount > 0 && (
                <span className="text-game-yellow ml-1">★{keyCount}</span>
              )}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-ink-tertiary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-tertiary" />
          )}
        </button>

        {/* 展开：证据列表 */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 touch-scroll mt-3">
                {discoveredEvidence.length === 0 ? (
                  <p className="text-center text-ink-tertiary font-pixel-body text-sm py-3">
                    暂未发现证据
                  </p>
                ) : (
                  discoveredEvidence.map((item) => {
                    const Icon = evidenceIcons[item.type];
                    return (
                      <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedEvidence(item)}
                        className={cn(
                          'w-full p-2 flex items-center gap-2 min-h-[44px]',
                          'bg-surface-overlay border-2 transition-colors text-left',
                          item.isKeyEvidence
                            ? 'border-brand-gold shadow-pixel-sm hover:bg-brand-gold/15'
                            : 'border-ink-line hover:border-brand-gold'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4 shrink-0',
                            item.isKeyEvidence
                              ? 'text-brand-gold'
                              : 'text-ink-secondary'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-pixel-body text-sm text-ink-primary truncate">
                            {item.name}
                          </p>
                          <p className="font-pixel-body text-[11px] text-ink-tertiary">
                            {evidenceTypeNames[item.type]}
                          </p>
                        </div>
                        {item.isKeyEvidence && (
                          <Star className="w-3 h-3 text-game-yellow fill-game-yellow shrink-0" />
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 折叠：图标缩略 */}
        {!isExpanded && discoveredEvidence.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {discoveredEvidence.slice(0, 6).map((item) => {
              const Icon = evidenceIcons[item.type];
              return (
                <div
                  key={item.id}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center border-2 shadow-pixel-sm',
                    item.isKeyEvidence
                      ? 'bg-brand-gold/15 border-brand-gold'
                      : 'bg-surface-overlay border-ink-line'
                  )}
                  title={item.name}
                >
                  <Icon
                    className={cn(
                      'w-3.5 h-3.5',
                      item.isKeyEvidence
                        ? 'text-brand-gold'
                        : 'text-ink-secondary'
                    )}
                  />
                </div>
              );
            })}
            {discoveredEvidence.length > 6 && (
              <div className="w-7 h-7 flex items-center justify-center bg-surface-overlay border-2 border-ink-line shadow-pixel-sm">
                <span className="font-pixel-title text-[10px] text-ink-tertiary">
                  +{discoveredEvidence.length - 6}
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
        icon={
          selectedEvidence ? (
            <FileText className="w-4 h-4" />
          ) : undefined
        }
      >
        {selectedEvidence && (
          <div className="space-y-3 font-pixel-body text-base text-ink-primary">
            <div className="flex flex-wrap gap-2">
              <span className="pixel-badge">
                {evidenceTypeNames[selectedEvidence.type]}
              </span>
              {selectedEvidence.isKeyEvidence && (
                <span className="pixel-badge-gold">
                  <Star className="w-3 h-3 mr-0.5" />
                  关键证据
                </span>
              )}
            </div>

            <div>
              <p className="text-sm text-ink-tertiary mb-1">描述</p>
              <p className="text-base leading-relaxed">
                {selectedEvidence.description}
              </p>
            </div>

            <Panel variant="overlay" padding="sm">
              <p className="text-sm text-ink-tertiary mb-1">详细内容</p>
              <p className="text-base whitespace-pre-wrap max-h-48 overflow-y-auto touch-scroll leading-relaxed">
                {selectedEvidence.content}
              </p>
            </Panel>

            <div className="text-xs text-ink-tertiary">
              来源：{selectedEvidence.source}
            </div>

            {onSelectEvidence && (
              <Button
                onClick={() => {
                  onSelectEvidence(selectedEvidence);
                  setSelectedEvidence(null);
                }}
                fullWidth
                size="md"
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
