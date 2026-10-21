/**
 * Fiche Projet ADEC (formulaire OpenSub) : données lues de façon exacte dans le PDF,
 * et synthèse du projet produite à partir de ces données.
 */

export interface FicheDepense {
  nature: string;
  description: string;
  taxe?: 'HT' | 'TTC' | string;
  cout: number;
  creditBail?: number;
  emprunt?: number;
  emploisConcernes?: number;
}

export interface FicheProjet {
  dossierNumero?: string;
  transmisLe?: string;

  demandeur: {
    civilite?: string;
    nom?: string;
    prenom?: string;
    fonction?: string;
    email?: string;
    telephone?: string;
  };

  entreprise: {
    raisonSociale?: string;
    siret?: string;
    formeJuridique?: string;
    codeApe?: string;
    activite?: string;
    dateCreation?: string;
    dateMiseEnActivite?: string;
    adresse?: string;
    codePostal?: string;
    commune?: string;
    responsableLegal?: { civilite?: string; nom?: string; prenom?: string; fonction?: string };
    presentation?: string;
    marche?: string;
    locaux?: string;
    clientsFournisseurs?: string;
  };

  finances: {
    effectifEtp?: number;
    capitalSocial?: number;
    chiffreAffaires?: number;
    resultatNet?: number;
    fondsPropres?: number;
    empruntsEnCours?: number;
    reserveLegale?: number;
    reportANouveau?: number;
    caf?: number;
    aJourCotisations?: boolean;
    regimeTva?: string;
    dateAttestationFiscale?: string;
    dateAttestationSociale?: string;
  };

  projet: {
    libelle?: string;
    nature?: string;
    description?: string;
    difficultesTresorerie?: boolean;
    precisionsTresorerie?: string;
    renforcementActivite?: string;
    transitionEcologique?: string;
    perspectives3Ans?: string;
    dateDebut?: string;
    dateFin?: string;
  };

  depenses: {
    investissements: FicheDepense[];
    autres: FicheDepense[];
    totalInvestissementsDeclare?: number;
    totalAutresDeclare?: number;
  };

  financement: {
    emploisCrees?: number;
    emploisMaintenus?: number;
    coutTotalDeclare?: number;
    aideSollicitee?: number;
    formesAide?: string;
    partenaires?: string;
    leveeDeFonds?: boolean;
  };

  appelAProjet: {
    repond?: boolean;
    intitule?: string;
  };

  ecosysteme: {
    collaborations?: string;
    langueCulture?: string;
    international?: string;
    transitionNumerique?: string;
  };
}

export type NatureBesoin =
  | 'INVESTISSEMENT'
  | 'TRESORERIE'
  | 'CREATION'
  | 'REPRISE'
  | 'INNOVATION'
  | 'EXPORT'
  | 'EMPLOI'
  | 'AUTRE';

export type NiveauAlerte = 'info' | 'attention' | 'bloquant';

export interface PointAttention {
  niveau: NiveauAlerte;
  message: string;
}

/** Synthèse du projet : chiffres recalculés (règles) + texte rédigé (IA, si disponible) */
export interface SyntheseProjet {
  natureBesoin: NatureBesoin;
  natureBesoinLibelle: string;
  depenses: {
    totalInvestissements: number;
    totalAutres: number;
    totalRecalcule: number;
    parNature: Array<{ nature: string; total: number }>;
  };
  financement: {
    aideSollicitee?: number;
    formeAide?: string;
    tauxAideDemande?: number;
    baseCout?: number;
  };
  ratios: {
    endettementSurFondsPropres?: number;
    margeNette?: number;
    cafSurAide?: number;
  };
  pointsAttention: PointAttention[];
  donneesManquantes: string[];
  /** Texte rédigé par l'IA (résumé, forces, vigilances, orientation) ; absent sans clé API */
  redaction?: {
    resume: string;
    forces: string[];
    vigilances: string[];
    orientation: string;
    moteur: string;
  };
  redactionIndisponible?: string;
}

export interface AnalyseFicheProjetResponse {
  fiche: FicheProjet;
  synthese: SyntheseProjet;
  sourceDocumentName: string;
}
