/**
 * Ligne du tableau « Pièces justificatives » (page Attestations et étape 1) :
 * pièce, source, statut réel, détail et action unique.
 */

import React from 'react';
import { Check, AlertCircle, AlertTriangle, Minus } from 'lucide-react';
import { Badge, Tone } from '../Layout/ui';

export type ComplianceTone = 'ok' | 'warning' | 'alert' | 'unknown';

interface ComplianceRowProps {
  icon: React.ReactNode;
  title: string;
  source: string;
  tone: ComplianceTone;
  statusLabel: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const TONE_STYLES: Record<ComplianceTone, { tone: Tone; icon: React.ReactNode }> = {
  ok: { tone: 'success', icon: <Check className="w-3 h-3" /> },
  warning: { tone: 'warning', icon: <AlertTriangle className="w-3 h-3" /> },
  alert: { tone: 'danger', icon: <AlertCircle className="w-3 h-3" /> },
  unknown: { tone: 'neutral', icon: <Minus className="w-3 h-3" /> }
};

export const ComplianceRow: React.FC<ComplianceRowProps> = ({
  icon,
  title,
  source,
  tone,
  statusLabel,
  description,
  actions,
  children
}) => {
  const style = TONE_STYLES[tone];
  return (
    <div className="px-4 py-2.5 space-y-2">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2.5 md:w-60 shrink-0">
          <span className="text-neutral-400 shrink-0">{icon}</span>
          <div className="min-w-0">
            <span className="text-sm font-medium text-neutral-900 block leading-tight">{title}</span>
            <span className="text-[11px] text-neutral-500">{source}</span>
          </div>
        </div>

        <Badge tone={style.tone} className="self-start md:self-center">
          {style.icon}
          {statusLabel}
        </Badge>

        <p className="text-xs text-neutral-600 leading-relaxed flex-1 min-w-0">{description}</p>

        {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
};
