/**
 * Step 4 : Évaluation Qualitative des Projets (Délibération N° 21/177 AC)
 * Collectivité de Corse / Assemblée de Corse / ADEC
 */

import React from 'react';
import { QualitativeAnswers, NeedCategory } from '../../types';
import { QUALITATIVE_EVALUATION_QUESTIONS } from '../../data/adecOfficialData';
import { ChevronDown } from 'lucide-react';
import { computeQualitativeScore } from '../../services/engine';
import { useDatabases } from '../../context/DatabaseContext';
import { Badge, Notice, Panel, SectionHeading } from '../Layout/ui';

interface StepQualitativeProps {
  data: QualitativeAnswers;
  selectedNeeds?: (NeedCategory | string)[];
  onChange: (updated: Partial<QualitativeAnswers>) => void;
  /** Extraits de la fiche projet justifiant les critères pré-cochés */
  justifications?: Partial<Record<keyof QualitativeAnswers, string>>;
}

const RISILIENZA_NEEDS: NeedCategory[] = [
  'RESTRUCTURATION_REBOND',
  'RESILIENCE_CHOC',
  'SINISTRE_CATASTROPHE',
  'RURALITE_PROXIMITE'
];

const QUALITATIVE_THRESHOLD = 3;

export const StepQualitative: React.FC<StepQualitativeProps> = ({ data, selectedNeeds = [], onChange, justifications = {} }) => {
  const { allActiveSchemes } = useDatabases();
  const currentScore = computeQualitativeScore(data);
  const isValidated = currentScore >= QUALITATIVE_THRESHOLD;

  const isNeedExempt = (needId: string) => {
    if (RISILIENZA_NEEDS.includes(needId as NeedCategory)) return true;
    const matchedScheme = allActiveSchemes.find((s) => s.id === needId);
    if (matchedScheme && !matchedScheme.requiresQualitativeEvaluation) return true;
    return false;
  };

  const hasRisilienzaNeeds = selectedNeeds.some((n) => isNeedExempt(n));
  const isExclusivelyRisilienza =
    selectedNeeds.length > 0 && selectedNeeds.every((n) => isNeedExempt(n));
  const hasGuideNeeds = selectedNeeds.some((n) => !isNeedExempt(n));

  const handleToggle = (key: keyof QualitativeAnswers) => {
    onChange({ [key]: !data[key] });
  };

  const scoreBadge = isValidated ? (
    <Badge tone="success">Seuil atteint (≥ 3)</Badge>
  ) : isExclusivelyRisilienza ? (
    <Badge tone="info">Dispense (Annexe 1)</Badge>
  ) : (
    <Badge tone="warning">Seuil non atteint (&lt; 3)</Badge>
  );

  return (
    <div className="space-y-4">
      <SectionHeading
        title="4. Critères qualitatifs (délibération n° 21/177 AC)"
        description="Adéquation du projet aux objectifs stratégiques du PADDUC et du SRDE2I · Assemblée de Corse, 28 octobre 2021."
      />

      {/* Régime applicable selon les besoins sélectionnés */}
      {isExclusivelyRisilienza ? (
        <Notice tone="success" title="Mesures non soumises à l’évaluation qualitative (Annexe 1)">
          Les besoins sélectionnés relèvent <strong>exclusivement</strong> de U Pattu Risilienza è Territorii (Risilienza, Impresi Paisani, Rinascita ou Ribumbà) : ces mesures d’urgence, de proximité et de rebond ne relèvent pas de l’évaluation qualitative préalable et le seuil de 3 « OUI » ne s’applique pas. La grille peut être renseignée à titre indicatif, sans effet sur l’éligibilité.
        </Notice>
      ) : hasRisilienzaNeeds && hasGuideNeeds ? (
        <Notice tone="info" title="Régime mixte">
          La sélection combine des mesures de l’Annexe 1 (U Pattu Risilienza è Territorii), <strong>dispensées de seuil qualitatif</strong>, et des mesures du Guide 2026 (Impresa Sì, RIESCE, Innuvazione…) qui requièrent <strong>au moins 3 « OUI »</strong>.
        </Notice>
      ) : null}

      {/* Score et règle d'éligibilité */}
      <div className="bg-white border border-neutral-200 rounded-md px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 flex-wrap text-sm font-medium text-neutral-900">
            Score qualitatif : <span className="tabular-nums">{currentScore} / 8</span>
            {scoreBadge}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isValidated
              ? 'Au moins 3 réponses favorables : accès ouvert aux dispositifs du Guide (Impresa Sì, RIESCE, Innuvazione, Sviluppu Suciale, Impresamondu).'
              : isExclusivelyRisilienza
                ? 'Mesures de l’Annexe 1 exemptées de ce seuil : pas de condition suspensive.'
                : 'Règle du Guide (page 29) : au moins 3 critères favorables pour les aides du Guide 2026. Les aides de l’Annexe 1 n’y sont pas soumises.'}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0" role="img" aria-label={`${currentScore} critères sur 8, seuil à 3`}>
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className={`w-4 h-2 rounded-sm ${i < currentScore ? (isValidated ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-neutral-200'} ${
                i === QUALITATIVE_THRESHOLD ? 'ml-1.5' : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* Mesures soumises ou exemptées */}
      <details className="group bg-white border border-neutral-200 rounded-md">
        <summary className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-medium text-neutral-800 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
          Mesures soumises ou exemptées de l’évaluation qualitative
          <ChevronDown className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 px-4 py-3 border-t border-neutral-200 text-xs">
          <div className="space-y-1.5">
            <p className="font-semibold text-neutral-900">Non soumises : Annexe 1, U Pattu Risilienza è Territorii</p>
            <ul className="text-neutral-700 space-y-0.5 pl-4 list-disc">
              <li><strong>Risilienza (PRT-01)</strong> : soutien trésorerie et adaptation aux chocs des TPE</li>
              <li><strong>Impresi Paisani (PRT-04)</strong> : commerces et services ruraux, tournées</li>
              <li><strong>Rinascita (PRT-02)</strong> : sinistres majeurs et catastrophes naturelles</li>
              <li><strong>Ribumbà (PRT-03)</strong> : rebond d’entreprises fragilisées</li>
            </ul>
            <p className="text-[11px] text-neutral-500">Instruction financière directe, sans seuil de 3 « OUI ».</p>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-neutral-900">Soumises : Guide 2026 (seuil de 3 « OUI » sur 8)</p>
            <ul className="text-neutral-700 space-y-0.5 pl-4 list-disc">
              <li><strong>Impresa Sì</strong> : création, développement, structurant, reprise</li>
              <li><strong>RIESCE</strong> : emploi durable et démarche RSE</li>
              <li><strong>U Pattu Innuvazione</strong> : amorçage, développement, R&D</li>
              <li><strong>Sviluppu Suciale</strong> : économie sociale et solidaire (ESS)</li>
              <li><strong>U Pattu Impresamondu</strong> : prospection et stage export</li>
            </ul>
            <p className="text-[11px] text-neutral-500">Condition suspensive préalable à l’instruction.</p>
          </div>
        </div>
      </details>

      {/* Grille des 8 critères officiels */}
      <Panel
        headingLevel={3}
        title="Grille des 8 critères (page 28 du Guide)"
        description="Cocher les critères remplis par le projet."
        bodyClassName=""
      >
        <ul className="divide-y divide-neutral-100">
          {QUALITATIVE_EVALUATION_QUESTIONS.map((q, idx) => {
            const key = q.id as keyof QualitativeAnswers;
            const isChecked = Boolean(data[key]);
            return (
              <li key={q.id}>
                <label className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50/40' : 'hover:bg-neutral-50'}`}>
                  <input type="checkbox" checked={isChecked} onChange={() => handleToggle(key)} className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="flex-1 min-w-0 space-y-0.5">
                    <span className="block text-sm font-medium text-neutral-900">
                      <span className="text-neutral-400 font-normal tabular-nums">{idx + 1}.</span> {q.title}
                    </span>
                    <span className="block text-xs text-neutral-700 leading-relaxed">{q.label}</span>
                    <span className="block text-[11px] text-neutral-500">{q.clarification}</span>
                    {justifications[key] && (
                      <span className="block text-[11px] text-neutral-700 bg-neutral-50 border-l-2 border-prune-300 px-2.5 py-1.5 mt-1.5">
                        <strong className="font-medium">D’après la fiche projet :</strong> « {justifications[key]} »
                      </span>
                    )}
                  </span>
                  <span className={`text-xs font-medium shrink-0 ${isChecked ? 'text-emerald-700' : 'text-neutral-400'}`}>{isChecked ? 'Oui' : 'Non'}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
};
