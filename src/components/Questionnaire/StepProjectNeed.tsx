/**
 * Step 3 : Typologie du projet & Besoins spécifiques de l'entreprise
 * Collectivité de Corse / ADEC
 */

import React, { useState } from 'react';
import { ProjectFinancials, NeedCategory, RegulatoryStatus, CompanyProfile, DispositifScheme } from '../../types';
import { Target, Check, AlertCircle, Info, Sparkles, ShieldCheck, Award, Eye, Database } from 'lucide-react';
import { analyzeCompanyCreationDate } from '../../utils/companyAge';
import { useDatabases } from '../../context/DatabaseContext';
import { DispositifDetailModal } from '../Results/DispositifDetailModal';

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
        return `Recommandé pour votre entreprise créée il y a ${age.ageLabel} (≤ 5 ans)`;
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
        ? 'Recommandé suite à votre déclaration en étape 2 (Entreprise en difficulté)'
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
        ? 'Adapté à votre implantation en territoire rural ou de montagne (Étape 1)'
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
        ? 'Adapté à votre statut ESS (Étape 1)'
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
    <div className="space-y-6">
      {!embedded && (
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-700" />
            3. Identification des Besoins Spécifiques & Typologie du Projet
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sélectionnez les axes correspondant précisément à votre projet d’entreprise pour activer les dispositifs réglementaires adéquats.
          </p>
        </div>
      )}

      {regulatory?.isCompanyInDifficultyEU && (
        <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2.5 text-xs text-sky-950">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block">Orientation automatique prise en compte (Étape 2) :</strong>
            <span>
              Votre entreprise a été déclarée en situation de difficulté financière. Le besoin <strong>« Rebond & Restructuration (Ribumbà) »</strong> a été automatiquement sélectionné pour assurer son éligibilité à ce dispositif d'urgence. Vous pouvez affiner ou ajouter d'autres besoins complémentaires ci-dessous.
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Description synthétique du projet (optionnelle mais recommandée)
        </label>
        <textarea
          rows={3}
          value={data.projectDescription || ''}
          onChange={(e) => onChange({ projectDescription: e.target.value })}
          placeholder="Ex: Acquisition d’une nouvelle ligne de conditionnement moderne et développement d’un site de vente en ligne multilingue..."
          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
        />
      </div>

      {/* SECTION NOUVEAUX DISPOSITIFS / BASES DOCUMENTAIRES AJOUTÉES */}
      {customSchemes.length > 0 && (
        <div className="p-4 bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-white border-2 border-indigo-300/80 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                <Database className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  Nouveaux Dispositifs & Bases Documentaires Ajoutées ({customSchemes.length})
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900 border border-indigo-300">
                    Actifs
                  </span>
                </h3>
                <p className="text-[11px] text-indigo-800">
                  Dispositifs récemment importés ou analysés dans votre base documentaire. Cochez-les pour les cibler en priorité dans votre diagnostic.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customSchemes.map((scheme) => {
              const isSelected = data.selectedNeedCategories.includes(scheme.id);
              return (
                <div
                  key={scheme.id}
                  onClick={() => toggleNeed(scheme.id)}
                  className={`p-3.5 border rounded-xl cursor-pointer transition text-left relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-white shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {scheme.code}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {scheme.category}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 border border-sky-200">
                            Nouveau
                          </span>
                        </div>
                        <h4 className={`text-sm font-bold leading-snug ${isSelected ? 'text-indigo-950' : 'text-slate-900'}`}>
                          {scheme.name}
                        </h4>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2.5 line-clamp-2">
                      {scheme.objective || scheme.subtitle}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-1.5 text-[11px]">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-slate-400 font-medium">Taux d'aide indicatif :</span>
                      <span className="font-bold text-indigo-700">
                        {scheme.rates?.tpeMaxRate ? `${(scheme.rates.tpeMaxRate * 100).toFixed(0)} %` : 'Selon barème'}
                        {scheme.rates?.ceilingAmount ? ` (Plafond : ${scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €)` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-1">
                      {!scheme.requiresQualitativeEvaluation ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          Non soumis à l'évaluation qualitative
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-normal text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                          <Award className="w-3 h-3 text-slate-400 shrink-0" />
                          Soumis à l'évaluation qualitative (≥ 3 OUI)
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchemeDetail(scheme);
                        }}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline ml-auto"
                      >
                        <Eye className="w-3 h-3" />
                        Fiche
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Sélectionnez les besoins concernés ({data.selectedNeedCategories.length} sélectionné(s))
          </label>
          <span className="text-xs text-slate-500">
            Sélection multiple autorisée · Cliquez pour activer ou désactiver
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {NEED_OPTIONS.map((opt) => {
            const isSelected = data.selectedNeedCategories.includes(opt.id);
            const recommendation = opt.recommendedWhen ? opt.recommendedWhen(regulatory, company) : null;

            return (
              <div
                key={opt.id}
                onClick={() => toggleNeed(opt.id)}
                className={`p-3.5 border rounded-xl cursor-pointer transition text-left relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h3 className={`text-sm font-bold leading-snug ${isSelected ? 'text-blue-950' : 'text-slate-900'}`}>
                        {opt.title}
                      </h3>
                      {recommendation && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                          {recommendation}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                    {opt.tagline}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-400">Mesure cible :</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold truncate ${
                      isSelected
                        ? 'bg-blue-100/80 text-blue-900 border border-blue-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {opt.dispositifsAssocies}
                    </span>
                  </div>

                  {opt.isExemptFromQualitative ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      Non soumis à l'évaluation qualitative (Annexe 1)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-normal text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80 w-fit">
                      <Award className="w-3 h-3 text-slate-400 shrink-0" />
                      Soumis à l'évaluation qualitative (≥ 3 OUI)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Information Base Documentaire Personnalisée si aucun dispositif personnalisé actif */}
        {customSchemes.length === 0 && (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Vous souhaitez intégrer un autre arrêté ou dispositif d’aide spécifique ? Vous pouvez enrichir la base à tout moment via l’onglet <strong>Base Documentaire</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Note officielle sur les 2 régimes d'instruction */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-800 block">
              Information sur l'étape suivante (Évaluation Qualitative) :
            </span>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Les mesures de l'Annexe 1 (<strong className="text-slate-800">U PATTU RISILIENZA È TERRITORII</strong> : Risilienza, Impresi Paisani, Rinascita, Ribumbà) ne relèvent pas de la grille d'évaluation qualitative de la Délibération N° 21/177 AC et font l'objet d'une instruction directe sans exigence de score minimal.
            </p>
          </div>
        </div>
      </div>

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
