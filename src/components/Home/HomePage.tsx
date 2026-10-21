/**
 * Page d'accueil : accès aux trois espaces dédiés (attestations, guide des aides, simulation).
 */

import React from 'react';
import { ShieldCheck, FileText, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AppPage } from '../../types/navigation';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
}

const ENTRIES: {
  page: AppPage;
  icon: React.ElementType;
  title: string;
  description: string;
  cta: string;
  accent: string;
}[] = [
  {
    page: 'attestations',
    icon: ShieldCheck,
    title: 'Attestations',
    description: "Recherchez une entreprise par son SIRET et récupérez ses 4 pièces : immatriculation RNE, attestation fiscale, attestation de vigilance et extrait des mandataires.",
    cta: 'Rechercher un SIRET',
    accent: 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  },
  {
    page: 'guide',
    icon: FileText,
    title: 'Guide des aides',
    description: "Parcourez les dispositifs de l'ADEC (Impresa Sì, Risilienza, Rinascita, Ribumbà, Impresi Paisani, RIESCE, Innuvazione, Impresamondu) et exportez le guide.",
    cta: 'Consulter le guide',
    accent: 'bg-blue-50 text-blue-700 ring-blue-200'
  },
  {
    page: 'simulation',
    icon: Calculator,
    title: 'Simulation',
    description: 'Déposez le PDF de la fiche projet : le simulateur est pré-rempli, vérifie l’éligibilité et calcule la proposition de mesures.',
    cta: 'Déposer une fiche projet',
    accent: 'bg-indigo-50 text-indigo-700 ring-indigo-200'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => (
  <div>
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border-b border-blue-900/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-2 flex-wrap">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Collectivité de Corse · Agence de Développement Économique de la Corse</span>
          <span className="text-blue-500">·</span>
          <span className="text-emerald-400 font-medium">Guide officiel 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Aides régionales aux entreprises</h1>
        <p className="text-sm text-blue-100/80 mt-2 max-w-2xl leading-relaxed">
          Vérifiez les justificatifs d'une entreprise, consultez les dispositifs d'aide de l'ADEC ou simulez les mesures applicables à un projet.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-blue-200">
          <span className="flex items-center gap-1.5 text-white font-medium bg-blue-900/40 border border-blue-700/50 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Délibération 21/177 AC & Règl. UE 2023/2831
          </span>
          <span>Plafond de minimis : <strong className="text-white">300 000 €</strong> / 3 ans</span>
        </div>
      </div>
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {ENTRIES.map(({ page, icon: Icon, title, description, cta, accent }) => (
        <button
          key={page}
          type="button"
          onClick={() => onNavigate(page)}
          className="group text-left bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col gap-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div className={`w-10 h-10 rounded-xl ring-1 flex items-center justify-center ${accent}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-600 leading-relaxed flex-1">{description}</p>
          <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
            {cta}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      ))}
    </div>
  </div>
);
