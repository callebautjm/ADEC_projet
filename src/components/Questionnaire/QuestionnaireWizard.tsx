/**
 * Parcours du simulateur, calqué sur la fiche projet ADEC :
 * 0. Synthèse (si fiche déposée) · 1. Entreprise · 2. Santé financière & conformité
 * 3. Projet & dépenses · 4. Critères qualitatifs · 5. Proposition de mesures
 */

import React, { useState } from 'react';
import { FullQuestionnaireState } from '../../types';
import { AnalyseFicheProjetResponse } from '../../types/ficheProjet';
import { StepSynthese } from './StepSynthese';
import { StepCompany } from './StepCompany';
import { StepFinances } from './StepFinances';
import { StepProjet } from './StepProjet';
import { StepQualitative } from './StepQualitative';
import { StepProposition } from './StepProposition';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Building2, Landmark, Target, Award, Scale } from 'lucide-react';
import { determineCompanySize } from '../../services/engine';
import { ProjectSheetPreloader } from '../Dossier/ProjectSheetPreloader';
import { applyCompanyUpdate } from '../../utils/dossierSynchronizer';

interface QuestionnaireWizardProps {
  state: FullQuestionnaireState;
  setState: React.Dispatch<React.SetStateAction<FullQuestionnaireState>>;
  dossier: AnalyseFicheProjetResponse | null;
  onFicheAnalysee: (analyse: AnalyseFicheProjetResponse) => void;
  onRemoveDossier: () => void;
}

const ALL_STEPS = [
  { id: 0, label: 'Synthèse du projet', icon: FileText },
  { id: 1, label: 'Entreprise', icon: Building2 },
  { id: 2, label: 'Santé financière & conformité', icon: Landmark },
  { id: 3, label: 'Projet & dépenses', icon: Target },
  { id: 4, label: 'Critères qualitatifs', icon: Award },
  { id: 5, label: 'Proposition de mesures', icon: Scale }
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
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <ProjectSheetPreloader dossier={dossier} onFicheAnalysee={onFicheAnalysee} onRemoveDossier={onRemoveDossier} />

      {/* Étapes */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => goTo(step.id)}
                className="flex flex-col sm:flex-row items-center gap-2 group focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-prune-600 text-white ring-4 ring-prune-100'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-100 text-neutral-500 group-hover:bg-prune-50 group-hover:text-prune-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="text-left hidden md:block">
                  <span className={`text-[10px] block uppercase font-bold tracking-wider ${isCurrent ? 'text-prune-600' : isCompleted ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    Étape {step.id}
                  </span>
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-prune-900 font-bold' : isCompleted ? 'text-neutral-800' : 'text-neutral-500'}`}>
                    {step.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="w-full bg-neutral-100 h-1 overflow-hidden mt-4">
          <div
            className="bg-prune-600 h-full transition-all duration-300"
            style={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-xs">
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

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goTo(steps[stepIndex - 1].id)}
            disabled={stepIndex === 0}
            className={`px-5 py-2.5 rounded-full border-2 text-xs font-bold tracking-wide flex items-center gap-2 transition ${
              stepIndex === 0
                ? 'opacity-40 cursor-not-allowed text-neutral-400 border-neutral-200'
                : 'text-neutral-700 border-neutral-300 hover:border-prune-600 hover:text-prune-700 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Étape précédente
          </button>

          {currentStep < LAST_STEP && (
            <button
              type="button"
              onClick={() => goTo(steps[stepIndex + 1].id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold tracking-wide transition flex items-center gap-2 shadow-sm cursor-pointer ${
                currentStep === LAST_STEP - 1
                  ? 'bg-safran-300 hover:bg-safran-200 text-neutral-900'
                  : 'bg-prune-600 hover:bg-aubergine-600 text-white'
              }`}
            >
              <span>{currentStep === LAST_STEP - 1 ? 'Calculer la proposition de mesures' : `Continuer : ${steps[stepIndex + 1].label}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
