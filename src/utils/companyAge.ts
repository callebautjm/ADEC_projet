/**
 * Utilitaire de calcul et de formatage de l'ancienneté d'entreprise
 * Fondé sur la date d'immatriculation / création INSEE & Infogreffe.
 * 
 * Règles ADEC 2026 :
 * - Impresa Sì Création : réservé aux entreprises de 5 ans au maximum (≤ 60 mois).
 * - Impresa Sì Reprise : la cible reprise doit avoir au moins 12 mois d'existence (≥ 12 mois).
 */

export interface CompanyAgeAnalysis {
  isValid: boolean;
  isDateKnown: boolean;
  dateIso?: string; // Format YYYY-MM-DD
  dateFormattedFr: string; // Format JJ/MM/AAAA ou "Date non communiquée"
  ageInYears?: number; // e.g. 2.4
  ageInMonths?: number; // e.g. 29
  ageLabel: string; // e.g. "2 ans et 5 mois" ou "Ancienneté indéterminée"
  isUnderFiveYears?: boolean; // undefined si inconnu
  isUnderThreeYears?: boolean; // undefined si inconnu
  registeredSinceAtLeast12Months?: boolean; // undefined si inconnu
  creationYear?: number;
  phaseLabel: string;
  badgeColor: 'emerald' | 'sky' | 'amber' | 'slate' | 'red';
  adecImplications: {
    impresaSiCreationEligible: boolean | undefined;
    impresaSiCreationNote: string;
    impresaSiRepriseEligible: boolean | undefined;
    impresaSiRepriseNote: string;
    riesceNote: string;
  };
}

/**
 * Analyse et parse n'importe quel format de date de création.
 * RÈGLE FONDAMENTALE : Si la date est absente ou invalide, ne JAMAIS inventer
 * ni présumer une date par défaut. L'état "Non communiquée / Indéterminée" est
 * clairement exposé à l'utilisateur et au moteur de calcul.
 */
export function analyzeCompanyCreationDate(dateInput: string | number | undefined | null): CompanyAgeAnalysis {
  if (!dateInput || String(dateInput).trim() === '') {
    return {
      isValid: false,
      isDateKnown: false,
      dateFormattedFr: 'Non communiquée (à renseigner)',
      ageLabel: 'Ancienneté indéterminée',
      phaseLabel: 'Date inconnue (justificatif requis)',
      badgeColor: 'amber',
      adecImplications: {
        impresaSiCreationEligible: undefined,
        impresaSiCreationNote: 'Date de création non communiquée : l’éligibilité au volet Création (≤ 5 ans) nécessite de saisir la date d’immatriculation officielle (Extrait Kbis).',
        impresaSiRepriseEligible: undefined,
        impresaSiRepriseNote: 'Ancienneté non vérifiable. Pour une reprise, l’immatriculation de plus de 12 mois devra être justifiée.',
        riesceNote: 'Date requise pour apprécier le statut Jeune Entreprise (< 3 ans) sur la création d’emploi du dirigeant.'
      }
    };
  }

  let dateObj: Date | null = null;

  if (typeof dateInput === 'number') {
    const timestamp = dateInput > 10000000000 ? dateInput : dateInput * 1000;
    dateObj = new Date(timestamp);
  } else if (typeof dateInput === 'string') {
    const clean = dateInput.trim();
    // Format JJ/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
      const [day, month, year] = clean.split('/').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
      // Format YYYY-MM-DD
      const [year, month, day] = clean.slice(0, 10).split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      const parsed = Date.parse(clean);
      if (!isNaN(parsed)) {
        dateObj = new Date(parsed);
      }
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      isDateKnown: false,
      dateFormattedFr: `Date non valide (${String(dateInput)})`,
      ageLabel: 'Format non reconnu',
      phaseLabel: 'Date invalide (à corriger)',
      badgeColor: 'amber',
      adecImplications: {
        impresaSiCreationEligible: undefined,
        impresaSiCreationNote: 'Format de date invalide. Veuillez saisir une date d’immatriculation valide (JJ/MM/AAAA ou AAAA-MM-JJ).',
        impresaSiRepriseEligible: undefined,
        impresaSiRepriseNote: 'Kbis officiel requis pour certifier l’ancienneté.',
        riesceNote: 'Date requise pour les primes RIESCE.'
      }
    };
  }

  const now = new Date();
  const creationTimestamp = dateObj.getTime();
  const nowTimestamp = now.getTime();

  // Différence en mois et années
  const diffMs = Math.max(0, nowTimestamp - creationTimestamp);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const ageInYears = +(diffDays / 365.25).toFixed(1);
  const ageInMonths = Math.floor(diffDays / 30.4375);

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const dateIso = `${year}-${month}-${day}`;
  const dateFormattedFr = `${day}/${month}/${year}`;

  const isUnderFiveYears = ageInMonths <= 60; // 5 ans max
  const isUnderThreeYears = ageInMonths <= 36; // 3 ans max
  const registeredSinceAtLeast12Months = ageInMonths >= 12; // au moins 12 mois

  // Libellé textuel de l'âge
  let ageLabel: string;
  if (ageInMonths < 1) {
    ageLabel = 'Création très récente (< 1 mois)';
  } else if (ageInMonths < 12) {
    ageLabel = `${ageInMonths} mois d’existence`;
  } else {
    const fullYears = Math.floor(ageInMonths / 12);
    const remMonths = ageInMonths % 12;
    if (remMonths === 0) {
      ageLabel = `${fullYears} an${fullYears > 1 ? 's' : ''}`;
    } else {
      ageLabel = `${fullYears} an${fullYears > 1 ? 's' : ''} et ${remMonths} mois`;
    }
  }

  // Phase d'activité
  let phaseLabel: string;
  let badgeColor: 'emerald' | 'sky' | 'amber' | 'slate';

  if (ageInMonths < 36) {
    phaseLabel = 'Phase Amorçage / Jeune Entreprise (< 3 ans)';
    badgeColor = 'emerald';
  } else if (ageInMonths <= 60) {
    phaseLabel = 'Phase Création Structurante (< 5 ans)';
    badgeColor = 'sky';
  } else {
    phaseLabel = 'Phase Développement & Maturité (≥ 5 ans)';
    badgeColor = 'slate';
  }

  // Conséquences ADEC
  const impresaSiCreationEligible = isUnderFiveYears;
  const impresaSiCreationNote = isUnderFiveYears
    ? `Entreprise éligible au volet Impresa Sì Création (${ageLabel} d’ancienneté ≤ 5 ans).`
    : `Inéligible à Impresa Sì Création : l’entreprise a ${ageLabel} d’existence (> 5 ans requis). Elle est orientée vers le volet Compétitivité & Développement.`;

  const impresaSiRepriseEligible = registeredSinceAtLeast12Months;
  const impresaSiRepriseNote = registeredSinceAtLeast12Months
    ? `Ancienneté cible validée (≥ 12 mois requis pour l’entreprise reprise).`
    : `Attention : l’entreprise a moins de 12 mois (${ageInMonths} mois). La reprise exige une cible enregistrée depuis au moins 12 mois.`;

  const riesceNote = isUnderThreeYears
    ? 'Jeune entreprise : éligible prioritaire sur la création d’emploi du dirigeant sociétal et premiers recrutements CDI.'
    : 'Éligible aux primes RIESCE pour toute création de poste CDI ou consolidation d’emplois.';

  return {
    isValid: true,
    isDateKnown: true,
    dateIso,
    dateFormattedFr,
    ageInYears,
    ageInMonths,
    ageLabel,
    isUnderFiveYears,
    isUnderThreeYears,
    registeredSinceAtLeast12Months,
    creationYear: year,
    phaseLabel,
    badgeColor,
    adecImplications: {
      impresaSiCreationEligible,
      impresaSiCreationNote,
      impresaSiRepriseEligible,
      impresaSiRepriseNote,
      riesceNote
    }
  };
}
