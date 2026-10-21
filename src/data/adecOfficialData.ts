/**
 * Source de Vérité Officielle - Guide des Aides de l'ADEC & Pattu Risilienzia è Territorii
 * Collectivité de Corse / Agence de Développement Économique de la Corse (ADEC)
 * Version 2026 & Délibération N° 21/177 AC de l'Assemblée de Corse du 28 octobre 2021
 */

import { DispositifScheme, DocumentaryDatabaseMetadata } from '../types';

export const OFFICIAL_ADEC_SCHEMES: DispositifScheme[] = [
  // =========================================================================
  // ANNEXE 1 : U PATTU RISILIENZA È TERRITORII (Non soumis à l'éval qualitative)
  // =========================================================================
  {
    id: 'risilienza',
    code: 'PRT-01',
    name: 'Mesure d’aide « Risilienza »',
    subtitle: 'Résilience, continuité d’activité, modernisation et adaptation aux chocs économiques et écologiques',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Pattu Risilienzia è Territorii',
    legalBasis: 'Règlement (UE) 2023/2831 de la Commission du 13 décembre 2023 (aides de minimis, plafond 300 000 € sur 3 ans glissants)',
    governingDeliberation: 'Annexe 1 - U PATTU RISILIENZA È TERRITORII (Non soumis à l’évaluation qualitative délibération N° 21/177 AC)',
    requiresQualitativeEvaluation: false,
    objective: 'Soutenir la résilience, la continuité d’activité, la modernisation et l’adaptation des entités économiques corses confrontées ou appelées à s’adapter aux chocs et mutations économiques, énergétiques, environnementales, numériques et sociales.',
    targetBeneficiariesSummary: 'TPE, PE et PME régulièrement établies et exerçant leur activité principale en Corse (industrie, commerce, artisanat, services, ESS).',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Exclusion des micro-entreprises (régime unifié et simplifié)',
      'À jour des cotisations fiscales et sociales ou bénéficiant d’un plan d’étalement à jour',
      'Avoir satisfait à toutes les obligations de justification ou de contrôle (CSF) sur aides ADEC antérieures',
      'Ne pas faire l’objet d’une procédure collective incompatible avec le maintien de l’activité',
      'Mis en œuvre exclusivement dans le cadre d’appels à projets lancés par l’ADEC'
    ],
    eligibleExpenseCategories: [
      'Investissements matériels de modernisation ou de sécurisation de l’activité',
      'Équipements liés à la transition énergétique ou écologique',
      'Investissements numériques',
      'Dépenses de diversification ou de relocalisation sur le territoire',
      'Dépenses d’aménagement ou d’adaptation des locaux',
      'Coûts de formation liés à la transformation de l’activité',
      'Prestations de conseil stratégique, organisationnel, numérique ou environnemental',
      'Dépenses favorisant la résilience logistique, énergétique ou productive',
      'Investissements immatériels nécessaires à la continuité ou au développement',
      'Achats consommés ou incorporés directement liés au projet de résilience',
      'Surcoûts directement liés à la mise en œuvre du projet',
      'Dépenses de fonctionnement directement liées au projet de résilience'
    ],
    ineligibleExpenseCategories: [
      'Dépenses de fonctionnement courant non directement liées au projet',
      'Dépenses engagées avant le dépôt de la demande (sauf dérogation expresse)',
      'TVA récupérable'
    ],
    rates: {
      tpeMaxRate: 0.70,
      peMaxRate: 0.60,
      pmeMaxRate: 0.50,
      floorAmount: 5000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt de la demande en ligne sur le site internet de l’ADEC suite à l’appel à projets',
      decisionBody: 'Instruction par les services de l’ADEC puis passage et décision en Bureau de l’ADEC (instance d’individualisation des aides directes)',
      requiredDocuments: [
        'Présentation de l’entreprise',
        'Description détaillée du projet',
        'Plan de financement',
        'Justificatifs financiers',
        'Déclaration des aides publiques perçues au titre du régime de minimis sur les trois derniers exercices fiscaux'
      ],
      mandatoryCommitments: [
        'Faire apparaître de manière visible et lisible le soutien financier de l’ADEC et de la Collectivité de Corse sur tous les supports',
        'Se soumettre à tout contrôle administratif, financier ou technique pendant la réalisation et durant 3 ans après achèvement',
        'Conserver l’ensemble des pièces justificatives relatives à l’aide et au projet'
      ],
      controlDurationYears: 3
    },
    sourceDocumentPages: 'Pages 2 à 6',
    isActive: true
  },
  {
    id: 'rinascita',
    code: 'PRT-02',
    name: 'Mesure d’aide « Rinascita »',
    subtitle: 'Reconstruction, continuité et relance des entreprises affectées par des sinistres majeurs',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Pattu Risilienzia è Territorii',
    legalBasis: 'Règlement (UE) 2023/2831 de la Commission du 13 décembre 2023 (de minimis, 300 000 € sur 3 ans)',
    governingDeliberation: 'Annexe 1 - U PATTU RISILIENZA È TERRITORII (Non soumis à l’évaluation qualitative)',
    requiresQualitativeEvaluation: false,
    objective: 'Soutenir la reconstruction, la continuité d’activité, la relance économique et l’adaptation des entreprises corses affectées par des sinistres majeurs (incendies, inondations, tempêtes, catastrophes naturelles, accidents industriels, actes criminels ou tout autre événement exceptionnel).',
    targetBeneficiariesSummary: 'TPE, PE et PME en Corse ayant subi des sinistres entraînant dommages matériels, interruption d’activité ou perte d’exploitation significative.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Sinistre caractérisé d’origine accidentelle, naturelle ou criminelle avec dommages matériels ou perte d’exploitation affectant la pérennité',
      'Dépenses retenues nettes de toute indemnisation d’assurance versée ou à verser (absence stricte de surcompensation)',
      'Déclaration obligatoire des indemnités d’assurance perçues ou à percevoir',
      'Exclusion des micro-entreprises, entreprises en procédure collective incompatible ou litiges antérieurs ADEC non régularisés',
      'Procédure d’instruction accélérée possible en cas d’urgence économique caractérisée'
    ],
    eligibleExpenseCategories: [
      'Travaux de remise en état des locaux professionnels nécessaires à la reprise',
      'Investissements de remplacement portant sur des équipements équivalents ou réparation des équipements détruits/endommagés',
      'Dépenses de sécurisation des bâtiments et installations',
      'Équipements de prévention des risques et de protection contre les sinistres',
      'Dépenses liées à une relocalisation temporaire de l’activité après sinistre',
      'Investissements de modernisation réalisés à l’occasion de la reprise ou reconstruction',
      'Dépenses numériques nécessaires à la continuité d’activité',
      'Coûts liés à la reconstitution des stocks strictement nécessaires à la reprise',
      'Frais d’ingénierie, d’expertise, d’architecte ou d’assistance technique',
      'Prestations de conseil en gestion de crise, continuité ou prévention des risques',
      'Dépenses de fonctionnement directement liées au projet de reprise',
      'Investissements immatériels contribuant durablement à la résilience'
    ],
    ineligibleExpenseCategories: [
      'Dépenses couvertes intégralement par les assurances',
      'Dépenses correspondant à la valeur des biens détruits ou pertes d’exploitation indemnisables au titre de la réparation d’un préjudice',
      'Dépenses de fonctionnement courant sans lien direct',
      'Dépenses engagées avant le dépôt de la demande sauf si rendues strictement nécessaires pour assurer la sauvegarde et la continuité immédiate',
      'TVA récupérable'
    ],
    rates: {
      tpeMaxRate: 0.70,
      peMaxRate: 0.60,
      pmeMaxRate: 0.50,
      floorAmount: 5000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt en ligne via le site de l’ADEC (demande individuelle ou campagne d’intervention ADEC)',
      decisionBody: 'Instruction par les services de l’ADEC et décision par le Bureau de l’ADEC',
      requiredDocuments: [
        'Présentation de l’entreprise',
        'Description du sinistre et de ses conséquences',
        'Justificatifs précis des dommages subis',
        'Déclarations et indemnisations d’assurance reçues ou attendues',
        'Description détaillée du projet de relance ou de reconstruction',
        'Plan de financement',
        'Justificatifs financiers',
        'Déclaration des aides de minimis sur 3 exercices'
      ],
      mandatoryCommitments: [
        'Obligation d’information immédiate de l’ADEC en cas de versement d’indemnité d’assurance ultérieure (reversement du trop-perçu)',
        'Affichage visible du soutien ADEC et Collectivité de Corse',
        'Contrôle sur pièce et sur place pendant 3 ans après achèvement'
      ],
      controlDurationYears: 3
    },
    sourceDocumentPages: 'Pages 7 à 13',
    isActive: true
  },
  {
    id: 'ribumba',
    code: 'PRT-03',
    name: 'Mesure d’aide « Ribumbà »',
    subtitle: 'Rebond et restructuration économique d’entreprises fragilisées',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Pattu Risilienzia è Territorii',
    legalBasis: 'Aide d’État SA.122002 (2026/N) – France Prolongation du régime d’aide SA.41259 (sauvetage et restructuration pour les PME en difficulté)',
    governingDeliberation: 'Annexe 1 - U PATTU RISILIENZA È TERRITORII (Non soumis à l’évaluation qualitative)',
    requiresQualitativeEvaluation: false,
    objective: 'Permettre de répondre à des besoins de rebond, voire de restructuration économique plus globale, d’entreprises fragilisées par des problématiques objectives d’exploitation entraînant une détérioration financière, d’environnement concurrentiel ou de chocs extérieurs, ayant encore un avenir économique.',
    targetBeneficiariesSummary: 'TPE, PE et PME en Corse répondant à la définition d’entreprise en difficulté au sens de l’art. 2 point 18 du règlement (UE) n° 651/2014.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Entreprise répondant aux critères d’entreprise en difficulté (art. 2 point 18 du Règl. UE 651/2014)',
      'Principe de non-récurrence : Aucune aide au sauvetage ou à la restructuration reçue au cours des 10 années précédentes',
      'Exclusion des entreprises dont les difficultés résultent d’une manœuvre frauduleuse du dirigeant',
      'Exclusion si sorties de trésorerie vers les détenteurs de fonds propres (dividendes) durant la phase de difficultés',
      'Exclusion des entreprises ayant engagé une procédure de cession ou de transmission',
      'Contribution propre obligatoire de l’entreprise : au moins 25 % pour les petites entreprises (< 50 sal), au moins 40 % pour les moyennes (50 à 250 sal)',
      'Fourniture d’un scénario contrefactuel crédible démontrant l’effet incitatif et la défaillance du marché',
      'L’aide ne peut en aucun cas servir à l’apurement du passif public (fiscal/social), dette fournisseur ou contentieux bancaire !',
      'Plan de redressement validé par l’expert-comptable de l’entreprise'
    ],
    eligibleExpenseCategories: [
      'Coûts de restructuration opérationnelle et de redressement de l’activité'
    ],
    ineligibleExpenseCategories: [
      'Apurement du passif public (dettes fiscales et sociales)',
      'Dettes fournisseurs',
      'Contentieux bancaires',
      'Distribution de dividendes durant la phase de restructuration'
    ],
    rates: {
      peMaxRate: 0.75, // Petites entreprises (< 50 sal) : max 75%
      pmeMaxRate: 0.60, // Moyennes entreprises (50 à 250 sal) : max 60%
      floorAmount: 5000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt en ligne du dossier complet sur le site de l’ADEC',
      decisionBody: 'Analyse par les services instructeurs (évaluation liquidité vs solvabilité) puis passage en Bureau de l’ADEC',
      requiredDocuments: [
        'Présentation de l’entreprise',
        'Description détaillée des difficultés et de leur origine',
        'Plan de redressement validé par un expert-comptable',
        'Scénario contrefactuel crédible sans aide publique',
        'Éléments d’imposition des actionnaires détenant le contrôle pour établir leur capacité contributive',
        'Attestation sur l’honneur de non-bénéfice d’aide au sauvetage/restructuration sur 10 ans',
        'Plan de financement et justificatifs financiers'
      ],
      mandatoryCommitments: [
        'Interdiction totale de sorties de dividendes ou de titres de dettes subordonnés durant la restructuration',
        'Juste répartition des charges et absorption des pertes par les actionnaires historiques',
        'Contrôles ADEC et maintien des engagements de redressement'
      ],
      controlDurationYears: 3
    },
    sourceDocumentPages: 'Pages 14 à 19',
    isActive: true
  },
  {
    id: 'impresi_paisani',
    code: 'PRT-04',
    name: 'Mesure d’aide « Impresi paisani »',
    subtitle: 'Activités productives, services, artisanat et commerce de proximité dans les territoires ruraux et de montagne',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Pattu Risilienzia è Territorii',
    legalBasis: 'Règlement (UE) 2023/2831 de la Commission du 13 décembre 2023 (de minimis, 300 000 € sur 3 ans)',
    governingDeliberation: 'Annexe 1 - U PATTU RISILIENZA È TERRITORII (Non soumis à l’évaluation qualitative)',
    requiresQualitativeEvaluation: false,
    objective: 'Soutenir et développer les activités productives, les services, l’artisanat ainsi que le commerce de proximité dans les territoires ruraux et de montagne de Corse (circuits courts, redynamisation commerciale, reprise, transition écologique et numérique).',
    targetBeneficiariesSummary: 'TPE, PE et PME immatriculées et exerçant leur activité principale en Corse dans les territoires ruraux ou de montagne (zonage SALVEZZA, communes < 1000 habitants INSEE, ou critères d’éloignement/topographie démontrés).',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Implantation dans les territoires ruraux ou de montagne (zonage SALVEZZA et communes < 1 000 habitants ou indicateurs objectifs équivalents)',
      'Exclusion des activités saisonnières (exerçant moins de 8 mois par an)',
      'Exclusion des entreprises en situation de difficulté avérée au sens CE',
      'Exclusion des micro-entreprises',
      'À jour des cotisations ou plan d’étalement valide'
    ],
    eligibleExpenseCategories: [
      'Achats et aménagement d’équipements professionnels, notamment productifs',
      'Véhicules de tournées de marchands ambulants alimentaires ou d’activités artisanales de services dans le dit-véhicule, desservant exclusivement une zone rurale',
      'Modernisation des entreprises et locaux d’activités (vitrines incluses)',
      'Sécurisation contre les effractions',
      'Accessibilité physique et numérique à tous les publics',
      'Investissements pour la transition écologique et énergétique',
      'Fonds de commerce ou artisanal et parts sociales ou actions (reprise rurale)',
      'Frais d’études, conseil et accompagnement environnement, ESS, digitalisation'
    ],
    ineligibleExpenseCategories: [
      'Dépenses non spécifiques permettant une valorisation patrimoniale d’un bien immobilier lié directement ou indirectement aux dirigeants',
      'Dispositifs de production d’énergie',
      'Droit au bail s’il est vendu seul',
      'Frais d’enregistrement'
    ],
    rates: {
      tpeMaxRate: 0.70,
      peMaxRate: 0.60,
      pmeMaxRate: 0.50,
      floorAmount: 5000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt en ligne d’une demande de soutien sur le site internet de l’ADEC',
      decisionBody: 'Instruction des services puis examen et attribution en Bureau de l’ADEC',
      requiredDocuments: [
        'Présentation de l’entreprise et justification de l’implantation rurale/montagne',
        'Description détaillée du projet d’ancrage ou de reprise rurale',
        'Plan de financement prévisionnel',
        'Justificatifs financiers',
        'Déclaration des aides de minimis sur 3 exercices'
      ],
      mandatoryCommitments: [
        'Maintien de l’activité en zone rurale',
        'Mention obligatoire du soutien de l’ADEC et de la Collectivité de Corse sur tous supports',
        'Contrôles administratifs et financiers pendant la réalisation et 3 ans après achèvement'
      ],
      controlDurationYears: 3
    },
    sourceDocumentPages: 'Pages 20 à 24',
    isActive: true,
    communication: {
      accroche: 'La mesure « Impresi Paisani » a pour objet de soutenir et de développer les activités productives, artisanales, commerciales et de services implantées dans les territoires ruraux et de montagne de Corse, afin de renforcer leur attractivité économique et leur résilience.',
      objectifs: [
        'Favoriser le développement d’une économie locale de production de biens et de services plus durable.',
        'Préserver et renforcer l’offre de proximité en milieu rural, notamment au travers des circuits courts et des outils numériques.',
        'Soutenir le commerce et l’artisanat en tant que vecteurs de dynamisation économique, sociale et territoriale.',
        'Accompagner la reprise d’entreprises par le financement de rachats de fonds de commerce, de fonds artisanaux, de parts sociales ou d’actions.',
        'Encourager la création et le développement d’activités contribuant à l’innovation, à l’économie sociale et solidaire ainsi qu’aux transitions écologique, énergétique et numérique.'
      ],
      entreprisesEligibles: 'Les TPE, PE et PME basées en Corse dont les activités relèvent principalement des secteurs de l’industrie, de l’artisanat, du commerce, des services ou de l’économie sociale et solidaire (ESS).',
      projetsEligibles: 'Création, modernisation, développement ou reprise d’activité de production de biens ou de services ou commerciale exclusivement sur un territoire rural et de montagne et dans des communes de moins de 1 000 habitants.',
      depensesEligibles: [
        'Achats et aménagement d’équipements professionnels, notamment productifs,',
        'Véhicules de tournées de marchands ambulants alimentaires, ou d’activités artisanales de services dans le dit-véhicule, desservant exclusivement une zone rurale,',
        'Dépenses d’investissement visant notamment à la modernisation des entreprises et des locaux d’activités (vitrines incluses) ; à la sécurisation des entreprises et des locaux d’activités contre les effractions ; à favoriser l’accessibilité physique et numérique des entreprises à tous les publics ; à favoriser la transition écologique, énergétique et numérique,',
        'Fonds de commerce ou artisanal et parts sociales ou actions,',
        'Frais d’études, de conseil et d’accompagnement liés aux investissements matériels et/ou au développement d’activités particulièrement performants ou novateurs en matière d’environnement, d’économie sociale et solidaire, de digitalisation et d’innovation servicielle.'
      ],
      formeAide: [
        'L’aide prend la forme d’une **subvention** dont l’intensité maximale peut atteindre : jusqu’à 70 % des dépenses éligibles pour les TPE, jusqu’à 60 % des dépenses éligibles pour les PE et jusqu’à 50 % pour les PME.',
        'Le montant minimal de l’aide est fixé à **5 000 €**.',
        'Le montant total des aides accordées à une entreprise unique ne peut excéder le plafond prévu par le règlement (UE) 2023/2831 de la Commission du 13 décembre 2023 relatif **aux aides de minimis**, soit **300 000 euros** sur une période glissante de trois ans.'
      ]
    }
  },

  // =========================================================================
  // GUIDE DES AIDES ADEC - VERSION 2026 (Soumis à l'évaluation qualitative 21/177 AC)
  // =========================================================================
  {
    id: 'riesce',
    code: 'GDA-01',
    name: 'Dispositif « RIESCE »',
    subtitle: 'Soutien à la création d’emploi et démarche de responsabilité sociétale (RSE)',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Règlement (UE) 2023/2831 de la Commission du 13 décembre 2023 (de minimis, 300 000 € sur 3 ans)',
    governingDeliberation: 'Délibération N° 21/177 AC de l’Assemblée de Corse du 28 octobre 2021 (Évaluation qualitative préalable obligatoire : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Mesure unique de soutien à la création d’emploi visant à accompagner les entreprises qui s’engagent dans une démarche de responsabilité sociétale de l’entreprise (RSE) sur son volet social.',
    targetBeneficiariesSummary: 'TPE, PE et PME installées en Corse avec exploitation principale, pour recrutements externes, CDD en CDI, mobilité interne qualifiante, création de l’emploi du dirigeant sociétal.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE', 'PROFESSION_LIBERALE'],
    specificRequirements: [
      'Obtention d’au moins 3 « OUI » à la grille d’évaluation qualitative (Délibération 21/177 AC)',
      'Engagement RSE volet social formel',
      'Maintien obligatoire de l’emploi créé pendant au moins 3 ans',
      'Remplacement du salarié dans un délai maximal de 6 mois en cas de départ',
      'Respect des obligations relatives au CSE, participation, ITRC et lutte contre le travail dissimulé',
      'Attention prioritaire portée aux publics en difficulté d’insertion, jeunes diplômés, travailleurs handicapés, + de 50 ans, emplois qualifiés et cadres'
    ],
    eligibleExpenseCategories: [
      'Aide forfaitaire à la création de poste (aucun coût spécifique d’assiette n’est exigé, calcul sur grille de scoring RSE)'
    ],
    ineligibleExpenseCategories: [
      'Emplois non maintenus 3 ans',
      'Emplois précaires saisonniers non pérennisés'
    ],
    rates: {
      flatAmount: {
        min: 5000,
        max: 11000,
        label: 'Subvention forfaitaire par poste selon scoring RSE et développement',
        specialBonus: {
          amount: 10000,
          label: 'Majoration complémentaire « Retour des talents » pouvant atteindre jusqu’à 10 000 €'
        }
      },
      floorAmount: 5000,
      ceilingAmount: 21000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt en ligne sur le site de l’ADEC avec auto-évaluation RSE',
      decisionBody: 'Instruction des critères RSE par l’ADEC et décision par le Bureau de l’ADEC',
      requiredDocuments: [
        'Présentation de l’entreprise',
        'Description détaillée du projet de recrutement / consolidation RH',
        'Évaluation documentée des critères RSE',
        'Déclaration de minimis sur 3 derniers exercices'
      ],
      mandatoryCommitments: [
        'Maintien de l’emploi pendant 3 ans minimum',
        'Remplacement sous 6 mois en cas de rupture de contrat',
        'Mention de la Collectivité de Corse et de l’ADEC',
        'Contrôles sur 3 ans'
      ],
      controlDurationYears: 3
    },
    sourceDocumentPages: 'Pages 30 à 33',
    isActive: true
  },
  {
    id: 'pattu_innuvazione_amorcage',
    code: 'GDA-02A',
    name: 'U Pattu Innuvazione – Phase Amorçage / Démarrage',
    subtitle: 'Instrument de 1er niveau d’encouragement à l’émergence de projets innovants',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Règlement (UE) n° 2023/2831 de minimis (300 000 € sur 3 ans)',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative préalable : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Inciter les bénéficiaires à s’engager dans des processus d’innovation pour planifier et développer de nouveaux produits, procédés de fabrication ou services, ou pour en améliorer la qualité.',
    targetBeneficiariesSummary: 'Petites Entreprises (PE < 50 personnes, CA ou bilan ≤ 10 M€) installées en Corse n’ayant pas eu recours à une aide publique directe à la R&D au cours de l’année précédant la demande.',
    allowedSizes: ['TPE', 'PE'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Ne pas avoir bénéficié d’une aide directe à la R&D dans l’année précédant la demande',
      'La demande doit être obligatoirement déposée avant la réalisation des dépenses',
      'Respect du plafond de minimis (300 000 € sur 3 ans glissants)'
    ],
    eligibleExpenseCategories: [
      'Études sur la mise en œuvre d’idées innovantes (concept, accompagnement, solutions technologiques)',
      'Travaux préparatoires pour une recherche et développement',
      'Appui au développement des prototypes',
      'Analyse du transfert de technologie et potentiel d’innovation',
      'Innovations en matière de gestion sociale de l’entreprise',
      'Frais de propriété intellectuelle (PI)',
      'Études de faisabilité technique et économique',
      'Études de marché pour un produit ou service innovant',
      'Frais de conseil pour vérifier la pertinence et formaliser le plan d’actions',
      'Participation à des événements en lien avec l’innovation (concours, foire, salon)'
    ],
    ineligibleExpenseCategories: [
      'Dépenses engagées avant la demande',
      'Matériel de renouvellement courant',
      'TVA récupérable'
    ],
    rates: {
      peMaxRate: 0.70, // jusqu'à 70% pour PE
      tpeMaxRate: 0.90, // majorable jusqu'à 90% pour TPE (< 10 pers / CA ou bilan ≤ 2 M€)
      floorAmount: 5000,
      ceilingAmount: 15000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt en ligne préalable sur le site de l’ADEC (AMI, bourse, concours ou appel à projet)',
      decisionBody: 'Processus d’évaluation qualitative, accompagnement ADEC, puis décision du Bureau de l’ADEC',
      requiredDocuments: [
        'Dossier de présentation de l’innovation',
        'Plan d’actions et devis détaillés des prestataires ou études',
        'Attestation de non-bénéfice d’aide R&D sur les 12 derniers mois',
        'Déclaration de minimis'
      ],
      mandatoryCommitments: [
        'Mention obligatoire de l’ADEC et de la CdC',
        'Contrôle sur pièce et sur place durant l’exécution et 1 an minimum après fin du programme'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Pages 34 à 36',
    isActive: true
  },
  {
    id: 'pattu_innuvazione_developpement',
    code: 'GDA-02B',
    name: 'U Pattu Innuvazione – Phase Développement',
    subtitle: 'Instrument de 2nd niveau accompagnant l’émergence et le développement de l’innovation',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Règlement (UE) n° 2023/2831 de minimis (en vigueur jusqu’au 31/12/2030)',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative préalable : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Accompagner plus spécifiquement la phase d’émergence et de déploiement de l’innovation pour les entreprises pleinement engagées dans un processus de R&D.',
    targetBeneficiariesSummary: 'PME au sens européen (< 250 personnes, CA ≤ 50 M€ ou bilan ≤ 43 M€) ayant leur exploitation principale en Corse.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Demande obligatoirement déposée avant la réalisation des dépenses',
      'Un même bénéficiaire peut obtenir max 2 aides au développement sur une période de 3 ans dans la limite du plafond de minimis'
    ],
    eligibleExpenseCategories: [
      'Frais de personnel R&D (chercheurs, techniciens et personnels d’appui)',
      'Coûts des instruments et du matériel (amortissement au prorata de l’utilisation pour le projet)',
      'Coûts de la recherche contractuelle, connaissances et brevets pris sous licence',
      'Services de conseil utilisés exclusivement pour le projet',
      'Frais généraux additionnels et coûts des consommables/matériaux supportés directement',
      'Obtention, validation et défense des brevets et actifs incorporels',
      'Services de conseil et d’appui en matière d’innovation'
    ],
    ineligibleExpenseCategories: [
      'Dépenses engagées avant la demande',
      'Frais généraux courants non imputables à la R&D'
    ],
    rates: {
      pmeMaxRate: 0.50, // max 50%
      tpeMaxRate: 0.70, // majorable jusqu'à 70% pour TPE ou collaboration incluant une TPE corse
      floorAmount: 15000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt en ligne sur le site de l’ADEC',
      decisionBody: 'Évaluation qualitative préalable, avis d’experts puis décision souveraine du Bureau de l’ADEC',
      requiredDocuments: [
        'Dossier technique de R&D détaillé',
        'Fiches de temps et qualifications du personnel R&D',
        'Plan d’amortissement des instruments',
        'Contrats de prestation et de propriété intellectuelle',
        'Déclaration de minimis'
      ],
      mandatoryCommitments: [
        'Affichage public du soutien ADEC et CdC',
        'Contrôle sur pièce et sur place durant l’exécution et 1 an minimum après'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Pages 37 à 39',
    isActive: true
  },
  {
    id: 'pattu_innuvazione_rd_structurant',
    code: 'GDA-02C',
    name: 'U Pattu Innuvazione – R&D Privée et Innovation Structurants',
    subtitle: 'Aide aux infrastructures de recherche, pôles d’innovation et projets structurants',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Régime cadre exempté de notification n° SA.111723 relatif aux aides à la recherche, au développement et à l’innovation (RDI 2024-2026)',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative préalable : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Soutien aux projets de recherche industrielle et développement expérimental, investissements dans des infrastructures de recherche, pôles d’innovation et innovation de procédé/organisation.',
    targetBeneficiariesSummary: 'PME en Corse portant un projet R&D structurant pour le territoire ou une filière.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Conformité stricte au régime SA.111723 RDI',
      'Caractère structurant pour une filière insulaire ou démonstration de retombées territoriales',
      'Cofinancement possible venant en complément'
    ],
    eligibleExpenseCategories: [
      'Coûts admissibles conformes au régime cadre SA.111723 (RDI)',
      'Investissements pour infrastructures de recherche',
      'Innovation de procédé et d’organisation',
      'Pôles d’innovation et plateformes mutualisées'
    ],
    ineligibleExpenseCategories: [
      'Dépenses courantes de production',
      'Renouvellement matériel sans rupture technologique'
    ],
    rates: {
      floorAmount: 5000,
      ceilingAmount: 300000,
      tpeMaxRate: 0.70,
      peMaxRate: 0.60,
      pmeMaxRate: 0.50
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Appels à projets ou AMI lancés par l’ADEC',
      decisionBody: 'Instruction technique approfondie et décision du Bureau de l’ADEC',
      requiredDocuments: [
        'Dossier RDI complet conforme aux règles européennes SA.111723',
        'Démonstration du caractère structurant territorial/filière',
        'Justificatifs financiers et accords de consortium le cas échéant'
      ],
      mandatoryCommitments: [
        'Publicité institutionnelle CdC / ADEC',
        'Contrôles réglementaires'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Pages 40 à 42',
    isActive: true
  },
  {
    id: 'impresa_si_creation',
    code: 'GDA-03A',
    name: 'IMPRESA SÌ – Phase Création Structurante',
    subtitle: 'Aide à la création d’une entreprise de taille structurante pour l’économie insulaire',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Règlement (UE) N° 651/2014 et Régime cadre exempté de notification n° SA.111728 (PME 2024-2026)',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative préalable : ≥ 3 OUI) & SRDE2I',
    requiresQualitativeEvaluation: true,
    objective: 'Développer une activité économique nouvelle et/ou complémentaire du tissu corse, notamment en apportant de nouvelles approches en termes d’adaptation aux transitions industrielles, commerciales, numériques et écologiques.',
    targetBeneficiariesSummary: 'Petites Entreprises (< 50 salariés, CA ou bilan ≤ 10 M€) enregistrées depuis 5 ans maximum, n’ayant pas encore distribué de bénéfices et non issues d’une concentration.',
    allowedSizes: ['TPE', 'PE'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Entreprise créée depuis 5 ans au maximum',
      'Ne pas avoir encore distribué de bénéfices (dividendes)',
      'Ne pas être issue d’une concentration ou fusion',
      'Non affiliée à un réseau de franchise ou à une enseigne',
      'Cohérence avec les orientations du SRDE2I et viabilité démontrée'
    ],
    eligibleExpenseCategories: [
      'Coûts admissibles jeunes pousses (startups) selon régime cadre SA.111728',
      'Investissements productifs initiaux',
      'Frais d’établissement, logiciels, matériels professionnels de démarrage'
    ],
    ineligibleExpenseCategories: [
      'Entreprises en franchise ou sous enseigne',
      'Entreprises ayant déjà distribué des dividendes'
    ],
    rates: {
      floorAmount: 5000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt en ligne sur le site de l’ADEC (mobilisation possible de la plateforme Fin’Impresa)',
      decisionBody: 'Instruction ADEC et validation par le Bureau de l’ADEC',
      requiredDocuments: [
        'Business plan complet et prévisionnel à 3 ans',
        'Kbis attestant de moins de 5 ans d’existence',
        'Attestation de non-distribution de bénéfices',
        'Attestation d’indépendance vis-à-vis de toute franchise ou groupe'
      ],
      mandatoryCommitments: [
        'Maintien de l’activité en Corse',
        'Publication de l’aide au rapport d’activité annuel de l’ADEC',
        'Mention CdC / ADEC'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Pages 43 à 46',
    isActive: true
  },
  {
    id: 'impresa_si_developpement_invest',
    code: 'GDA-03B',
    name: 'IMPRESA SÌ – Phase Développement (Investissements PME & Véhicules Propres)',
    subtitle: 'Croissance, modernisation des capacités, transition écologique, numérique et mobilité propre',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Règlement (UE) n° 2023/2831 de minimis (300 000 € sur 3 ans)',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative préalable : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Développer son activité, améliorer sa compétitivité par l’accroissement/modernisation de ses capacités de production, s’adapter aux transitions numériques et écologiques, ou mutualiser ses outils.',
    targetBeneficiariesSummary: 'PME en Corse (< 250 personnes, CA ≤ 50 M€ / bilan ≤ 43 M€) réalisant un projet d’investissement productif.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Exclusion des entreprises affiliées à un réseau de franchise ou enseigne',
      'Demande obligatoire avant engagement des dépenses',
      'Dépenses numériques éligibles : matériel informatique, logiciels, cybersécurité, site web transactionnel/fonctionnel (site vitrine/plaquette exclu !), hébergement 6 mois max',
      'Véhicules de transport propres : Véhicules de tourisme exclus. Un seul véhicule par entreprise sur 3 ans (achat comptant, LOA ou crédit-bail). Véhicule hybride élec/essence, électrique ou GNV. Preuve obligatoire de mise au rebut de l’ancien véhicule en cas de remplacement. Non cumulable avec autres aides d’État/AUE/CdC'
    ],
    eligibleExpenseCategories: [
      'Frais généraux et achats consommés ou incorporés',
      'Prestations externes (études, propriété industrielle)',
      'Investissements matériels et immatériels affectés au programme',
      'Frais de formation pour l’acquisition d’une compétence ou brevet',
      'Investissements numériques (matériel informatique, logiciels, cybersécurité, site web avec fonctionnalité)',
      'Investissements écologiques (déchets, énergie, eau, éco-construction, normes environnementales)',
      'Véhicules propres professionnels (utilitaires, fourgons, poids lourds électriques/hybrides/GNV)'
    ],
    ineligibleExpenseCategories: [
      'Site vitrine ou site plaquette sans fonctionnalité',
      'Frais d’installation de logiciels courants',
      'Véhicules de tourisme',
      'Véhicules thermiques classiques',
      'Dépenses de R&D (qui relèvent du Pattu Innuvazione)',
      'Franchises ou enseignes'
    ],
    rates: {
      pmeMaxRate: 0.30, // 30% taux standard
      tpeMaxRate: 0.50, // majorable jusqu'à 50% pour TPE (< 10 pers / CA ou bilan ≤ 2 M€) ou collaboration avec TPE
      floorAmount: 5000,
      ceilingAmount: 300000,
      cleanVehiclesRates: {
        rate: 0.15, // 15% du montant HT hors options et hors bonus d'État
        utilitaireLightCap: 3000, // < 2.5 t
        fourgonCap: 7000,         // PTAC 2.5 à 3.5 t
        poidsLourdCap: 10000      // PTAC > 3.5 t
      }
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt du dossier en ligne sur le site de l’ADEC',
      decisionBody: 'Évaluation qualitative par l’ADEC, instruction technique et arrêté en Bureau de l’ADEC',
      requiredDocuments: [
        'Descriptif détaillé du projet d’investissement',
        'Devis des équipements / prestations',
        'Pour véhicules : certificat de mise au rebut de l’ancien véhicule, bon de commande spécifiant motorisation propre',
        'Pour site web : cahier des charges démontrant la fonctionnalité applicative',
        'Déclaration de minimis'
      ],
      mandatoryCommitments: [
        'Mention du soutien ADEC / CdC',
        'Contrôle sur pièce et sur place 1 an post-programme',
        'Non-revente immédiate des équipements financés'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Pages 47 à 51',
    isActive: true
  },
  {
    id: 'impresa_si_developpement_structurant',
    code: 'GDA-03C',
    name: 'IMPRESA SÌ – Phase Développement (Investissements Structurants)',
    subtitle: 'Projets d’investissement apportant une réelle plus-value à un secteur, une filière ou un territoire',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Règl. (UE) 651/2014 & Régimes cadres exemptés : SA.111728 (PME), SA.119559 (Finalité territoriale), SA.111729 (Financement), SA.111722 (Formation)',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative : ≥ 3 OUI) & SRDE2I',
    requiresQualitativeEvaluation: true,
    objective: 'Soutenir les investissements d’envergure apportant la démonstration d’une réelle plus-value à l’échelle d’un secteur d’activité, d’une filière ou d’un territoire en Corse.',
    targetBeneficiariesSummary: 'PME en Corse dont le projet présente un caractère structurant majeur.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Démontrer la plus-value pour toute la filière ou le territoire insulaire',
      'Cohérence avec les axes stratégiques du SRDE2I',
      'Non affiliée à une franchise'
    ],
    eligibleExpenseCategories: [
      'Coûts admissibles selon les régimes cadres SA.111728, SA.119559, SA.111729 et SA.111722',
      'Investissements corporels et incorporels structurants',
      'Actions de formation associées'
    ],
    ineligibleExpenseCategories: [
      'Investissements de simple renouvellement d’équipements sans impact structurant'
    ],
    rates: {
      floorAmount: 5000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt en ligne sur le portail ADEC',
      decisionBody: 'Instruction et passage en Bureau de l’ADEC',
      requiredDocuments: [
        'Mémoire de présentation démontrant la dimension structurante territoriale/filière',
        'Plan financier global et conventions de partenariat',
        'Justificatifs de viabilité et d’emplois créés/maintenus'
      ],
      mandatoryCommitments: [
        'Publicité ADEC et Collectivité de Corse',
        'Contrôles réglementaires'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Pages 52 à 55',
    isActive: true
  },
  {
    id: 'impresa_si_reprise_transmission',
    code: 'GDA-03D',
    name: 'IMPRESA SÌ – Reprise-Transmission',
    subtitle: 'Bouclage du tour de table financier pour la reprise de fonds de commerce ou de parts sociales',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Règlement (UE) n° 2023/2831 de minimis (300 000 € sur 3 ans)',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Boucler le tour de table financier du projet de reprise-transmission, contribuer au renforcement des fonds propres ou dépenses nécessaires à l’acquisition de l’entreprise.',
    targetBeneficiariesSummary: 'Repreneurs de PME en Corse (personnes physiques ou morales) acquérant la majorité du capital.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'L’entreprise bénéficiaire doit détenir la majorité du capital à l’issue de la reprise',
      'L’aide est conditionnée à l’intervention d’au moins un partenaire bancaire et/ou outil financier dans le financement du projet',
      'L’entreprise cible doit certifier être inscrite ou enregistrée depuis au moins 12 mois à la date de la demande',
      'Fourniture obligatoire d’une évaluation indépendante de la valeur de l’opération réalisée par un expert',
      'Engagement ferme de maintenir et de ne pas céder à nouveau l’activité pendant au moins 5 ans à compter de l’octroi'
    ],
    eligibleExpenseCategories: [
      'Rachat du fonds de commerce ou artisanal',
      'Rachat des parts sociales ou actions'
    ],
    ineligibleExpenseCategories: [
      'Le droit au bail s’il est vendu seul',
      'Les frais d’enregistrement'
    ],
    rates: {
      floorAmount: 5000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt de la demande en ligne sur le portail ADEC',
      decisionBody: 'Instruction ADEC et validation en Bureau de l’ADEC',
      requiredDocuments: [
        'Protocole d’accord ou compromis de cession',
        'Évaluation indépendante du coût de l’opération par un expert',
        'Accord de financement du partenaire bancaire ou outil financier',
        'Kbis de la cible attestant d’au moins 12 mois d’ancienneté',
        'Déclaration de minimis'
      ],
      mandatoryCommitments: [
        'Maintien de l’activité pendant 5 ans minimum sans revente (clause résolutoire)',
        'Détention de la majorité du capital par le repreneur',
        'Obligations de communication CdC / ADEC'
      ],
      controlDurationYears: 5
    },
    sourceDocumentPages: 'Pages 56 à 59',
    isActive: true
  },
  {
    id: 'sviluppu_suciale',
    code: 'GDA-04',
    name: 'SVILUPPU SUCIALE È SULIDARITÀ',
    subtitle: 'Aides directes aux associations et porteurs de projets de l’ESS (création, développement)',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Loi du 31 juillet 2014 relative à l’ESS & Règlement (UE) 2023/2831 de minimis (300 000 € sur 3 ans)',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Favoriser l’émergence ou le maintien d’activités économiques d’utilité sociale prioritaires en Corse, faciliter l’accès à l’emploi durable de publics en difficulté, aider les structures ESS et SIAE à s’équiper et acquérir leurs outils de production, intégration des travailleurs handicapés.',
    targetBeneficiariesSummary: 'Structures juridiques de l’ESS (Loi 31 juillet 2014, art. 1) assimilables à des PME installées en Corse. Remarque : les coopératives SCOP/SCIC relèvent d’Impresa Sì.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['ESS', 'SERVICES', 'ARTISANAT', 'COMMERCE', 'INDUSTRIE'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Structure juridique relevant de l’ESS (associations, structures d’insertion SIAE, fondations, mutuelles)',
      'Signature obligatoire d’une convention d’objectifs et de moyens avec l’ADEC détaillant les actions, cibles et indicateurs (au maximum 6 mois après attribution de l’aide)',
      'Déploiement exclusivement par appels à projets, AMI, bourse ou concours',
      'Justification de la modération de fonctionnement (échelle des salaires, rémunération des dirigeants) et respect des valeurs ESS',
      'Matériels de transport exclus sauf s’il s’agit de véhicules spécialisés pour personnes à mobilité réduite (TPMR) ou mobilité de personnes en difficulté sur le marché du travail'
    ],
    eligibleExpenseCategories: [
      'Frais de personnel dédiés au projet (prix de l’heure)',
      'Frais généraux et achats consommés ou incorporés',
      'Prestations externes (études, PI)',
      'Investissements matériels et immatériels affectés au programme',
      'Acquisition des biens immobiliers supports de production pour les SIAE',
      'Frais de formation pour acquisition de compétences/brevets',
      'Investissements numériques (matériels, logiciels, cybersécurité, site web fonctionnel)',
      'Investissements écologiques (déchets, énergie, eau, normes)',
      'Véhicules spécialisés TPMR ou mobilité d’insertion'
    ],
    ineligibleExpenseCategories: [
      'Véhicules de transport standard',
      'Dépenses de recherche et développement (qui relèvent d’aides RDI)',
      'Coopératives SCOP/SCIC (qui doivent postuler sous Impresa Sì)'
    ],
    rates: {
      pmeMaxRate: 0.50, // max 50% des coûts admissibles
      floorAmount: 5000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Candidature aux appels à projets ESS publiés par l’ADEC',
      decisionBody: 'Examen de conformité sociale, instruction ADEC et décision du Bureau de l’ADEC',
      requiredDocuments: [
        'Statuts ESS et déclaration légale',
        'Projet d’utilité sociale et modèle économique',
        'Grille des rémunérations et justificatifs de gouvernance participative',
        'Plan de financement prévisionnel',
        'Déclaration de minimis'
      ],
      mandatoryCommitments: [
        'Signature de la convention d’objectifs et de moyens sous 6 mois (peine de caducité et reversement)',
        'Contrôles ADEC sur place et sur pièce',
        'Respect de la charte des valeurs solidaires'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Pages 60 à 64',
    isActive: true
  },
  {
    id: 'impresamondu_individuel',
    code: 'GDA-05A',
    name: 'U PATTU IMPRESAMONDU – Actions Individuelles & Forfaits',
    subtitle: 'Prospection internationale, participation aux salons et communication multilingue',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Règlement (UE) 2023/2831 de minimis & Régime cadre exempté SA.111728',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Permettre aux entreprises corses d’initier et pérenniser leur développement par l’internationalisation (salons mondiaux, prospection, communication en langue étrangère).',
    targetBeneficiariesSummary: 'TPE et PME ayant leur siège ou établissement secondaire réel en Corse s’inscrivant dans une démarche d’internationalisation.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Si entreprise de négoce : disposer d’un contrat d’exclusivité avec le ou les producteurs représentés sur le marché visé',
      'Exclusion des aides directement liées aux quantités exportées ou à la mise en place d’un réseau de distribution physique à l’étranger',
      'Pas plus de 3 années d’accompagnement en prospection sur une même destination (sauf destination multiple type USA)',
      'Déplacements limités à 2 personnes ayant un lien direct avec l’entreprise'
    ],
    eligibleExpenseCategories: [
      'Participation à un salon international y compris en France (location espace, aménagement, transport matériel démo, inscription 2 pers, concours)',
      'Missions de prospection internationales (rencontres d’acheteurs à l’étranger ou accueil d’acheteurs en Corse)',
      'Frais de déplacement forfaitisés hors Corse',
      'Supports matériels et immatériels de promotion en langue étrangère (site internet multilingue avec e-commerce)',
      'Investissements immatériels de conseil spécialisé en internationalisation',
      'Prestations Business France (prise en charge 80% du coût d’un VIE, max 2 par entreprise par an)'
    ],
    ineligibleExpenseCategories: [
      'Aides directes proportionnelles aux volumes exportés',
      'Création et fonctionnement d’un réseau de distribution dans un autre pays',
      'Dépenses courantes de fonctionnement export'
    ],
    rates: {
      pmeMaxRate: 0.50, // 30 à 50% des coûts admissibles hors déplacements
      travelAllowances: {
        franceSalon: 600, // Salon international en France : 600 €
        euromed: 800,     // Forfait Euromed : 800 € / personne (max 2 pers = 1600 €)
        grandLarge: 1600   // Forfait Grand Large : 1600 € / personne (max 2 pers = 3200 €)
      },
      floorAmount: 5000,
      ceilingAmount: 30000 // Aide plafonnée à 30 000 € par entreprise et par opération
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Dépôt du dossier export en ligne sur le site de l’ADEC',
      decisionBody: 'Instruction ADEC et décision d’attribution par le Bureau de l’ADEC',
      requiredDocuments: [
        'Dossier de stratégie export / international',
        'Devis du salon ou devis de traduction / marketing multilingue',
        'Contrat d’exclusivité pour les négociants',
        'Déclaration de minimis'
      ],
      mandatoryCommitments: [
        'Obligation d’arborer la marque territoriale et le logo ADEC / Collectivité de Corse sur le stand et les supports',
        'Transmission des justificatifs de déplacement et de réalisation'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Pages 65 à 68',
    isActive: true
  },
  {
    id: 'impresamondu_stage',
    code: 'GDA-05B',
    name: 'U PATTU IMPRESAMONDU – Stage en Entreprise à l’Internationalisation',
    subtitle: 'Aide forfaitaire annuelle pour l’embauche d’un stagiaire dédié à l’internationalisation',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Délibération N° 21/177 AC & Régime SA.111728 / De minimis',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Faciliter l’accueil d’un étudiant qualifié en commerce international pour mener une mission concrète de conquête de marchés tiers.',
    targetBeneficiariesSummary: 'TPE et PME corses recrutant un stagiaire issu d’un cursus de formation territorial en commerce international (durée max 12 mois).',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Stagiaire issu d’un établissement de formation territorial corse (cursus internationalisation)',
      'Mission strictement dédiée à l’internationalisation de l’entreprise (max 12 mois)',
      'Indemnité de stage versée par l’entreprise ne pouvant être inférieure à 800 € nets mensuels',
      'Le stagiaire ne doit pas être inscrit à France Travail, ni bénéficier d’allocations de formation, de bourse ou d’autre activité',
      'Enveloppe globale territoriale annuelle contingentée à 6 stages par an (budget 36 000 €)'
    ],
    eligibleExpenseCategories: [
      'Forfait d’aide à la gratification de stage international'
    ],
    ineligibleExpenseCategories: [
      'Stages de moins de 800 € nets mensuels de gratification',
      'Missions sans rapport avec l’international'
    ],
    rates: {
      flatAmount: {
        min: 6000,
        max: 6000,
        label: 'Forfait fixe de 6 000 € par an et par stagiaire (1 par entreprise)'
      },
      floorAmount: 6000,
      ceilingAmount: 6000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Candidature à l’appel à projets annuel spécifique publié par l’ADEC',
      decisionBody: 'Sélection annuelle dans la limite du contingent de 6 stages puis Bureau de l’ADEC',
      requiredDocuments: [
        'Convention de stage tripartite avec établissement d’enseignement insulaire',
        'Fiche de mission détaillée de développement international',
        'Attestation sur l’honneur de l’étudiant'
      ],
      mandatoryCommitments: [
        'Paiement effectif de la gratification minimale de 800 € net/mois',
        'Rapport de fin de stage communiqué à l’ADEC'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Page 68',
    isActive: true
  },
  {
    id: 'impresamondu_collectif',
    code: 'GDA-05C',
    name: 'U PATTU IMPRESAMONDU – Actions Collectives à l’Export',
    subtitle: 'Pavillons régionaux et missions filières coordonnées par le CODITE ou l’ADEC',
    documentSourceId: 'base-adec-2026-officielle',
    category: 'Guide des Aides - Évaluation Qualitative',
    legalBasis: 'Règlement de minimis 2023/2831 & Cadre CODITE',
    governingDeliberation: 'Délibération N° 21/177 AC du 28 octobre 2021 (Évaluation qualitative : ≥ 3 OUI)',
    requiresQualitativeEvaluation: true,
    objective: 'Mobiliser les filières corses dans des démarches collectives d’exportation pour faire rayonner les savoir-faire insulaires.',
    targetBeneficiariesSummary: 'Groupements d’entreprises, fédérations ou entreprises participant aux opérations programmées CODITE / ADEC.',
    allowedSizes: ['TPE', 'PE', 'PME'],
    allowedSectors: ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'],
    excludedSectors: ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'],
    excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
    specificRequirements: [
      'Valider au moins 3 « OUI » à l’évaluation qualitative',
      'Opération programmée dans le cadre du CODITE ou appel à manifestation d’intérêt de l’ADEC',
      'Une entreprise engagée dans une action collective financée ne peut bénéficier d’une aide individuelle pour la même opération',
      'Participation à une même manifestation limitée à 3 années consécutives (sauf caractère avéré pour le rayonnement corse)'
    ],
    eligibleExpenseCategories: [
      'Stands collectifs insulaires sur salons de référence',
      'Logistique partagée de démonstration',
      'Campagnes de communication collective territoriale'
    ],
    ineligibleExpenseCategories: [
      'Double financement d’une même opération sous forme individuelle'
    ],
    rates: {
      floorAmount: 5000,
      ceilingAmount: 300000
    },
    procedure: {
      portalUrl: 'https://www.adec.corsica',
      submissionMethod: 'Réponse aux AMI lancés par le CODITE ou l’ADEC',
      decisionBody: 'Comité de sélection CODITE / ADEC et arrêté en Bureau',
      requiredDocuments: [
        'Dossier de candidature filière / groupement',
        'Convention de groupement le cas échéant'
      ],
      mandatoryCommitments: [
        'Arborer les couleurs de la Corse et les mentions officielles',
        'Bilan chiffré des retombées commerciales'
      ],
      controlDurationYears: 1
    },
    sourceDocumentPages: 'Page 68',
    isActive: true
  }
];

export const OFFICIAL_DOCUMENTARY_DATABASE: DocumentaryDatabaseMetadata = {
  id: 'base-adec-2026-officielle',
  title: 'Guide des Aides & Pattu Risilienzia è Territorii (ADEC 2026)',
  version: '2026.1 (Délibération 21/177 AC)',
  issuer: 'Agence de Développement Économique de la Corse (ADEC) / Cullettività di Corsica',
  dateAdopted: '2026 (Mise à jour Délibération N° 21/177 AC & Règl. UE 2023/2831)',
  description: 'Base réglementaire officielle et intégrale des aides économiques directes de la Collectivité de Corse pour les entreprises : Annexe 1 (Risilienza, Rinascita, Ribumbà, Impresi Paisani) et Guide 2026 (RIESCE, Innuvazione, Impresa Sì, Sviluppu Suciale, Impresamondu).',
  isOfficialBase: true,
  schemesCount: OFFICIAL_ADEC_SCHEMES.length,
  schemes: OFFICIAL_ADEC_SCHEMES
};

export const QUALITATIVE_EVALUATION_QUESTIONS = [
  {
    id: 'q1_nonDelocalisableValueAdded',
    code: 'CRIT-01',
    title: 'Activité non délocalisable, à valeur ajoutée & emplois durables',
    label: 'Le projet est centré sur une activité de production de biens ou de services non délocalisables, génératrice de valeur ajoutée et d’emplois durables ?',
    clarification: '(hors activités saisonnières, hors commerce, et ne relevant pas de simples investissements de renouvellement)',
    legalSource: 'Page 28 du Guide des Aides ADEC (Délibération N° 21/177 AC)'
  },
  {
    id: 'q2_ecologicalEnergyDigitalTransition',
    code: 'CRIT-02',
    title: 'Démarche significative de transition écologique, énergétique ou numérique',
    label: 'Le projet s’inscrit dans une démarche significative de transition écologique, numérique ou énergétique, se concrétisant par des choix significatifs ?',
    clarification: 'Exemples : réduction d’empreinte carbone, maîtrise de l’énergie, traitement des eaux, digitalisation de processus, etc.',
    legalSource: 'Page 28 du Guide des Aides ADEC'
  },
  {
    id: 'q3_innovativeTechnologicalOrSocial',
    code: 'CRIT-03',
    title: 'Caractère innovant (technologique, social, produit ou organisationnel)',
    label: 'Le projet est innovant (innovation technologique ou sociale tant au plan des produits que des procédés, voire de l’organisation) se concrétisant par des choix significatifs ?',
    clarification: 'Nouveaux procédés, nouveaux services novateurs, nouvelles pratiques managériales ou sociales.',
    legalSource: 'Page 28 du Guide des Aides ADEC'
  },
  {
    id: 'q4_ruralOrQpvZone',
    code: 'CRIT-04',
    title: 'Implantation en zone rurale ou Quartier Politique de la Ville (QPV)',
    label: 'Le projet est porté par une entreprise située dans une zone rurale ou dans un quartier de la politique de la ville, au sein desquels il permet de créer/maintenir une activité et de l’emploi ?',
    clarification: 'Zonage SALVEZZA, communes < 1000 habitants, zones isolées de montagne ou QPV.',
    legalSource: 'Page 28 du Guide des Aides ADEC'
  },
  {
    id: 'q5_strategicFiliereOrAdecAccompanied',
    code: 'CRIT-05',
    title: 'Filière stratégique ou action de revitalisation ADEC',
    label: 'Le projet s’inscrit dans une filière, un écosystème ou une action de revitalisation stratégique déjà accompagnée par l’ADEC ?',
    clarification: 'Filières prioritaires identifiées dans le SRDE2I ou programmes d’actions concertés ADEC.',
    legalSource: 'Page 28 du Guide des Aides ADEC'
  },
  {
    id: 'q6_clusterThreeCompanies',
    code: 'CRIT-06',
    title: 'Grappe d’entreprises / Logique coopérative inter-filières',
    label: 'Le projet est porté ou intéresse une grappe d’au moins trois entreprises qui se regroupent en préfiguration d’une structuration en filière ou dans une logique coopérative inter-filière ?',
    clarification: 'Coopérations inter-entreprises corses, mutualisation d’outils productifs.',
    legalSource: 'Page 28 du Guide des Aides ADEC'
  },
  {
    id: 'q7_internationalizationCorsicaRadiance',
    code: 'CRIT-07',
    title: 'Internationalisation & Rayonnement économique de la Corse',
    label: 'Le projet est porté par des entreprises, filières ou opérateurs économiques contribuant à l’internationalisation ou au rayonnement économique de la Corse ?',
    clarification: 'Exportation de savoir-faire insulaire, conquête de marchés nationaux ou internationaux.',
    legalSource: 'Page 28 du Guide des Aides ADEC'
  },
  {
    id: 'q8_corsicanLanguageAndCulture',
    code: 'CRIT-08',
    title: 'Valorisation de la langue et de la culture corse',
    label: 'Le projet valorise la langue et la culture corse ?',
    clarification: 'Intégration de la langue corse dans la communication, promotion du patrimoine immatériel et culturel insulaire.',
    legalSource: 'Page 28 du Guide des Aides ADEC'
  }
];
