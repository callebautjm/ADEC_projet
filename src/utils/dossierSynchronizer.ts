/**
 * Synchroniseur Fiche Projet -> Simulateur & Moteur d'Éligibilité ADEC 2026
 * Collectivité de Corse / Agence de Développement Économique de la Corse
 *
 * Assure la cohérence stricte et intégrale entre les données extraites
 * de la fiche projet d'entreprise et l'ensemble des étapes du simulateur.
 */

import {
  CompanyProfile,
  DepenseProjet,
  FormeAide,
  FullQuestionnaireState,
  LegalForm,
  ActivitySector,
  NeedCategory,
  CorsicaLocationType,
  ProjectFinancials,
  QualitativeAnswers,
  SalvezzaCommune
} from '../types';
import { AnalyseFicheProjetResponse, NatureBesoin } from '../types/ficheProjet';
import { determineCompanySize } from '../services/engine';
import { OFFICIAL_ADEC_SCHEMES } from '../data/adecOfficialData';
import { findSalvezzaCommuneByCode, findSalvezzaCommuneByName } from '../data/salvezzaCommunes';
import { analyzeCompanyCreationDate } from './companyAge';

/**
 * Applique une mise à jour du profil entreprise et ses effets de bord
 * (conformité fiscale/sociale, critère rural/QPV). Utilisé par la recherche
 * SIRET et par la resynchronisation registres après dépôt d'une fiche projet.
 */
export function applyCompanyUpdate(
  prev: FullQuestionnaireState,
  updated: Partial<CompanyProfile>
): FullQuestionnaireState {
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
}

/**
 * Normalise la forme juridique extraite en type LegalForm officiel
 */
export function mapLegalFormString(formRaw?: string): LegalForm {
  if (!formRaw) return 'SARL_EURL';
  const f = formRaw.toUpperCase().trim();

  if (f.includes('MICRO') || f.includes('AUTO-ENTREPRENEUR') || f.includes('AUTO ENTREPRENEUR')) {
    return 'MICRO_ENTREPRISE';
  }
  if (f.includes('SASU') || f.includes('SAS')) {
    return 'SAS_SASU';
  }
  if (f.includes('EURL') || f.includes('SARL')) {
    return 'SARL_EURL';
  }
  if (f.includes('SA ') || f === 'SA' || f.includes('ANONYME')) {
    return 'SA';
  }
  if (f.includes('SCI') || f.includes('CIVILE IMMOBILIERE')) {
    return 'SCI';
  }
  if (f.includes('ASSOCIATION') || f.includes('LOI 1901')) {
    return 'ASSOCIATION_ESS';
  }
  if (f.includes('SIAE') || f.includes('INSERTION')) {
    return 'SIAE';
  }
  if (f.includes('SCOP') || f.includes('SCIC') || f.includes('COOPERATIVE')) {
    return 'COOPERATIVE_SCOP_SCIC';
  }
  if (f.includes('LIBERALE') || f.includes('SELARL') || f.includes('SELAFA')) {
    return 'PROFESSION_LIBERALE';
  }
  if (f.includes('INDIVIDUELLE') || f.includes('EI') || f.includes('ARTISAN') || f.includes('COMMERCIANT')) {
    return 'COMMERCIANT_ARTISAN_EI';
  }
  return 'SARL_EURL';
}

/**
 * Normalise le secteur d'activité selon le code NAF ou le libellé
 */
export function mapNafToSector(nafCode?: string, nafLabel?: string): ActivitySector {
  const code = (nafCode || '').replace(/\D/g, '').slice(0, 2);
  const label = (nafLabel || '').toLowerCase();

  // NAF 01, 02, 03 : Agriculture, Sylviculture, Pêche
  if (['01', '02', '03'].includes(code) || label.includes('agricol') || label.includes('pêche') || label.includes('éleva')) {
    return 'AGRICULTURE_PECHE_SYLVICULTURE';
  }

  // NAF 55 : Hébergement touristique, hôtels
  if (code === '55' || label.includes('hôtel') || label.includes('gîte') || label.includes('hébergement')) {
    return 'HEBERGEMENT_TOURISTIQUE';
  }

  // NAF 64, 65, 66, 68 : Finance, Assurance, Immobilier
  if (['64', '65', '66', '68'].includes(code) || label.includes('immobil') || label.includes('financ')) {
    return 'FINANCE_IMMOBILIER';
  }

  // NAF 10 à 33 : Industrie de transformation (dont artisanat alimentaire : 10.71 boulangerie)
  if (parseInt(code, 10) >= 10 && parseInt(code, 10) <= 33) {
    if (label.includes('artisan') || label.includes('boulangerie') || label.includes('pâtisserie') || label.includes('charcuterie') || code === '10' || code === '16' || code === '25') {
      return 'ARTISANAT';
    }
    return 'INDUSTRIE';
  }

  // NAF 41, 42, 43 : Bâtiment, travaux
  if (['41', '42', '43'].includes(code)) {
    return 'ARTISANAT';
  }

  // NAF 45, 46, 47 : Commerce
  if (['45', '46', '47'].includes(code) || label.includes('commerce') || label.includes('vente') || label.includes('magasin')) {
    return 'COMMERCE';
  }

  // ESS
  if (label.includes('insertion') || label.includes('sociale et solidaire') || label.includes('association')) {
    return 'ESS';
  }

  // NAF 49 à 96 : Services
  return 'SERVICES';
}

/**
 * Détermine la localisation corse et vérifie le zonage SALVEZZA
 */
export function detectLocationAndSalvezza(
  communeInsee?: string,
  cityName?: string,
  postalCode?: string,
  rawLocation?: string
): { locationType: CorsicaLocationType; salvezzaCommune?: SalvezzaCommune; communeName: string; postalCode: string; communeCode: string } {
  const pCode = (postalCode || '').trim();
  const cName = (cityName || '').trim();
  const insee = (communeInsee || '').trim().toUpperCase();

  // Recherche dans les 230 communes SALVEZZA
  let salvezza: SalvezzaCommune | undefined = undefined;
  if (insee) {
    salvezza = findSalvezzaCommuneByCode(insee);
  }
  if (!salvezza && cName) {
    salvezza = findSalvezzaCommuneByName(cName);
  }

  let locationType: CorsicaLocationType = 'POLE_RURAL_STRUCTURANT';

  if (salvezza) {
    locationType = 'RURAL_SALVEZZA_UNDER_1000';
  } else {
    const cLower = cName.toLowerCase();
    if (cLower.includes('ajaccio') || cLower.includes('bastia')) {
      locationType = 'URBAIN_LITTORAL';
    } else if (cLower.includes('corte') || cLower.includes('sartène') || cLower.includes('ghisonaccia') || cLower.includes('calvi') || cLower.includes('porto-vecchio')) {
      locationType = 'POLE_RURAL_STRUCTURANT';
    } else if (pCode.startsWith('202') || pCode.startsWith('201')) {
      locationType = 'POLE_RURAL_STRUCTURANT';
    }
  }

  return {
    locationType,
    salvezzaCommune: salvezza,
    communeName: cName || salvezza?.nom || 'Corte',
    postalCode: pCode || '20250',
    communeCode: insee || salvezza?.codeCommune || '2B096'
  };
}

const NEED_PAR_NATURE: Record<NatureBesoin, NeedCategory | undefined> = {
  INVESTISSEMENT: 'INVESTISSEMENT_DEVELOPPEMENT',
  TRESORERIE: 'RESILIENCE_CHOC',
  CREATION: 'CREATION_ENTREPRISE',
  REPRISE: 'REPRISE_TRANSMISSION',
  INNOVATION: 'INNOVATION_DEVELOPPEMENT',
  EXPORT: 'INTERNATIONAL_EXPORT',
  EMPLOI: 'EMPLOI_RSE',
  AUTRE: undefined
};

/** Mots-clés d'un intitulé d'appel à projets → dispositif du simulateur */
const AAP_DISPOSITIFS: Array<{ motif: RegExp; schemeId: (nature: NatureBesoin) => string }> = [
  { motif: /risilienza/, schemeId: () => 'risilienza' },
  { motif: /impresi\s+paisani/, schemeId: () => 'impresi_paisani' },
  { motif: /rinascita/, schemeId: () => 'rinascita' },
  { motif: /ribumba/, schemeId: () => 'ribumba' },
  { motif: /riesce/, schemeId: () => 'riesce' },
  { motif: /innuvazione/, schemeId: () => 'pattu_innuvazione_developpement' },
  {
    motif: /impresa\s+si/,
    schemeId: (nature) => nature === 'CREATION' ? 'impresa_si_creation' : nature === 'REPRISE' ? 'impresa_si_reprise_transmission' : 'impresa_si_developpement_invest'
  },
  { motif: /sviluppu/, schemeId: () => 'sviluppu_suciale' },
  { motif: /impresamondu/, schemeId: () => 'impresamondu_individuel' }
];

const sansAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const toIsoDate = (fr?: string) => {
  const m = fr?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined;
};

const mapFormeAide = (s?: string): FormeAide | undefined => {
  if (!s) return undefined;
  const t = sansAccents(s);
  if (t.includes('avance')) return 'AVANCE_REMBOURSABLE';
  if (t.includes('pret')) return 'PRET';
  if (t.includes('subvention')) return 'SUBVENTION';
  return 'AUTRE';
};

/** Réponse renseignée et non négative (« Non », « aucune », « ne développe pas »…) */
const reponsePositive = (t?: string) => {
  const s = (t || '').trim();
  return s.length > 15 && !/^(non|aucun|néant|ras)\b/i.test(s) && !/\bne\s+\S+\s+pas\b/i.test(s.slice(0, 120));
};

const extrait = (t: string) => {
  const s = t.replace(/\s+/g, ' ').trim();
  return s.length > 220 ? `${s.slice(0, 217)}…` : s;
};

const phraseAvec = (t: string | undefined, motif: RegExp) => {
  const phrase = (t || '').replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).find((p) => motif.test(p));
  return phrase ? extrait(phrase) : undefined;
};

/** Répartit les lignes de dépenses de la fiche dans les catégories du simulateur budgétaire */
const ventilerDepenses = (depenses: DepenseProjet[]): ProjectFinancials['eligibleExpensesBreakdown'] => {
  const b: Record<string, number> = {};
  const add = (key: string, montant: number) => { b[key] = (b[key] || 0) + montant; };
  for (const d of depenses) {
    const t = sansAccents(`${d.nature} ${d.description}`);
    if (/formation/.test(t)) add('trainingCosts', d.montantHT);
    else if (/logiciel|tablette|informatique|site (internet|web)|numerique|digital|drone/.test(t)) add('digitalInvestments', d.montantHT);
    else if (/travaux|\bsol\b|salle|amenagement|local|immobilier|construction|plomberie|electricite|norme/.test(t)) add('premisesLayout', d.montantHT);
    else if (/prestation|conseil|etude|communication/.test(t)) add('externalConsultingAndStudies', d.montantHT);
    else if (/fonctionnement|abonnement/.test(t)) add('generalOperatingCostsDirect', d.montantHT);
    else add('materialModernization', d.montantHT);
  }
  return b;
};

/**
 * Pré-remplit l'ensemble du simulateur à partir d'une fiche projet lue de façon exacte.
 * Les données des registres (recherche SIRET) sont appliquées ensuite et priment sur l'identité.
 */
export function synchronizeQuestionnaireFromFiche(
  analyse: AnalyseFicheProjetResponse,
  previousState: FullQuestionnaireState
): FullQuestionnaireState {
  const { fiche, synthese } = analyse;
  const ent = fiche.entreprise;
  const fin = fiche.finances;

  const loc = detectLocationAndSalvezza(undefined, ent.commune, ent.codePostal);
  const legalForm = mapLegalFormString(ent.formeJuridique);
  const sector = mapNafToSector(ent.codeApe, ent.activite);
  const creationIso = toIsoDate(ent.dateCreation);
  const age = analyzeCompanyCreationDate(creationIso);
  const headcount = fin.effectifEtp ?? 0;
  const annualRevenue = fin.chiffreAffaires ?? 0;
  const enCorse = (ent.codePostal || '').startsWith('20');

  const depenses: DepenseProjet[] = [...fiche.depenses.investissements, ...fiche.depenses.autres]
    .map((d) => ({ nature: d.nature, description: d.description, montantHT: d.cout }));

  // Besoins
  const needs = new Set<NeedCategory>();
  const needPrincipal = NEED_PAR_NATURE[synthese.natureBesoin];
  if (needPrincipal) needs.add(needPrincipal);
  if (loc.salvezzaCommune) needs.add('RURALITE_PROXIMITE');
  if (fiche.projet.difficultesTresorerie) needs.add('RESILIENCE_CHOC');

  // Critères qualitatifs pré-cochés, chacun justifié par la fiche
  const justifications: Partial<Record<keyof QualitativeAnswers, string>> = {};
  const q1 = ['ARTISANAT', 'INDUSTRIE'].includes(sector)
    || /artisan|plomb|[ée]lectric|ma[çc]onn|menuis|fabrication|production|atelier|laboratoire|confiser|boulang/i.test(`${ent.activite || ''} ${ent.presentation || ''}`);
  if (q1) justifications.q1_nonDelocalisableValueAdded = `Activité : ${ent.activite || ent.codeApe || 'production / artisanat'}.`;
  const transition = [fiche.projet.transitionEcologique, fiche.ecosysteme.transitionNumerique].find(reponsePositive);
  if (transition) justifications.q2_ecologicalEnergyDigitalTransition = extrait(transition);
  const innovation = phraseAvec(`${fiche.projet.description || ''} ${fiche.ecosysteme.transitionNumerique || ''}`, /innov/i);
  if (innovation) justifications.q3_innovativeTechnologicalOrSocial = innovation;
  if (loc.salvezzaCommune) justifications.q4_ruralOrQpvZone = `Commune ${loc.salvezzaCommune.nom} classée Fonds Salvezza.`;
  const grappe = phraseAvec(fiche.ecosysteme.collaborations, /coop[ée]rati|fili[èe]re|grappe|groupement|cluster/i);
  if (grappe) justifications.q6_clusterThreeCompanies = grappe;
  if (reponsePositive(fiche.ecosysteme.international)) justifications.q7_internationalizationCorsicaRadiance = extrait(fiche.ecosysteme.international!);
  if (reponsePositive(fiche.ecosysteme.langueCulture)) justifications.q8_corsicanLanguageAndCulture = extrait(fiche.ecosysteme.langueCulture!);

  // Appel à projets → dispositif à proposer en priorité
  const aap = fiche.appelAProjet.repond ? fiche.appelAProjet.intitule : undefined;
  const aapMatch = aap ? AAP_DISPOSITIFS.find((d) => d.motif.test(sansAccents(aap))) : undefined;
  const primarySchemeId = aapMatch?.schemeId(synthese.natureBesoin);
  const primaryScheme = primarySchemeId ? OFFICIAL_ADEC_SCHEMES.find((s) => s.id === primarySchemeId) : undefined;

  const rl = ent.responsableLegal;

  return {
    company: {
      name: ent.raisonSociale || '',
      siret: ent.siret,
      siren: ent.siret?.slice(0, 9),
      legalForm,
      size: determineCompanySize(headcount, annualRevenue, 0),
      headcount,
      annualRevenue,
      balanceSheetTotal: 0,
      capitalSocial: fin.capitalSocial || undefined,
      capitalSocialSource: fin.capitalSocial ? 'Fiche projet' : undefined,
      locationType: enCorse ? loc.locationType : 'HORS_CORSE',
      communeName: loc.communeName,
      communeCode: loc.salvezzaCommune?.codeCommune,
      salvezzaCommune: loc.salvezzaCommune,
      postalCode: ent.codePostal,
      city: ent.commune,
      address: ent.adresse,
      nafCode: ent.codeApe,
      nafLabel: ent.activite,
      creationDate: creationIso,
      creationDateSource: creationIso ? 'manual' : 'unknown',
      creationYear: age.creationYear,
      companyAgeLabel: age.ageLabel,
      companyAgeMonths: age.ageInMonths,
      isUnderFiveYears: age.isUnderFiveYears ?? false,
      registeredSinceAtLeast12Months: age.registeredSinceAtLeast12Months ?? true,
      sector,
      isEstablishedInCorsica: enCorse,
      hasMainExploitationInCorsica: enCorse,
      isSeasonalActivity: false,
      isFranchiseOrAffiliate: false,
      hasDistributedProfits: false,
      isFromMergerOrConcentration: false,
      mandataires: rl?.nom
        ? [{ type: 'personne_physique', nom: rl.nom, prenom: rl.prenom, fonction: rl.fonction }]
        : []
    },
    regulatory: {
      isUpToDateTaxSocial: fin.aJourCotisations ?? false,
      hasValidDebtRepaymentPlan: false,
      isInInsolvencyOrBankruptcy: false,
      isCompanyInDifficultyEU: fin.fondsPropres !== undefined && fin.fondsPropres < 0,
      hasPriorAdecUnfulfilledObligations: false,
      hasAdecPriorBreachOfContract: false,
      hasPendingPublicRecoveryOrder: false,
      hasBenefitedRescueAidPast10Years: false,
      hasExecutiveFraudHistory: false,
      hasOutgoingDividendsDuringDistress: false,
      deMinimisPast3Years: previousState.regulatory.deMinimisPast3Years || 0
    },
    qualitative: {
      q1_nonDelocalisableValueAdded: q1,
      q2_ecologicalEnergyDigitalTransition: Boolean(justifications.q2_ecologicalEnergyDigitalTransition),
      q3_innovativeTechnologicalOrSocial: Boolean(justifications.q3_innovativeTechnologicalOrSocial),
      q4_ruralOrQpvZone: Boolean(justifications.q4_ruralOrQpvZone),
      q5_strategicFiliereOrAdecAccompanied: false,
      q6_clusterThreeCompanies: Boolean(justifications.q6_clusterThreeCompanies),
      q7_internationalizationCorsicaRadiance: Boolean(justifications.q7_internationalizationCorsicaRadiance),
      q8_corsicanLanguageAndCulture: Boolean(justifications.q8_corsicanLanguageAndCulture)
    },
    qualitativeJustifications: justifications,
    financials: {
      selectedNeedCategories: Array.from(needs),
      projectDescription: fiche.projet.description || '',
      totalEstimatedBudgetHT: synthese.financement.baseCout || 0,
      eligibleExpensesBreakdown: ventilerDepenses(depenses),
      insuranceCompensationAmount: 0,
      hasBankPartnerCommitted: false
    },
    santeFinanciere: {
      resultatNet: fin.resultatNet,
      fondsPropres: fin.fondsPropres,
      empruntsEnCours: fin.empruntsEnCours,
      caf: fin.caf,
      difficultesTresorerie: fiche.projet.difficultesTresorerie
    },
    projet: {
      libelle: fiche.projet.libelle,
      dateDebut: fiche.projet.dateDebut,
      dateFin: fiche.projet.dateFin,
      depenses,
      formeAide: mapFormeAide(fiche.financement.formesAide),
      aideSollicitee: fiche.financement.aideSollicitee,
      emploisCrees: fiche.financement.emploisCrees,
      emploisMaintenus: fiche.financement.emploisMaintenus,
      appelAProjet: aap
    },
    dossierSource: {
      dossierNumber: fiche.dossierNumero,
      sourceDocumentName: analyse.sourceDocumentName,
      aapTitre: aap,
      primarySchemeId,
      primarySchemeName: primaryScheme?.name
    }
  };
}
