/**
 * Application Principale : Diagnostic & Optimisation des Aides ADEC 2026
 * Collectivité de Corse / Agence de Développement Économique de la Corse
 */

import React, { useState } from 'react';
import { DatabaseProvider, useDatabases } from './context/DatabaseContext';
import { Header } from './components/Header';
import { QuestionnaireWizard } from './components/Questionnaire/QuestionnaireWizard';
import { ResultsView } from './components/Results/ResultsView';
import { DocumentaryExplorerView } from './components/DocumentaryExplorer/DocumentaryExplorerView';
import { DatabaseManagerView } from './components/DatabaseManager/DatabaseManagerView';
import { FullQuestionnaireState, ComprehensiveEvaluationReport } from './types';
import { evaluateCompanyEligibility } from './services/engine';
import { ShieldCheck, ArrowRight, BookOpen, Sparkles, Building2, CheckCircle2, Mountain } from 'lucide-react';
import { ApiEntrepriseModal } from './components/ApiEntrepriseModal';
import { SalvezzaCommunesModal } from './components/Salvezza/SalvezzaCommunesModal';

const INITIAL_QUESTIONNAIRE_STATE: FullQuestionnaireState = {
  company: {
    name: 'Atelier Insulaire de Transformation',
    siret: '84920194800018',
    creationDate: undefined,
    creationDateSource: 'unknown',
    creationYear: undefined,
    companyAgeLabel: 'Ancienneté indéterminée (date non renseignée)',
    companyAgeMonths: undefined,
    legalForm: 'SARL_EURL',
    headcount: 6,
    annualRevenue: 480000,
    balanceSheetTotal: 320000,
    size: 'TPE',
    isEstablishedInCorsica: true,
    hasMainExploitationInCorsica: true,
    locationType: 'POLE_RURAL_STRUCTURANT',
    postalCode: '20250',
    city: 'Corte',
    communeName: 'Corte',
    communeCode: '2B096',
    salvezzaCommune: undefined,
    sector: 'ARTISANAT',
    isSeasonalActivity: false,
    isFranchiseOrAffiliate: false,
    isUnderFiveYears: true,
    hasDistributedProfits: false,
    isFromMergerOrConcentration: false,
    registeredSinceAtLeast12Months: true,
    mandataires: [
      { type: 'personne_physique', nom: 'PAOLI', prenom: 'Antone', fonction: 'Gérant', dateNaissance: '12/06/1984', nationalite: 'Française' },
      { type: 'personne_physique', nom: 'ALBERTI', prenom: 'Maria', fonction: 'Associée co-gérante', dateNaissance: '20/11/1988', nationalite: 'Française' }
    ],
    complianceData: {
      dgfip: {
        attestationFiscale: {
          status: 'ok',
          libelle: 'Attestation fiscale délivrée : entreprise à jour de ses obligations fiscales (TVA et IS)',
          documentUrl: 'https://entreprise.api.gouv.fr/files/attestation-fiscale-dgfip-exemple.pdf',
          dateDelivrance: '15/02/2026'
        },
        chiffresAffaires: [
          { chiffreAffaires: 480000, dateFinExercice: '2025-12-31', annee: '2025' },
          { chiffreAffaires: 420000, dateFinExercice: '2024-12-31', annee: '2024' },
          { chiffreAffaires: 350000, dateFinExercice: '2023-12-31', annee: '2023' }
        ],
        liassesFiscales: {
          year: '2024',
          totalBilan: 320000,
          resultatNet: 38500,
          regimeImposition: 'Régime réel normal d’imposition (IS)'
        }
      },
      urssaf: {
        attestationVigilance: {
          status: 'ok',
          libelle: 'Attestation de vigilance délivrée par l’URSSAF : à jour des cotisations sociales',
          documentUrl: 'https://entreprise.api.gouv.fr/files/attestation-vigilance-urssaf-exemple.pdf',
          dateDelivrance: '01/03/2026'
        }
      },
      infogreffe: {
        mandatairesSociaux: [
          { type: 'personne_physique', nom: 'PAOLI', prenom: 'Antone', fonction: 'Gérant', dateNaissance: '12/06/1984', nationalite: 'Française' },
          { type: 'personne_physique', nom: 'ALBERTI', prenom: 'Maria', fonction: 'Associée co-gérante', dateNaissance: '20/11/1988', nationalite: 'Française' }
        ]
      },
      insee: {
        nonDiffusible: false,
        accessLevel: 'Accès complet habilité (unités légales et établissements dont non diffusibles)'
      }
    }
  },
  regulatory: {
    isUpToDateTaxSocial: true,
    hasValidDebtRepaymentPlan: false,
    isInInsolvencyOrBankruptcy: false,
    isCompanyInDifficultyEU: false,
    hasPriorAdecUnfulfilledObligations: false,
    hasAdecPriorBreachOfContract: false,
    hasPendingPublicRecoveryOrder: false,
    hasBenefitedRescueAidPast10Years: false,
    hasExecutiveFraudHistory: false,
    hasOutgoingDividendsDuringDistress: false,
    deMinimisPast3Years: 25000
  },
  qualitative: {
    q1_nonDelocalisableValueAdded: true,
    q2_ecologicalEnergyDigitalTransition: true,
    q3_innovativeTechnologicalOrSocial: false,
    q4_ruralOrQpvZone: true,
    q5_strategicFiliereOrAdecAccompanied: false,
    q6_clusterThreeCompanies: false,
    q7_internationalizationCorsicaRadiance: false,
    q8_corsicanLanguageAndCulture: true
  },
  financials: {
    totalEstimatedBudgetHT: 75000,
    selectedNeedCategories: ['RESILIENCE_CHOC', 'INVESTISSEMENT_DEVELOPPEMENT', 'RURALITE_PROXIMITE'],
    projectDescription: 'Modernisation des outils de production, transition numérique et acquisition d’un utilitaire propre pour la tournée en territoire rural.',
    eligibleExpensesBreakdown: {
      cleanVehicles: {
        type: 'UTILITAIRE_LIGHT',
        costHT: 24000,
        scrappageOldVehicleProof: true
      }
    }
  }
};

const MainAppContent: React.FC = () => {
  const { allActiveSchemes } = useDatabases();
  const [activeTab, setActiveTab] = useState<'questionnaire' | 'results' | 'explorer' | 'database'>('questionnaire');
  const [questionnaireState, setQuestionnaireState] = useState<FullQuestionnaireState>(INITIAL_QUESTIONNAIRE_STATE);
  const [report, setReport] = useState<ComprehensiveEvaluationReport | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isSalvezzaModalOpen, setIsSalvezzaModalOpen] = useState(false);

  const handleRunEvaluation = () => {
    const calculatedReport = evaluateCompanyEligibility(questionnaireState, allActiveSchemes);
    setReport(calculatedReport);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetQuestionnaire = () => {
    setQuestionnaireState({
      ...INITIAL_QUESTIONNAIRE_STATE,
      company: {
        ...INITIAL_QUESTIONNAIRE_STATE.company,
        name: '',
        siret: '',
        annualRevenue: 0,
        headcount: 1,
        balanceSheetTotal: 0
      },
      regulatory: {
        ...INITIAL_QUESTIONNAIRE_STATE.regulatory,
        deMinimisPast3Years: 0
      },
      qualitative: {
        q1_nonDelocalisableValueAdded: false,
        q2_ecologicalEnergyDigitalTransition: false,
        q3_innovativeTechnologicalOrSocial: false,
        q4_ruralOrQpvZone: false,
        q5_strategicFiliereOrAdecAccompanied: false,
        q6_clusterThreeCompanies: false,
        q7_internationalizationCorsicaRadiance: false,
        q8_corsicanLanguageAndCulture: false
      },
      financials: {
        totalEstimatedBudgetHT: 0,
        selectedNeedCategories: [],
        projectDescription: ''
      }
    });
    setReport(null);
    setActiveTab('questionnaire');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetQuestionnaire={handleResetQuestionnaire}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        onOpenSalvezzaModal={() => setIsSalvezzaModalOpen(true)}
        hasResults={report !== null}
      />

      <ApiEntrepriseModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
      />

      <SalvezzaCommunesModal
        isOpen={isSalvezzaModalOpen}
        onClose={() => setIsSalvezzaModalOpen(false)}
        selectedCommuneCode={questionnaireState.company.communeCode || questionnaireState.company.salvezzaCommune?.codeCommune}
        onSelectCommune={(commune) => {
          setQuestionnaireState((prev) => ({
            ...prev,
            company: {
              ...prev.company,
              city: commune.nom,
              communeName: commune.nom,
              communeCode: commune.codeCommune,
              salvezzaCommune: commune,
              locationType: 'RURAL_SALVEZZA_UNDER_1000',
              isEstablishedInCorsica: true,
              hasMainExploitationInCorsica: true
            },
            qualitative: {
              ...prev.qualitative,
              q4_ruralOrQpvZone: true
            }
          }));
          setIsSalvezzaModalOpen(false);
        }}
      />

      <main className="flex-1">
        {activeTab === 'questionnaire' && (
          <div className="space-y-6">
            {/* Context Banner : sobre, institutionnel et aéré */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border-b border-blue-900/60 shadow-xs">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Collectivité de Corse · Agence de Développement Économique de la Corse</span>
                  <span className="text-blue-500">·</span>
                  <span className="text-emerald-400 font-medium">Guide officiel 2026</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Simulateur & Diagnostic d’Éligibilité aux Aides Régionales
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-3xl leading-relaxed">
                  Identifiez les dispositifs d'aide de l'ADEC applicables à votre entreprise (Impresa Sì, Risilienza, Rinascita, Ribumbà, Impresi Paisani, RIESCE, Innuvazione, Impresamondu), calculez vos subventions et vérifiez vos critères d'accès.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-blue-200/80">
                  <span className="flex items-center gap-1.5 text-white font-medium bg-blue-900/40 border border-blue-700/50 px-2.5 py-0.5 rounded-full text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Délibération 21/177 AC & Règl. UE 2023/2831
                  </span>
                  <span className="hidden sm:inline text-blue-500">·</span>
                  <span className="text-blue-200 text-[11px]">Plafond de minimis : <strong className="text-white">300 000 €</strong> / 3 ans</span>
                  <span className="hidden sm:inline text-blue-500">·</span>
                  <span className="text-blue-200 text-[11px]">Instruction confidentielle sans engagement</span>
                </div>
              </div>
            </div>

            <QuestionnaireWizard
              state={questionnaireState}
              setState={setQuestionnaireState}
              onSubmitEvaluation={handleRunEvaluation}
            />
          </div>
        )}

        {activeTab === 'results' && report && (
          <ResultsView
            report={report}
            company={questionnaireState.company}
            onModifyQuestionnaire={() => {
              setActiveTab('questionnaire');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'explorer' && <DocumentaryExplorerView />}

        {activeTab === 'database' && <DatabaseManagerView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">ADEC Corse Aides 2026</span>
            <span>·</span>
            <span>Outil d’aide à la décision conforme aux délibérations territoriales</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://www.adec.corsica"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Portail Officiel ADEC
            </a>
            <span>·</span>
            <span>Moteur d’analyse documentaire extensible</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <DatabaseProvider>
      <MainAppContent />
    </DatabaseProvider>
  );
}

export default App;
