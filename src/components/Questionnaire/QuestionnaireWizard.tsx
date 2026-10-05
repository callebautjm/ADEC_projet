/**
 * Wizard Questionnaire Multi-Étapes
 * Collectivité de Corse / ADEC
 */

import React, { useState } from 'react';
import { FullQuestionnaireState, DossierProjectAnalysis } from '../../types';
import { StepCompany } from './StepCompany';
import { StepRegulatory } from './StepRegulatory';
import { StepProjectNeed } from './StepProjectNeed';
import { StepQualitative } from './StepQualitative';
import { StepBudgetSimulator } from './StepBudgetSimulator';
import { ArrowLeft, ArrowRight, CheckCircle2, Building2, ShieldAlert, Target, Award, Calculator, Sparkles } from 'lucide-react';
import { determineCompanySize } from '../../services/engine';
import { ProjectSheetPreloader } from '../Dossier/ProjectSheetPreloader';

interface QuestionnaireWizardProps {
  state: FullQuestionnaireState;
  setState: React.Dispatch<React.SetStateAction<FullQuestionnaireState>>;
  onSubmitEvaluation: () => void;
  activeDossier?: DossierProjectAnalysis | null;
  onAnalysisComplete?: (analysis: DossierProjectAnalysis) => void;
  onRemoveDossier?: () => void;
  apiToken?: string;
  recipientSiret?: string;
}

const STEPS = [
  { id: 1, label: 'Entreprise & Statut', icon: Building2 },
  { id: 2, label: 'Conformité & De Minimis', icon: ShieldAlert },
  { id: 3, label: 'Typologie du Projet', icon: Target },
  { id: 4, label: 'Évaluation Qualitative', icon: Award },
  { id: 5, label: 'Budget & Simulation', icon: Calculator }
];

export const QuestionnaireWizard: React.FC<QuestionnaireWizardProps> = ({
  state,
  setState,
  onSubmitEvaluation,
  activeDossier = null,
  onAnalysisComplete = () => {},
  onRemoveDossier = () => {},
  apiToken,
  recipientSiret
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onSubmitEvaluation();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculatedSize = determineCompanySize(
    state.company.headcount,
    state.company.annualRevenue,
    state.company.balanceSheetTotal
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Accélérateur Fiche Projet ADEC (Optionnel : préremplit le simulateur en 1 clic) */}
      <ProjectSheetPreloader
        questionnaireState={state}
        activeDossier={activeDossier}
        onAnalysisComplete={onAnalysisComplete}
        onRemoveDossier={onRemoveDossier}
        onRunImmediateEvaluation={onSubmitEvaluation}
        apiToken={apiToken}
        recipientSiret={recipientSiret}
      />

      {/* Stepper Header - Navigation moderne et colorée par étapes */}
      <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between relative">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className="flex flex-col sm:flex-row items-center gap-2.5 group relative z-10 focus:outline-none"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition shadow-xs ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span>{step.id}</span>}
                </div>
                <div className="text-left hidden sm:block">
                  <span className={`text-[10px] block uppercase font-bold tracking-wider ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    Étape {step.id}
                  </span>
                  <span
                    className={`text-xs font-semibold transition ${
                      isCurrent ? 'text-blue-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress track */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        {currentStep === 1 && (
          <StepCompany
            data={state.company}
            onChange={(updated) =>
              setState((prev) => {
                const newCompany = { ...prev.company, ...updated };
                let newRegulatory = prev.regulatory;
                let newQualitative = prev.qualitative;

                if (updated.complianceData) {
                  const dgfipOk = updated.complianceData.dgfip?.attestationFiscale?.status === 'ok';
                  const urssafOk = updated.complianceData.urssaf?.attestationVigilance?.status === 'ok';
                  if (dgfipOk && urssafOk) {
                    newRegulatory = { ...newRegulatory, isUpToDateTaxSocial: true };
                  }
                }

                if (updated.locationType !== undefined) {
                  const isRuralOrQpv =
                    updated.locationType === 'RURAL_SALVEZZA_UNDER_1000' ||
                    updated.locationType === 'POLE_RURAL_STRUCTURANT' ||
                    updated.locationType === 'QPV';
                  newQualitative = { ...newQualitative, q4_ruralOrQpvZone: isRuralOrQpv };
                }

                return { ...prev, company: newCompany, regulatory: newRegulatory, qualitative: newQualitative };
              })
            }
          />
        )}

        {currentStep === 2 && (
          <StepRegulatory
            data={state.regulatory}
            complianceData={state.company.complianceData}
            onChange={(updated) =>
              setState((prev) => {
                const newRegulatory = { ...prev.regulatory, ...updated };
                let newFinancials = { ...prev.financials };

                // Synchronisation intelligente avec les besoins de la page 3 :
                // 1. Entreprise en difficulté (Ribumbà) :
                if (updated.isCompanyInDifficultyEU !== undefined) {
                  const currentNeeds = newFinancials.selectedNeedCategories || [];
                  if (updated.isCompanyInDifficultyEU) {
                    // Si coché en page 2, sélectionner automatiquement le besoin RESTRUCTURATION_REBOND (Ribumbà)
                    if (!currentNeeds.includes('RESTRUCTURATION_REBOND')) {
                      newFinancials = {
                        ...newFinancials,
                        selectedNeedCategories: [...currentNeeds, 'RESTRUCTURATION_REBOND']
                      };
                    }
                  } else {
                    // Si décoché en page 2, retirer automatiquement RESTRUCTURATION_REBOND si présent
                    newFinancials = {
                      ...newFinancials,
                      selectedNeedCategories: currentNeeds.filter((n) => n !== 'RESTRUCTURATION_REBOND')
                    };
                  }
                }

                return { ...prev, regulatory: newRegulatory, financials: newFinancials };
              })
            }
          />
        )}

        {currentStep === 3 && (
          <StepProjectNeed
            data={state.financials}
            regulatory={state.regulatory}
            company={state.company}
            onChange={(updated) =>
              setState((prev) => ({ ...prev, financials: { ...prev.financials, ...updated } }))
            }
          />
        )}

        {currentStep === 4 && (
          <StepQualitative
            data={state.qualitative}
            selectedNeeds={state.financials.selectedNeedCategories}
            onChange={(updated) =>
              setState((prev) => ({ ...prev, qualitative: { ...prev.qualitative, ...updated } }))
            }
          />
        )}

        {currentStep === 5 && (
          <StepBudgetSimulator
            data={state.financials}
            companySize={calculatedSize}
            onChange={(updated) =>
              setState((prev) => ({ ...prev, financials: { ...prev.financials, ...updated } }))
            }
          />
        )}

        {/* Action Controls Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Étape précédente
          </button>

          <button
            type="button"
            onClick={handleNext}
            className={`px-6 py-2.5 rounded-lg text-xs font-semibold text-white transition flex items-center gap-2 shadow-sm ${
              currentStep === 5
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 ring-2 ring-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-500/20'
            }`}
          >
            {currentStep === 5 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Calculer l'éligibilité et afficher le diagnostic</span>
              </>
            ) : (
              <>
                <span>Continuer vers l'étape {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
