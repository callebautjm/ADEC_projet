/**
 * Synthèse « par règles » d'une Fiche Projet : chiffres recalculés, nature du besoin,
 * ratios financiers, incohérences et données manquantes. Fonctionne sans IA.
 */

import { FicheProjet, NatureBesoin, PointAttention, SyntheseProjet } from '../types/ficheProjet';

const NATURE_LIBELLES: Record<NatureBesoin, string> = {
  INVESTISSEMENT: 'Programme d’investissement',
  TRESORERIE: 'Besoin de trésorerie',
  CREATION: 'Création d’entreprise',
  REPRISE: 'Reprise / transmission',
  INNOVATION: 'Innovation / R&D',
  EXPORT: 'Développement international',
  EMPLOI: 'Création d’emplois',
  AUTRE: 'Besoin à préciser'
};

const NOMBRES_EN_LETTRES: Record<string, number> = {
  un: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10,
  onze: 11, douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16, vingt: 20
};

const euro = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const pct = (r: number) => `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: r < 0.1 ? 1 : 0 }).format(r * 100)} %`;

const parseDateFr = (d?: string): Date | undefined => {
  const m = d?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : undefined;
};

const detectNatureBesoin = (fiche: FicheProjet, totalDepenses: number): NatureBesoin => {
  const texte = [fiche.projet.libelle, fiche.projet.nature, fiche.projet.description].join(' ').toLowerCase();
  const avance = (fiche.financement.formesAide || '').toLowerCase().includes('avance');
  if (fiche.projet.difficultesTresorerie && (totalDepenses === 0 || /tr[ée]sorerie/.test(texte) || avance)) return 'TRESORERIE';
  if (/\breprise\s+(?:d['’ ]|de\s|du\s)|reprise[- ]transmission|transmission\s+d['’ ]entreprise|\brachat\s+d/.test(texte)) return 'REPRISE';
  if (/cr[ée]ation d['’ ]entreprise|cr[ée]ation d['’ ]activit|amor[çc]age/.test(texte)) return 'CREATION';
  if (/innovation|r\s?&\s?d|recherche et d[ée]veloppement|prototype/.test(texte)) return 'INNOVATION';
  if (/export|international|salon/.test(texte) && totalDepenses === 0) return 'EXPORT';
  if (totalDepenses > 0) return 'INVESTISSEMENT';
  if ((fiche.financement.emploisCrees || 0) > 0) return 'EMPLOI';
  return 'AUTRE';
};

/** Cherche un effectif cité dans le texte (« 7 salariés », « sept salariés ») */
const effectifCite = (fiche: FicheProjet): number | undefined => {
  const texte = [fiche.entreprise.presentation, fiche.projet.description, fiche.projet.renforcementActivite].join(' ').toLowerCase();
  const m = texte.match(/\b(\d{1,3}|[a-zé]+)\s+(?:salariés|salaries|employés|employes|collaborateurs)\b/);
  if (!m) return undefined;
  const n = /^\d+$/.test(m[1]) ? Number(m[1]) : NOMBRES_EN_LETTRES[m[1]];
  return n && n > 0 ? n : undefined;
};

export function buildSyntheseProjet(fiche: FicheProjet, dispositifsConnus: string[] = []): SyntheseProjet {
  const points: PointAttention[] = [];
  const manquantes: string[] = [];
  const { finances: fin, financement, depenses } = fiche;

  // Dépenses recalculées ligne à ligne
  const totalInvestissements = depenses.investissements.reduce((s, d) => s + d.cout, 0);
  const totalAutres = depenses.autres.reduce((s, d) => s + d.cout, 0);
  const totalRecalcule = totalInvestissements + totalAutres;
  const parNatureMap = new Map<string, number>();
  [...depenses.investissements, ...depenses.autres].forEach((d) => parNatureMap.set(d.nature, (parNatureMap.get(d.nature) || 0) + d.cout));
  const parNature = Array.from(parNatureMap, ([nature, total]) => ({ nature, total })).sort((a, b) => b.total - a.total);

  const natureBesoin = detectNatureBesoin(fiche, totalRecalcule);

  // Base de coût retenue : somme des lignes si disponible, sinon coût total déclaré
  const baseCout = totalRecalcule > 0 ? totalRecalcule : (financement.coutTotalDeclare || undefined);
  const aide = financement.aideSollicitee;
  const tauxAideDemande = aide && baseCout ? aide / baseCout : undefined;

  // --- Cohérence des montants
  const declare = financement.coutTotalDeclare;
  if (totalRecalcule > 0 && declare !== undefined && Math.abs(declare - totalRecalcule) > Math.max(1, totalRecalcule * 0.01)) {
    points.push({
      niveau: 'attention',
      message: `Coût total déclaré (${euro(declare)}) différent de la somme des dépenses détaillées (${euro(totalRecalcule)}). La synthèse retient ${euro(totalRecalcule)}.`
    });
  }
  if (depenses.totalInvestissementsDeclare !== undefined && Math.abs(depenses.totalInvestissementsDeclare - totalInvestissements) > 1) {
    points.push({ niveau: 'info', message: `Total des investissements déclaré (${euro(depenses.totalInvestissementsDeclare)}) différent de la somme des lignes (${euro(totalInvestissements)}).` });
  }
  if (aide && totalRecalcule === 0) {
    points.push({ niveau: 'attention', message: `Aide sollicitée de ${euro(aide)} sans aucune dépense détaillée : le besoin doit être chiffré (plan de trésorerie, devis).` });
  }
  if (totalRecalcule > 0 && tauxAideDemande !== undefined && tauxAideDemande >= 0.995) {
    points.push({
      niveau: 'bloquant',
      message: `L’aide sollicitée couvre ${pct(tauxAideDemande)} du coût du projet : aucun autofinancement. Les dispositifs ADEC plafonnent le taux d’intervention (en général 30 à 70 %).`
    });
  } else if (totalRecalcule > 0 && tauxAideDemande !== undefined && tauxAideDemande > 0.7) {
    points.push({ niveau: 'attention', message: `Taux d’aide demandé élevé (${pct(tauxAideDemande)} du coût), supérieur aux taux usuels des dispositifs ADEC.` });
  }

  // --- Santé financière
  const endettementSurFondsPropres = fin.empruntsEnCours !== undefined && fin.fondsPropres ? fin.empruntsEnCours / fin.fondsPropres : undefined;
  const margeNette = fin.resultatNet !== undefined && fin.chiffreAffaires ? fin.resultatNet / fin.chiffreAffaires : undefined;
  const cafSurAide = fin.caf !== undefined && aide ? fin.caf / aide : undefined;

  if (fin.fondsPropres !== undefined && fin.fondsPropres < 0) {
    points.push({ niveau: 'bloquant', message: `Fonds propres négatifs (${euro(fin.fondsPropres)}) : vérifier la notion d’entreprise en difficulté (règlement UE).` });
  }
  if (endettementSurFondsPropres !== undefined && endettementSurFondsPropres > 2) {
    points.push({ niveau: 'attention', message: `Endettement élevé : emprunts en cours = ${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(endettementSurFondsPropres)} × les fonds propres.` });
  }
  if (margeNette !== undefined && margeNette < 0.01 && fin.chiffreAffaires) {
    points.push({ niveau: 'attention', message: `Rentabilité faible : résultat net de ${euro(fin.resultatNet || 0)} pour ${euro(fin.chiffreAffaires)} de CA (${pct(margeNette)}).` });
  }
  if (fiche.projet.difficultesTresorerie) {
    points.push({
      niveau: 'attention',
      message: `Difficultés de trésorerie déclarées${fiche.projet.precisionsTresorerie ? ` : « ${fiche.projet.precisionsTresorerie} »` : ''}.`
    });
  }
  if (fin.aJourCotisations === false) {
    points.push({ niveau: 'bloquant', message: 'L’entreprise déclare ne pas être à jour de ses cotisations sociales et/ou fiscales.' });
  }

  // --- Emplois et effectif
  const cite = effectifCite(fiche);
  if (cite && fin.effectifEtp !== undefined && cite !== fin.effectifEtp) {
    points.push({ niveau: 'attention', message: `Effectif incohérent : ${fin.effectifEtp} ETP déclarés, mais le texte mentionne ${cite} salariés.` });
  }
  if (financement.emploisCrees && fin.effectifEtp && financement.emploisCrees > fin.effectifEtp * 2) {
    points.push({ niveau: 'attention', message: `${financement.emploisCrees} emplois créés annoncés pour ${fin.effectifEtp} ETP actuels : objectif à étayer.` });
  }

  // --- Calendrier
  const debut = parseDateFr(fiche.projet.dateDebut);
  const depot = fiche.transmisLe ? new Date(fiche.transmisLe.slice(0, 10)) : undefined;
  if (debut && depot && debut.getTime() < depot.getTime() - 24 * 3600 * 1000) {
    points.push({ niveau: 'attention', message: `Projet démarré (${fiche.projet.dateDebut}) avant le dépôt de la fiche : les dépenses engagées avant la demande sont en principe inéligibles.` });
  }

  // --- Appel à projet et orientation ADEC déjà renseignée
  if (fiche.appelAProjet.repond && fiche.appelAProjet.intitule) {
    const intitule = fiche.appelAProjet.intitule.toLowerCase();
    const reference = dispositifsConnus.some((nom) => intitule.includes(nom.toLowerCase()) || nom.toLowerCase().includes(intitule));
    points.push({
      niveau: reference ? 'info' : 'attention',
      message: reference
        ? `Répond à l’appel à projets « ${fiche.appelAProjet.intitule} ».`
        : `Répond à l’appel à projets « ${fiche.appelAProjet.intitule} », qui n’est pas référencé dans la base de dispositifs du simulateur.`
    });
  }

  // --- Données manquantes utiles à l'instruction
  const attendus: Array<[string, unknown]> = [
    ['Code APE', fiche.entreprise.codeApe],
    ['Chiffre d’affaires', fin.chiffreAffaires],
    ['Résultat net', fin.resultatNet],
    ['Fonds propres', fin.fondsPropres],
    ['Capacité d’autofinancement (CAF)', fin.caf],
    ['Description du marché', fiche.entreprise.marche],
    ['Nature du projet', fiche.projet.nature],
    ['Date de fin du projet', fiche.projet.dateFin],
    ['Date de l’attestation fiscale', fin.dateAttestationFiscale],
    ['Date de l’attestation sociale', fin.dateAttestationSociale]
  ];
  attendus.forEach(([libelle, valeur]) => { if (valeur === undefined || valeur === null || valeur === '') manquantes.push(libelle); });
  if (totalRecalcule === 0) manquantes.push('Détail des dépenses');

  const ordre = { bloquant: 0, attention: 1, info: 2 };
  points.sort((a, b) => ordre[a.niveau] - ordre[b.niveau]);

  return {
    natureBesoin,
    natureBesoinLibelle: NATURE_LIBELLES[natureBesoin],
    depenses: { totalInvestissements, totalAutres, totalRecalcule, parNature },
    financement: { aideSollicitee: aide, formeAide: financement.formesAide, tauxAideDemande, baseCout },
    ratios: { endettementSurFondsPropres, margeNette, cafSurAide },
    pointsAttention: points,
    donneesManquantes: manquantes
  };
}
