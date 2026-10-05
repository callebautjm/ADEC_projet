/**
 * Moteur d'évaluation réglementaire et de simulation d'aides ADEC 2026
 * Collectivité de Corse / Agence de Développement Économique de la Corse
 * 
 * Implémentation stricte et exhaustive des règles de :
 * - Annexe 1 : U Pattu Risilienzia è Territorii (Délibération N° 21/177 AC - Non soumis à l'évaluation qualitative)
 * - Guide des Aides de l'ADEC 2026 (Délibération N° 21/177 AC - Soumis à l'évaluation qualitative préalable ≥ 3 OUI)
 * - Règlement (UE) 2023/2831 de minimis (Plafond 300 000 € sur 3 ans glissants)
 * - Régime cadre RDI SA.111723 et Régime SA.122002 (PME en difficulté)
 */

import {
  FullQuestionnaireState,
  DispositifScheme,
  EvaluationResultItem,
  ComprehensiveEvaluationReport,
  CompanySize,
  NeedCategory,
  SalvezzaCommune
} from '../types';
import { analyzeCompanyCreationDate } from '../utils/companyAge';
import { findSalvezzaCommuneByCode, findSalvezzaCommuneByName } from '../data/salvezzaCommunes';

/**
 * Calcul du score qualitatif préalable (Délibération N° 21/177 AC)
 * Seuil réglementaire de recevabilité : ≥ 3 critères "OUI" sur 8
 */
export function computeQualitativeScore(answers: FullQuestionnaireState['qualitative']): number {
  let count = 0;
  if (answers.q1_nonDelocalisableValueAdded) count++;
  if (answers.q2_ecologicalEnergyDigitalTransition) count++;
  if (answers.q3_innovativeTechnologicalOrSocial) count++;
  if (answers.q4_ruralOrQpvZone) count++;
  if (answers.q5_strategicFiliereOrAdecAccompanied) count++;
  if (answers.q6_clusterThreeCompanies) count++;
  if (answers.q7_internationalizationCorsicaRadiance) count++;
  if (answers.q8_corsicanLanguageAndCulture) count++;
  return count;
}

/**
 * Détermination rigoureuse de la taille d'entreprise selon la Recommandation 2003/361/CE de l'Union Européenne
 */
export function determineCompanySize(headcount: number, revenue: number, balanceSheet: number): CompanySize {
  // Grande Entreprise (> 250 personnes ou dépassement cumulé)
  if (headcount >= 250 || (revenue > 50000000 && balanceSheet > 43000000)) {
    return 'GRANDE';
  }
  // Très Petite Entreprise (TPE) : < 10 personnes et (CA ≤ 2 M€ ou Bilan ≤ 2 M€)
  if (headcount < 10 && (revenue <= 2000000 || balanceSheet <= 2000000)) {
    return 'TPE';
  }
  // Petite Entreprise (PE) : < 50 personnes et (CA ≤ 10 M€ ou Bilan ≤ 10 M€)
  if (headcount < 50 && (revenue <= 10000000 || balanceSheet <= 10000000)) {
    return 'PE';
  }
  // Moyenne Entreprise (PME) : < 250 personnes et (CA ≤ 50 M€ ou Bilan ≤ 43 M€)
  return 'PME';
}

/**
 * Correspondance officielle entre chaque dispositif ADEC et les typologies de projet ciblées
 */
export const SCHEME_TARGET_NEEDS: Record<string, { primaryNeeds: NeedCategory[]; label: string }> = {
  risilienza: {
    primaryNeeds: ['RESILIENCE_CHOC', 'INVESTISSEMENT_DEVELOPPEMENT'],
    label: 'Résilience, adaptation aux chocs & modernisation'
  },
  rinascita: {
    primaryNeeds: ['SINISTRE_CATASTROPHE'],
    label: 'Reconstruction après sinistre majeur ou catastrophe'
  },
  ribumba: {
    primaryNeeds: ['RESTRUCTURATION_REBOND'],
    label: 'Rebond & restructuration d’entreprise en difficulté'
  },
  impresi_paisani: {
    primaryNeeds: ['RURALITE_PROXIMITE'],
    label: 'Commerce, artisanat et services en territoire rural ou de montagne'
  },
  riesce: {
    primaryNeeds: ['EMPLOI_RSE'],
    label: 'Création d’emplois durables, recrutement et démarche RSE sociale'
  },
  pattu_innuvazione_amorcage: {
    primaryNeeds: ['INNOVATION_AMORCAGE'],
    label: 'Innovation – Phase Amorçage, faisabilité et prototypage'
  },
  pattu_innuvazione_developpement: {
    primaryNeeds: ['INNOVATION_DEVELOPPEMENT'],
    label: 'Innovation – Phase Développement & programmes R&D'
  },
  pattu_innuvazione_rd_structurant: {
    primaryNeeds: ['INNOVATION_RD_STRUCTURANT'],
    label: 'R&D privée structurante pour filière ou infrastructures de recherche'
  },
  impresa_si_creation: {
    primaryNeeds: ['CREATION_ENTREPRISE'],
    label: 'Création d’entreprise structurante (≤ 5 ans d’existence)'
  },
  impresa_si_developpement_invest: {
    primaryNeeds: ['INVESTISSEMENT_DEVELOPPEMENT'],
    label: 'Investissement productif PME, modernisation & véhicules propres'
  },
  impresa_si_developpement_structurant: {
    primaryNeeds: ['INVESTISSEMENT_STRUCTURANT'],
    label: 'Investissements structurants à forte plus-value territoriale'
  },
  impresa_si_reprise_transmission: {
    primaryNeeds: ['REPRISE_TRANSMISSION'],
    label: 'Reprise d’entreprise (rachat de fonds de commerce ou parts sociales)'
  },
  sviluppu_suciale: {
    primaryNeeds: ['ESS_SOLIDARITE'],
    label: 'Économie Sociale et Solidaire (ESS) & utilité sociale'
  },
  impresamondu_individuel: {
    primaryNeeds: ['INTERNATIONAL_EXPORT'],
    label: 'Développement international – Actions individuelles, salons et prospection'
  },
  impresamondu_stage: {
    primaryNeeds: ['INTERNATIONAL_EXPORT'],
    label: 'Stage en entreprise à l’internationalisation (forfait territorial)'
  },
  impresamondu_collectif: {
    primaryNeeds: ['INTERNATIONAL_EXPORT'],
    label: 'Développement international – Pavillons et actions collectives à l’export'
  }
};

/**
 * Moteur décisionnel principal : Évalue l'ensemble des critères d'éligibilité,
 * les exclusions réglementaires, l'évaluation qualitative et simule les montants.
 */
export function evaluateCompanyEligibility(
  state: FullQuestionnaireState,
  schemes: DispositifScheme[]
): ComprehensiveEvaluationReport {
  const { company, regulatory, qualitative, financials } = state;

  // Détection officielle de l'éligibilité au Fonds SALVEZZA (230 communes sous contrainte)
  // Utilise prioritairement le code commune officiel présent dans la liste fournie et le JSON de l'API
  const cleanCommuneCode = (company.communeCode || '').trim().toUpperCase().replace(/\s+/g, '');
  let salvezzaCommune: SalvezzaCommune | undefined = company.salvezzaCommune;
  if (!salvezzaCommune) {
    if (cleanCommuneCode) {
      salvezzaCommune = findSalvezzaCommuneByCode(cleanCommuneCode);
    } else if (company.communeName || company.city) {
      salvezzaCommune = findSalvezzaCommuneByName(company.communeName || company.city || '');
    }
  }

  // Si l'entreprise est en commune SALVEZZA, le critère territorial Q4 est validé de plein droit
  const effectiveQualitative = {
    ...qualitative,
    q4_ruralOrQpvZone: salvezzaCommune ? true : qualitative.q4_ruralOrQpvZone
  };

  const qualScore = computeQualitativeScore(effectiveQualitative);
  const qualValidated = qualScore >= 3;
  const computedSize = determineCompanySize(company.headcount, company.annualRevenue, company.balanceSheetTotal);
  const deMinimisLimit = 300000;
  const deMinimisRemaining = Math.max(0, deMinimisLimit - (regulatory.deMinimisPast3Years || 0));

  const dossierAapSchemeId = state.dossierSource?.primarySchemeId;

  const eligibleSchemes: EvaluationResultItem[] = [];
  const conditionalSchemes: EvaluationResultItem[] = [];
  const ineligibleSchemes: EvaluationResultItem[] = [];

  for (const scheme of schemes) {
    if (!scheme.isActive) continue;

    const ineligibilityMotifs: string[] = [];
    const reasons: string[] = [];
    const warningNotes: string[] = [];

    // =========================================================================
    // 1. CONTRÔLE D'IMPLANTATION GÉOGRAPHIQUE INSULAIRE (Art. L. 4424-34 CGCT)
    // =========================================================================
    if (!company.isEstablishedInCorsica) {
      ineligibilityMotifs.push('Entreprise non établie en Corse (siège social ou établissement secondaire réel obligatoire en Corse).');
    } else {
      reasons.push('Établissement légalement implanté en Corse.');
    }

    if (!company.hasMainExploitationInCorsica) {
      ineligibilityMotifs.push('L’exploitation principale de l’entreprise n’est pas située en Corse.');
    } else {
      reasons.push('Activité économique et exploitation principale effectives sur le territoire insulaire.');
    }

    // =========================================================================
    // 2. CONTRÔLE DU DIMENSIONNEMENT D'ENTREPRISE (DÉFINITION PME EUROPÉENNE)
    // =========================================================================
    if (computedSize === 'GRANDE') {
      ineligibilityMotifs.push('Les Grandes Entreprises (≥ 250 salariés ou CA > 50 M€ et bilan > 43 M€) sont formellement exclues des régimes d’aides directes de ce guide ADEC.');
    } else if (!scheme.allowedSizes.includes(computedSize)) {
      ineligibilityMotifs.push(`Taille d’entreprise (${computedSize}) non éligible pour cette mesure réservée aux : ${scheme.allowedSizes.join(', ')}.`);
    } else {
      reasons.push(`Catégorie d’entreprise ${computedSize} conforme aux critères d’éligibilité de la mesure.`);
    }

    // =========================================================================
    // 3. CONTRÔLE DE FORME JURIDIQUE & STATUT
    // =========================================================================
    if (company.legalForm === 'MICRO_ENTREPRISE') {
      ineligibilityMotifs.push('Le régime unifié et simplifié des micro-entreprises (auto-entrepreneurs) est formellement exclu de l’ensemble des dispositifs d’aides directes de l’ADEC (cf. délibération N° 21/177 AC).');
    }
    if (company.legalForm === 'SCI') {
      ineligibilityMotifs.push('Les Sociétés Civiles Immobilières (SCI) et sociétés à objet patrimonial ou immobilier pur sont formellement exclues.');
    }
    if (scheme.excludedLegalForms && scheme.excludedLegalForms.includes(company.legalForm)) {
      ineligibilityMotifs.push(`La forme juridique (${company.legalForm}) fait partie des exclusions expresses de ce dispositif.`);
    }

    // =========================================================================
    // 4. CONTRÔLE DE SECTEUR D'ACTIVITÉ & EXCLUSIONS SECTORIELLES
    // =========================================================================
    if (company.sector === 'AGRICULTURE_PECHE_SYLVICULTURE') {
      ineligibilityMotifs.push('Secteur primaire (agriculture, pêche, aquaculture, sylviculture) exclu du champ de l’ADEC (relève des compétences spécifiques de l’ODARC).');
    }
    if (company.sector === 'HEBERGEMENT_TOURISTIQUE') {
      ineligibilityMotifs.push('Secteur de l’hébergement touristique exclu des régimes d’aides de l’ADEC (relève des dispositifs spécifiques de l’Agence du Tourisme de la Corse - ATC).');
    }
    if (company.sector === 'FINANCE_IMMOBILIER') {
      ineligibilityMotifs.push('Activités financières, bancaires, d’assurance ou de promotion immobilière exclues de l’intervention économique directe.');
    }
    if (scheme.excludedSectors.includes(company.sector)) {
      ineligibilityMotifs.push(`Le secteur d’activité déclaré (${company.sector}) est exclu des bénéficiaires de cette mesure.`);
    }
    if (!scheme.allowedSectors.includes(company.sector)) {
      ineligibilityMotifs.push(`Le secteur (${company.sector}) ne figure pas parmi les secteurs ciblés (${scheme.allowedSectors.join(', ')}).`);
    }

    // =========================================================================
    // 5. CONTRÔLES FISCAUX, SOCIAUX, JURIDIQUES & LITIGES ANTÉRIEURS ADEC
    // =========================================================================
    if (!regulatory.isUpToDateTaxSocial && !regulatory.hasValidDebtRepaymentPlan) {
      ineligibilityMotifs.push('Entreprise non à jour de ses cotisations fiscales (DGFIP) et sociales (URSSAF) et sans plan d’étalement ou d’apurement en cours et respecté.');
    }
    if (regulatory.isInInsolvencyOrBankruptcy) {
      ineligibilityMotifs.push('Procédure collective en cours (liquidation judiciaire, cessation de paiement sans plan de continuation d’activité validé).');
    }
    if (regulatory.hasPriorAdecUnfulfilledObligations) {
      ineligibilityMotifs.push('Non-respect d’obligations de contrôle de service fait (CSF) ou défaut de transmission de pièces justificatives sur une aide ADEC antérieure.');
    }
    if (regulatory.hasAdecPriorBreachOfContract) {
      ineligibilityMotifs.push('Non-respect des obligations résultant d’une convention antérieure ou d’un arrêté attributif conclu avec l’ADEC.');
    }
    if (regulatory.hasPendingPublicRecoveryOrder) {
      ineligibilityMotifs.push('Ordre de recouvrement d’une aide publique devenu exécutoire et définitif non régularisé.');
    }

    // =========================================================================
    // 6. ADÉQUATION DU PROJET & BESOINS SPÉCIFIQUES (ÉTAPE 3)
    // =========================================================================
    const userNeeds = financials.selectedNeedCategories || [];
    const schemeTarget = SCHEME_TARGET_NEEDS[scheme.id];

    if (userNeeds.length > 0) {
      if (schemeTarget) {
        const hasMatchingNeed = schemeTarget.primaryNeeds.some((need) => userNeeds.includes(need));
        if (!hasMatchingNeed) {
          ineligibilityMotifs.push(
            `Ce dispositif cible l'axe « ${schemeTarget.label} », qui ne figure pas parmi les besoins prioritaires sélectionnés en Étape 3 (Typologie du projet).`
          );
        } else {
          reasons.push(`Adéquation projet validée : aligné avec le besoin prioritaire « ${schemeTarget.label} » sélectionné en Étape 3.`);
        }
      } else {
        // Dispositif personnalisé ou additionnel issu de la base documentaire
        if (userNeeds.includes(scheme.id)) {
          reasons.push(`Adéquation projet validée : dispositif personnalisé « ${scheme.name} » (${scheme.code}) expressément sélectionné en Étape 3.`);
        } else {
          reasons.push(`Dispositif issu de la base documentaire analysé pour votre profil d’entreprise.`);
        }
      }
    }

    // =========================================================================
    // 7. CONTRÔLES RÈGLEMENTAIRES SPÉCIFIQUES PAR MESURE
    // =========================================================================

    // A. ENTREPRISE EN DIFFICULTÉ UE (Art. 2 point 18 Règl. UE 651/2014)
    if (regulatory.isCompanyInDifficultyEU) {
      if (scheme.id === 'ribumba') {
        reasons.push('Qualification d’entreprise en difficulté au sens de l’art. 2 point 18 du Règl. UE 651/2014 établie : accès prioritaire à la mesure Ribumbà.');
        if (regulatory.hasBenefitedRescueAidPast10Years) {
          ineligibilityMotifs.push('Principe de non-récurrence enfreint : une aide au sauvetage ou à la restructuration a déjà été perçue au cours des 10 dernières années.');
        }
        if (regulatory.hasExecutiveFraudHistory) {
          ineligibilityMotifs.push('Exclusion formelle : difficultés consécutives à une manœuvre frauduleuse du dirigeant.');
        }
        if (regulatory.hasOutgoingDividendsDuringDistress) {
          ineligibilityMotifs.push('Exclusion formelle : des sorties de trésorerie vers les détenteurs de fonds propres (dividendes) ont été constatées durant la phase de difficultés.');
        }
        const minContrib = computedSize === 'PE' || computedSize === 'TPE' ? '25 %' : '40 %';
        warningNotes.push(
          `Règle d’or Ribumbà : L’aide ne peut en aucun cas financer le passif public (dettes fiscales et sociales), les dettes fournisseurs ou contentieux bancaires. Une contribution propre d'au moins ${minContrib} et un plan de redressement validé par un expert-comptable sont obligatoires.`
        );
      } else if (scheme.id !== 'rinascita') {
        ineligibilityMotifs.push(
          'Entreprise en situation de difficulté avérée au sens européen (Règl. UE 651/2014). Ces entreprises sont formellement exclues des aides de droit commun et relèvent spécifiquement de la mesure Ribumbà.'
        );
      }
    } else {
      // Entreprise non en difficulté
      if (scheme.id === 'ribumba') {
        ineligibilityMotifs.push(
          'La mesure Ribumbà est strictement réservée aux entreprises répondant à la qualification d’entreprise en difficulté (art. 2 point 18 du Règl. UE 651/2014). Votre entreprise n’étant pas en difficulté financière, elle relève des dispositifs de développement ou de résilience.'
        );
      }
    }

    // B. RINASCITA (Sinistres majeurs)
    if (scheme.id === 'rinascita') {
      const hasSinistreNeed = userNeeds.includes('SINISTRE_CATASTROPHE');
      if (!hasSinistreNeed) {
        ineligibilityMotifs.push('La mesure Rinascita nécessite la survenue d’un sinistre majeur (incendie, inondation, tempête, catastrophe naturelle, accident industriel, acte accidentel ou criminel).');
      } else {
        reasons.push('Sinistre majeur déclaré : prise en charge des dépenses de reconstruction et de relance d’activité.');
        const insuranceDeduction = financials.insuranceCompensationAmount || 0;
        warningNotes.push(
          `Conformément au point 11 du règlement Rinascita, les dépenses éligibles sont strictement nettes de toute indemnisation d’assurance versée ou à percevoir (déduction de ${insuranceDeduction.toLocaleString('fr-FR')} € appliquée pour éviter toute surcompensation).`
        );
      }
    }

    // C. IMPRESI PAISANI (Territoires ruraux et de montagne)
    if (scheme.id === 'impresi_paisani') {
      const isRuralSalvezza =
        Boolean(salvezzaCommune) ||
        company.locationType === 'RURAL_SALVEZZA_UNDER_1000' ||
        company.locationType === 'POLE_RURAL_STRUCTURANT';

      if (!isRuralSalvezza) {
        ineligibilityMotifs.push(
          `Implantation géographique inéligible : Ce dispositif est réservé aux entreprises implantées dans les territoires ruraux ou de montagne (zonage SALVEZZA, communes < 1 000 habitants ou bassins intérieurs structurants). Votre implantation actuelle est : ${company.locationType}.`
        );
      } else {
        if (salvezzaCommune) {
          reasons.push(
            `Commune officielle du Fonds SALVEZZA : ${salvezzaCommune.nom} (« ${salvezzaCommune.nomCorse} », code ${salvezzaCommune.codeCommune}, score ${salvezzaCommune.scoreContrainte}${salvezzaCommune.altitudeSup350m ? ' · Chef-lieu > 350 m' : ''}). Éligibilité pleine et entière à la mesure Impresi Paisani.`
          );
        } else {
          reasons.push('Implantation en zone rurale ou de montagne (zonage SALVEZZA / bassin intérieur) validée.');
        }
      }

      if (company.isSeasonalActivity) {
        ineligibilityMotifs.push('Exclusion stricte : Les activités saisonnières (exerçant moins de 8 mois par an) sont formellement exclues de la mesure Impresi Paisani.');
      } else {
        reasons.push('Activité permanente à l’année (non saisonnière) confirmée.');
      }
    }

    // D. IMPRESA SÌ – PHASE CRÉATION STRUCTURANTE (GDA-03A)
    if (scheme.id === 'impresa_si_creation') {
      // Réservé aux Petites Entreprises (< 50 salariés)
      if (computedSize === 'PME') {
        ineligibilityMotifs.push('La phase Création d’Impresa Sì est strictement réservée aux Petites Entreprises (TPE et PE de moins de 50 personnes). Les PME moyennes relèvent de la phase Développement.');
      }

      const ageInfo = analyzeCompanyCreationDate(company.creationDate);
      if (!ageInfo.isDateKnown) {
        ineligibilityMotifs.push('Date d’immatriculation non renseignée : l’accès au volet Création exige de renseigner la date d’immatriculation officielle (≤ 5 ans requise, justificatif Kbis).');
      } else if (!ageInfo.isUnderFiveYears) {
        ineligibilityMotifs.push(
          `Entreprise immatriculée le ${ageInfo.dateFormattedFr} (${ageInfo.ageLabel} d’existence) : le volet Création est strictement limité aux entreprises de 5 ans d’ancienneté au maximum. Pour votre entreprise, le volet « IMPRESA SÌ – Phase Développement » est la mesure adaptée.`
        );
      } else {
        reasons.push(`Ancienneté d’entreprise de ${ageInfo.ageLabel} conforme au volet Création (≤ 5 ans).`);
      }

      if (company.hasDistributedProfits) {
        ineligibilityMotifs.push('L’entreprise ne doit pas encore avoir distribué de bénéfices (dividendes).');
      }
      if (company.isFromMergerOrConcentration) {
        ineligibilityMotifs.push('L’entreprise ne doit pas être issue d’une concentration ou fusion.');
      }
      if (company.isFranchiseOrAffiliate) {
        ineligibilityMotifs.push('Entreprise affiliée à un réseau de franchise ou à une enseigne (exclusion formelle du dispositif Impresa Sì).');
      }
    }

    // E. IMPRESA SÌ – PHASE DÉVELOPPEMENT INVESTISSEMENTS PME & VÉHICULES PROPRES (GDA-03B)
    if (scheme.id === 'impresa_si_developpement_invest') {
      if (company.isFranchiseOrAffiliate) {
        ineligibilityMotifs.push('Entreprise affiliée à un réseau de franchise ou à une enseigne (exclusion formelle du dispositif Impresa Sì).');
      }
    }

    // F. IMPRESA SÌ – PHASE DÉVELOPPEMENT STRUCTURANT (GDA-03C)
    if (scheme.id === 'impresa_si_developpement_structurant') {
      if (company.isFranchiseOrAffiliate) {
        ineligibilityMotifs.push('Entreprise affiliée à un réseau de franchise ou à une enseigne (exclusion formelle du dispositif Impresa Sì).');
      }
    }

    // G. IMPRESA SÌ – REPRISE-TRANSMISSION (GDA-03D)
    if (scheme.id === 'impresa_si_reprise_transmission') {
      const ageInfo = analyzeCompanyCreationDate(company.creationDate);
      if (!ageInfo.isDateKnown) {
        ineligibilityMotifs.push('Date d’immatriculation de l’entreprise cible non renseignée : l’opération de reprise exige une entreprise immatriculée depuis au moins 12 mois (justificatif Kbis).');
      } else if (ageInfo.registeredSinceAtLeast12Months === false) {
        ineligibilityMotifs.push(
          `L’entreprise cible reprise doit être immatriculée depuis au moins 12 mois (date d’immatriculation : ${ageInfo.dateFormattedFr}, soit seulement ${ageInfo.ageInMonths} mois d’existence).`
        );
      } else {
        reasons.push('Entreprise cible en activité depuis au moins 12 mois validée.');
      }

      if (!financials.hasBankPartnerCommitted) {
        warningNotes.push('Condition suspensive : L’aide est subordonnée à l’intervention obligatoire d’au moins un partenaire bancaire ou d’un outil financier territorial dans le montage financier.');
      }
      reasons.push('Obligation ferme de maintien et de non-cession de l’activité reprise pendant au moins 5 ans.');
    }

    // H. U PATTU INNUVAZIONE – PHASE AMORÇAGE (GDA-02A)
    if (scheme.id === 'pattu_innuvazione_amorcage') {
      if (computedSize === 'PME') {
        ineligibilityMotifs.push('La phase Amorçage est strictement réservée aux Petites Entreprises (TPE et PE de moins de 50 personnes). Les PME moyennes relèvent de la phase Développement.');
      }
    }

    // I. SVILUPPU SUCIALE È SULIDARITÀ (GDA-04)
    if (scheme.id === 'sviluppu_suciale') {
      const isEss =
        company.legalForm === 'ASSOCIATION_ESS' ||
        company.legalForm === 'SIAE' ||
        company.sector === 'ESS';

      if (!isEss) {
        ineligibilityMotifs.push(
          'Ce dispositif est exclusivement réservé aux structures juridiques de l’Économie Sociale et Solidaire (Loi du 31 juillet 2014, art. 1 : associations employeuses, SIAE, fondations). Les sociétés commerciales coopératives (SCOP/SCIC) relèvent du dispositif Impresa Sì.'
        );
      } else {
        reasons.push('Statut de structure de l’Économie Sociale et Solidaire (ESS) confirmé.');
      }
    }

    // J. U PATTU IMPRESAMONDU – STAGE EXPORT (GDA-05B)
    if (scheme.id === 'impresamondu_stage') {
      warningNotes.push('Rappel réglementaire : L’indemnité nette de stage versée par l’entreprise doit être au minimum de 800 € nets par mois. L’enveloppe territoriale est contingentée à 6 stages par an pour toute la Corse.');
    }

    // =========================================================================
    // 8. ÉVALUATION QUALITATIVE PRÉALABLE (DÉLIBÉRATION N° 21/177 AC)
    // =========================================================================
    let qualitativeBlocksEligibility = false;
    if (scheme.requiresQualitativeEvaluation) {
      if (!qualValidated) {
        qualitativeBlocksEligibility = true;
        warningNotes.push(
          `Évaluation qualitative préalable requise : Actuellement ${qualScore}/8 critères « OUI » validés. Le seuil réglementaire minimal de 3 « OUI » sur 8 est requis pour que l’ADEC puisse engager une instruction financière (Délibération N° 21/177 AC). Il vous manque ${3 - qualScore} critère(s) favorable(s).`
        );
      } else {
        reasons.push(`Évaluation qualitative validée avec succès (${qualScore}/8 critères « OUI », seuil réglementaire de 3 atteint conformément à la délibération 21/177 AC).`);
      }
    } else {
      reasons.push('Dispositif formellement non soumis à l’évaluation qualitative préalable (Annexe 1 - U Pattu Risilienza è Territorii, Délibération N° 21/177 AC). Instruction financière directe sans exigence de seuil.');
    }

    // =========================================================================
    // 9. SIMULATION FINANCIÈRE DU MONTANT ET DU TAUX D'AIDE
    // =========================================================================
    let applicableRatePercent = 0;
    let estimatedSubsidyAmount = 0;
    let subsidyCalculationDetails = '';

    if (scheme.rates) {
      // Détermination du taux d'intensité en pourcentage
      if (computedSize === 'TPE' && scheme.rates.tpeMaxRate) {
        applicableRatePercent = scheme.rates.tpeMaxRate * 100;
      } else if (computedSize === 'PE' && scheme.rates.peMaxRate) {
        applicableRatePercent = scheme.rates.peMaxRate * 100;
      } else if (computedSize === 'PME' && scheme.rates.pmeMaxRate) {
        applicableRatePercent = scheme.rates.pmeMaxRate * 100;
      }

      // Cas 1 : RIESCE (Forfait par emploi créé + démarche RSE)
      if (scheme.id === 'riesce') {
        const minFlat = scheme.rates.flatAmount?.min || 5000;
        const maxFlat = scheme.rates.flatAmount?.max || 11000;
        estimatedSubsidyAmount = (minFlat + maxFlat) / 2;
        subsidyCalculationDetails = `Subvention forfaitaire de ${minFlat.toLocaleString('fr-FR')} € à ${maxFlat.toLocaleString('fr-FR')} € par poste créé selon scoring RSE (majoration possible jusqu’à +10 000 € pour retour des talents insulaires).`;
      }
      // Cas 2 : IMPRESAMONDU STAGE EXPORT (Forfait fixe annuel de 6 000 €)
      else if (scheme.id === 'impresamondu_stage') {
        estimatedSubsidyAmount = 6000;
        subsidyCalculationDetails = 'Forfait fixe réglementaire de 6 000 € par an pour l’accueil d’un stagiaire export issu d’une formation territoriale corse (gratification nette ≥ 800 €/mois).';
      }
      // Cas 3 : IMPRESA SÌ DÉVELOPPEMENT INVESTISSEMENTS & VÉHICULES PROPRES
      else if (scheme.id === 'impresa_si_developpement_invest') {
        const stdRate = computedSize === 'TPE' ? 0.50 : 0.30;
        applicableRatePercent = stdRate * 100;

        let calculatedSum = 0;
        const generalBudget = financials.totalEstimatedBudgetHT || 0;
        calculatedSum += generalBudget * stdRate;

        // Bonus véhicule propre éventuel
        if (financials.eligibleExpensesBreakdown?.cleanVehicles) {
          const veh = financials.eligibleExpensesBreakdown.cleanVehicles;
          let vehSub = veh.costHT * 0.15;
          let cap = 3000;
          if (veh.type === 'FOURGON') cap = 7000;
          if (veh.type === 'POIDS_LOURD') cap = 10000;
          vehSub = Math.min(vehSub, cap);
          calculatedSum += vehSub;
          warningNotes.push(`Aide véhicule propre calculée à 15 % HT plafonnée à ${cap.toLocaleString('fr-FR')} € (certificat de mise au rebut de l’ancien véhicule requis).`);
        }

        estimatedSubsidyAmount = Math.min(calculatedSum, scheme.rates.ceilingAmount);
        subsidyCalculationDetails = `Taux d’aide de ${applicableRatePercent} % appliqué sur l’assiette éligible hors taxes (plafond maximal de minimis : 300 000 €).`;
      }
      // Cas 4 : RINASCITA (Déduction stricte des assurances)
      else if (scheme.id === 'rinascita') {
        const netBudget = Math.max(0, (financials.totalEstimatedBudgetHT || 0) - (financials.insuranceCompensationAmount || 0));
        const rate = (applicableRatePercent || 50) / 100;
        estimatedSubsidyAmount = Math.min(netBudget * rate, scheme.rates.ceilingAmount);
        subsidyCalculationDetails = `Taux de ${applicableRatePercent} % appliqué sur l’assiette nette des indemnisations d’assurance (${(financials.insuranceCompensationAmount || 0).toLocaleString('fr-FR')} € déduits pour absence de surcompensation).`;
      }
      // Cas 5 : RIBUMBÀ (Restructuration entreprises fragilisées)
      else if (scheme.id === 'ribumba') {
        const rate = computedSize === 'PE' || computedSize === 'TPE' ? 0.75 : 0.60;
        applicableRatePercent = rate * 100;
        estimatedSubsidyAmount = Math.min((financials.totalEstimatedBudgetHT || 0) * rate, scheme.rates.ceilingAmount);
        const ownContribMinPercent = computedSize === 'PE' || computedSize === 'TPE' ? 25 : 40;
        subsidyCalculationDetails = `Taux de subvention jusqu’à ${applicableRatePercent} % du plan de restructuration. Contribution propre obligatoire d’au moins ${ownContribMinPercent} % (concours bancaire ou compte courant bloqué).`;
      }
      // Cas 6 : INNUVAZIONE AMORÇAGE (Plafond strict 15 000 €)
      else if (scheme.id === 'pattu_innuvazione_amorcage') {
        const rate = (applicableRatePercent || 70) / 100;
        const rawAmount = (financials.totalEstimatedBudgetHT || 0) * rate;
        estimatedSubsidyAmount = Math.min(rawAmount, 15000);
        subsidyCalculationDetails = `Taux d'aide de ${applicableRatePercent} % plafonné à 15 000 € de subvention maximale pour la phase d'amorçage.`;
      }
      // Cas 7 : Cas général au taux d'intensité standard
      else {
        const rate = (applicableRatePercent || 50) / 100;
        const rawAmount = (financials.totalEstimatedBudgetHT || 0) * rate;
        estimatedSubsidyAmount = Math.min(rawAmount, scheme.rates.ceilingAmount);
        subsidyCalculationDetails = `Intensité maximale de ${applicableRatePercent} % appliquée sur les dépenses éligibles HT. Plancher d’intervention : ${scheme.rates.floorAmount.toLocaleString('fr-FR')} €. Plafond : ${scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €.`;
      }
    }

    // Plafond De Minimis (300 000 € sur 3 ans glissants)
    if (scheme.legalBasis.includes('de minimis')) {
      if (estimatedSubsidyAmount > deMinimisRemaining) {
        warningNotes.push(
          `Attention : Le plafond de minimis restant disponible pour votre entreprise est de ${deMinimisRemaining.toLocaleString('fr-FR')} € (sur les 300 000 € autorisés sur 3 ans glissants). Le montant accordé sera écrêté à cette limite.`
        );
        estimatedSubsidyAmount = Math.min(estimatedSubsidyAmount, deMinimisRemaining);
      }
    }

    // Seuil plancher d'intervention (5 000 €)
    if (estimatedSubsidyAmount > 0 && estimatedSubsidyAmount < (scheme.rates?.floorAmount || 5000)) {
      warningNotes.push(
        `Le montant prévisionnel calculé (${Math.round(estimatedSubsidyAmount).toLocaleString('fr-FR')} €) est inférieur au seuil plancher d’intervention de l’ADEC (${(scheme.rates?.floorAmount || 5000).toLocaleString('fr-FR')} €). Les dépenses éligibles présentées devront atteindre le seuil minimal requis pour être recevables.`
      );
    }

    // Application des bonifications officielles du Fonds SALVEZZA
    let salvezzaBonusApplied = false;
    let salvezzaBonusDetails: string | undefined = undefined;

    if (salvezzaCommune) {
      if (scheme.id === 'riesce') {
        salvezzaBonusApplied = true;
        salvezzaBonusDetails = `Bonification Volet Emploi SALVEZZA : Majoration de l'aide forfaitaire à la création/maintien d'emplois durables à ${salvezzaCommune.nom} (« ${salvezzaCommune.nomCorse} », score ${salvezzaCommune.scoreContrainte}).`;
        reasons.push(salvezzaBonusDetails);
      } else if (
        [
          'impresi_paisani',
          'risilienza',
          'impresa_si_creation',
          'impresa_si_developpement_invest',
          'impresa_si_developpement_structurant',
          'impresa_si_reprise_transmission'
        ].includes(scheme.id)
      ) {
        salvezzaBonusApplied = true;
        salvezzaBonusDetails = `Bonification Volet Économique SALVEZZA : Priorité d'instruction et bonification de taux au titre de l'implantation à ${salvezzaCommune.nom} (score de contrainte : ${salvezzaCommune.scoreContrainte}${salvezzaCommune.altitudeSup350m ? ' · Chef-lieu > 350 m' : ''}).`;
        reasons.push(salvezzaBonusDetails);
      }
    }

    // =========================================================================
    // 10. CLASSIFICATION FINALE DE L'ÉLIGIBILITÉ
    // =========================================================================
    const isQualOk = !scheme.requiresQualitativeEvaluation || qualValidated;
    const isPrimaryFromDossierAAP = Boolean(dossierAapSchemeId && scheme.id === dossierAapSchemeId);

    if (isPrimaryFromDossierAAP) {
      reasons.unshift(`★ DISPOSITIF RETENU PAR VOTRE FICHE PROJET (Section Appel à projet : ${state.dossierSource?.aapTitre || scheme.name})`);
    }

    const itemResult: EvaluationResultItem = {
      scheme,
      isEligible: ineligibilityMotifs.length === 0 && !qualitativeBlocksEligibility,
      isConditionallyEligible: ineligibilityMotifs.length === 0 && qualitativeBlocksEligibility,
      matchScore: isPrimaryFromDossierAAP ? 100 : (ineligibilityMotifs.length === 0 ? (isQualOk ? 100 : 75) : Math.max(10, 60 - ineligibilityMotifs.length * 15)),
      reasons,
      ineligibilityMotifs,
      qualitativeScore: qualScore,
      meetsQualitativeThreshold: isQualOk,
      estimatedSubsidyAmount: Math.round(estimatedSubsidyAmount),
      applicableRatePercent,
      subsidyCalculationDetails,
      warningNotes,
      salvezzaBonusApplied,
      salvezzaBonusDetails,
      isPrimaryFromDossierAAP
    };

    if (itemResult.isEligible) {
      eligibleSchemes.push(itemResult);
    } else if (itemResult.isConditionallyEligible) {
      conditionalSchemes.push(itemResult);
    } else {
      ineligibleSchemes.push(itemResult);
    }
  }

  // Tri : Placer prioritairement le dispositif issu de l'Appel à projet (Fiche Projet), puis par montant décroissant
  eligibleSchemes.sort((a, b) => {
    if (a.isPrimaryFromDossierAAP && !b.isPrimaryFromDossierAAP) return -1;
    if (!a.isPrimaryFromDossierAAP && b.isPrimaryFromDossierAAP) return 1;
    return b.estimatedSubsidyAmount - a.estimatedSubsidyAmount;
  });

  conditionalSchemes.sort((a, b) => {
    if (a.isPrimaryFromDossierAAP && !b.isPrimaryFromDossierAAP) return -1;
    if (!a.isPrimaryFromDossierAAP && b.isPrimaryFromDossierAAP) return 1;
    return b.estimatedSubsidyAmount - a.estimatedSubsidyAmount;
  });

  // Synthèse globale personnalisée
  let overallDiagnosisSummary = '';
  if (state.dossierSource?.aapTitre) {
    overallDiagnosisSummary = `Diagnostic synchronisé avec votre Fiche Projet (${state.dossierSource.dossierNumber || 'Dossier ADEC'}). Le dispositif prioritaire identifié dans l'Appel à projet (« ${state.dossierSource.primarySchemeName || state.dossierSource.aapTitre} ») a été analysé et retenu, accompagné de ${eligibleSchemes.length - 1} intervention(s) complémentaire(s) éligible(s).`;
  } else if (eligibleSchemes.length > 0) {
    overallDiagnosisSummary = `Votre entreprise est éligible à ${eligibleSchemes.length} dispositif(s) d’accompagnement officiel(s) de l’ADEC, pour un potentiel estimé d’aide publique de ${eligibleSchemes.reduce((acc, curr) => acc + curr.estimatedSubsidyAmount, 0).toLocaleString('fr-FR')} € (dans le respect des règles de non-cumul et du plafond de minimis de 300 000 €).`;
  } else if (conditionalSchemes.length > 0) {
    overallDiagnosisSummary = `Votre entreprise remplit l’ensemble des conditions administratives pour ${conditionalSchemes.length} dispositif(s), mais nécessite de valider au moins 3 critères « OUI » à l’évaluation qualitative préalable (Délibération N° 21/177 AC).`;
  } else {
    overallDiagnosisSummary = 'Aucun dispositif ADEC ne correspond actuellement à votre situation au vu des critères d’inéligibilité stricts rencontrés (forme juridique, secteur exclu, litiges antérieurs ou absence de besoin sélectionné).';
  }

  if (salvezzaCommune) {
    overallDiagnosisSummary += ` Établissement implanté à ${salvezzaCommune.nom} (« ${salvezzaCommune.nomCorse} », dép. ${salvezzaCommune.departement}) : votre dossier bénéficie des bonifications officielles Volets « Économique » et « Emploi » du Fonds SALVEZZA (230 communes éligibles sous contrainte).`;
  }

  const actionPlan: string[] = [
    'Consulter les fiches détaillées des mesures recommandées ci-dessous et leurs dispositions réglementaires.',
    'Vérifier impérativement que les devis et dépenses projetées ne sont pas engagés avant le dépôt officiel sur le site de l’ADEC.',
    'Constituer le dossier de candidature complet avec plan de financement et attestation de minimis.'
  ];

  if (salvezzaCommune) {
    actionPlan.push(
      `Faire valoir l'attestation d'implantation en commune SALVEZZA (${salvezzaCommune.nom} - Score ${salvezzaCommune.scoreContrainte}) pour activer les bonifications de taux et de forfait emploi.`
    );
  }

  actionPlan.push('Déposer la demande en ligne directement sur le téléservice de l’ADEC (https://www.adec.corsica).');

  return {
    timestamp: new Date().toISOString(),
    companyName: company.name || 'Entreprise candidate',
    totalRecommendedSchemes: eligibleSchemes.length,
    eligibleSchemes,
    conditionalSchemes,
    ineligibleSchemes,
    qualitativeTotalYes: qualScore,
    qualitativeValidated: qualValidated,
    deMinimisAvailableRemaining: deMinimisRemaining,
    overallDiagnosisSummary,
    suggestedActionPlan: actionPlan,
    isSalvezzaEligibleCommune: Boolean(salvezzaCommune),
    salvezzaCommune: salvezzaCommune || undefined,
    dossierSource: state.dossierSource ? {
      dossierNumber: state.dossierSource.dossierNumber,
      sourceDocumentName: state.dossierSource.sourceDocumentName,
      aapTitre: state.dossierSource.aapTitre,
      primarySchemeId: state.dossierSource.primarySchemeId,
      primarySchemeName: state.dossierSource.primarySchemeName
    } : undefined
  };
}
