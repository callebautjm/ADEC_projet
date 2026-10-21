/**
 * Lecture exacte d'une Fiche Projet ADEC (formulaire OpenSub exporté en PDF).
 * Entrée : texte brut extrait du PDF (pdf-parse). Sortie : FicheProjet structurée.
 * Aucune IA : on s'appuie sur les libellés fixes du formulaire, dans leur ordre d'apparition.
 * Seules les sections situées avant « Présence sur Internet et réseaux sociaux » sont lues :
 * la suite (réseaux sociaux, analyse qualitative et éligibilité remplies par l'ADEC) est ignorée.
 */

import { FicheProjet, FicheDepense } from '../types/ficheProjet';

/** Libellé (ou titre de section) du formulaire, dans l'ordre du document */
interface LabelDef {
  key: string;
  label: string;
  /** Titre de section seul sur sa ligne (pas de « : ») */
  header?: boolean;
}

const LABELS: LabelDef[] = [
  { key: 'dem.civilite', label: 'Civilité' },
  { key: 'dem.nom', label: 'Nom de famille' },
  { key: 'dem.prenom', label: 'Prénom' },
  { key: 'dem.dateNaissance', label: 'Date naissance' },
  { key: 'dem.villeNaissance', label: 'Ville de naissance' },
  { key: 'dem.tel', label: 'Tél. portable' },
  { key: 'dem.email', label: 'Email' },
  { key: 'dem.situation', label: 'Situation' },
  { key: 'dem.fonction', label: 'Fonction' },
  { key: 'h.entreprise', label: "Rappel des données d'identification", header: true },
  { key: 'ent.raisonSociale', label: 'Raison sociale' },
  { key: 'ent.siret', label: 'SIRET' },
  { key: 'ent.formeJuridique', label: 'Forme juridique' },
  { key: 'ent.codeApe', label: 'Code APE' },
  { key: 'ent.activite', label: "Activité de l'entreprise" },
  { key: 'ent.dateCreation', label: 'Date de création' },
  { key: 'ent.dateMiseEnActivite', label: 'Date de mise en activité' },
  { key: 'ent.adresse', label: 'Adresse de domiciliation' },
  { key: 'h.responsable', label: 'Responsable légal', header: true },
  { key: 'rl.civilite', label: 'Civilité' },
  { key: 'rl.nom', label: 'Nom de famille' },
  { key: 'rl.prenom', label: 'Prénom' },
  { key: 'rl.fonction', label: 'Fonction' },
  { key: 'rl.tel', label: 'Tél. portable' },
  { key: 'rl.email', label: 'Email' },
  { key: 'rl.adresse', label: 'Adresse du responsable légal' },
  { key: 'h.presentation', label: 'Présentez nous votre entreprise', header: true },
  { key: 'ent.presentation', label: 'Présentation détaillée' },
  { key: 'ent.marche', label: 'Marché' },
  { key: 'ent.locaux', label: "Locaux d'exploitation et outil de production" },
  { key: 'ent.clientsFournisseurs', label: 'Clients et fournisseurs' },
  { key: 'h.caf', label: 'Capacité d’Auto-financement', header: true },
  { key: 'fin.effectif', label: 'Effectif (ETP)' },
  { key: 'fin.capital', label: 'Capital social' },
  { key: 'fin.ca', label: "Chiffre d'affaires" },
  { key: 'fin.resultatNet', label: 'Résultat net' },
  { key: 'fin.fondsPropres', label: 'Fonds propres' },
  { key: 'fin.emprunts', label: 'Emprunts en cours' },
  { key: 'fin.reserveLegale', label: 'Réserve légale' },
  { key: 'fin.reportANouveau', label: 'Report à nouveau' },
  { key: 'fin.emploisCrees', label: "Nombre d'emplois créés" },
  { key: 'fin.caf', label: 'C.A.F.' },
  { key: 'fin.aJour', label: 'Êtes-vous à jour de vos cotisations sociales et/ou fiscales ?' },
  { key: 'fin.regimeTva', label: 'Régime de TVA' },
  { key: 'fin.dateAttFiscale', label: 'Date attestation fiscale' },
  { key: 'fin.dateAttSociale', label: 'Date attestation sociale' },
  { key: 'h.projet', label: 'Nature et description du projet', header: true },
  { key: 'prj.libelle', label: 'Libellé du projet' },
  { key: 'prj.nature', label: 'Nature du projet' },
  { key: 'prj.description', label: 'Descriptif détaillé du projet' },
  { key: 'prj.difficultes', label: 'Rencontrez-vous des difficultés ou avez-vous besoin de trésorerie ?' },
  { key: 'prj.precisionsTresorerie', label: 'Précisions difficultés de trésorerie' },
  { key: 'prj.renforcement', label: 'Comment ce projet permettra-t-il de renforcer votre activité ?' },
  { key: 'prj.transitionEcologique', label: 'Votre projet est-il porteur d’une démarche de transition écologique et/ou énergétique ?' },
  { key: 'prj.perspectives', label: 'Sur les 3 prochaines années, comment imaginez-vous l’avenir de votre activité et comment ce projet y contribuera-t-il ?' },
  { key: 'h.indicateurs', label: 'Indicateurs clés du projet', header: true },
  { key: 'prj.dateDebut', label: 'Date de début' },
  { key: 'prj.dateFin', label: 'Date de fin' },
  { key: 'tab.depenses', label: 'Nature du poste de dépense', header: true },
  { key: 'fin2.emploisCrees', label: "Nombre d'emplois créés (déclaratif)" },
  { key: 'fin2.emploisMaintenus', label: "Nombre d'emplois maintenus (déclaratif)" },
  { key: 'fin2.coutTotal', label: 'Coût total du projet' },
  { key: 'fin2.aide', label: 'Montant aide sollicité' },
  { key: 'fin2.formes', label: "Formes d'aides sollicitées" },
  { key: 'fin2.partenaires', label: 'Etes vous déjà accompagné par des partenaires ?' },
  { key: 'fin2.levee', label: 'Avez-vous réalisé une levée de fonds ?' },
  { key: 'h.aap', label: 'Appel à projet', header: true },
  { key: 'aap.repond', label: 'Répondez vous à un appel à projet de l’ADEC ?' },
  { key: 'aap.precisez', label: 'Précisez' },
  { key: 'h.ecosysteme', label: 'Ecosystème productif', header: true },
  { key: 'eco.collaborations', label: 'Votre entreprise ou votre projet font-ils intervenir des collaborations avec d’autres entreprises ?' },
  { key: 'eco.langue', label: 'Votre entreprise ou votre projet renforcent-ils la valorisation de la langue et de la culture corse ?' },
  { key: 'eco.international', label: 'Avez-vous des relations d’affaires à l’international ?' },
  { key: 'eco.numerique', label: 'Votre projet est-il porteur d’une démarche de transition numérique ?' },
];

const NATURE_DEPENSE = /^(Investissements?\s+(?:matériels?|immatériels?|immobiliers?)|Prestations?\s+externes?|Frais\s+de\s+[^\s]+|Dépenses?\s+de\s+[^\s]+|Achats?\s+de\s+[^\s]+|Recrutements?|Salaires?|Travaux|Formations?)\s+/i;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Libellé → regex tolérante aux retours à la ligne et aux variantes d'apostrophe */
const labelPattern = (label: string) =>
  escapeRegex(label)
    .replace(/['’]/g, "['’]")
    .replace(/\s+/g, '\\s+');

const cleanValue = (v?: string) => {
  const t = (v || '').replace(/[ \t]+\n/g, '\n').trim();
  return t.length > 0 ? t : undefined;
};

export const parseEuro = (v?: string): number | undefined => {
  if (!v) return undefined;
  const m = v.replace(/ /g, ' ').match(/-?\d[\d ]*(?:,\d+)?/);
  if (!m) return undefined;
  const n = Number.parseFloat(m[0].replace(/ /g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
};

const parseInteger = (v?: string): number | undefined => {
  const m = (v || '').match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : undefined;
};

const parseOuiNon = (v?: string): boolean | undefined => {
  const t = (v || '').trim().toLowerCase();
  if (t.startsWith('oui')) return true;
  if (t.startsWith('non')) return false;
  return undefined;
};

/** Retire les en-têtes et pieds de page répétés sur chaque page du PDF */
const stripPageChrome = (raw: string): { text: string; dossierNumero?: string; transmisLe?: string } => {
  const lines = raw.replace(/\r/g, '').split('\n');
  const out: string[] = [];
  let dossierNumero: string | undefined;
  let transmisLe: string | undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const transmis = line.match(/^Transmis le\s*:\s*(.+)$/);
    if (transmis) { transmisLe = transmisLe || transmis[1].trim(); continue; }
    if (line === 'Fiche Projet') continue;
    const dossier = line.match(/^Dossier N°\s*(\S+)/);
    if (dossier) {
      dossierNumero = dossierNumero || dossier[1];
      i++; // la ligne suivante est le nom du demandeur, répété sur chaque page
      continue;
    }
    if (/^Page \d+\/\d+$/.test(line) || /^-- \d+ of \d+ --$/.test(line) || line === '') continue;
    if (/^Powered by TCPDF/.test(line)) continue;
    out.push(line);
  }
  return { text: out.join('\n'), dossierNumero, transmisLe };
};

/** Repère chaque libellé dans l'ordre et renvoie la valeur située entre lui et le libellé suivant trouvé */
const extractFields = (text: string): Record<string, string | undefined> => {
  const found: Array<{ key: string; start: number; end: number }> = [];
  let cursor = 0;
  for (const def of LABELS) {
    const re = def.header
      ? new RegExp(`(^|\\n)${labelPattern(def.label)}`, 'g')
      : new RegExp(`(^|[\\s])${labelPattern(def.label)}\\s*:`, 'g');
    re.lastIndex = cursor;
    const m = re.exec(text);
    if (!m) continue;
    const start = m.index + m[1].length;
    found.push({ key: def.key, start, end: m.index + m[0].length });
    cursor = m.index + m[0].length;
  }
  const fields: Record<string, string | undefined> = {};
  found.forEach((f, idx) => {
    const next = found[idx + 1];
    const raw = text.slice(f.end, next ? next.start : text.length);
    // Titres de section intermédiaires non utilisés comme bornes (ex. « Le Projet »)
    fields[f.key] = cleanValue(raw.replace(/(\n(Entreprise|Le Projet|Eligibilité|Éligibilité))+\s*$/, ''));
  });
  return fields;
};

const splitAdresse = (adresse?: string) => {
  if (!adresse) return {};
  const m = adresse.match(/^(.*?)\s*\b(\d{5})\s+(.+)$/);
  if (!m) return { adresse };
  return { adresse: m[1].trim() || undefined, codePostal: m[2], commune: m[3].trim() };
};

/** Lit un tableau de dépenses (lignes « Nature Description HT montant [crédit-bail] [emprunt] ») */
const parseDepensesTable = (block: string, withEmplois: boolean): { lignes: FicheDepense[]; totalDeclare?: number } => {
  const body = block
    .replace(/^[\s\S]*?(?:Emprunt\s+Bancaire|concernés)/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const totalMatch = body.match(/\bTotal\s+(\d{1,3}(?: \d{3})*,\d{2})(?:\s+\d+)?\s*$/);
  const rows = totalMatch ? body.slice(0, totalMatch.index).trim() : body;

  const amount = String.raw`\d{1,3}(?: \d{3})*,\d{2}`;
  const rowRe = new RegExp(
    String.raw`(.+?)\s+(HT|TTC)\s+(${amount})((?:\s+${amount}){0,2})` + (withEmplois ? String.raw`(?:\s+(\d+)(?=\s+[A-ZÉ]|$))?` : ''),
    'g'
  );
  const lignes: FicheDepense[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(rows)) !== null) {
    const label = m[1].trim();
    const natureMatch = label.match(NATURE_DEPENSE);
    const extras = (m[4] || '').trim().split(/\s+(?=\d{1,3}(?: \d{3})*,\d{2})/).filter(Boolean);
    lignes.push({
      nature: natureMatch ? natureMatch[1] : 'Autre',
      description: natureMatch ? label.slice(natureMatch[0].length).trim() : label,
      taxe: m[2],
      cout: parseEuro(m[3]) || 0,
      creditBail: withEmplois ? undefined : parseEuro(extras[0]),
      emprunt: withEmplois ? undefined : parseEuro(extras[1]),
      emploisConcernes: withEmplois && m[5] ? Number.parseInt(m[5], 10) : undefined
    });
  }
  return { lignes, totalDeclare: totalMatch ? parseEuro(totalMatch[1]) : undefined };
};

export function parseFicheProjet(rawText: string): FicheProjet {
  const stripped = stripPageChrome(rawText);
  const { dossierNumero, transmisLe } = stripped;
  const finLecture = stripped.text.search(/\nPrésence sur Internet et réseaux sociaux/);
  const text = finLecture >= 0 ? stripped.text.slice(0, finLecture) : stripped.text;
  const f = extractFields(text);

  // Bloc des deux tableaux de dépenses : du premier « Nature du poste de dépense » aux emplois déclaratifs
  const tablesBlock = (f['tab.depenses'] ? `Nature du poste de dépense ${f['tab.depenses']}` : '');
  const [tableInvest = '', tableAutres = ''] = tablesBlock.split(/(?=Nature du poste de dépense)/).filter((s) => s.trim());
  const invest = parseDepensesTable(tableInvest, false);
  const autres = parseDepensesTable(tableAutres, true);

  const adresseEnt = splitAdresse(f['ent.adresse']);
  const aapRepond = parseOuiNon(f['aap.repond']);

  return {
    dossierNumero,
    transmisLe,
    demandeur: {
      civilite: f['dem.civilite'],
      nom: f['dem.nom'],
      prenom: f['dem.prenom'],
      fonction: f['dem.fonction'],
      email: f['dem.email'],
      telephone: f['dem.tel']
    },
    entreprise: {
      raisonSociale: f['ent.raisonSociale'],
      siret: f['ent.siret']?.replace(/\D/g, '') || undefined,
      formeJuridique: f['ent.formeJuridique'],
      codeApe: f['ent.codeApe'],
      activite: f['ent.activite'],
      dateCreation: f['ent.dateCreation'],
      dateMiseEnActivite: f['ent.dateMiseEnActivite'],
      ...adresseEnt,
      responsableLegal: {
        civilite: f['rl.civilite'],
        nom: f['rl.nom'],
        prenom: f['rl.prenom'],
        fonction: f['rl.fonction']
      },
      presentation: f['ent.presentation'],
      marche: f['ent.marche'],
      locaux: f['ent.locaux'],
      clientsFournisseurs: f['ent.clientsFournisseurs']
    },
    finances: {
      effectifEtp: parseEuro(f['fin.effectif']),
      capitalSocial: parseEuro(f['fin.capital']),
      chiffreAffaires: parseEuro(f['fin.ca']),
      resultatNet: parseEuro(f['fin.resultatNet']),
      fondsPropres: parseEuro(f['fin.fondsPropres']),
      empruntsEnCours: parseEuro(f['fin.emprunts']),
      reserveLegale: parseEuro(f['fin.reserveLegale']),
      reportANouveau: parseEuro(f['fin.reportANouveau']),
      caf: parseEuro(f['fin.caf']),
      aJourCotisations: parseOuiNon(f['fin.aJour']),
      regimeTva: f['fin.regimeTva'],
      dateAttestationFiscale: f['fin.dateAttFiscale'],
      dateAttestationSociale: f['fin.dateAttSociale']
    },
    projet: {
      libelle: f['prj.libelle'],
      nature: f['prj.nature'],
      description: f['prj.description'],
      difficultesTresorerie: parseOuiNon(f['prj.difficultes']),
      precisionsTresorerie: f['prj.precisionsTresorerie'],
      renforcementActivite: f['prj.renforcement'],
      transitionEcologique: f['prj.transitionEcologique'],
      perspectives3Ans: f['prj.perspectives'],
      dateDebut: f['prj.dateDebut'],
      dateFin: f['prj.dateFin']
    },
    depenses: {
      investissements: invest.lignes,
      autres: autres.lignes,
      totalInvestissementsDeclare: invest.totalDeclare,
      totalAutresDeclare: autres.totalDeclare
    },
    financement: {
      emploisCrees: parseInteger(f['fin2.emploisCrees']),
      emploisMaintenus: parseInteger(f['fin2.emploisMaintenus']),
      coutTotalDeclare: parseEuro(f['fin2.coutTotal']),
      aideSollicitee: parseEuro(f['fin2.aide']),
      formesAide: f['fin2.formes'],
      partenaires: f['fin2.partenaires'],
      leveeDeFonds: parseOuiNon(f['fin2.levee'])
    },
    appelAProjet: {
      repond: aapRepond,
      intitule: aapRepond ? f['aap.precisez'] : undefined
    },
    ecosysteme: {
      collaborations: f['eco.collaborations'],
      langueCulture: f['eco.langue'],
      international: f['eco.international'],
      transitionNumerique: f['eco.numerique']
    }
  };
}
