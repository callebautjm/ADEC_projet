/**
 * En-tête de navigation - ADEC Corse
 * Style sobre, aéré, institutionnel et élégant
 */

import React from 'react';
import { Database, FileText, RotateCcw, Key, Calculator, ShieldCheck } from 'lucide-react';
import { AppPage } from '../types/navigation';

interface HeaderProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onResetQuestionnaire?: () => void;
  onOpenTokenModal?: () => void;
}

const NAV_ITEMS: { page: AppPage; label: string; icon: React.ElementType; iconClass: string }[] = [
  { page: 'attestations', label: 'Attestations', icon: ShieldCheck, iconClass: 'text-emerald-600' },
  { page: 'guide', label: 'Guide des aides', icon: FileText, iconClass: 'text-blue-600' },
  { page: 'simulation', label: 'Simulation', icon: Calculator, iconClass: 'text-blue-600' },
  { page: 'textes', label: 'Textes officiels', icon: Database, iconClass: 'text-indigo-600' }
];

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onResetQuestionnaire,
  onOpenTokenModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Identité ADEC Corse : retour à l'accueil */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('accueil')}
            className="text-left group flex items-center gap-2.5 transition cursor-pointer"
            aria-label="Accueil ADEC Corse"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs ring-1 ring-blue-500/20">
              ADEC
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-700 transition block leading-tight">
                Aides aux Entreprises
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block leading-tight">
                Collectivité de Corse · Guide 2026
              </span>
            </div>
          </button>
        </div>

        {/* Liens de navigation principaux - compacts et épurés */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {NAV_ITEMS.map(({ page, label, icon: Icon, iconClass }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              aria-current={activePage === page ? 'page' : undefined}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activePage === page
                  ? 'bg-white text-blue-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Actions utilisateur épurées */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenTokenModal && (
            <button
              onClick={onOpenTokenModal}
              title="Configurer l'habilitation API Entreprise (DGFIP, URSSAF, Infogreffe)"
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5 border border-slate-200/80 shadow-2xs font-medium cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">API Entreprise</span>
            </button>
          )}

          {onResetQuestionnaire && (
            <button
              onClick={onResetQuestionnaire}
              title="Réinitialiser la simulation"
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5 border border-slate-200/80 cursor-pointer"
              aria-label="Nouvelle simulation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Nouveau</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation mobile */}
      <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2">
        {NAV_ITEMS.map(({ page, label, icon: Icon, iconClass }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            aria-current={activePage === page ? 'page' : undefined}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1 shrink-0 cursor-pointer ${
              activePage === page ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Icon className={`w-3 h-3 ${activePage === page ? '' : iconClass}`} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
};
