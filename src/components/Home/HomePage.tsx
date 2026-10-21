/**
 * Page d'accueil : accès aux trois espaces dédiés (attestations, guide des aides, simulation),
 * mise en page inspirée des accès rapides et des chiffres clés du site adec.corsica.
 */

import React from 'react';
import { ShieldCheck, BookOpen, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AppPage } from '../../types/navigation';
import { useDatabases } from '../../context/DatabaseContext';
import { PageHero } from '../Layout/PageHero';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
}

const ENTRIES: {
  page: AppPage;
  icon: React.ElementType;
  title: string;
  description: string;
  cta: string;
}[] = [
  {
    page: 'attestations',
    icon: ShieldCheck,
    title: 'Attestations',
    description: "Recherchez une entreprise par son SIRET et récupérez ses 4 pièces : immatriculation RNE, attestation fiscale, attestation de vigilance et extrait des mandataires.",
    cta: 'Rechercher un SIRET'
  },
  {
    page: 'guide',
    icon: BookOpen,
    title: 'Guide des aides',
    description: "Parcourez les dispositifs de l'ADEC (Impresa Sì, Risilienza, Rinascita, Ribumbà, Impresi Paisani, RIESCE, Innuvazione, Impresamondu) et exportez le guide.",
    cta: 'Consulter le guide'
  },
  {
    page: 'simulation',
    icon: Calculator,
    title: 'Simulation',
    description: 'Déposez le PDF de la fiche projet : le simulateur est pré-rempli, vérifie l’éligibilité et calcule la proposition de mesures.',
    cta: 'Déposer une fiche projet'
  }
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { allActiveSchemes } = useDatabases();

  const keyFigures = [
    { value: String(allActiveSchemes.length), label: "dispositifs d'aide au catalogue" },
    { value: '300 000 €', label: 'plafond de minimis sur 3 ans' },
    { value: '4', label: 'pièces justificatives vérifiées par SIRET' }
  ];

  return (
    <div>
      <PageHero
        size="large"
        eyebrow="Collectivité de Corse · Agence de Développement Économique de la Corse"
        title="Aides régionales aux entreprises"
        description="Vérifiez les justificatifs d'une entreprise, consultez les dispositifs d'aide de l'ADEC ou simulez les mesures applicables à un projet."
      >
        <p className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 border border-white/25 px-3 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5 text-safran-300" />
          Guide officiel 2026 · Délibération 21/177 AC & Règl. UE 2023/2831
        </p>
      </PageHero>

      {/* Accès rapides */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Que souhaitez-vous faire ?</h2>
        <span aria-hidden="true" className="block w-12 h-1 bg-safran-300 mt-3" />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {ENTRIES.map(({ page, icon: Icon, title, description, cta }) => (
            <button
              key={page}
              type="button"
              onClick={() => onNavigate(page)}
              className="group relative text-left bg-white border border-neutral-200 border-t-4 border-t-prune-600 p-6 sm:p-7 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-prune-500"
            >
              <Icon className="w-10 h-10 text-prune-600" strokeWidth={1.5} />
              <h3 className="text-base font-bold uppercase tracking-wide text-neutral-900">
                <span className="adec-underline">{title}</span>
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed flex-1">{description}</p>
              <span className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-prune-600 text-prune-700 group-hover:bg-prune-600 group-hover:text-white text-[11px] font-bold uppercase tracking-wider transition">
                {cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14">
        <div className="bg-white border border-neutral-200 px-6 sm:px-10 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {keyFigures.map(({ value, label }) => (
            <div key={label} className="flex gap-4">
              <span aria-hidden="true" className="w-1 shrink-0 bg-prune-600" />
              <div>
                <span className="block text-3xl sm:text-4xl font-black text-prune-600 leading-none">{value}</span>
                <span className="block text-sm font-bold text-neutral-900 mt-2 leading-snug">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
