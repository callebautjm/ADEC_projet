/**
 * Synchroniseur Fiche Projet -> Simulateur & Moteur d'Éligibilité ADEC 2026
 * Collectivité de Corse / Agence de Développement Économique de la Corse
 *
 * Assure la cohérence stricte et intégrale entre les données extraites
 * de la fiche projet d'entreprise et l'ensemble des 5 étapes du simulateur.
 */

import {
  CompanyProfile,
  DossierProjectAnalysis,
  FullQuestionnaireState,
  LegalForm,
  ActivitySector,
  NeedCategory,
  CorsicaLocationType,
  SalvezzaCommune
} from '../types';
import { determineCompanySize, SCHEME_TARGET_NEEDS } from '../services/engine';
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
 * Nettoie une adresse complète pour ne conserver que la voie (numéro et rue)
 * en supprimant le code postal et la commune en fin de chaîne.
 */
export function cleanStreetFromFullAddress(full: string): string {
  if (!full) return '';
  let s = full.trim();
  // Retire le code postal et la commune à la fin (ex: ", 20250 Corte", " - 20250 Corte", " 20250 CORTE")
  s = s.replace(/[,-\s]+\b(20\d{3}|2A\d{3}|2B\d{3}|\d{5})\b.*$/i, '').trim();
  return s || full.trim();
}

/**
 * Extrait rigoureusement la voie / adresse d'implantation à partir de tout format de JSON
 * (qu'il contienne un bloc 'implantation', 'adresse', 'address', 'localisation' ou des clés directes).
 */
export function extractStreetAddressFromJson(analysis?: any, comp?: any): string {
  const anyComp = comp || {};
  const anyAnalysis = analysis || {};
  const anyProj = anyAnalysis.project || {};

  // 1. Recherche dans un bloc 'implantation' ou 'localisation' (format OpenSub / ADEC)
  const impl = 
    anyComp.implantation || 
    anyAnalysis.implantation || 
    anyProj.implantation || 
    anyComp.localisation || 
    anyAnalysis.localisation;

  if (impl) {
    if (typeof impl === 'string' && impl.trim()) {
      return cleanStreetFromFullAddress(impl.trim());
    }
    if (typeof impl === 'object') {
      const directVoie =
        impl.adresse_voie ||
        impl.voie ||
        impl.adresse ||
        impl.rue ||
        impl.street ||
        impl.adresse_complete ||
        impl.libelle_voie ||
        impl.nom_voie;

      if (typeof directVoie === 'string' && directVoie.trim()) {
        return cleanStreetFromFullAddress(directVoie.trim());
      }

      const num = (impl.numero_voie || impl.num_voie || '').toString().trim();
      const rep = (impl.indice_repetition || '').toString().trim();
      const type = (impl.type_voie || '').toString().trim();
      const nom = (impl.nom_voie || impl.libelle_voie || impl.voie || '').toString().trim();
      const compParts = [num, rep, type, nom].filter(Boolean).join(' ');
      if (compParts) return compParts;
    }
  }

  // 2. Recherche dans le bloc 'address' ou 'adresse' de company
  const addr = anyComp.address || anyComp.adresse;
  if (typeof addr === 'string' && addr.trim()) {
    return cleanStreetFromFullAddress(addr.trim());
  }

  if (addr && typeof addr === 'object') {
    const directVoie =
      addr.voie ||
      addr.adresse_voie ||
      addr.street ||
      addr.rue ||
      addr.adresse ||
      addr.adresse_ligne_1 ||
      addr.ligne_1 ||
      addr.adresse_complete ||
      addr.acheminement_postal?.l4;

    if (typeof directVoie === 'string' && directVoie.trim()) {
      return cleanStreetFromFullAddress(directVoie.trim());
    }

    const num = (addr.numero_voie || addr.num_voie || '').toString().trim();
    const rep = (addr.indice_repetition || '').toString().trim();
    const type = (addr.type_voie || '').toString().trim();
    const nom = (addr.libelle_voie || addr.nom_voie || '').toString().trim();
    const compParts = [num, rep, type, nom].filter(Boolean).join(' ');
    if (compParts) return compParts;
  }

  // 3. Clés directes sur company
  const directOnComp =
    anyComp.adresse_voie ||
    anyComp.voie ||
    anyComp.street ||
    anyComp.rue ||
    (typeof anyComp.adresse === 'string' ? anyComp.adresse : '');

  if (typeof directOnComp === 'string' && directOnComp.trim()) {
    return cleanStreetFromFullAddress(directOnComp.trim());
  }

  return '';
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

/**
 * Construit la liste stricte et cohérente des NeedCategory en fonction
 * de l'Appel à projet (AAP) et des investissements déclarés
 */
export function buildSynchronizedNeedCategories(
  analysis: DossierProjectAnalysis
): NeedCategory[] {
  const categoriesSet = new Set<NeedCategory>();

  const targetSchemeId = analysis.appelAProjet?.dispositifCibleSuggere;
  if (targetSchemeId && SCHEME_TARGET_NEEDS[targetSchemeId]) {
    SCHEME_TARGET_NEEDS[targetSchemeId].primaryNeeds.forEach((n) => categoriesSet.add(n));
  }

  // Analyser les besoins déclarés dans le projet
  const prog = analysis.project?.investmentProgram || [];
  const progText = JSON.stringify(prog).toLowerCase();
  const summaryText = `${analysis.project?.title || ''} ${analysis.project?.summary || ''}`.toLowerCase();
  const allText = `${progText} ${summaryText}`;

  if (allText.includes('résilience') || allText.includes('choc') || allText.includes('énergie') || allText.includes('fournil') || allText.includes('matériel')) {
    categoriesSet.add('RESILIENCE_CHOC');
    categoriesSet.add('INVESTISSEMENT_DEVELOPPEMENT');
  }

  if (allText.includes('rural') || allText.includes('tournée') || allText.includes('montagne') || allText.includes('proximité') || allText.includes('salvezza')) {
    categoriesSet.add('RURALITE_PROXIMITE');
  }

  if (allText.includes('véhicule') || allText.includes('utilitaire') || allText.includes('camion') || allText.includes('mobilité')) {
    categoriesSet.add('INVESTISSEMENT_DEVELOPPEMENT');
    categoriesSet.add('RURALITE_PROXIMITE');
  }

  if (allText.includes('numérique') || allText.includes('site') || allText.includes('e-commerce') || allText.includes('click') || allText.includes('digital')) {
    categoriesSet.add('INVESTISSEMENT_DEVELOPPEMENT');
  }

  if (allText.includes('emploi') || allText.includes('recrutement') || allText.includes('embauche') || allText.includes('rse')) {
    categoriesSet.add('EMPLOI_RSE');
  }

  if (allText.includes('innov') || allText.includes('r&d') || allText.includes('brevet')) {
    categoriesSet.add('INNOVATION_AMORCAGE');
  }

  if (allText.includes('sinistre') || allText.includes('incendie') || allText.includes('inondation') || allText.includes('tempête')) {
    categoriesSet.add('SINISTRE_CATASTROPHE');
  }

  if (allText.includes('reprise') || allText.includes('transmission') || allText.includes('rachat')) {
    categoriesSet.add('REPRISE_TRANSMISSION');
  }

  if (allText.includes('difficulté') || allText.includes('restructuration') || allText.includes('redressement')) {
    categoriesSet.add('RESTRUCTURATION_REBOND');
  }

  // Si l'ensemble est vide, par défaut pour un projet ADEC standard
  if (categoriesSet.size === 0) {
    categoriesSet.add('RESILIENCE_CHOC');
    categoriesSet.add('INVESTISSEMENT_DEVELOPPEMENT');
  }

  return Array.from(categoriesSet);
}

/**
 * Extrait le découpage des dépenses éligibles à partir du programme d'investissement
 */
export function extractEligibleExpensesBreakdown(
  analysis: DossierProjectAnalysis
): FullQuestionnaireState['financials']['eligibleExpensesBreakdown'] {
  const prog = analysis.project?.investmentProgram || [];
  let cleanVehCost = 0;
  let cleanVehType: 'UTILITAIRE_LIGHT' | 'FOURGON' | 'POIDS_LOURD' = 'UTILITAIRE_LIGHT';
  let matModernization = 0;
  let ecoEnergy = 0;
  let digital = 0;

  for (const item of prog) {
    const desc = `${item.category} ${item.description}`.toLowerCase();
    const amount = item.estimatedAmountHT || 0;

    if (desc.includes('véhicule') || desc.includes('utilitaire') || desc.includes('fourgon') || desc.includes('camion')) {
      cleanVehCost += amount;
      if (desc.includes('fourgon') || desc.includes('3.5') || desc.includes('2.5')) {
        cleanVehType = 'FOURGON';
      } else if (desc.includes('lourd') || desc.includes('poids')) {
        cleanVehType = 'POIDS_LOURD';
      }
    } else if (desc.includes('numérique') || desc.includes('web') || desc.includes('site') || desc.includes('click') || desc.includes('commerce') || desc.includes('logiciel')) {
      digital += amount;
    } else if (desc.includes('énergie') || desc.includes('écologique') || desc.includes('thermique') || desc.includes('chambre') || desc.includes('froid')) {
      ecoEnergy += amount;
    } else {
      matModernization += amount;
    }
  }

  return {
    materialModernization: matModernization > 0 ? matModernization : undefined,
    equipmentEcoEnergy: ecoEnergy > 0 ? ecoEnergy : undefined,
    digitalInvestments: digital > 0 ? digital : undefined,
    cleanVehicles: cleanVehCost > 0 ? {
      type: cleanVehType,
      costHT: cleanVehCost,
      scrappageOldVehicleProof: true
    } : undefined
  };
}

/**
 * Fonction maîtresse : Alimente intégralement le questionnaire à partir de la fiche projet
 */
export function synchronizeQuestionnaireFromDossier(
  analysis: DossierProjectAnalysis,
  previousState?: FullQuestionnaireState
): FullQuestionnaireState {
  const comp = (analysis.company || {}) as any;
  const proj = (analysis.project || {}) as any;
  const addr = (comp.address || comp.adresse || {}) as any;
  const impl = ((analysis as any).implantation || comp.implantation || proj.implantation || {}) as any;

  // Récupération intelligente des données d'implantation géographique
  const resolvedInsee = addr.communeInsee || addr.codeCommune || addr.code_insee || impl.codeCommune || impl.code_insee || impl.communeInsee;
  const resolvedCity = addr.city || addr.commune || addr.nom_commune || addr.libelle_commune || impl.commune || impl.city || impl.libelle_commune || comp.city;
  const resolvedPostalCode = addr.postalCode || addr.code_postal || impl.postalCode || impl.code_postal || comp.postalCode;

  const { locationType, salvezzaCommune, communeName, postalCode, communeCode } =
    detectLocationAndSalvezza(resolvedInsee, resolvedCity, resolvedPostalCode);

  // Extraction rigoureuse du champ "Adresse (Voie)" dans l'implantation depuis le JSON
  const resolvedStreetAddress = extractStreetAddressFromJson(analysis, comp) || previousState?.company.address || '';

  const headcount = comp.headcount !== undefined && comp.headcount > 0 ? comp.headcount : (previousState?.company.headcount || 1);
  const annualRevenue = comp.annualRevenue !== undefined && comp.annualRevenue > 0 ? comp.annualRevenue : (previousState?.company.annualRevenue || 0);
  const balanceSheetTotal = comp.balanceSheetTotal !== undefined && comp.balanceSheetTotal > 0 ? comp.balanceSheetTotal : (previousState?.company.balanceSheetTotal || 0);
  const computedSize = determineCompanySize(headcount, annualRevenue, balanceSheetTotal);

  const legalForm = mapLegalFormString(comp.legalForm || previousState?.company.legalForm);
  const sector = mapNafToSector(comp.nafCode, comp.nafLabel || previousState?.company.nafLabel);

  const ageAnalysis = analyzeCompanyCreationDate(comp.creationDate);

  const selectedNeeds = buildSynchronizedNeedCategories(analysis);
  const eligibleBreakdown = extractEligibleExpensesBreakdown(analysis);

  // Vérification de la conformité sociale et fiscale
  const dgfipOk = analysis.compliance?.dgfip?.attestationFiscale?.status === 'ok';
  const urssafOk = analysis.compliance?.urssaf?.attestationVigilance?.status === 'ok';
  const isUpToDate = (dgfipOk && urssafOk) || Boolean(previousState?.regulatory.isUpToDateTaxSocial);

  // Synchronisation du score qualitatif : valider les critères objectifs vérifiés
  const isRural = Boolean(salvezzaCommune) || locationType === 'RURAL_SALVEZZA_UNDER_1000' || locationType === 'POLE_RURAL_STRUCTURANT';
  const hasEcoOrDigital = selectedNeeds.includes('INVESTISSEMENT_DEVELOPPEMENT') || selectedNeeds.includes('RESILIENCE_CHOC');
  const isArtisanOrProduction = sector === 'ARTISANAT' || sector === 'INDUSTRIE' || sector === 'SERVICES';

  const updatedState: FullQuestionnaireState = {
    company: {
      name: comp.name || previousState?.company.name || 'Entreprise candidate',
      siret: comp.siret || previousState?.company.siret || '',
      siren: comp.siren || (comp.siret ? comp.siret.slice(0, 9) : previousState?.company.siren),
      legalForm,
      size: computedSize,
      headcount,
      annualRevenue,
      balanceSheetTotal,
      locationType,
      communeName,
      communeCode,
      postalCode,
      city: communeName,
      address: resolvedStreetAddress,
      nafCode: comp.nafCode || previousState?.company.nafCode || '',
      nafLabel: comp.nafLabel || previousState?.company.nafLabel || '',
      creationDate: comp.creationDate || previousState?.company.creationDate,
      creationDateSource: comp.creationDate ? 'api_insee' : previousState?.company.creationDateSource || 'unknown',
      creationYear: ageAnalysis.creationYear,
      companyAgeLabel: ageAnalysis.ageLabel,
      companyAgeMonths: ageAnalysis.ageInMonths,
      isUnderFiveYears: ageAnalysis.isUnderFiveYears ?? true,
      registeredSinceAtLeast12Months: ageAnalysis.registeredSinceAtLeast12Months ?? true,
      salvezzaCommune,
      sector,
      isEstablishedInCorsica: true,
      hasMainExploitationInCorsica: true,
      isSeasonalActivity: false,
      isFranchiseOrAffiliate: false,
      hasDistributedProfits: false,
      isFromMergerOrConcentration: false,
      mandataires: (comp.dirigeantsMandataires && comp.dirigeantsMandataires.length > 0)
        ? comp.dirigeantsMandataires
        : previousState?.company.mandataires || [],
      complianceData: analysis.compliance || previousState?.company.complianceData
    },
    regulatory: {
      isUpToDateTaxSocial: isUpToDate,
      hasValidDebtRepaymentPlan: false,
      isInInsolvencyOrBankruptcy: false,
      isCompanyInDifficultyEU: analysis.appelAProjet?.dispositifCibleSuggere === 'ribumba',
      hasPriorAdecUnfulfilledObligations: false,
      hasAdecPriorBreachOfContract: false,
      hasPendingPublicRecoveryOrder: false,
      hasBenefitedRescueAidPast10Years: false,
      hasExecutiveFraudHistory: false,
      hasOutgoingDividendsDuringDistress: false,
      deMinimisPast3Years: previousState?.regulatory.deMinimisPast3Years || 0
    },
    qualitative: {
      q1_nonDelocalisableValueAdded: isArtisanOrProduction,
      q2_ecologicalEnergyDigitalTransition: hasEcoOrDigital,
      q3_innovativeTechnologicalOrSocial: selectedNeeds.includes('INNOVATION_AMORCAGE') || selectedNeeds.includes('INNOVATION_DEVELOPPEMENT'),
      q4_ruralOrQpvZone: isRural,
      q5_strategicFiliereOrAdecAccompanied: Boolean(analysis.appelAProjet?.isRenseigne),
      q6_clusterThreeCompanies: false,
      q7_internationalizationCorsicaRadiance: selectedNeeds.includes('INTERNATIONAL_EXPORT'),
      q8_corsicanLanguageAndCulture: true // Ancrage territorial corse
    },
    financials: {
      totalEstimatedBudgetHT: proj.totalBudgetHT || previousState?.financials.totalEstimatedBudgetHT || 50000,
      projectDescription: proj.summary || proj.title || previousState?.financials.projectDescription || '',
      selectedNeedCategories: selectedNeeds,
      eligibleExpensesBreakdown: eligibleBreakdown,
      insuranceCompensationAmount: previousState?.financials.insuranceCompensationAmount || 0,
      hasBankPartnerCommitted: true
    },
    dossierSource: {
      dossierNumber: analysis.dossierNumber,
      sourceDocumentName: analysis.sourceDocumentName,
      aapTitre: analysis.appelAProjet?.titre,
      primarySchemeId: analysis.appelAProjet?.dispositifCibleSuggere,
      primarySchemeName: analysis.appelAProjet?.dispositifNameSuggere
    }
  };

  return updatedState;
}
