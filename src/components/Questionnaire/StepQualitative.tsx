/**
 * Step 4 : Évaluation Qualitative des Projets (Délibération N° 21/177 AC)
 * Collectivité de Corse / Assemblée de Corse / ADEC
 */

import React, { useState } from 'react';
import { QualitativeAnswers, NeedCategory } from '../../types';
import { QUALITATIVE_EVALUATION_QUESTIONS } from '../../data/adecOfficialData';
import { Award, CheckCircle2, XCircle, Info, Sparkles, ShieldCheck, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { computeQualitativeScore } from '../../services/engine';
import { useDatabases } from '../../context/DatabaseContext';

interface StepQualitativeProps {
  data: QualitativeAnswers;
  selectedNeeds?: (NeedCategory | string)[];
  onChange: (updated: Partial<QualitativeAnswers>) => void;
}

const RISILIENZA_NEEDS: NeedCategory[] = [
  'RESTRUCTURATION_REBOND',
  'RESILIENCE_CHOC',
  'SINISTRE_CATASTROPHE',
  'RURALITE_PROXIMITE'
];

export const StepQualitative: React.FC<StepQualitativeProps> = ({ data, selectedNeeds = [], onChange }) => {
  const { allActiveSchemes } = useDatabases();
  const [showRegimeDetails, setShowRegimeDetails] = useState(false);
  const currentScore = computeQualitativeScore(data);
  const isValidated = currentScore >= 3;

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

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-slate-700" />
            4. Évaluation Qualitative Préalable (Délibération N° 21/177 AC)
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Assemblée de Corse – 28 octobre 2021
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Cette grille réglementaire évalue l’adéquation de votre projet aux objectifs stratégiques du PADDUC et du SRDE2I au service du modèle de développement insulaire.
        </p>
      </div>

      {/* Bannière d'exclusion formelle : U PATTU RISILIENZA È TERRITORII */}
      {isExclusivelyRisilienza ? (
        <div className="p-4 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-emerald-950">
                  Mesures ciblées non soumises à l'évaluation qualitative
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white shadow-2xs">
                  U Pattu Risilienza è Territorii (Annexe 1)
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Vos besoins sélectionnés portent <strong>exclusivement</strong> sur le dispositif <strong>U PATTU RISILIENZA È TERRITORII</strong> (Risilienza, Impresi Paisani, Rinascita ou Ribumbà). Conformément à la délibération 21/177 AC, <strong>ces mesures d’urgence, de proximité et de rebond ne relèvent pas de l'évaluation qualitative préalable</strong>. Le seuil réglementaire de 3 « OUI » ne s'applique pas à votre demande d'aide.
              </p>
              <p className="text-[11px] text-emerald-800 italic pt-1">
                Vous pouvez renseigner cette grille à titre indicatif ou la conserver en l'état sans aucun impact sur l'éligibilité de votre dossier.
              </p>
            </div>
          </div>
        </div>
      ) : hasRisilienzaNeeds && hasGuideNeeds ? (
        <div className="p-4 rounded-xl border border-blue-300 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100/60 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5 shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-blue-950">
                  Règle spécifique : certaines mesures sélectionnées ne relèvent pas de cette grille
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white shadow-2xs">
                  Régime mixte
                </span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                Votre sélection combine des mesures de l'Annexe 1 (<strong className="text-blue-950">U PATTU RISILIENZA È TERRITORII</strong> : Risilienza, Impresi Paisani, Rinascita, Ribumbà) qui sont <strong>dispensées de seuil qualitatif</strong>, et des mesures du Guide 2026 (Impresa Sì, RIESCE, Innuvazione...) qui requièrent <strong>au moins 3 « OUI »</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bannière de Score et Règle d'éligibilité - Colorée et claire */}
      <div
        className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
          isValidated
            ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-100/70 border-emerald-300 text-emerald-950'
            : isExclusivelyRisilienza
            ? 'bg-gradient-to-r from-emerald-50/50 via-teal-50/40 to-slate-50 border-emerald-200 text-emerald-900'
            : 'bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-100/70 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-3">
          {isValidated ? (
            <div className="p-1 rounded-full bg-emerald-600 text-white mt-0.5 shrink-0 shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : isExclusivelyRisilienza ? (
            <div className="p-1 rounded-full bg-emerald-600 text-white mt-0.5 shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1 rounded-full bg-amber-600 text-white mt-0.5 shrink-0 shadow-xs">
              <Info className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm">
                Score d’adéquation qualitative : {currentScore} / 8 critères validés
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs ${
                  isValidated
                    ? 'bg-emerald-600 text-white'
                    : isExclusivelyRisilienza
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {isValidated
                  ? 'Seuil réglementaire atteint (≥ 3)'
                  : isExclusivelyRisilienza
                  ? 'Dispense accordée (U Pattu Risilienza)'
                  : 'Seuil non atteint (< 3)'}
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed opacity-95">
              {isValidated ? (
                <>
                  Votre projet remplit le critère formel d’au moins 3 réponses favorables fixé par la délibération 21/177 AC pour accéder aux dispositifs d'accompagnement du Guide de l'ADEC (Impresa Sì, RIESCE, Innuvazione, Sviluppu Suciale, Impresamondu).
                </>
              ) : isExclusivelyRisilienza ? (
                <>
                  Vos mesures (U Pattu Risilienza è Territorii) sont <strong>exemptées de ce seuil</strong>. Vous pouvez poursuivre sans condition suspensive.
                </>
              ) : (
                <>
                  Règle officielle (page 29 du Guide) : <strong>Au moins 3 critères favorables</strong> sont nécessaires pour prétendre aux aides du Guide 2026. <em>Les aides d’urgence ou de résilience de l’Annexe 1 (U Pattu Risilienza è Territorii) ne relèvent pas de cette obligation.</em>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-center px-4 py-2 bg-white/90 backdrop-blur rounded-xl border border-emerald-200/80 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
            Score
          </span>
          <span className="text-xl font-black font-mono text-emerald-800">
            {currentScore} <span className="text-xs font-normal text-slate-400">/ 8</span>
          </span>
        </div>
      </div>

      {/* Accordéon explicatif des 2 régimes ADEC */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRegimeDetails(!showRegimeDetails)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/80 transition"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800">
              Quelles sont les mesures soumises ou exemptées de l'évaluation qualitative ?
            </span>
          </div>
          {showRegimeDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showRegimeDetails && (
          <div className="p-4 pt-0 border-t border-slate-200/80 space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
              {/* Colonne 1 : Non soumises */}
              <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Mesures NON SOUMISES (Annexe 1)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Le dispositif <strong>U PATTU RISILIENZA È TERRITORII</strong> est dispensé d'évaluation qualitative préalable :
                </p>
                <ul className="text-[11px] text-slate-700 space-y-1 pl-4 list-disc">
                  <li><strong>Risilienza (PRT-01)</strong> : Soutien trésorerie & adaptation chocs TPE</li>
                  <li><strong>Impresi Paisani (PRT-04)</strong> : Commerces et services ruraux & tournées</li>
                  <li><strong>Rinascita (PRT-02)</strong> : Sinistres majeurs et catastrophes naturelles</li>
                  <li><strong>Ribumbà (PRT-03)</strong> : Rebond d'entreprises fragilisées</li>
                </ul>
                <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
                  → Instruction financière directe sans seuil de 3 « OUI ».
                </div>
              </div>

              {/* Colonne 2 : Soumises */}
              <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Mesures SOUMISES (Guide 2026)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Délibération 21/177 AC du 28 octobre 2021 : <strong>seuil minimal de 3 « OUI » sur 8 obligatoire</strong> :
                </p>
                <ul className="text-[11px] text-slate-700 space-y-1 pl-4 list-disc">
                  <li><strong>Impresa Sì</strong> : Création, Développement, Structurant, Reprise</li>
                  <li><strong>RIESCE</strong> : Emploi durable & démarche RSE</li>
                  <li><strong>U Pattu Innuvazione</strong> : Amorçage, Développement R&D</li>
                  <li><strong>Sviluppu Suciale</strong> : Économie Sociale et Solidaire (ESS)</li>
                  <li><strong>U Pattu Impresamondu</strong> : Prospection & Stage Export</li>
                </ul>
                <div className="text-[10px] text-blue-800 bg-blue-50 p-2 rounded border border-blue-200 font-medium">
                  → Condition suspensive obligatoire préalable à l'instruction.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grille des 8 critères officiels */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Grille d'évaluation des 8 critères qualitatifs (Page 28 du Guide ADEC)
        </label>

        <div className="space-y-2.5">
          {QUALITATIVE_EVALUATION_QUESTIONS.map((q, idx) => {
            const isChecked = Boolean(data[q.id as keyof QualitativeAnswers]);
            return (
              <div
                key={q.id}
                onClick={() => handleToggle(q.id as keyof QualitativeAnswers)}
                className={`p-3.5 border rounded-xl cursor-pointer transition flex items-start justify-between gap-4 ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${isChecked ? 'text-emerald-700' : 'text-slate-500'}`}>
                      Critère {idx + 1}
                    </span>
                    <span className="text-slate-300">·</span>
                    <h3 className={`text-sm font-bold ${isChecked ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {q.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {q.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 italic">
                    {q.clarification}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded transition shadow-2xs ${
                      isChecked
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isChecked ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
