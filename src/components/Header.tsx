/**
 * En-tête de navigation - ADEC Corse
 * Sur le modèle du site adec.corsica : bande blanche avec le logotype,
 * barre de navigation prune en capitales, page active soulignée en safran.
 */

import React from 'react';
import { RotateCcw, Key } from 'lucide-react';
import { AppPage } from '../types/navigation';

interface HeaderProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onResetQuestionnaire?: () => void;
  onOpenTokenModal?: () => void;
}

const NAV_ITEMS: { page: AppPage; label: string }[] = [
  { page: 'accueil', label: 'Accueil' },
  { page: 'attestations', label: 'Attestations' },
  { page: 'guide', label: 'Guide des aides' },
  { page: 'simulation', label: 'Simulation' },
  { page: 'textes', label: 'Textes officiels' }
];

const headerActionClass =
  'inline-flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-700 hover:text-prune-600 transition-colors cursor-pointer';

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onResetQuestionnaire,
  onOpenTokenModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logotype : retour à l'accueil */}
        <button
          onClick={() => onNavigate('accueil')}
          className="flex items-center gap-3 text-left cursor-pointer"
          aria-label="Accueil ADEC - Aides aux entreprises"
        >
          <span className="text-2xl font-black tracking-tight text-prune-600 leading-none">ADEC</span>
          <span aria-hidden="true" className="hidden sm:block h-9 w-px bg-neutral-200" />
          <span className="hidden sm:block leading-tight">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-900">
              Agence de Développement Économique de la Corse
            </span>
            <span className="block text-[11px] text-neutral-500">Aides aux entreprises · Guide 2026</span>
          </span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          {onOpenTokenModal && (
            <button
              onClick={onOpenTokenModal}
              title="Configurer l'habilitation API Entreprise (DGFIP, URSSAF, Infogreffe)"
              className={headerActionClass}
            >
              <Key className="w-4 h-4 text-prune-600" />
              <span className="hidden sm:inline">API Entreprise</span>
            </button>
          )}

          {onResetQuestionnaire && (
            <button
              onClick={onResetQuestionnaire}
              title="Réinitialiser la simulation"
              className={headerActionClass}
              aria-label="Nouvelle simulation"
            >
              <RotateCcw className="w-4 h-4 text-prune-600" />
              <span className="hidden sm:inline">Nouveau</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="bg-prune-800" aria-label="Navigation principale">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 flex items-stretch overflow-x-auto">
          {NAV_ITEMS.map(({ page, label }) => {
            const isActive = activePage === page;
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative shrink-0 px-3 sm:px-4 py-3 text-[11px] sm:text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  isActive ? 'text-white' : 'text-white/80 hover:text-white hover:bg-prune-900'
                }`}
              >
                {label}
                {isActive && <span aria-hidden="true" className="absolute left-3 right-3 sm:left-4 sm:right-4 bottom-0 h-1 bg-safran-300" />}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
