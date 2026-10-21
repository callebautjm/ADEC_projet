/**
 * Application Principale : Diagnostic & Optimisation des Aides ADEC 2026
 * Collectivité de Corse / Agence de Développement Économique de la Corse
 */

import React, { useEffect, useState } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { Header } from './components/Header';
import { QuestionnaireWizard } from './components/Questionnaire/QuestionnaireWizard';
import { DocumentaryExplorerView } from './components/DocumentaryExplorer/DocumentaryExplorerView';
import { DatabaseManagerView } from './components/DatabaseManager/DatabaseManagerView';
import { HomePage } from './components/Home/HomePage';
import { AttestationsPage } from './components/Attestations/AttestationsPage';
import { ProjectSheetPreloader } from './components/Dossier/ProjectSheetPreloader';
import { CompanyProfile, FullQuestionnaireState } from './types';
import { AnalyseFicheProjetResponse } from './types/ficheProjet';
import { AppPage, APP_PAGES } from './types/navigation';
import { synchronizeQuestionnaireFromFiche, applyCompanyUpdate } from './utils/dossierSynchronizer';
import { fetchEntrepriseBySiret } from './services/apiEntreprise';
import { ApiEntrepriseModal } from './components/ApiEntrepriseModal';
import { SalvezzaCommunesModal } from './components/Salvezza/SalvezzaCommunesModal';

/** Simulateur vierge : rempli par la recherche SIRET (étape 1) ou par le dépôt d'une fiche projet */
const EMPTY_QUESTIONNAIRE_STATE: FullQuestionnaireState = {
  company: {
    name: '',
    siret: '',
    legalForm: 'SARL_EURL',
    size: 'TPE',
    headcount: 0,
    annualRevenue: 0,
    balanceSheetTotal: 0,
    locationType: 'POLE_RURAL_STRUCTURANT',
    sector: 'SERVICES',
    creationDateSource: 'unknown',
    isEstablishedInCorsica: true,
    hasMainExploitationInCorsica: true,
    isSeasonalActivity: false,
    isFranchiseOrAffiliate: false,
    isUnderFiveYears: false,
    hasDistributedProfits: false,
    isFromMergerOrConcentration: false,
    registeredSinceAtLeast12Months: true,
    mandataires: []
  },
  regulatory: {
    isUpToDateTaxSocial: false,
    hasValidDebtRepaymentPlan: false,
    isInInsolvencyOrBankruptcy: false,
    isCompanyInDifficultyEU: false,
    hasPriorAdecUnfulfilledObligations: false,
    hasAdecPriorBreachOfContract: false,
    hasPendingPublicRecoveryOrder: false,
    hasBenefitedRescueAidPast10Years: false,
    hasExecutiveFraudHistory: false,
    hasOutgoingDividendsDuringDistress: false,
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
  },
  projet: { depenses: [] }
};

/** Page courante lue dans l'URL (#/attestations…), accueil par défaut */
function readPageFromHash(): AppPage {
  const page = window.location.hash.replace(/^#\/?/, '') as AppPage;
  return APP_PAGES.includes(page) ? page : 'accueil';
}

const MainAppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<AppPage>(readPageFromHash);
  const [dossier, setDossier] = useState<AnalyseFicheProjetResponse | null>(null);
  const [questionnaireState, setQuestionnaireState] = useState<FullQuestionnaireState>(EMPTY_QUESTIONNAIRE_STATE);
  const [isManualSimulation, setIsManualSimulation] = useState(false);
  const [attestationsCompany, setAttestationsCompany] = useState<CompanyProfile | null>(null);
  const [wizardKey, setWizardKey] = useState(0);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isSalvezzaModalOpen, setIsSalvezzaModalOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      setActivePage(readPageFromHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (page: AppPage) => {
    window.location.hash = page === 'accueil' ? '' : `/${page}`;
  };

  const handleFicheAnalysee = async (analyse: AnalyseFicheProjetResponse) => {
    setDossier(analyse);
    const syncedState = synchronizeQuestionnaireFromFiche(analyse, questionnaireState);
    setQuestionnaireState(syncedState);
    setWizardKey((k) => k + 1); // repart de l'étape 0 (synthèse)
    navigate('simulation');

    // Les données des registres officiels (recherche SIRET) priment sur celles de la fiche pour l'identité
    const siret = (syncedState.company.siret || '').replace(/\D/g, '');
    if (siret.length !== 14) return;
    const result = await fetchEntrepriseBySiret(siret);
    if (result.success && result.mappedProfile) {
      // Un champ absent des registres ne doit pas effacer la valeur lue dans la fiche
      const registryProfile = Object.fromEntries(
        Object.entries(result.mappedProfile).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );
      setQuestionnaireState((prev) => applyCompanyUpdate(prev, registryProfile));
    } else {
      console.warn(`[Fiche projet] Resynchronisation registres impossible pour ${siret} : ${result.error}`);
    }
  };

  const handleResetQuestionnaire = () => {
    setDossier(null);
    setIsManualSimulation(false);
    setQuestionnaireState(EMPTY_QUESTIONNAIRE_STATE);
    setWizardKey((k) => k + 1);
    navigate('simulation');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Header
        activePage={activePage}
        onNavigate={navigate}
        onResetQuestionnaire={activePage === 'simulation' ? handleResetQuestionnaire : undefined}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
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
        {activePage === 'accueil' && <HomePage onNavigate={navigate} />}

        {activePage === 'attestations' && (
          <AttestationsPage
            company={attestationsCompany}
            onCompanyFound={(profile) => setAttestationsCompany({ ...EMPTY_QUESTIONNAIRE_STATE.company, ...profile })}
          />
        )}

        {activePage === 'guide' && <DocumentaryExplorerView />}

        {activePage === 'simulation' && (
          <div className="space-y-6">
            {/* Context Banner : sobre, institutionnel et aéré */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border-b border-blue-900/60 shadow-xs">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Simulation à partir de la fiche projet
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-3xl leading-relaxed">
                  Déposez le PDF de la fiche projet ADEC : le simulateur est pré-rempli, vérifie les critères d'accès et calcule la proposition de mesures.
                </p>
              </div>
            </div>

            {dossier || isManualSimulation ? (
              <QuestionnaireWizard
                key={wizardKey}
                state={questionnaireState}
                setState={setQuestionnaireState}
                dossier={dossier}
                onFicheAnalysee={handleFicheAnalysee}
                onRemoveDossier={handleResetQuestionnaire}
              />
            ) : (
              <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3">
                <ProjectSheetPreloader dossier={null} onFicheAnalysee={handleFicheAnalysee} onRemoveDossier={handleResetQuestionnaire} />
                <p className="text-xs text-slate-500 text-center">
                  Pas de fiche projet ?{' '}
                  <button
                    type="button"
                    onClick={() => setIsManualSimulation(true)}
                    className="font-semibold text-blue-700 underline hover:text-blue-900 cursor-pointer"
                  >
                    Saisir la simulation manuellement
                  </button>
                </p>
              </div>
            )}
          </div>
        )}

        {activePage === 'textes' && <DatabaseManagerView />}
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
