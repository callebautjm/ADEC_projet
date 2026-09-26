/**
 * En-tête de navigation - ADEC Corse
 * Style sobre, aéré, institutionnel et élégant
 */

import React from 'react';
import { Database, FileText, CheckCircle2, RotateCcw, Key } from 'lucide-react';

interface HeaderProps {
  activeTab: 'questionnaire' | 'results' | 'explorer' | 'database';
  setActiveTab: (tab: 'questionnaire' | 'results' | 'explorer' | 'database') => void;
  onResetQuestionnaire?: () => void;
  onOpenTokenModal?: () => void;
  onOpenSalvezzaModal?: () => void;
  hasResults: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetQuestionnaire,
  onOpenTokenModal,
  hasResults
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Identité ADEC Corse */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('questionnaire')}
            className="text-left group flex items-center gap-2.5 transition"
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
          <button
            onClick={() => setActiveTab('questionnaire')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'questionnaire'
                ? 'bg-white text-blue-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Questionnaire
          </button>

          {hasResults && (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'results'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Résultats</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'explorer'
                ? 'bg-white text-blue-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Guide des aides</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-white text-blue-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Textes officiels</span>
          </button>
        </nav>

        {/* Actions utilisateur épurées */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenTokenModal && (
            <button
              onClick={onOpenTokenModal}
              title="Configurer l'habilitation API Entreprise (DGFIP, URSSAF, Infogreffe)"
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5 border border-slate-200/80 shadow-2xs font-medium"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">API Entreprise</span>
            </button>
          )}

          {onResetQuestionnaire && (
            <button
              onClick={onResetQuestionnaire}
              title="Réinitialiser le dossier"
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5 border border-slate-200/80"
              aria-label="Nouveau dossier"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Nouveau</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

