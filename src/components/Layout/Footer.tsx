/**
 * Pied de page, sur le modèle du site adec.corsica : fond gris clair, filet supérieur, bandeau bas.
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer className="mt-16 bg-neutral-100 border-t border-neutral-200 text-xs text-neutral-600">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div className="space-y-1.5 max-w-xl">
        <span className="block text-xl font-black tracking-tight text-prune-600">ADEC</span>
        <p className="leading-relaxed">
          Agence de Développement Économique de la Corse · Collectivité de Corse
        </p>
      </div>

      <a
        href="https://www.adec.corsica"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 rounded-full border-2 border-prune-600 text-prune-700 hover:bg-prune-600 hover:text-white text-[11px] font-bold uppercase tracking-wider transition"
      >
        Portail officiel ADEC
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>

    <div className="border-t border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between gap-1 text-[11px] text-neutral-500">
        <span>
          <strong className="font-semibold text-neutral-800">ADEC Corse Aides 2026</strong> · Outil d’aide à la décision conforme aux délibérations territoriales
        </span>
        <span>Moteur d’analyse documentaire extensible</span>
      </div>
    </div>
  </footer>
);
