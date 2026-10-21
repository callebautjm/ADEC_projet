/**
 * Parcours du simulateur, calqué sur la fiche projet ADEC :
 * 0. Synthèse (si fiche déposée) · 1. Entreprise · 2. Santé financière & conformité
 * 3. Projet & dépenses · 4. Critères qualitatifs · 5. Proposition de mesures
 */

import React, { useEffect, useRef, useState } from 'react';
import { FullQuestionnaireState } from '../../types';
import { AnalyseFicheProjetResponse } from '../../types/ficheProjet';
import { StepSynthese } from './StepSynthese';
import { StepCompany } from './StepCompany';
import { StepFinances } from './StepFinances';
import { StepProjet } from './StepProjet';
import { StepQualitative } from './StepQualitative';
import { StepProposition } from './StepProposition';
import { ArrowLeft, ArrowRight, Check, FileText } from 'lucide-react';
import { determineCompanySize } from '../../services/engine';
import { ProjectSheetPreloader } from '../Dossier/ProjectSheetPreloader';
import { applyCompanyUpdate } from '../../utils/dossierSynchronizer';
import { btn, pageContainer } from '../Layout/ui';

interface QuestionnaireWizardProps {
  state: FullQuestionnaireState;
  setState: React.Dispatch<React.SetStateAction<FullQuestionnaireState>>;
  dossier: AnalyseFicheProjetResponse | null;
  onFicheAnalysee: (analyse: AnalyseFicheProjetResponse) => void;
  onRemoveDossier: () => void;
}

const ALL_STEPS = [
  { id: 0, label: 'Synthèse du projet' },
  { id: 1, label: 'Entreprise' },
  { id: 2, label: 'Santé financière & conformité' },
  { id: 3, label: 'Projet & dépenses' },
  { id: 4, label: 'Critères qualitatifs' },
  { id: 5, label: 'Proposition de mesures' }
];

const LAST_STEP = 5;

export const QuestionnaireWizard: React.FC<QuestionnaireWizardProps> = ({
  state,
  setState,
  dossier,
  onFicheAnalysee,
  onRemoveDossier
}) => {
  // La synthèse n'existe que si une fiche projet a été déposée
  const steps = dossier ? ALL_STEPS : ALL_STEPS.filter((s) => s.id !== 0);
  const firstStep = steps[0].id;
  const [currentStep, setCurrentStep] = useState<number>(firstStep);
  const stepsNavRef = useRef<HTMLElement>(null);

  // Sur petit écran, la barre d'étapes défile : garder l'étape courante visible
  useEffect(() => {
    const nav = stepsNavRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!nav || !active) return;
    const offset = active.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    if (offset < 0 || offset + active.offsetWidth > nav.clientWidth) nav.scrollLeft += offset - 8;
  }, [currentStep]);

  const goTo = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculatedSize = determineCompanySize(
    state.company.headcount,
    state.company.annualRevenue,
    state.company.balanceSheetTotal
  );
  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div>
      <div className={`${pageContainer} py-5 space-y-4`}>
        <ProjectSheetPreloader dossier={dossier} onFicheAnalysee={onFicheAnalysee} onRemoveDossier={onRemoveDossier} compact />

        {/* Étapes */}
        <nav ref={stepsNavRef} aria-label="Étapes de la simulation" className="bg-white border border-neutral-200 rounded-md overflow-x-auto">
          <ol className="flex min-w-max">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <li key={step.id} className={`flex-1 ${idx > 0 ? 'border-l border-neutral-200' : ''}`}>
                  <button
                    type="button"
                    onClick={() => goTo(step.id)}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`w-full h-full flex items-center gap-2 px-3 py-2 text-left text-xs border-b-2 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'border-prune-700 bg-prune-50/60 text-neutral-900 font-semibold'
                        : 'border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${
                        isCurrent ? 'bg-prune-700 text-white' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : step.id === 0 ? <FileText className="w-3 h-3" /> : step.id}
                    </span>
                    <span className="whitespace-nowrap">{step.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div>
          {currentStep === 0 && dossier && <StepSynthese dossier={dossier} />}

          {currentStep === 1 && (
            <StepCompany
              data={state.company}
              onChange={(updated) => setState((prev) => applyCompanyUpdate(prev, updated))}
            />
          )}

          {currentStep === 2 && (
            <StepFinances
              company={state.company}
              sante={state.santeFinanciere || {}}
              regulatory={state.regulatory}
              onCompanyChange={(updated) => setState((prev) => applyCompanyUpdate(prev, updated))}
              onSanteChange={(updated) => setState((prev) => ({ ...prev, santeFinanciere: { ...prev.santeFinanciere, ...updated } }))}
              onRegulatoryChange={(updated) =>
                setState((prev) => {
                  const newRegulatory = { ...prev.regulatory, ...updated };
                  let newFinancials = prev.financials;
                  // Entreprise en difficulté au sens UE ⇔ besoin « Rebond / restructuration » (Ribumbà)
                  if (updated.isCompanyInDifficultyEU !== undefined) {
                    const needs = prev.financials.selectedNeedCategories || [];
                    newFinancials = {
                      ...prev.financials,
                      selectedNeedCategories: updated.isCompanyInDifficultyEU
                        ? Array.from(new Set([...needs, 'RESTRUCTURATION_REBOND']))
                        : needs.filter((n) => n !== 'RESTRUCTURATION_REBOND')
                    };
                  }
                  return { ...prev, regulatory: newRegulatory, financials: newFinancials };
                })
              }
            />
          )}

          {currentStep === 3 && (
            <StepProjet
              projet={state.projet || { depenses: [] }}
              financials={state.financials}
              regulatory={state.regulatory}
              company={state.company}
              companySize={calculatedSize}
              onProjetChange={(updated) => setState((prev) => ({ ...prev, projet: { depenses: [], ...prev.projet, ...updated } }))}
              onFinancialsChange={(updated) => setState((prev) => ({ ...prev, financials: { ...prev.financials, ...updated } }))}
            />
          )}

          {currentStep === 4 && (
            <StepQualitative
              data={state.qualitative}
              selectedNeeds={state.financials.selectedNeedCategories}
              justifications={state.qualitativeJustifications}
              onChange={(updated) => setState((prev) => ({ ...prev, qualitative: { ...prev.qualitative, ...updated } }))}
            />
          )}

          {currentStep === 5 && (
            <StepProposition state={state} dossier={dossier} onModifyQuestionnaire={() => goTo(1)} />
          )}
        </div>
      </div>

      {/* Navigation entre étapes, toujours visible en bas de l'écran */}
      <div className="no-print sticky bottom-0 z-20 bg-white border-t border-neutral-200">
        <div className={`${pageContainer} py-2.5 flex items-center justify-between gap-3`}>
          <button
            type="button"
            onClick={() => goTo(steps[stepIndex - 1].id)}
            disabled={stepIndex === 0}
            className={btn('secondary')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Précédent
          </button>

          {/* Même numérotation que les titres d'étape (la synthèse, étape 0, précède l'étape 1) */}
          <span className="hidden sm:block text-xs text-neutral-500">
            {currentStep === 0 ? 'Synthèse du projet' : `Étape ${currentStep} sur ${LAST_STEP} · ${steps[stepIndex].label}`}
          </span>

          {currentStep < LAST_STEP ? (
            <button type="button" onClick={() => goTo(steps[stepIndex + 1].id)} className={btn('primary')}>
              {/* Libellé court sur mobile pour ne pas déborder de l'écran */}
              <span className="sm:hidden">{currentStep === LAST_STEP - 1 ? 'Calculer' : 'Suivant'}</span>
              <span className="hidden sm:inline">
                {currentStep === LAST_STEP - 1 ? 'Calculer la proposition de mesures' : `Suivant : ${steps[stepIndex + 1].label}`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="w-24" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
};
