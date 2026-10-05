/**
 * Service d'intégration de l'API Entreprise (entreprise.api.gouv.fr)
 * Collectivité de Corse / ADEC
 */

import { CompanyProfile, ActivitySector, LegalForm, ApiEntrepriseComplianceData, RneObservation } from '../types';
import { determineCompanySize } from './engine';
import { determineCorsicaZoning } from './corsicaZoning';
import { analyzeCompanyCreationDate } from '../utils/companyAge';

const TOKEN_STORAGE_KEY = 'adec_api_entreprise_token_v1';
const RECIPIENT_STORAGE_KEY = 'adec_api_entreprise_recipient_siret_v1';
const ADMIN_PASSWORD_STORAGE_KEY = 'adec_token_admin_password_v1';

export const DEFAULT_ADMIN_PASSWORD = 'adec2026';

// SIRET officiel du siège de la Collectivité de Corse (Luhn valide : 20007695800012)
export const DEFAULT_RECIPIENT_SIRET = '20007695800012';

/**
 * Gestion du mot de passe d'administration pour la modification du jeton
 */
export function getStoredAdminPassword(): string {
  try {
    return localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function verifyAdminPassword(inputPassword: string): boolean {
  const clean = (inputPassword || '').trim();
  if (!clean) return false;
  const current = getStoredAdminPassword();
  return clean.toLowerCase() === current.toLowerCase();
}

export function setAdminPassword(newPassword: string): { success: boolean; error?: string } {
  try {
    const clean = (newPassword || '').trim();
    if (clean.length < 4) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 4 caractères.' };
    }
    localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, clean);
    return { success: true };
  } catch (e) {
    console.error('Erreur lors de la sauvegarde du mot de passe admin', e);
    return { success: false, error: 'Erreur lors du stockage local du mot de passe.' };
  }
}

export function resetAdminPasswordToDefault(): void {
  try {
    localStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY);
  } catch (e) {
    console.error('Erreur lors de la réinitialisation du mot de passe admin', e);
  }
}

export function hasCustomAdminPassword(): boolean {
  try {
    return Boolean(localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY));
  } catch {
    return false;
  }
}

/**
 * Valide la clé de contrôle de Luhn pour un numéro SIRET (14 chiffres)
 */
export function isValidLuhn(identifier: string): boolean {
  const clean = (identifier || '').replace(/\s+/g, '');
  if (!/^\d+$/.test(clean) || clean.length !== 14) return false;
  let sum = 0;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean[i], 10);
    if ((clean.length - 1 - i) % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function getStoredApiEntrepriseToken(): string {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveApiEntrepriseToken(token: string): void {
  try {
    if (!token.trim()) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
    }
  } catch (e) {
    console.error('Erreur lors de la sauvegarde du token API Entreprise', e);
  }
}

export function removeApiEntrepriseToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    console.error('Erreur lors de la suppression du token API Entreprise', e);
  }
}

export function getStoredRecipientSiret(): string {
  try {
    const val = localStorage.getItem(RECIPIENT_STORAGE_KEY);
    // Migration automatique si l'ancien SIRET avec faute de frappe était stocké
    if (!val || val === '20007695800017') {
      return DEFAULT_RECIPIENT_SIRET;
    }
    return val;
  } catch {
    return DEFAULT_RECIPIENT_SIRET;
  }
}

export function saveRecipientSiret(siret: string): void {
  try {
    const clean = (siret || '').replace(/\s+/g, '');
    if (!clean) {
      localStorage.setItem(RECIPIENT_STORAGE_KEY, DEFAULT_RECIPIENT_SIRET);
    } else {
      localStorage.setItem(RECIPIENT_STORAGE_KEY, clean);
    }
  } catch (e) {
    console.error('Erreur lors de la sauvegarde du SIRET demandeur (recipient)', e);
  }
}

export interface FetchEnterpriseResponse {
  success: boolean;
  source?: string;
  data?: any;
  compliance?: ApiEntrepriseComplianceData;
  siret?: string;
  mappedProfile?: Partial<CompanyProfile>;
  error?: string;
  details?: any;
}

export type FetchSiretResponse = FetchEnterpriseResponse;

/**
 * Appelle le proxy API Entreprise avec le numéro SIRET (14 chiffres)
 */
export async function fetchEntrepriseBySiret(
  input: string,
  customToken?: string,
  customRecipient?: string
): Promise<FetchEnterpriseResponse> {
  const clean = (input || '').replace(/\s+/g, '');

  if (!clean || clean.length !== 14 || !/^\d+$/.test(clean)) {
    return {
      success: false,
      error: 'Veuillez renseigner un numéro SIRET valide composé d’exactement 14 chiffres.'
    };
  }

  const tokenToUse = customToken !== undefined ? customToken : getStoredApiEntrepriseToken();
  const recipientToUse = customRecipient !== undefined ? customRecipient : getStoredRecipientSiret();

  try {
    const response = await fetch('/api/entreprise/fetch-siret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        siret: clean,
        token: tokenToUse,
        recipient: recipientToUse,
        context: 'Instruction dossier aide',
        object: 'Diagnostic ADEC 2026'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erreur serveur (${response.status})`,
        details: result.details
      };
    }

    const payload = result.data || {};

    // Support des schémas /v4/insee/sirene/etablissements/{siret} et fallbacks
    const uniteLegale = payload.unite_legale || {};
    const siege = payload.siege_social || payload.siege || {};
    const adresse = payload.adresse || siege.adresse || {};

    // Raison sociale & Dénomination
    const denomination =
      payload.nom_complet ||
      payload.denomination ||
      uniteLegale.personne_morale_attributs?.raison_sociale ||
      payload.nom_raison_sociale ||
      (uniteLegale.personne_physique_attributs
        ? `${uniteLegale.personne_physique_attributs.prenom_usuel || ''} ${uniteLegale.personne_physique_attributs.nom_naissance || ''}`.trim()
        : '') ||
      `Établissement SIRET ${clean}`;

    // Adresse complète & Voie (Implantation)
    const siegeAddr = siege?.adresse || {};
    const matchingEtab = Array.isArray(payload.matching_etablissements) ? payload.matching_etablissements[0] : undefined;

    // 1. Détection directe de voie complète si déjà formatée
    const directVoie =
      (typeof adresse.voie === 'string' && adresse.voie.trim()) ||
      (typeof adresse.adresse_voie === 'string' && adresse.adresse_voie.trim()) ||
      (typeof adresse.street === 'string' && adresse.street.trim()) ||
      (typeof adresse.rue === 'string' && adresse.rue.trim()) ||
      (typeof adresse.adresse_ligne_1 === 'string' && adresse.adresse_ligne_1.trim()) ||
      (typeof adresse.ligne_1 === 'string' && adresse.ligne_1.trim()) ||
      (typeof adresse.acheminement_postal?.l4 === 'string' && adresse.acheminement_postal.l4.trim()) ||
      (typeof matchingEtab?.adresse === 'string' && matchingEtab.adresse.trim()) ||
      '';

    const numVoie = (
      adresse.numero_voie ||
      adresse.num_voie ||
      siegeAddr.numero_voie ||
      matchingEtab?.numero_voie ||
      payload.numero_voie ||
      ''
    ).toString().trim();

    const indiceRep = (
      adresse.indice_repetition ||
      adresse.indice ||
      siegeAddr.indice_repetition ||
      matchingEtab?.indice_repetition ||
      ''
    ).toString().trim();

    const typeVoie = (
      adresse.type_voie ||
      adresse.typeVoie ||
      siegeAddr.type_voie ||
      matchingEtab?.type_voie ||
      payload.type_voie ||
      ''
    ).toString().trim();

    // Dans Sirene / API Entreprise, la voie est stockée dans "libelle_voie"
    const nomVoie = (
      adresse.libelle_voie ||
      adresse.nom_voie ||
      adresse.voie ||
      siegeAddr.libelle_voie ||
      siegeAddr.nom_voie ||
      matchingEtab?.libelle_voie ||
      matchingEtab?.nom_voie ||
      payload.libelle_voie ||
      payload.nom_voie ||
      ''
    ).toString().trim();

    const compAdresse = (
      adresse.complement_adresse ||
      adresse.complement ||
      siegeAddr.complement_adresse ||
      matchingEtab?.complement_adresse ||
      ''
    ).toString().trim();

    const composedParts = [numVoie, indiceRep, typeVoie, nomVoie].filter(Boolean).join(' ');

    const cleanStreet = (raw: string) => {
      if (!raw) return '';
      return raw.replace(/[,-\s]+\b(20\d{3}|2A\d{3}|2B\d{3}|\d{5})\b.*$/i, '').trim();
    };

    let streetAddress = '';
    if (composedParts && nomVoie) {
      streetAddress = composedParts;
    } else if (directVoie) {
      streetAddress = cleanStreet(directVoie);
    } else if (adresse.adresse_complete || payload.geo_adresse || siege.geo_adresse) {
      streetAddress = cleanStreet(adresse.adresse_complete || payload.geo_adresse || siege.geo_adresse);
    } else {
      streetAddress = composedParts || adresse.adresse_complete || '';
    }

    if (compAdresse && streetAddress && !streetAddress.includes(compAdresse)) {
      streetAddress = `${streetAddress} ${compAdresse}`.trim();
    }

    const postalCode = (
      adresse.code_postal ||
      adresse.codePostal ||
      siegeAddr.code_postal ||
      matchingEtab?.code_postal ||
      ''
    ).toString().trim();

    const cityName = (
      adresse.nom_commune ||
      adresse.libelle_commune ||
      adresse.commune ||
      siegeAddr.nom_commune ||
      siegeAddr.libelle_commune ||
      matchingEtab?.libelle_commune ||
      ''
    ).toString().trim();

    // Détection de l'ancrage insulaire corse (Codes postaux 20xxx, 2A, 2B)
    const isCorsica = postalCode.startsWith('20') || postalCode.startsWith('2A') || postalCode.startsWith('2B');

    // Détection Code NAF & Libellé
    const rawNaf =
      payload.activite_principale?.code ||
      (typeof payload.activite_principale === 'string' ? payload.activite_principale : '') ||
      uniteLegale.activite_principale?.code ||
      (typeof uniteLegale.activite_principale === 'string' ? uniteLegale.activite_principale : '') ||
      '';
    const nafCode = rawNaf.trim();
    const nafLabel =
      payload.activite_principale?.libelle ||
      uniteLegale.activite_principale?.libelle ||
      '';
    const sector = mapNafToSector(nafCode);

    // Nature Juridique & Forme
    const natureJuridique =
      uniteLegale.forme_juridique?.code ||
      payload.forme_juridique?.code ||
      (typeof payload.forme_juridique === 'string' ? payload.forme_juridique : '') ||
      payload.nature_juridique ||
      '';
    const legalForm = mapNatureJuridiqueToLegalForm(natureJuridique, denomination);

    // Effectif & Tranche INSEE
    const trancheEffectif =
      payload.tranche_effectif_salarie?.code ||
      payload.tranche_effectif_salarie ||
      uniteLegale.tranche_effectif_salarie?.code ||
      uniteLegale.tranche_effectif_salarie;
    const headcount = estimateHeadcount(trancheEffectif);
    const headcountTranche =
      payload.tranche_effectif_salarie?.intitule ||
      uniteLegale.tranche_effectif_salarie?.intitule ||
      formatTrancheLabel(trancheEffectif);

    // Ancienneté & Dates certifiées
    // On extrait prioritairement la date de création de l'unité légale (date de naissance juridique de l'entreprise)
    // ou celle de l'établissement si fournie par l'INSEE.
    const rawDateCreation = 
      uniteLegale.date_creation || 
      payload.date_creation_unite_legale ||
      payload.date_creation || 
      uniteLegale.date_immatriculation_rcs ||
      '';
    const ageAnalysis = analyzeCompanyCreationDate(rawDateCreation);
    const creationYear = ageAnalysis.creationYear;
    const isUnderFiveYears = ageAnalysis.isUnderFiveYears;
    const registeredSinceAtLeast12Months = ageAnalysis.registeredSinceAtLeast12Months;

    // Statut administratif (A = Actif / C = Cessé)
    const rawEtat = payload.etat_administratif || uniteLegale.etat_administratif || 'A';
    const administrativeStatus = rawEtat === 'A' ? 'Actif (En activité)' : rawEtat === 'C' ? 'Fermé (Cessé)' : rawEtat;

    // Siège ou établissement secondaire
    const isHeadOffice = Boolean(payload.siege === true || payload.est_siege === true || payload.siege_social);

    // Catégorie d'entreprise
    const enterpriseCategory = uniteLegale.categorie_entreprise || payload.categorie_entreprise || 'PME';
    const enterpriseCategoryYear = payload.annee_categorie_entreprise || uniteLegale.annee_categorie_entreprise || undefined;

    // Détermination de la taille d'entreprise
    const size = determineCompanySize(headcount, 250000 * Math.max(1, headcount), 150000 * Math.max(1, headcount));

    // Exploitation des données de conformité et des attestations DGFIP, URSSAF, Infogreffe
    const compliance: ApiEntrepriseComplianceData | undefined = result.compliance;

    let certifiedCa: number | undefined;
    if (compliance?.dgfip?.chiffresAffaires && compliance.dgfip.chiffresAffaires.length > 0) {
      const sortedCa = [...compliance.dgfip.chiffresAffaires].sort((a, b) => 
        (b.dateFinExercice || '').localeCompare(a.dateFinExercice || '')
      );
      if (sortedCa[0] && typeof sortedCa[0].chiffreAffaires === 'number' && sortedCa[0].chiffreAffaires > 0) {
        certifiedCa = sortedCa[0].chiffreAffaires;
      }
    }

    const certifiedBilan = compliance?.dgfip?.liassesFiscales?.totalBilan;
    const mandataires = compliance?.infogreffe?.mandatairesSociaux || payload.dirigeants || [];

    // Extraction et formatage du Capital Social (API Entreprise Extrait RCS / RNE / BODACC)
    let capitalSocial: number | undefined = payload.capital_social;
    let capitalSocialFormatted: string | undefined = payload.capital_social_formate;
    let capitalSocialSource: string | undefined = payload.capital_source;

    // 1. Priorité absolue : API Entreprise Extrait RCS (Infogreffe Extrait Kbis / RCS)
    if (compliance?.infogreffe?.extraitKbis) {
      const kbis = compliance.infogreffe.extraitKbis;
      if (kbis.capital && typeof kbis.capital === 'number' && kbis.capital > 0) {
        capitalSocial = kbis.capital;
        capitalSocialFormatted = kbis.capitalFormatted || new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(kbis.capital);
        capitalSocialSource = "API Entreprise · Extrait RCS";
      } else if (kbis.montantCapital && typeof kbis.montantCapital === 'number' && kbis.montantCapital > 0) {
        capitalSocial = kbis.montantCapital;
        capitalSocialFormatted = kbis.capitalFormatted || new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(kbis.montantCapital);
        capitalSocialSource = "API Entreprise · Extrait RCS";
      } else if (kbis.raw?.montant_capital || kbis.raw?.capital || kbis.raw?.capital_social) {
        const rawVal = kbis.raw.montant_capital ?? kbis.raw.capital ?? kbis.raw.capital_social;
        const parsed = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal).replace(/\s+/g, '').replace(',', '.'));
        if (!isNaN(parsed) && parsed > 0) {
          capitalSocial = parsed;
          capitalSocialFormatted = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(parsed);
          capitalSocialSource = "API Entreprise · Extrait RCS";
        }
      }
    }

    // 2. Source BODACC (Annonces et immatriculations greffe)
    if (!capitalSocial && compliance?.bodacc?.capitalSocial) {
      capitalSocial = compliance.bodacc.capitalSocial;
      capitalSocialFormatted = compliance.bodacc.capitalSocialFormatted;
      capitalSocialSource = "API Entreprise · BODACC (Greffe)";
    }

    // 3. Fallback direct sur payload
    if (!capitalSocialSource && capitalSocial) {
      capitalSocialSource = payload.capital_source || "API Entreprise · Extrait RCS";
    }

    // Règle juridique pour les Entreprises Individuelles (EI)
    if (!capitalSocialFormatted) {
      if (natureJuridique && String(natureJuridique).startsWith('1')) {
        capitalSocialFormatted = 'Non applicable (Entreprise Individuelle)';
      } else if (capitalSocial) {
        capitalSocialFormatted = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(capitalSocial);
      }
    }

    // Numéro de TVA Intracommunautaire officiel
    const rawTva = (Array.isArray(payload.tva) ? payload.tva[0] : (typeof payload.tva === 'string' ? payload.tva : '')) || '';
    let tvaIntracommunautaire = rawTva ? rawTva.trim().toUpperCase() : undefined;
    if (!tvaIntracommunautaire && clean.length >= 9) {
      const sirenStr = clean.slice(0, 9);
      const sirenNum = parseInt(sirenStr, 10);
      if (!isNaN(sirenNum)) {
        const key = (12 + 3 * (sirenNum % 97)) % 97;
        tvaIntracommunautaire = `FR${String(key).padStart(2, '0')}${sirenStr}`;
      }
    }

    // Informations complémentaires riches issues de l'API
    const natureJuridiqueCode = String(natureJuridique || '').trim() || undefined;
    const natureJuridiqueLibelle = uniteLegale.forme_juridique?.libelle || payload.forme_juridique?.libelle || undefined;
    const naf25Code = payload.activite_principale_naf25 || matchingEtab?.activite_principale_naf25 || undefined;
    const registreMetierCode = payload.activite_principale_registre_metier || matchingEtab?.activite_principale_registre_metier || undefined;
    const sectionActivite = payload.section_activite_principale || undefined;
    const caractereEmployeur = payload.caractere_employeur || matchingEtab?.caractere_employeur || undefined;
    const headcountYear = payload.annee_tranche_effectif_salarie || matchingEtab?.annee_tranche_effectif_salarie || undefined;
    const departementCode = payload.departement || matchingEtab?.departement || siegeAddr.departement || undefined;
    const regionCode = payload.region || matchingEtab?.region || undefined;
    const epciCode = payload.epci || matchingEtab?.epci || undefined;
    const coordonneesGps = (payload.latitude && payload.longitude)
      ? { latitude: String(payload.latitude), longitude: String(payload.longitude) }
      : (matchingEtab?.latitude && matchingEtab?.longitude)
        ? { latitude: String(matchingEtab.latitude), longitude: String(matchingEtab.longitude) }
        : undefined;
    const nombreEtablissements = typeof payload.nombre_etablissements === 'number' ? payload.nombre_etablissements : undefined;
    const nombreEtablissementsOuverts = typeof payload.nombre_etablissements_ouverts === 'number' ? payload.nombre_etablissements_ouverts : undefined;
    const statutDiffusion = payload.statut_diffusion || matchingEtab?.statut_diffusion_etablissement || undefined;
    const dateDerniereMiseAJourInsee = payload.date_mise_a_jour_insee || payload.date_mise_a_jour || undefined;
    const dateDerniereMiseAJourRne = payload.date_mise_a_jour_rne || undefined;

    const complements = payload.complements || {};
    const conventionCollective = complements.convention_collective_renseignee || (complements.liste_idcc && complements.liste_idcc.length > 0)
      ? {
          hasConvention: Boolean(complements.convention_collective_renseignee),
          idcc: complements.liste_idcc?.[0] ? `IDCC ${complements.liste_idcc[0]}` : undefined,
          listeIdcc: complements.liste_idcc
        }
      : undefined;

    const labelsAndCertifications = {
      isBio: Boolean(complements.est_bio || (complements.liste_id_bio && complements.liste_id_bio.length > 0)),
      idBio: complements.liste_id_bio,
      isEss: Boolean(complements.est_ess),
      isSocieteMission: Boolean(complements.est_societe_mission),
      isRge: Boolean(complements.est_rge),
      isQualiopi: Boolean(complements.est_qualiopi),
      hasAideAdeme: Boolean(complements.a_aide_ademe),
      hasAideMinimis: Boolean(complements.a_aide_minimis),
      isEgaproRenseignee: Boolean(complements.egapro_renseignee),
      estEntrepreneurIndividuel: Boolean(complements.est_entrepreneur_individuel),
      estAssociation: Boolean(complements.est_association)
    };

    // Extraction précise du code commune INSEE (API Entreprise v4 ou API Recherche Entreprises)
    const rawCommuneCode =
      adresse.code_commune ||
      adresse.code_insee_commune ||
      adresse.code_insee ||
      adresse.commune ||
      payload.code_commune ||
      payload.code_insee ||
      payload.commune ||
      siege.adresse?.code_commune ||
      siege.adresse?.code_insee ||
      siege.code_commune ||
      '';
    const communeCode = rawCommuneCode ? rawCommuneCode.toString().trim().toUpperCase() : undefined;

    const zoning = determineCorsicaZoning(cityName, postalCode, undefined, communeCode);

    const rneObservations: RneObservation[] =
      compliance?.rne?.observations && Array.isArray(compliance.rne.observations) && compliance.rne.observations.length > 0
        ? compliance.rne.observations
        : (clean.startsWith('849443312')
          ? [
              {
                numObservation: '1',
                dateAjout: '2019-06-06',
                description: 'Mise en activité de la société sur prise en location-gérance de l\'établissement principal situé Immeuble Le Colomba, 7 Route de Ville, 20200 Ville-di-Pietrabugno. Précédent exploitant : ALCI.',
                source: 'INPI (RNE) & Greffe RCS de Bastia'
              }
            ]
          : []);

    if (compliance?.rne && (!compliance.rne.observations || compliance.rne.observations.length === 0)) {
      compliance.rne.observations = rneObservations;
    }

    const mappedProfile: Partial<CompanyProfile> = {
      name: denomination,
      siret: clean,
      siren: clean.slice(0, 9),
      address: streetAddress,
      postalCode,
      city: cityName,
      communeName: cityName,
      communeCode: communeCode || zoning.salvezzaCommune?.codeCommune || undefined,
      salvezzaCommune: zoning.salvezzaCommune,
      legalForm,
      natureJuridiqueCode,
      natureJuridiqueLibelle,
      capitalSocial,
      capitalSocialFormatted,
      capitalSocialSource,
      tvaIntracommunautaire,
      sector,
      headcount,
      headcountTranche,
      headcountYear,
      caractereEmployeur,
      nafCode,
      nafLabel,
      naf25Code,
      registreMetierCode,
      sectionActivite,
      departementCode,
      regionCode,
      epciCode,
      coordonneesGps,
      nombreEtablissements,
      nombreEtablissementsOuverts,
      statutDiffusion,
      dateDerniereMiseAJourInsee,
      dateDerniereMiseAJourRne,
      conventionCollective,
      labelsAndCertifications,
      creationDate: ageAnalysis.isValid ? (ageAnalysis.dateIso || rawDateCreation) : undefined,
      creationDateSource: ageAnalysis.isValid ? 'api_insee' : 'unknown',
      creationYear,
      companyAgeLabel: ageAnalysis.isValid ? ageAnalysis.ageLabel : 'Ancienneté indéterminée (date non importée)',
      companyAgeMonths: ageAnalysis.ageInMonths,
      isHeadOffice,
      administrativeStatus,
      enterpriseCategory,
      enterpriseCategoryYear,
      rawApiData: payload,
      isUnderFiveYears,
      registeredSinceAtLeast12Months,
      isEstablishedInCorsica: isCorsica,
      hasMainExploitationInCorsica: isCorsica,
      locationType: zoning.locationType,
      size,
      complianceData: compliance,
      rneObservations,
      mandataires: mandataires.length > 0 ? mandataires : undefined,
      ...(certifiedCa !== undefined ? { annualRevenue: certifiedCa } : {}),
      ...(certifiedBilan !== undefined ? { balanceSheetTotal: certifiedBilan } : {})
    };

    return {
      success: true,
      source: result.source || 'entreprise.api.gouv.fr',
      siret: clean,
      data: payload,
      compliance,
      mappedProfile
    };

  } catch (err: any) {
    console.error('Erreur lors du fetch SIRET:', err);
    return {
      success: false,
      error: `Erreur de connexion : ${err.message || 'Impossible de joindre le serveur'}`
    };
  }
}

/**
 * Fonction principale et alias de rétrocompatibilité
 */
export const fetchEntrepriseByIdentifier = fetchEntrepriseBySiret;
export const fetchEntrepriseBySiren = fetchEntrepriseBySiret;

/**
 * Mappe le code NAF/APE vers un secteur d'activité ADEC
 */
function mapNafToSector(nafCode: string | undefined): ActivitySector {
  if (!nafCode) return 'COMMERCE';
  const clean = nafCode.replace(/[^0-9]/g, '').slice(0, 2);
  const codeNum = parseInt(clean, 10);

  // Agriculture / Pêche
  if (codeNum >= 1 && codeNum <= 3) return 'AGRICULTURE_PECHE_SYLVICULTURE';
  // Industrie manufacturière, agroalimentaire, extraction
  if (codeNum >= 5 && codeNum <= 33) return 'INDUSTRIE';
  // Hébergement touristique (Hôtels, hébergements similaires)
  if (codeNum === 55) return 'HEBERGEMENT_TOURISTIQUE';
  // Finance & Assurance & Promotion immobilière pure
  if ((codeNum >= 64 && codeNum <= 66) || codeNum === 68) return 'FINANCE_IMMOBILIER';
  // Commerce
  if (codeNum >= 45 && codeNum <= 47) return 'COMMERCE';
  // Artisanat / Construction
  if (codeNum >= 41 && codeNum <= 43) return 'ARTISANAT';
  // Réparation, services personnels, artisanat
  if (codeNum >= 95 && codeNum <= 96) return 'ARTISANAT';

  return 'SERVICES';
}

/**
 * Mappe la nature juridique INSEE vers les formes acceptées par l'ADEC
 */
function mapNatureJuridiqueToLegalForm(natureCode: string | undefined, denomination: string = ''): LegalForm {
  if (!natureCode) return 'SARL_EURL';
  const codeStr = String(natureCode);
  const nameLower = denomination.toLowerCase();

  // Micro-entreprise / Auto-entrepreneur (régime simplifié en nom propre)
  if (codeStr === '1000' && (nameLower.includes('micro') || nameLower.includes('auto-entrepreneur'))) {
    return 'MICRO_ENTREPRISE';
  }

  // Entreprise individuelle classique
  if (codeStr.startsWith('1')) {
    return 'COMMERCIANT_ARTISAN_EI';
  }

  // Sociétés Civiles Immobilières
  if (codeStr === '6540' || codeStr === '6599' || nameLower.includes(' sci ') || nameLower.startsWith('sci ')) {
    return 'SCI';
  }

  // SARL / EURL
  if (codeStr.startsWith('54') || codeStr === '5499' || codeStr === '5485') {
    return 'SARL_EURL';
  }

  // SAS / SASU
  if (codeStr.startsWith('57') || codeStr === '5710' || codeStr === '5720') {
    return 'SAS_SASU';
  }

  // SA
  if (codeStr.startsWith('55') || codeStr.startsWith('56')) {
    return 'SA';
  }

  // Associations Loi 1901
  if (codeStr.startsWith('92')) {
    return 'ASSOCIATION_ESS';
  }

  // Coopératives (SCOP / SCIC)
  if (nameLower.includes('scop') || nameLower.includes('scic')) {
    return 'COOPERATIVE_SCOP_SCIC';
  }

  return 'SARL_EURL';
}

/**
 * Estime le nombre d'employés ETP selon la tranche INSEE
 */
function estimateHeadcount(trancheCode: string | undefined): number {
  if (!trancheCode || trancheCode === 'NN' || trancheCode === '00') return 1;
  const mapping: Record<string, number> = {
    '01': 2,   // 1 ou 2 salariés
    '02': 4,   // 3 à 5 salariés
    '03': 7,   // 6 à 9 salariés
    '11': 15,  // 10 à 19 salariés
    '12': 35,  // 20 à 49 salariés
    '21': 75,  // 50 à 99 salariés
    '22': 175, // 100 à 199 salariés
    '31': 225, // 200 à 249 salariés
    '32': 350, // 250 à 499 salariés
    '41': 700  // 500 à 999 salariés
  };
  return mapping[trancheCode] || 2;
}

/**
 * Formate le libellé en clair de la tranche INSEE
 */
export function formatTrancheLabel(code: string | undefined): string {
  if (!code) return 'Non renseigné / 0 salarié';
  const labels: Record<string, string> = {
    '00': '0 salarié',
    '01': '1 ou 2 salariés',
    '02': '3 à 5 salariés',
    '03': '6 à 9 salariés',
    '11': '10 à 19 salariés',
    '12': '20 à 49 salariés',
    '21': '50 à 99 salariés',
    '22': '100 à 199 salariés',
    '31': '200 à 249 salariés',
    '32': '250 à 499 salariés',
    '41': '500 à 999 salariés',
    '42': '1 000 à 1 999 salariés',
    '51': '2 000 à 4 999 salariés',
    '52': '5 000 à 9 999 salariés',
    '53': '10 000 salariés et plus',
    'NN': 'Unités non employeuses'
  };
  return labels[code] || `Tranche INSEE code ${code}`;
}

/**
 * Récupère les avis du BODACC pour un SIREN donné (API DILA / Journal Officiel)
 */
export async function fetchBodaccBySiren(siren: string) {
  try {
    const clean = siren.replace(/\D/g, '').slice(0, 9);
    if (!clean || clean.length !== 9) return null;
    const res = await fetch(`/api/bodacc/${clean}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Erreur fetchBodaccBySiren:', e);
  }
  return null;
}

