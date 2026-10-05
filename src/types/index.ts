/**
 * Types & Data Models for the ADEC 2026 Support Schemes Portal
 * Cullettività di Corsica / Agence de Développement Économique de la Corse
 */

export type CompanySize = 'TPE' | 'PE' | 'PME' | 'GRANDE';

export type LegalForm = 
  | 'SARL_EURL' 
  | 'SAS_SASU' 
  | 'SA' 
  | 'COMMERCIANT_ARTISAN_EI' 
  | 'MICRO_ENTREPRISE' 
  | 'ASSOCIATION_ESS' 
  | 'SIAE' 
  | 'COOPERATIVE_SCOP_SCIC' 
  | 'SCI' 
  | 'PROFESSION_LIBERALE'
  | 'AUTRE';

export type ActivitySector =
  | 'INDUSTRIE'
  | 'COMMERCE'
  | 'ARTISANAT'
  | 'SERVICES'
  | 'ESS'
  | 'AGRICULTURE_PECHE_SYLVICULTURE'
  | 'HEBERGEMENT_TOURISTIQUE'
  | 'FINANCE_IMMOBILIER'
  | 'AUTRE';

export type NeedCategory =
  | 'CREATION_ENTREPRISE'
  | 'RESILIENCE_CHOC'
  | 'SINISTRE_CATASTROPHE'
  | 'RESTRUCTURATION_REBOND'
  | 'RURALITE_PROXIMITE'
  | 'EMPLOI_RSE'
  | 'INNOVATION_AMORCAGE'
  | 'INNOVATION_DEVELOPPEMENT'
  | 'INNOVATION_RD_STRUCTURANT'
  | 'INVESTISSEMENT_DEVELOPPEMENT'
  | 'INVESTISSEMENT_STRUCTURANT'
  | 'REPRISE_TRANSMISSION'
  | 'ESS_SOLIDARITE'
  | 'INTERNATIONAL_EXPORT'
  | (string & {});

export interface MandataireSocial {
  type?: 'personne_physique' | 'personne_morale' | string;
  nom?: string;
  prenom?: string;
  denomination?: string;
  fonction?: string;
  dateNaissance?: string;
  nationalite?: string;
  communeResidence?: string;
}

export interface RneAdresse {
  voie?: string;
  code_postal?: string;
  commune?: string;
  pays?: string;
  complement?: string | null;
}

/** Répartition d'une détention (en %), telle que renvoyée par l'API INPI */
export interface BeRepartition {
  detention?: boolean;
  total?: number;
  pleine_propriete?: number;
  nue_propriete?: number;
  usufruit?: number;
}

/** Modalités de contrôle d'un bénéficiaire effectif (schéma API Entreprise v3) */
export interface BeModalites {
  detention_de_capital?: {
    parts_totale?: number;
    parts_directes?: BeRepartition;
    parts_indirectes?: {
      detention?: boolean;
      par_indivision?: BeRepartition;
      via_personnes_morales?: BeRepartition;
    };
  };
  vocation_a_devenir_titulaire_de_parts?: {
    parts_directes?: BeRepartition;
    parts_indirectes?: {
      par_indivision?: BeRepartition;
      via_personnes_morales?: BeRepartition;
    };
  };
  droits_de_vote?: {
    total?: number;
    directes?: BeRepartition;
    indirectes?: {
      detention?: boolean;
      par_indivision?: BeRepartition;
      via_personnes_morales?: BeRepartition;
    };
  };
  pouvoirs_de_controle?: {
    decision_ag?: boolean;
    nommage_membres_conseil_administratif?: boolean;
    autres?: boolean;
  };
  representant_legal?: boolean;
  representant_legal_placement_sans_gestion_deleguee?: boolean;
}

export interface BeneficiaireEffectif {
  uuid?: string;
  nom?: string;
  nomUsage?: string | null;
  prenoms?: string[];
  dateNaissance?: { annee?: string; mois?: string };
  nationalite?: string;
  paysResidence?: string;
  modalites?: BeModalites;
}

export interface RneEtablissement {
  siret?: string;
  typeEtablissement?: string;
  statut?: 'actif' | 'fermé' | string;
  dateDebutActivite?: string;
  natureEtablissement?: string;
  activitePrincipale?: string;
  autreActivite?: string | null;
  adresse?: RneAdresse;
}

export interface RneObservation {
  id?: string;
  fournisseur?: string;
  numero?: string;
  date?: string;
  texte?: string;
  numObservation?: string;
  dateAjout?: string;
  description?: string;
  source?: string;
}

export interface ApiEntrepriseComplianceData {
  dgfip?: {
    attestationFiscale?: {
      status: 'ok' | 'refus_de_delivrance' | 'non_disponible' | 'erreur';
      libelle?: string;
      documentUrl?: string;
      expiresIn?: number;
      dateDelivrance?: string;
      message?: string;
    };
    chiffresAffaires?: Array<{
      chiffreAffaires: number;
      dateFinExercice: string;
      annee?: string;
    }>;
    liassesFiscales?: {
      year?: string;
      totalBilan?: number;
      resultatNet?: number;
      regimeImposition?: string;
      raw?: any;
    };
  };
  urssaf?: {
    attestationVigilance?: {
      status: 'ok' | 'refus_de_delivrance' | 'non_disponible' | 'erreur';
      libelle?: string;
      documentUrl?: string;
      dateDelivrance?: string;
      message?: string;
    };
  };
  infogreffe?: {
    mandatairesSociaux?: MandataireSocial[];
    extraitKbis?: {
      status?: string;
      numeroRcs?: string;
      greffe?: string;
      capital?: number;
      capitalFormatted?: string;
      montantCapital?: number;
      deviseCapital?: string;
      dateImmatriculationRcs?: string;
      dateDebutActivite?: string;
      observationsGreffier?: string[];
      raw?: any;
    };
  };
  rne?: {
    status?: 'ok' | 'non_inscrit' | 'non_disponible';
    documentUrl?: string;
    publicPortalUrl?: string;
    annoncesUrl?: string;
    dateImmatriculationRne?: string;
    registre?: string;
    capitalSocial?: number;
    capitalSocialFormatted?: string;
    capitalSocialSource?: string;
    denomination?: string | null;
    dateDebutActivite?: string | null;
    formeJuridique?: { code: string; libelle: string };
    natureEntreprise?: 'COMMERCIALE' | 'ARTISANALE' | 'AGRICOLE' | 'LIBERALE' | string;
    objetSocial?: string | null;
    codeApe?: { code: string; libelle: string };
    associeUnique?: boolean;
    dateClotureExercice?: string | null;
    datePremiereClotureExercice?: string | null;
    dateFinPersonne?: string | null;
    detailCessation?: string | null;
    dissolution?: { date?: string; poursuite_activite?: boolean; avec_liquidation?: boolean } | null;
    adresseSiege?: RneAdresse;
    dirigeants?: MandataireSocial[];
    etablissements?: RneEtablissement[];
    etablissementsFermesTotal?: number;
    diffusionCommerciale?: boolean;
    diffusionInsee?: boolean;
    observations?: RneObservation[];
    raw?: any;
  };
  beneficiairesEffectifs?: {
    status: 'ok' | 'aucun' | 'non_habilite' | 'non_disponible';
    httpStatus?: number;
    items: BeneficiaireEffectif[];
  };
  insee?: {
    nonDiffusible?: boolean;
    accessLevel?: string;
    dateDernierTraitement?: string;
  };
  bodacc?: {
    status?: 'ok' | 'aucune_annonce' | 'procedure_collective' | 'non_disponible';
    hasProcedureCollective?: boolean;
    annoncesCount?: number;
    dernierAvisDate?: string;
    dernierAvisType?: string;
    capitalSocial?: number;
    capitalSocialFormatted?: string;
    synthese?: string;
    annonces?: Array<{
      id?: string;
      dateParution?: string;
      numeroAnnonce?: number | string;
      numeroParution?: string;
      typeAvis?: string;
      familleAvis?: string;
      tribunal?: string;
      commercant?: string;
      ville?: string;
      description?: string;
      jugement?: string;
      publicationUrl?: string;
    }>;
  };
}

export type CorsicaLocationType =
  | 'RURAL_SALVEZZA_UNDER_1000' // Territoire rural ou de montagne (Zonage SALVEZZA & commune < 1 000 hab)
  | 'POLE_RURAL_STRUCTURANT'    // Pôle rural structurant / Bassin intérieur (1 000 à 8 000 hab : Corte, Sartène, Ghisonaccia...)
  | 'QPV'                       // Quartier Prioritaire de la Politique de la Ville (Ajaccio, Bastia, Porto-Vecchio)
  | 'URBAIN_LITTORAL'           // Pôle urbain et littoral (Ajaccio, Bastia, agglomérations CAPA / CAB)
  | 'AUTRE_CORSE'               // Autre commune de Corse (rétro-compatibilité)
  | 'HORS_CORSE';               // Établissement situé hors de Corse

export type SalvezzaConstraintScore = 'de 3 à 3,5' | 'de 3,5 à 4' | 'au dessus de 4';

export interface SalvezzaCommune {
  nom: string;
  nomCorse: string;
  codeCommune: string; // e.g. 2A011, 2B002
  departement: '2A' | '2B';
  scoreContrainte: SalvezzaConstraintScore;
  altitudeSup350m: boolean;
}

export interface CompanyProfile {
  name: string;
  siret?: string;
  siren?: string;
  legalForm: LegalForm;
  natureJuridiqueCode?: string;
  natureJuridiqueLibelle?: string;
  size: CompanySize;
  headcount: number;
  headcountTranche?: string;
  headcountYear?: string;
  caractereEmployeur?: boolean | string;
  annualRevenue: number; // in euros
  balanceSheetTotal: number; // in euros
  locationType: CorsicaLocationType;
  qpvNeighborhood?: string;
  communeName?: string;
  communeCode?: string;
  salvezzaCommune?: SalvezzaCommune;
  postalCode?: string;
  city?: string;
  address?: string;
  departementCode?: string;
  regionCode?: string;
  epciCode?: string;
  coordonneesGps?: { latitude?: string; longitude?: string };
  nombreEtablissements?: number;
  nombreEtablissementsOuverts?: number;
  nafCode?: string;
  nafLabel?: string;
  naf25Code?: string;
  registreMetierCode?: string;
  sectionActivite?: string;
  conventionCollective?: {
    idcc?: string;
    hasConvention?: boolean;
    listeIdcc?: string[];
  };
  labelsAndCertifications?: {
    isBio?: boolean;
    idBio?: number[];
    isEss?: boolean;
    isSocieteMission?: boolean;
    isRge?: boolean;
    isQualiopi?: boolean;
    hasAideAdeme?: boolean;
    hasAideMinimis?: boolean;
    isEgaproRenseignee?: boolean;
    estEntrepreneurIndividuel?: boolean;
    estAssociation?: boolean;
  };
  creationDate?: string;
  creationDateSource?: 'api_insee' | 'api_entreprise' | 'manual' | 'unknown';
  creationYear?: number;
  companyAgeLabel?: string;
  companyAgeMonths?: number;
  isHeadOffice?: boolean;
  administrativeStatus?: string;
  statutDiffusion?: string;
  dateDerniereMiseAJourInsee?: string;
  dateDerniereMiseAJourRne?: string;
  capitalSocial?: number;
  capitalSocialFormatted?: string;
  capitalSocialSource?: string;
  tvaIntracommunautaire?: string;
  enterpriseCategory?: string;
  enterpriseCategoryYear?: string;
  mandataires?: MandataireSocial[];
  complianceData?: ApiEntrepriseComplianceData;
  rneObservations?: RneObservation[];
  rawApiData?: any;
  isEstablishedInCorsica: boolean;
  hasMainExploitationInCorsica: boolean;
  sector: ActivitySector;
  isSeasonalActivity: boolean; // less than 8 months/year
  isFranchiseOrAffiliate: boolean;
  isUnderFiveYears: boolean; // registered < 5 years
  hasDistributedProfits: boolean;
  isFromMergerOrConcentration: boolean;
  registeredSinceAtLeast12Months: boolean; // for target in transmission
}

export interface RegulatoryStatus {
  isUpToDateTaxSocial: boolean;
  hasValidDebtRepaymentPlan: boolean; // plan d'étalement ou d'apurement valide
  isInInsolvencyOrBankruptcy: boolean; // liquidation / cessation des paiements incompatible
  isCompanyInDifficultyEU: boolean; // Perte de plus de la moitié du capital, sauvegarde ou redressement
  hasPriorAdecUnfulfilledObligations: boolean; // non-respect CSF, pièces justificatives non fournies
  hasAdecPriorBreachOfContract: boolean; // non-respect convention antérieure ADEC
  hasPendingPublicRecoveryOrder: boolean; // procédure de recouvrement d'aide publique non régularisée
  hasBenefitedRescueAidPast10Years: boolean; // aide sauvetage/restructuration sur 10 ans
  deMinimisPast3Years: number; // Montant total aides de minimis sur 3 ans glissants
  hasExecutiveFraudHistory: boolean;
  hasOutgoingDividendsDuringDistress: boolean;
}

export interface QualitativeAnswers {
  q1_nonDelocalisableValueAdded: boolean; // Activité de production biens/services non délocalisables, VA et emplois durables (hors saisonnier, hors commerce, hors renouvellement)
  q2_ecologicalEnergyDigitalTransition: boolean; // Transition écologique, numérique, énergétique significative
  q3_innovativeTechnologicalOrSocial: boolean; // Innovant (technologique, social, produits, procédés, organisation)
  q4_ruralOrQpvZone: boolean; // Située en zone rurale ou quartier prioritaire politique de la ville
  q5_strategicFiliereOrAdecAccompanied: boolean; // Filière, écosystème ou action de revitalisation stratégique déjà accompagnée par l'ADEC
  q6_clusterThreeCompanies: boolean; // Grappe d'au moins 3 entreprises se regroupant (filière / coopératif)
  q7_internationalizationCorsicaRadiance: boolean; // Contribution à l'internationalisation ou au rayonnement économique de la Corse
  q8_corsicanLanguageAndCulture: boolean; // Valorise la langue et la culture corse
}

export interface ProjectFinancials {
  selectedNeedCategories: NeedCategory[];
  projectDescription: string;
  totalEstimatedBudgetHT: number;
  eligibleExpensesBreakdown?: {
    materialModernization?: number;
    equipmentEcoEnergy?: number;
    digitalInvestments?: number;
    premisesLayout?: number;
    trainingCosts?: number;
    externalConsultingAndStudies?: number;
    rdPersonnelCosts?: number;
    rdInstrumentsAndDepreciation?: number;
    rdPatentsAndIP?: number;
    reconstitutionStocksSinistre?: number;
    repriseFondsCommerceOuParts?: number;
    cleanVehicles?: {
      type: 'UTILITAIRE_LIGHT' | 'FOURGON' | 'POIDS_LOURD';
      costHT: number;
      scrappageOldVehicleProof: boolean;
    };
    internationalSalonsProspection?: number;
    internationalInternshipCount?: number;
    internationalDestination?: 'FRANCE' | 'EUROMED' | 'GRAND_LARGE';
    generalOperatingCostsDirect?: number;
  };
  insuranceCompensationAmount?: number; // Pour Rinascita (à déduire)
  companyOwnContributionAmount?: number; // Pour Ribumbà
  hasBankPartnerCommitted?: boolean; // Pour Reprise / Ribumbà
}

export interface FullQuestionnaireState {
  company: CompanyProfile;
  regulatory: RegulatoryStatus;
  qualitative: QualitativeAnswers;
  financials: ProjectFinancials;
  dossierSource?: {
    dossierNumber?: string;
    sourceDocumentName?: string;
    aapTitre?: string;
    primarySchemeId?: string;
    primarySchemeName?: string;
  };
}

export interface SchemeRateMatrix {
  tpeMaxRate?: number; // e.g. 0.70 for 70%
  peMaxRate?: number;  // e.g. 0.60
  pmeMaxRate?: number; // e.g. 0.50
  flatAmount?: {
    min: number;
    max: number;
    label: string;
    specialBonus?: {
      amount: number;
      label: string;
    };
  };
  cleanVehiclesRates?: {
    utilitaireLightCap: number; // 3000 €
    fourgonCap: number;         // 7000 €
    poidsLourdCap: number;       // 10000 €
    rate: number;                // 0.15
  };
  travelAllowances?: {
    franceSalon: number;        // 600 €
    euromed: number;            // 800 €
    grandLarge: number;         // 1600 €
  };
  floorAmount: number;          // Typically 5 000 €
  ceilingAmount: number;        // Typically 300 000 € (de minimis ou encadrement RDI)
}

export interface SchemeProcedure {
  portalUrl: string;
  submissionMethod: string;
  decisionBody: string;
  requiredDocuments: string[];
  mandatoryCommitments: string[];
  controlDurationYears: number;
}

export interface DispositifScheme {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  documentSourceId: string;
  category: 'Pattu Risilienzia è Territorii' | 'Guide des Aides - Évaluation Qualitative' | 'Base Personnalisée';
  legalBasis: string;
  governingDeliberation?: string;
  requiresQualitativeEvaluation: boolean;
  objective: string;
  targetBeneficiariesSummary: string;
  allowedSizes: CompanySize[];
  allowedSectors: ActivitySector[];
  excludedSectors: ActivitySector[];
  excludedLegalForms: LegalForm[];
  specificRequirements: string[];
  eligibleExpenseCategories: string[];
  ineligibleExpenseCategories: string[];
  rates: SchemeRateMatrix;
  procedure: SchemeProcedure;
  sourceDocumentPages: string;
  isActive: boolean;
}

export interface EvaluationResultItem {
  scheme: DispositifScheme;
  isEligible: boolean;
  isConditionallyEligible: boolean; // e.g. lacks qualitative score but other criteria pass
  matchScore: number; // 0 to 100%
  reasons: string[];
  ineligibilityMotifs: string[];
  qualitativeScore: number; // 0 to 8
  meetsQualitativeThreshold: boolean;
  estimatedSubsidyAmount: number;
  applicableRatePercent: number;
  subsidyCalculationDetails: string;
  warningNotes: string[];
  salvezzaBonusApplied?: boolean;
  salvezzaBonusDetails?: string;
  isPrimaryFromDossierAAP?: boolean;
}

export interface ComprehensiveEvaluationReport {
  timestamp: string;
  companyName: string;
  totalRecommendedSchemes: number;
  eligibleSchemes: EvaluationResultItem[];
  conditionalSchemes: EvaluationResultItem[];
  ineligibleSchemes: EvaluationResultItem[];
  qualitativeTotalYes: number;
  qualitativeValidated: boolean;
  deMinimisAvailableRemaining: number;
  overallDiagnosisSummary: string;
  suggestedActionPlan: string[];
  isSalvezzaEligibleCommune?: boolean;
  salvezzaCommune?: SalvezzaCommune;
  dossierSource?: {
    dossierNumber?: string;
    sourceDocumentName?: string;
    aapTitre?: string;
    primarySchemeId?: string;
    primarySchemeName?: string;
  };
}

export interface DocumentaryDatabaseMetadata {
  id: string;
  title: string;
  version: string;
  issuer: string;
  dateAdopted: string;
  description: string;
  isOfficialBase: boolean;
  schemesCount: number;
  schemes: DispositifScheme[];
}

export interface DossierInterventionProposal {
  id: string;
  type: 'DISPOSITIF_FINANCIER_DIRECT' | 'ACCOMPAGNEMENT_TECHNIQUE' | 'TRANSITION_NUMERIQUE' | 'BONIFICATION_TERRITORIALE' | 'SOUTIEN_EMPLOI';
  title: string;
  dispositifId?: string;
  dispositifName?: string;
  isPrimaryFromAAP: boolean; // TRUE si provient directement de la section "Appel à projet"
  reasoning: string;
  rateEstimated?: number;
  rateEstimatedLabel?: string;
  estimatedAmountHT?: number;
  eligibleExpensesSummary?: string;
  recommendedActions: string[];
  legalBasis?: string;
}

export interface DossierProjectAnalysis {
  dossierNumber?: string;
  sourceDocumentName?: string;
  analysisDate: string;
  analysisEngineNotice?: string;

  // Volet 1 : Données d'identification de l'entreprise
  company: {
    siret?: string;
    siren?: string;
    name?: string;
    legalForm?: string;
    nafCode?: string;
    nafLabel?: string;
    creationDate?: string;
    headcount?: number;
    annualRevenue?: number;
    balanceSheetTotal?: number;
    address?: {
      street?: string;
      postalCode?: string;
      city?: string;
      communeInsee?: string;
    };
    contact?: {
      fullName?: string;
      role?: string;
      email?: string;
      phone?: string;
    };
    dirigeantsMandataires?: MandataireSocial[];
  };

  // Volet 2 : Section Appel à projet (règle obligatoire)
  appelAProjet: {
    isRenseigne: boolean;
    titre?: string;
    reference?: string;
    dateLimite?: string;
    dispositifCibleSuggere?: string;
    dispositifNameSuggere?: string;
    details?: string;
  };

  // Volet 3 : Projet & Besoins de l'entreprise
  project: {
    title?: string;
    summary?: string;
    contextAndGenesis?: string;
    objectives?: string[];
    location?: string;
    startDate?: string;
    endDate?: string;
    needsCategories?: string[];
    investmentProgram?: Array<{
      category: string;
      description: string;
      estimatedAmountHT?: number;
    }>;
    totalBudgetHT?: number;
    subventionRequestedHT?: number;
  };

  // Données enrichies de l'API Entreprise (si SIRET valide trouvé)
  enrichedCompanyData?: any;
  compliance?: ApiEntrepriseComplianceData;
}

