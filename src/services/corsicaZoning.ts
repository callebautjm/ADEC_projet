/**
 * Service de Typologie Territoriale et Zonage Géographique en Corse
 * Fondé sur les délibérations de la Collectivité de Corse, le Plan SALVEZZA,
 * la Délibération 21/177 AC et le Guide des Aides ADEC 2026.
 */

import { CorsicaLocationType, SalvezzaCommune } from '../types';
import { findSalvezzaCommuneByCode, findSalvezzaCommuneByName } from '../data/salvezzaCommunes';

export interface CorsicaCommuneReference {
  name: string;
  postalCode: string;
  inseeCode?: string;
  departement: '2A' | '2B';
  defaultLocationType: CorsicaLocationType;
  populationCategory: '< 1 000 hab' | '1 000 à 8 000 hab' | '> 8 000 hab';
  isSalvezza: boolean;
  microregion: string;
  hasQpv?: boolean;
  qpvNeighborhoods?: string[];
}

export interface CorsicaZoningAnalysis {
  isCorsica: boolean;
  communeName: string;
  postalCode: string;
  departement: '2A' | '2B' | 'AUTRE';
  locationType: CorsicaLocationType;
  populationCategory: '< 1 000 hab' | '1 000 à 8 000 hab' | '> 8 000 hab' | 'Hors Corse';
  microregion?: string;
  isSalvezza: boolean;
  salvezzaCommune?: SalvezzaCommune;
  hasQpv: boolean;
  qpvNeighborhoods: string[];
  selectedQpv?: string;
  // Conséquences réglementaires ADEC
  impresiPaisaniEligible: boolean;
  impresiPaisaniNote: string;
  qualitativeCrit4Valid: boolean;
  qualitativeCrit4Note: string;
  territorialBonusEligible: boolean;
  badgeLabel: string;
  badgeColor: 'emerald' | 'sky' | 'indigo' | 'slate' | 'red';
  summaryText: string;
}

// Registre des Quartiers Prioritaires de la Politique de la Ville (QPV) en Corse
export const CORSICA_QPV_REGISTRY: Record<string, string[]> = {
  'AJACCIO': ['Les Cannes', 'Les Salines', "Quartier de l'Empereur", 'Quartier Saint-Jean'],
  'BASTIA': ['Quartiers Sud (Lupino, Montésoro)', 'Centre Ancien / Citadelle'],
  'PORTO-VECCHIO': ['Quartier de Pifano']
};

/**
 * Référentiel des communes et pôles territoriaux de Corse
 */
export const CORSICA_COMMUNES_DATABASE: CorsicaCommuneReference[] = [
  // --- CORSE-DU-SUD (2A) ---
  // Pôles Urbains et Périurbains
  {
    name: 'Ajaccio',
    postalCode: '20000',
    departement: '2A',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '> 8 000 hab',
    isSalvezza: false,
    microregion: 'Pays Ajaccien (CAPA)',
    hasQpv: true,
    qpvNeighborhoods: CORSICA_QPV_REGISTRY['AJACCIO']
  },
  {
    name: 'Ajaccio',
    postalCode: '20090',
    departement: '2A',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '> 8 000 hab',
    isSalvezza: false,
    microregion: 'Pays Ajaccien (CAPA)',
    hasQpv: true,
    qpvNeighborhoods: CORSICA_QPV_REGISTRY['AJACCIO']
  },
  {
    name: 'Porto-Vecchio',
    postalCode: '20137',
    departement: '2A',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '> 8 000 hab',
    isSalvezza: false,
    microregion: 'Extrême-Sud',
    hasQpv: true,
    qpvNeighborhoods: CORSICA_QPV_REGISTRY['PORTO-VECCHIO']
  },

  // Pôles structurants intérieurs / bassins de vie intermédiaires
  {
    name: 'Sartène',
    postalCode: '20100',
    inseeCode: '2A272',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Sartenais'
  },
  {
    name: 'Propriano',
    postalCode: '20110',
    inseeCode: '2A249',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Valinco'
  },
  {
    name: 'Bonifacio',
    postalCode: '20169',
    inseeCode: '2A041',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Extrême-Sud'
  },
  {
    name: 'Grosseto-Prugna / Porticcio',
    postalCode: '20128',
    inseeCode: '2A130',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Taravo Ornano'
  },
  {
    name: 'Vico',
    postalCode: '20160',
    inseeCode: '2A348',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Ouest Corse / Deux-Sorru'
  },
  {
    name: 'Cargèse',
    postalCode: '20130',
    inseeCode: '2A065',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Ouest Corse / Deux-Sevi'
  },
  {
    name: 'Alata',
    postalCode: '20167',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Pays Ajaccien (CAPA)'
  },
  {
    name: 'Afa',
    postalCode: '20167',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Pays Ajaccien (CAPA)'
  },
  {
    name: 'Sarrola-Carcopino',
    postalCode: '20167',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Pays Ajaccien (CAPA)'
  },
  {
    name: 'Peri',
    postalCode: '20167',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Pays Ajaccien'
  },
  {
    name: 'Pietrosella',
    postalCode: '20166',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Ornano Rive Sud'
  },
  {
    name: 'Albitreccia',
    postalCode: '20128',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Ornano Rive Sud'
  },
  {
    name: 'Figari',
    postalCode: '20114',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Extrême-Sud'
  },
  {
    name: 'Pianottoli-Caldarello',
    postalCode: '20131',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Extrême-Sud'
  },
  {
    name: 'Monacia-d’Aullène',
    postalCode: '20171',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Extrême-Sud / Freto'
  },
  {
    name: 'Zonza / Sainte-Lucie',
    postalCode: '20124',
    departement: '2A',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Alta Rocca / Côte des Nacres'
  },
  {
    name: 'Levie',
    postalCode: '20170',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Alta Rocca'
  },
  {
    name: 'Sainte-Lucie-de-Tallano',
    postalCode: '20112',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Alta Rocca'
  },
  {
    name: 'Petreto-Bicchisano',
    postalCode: '20140',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Taravo'
  },
  {
    name: 'Cozzano',
    postalCode: '20148',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Haut Taravo (Montagne)'
  },
  {
    name: 'Zicavo',
    postalCode: '20132',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Haut Taravo (Montagne)'
  },
  {
    name: 'Bastelica',
    postalCode: '20119',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Prunelli / Montagne'
  },
  {
    name: 'Bocognano',
    postalCode: '20136',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Haute Gravona (Montagne)'
  },
  {
    name: 'Evisa',
    postalCode: '20126',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Deux-Sevi / Forêt d’Aïtone'
  },
  {
    name: 'Piana',
    postalCode: '20115',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Deux-Sevi / Calanques'
  },
  {
    name: 'Ota / Porto',
    postalCode: '20150',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Deux-Sevi / Golfe de Porto'
  },
  {
    name: 'Santa-Maria-Siché',
    postalCode: '20190',
    departement: '2A',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Ornano'
  },

  // --- HAUTE-CORSE (2B) ---
  // Pôles Urbains et Périurbains
  {
    name: 'Bastia',
    postalCode: '20200',
    departement: '2B',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '> 8 000 hab',
    isSalvezza: false,
    microregion: 'Grand Bastia (CAB)',
    hasQpv: true,
    qpvNeighborhoods: CORSICA_QPV_REGISTRY['BASTIA']
  },
  {
    name: 'Bastia',
    postalCode: '20600',
    departement: '2B',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '> 8 000 hab',
    isSalvezza: false,
    microregion: 'Grand Bastia (CAB)',
    hasQpv: true,
    qpvNeighborhoods: CORSICA_QPV_REGISTRY['BASTIA']
  },
  {
    name: 'Furiani',
    postalCode: '20600',
    departement: '2B',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Grand Bastia (CAB)'
  },
  {
    name: 'Biguglia',
    postalCode: '20620',
    departement: '2B',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Plaine de la Marana'
  },
  {
    name: 'Borgo',
    postalCode: '20290',
    departement: '2B',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Plaine de la Marana'
  },
  {
    name: 'Lucciana',
    postalCode: '20290',
    departement: '2B',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Plaine de la Marana'
  },

  // Pôles structurants intérieurs / bassins de vie intermédiaires
  {
    name: 'Corte',
    postalCode: '20250',
    inseeCode: '2B096',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Centre Corse (Pôle Universitaire et Montagneux)'
  },
  {
    name: 'Ghisonaccia',
    postalCode: '20240',
    inseeCode: '2B123',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Plaine Orientale'
  },
  {
    name: 'Calvi',
    postalCode: '20260',
    inseeCode: '2B050',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Balagne'
  },
  {
    name: 'L’Île-Rousse',
    postalCode: '20220',
    inseeCode: '2B134',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Balagne'
  },
  {
    name: 'Saint-Florent',
    postalCode: '20217',
    inseeCode: '2B298',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Nebbiu Conca d’Oru'
  },
  {
    name: 'Cervione / Prunete',
    postalCode: '20221',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Costa Verde'
  },
  {
    name: 'Prunelli-di-Fiumorbo',
    postalCode: '20243',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Fiumorbu'
  },
  {
    name: 'Aléria',
    postalCode: '20270',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Plaine Orientale'
  },
  {
    name: 'Morosaglia / Ponte-Leccia',
    postalCode: '20218',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Castagniccia / Carrefour ferroviaire intérieur'
  },
  {
    name: 'Calenzana',
    postalCode: '20214',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Balagne'
  },
  {
    name: 'Vescovato',
    postalCode: '20215',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Casinca'
  },
  {
    name: 'Penta-di-Casinca',
    postalCode: '20213',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Casinca'
  },
  {
    name: 'San-Nicolao / Moriani',
    postalCode: '20230',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Costa Verde'
  },
  {
    name: 'Venaco',
    postalCode: '20231',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Centre Corse (Montagne)'
  },
  {
    name: 'Vivario',
    postalCode: '20219',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Centre Corse / Col de Vizzavona'
  },
  {
    name: 'Ghisoni',
    postalCode: '20227',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Haut Fiumorbu (Montagne)'
  },
  {
    name: 'Calacuccia',
    postalCode: '20224',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Niolu (Haute Montagne)'
  },
  {
    name: 'Asco',
    postalCode: '20276',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Vallée de l’Asco (Montagne)'
  },
  {
    name: 'Moltifao',
    postalCode: '20218',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Caccia / Golo'
  },
  {
    name: 'Castifao',
    postalCode: '20218',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Caccia'
  },
  {
    name: 'Luri',
    postalCode: '20228',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Cap Corse'
  },
  {
    name: 'Rogliano / Macinaggio',
    postalCode: '20247',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Pointe du Cap Corse'
  },
  {
    name: 'Brando / Erbalunga',
    postalCode: '20222',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Cap Corse'
  },
  {
    name: 'Patrimonio',
    postalCode: '20253',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Conca d’Oru / Vignoble'
  },
  {
    name: 'Oletta',
    postalCode: '20232',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: true,
    microregion: 'Nebbiu'
  },
  {
    name: 'Murato',
    postalCode: '20239',
    departement: '2B',
    defaultLocationType: 'RURAL_SALVEZZA_UNDER_1000',
    populationCategory: '< 1 000 hab',
    isSalvezza: true,
    microregion: 'Nebbiu / Haut Bévinco'
  },
  {
    name: 'San-Martino-di-Lota',
    postalCode: '20200',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Grand Bastia (CAB)'
  },
  {
    name: 'Santa-Maria-di-Lota',
    postalCode: '20200',
    departement: '2B',
    defaultLocationType: 'POLE_RURAL_STRUCTURANT',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Grand Bastia (CAB)'
  },
  {
    name: 'Ville-di-Pietrabugno',
    postalCode: '20200',
    departement: '2B',
    defaultLocationType: 'URBAIN_LITTORAL',
    populationCategory: '1 000 à 8 000 hab',
    isSalvezza: false,
    microregion: 'Grand Bastia (CAB)'
  }
];

/**
 * Recherche et auto-complétion de communes corses
 */
export function searchCorsicaCommunes(query: string): CorsicaCommuneReference[] {
  const clean = (query || '').trim().toLowerCase();
  if (!clean || clean.length < 2) return [];

  return CORSICA_COMMUNES_DATABASE.filter(
    (c) =>
      c.name.toLowerCase().includes(clean) ||
      c.postalCode.startsWith(clean) ||
      (c.inseeCode && c.inseeCode.toLowerCase().startsWith(clean)) ||
      (c.microregion && c.microregion.toLowerCase().includes(clean))
  ).slice(0, 10);
}

/**
 * Normalise le nom de commune pour la correspondance
 */
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Analyse approfondie de la typologie géographique de la commune
 */
export function determineCorsicaZoning(
  cityName?: string,
  postalCode?: string,
  selectedQpv?: string,
  inseeCode?: string
): CorsicaZoningAnalysis {
  const rawCity = (cityName || '').trim();
  const rawCp = (postalCode || '').trim();
  const cleanInsee = (inseeCode || '').trim().toUpperCase().replace(/\s+/g, '');
  const normCity = normalizeName(rawCity);

  // 1. Détection du code commune INSEE effectif
  let effectiveInsee = cleanInsee;
  if (!effectiveInsee && normCity) {
    const dbMatch = CORSICA_COMMUNES_DATABASE.find(
      (c) => normalizeName(c.name) === normCity || (rawCp && c.postalCode === rawCp && normalizeName(c.name).includes(normCity))
    );
    if (dbMatch?.inseeCode) {
      effectiveInsee = dbMatch.inseeCode;
    }
  }

  // 2. Recherche stricte dans les 230 communes officielles du Fonds SALVEZZA
  // RÈGLE : Si un code commune INSEE est fourni ou identifié, la recherche SALVEZZA s'effectue
  // prioritairement et rigoureusement sur ce code (ex: 2B096 pour Corte -> non éligible SALVEZZA).
  // Si aucun code INSEE n'est disponible, recherche par nom exact normalisé.
  let salvezzaOfficial: SalvezzaCommune | undefined;
  if (effectiveInsee) {
    salvezzaOfficial = findSalvezzaCommuneByCode(effectiveInsee);
  } else if (normCity) {
    salvezzaOfficial = findSalvezzaCommuneByName(rawCity);
  }

  // 3. Recherche dans le référentiel des communes de Corse
  let matchedCommune: CorsicaCommuneReference | undefined;
  if (effectiveInsee) {
    matchedCommune = CORSICA_COMMUNES_DATABASE.find((c) => c.inseeCode?.toUpperCase() === effectiveInsee);
  }
  if (!matchedCommune && normCity) {
    matchedCommune = CORSICA_COMMUNES_DATABASE.find((c) => normalizeName(c.name) === normCity);
  }
  if (!matchedCommune && rawCp && normCity) {
    matchedCommune = CORSICA_COMMUNES_DATABASE.find(
      (c) => c.postalCode === rawCp && (normalizeName(c.name).includes(normCity) || normCity.includes(normalizeName(c.name)))
    );
  }
  if (!matchedCommune && rawCp) {
    matchedCommune = CORSICA_COMMUNES_DATABASE.find((c) => c.postalCode === rawCp);
  }

  // Détection d'appartenance à la Corse
  const isCorsicaPostalCode =
    rawCp.startsWith('20') ||
    rawCp.startsWith('2A') ||
    rawCp.startsWith('2B') ||
    (rawCp.startsWith('97') === false && rawCp.length === 5 && rawCp.startsWith('20'));

  const isCorsica = Boolean(isCorsicaPostalCode || matchedCommune || salvezzaOfficial || (effectiveInsee && (effectiveInsee.startsWith('2A') || effectiveInsee.startsWith('2B'))));

  if (!isCorsica) {
    return {
      isCorsica: false,
      communeName: rawCity || 'Commune hors Corse',
      postalCode: rawCp,
      departement: 'AUTRE',
      locationType: 'HORS_CORSE',
      populationCategory: 'Hors Corse',
      isSalvezza: false,
      hasQpv: false,
      qpvNeighborhoods: [],
      impresiPaisaniEligible: false,
      impresiPaisaniNote: 'Établissement situé hors de Corse : inéligible aux aides directes territorialisées de l’ADEC.',
      qualitativeCrit4Valid: false,
      qualitativeCrit4Note: 'Non éligible au critère territorial 4 (réservé aux zones insulaires ruraux/QPV).',
      territorialBonusEligible: false,
      badgeLabel: 'Hors Corse',
      badgeColor: 'red',
      summaryText: 'L’entreprise n’est pas implantée sur le territoire de la Collectivité de Corse.'
    };
  }

  // Détermination du département
  let departement: '2A' | '2B' = '2B';
  if (matchedCommune) {
    departement = matchedCommune.departement;
  } else if (salvezzaOfficial) {
    departement = salvezzaOfficial.departement;
  } else if (effectiveInsee?.startsWith('2A')) {
    departement = '2A';
  } else if (effectiveInsee?.startsWith('2B')) {
    departement = '2B';
  } else if (rawCp.startsWith('200') || rawCp.startsWith('201') || rawCp.startsWith('2A')) {
    departement = '2A';
  } else {
    departement = '2B';
  }

  // Gestion des Quartiers Prioritaires de la Ville (QPV)
  const cityUpper = rawCity.toUpperCase();
  const hasQpv =
    matchedCommune?.hasQpv ||
    cityUpper.includes('AJACCIO') ||
    cityUpper.includes('BASTIA') ||
    cityUpper.includes('PORTO-VECCHIO') ||
    cityUpper.includes('PORTO VECCHIO');

  const qpvList =
    matchedCommune?.qpvNeighborhoods ||
    (cityUpper.includes('AJACCIO') ? CORSICA_QPV_REGISTRY['AJACCIO'] : []) ||
    (cityUpper.includes('BASTIA') ? CORSICA_QPV_REGISTRY['BASTIA'] : []) ||
    (cityUpper.includes('PORTO') ? CORSICA_QPV_REGISTRY['PORTO-VECCHIO'] : []);

  // Si l'utilisateur a sélectionné un QPV actif
  if (selectedQpv && selectedQpv !== 'AUCUN') {
    return {
      isCorsica: true,
      communeName: rawCity || matchedCommune?.name || 'Commune corse',
      postalCode: rawCp || matchedCommune?.postalCode || '',
      departement,
      locationType: 'QPV',
      populationCategory: matchedCommune?.populationCategory || '> 8 000 hab',
      microregion: matchedCommune?.microregion || (departement === '2A' ? 'Corse-du-Sud' : 'Haute-Corse'),
      isSalvezza: false,
      hasQpv: true,
      qpvNeighborhoods: qpvList,
      selectedQpv,
      impresiPaisaniEligible: false,
      impresiPaisaniNote: 'La mesure Impresi Paisani est strictement réservée au milieu rural et de montagne (Zonage SALVEZZA).',
      qualitativeCrit4Valid: true,
      qualitativeCrit4Note: `Quartier Politique de la Ville (${selectedQpv}) : validation automatique du critère 4 de la délibération 21/177 AC (+1 pt).`,
      territorialBonusEligible: true,
      badgeLabel: `QPV : ${selectedQpv}`,
      badgeColor: 'indigo',
      summaryText: `Implantation certifiée en Quartier Prioritaire de la Politique de la Ville (${selectedQpv}). Bonification sociale et territoriale.`
    };
  }

  // Si la commune appartient à la liste officielle des 230 communes SALVEZZA
  if (salvezzaOfficial) {
    return {
      isCorsica: true,
      communeName: rawCity || salvezzaOfficial.nom,
      postalCode: rawCp || matchedCommune?.postalCode || '',
      departement: salvezzaOfficial.departement,
      locationType: 'RURAL_SALVEZZA_UNDER_1000',
      populationCategory: '< 1 000 hab',
      microregion: matchedCommune?.microregion || (salvezzaOfficial.departement === '2A' ? 'Corse-du-Sud Intérieur' : 'Haute-Corse Intérieur'),
      isSalvezza: true,
      salvezzaCommune: salvezzaOfficial,
      hasQpv: false,
      qpvNeighborhoods: [],
      impresiPaisaniEligible: true,
      impresiPaisaniNote: `Commune officielle du Fonds SALVEZZA (${salvezzaOfficial.nom} / « ${salvezzaOfficial.nomCorse} » - Contrainte : ${salvezzaOfficial.scoreContrainte}${salvezzaOfficial.altitudeSup350m ? ' · Chef-lieu > 350 m' : ''}) : Accès de plein droit à Impresi Paisani et bonifications des volets Économique et Emploi.`,
      qualitativeCrit4Valid: true,
      qualitativeCrit4Note: 'Validation automatique de plein droit du critère territorial 4 (Délibération 21/177 AC) au titre du zonage SALVEZZA (+1 pt).',
      territorialBonusEligible: true,
      badgeLabel: `SALVEZZA : ${salvezzaOfficial.nomCorse}`,
      badgeColor: 'emerald',
      summaryText: `Commune éligible au Fonds SALVEZZA (${salvezzaOfficial.nom} · « ${salvezzaOfficial.nomCorse} »). Score de contrainte : ${salvezzaOfficial.scoreContrainte}${salvezzaOfficial.altitudeSup350m ? ' · Chef-lieu à plus de 350 m d’altitude' : ''}. Bonifications Volets Économique & Emploi actives.`
    };
  }

  // Détermination de la typologie selon la commune
  let locationType: CorsicaLocationType = 'RURAL_SALVEZZA_UNDER_1000';
  let isSalvezza = false;
  let popCategory: '< 1 000 hab' | '1 000 à 8 000 hab' | '> 8 000 hab' = '< 1 000 hab';
  let microregion = matchedCommune?.microregion || (departement === '2A' ? 'Territoire de Corse-du-Sud' : 'Territoire de Haute-Corse');

  if (matchedCommune) {
    locationType = matchedCommune.defaultLocationType;
    isSalvezza = Boolean(salvezzaOfficial);
    popCategory = matchedCommune.populationCategory;
  } else {
    // Règle par défaut pour les autres communes de Corse
    const isBigUrbanCode =
      rawCp === '20000' ||
      rawCp === '20090' ||
      rawCp === '20200' ||
      rawCp === '20600' ||
      rawCp === '20620' ||
      rawCp === '20290';

    if (isBigUrbanCode && (cityUpper.includes('AJACCIO') || cityUpper.includes('BASTIA'))) {
      locationType = 'URBAIN_LITTORAL';
      isSalvezza = false;
      popCategory = '> 8 000 hab';
    } else {
      locationType = 'RURAL_SALVEZZA_UNDER_1000';
      isSalvezza = false;
      popCategory = '< 1 000 hab';
    }
  }

  // Évaluation des conséquences réglementaires ADEC
  if (locationType === 'RURAL_SALVEZZA_UNDER_1000') {
    return {
      isCorsica: true,
      communeName: rawCity || matchedCommune?.name || 'Commune rurale',
      postalCode: rawCp || matchedCommune?.postalCode || '',
      departement,
      locationType: 'RURAL_SALVEZZA_UNDER_1000',
      populationCategory: popCategory,
      microregion,
      isSalvezza,
      salvezzaCommune: salvezzaOfficial,
      hasQpv,
      qpvNeighborhoods: qpvList,
      impresiPaisaniEligible: true,
      impresiPaisaniNote: 'Commune rurale / montagne (< 1 000 hab) : accès à la mesure de proximité « Impresi Paisani » (aide aux investissements).',
      qualitativeCrit4Valid: true,
      qualitativeCrit4Note: 'Validation automatique du critère qualitatif 4 de la délibération 21/177 AC (+1 pt sur la grille d’évaluation).',
      territorialBonusEligible: isSalvezza,
      badgeLabel: isSalvezza ? 'Rural / Montagne (SALVEZZA)' : 'Commune Rurale (< 1 000 hab)',
      badgeColor: 'emerald',
      summaryText: `Territoire rural de montagne (< 1 000 hab). Soutien renforcé aux commerces, artisans, services et tournées rurales.`
    };
  }

  if (locationType === 'POLE_RURAL_STRUCTURANT') {
    return {
      isCorsica: true,
      communeName: rawCity || matchedCommune?.name || 'Pôle structurant',
      postalCode: rawCp || matchedCommune?.postalCode || '',
      departement,
      locationType: 'POLE_RURAL_STRUCTURANT',
      populationCategory: popCategory,
      microregion,
      isSalvezza: false,
      salvezzaCommune: undefined,
      hasQpv,
      qpvNeighborhoods: qpvList,
      impresiPaisaniEligible: true,
      impresiPaisaniNote: 'Bassin de vie intérieur structurant (1 000 à 8 000 hab) : éligible aux investissements de revitalisation de l’intérieur et commerces de proximité.',
      qualitativeCrit4Valid: true,
      qualitativeCrit4Note: 'Validation du critère qualitatif 4 au titre de la cohésion territoriale et du désenclavement de l’intérieur (+1 pt).',
      territorialBonusEligible: false,
      badgeLabel: 'Pôle Rural Structurant',
      badgeColor: 'sky',
      summaryText: `Pôle structurant de l’intérieur (${rawCity || matchedCommune?.name || 'Centre Corse'}). Rôle moteur pour le bassin de vie et les vallées environnantes.`
    };
  }

  // URBAIN_LITTORAL
  return {
    isCorsica: true,
    communeName: rawCity || matchedCommune?.name || 'Pôle urbain',
    postalCode: rawCp || matchedCommune?.postalCode || '',
    departement,
    locationType: 'URBAIN_LITTORAL',
    populationCategory: popCategory,
    microregion,
    isSalvezza: false,
    hasQpv,
    qpvNeighborhoods: qpvList,
    impresiPaisaniEligible: false,
    impresiPaisaniNote: 'Non éligible à la mesure Impresi Paisani (réservée au rural SALVEZZA). Accès au tronc commun des 5 aides du Guide 2026.',
    qualitativeCrit4Valid: false,
    qualitativeCrit4Note: 'Critère 4 non validé (sauf si établissement implanté dans l’un des QPV répertoriés ci-dessous).',
    territorialBonusEligible: false,
    badgeLabel: 'Pôle Urbain & Littoral',
    badgeColor: 'slate',
    summaryText: `Zone urbaine ou périurbaine (${rawCity || matchedCommune?.name}). Éligible aux dispositifs de création, reprise, compétitivité et RDI.`
  };
}
