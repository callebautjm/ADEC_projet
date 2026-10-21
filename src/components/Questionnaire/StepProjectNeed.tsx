/**
 * Step 3 : Typologie du projet & Besoins spécifiques de l'entreprise
 * Collectivité de Corse / ADEC
 */

import React, { useState } from 'react';
import { ProjectFinancials, NeedCategory, RegulatoryStatus, CompanyProfile, DispositifScheme } from '../../types';
import { Eye } from 'lucide-react';
import { analyzeCompanyCreationDate } from '../../utils/companyAge';
import { useDatabases } from '../../context/DatabaseContext';
import { DispositifDetailModal } from '../Results/DispositifDetailModal';
import { Badge, Notice, Panel, SectionHeading, inputClass, labelClass } from '../Layout/ui';

interface StepProjectNeedProps {
  data: ProjectFinancials;
  regulatory?: RegulatoryStatus;
  company?: CompanyProfile;
  onChange: (updated: Partial<ProjectFinancials>) => void;
  /** Section intégrée dans une étape plus large : masque le titre d’étape */
  embedded?: boolean;
}

interface NeedOption {
  id: NeedCategory;
  title: string;
  tagline: string;
  dispositifsAssocies: string;
  isExemptFromQualitative?: boolean;
  recommendedWhen?: (regulatory?: RegulatoryStatus, company?: CompanyProfile) => string | null;
}

const OFFICIAL_SCHEME_IDS = [
  'risilienza',
  'rinascita',
  'ribumba',
  'impresi_paisani',
  'riesce',
  'pattu_innuvazione_amorcage',
  'pattu_innuvazione_developpement',
  'pattu_innuvazione_rd_structurant',
  'impresa_si_creation',
  'impresa_si_developpement_invest',
  'impresa_si_developpement_structurant',
  'impresa_si_reprise_transmission',
  'sviluppu_suciale',
  'impresamondu_individuel',
  'impresamondu_stage',
  'impresamondu_collectif'
];

const NEED_OPTIONS: NeedOption[] = [
  {
    id: 'CREATION_ENTREPRISE',
    title: 'Création d’Entreprise Structurante (≤ 5 ans d’existence)',
    tagline: 'Jeune entreprise immatriculée depuis 5 ans au plus, sans distribution préalable de dividendes, non issue d’une concentration, investissements initiaux structurants.',
    dispositifsAssocies: 'IMPRESA SÌ – Phase Création Structurante (Guide 2026)',
    isExemptFromQualitative: false,
    recommendedWhen: (_, company) => {
      const age = analyzeCompanyCreationDate(company?.creationDate);
      if (age.isDateKnown && age.isUnderFiveYears) {
        return `Recommandé : entreprise créée il y a ${age.ageLabel} (≤ 5 ans)`;
      }
      return null;
    }
  },
  {
    id: 'RESTRUCTURATION_REBOND',
    title: 'Rebond & Restructuration d’Entreprise Fragilisée',
    tagline: 'Difficultés économiques objectives, problèmes de solvabilité immédiate, besoin de financement pour plan de redressement validé par expert-comptable.',
    dispositifsAssocies: 'Mesure d’aide Ribumbà (Annexe 1)',
    isExemptFromQualitative: true,
    recommendedWhen: (regulatory) =>
      regulatory?.isCompanyInDifficultyEU
        ? 'Recommandé : entreprise déclarée en difficulté (étape 2)'
        : null
  },
  {
    id: 'RESILIENCE_CHOC',
    title: 'Résilience, Adaptation aux mutations & Sécurisation',
    tagline: 'Modernisation de l’outil de travail, transition écologique ou numérique, diversification, maintien d’emplois suite à des chocs économiques.',
    dispositifsAssocies: 'Mesure d’aide Risilienza (Annexe 1)',
    isExemptFromQualitative: true
  },
  {
    id: 'SINISTRE_CATASTROPHE',
    title: 'Reconstruction après Sinistre Majeur ou Catastrophe',
    tagline: 'Entreprise affectée par un incendie, inondation, tempête, accident industriel ou acte accidentel/criminel ayant causé des dommages matériels ou arrêt d’activité.',
    dispositifsAssocies: 'Mesure d’aide Rinascita (Annexe 1)',
    isExemptFromQualitative: true
  },
  {
    id: 'RURALITE_PROXIMITE',
    title: 'Commerce, Artisanat & Services en Territoire Rural ou Montagne',
    tagline: 'Activités productives de proximité en zonage SALVEZZA ou communes < 1 000 hab, circuits courts, camion ambulant de tournée rurale.',
    dispositifsAssocies: 'Mesure d’aide Impresi paisani (Annexe 1)',
    isExemptFromQualitative: true,
    recommendedWhen: (_, company) =>
      company?.locationType === 'RURAL_SALVEZZA_UNDER_1000' || company?.locationType === 'POLE_RURAL_STRUCTURANT'
        ? 'Adapté : implantation en territoire rural ou de montagne (étape 1)'
        : null
  },
  {
    id: 'EMPLOI_RSE',
    title: 'Création d’Emplois, Recrutement & Démarche RSE Sociale',
    tagline: 'Recrutements externes durables, transformation de CDD en CDI, mobilité interne, embauche de jeunes diplômés, seniors ou travailleurs handicapés.',
    dispositifsAssocies: 'Dispositif RIESCE (Guide 2026)',
    isExemptFromQualitative: false
  },
  {
    id: 'INNOVATION_AMORCAGE',
    title: 'Innovation – Phase Amorçage / Faisabilité / Idéation',
    tagline: 'Études de concept, prototypage, analyse du potentiel d’innovation, faisabilité technique, études de marché, propriété intellectuelle, salons de l’innovation.',
    dispositifsAssocies: 'U Pattu Innuvazione – Volet 1 (Guide 2026)',
    isExemptFromQualitative: false
  },
  {
    id: 'INNOVATION_DEVELOPPEMENT',
    title: 'Innovation – Phase Développement & Dépenses R&D',
    tagline: 'Phase d’émergence technologique, salaires des chercheurs et techniciens R&D, amortissement matériel de test, brevets.',
    dispositifsAssocies: 'U Pattu Innuvazione – Volet 2 (Guide 2026)',
    isExemptFromQualitative: false
  },
  {
    id: 'INNOVATION_RD_STRUCTURANT',
    title: 'R&D Privée et Projets d’Innovation Structurants',
    tagline: 'Infrastructures de recherche mutualisées, pôles d’innovation, innovation de procédé/organisation structurante pour une filière insulaire.',
    dispositifsAssocies: 'U Pattu Innuvazione – Volet 3 (Guide 2026)',
    isExemptFromQualitative: false
  },
  {
    id: 'INVESTISSEMENT_DEVELOPPEMENT',
    title: 'Investissement Productif PME & Véhicules Propres',
    tagline: 'Accroissement et modernisation des capacités de production, transition écologique, digitalisation, cybersécurité, achat de véhicule utilitaire propre.',
    dispositifsAssocies: 'IMPRESA SÌ – Phase Développement (Guide 2026)',
    isExemptFromQualitative: false
  },
  {
    id: 'INVESTISSEMENT_STRUCTURANT',
    title: 'Investissements Structurants à Grande Plus-Value Territoriale',
    tagline: 'Projets d’envergure apportant une réelle démonstration de plus-value à l’échelle d’un secteur d’activité, d’une filière ou de la Corse.',
    dispositifsAssocies: 'IMPRESA SÌ – Volet Structurant (Guide 2026)',
    isExemptFromQualitative: false
  },
  {
    id: 'REPRISE_TRANSMISSION',
    title: 'Reprise d’Entreprise (Rachat de Fonds ou Parts Sociales)',
    tagline: 'Bouclage du tour de table financier pour l’acquisition d’une PME corse existante (cible active depuis ≥ 12 mois, contrôle majoritaire).',
    dispositifsAssocies: 'IMPRESA SÌ – Reprise-Transmission (Guide 2026)',
    isExemptFromQualitative: false
  },
  {
    id: 'ESS_SOLIDARITE',
    title: 'Économie Sociale et Solidaire (ESS) & Utilité Sociale',
    tagline: 'Activités d’utilité sociale, insertion par l’activité économique (SIAE), intégration de travailleurs handicapés, convention d’objectifs et de moyens.',
    dispositifsAssocies: 'SVILUPPU SUCIALE È SULIDARITÀ (Guide 2026)',
    isExemptFromQualitative: false,
    recommendedWhen: (_, company) =>
      company?.legalForm === 'ASSOCIATION_ESS' || company?.legalForm === 'SIAE' || company?.sector === 'ESS'
        ? 'Adapté : structure de l’ESS (étape 1)'
        : null
  },
  {
    id: 'INTERNATIONAL_EXPORT',
    title: 'Développement International & Conquête Export',
    tagline: 'Participation à des salons internationaux (France ou étranger), missions de prospection, communication multilingue, accueil d’un stagiaire export.',
    dispositifsAssocies: 'U PATTU IMPRESAMONDU (Guide 2026)',
    isExemptFromQualitative: false
  }
];

/** Case de sélection d'un besoin ou d'un dispositif */
const SelectableCard: React.FC<{ selected: boolean; onToggle: () => void; children: React.ReactNode }> = ({ selected, onToggle, children }) => (
  <label
    className={`flex items-start gap-2.5 px-3 py-2.5 border rounded-md cursor-pointer transition-colors ${
      selected ? 'border-prune-600 bg-prune-50/50' : 'border-neutral-200 bg-white hover:bg-neutral-50'
    }`}
  >
    <input type="checkbox" checked={selected} onChange={onToggle} className="w-4 h-4 mt-0.5 shrink-0" />
    <span className="min-w-0 flex-1 space-y-1">{children}</span>
  </label>
);

const QualitativeBadge: React.FC<{ exempt: boolean }> = ({ exempt }) =>
  exempt ? <Badge tone="info">Sans évaluation qualitative (Annexe 1)</Badge> : <Badge>Évaluation qualitative : ≥ 3 OUI</Badge>;

export const StepProjectNeed: React.FC<StepProjectNeedProps> = ({ data, regulatory, company, onChange, embedded = false }) => {
  const { allActiveSchemes } = useDatabases();
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<DispositifScheme | null>(null);

  // Identifier tous les dispositifs personnalisés ou récemment ajoutés qui ne font pas partie des 16 officiels
  const customSchemes = allActiveSchemes.filter(
    (s) => !OFFICIAL_SCHEME_IDS.includes(s.id) && s.isActive
  );

  const toggleNeed = (id: NeedCategory) => {
    const current = data.selectedNeedCategories || [];
    if (current.includes(id)) {
      onChange({ selectedNeedCategories: current.filter((item) => item !== id) });
    } else {
      onChange({ selectedNeedCategories: [...current, id] });
    }
  };

  return (
    <div className="space-y-4">
      {!embedded && (
        <SectionHeading
          title="3. Besoins spécifiques et typologie du projet"
          description="Axes correspondant au projet : ils déterminent les dispositifs analysés par le moteur."
        />
      )}

      {regulatory?.isCompanyInDifficultyEU && (
        <Notice tone="info" title="Orientation automatique (étape 2)">
          L’entreprise est déclarée en difficulté financière : le besoin <strong>« Rebond & Restructuration (Ribumbà) »</strong> est sélectionné automatiquement. D’autres besoins peuvent être ajoutés ci-dessous.
        </Notice>
      )}

      {/* La description du projet est saisie dans le panneau « Projet » quand cette section y est intégrée */}
      {!embedded && (
        <div>
          <label htmlFor="need-description" className={labelClass}>
            Description synthétique du projet (facultative)
          </label>
          <textarea
            id="need-description"
            rows={3}
            value={data.projectDescription || ''}
            onChange={(e) => onChange({ projectDescription: e.target.value })}
            placeholder="Ex : acquisition d’une ligne de conditionnement et développement d’un site de vente en ligne multilingue…"
            className={inputClass}
          />
        </div>
      )}

      {/* Dispositifs ajoutés aux bases documentaires */}
      {customSchemes.length > 0 && (
        <Panel
          headingLevel={3}
          title={`Dispositifs ajoutés à la base (${customSchemes.length})`}
          description="Dispositifs importés ou analysés dans les bases documentaires : les cocher pour les cibler dans la simulation."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {customSchemes.map((scheme) => (
              <SelectableCard key={scheme.id} selected={data.selectedNeedCategories.includes(scheme.id)} onToggle={() => toggleNeed(scheme.id)}>
                <span className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-500">
                  <span className="font-mono text-neutral-700">{scheme.code}</span>
                  <span>{scheme.category}</span>
                </span>
                <span className="block text-sm font-medium text-neutral-900 leading-snug">{scheme.name}</span>
                <span className="block text-xs text-neutral-600 leading-relaxed line-clamp-2">{scheme.objective || scheme.subtitle}</span>
                <span className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="text-neutral-600">
                    Taux indicatif : {scheme.rates?.tpeMaxRate ? `${(scheme.rates.tpeMaxRate * 100).toFixed(0)} %` : 'selon barème'}
                    {scheme.rates?.ceilingAmount ? ` · plafond ${scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €` : ''}
                  </span>
                  <QualitativeBadge exempt={!scheme.requiresQualitativeEvaluation} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSchemeDetail(scheme);
                    }}
                    className="ml-auto inline-flex items-center gap-1 font-medium text-prune-700 hover:text-prune-900 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    Fiche
                  </button>
                </span>
              </SelectableCard>
            ))}
          </div>
        </Panel>
      )}

      <Panel
        headingLevel={3}
        title="Besoins concernés"
        description="Sélection multiple possible."
        actions={<Badge tone={data.selectedNeedCategories.length > 0 ? 'accent' : 'neutral'}>{data.selectedNeedCategories.length} sélectionné(s)</Badge>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {NEED_OPTIONS.map((opt) => {
            const recommendation = opt.recommendedWhen ? opt.recommendedWhen(regulatory, company) : null;
            return (
              <SelectableCard key={opt.id} selected={data.selectedNeedCategories.includes(opt.id)} onToggle={() => toggleNeed(opt.id)}>
                <span className="block text-sm font-medium text-neutral-900 leading-snug">{opt.title}</span>
                {recommendation && <span className="block text-[11px] font-medium text-prune-800">{recommendation}</span>}
                <span className="block text-xs text-neutral-600 leading-relaxed">{opt.tagline}</span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[11px]">
                  <span className="text-neutral-500">Mesure cible :</span>
                  <span className="font-medium text-neutral-800">{opt.dispositifsAssocies}</span>
                  <QualitativeBadge exempt={Boolean(opt.isExemptFromQualitative)} />
                </span>
              </SelectableCard>
            );
          })}
        </div>

        <Notice>
          Les mesures de l’Annexe 1 (<strong>U Pattu Risilienza è Territorii</strong> : Risilienza, Impresi Paisani, Rinascita, Ribumbà) ne relèvent pas de la grille d’évaluation qualitative de la délibération n° 21/177 AC : instruction directe, sans score minimal.
          {customSchemes.length === 0 && ' D’autres arrêtés ou dispositifs peuvent être ajoutés à la base depuis la page Textes officiels.'}
        </Notice>
      </Panel>

      {/* Modale d'aperçu d'un dispositif personnalisé */}
      {selectedSchemeDetail && (
        <DispositifDetailModal
          scheme={selectedSchemeDetail}
          onClose={() => setSelectedSchemeDetail(null)}
        />
      )}
    </div>
  );
};
