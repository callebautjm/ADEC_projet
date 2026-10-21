/**
 * Outils d'instruction des aides ADEC 2026, à l'usage des agents
 * Collectivité de Corse / Agence de Développement Économique de la Corse
 */

import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { DatabaseProvider, useDatabases } from './context/DatabaseContext';
import { QuestionnaireWizard } from './components/Questionnaire/QuestionnaireWizard';
import { DocumentaryExplorerView } from './components/DocumentaryExplorer/DocumentaryExplorerView';
import { DatabaseManagerView } from './components/DatabaseManager/DatabaseManagerView';
import { HomePage } from './components/Home/HomePage';
import { AttestationsPage } from './components/Attestations/AttestationsPage';
import { ProjectSheetPreloader } from './components/Dossier/ProjectSheetPreloader';
import { AppNav } from './components/Layout/AppNav';
import { PageHeader } from './components/Layout/PageHeader';
import { Panel, btn, linkClass, pageContainer } from './components/Layout/ui';
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

/** Titre de l'onglet du navigateur pour chaque page */
const PAGE_TITLES: Record<AppPage, string> = {
  accueil: 'Accueil',
  attestations: 'Attestations',
  guide: 'Guide des aides',
  simulation: 'Simulation',
  textes: 'Textes officiels'
};

const MainAppContent: React.FC = () => {
  const { allActiveSchemes } = useDatabases();
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

  useEffect(() => {
    document.title = `${PAGE_TITLES[activePage]} · Outils ADEC`;
  }, [activePage]);

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

  const handleStartManualSimulation = () => {
    setIsManualSimulation(true);
    navigate('simulation');
  };

  const isSimulationStarted = Boolean(dossier) || isManualSimulation;
  const ongoingSimulation = dossier
    ? dossier.fiche.entreprise.raisonSociale || 'fiche projet'
    : isManualSimulation
      ? questionnaireState.company.name || 'saisie manuelle'
      : undefined;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans lg:flex">
      <AppNav
        activePage={activePage}
        onNavigate={navigate}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        schemesCount={allActiveSchemes.length}
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

      <main className="flex-1 min-w-0">
        {activePage === 'accueil' && (
          <HomePage
            onNavigate={navigate}
            onCompanyFound={(profile) => setAttestationsCompany({ ...EMPTY_QUESTIONNAIRE_STATE.company, ...profile })}
            onFicheAnalysee={handleFicheAnalysee}
            onStartManualSimulation={handleStartManualSimulation}
            onOpenTokenModal={() => setIsTokenModalOpen(true)}
            lastCompany={attestationsCompany}
            ongoingSimulation={ongoingSimulation}
          />
        )}

        {activePage === 'attestations' && (
          <AttestationsPage
            company={attestationsCompany}
            onCompanyFound={(profile) => setAttestationsCompany({ ...EMPTY_QUESTIONNAIRE_STATE.company, ...profile })}
          />
        )}

        {activePage === 'guide' && <DocumentaryExplorerView />}

        {activePage === 'simulation' && (
          <div>
            <PageHeader
              title="Simulation"
              description="Pré-remplissage à partir de la fiche projet (PDF OpenSub), contrôle des critères d’accès et proposition de mesures."
              actions={
                isSimulationStarted && (
                  <button type="button" onClick={handleResetQuestionnaire} className={btn('secondary')} title="Abandonner la simulation en cours et repartir de zéro">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Nouvelle simulation
                  </button>
                )
              }
            />

            {isSimulationStarted ? (
              <QuestionnaireWizard
                key={wizardKey}
                state={questionnaireState}
                setState={setQuestionnaireState}
                dossier={dossier}
                onFicheAnalysee={handleFicheAnalysee}
                onRemoveDossier={handleResetQuestionnaire}
              />
            ) : (
              <div className={`${pageContainer} py-5`}>
                <Panel
                  title="Fiche projet"
                  description="Les rubriques de la fiche pré-remplissent les étapes de la simulation ; une synthèse du projet et des contrôles de cohérence sont produits."
                >
                  <ProjectSheetPreloader dossier={null} onFicheAnalysee={handleFicheAnalysee} onRemoveDossier={handleResetQuestionnaire} />
                  <p className="text-xs text-neutral-500">
                    Pas de fiche projet ?{' '}
                    <button type="button" onClick={() => setIsManualSimulation(true)} className={linkClass}>
                      Saisir la simulation manuellement
                    </button>{' '}
                    (recherche SIRET à l’étape 1, sans synthèse du projet).
                  </p>
                </Panel>
              </div>
            )}
          </div>
        )}

        {activePage === 'textes' && <DatabaseManagerView />}
      </main>
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
