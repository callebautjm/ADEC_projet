/**
 * Ligne du tableau « Conformité & justificatifs » de l'étape 1 :
 * pièce, source, statut réel, détail et action unique.
 */

import React from 'react';
import { Check, AlertCircle, AlertTriangle, Minus } from 'lucide-react';

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

const TONE_STYLES: Record<ComplianceTone, { pill: string; icon: React.ReactNode }> = {
  ok: { pill: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: <Check className="w-3 h-3" /> },
  warning: { pill: 'bg-amber-50 text-amber-800 border-amber-200', icon: <AlertTriangle className="w-3 h-3" /> },
  alert: { pill: 'bg-red-50 text-red-800 border-red-300', icon: <AlertCircle className="w-3 h-3" /> },
  unknown: { pill: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Minus className="w-3 h-3" /> }
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
    <div className="px-3.5 py-3 space-y-2">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2.5 md:w-60 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block leading-tight">{title}</span>
            <span className="text-[10px] text-slate-400 font-medium">{source}</span>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 self-start md:self-center px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${style.pill}`}>
          {style.icon}
          {statusLabel}
        </span>

        <p className="text-[11px] text-slate-600 leading-relaxed flex-1 min-w-0">{description}</p>

        {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
};
