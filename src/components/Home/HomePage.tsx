/**
 * Accueil de l'outil : actions directes (recherche SIRET, dépôt d'une fiche projet),
 * accès aux outils, repères réglementaires et liens utiles pour l'instruction.
 */

import React from 'react';
import { ShieldCheck, Calculator, BookOpen, Library, ChevronRight, ExternalLink } from 'lucide-react';
import { CompanyProfile } from '../../types';
import { AnalyseFicheProjetResponse } from '../../types/ficheProjet';
import { AppPage } from '../../types/navigation';
import { useDatabases } from '../../context/DatabaseContext';
import { useHasApiEntrepriseToken } from '../../hooks/useHasApiEntrepriseToken';
import { PageHeader } from '../Layout/PageHeader';
import { Panel, Notice, btn, linkClass, pageContainer } from '../Layout/ui';
import { SiretSearchForm } from '../Attestations/SiretSearchForm';
import { ProjectSheetPreloader } from '../Dossier/ProjectSheetPreloader';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
  onCompanyFound: (profile: Partial<CompanyProfile>) => void;
  onFicheAnalysee: (analyse: AnalyseFicheProjetResponse) => void;
  onStartManualSimulation: () => void;
  onOpenTokenModal: () => void;
  /** Entreprise de la dernière recherche SIRET, s'il y en a une */
  lastCompany: CompanyProfile | null;
  /** Libellé de la simulation en cours, s'il y en a une */
  ongoingSimulation?: string;
}

const TOOLS: { page: AppPage; icon: React.ElementType; title: string; description: string }[] = [
  {
    page: 'attestations',
    icon: ShieldCheck,
    title: 'Attestations',
    description: 'Immatriculation RNE, attestation fiscale (DGFiP), attestation de vigilance (URSSAF) et mandataires, à partir du SIRET.'
  },
  {
    page: 'simulation',
    icon: Calculator,
    title: 'Simulation',
    description: 'Lecture de la fiche projet, contrôle des critères d’accès, évaluation qualitative et proposition de mesures.'
  },
  {
    page: 'guide',
    icon: BookOpen,
    title: 'Guide des aides',
    description: 'Fiches des dispositifs : bénéficiaires, exclusions, dépenses éligibles, taux et plafonds ; export PDF des fiches.'
  },
  {
    page: 'textes',
    icon: Library,
    title: 'Textes officiels',
    description: 'Bases documentaires du moteur d’éligibilité : consultation, intégration d’un nouveau texte, import / export.'
  }
];

const USEFUL_LINKS: { href: string; label: string; hint: string }[] = [
  { href: 'https://annuaire-entreprises.data.gouv.fr', label: 'Annuaire des Entreprises', hint: 'Fiche publique, dirigeants, annonces légales' },
  { href: 'https://entreprise.api.gouv.fr', label: 'API Entreprise', hint: 'Habilitations et jetons d’accès' },
  {
    href: 'https://www.urssaf.fr/portail/home/utile-et-pratique/verification-attestation.html',
    label: 'URSSAF · vérification d’attestation',
    hint: 'Authenticité d’une attestation de vigilance'
  },
  { href: 'https://www.adec.corsica', label: 'Site de l’ADEC', hint: 'adec.corsica' }
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onCompanyFound,
  onFicheAnalysee,
  onStartManualSimulation,
  onOpenTokenModal,
  lastCompany,
  ongoingSimulation
}) => {
  const { allActiveSchemes } = useDatabases();
  const hasToken = useHasApiEntrepriseToken();

  const references: { label: string; value: React.ReactNode }[] = [
    { label: 'Plafond de minimis', value: '300 000 € par entreprise unique sur 3 exercices glissants (Règl. UE 2023/2831)' },
    { label: 'Seuil plancher d’aide', value: '5 000 € : en dessous, la demande est irrecevable' },
    {
      label: 'Évaluation qualitative',
      value: 'Au moins 3 « OUI » sur 8 critères (délib. 21/177 AC) ; non requise pour l’Annexe 1, U Pattu Risilienza è Territorii'
    },
    { label: 'Antériorité des dépenses', value: 'Aucune dépense engagée avant le dépôt du dossier (hors mesure Rinascita)' },
    { label: 'Fonds Salvezza', value: '230 communes sous contrainte : bonifications des volets Économique et Emploi' },
    { label: 'Catalogue du moteur', value: `${allActiveSchemes.length} dispositifs dans les bases documentaires chargées (page Textes officiels)` }
  ];

  return (
    <div>
      <PageHeader
        title="Accueil"
        description="Outils d’instruction des demandes d’aide aux entreprises, réservés aux agents de l’ADEC."
      />

      <div className={`${pageContainer} py-5 space-y-4`}>
        {/* Actions directes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel
            title="Vérifier une entreprise"
            description="Registres officiels et pièces justificatives à partir du SIRET."
            icon={ShieldCheck}
          >
            <SiretSearchForm
              id="siret-accueil"
              onFound={(profile) => {
                onCompanyFound(profile);
                onNavigate('attestations');
              }}
            />
            {!hasToken && (
              <Notice
                tone="warning"
                action={
                  <button type="button" onClick={onOpenTokenModal} className={btn('secondary', 'sm')}>
                    Configurer
                  </button>
                }
              >
                Aucun jeton API Entreprise : recherche limitée à la base publique, sans attestations DGFiP ni URSSAF.
              </Notice>
            )}
            {lastCompany?.siret && (
              <p className="text-xs text-neutral-500">
                Dernière recherche :{' '}
                <button type="button" onClick={() => onNavigate('attestations')} className={linkClass}>
                  {lastCompany.name || 'Établissement'}
                </button>{' '}
                <span className="font-mono">({lastCompany.siret})</span>
              </p>
            )}
          </Panel>

          <Panel
            title="Analyser une fiche projet"
            description="Le PDF de la fiche projet pré-remplit la simulation et produit une synthèse du dossier."
            icon={Calculator}
          >
            <ProjectSheetPreloader dossier={null} onFicheAnalysee={onFicheAnalysee} onRemoveDossier={() => undefined} />
            <p className="text-xs text-neutral-500">
              {ongoingSimulation ? (
                <>
                  Simulation en cours :{' '}
                  <button type="button" onClick={() => onNavigate('simulation')} className={linkClass}>
                    {ongoingSimulation}
                  </button>
                </>
              ) : (
                <>
                  Pas de fiche projet ?{' '}
                  <button type="button" onClick={onStartManualSimulation} className={linkClass}>
                    Saisir une simulation manuellement
                  </button>
                </>
              )}
            </p>
          </Panel>
        </div>

        {/* Outils */}
        <Panel title="Outils" bodyClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-neutral-200">
          {TOOLS.map(({ page, icon: Icon, title, description }) => (
            <button
              key={page}
              type="button"
              onClick={() => onNavigate(page)}
              className="group text-left px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-prune-600"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-neutral-900 group-hover:text-prune-800">
                <Icon className="w-4 h-4 text-neutral-400 group-hover:text-prune-700" />
                {title}
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-neutral-300 group-hover:text-prune-700" />
              </span>
              <span className="block mt-1 text-xs text-neutral-500 leading-relaxed">{description}</span>
            </button>
          ))}
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Repères réglementaires */}
          <Panel title="Repères réglementaires" className="lg:col-span-2" bodyClassName="px-4 py-1">
            <dl className="divide-y divide-neutral-100 text-xs">
              {references.map(({ label, value }) => (
                <div key={label} className="py-2 grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-x-4 gap-y-0.5">
                  <dt className="text-neutral-500">{label}</dt>
                  <dd className="text-neutral-800">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          {/* Liens utiles */}
          <Panel title="Liens utiles" bodyClassName="py-1">
            <ul className="divide-y divide-neutral-100">
              {USEFUL_LINKS.map(({ href, label, hint }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-2 px-4 py-2 hover:bg-neutral-50 transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm text-neutral-900 group-hover:text-prune-800">{label}</span>
                      <span className="block text-[11px] text-neutral-500">{hint}</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-neutral-300 group-hover:text-prune-700 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
};
