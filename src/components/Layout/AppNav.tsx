/**
 * Navigation de l'outil : barre latérale sur grand écran, barre supérieure à onglets sur mobile.
 * Le bas de la barre latérale indique l'état du jeton API Entreprise et la base de dispositifs chargée.
 */

import React from 'react';
import { Home, ShieldCheck, Calculator, BookOpen, Library, KeyRound, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { AppPage } from '../../types/navigation';
import { useHasApiEntrepriseToken } from '../../hooks/useHasApiEntrepriseToken';
import { StatusDot } from './ui';

interface AppNavProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onOpenTokenModal: () => void;
  schemesCount: number;
}

type NavItem =
  | { page: AppPage; label: string; icon: React.ElementType; externalUrl?: never }
  | { page?: never; label: string; icon: React.ElementType; externalUrl: string };

const NAV_GROUPS: { label?: string; items: NavItem[] }[] = [
  { items: [{ page: 'accueil', label: 'Accueil', icon: Home }] },
  {
    label: 'Instruction',
    items: [
      { page: 'attestations', label: 'Attestations', icon: ShieldCheck },
      { page: 'simulation', label: 'Simulation', icon: Calculator },
      {
        label: 'Liasse fiscale',
        icon: FileSpreadsheet,
        externalUrl: 'https://analyseur-de-liasse-fiscale.ai.studio/'
      }
    ]
  },
  {
    label: 'Référentiel',
    items: [
      { page: 'guide', label: 'Guide des aides', icon: BookOpen },
      { page: 'textes', label: 'Textes officiels', icon: Library }
    ]
  }
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const Wordmark: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-2.5 text-left cursor-pointer" aria-label="Accueil des outils ADEC">
    <span className="px-1.5 py-1 rounded bg-prune-700 text-white text-[11px] font-bold tracking-wide leading-none">ADEC</span>
    <span className="leading-tight">
      <span className="block text-sm font-semibold text-neutral-900">Outils d’instruction</span>
      <span className="block text-[11px] text-neutral-500">Aides aux entreprises</span>
    </span>
  </button>
);

export const AppNav: React.FC<AppNavProps> = ({ activePage, onNavigate, onOpenTokenModal, schemesCount }) => {
  const hasToken = useHasApiEntrepriseToken();
  const tokenLabel = hasToken ? 'Jeton configuré' : 'Aucun jeton';

  return (
    <>
      {/* Grand écran : barre latérale */}
      <aside className="no-print hidden lg:flex lg:flex-col w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-neutral-200">
        <div className="h-14 px-4 flex items-center border-b border-neutral-200">
          <Wordmark onClick={() => onNavigate('accueil')} />
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4" aria-label="Navigation principale">
          {NAV_GROUPS.map((group, idx) => (
            <div key={group.label || idx}>
              {group.label && <p className="px-2 mb-1 text-[11px] font-medium text-neutral-400">{group.label}</p>}
              <ul className="space-y-px">
                {group.items.map((item) => {
                  if (item.externalUrl) {
                    const Icon = item.icon;
                    return (
                      <li key={item.label}>
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ouvrir l'analyseur de liasse fiscale (dans un nouvel onglet)"
                          className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer group"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0 text-neutral-400 group-hover:text-prune-700" />
                            {item.label}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 shrink-0" />
                        </a>
                      </li>
                    );
                  }

                  const { page, label, icon: Icon } = item;
                  if (!page) return null;
                  const isActive = activePage === page;
                  return (
                    <li key={page}>
                      <button
                        type="button"
                        onClick={() => onNavigate(page)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                          isActive ? 'bg-prune-50 text-prune-900 font-medium' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-prune-700' : 'text-neutral-400'}`} />
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-neutral-200 p-2 space-y-2">
          <button
            type="button"
            onClick={onOpenTokenModal}
            title="Configurer le jeton API Entreprise (DGFiP, URSSAF, INPI, INSEE)"
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="flex-1 text-left">API Entreprise</span>
            <span className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <StatusDot tone={hasToken ? 'success' : 'warning'} />
              {tokenLabel}
            </span>
          </button>
          <p className="px-2 pb-1 text-[11px] leading-snug text-neutral-400">
            Guide des aides 2026 · {schemesCount} dispositifs
            <br />
            Usage interne, agents de l’ADEC
          </p>
        </div>
      </aside>

      {/* Mobile et tablette : barre supérieure */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="h-12 px-4 flex items-center justify-between gap-3">
          <Wordmark onClick={() => onNavigate('accueil')} />
          <button
            type="button"
            onClick={onOpenTokenModal}
            title="Configurer le jeton API Entreprise"
            className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-xs text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-neutral-400" />
            <StatusDot tone={hasToken ? 'success' : 'warning'} />
            <span className="sr-only">{tokenLabel}</span>
          </button>
        </div>
        <nav className="flex overflow-x-auto px-2" aria-label="Navigation principale">
          {ALL_ITEMS.map((item) => {
            if (item.externalUrl) {
              return (
                <a
                  key={item.label}
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap border-b-2 border-transparent text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  {item.label}
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              );
            }
            const { page, label } = item;
            if (!page) return null;
            const isActive = activePage === page;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onNavigate(page)}
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  isActive ? 'border-prune-700 text-neutral-900 font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </header>
    </>
  );
};
