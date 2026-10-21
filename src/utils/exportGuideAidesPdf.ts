/**
 * Export « Fiches dispositifs » pour la communication : une page A4 par dispositif,
 * selon le modèle de fiche ADEC (model_dispo.pdf).
 * Les textes viennent de `scheme.communication` quand ils existent, sinon des champs du dispositif.
 */

import { DispositifScheme } from '../types';

export interface FicheDispositifContenu {
  famille: string;
  nom: string;
  accroche: string;
  objectifs: string[];
  entreprisesEligibles: string;
  projetsEligibles: string;
  depensesEligibles: string[];
  formeAide: string[];
}

const PIED_DE_PAGE = 'Le dispositif est ici présenté dans sa version simplifiée, pour en connaître les détails<br />consultez le guide complet des aides sur le site de l’ADEC www.adec.corsica';

const euros = (n: number) => `${n.toLocaleString('fr-FR')} €`;
const pct = (r: number) => `${Math.round(r * 100)} %`;
const finPhrase = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);
const minusculeInitiale = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
/** « Soutenir… », « Permettre… » : l'objet peut suivre « a pour objet de » */
const commenceParUnVerbe = (s: string) => /^(\p{L}+(?:er|ir)|permettre|promouvoir|produire|construire|reconstruire)\b/iu.test(s.trim());

/** Phrase d'accroche construite à partir de l'objet du dispositif */
const accrocheDerivee = (nomCourt: string, objet: string) => {
  const o = minusculeInitiale(finPhrase(objet));
  if (commenceParUnVerbe(objet)) return `La mesure « ${nomCourt} » a pour objet ${/^[aeiouyhéèêâîôû]/i.test(o) ? 'd’' : 'de '}${o}`;
  if (/^(mesure|dispositif)\b/i.test(objet)) return `La mesure « ${nomCourt} » est une ${o}`; // « Mesure unique de soutien… »
  return `La mesure « ${nomCourt} » a pour objet le ${o}`; // « Soutien aux projets… »
};

/** « Mesure d’aide « Risilienza » » → famille / nom affichés en en-tête de fiche */
const famillesEtNom = (scheme: DispositifScheme): { famille: string; nom: string; nomCourt: string } => {
  const guillemets = scheme.name.match(/«\s*([^»]+?)\s*»/);
  const [avantTiret, apresTiret] = scheme.name.split(/\s+[–-]\s+/);
  if (scheme.category === 'Pattu Risilienzia è Territorii') {
    const nomCourt = guillemets ? guillemets[1] : scheme.name;
    return { famille: 'PATTU RISILIENZA E TERRITORII', nom: nomCourt.toUpperCase(), nomCourt };
  }
  if (apresTiret) {
    return { famille: avantTiret.toUpperCase(), nom: apresTiret.toUpperCase(), nomCourt: scheme.name };
  }
  const nomCourt = guillemets ? guillemets[1] : scheme.name;
  return { famille: 'GUIDE DES AIDES ADEC', nom: nomCourt.toUpperCase(), nomCourt };
};

/** Phrases « Forme de l’aide » déduites des taux et plafonds du dispositif */
const formeAideDerivee = (scheme: DispositifScheme): string[] => {
  const r = scheme.rates;
  const lignes: string[] = [];

  if (r.flatAmount) {
    const montant = r.flatAmount.min === r.flatAmount.max
      ? `de **${euros(r.flatAmount.max)}**`
      : `de **${euros(r.flatAmount.min)}** à **${euros(r.flatAmount.max)}**`;
    lignes.push(`L’aide prend la forme d’une **subvention forfaitaire** ${montant}.`);
    // Le libellé n'apporte une précision que s'il ne répète pas « subvention forfaitaire »
    const precision = r.flatAmount.label.replace(/^subvention forfaitaire\s*/i, '');
    if (precision) lignes.push(finPhrase(precision.charAt(0).toUpperCase() + precision.slice(1)));
    if (r.flatAmount.specialBonus) lignes.push(finPhrase(r.flatAmount.specialBonus.label));
  } else {
    const taux = [
      r.tpeMaxRate !== undefined ? `jusqu’à ${pct(r.tpeMaxRate)} des dépenses éligibles pour les TPE` : '',
      r.peMaxRate !== undefined ? `jusqu’à ${pct(r.peMaxRate)} des dépenses éligibles pour les PE` : '',
      r.pmeMaxRate !== undefined ? `jusqu’à ${pct(r.pmeMaxRate)} pour les PME` : ''
    ].filter(Boolean);
    if (taux.length > 0) {
      const liste = taux.length > 1 ? `${taux.slice(0, -1).join(', ')} et ${taux[taux.length - 1]}` : taux[0];
      lignes.push(`L’aide prend la forme d’une **subvention** dont l’intensité maximale peut atteindre : ${liste}.`);
    } else {
      lignes.push('L’aide prend la forme d’une **subvention**, dont l’intensité est fixée selon le projet.');
    }
  }

  if (r.cleanVehiclesRates) {
    const v = r.cleanVehiclesRates;
    lignes.push(`Véhicules propres : **${pct(v.rate)}** du montant HT, plafonné à ${euros(v.utilitaireLightCap)} (moins de 2,5 t), ${euros(v.fourgonCap)} (de 2,5 à 3,5 t) et ${euros(v.poidsLourdCap)} (plus de 3,5 t).`);
  }
  if (r.travelAllowances) {
    const t = r.travelAllowances;
    lignes.push(`Forfaits de déplacement par personne : ${euros(t.franceSalon)} (salon international en France), ${euros(t.euromed)} (Euromed) et ${euros(t.grandLarge)} (Grand Large).`);
  }

  const forfaitFixe = r.flatAmount && r.flatAmount.min === r.flatAmount.max;
  if (r.floorAmount && !forfaitFixe) lignes.push(`Le montant minimal de l’aide est fixé à **${euros(r.floorAmount)}**.`);

  const deMinimis = /2023\/2831/.test(scheme.legalBasis);
  if (r.ceilingAmount && r.ceilingAmount < 300000 && !forfaitFixe) {
    lignes.push(`Le montant de l’aide est plafonné à **${euros(r.ceilingAmount)}**.`);
  }
  if (deMinimis) {
    lignes.push('Le montant total des aides accordées à une entreprise unique ne peut excéder le plafond prévu par le règlement (UE) 2023/2831 de la Commission du 13 décembre 2023 relatif **aux aides de minimis**, soit **300 000 euros** sur une période glissante de trois ans.');
  } else if (r.ceilingAmount && r.ceilingAmount >= 300000) {
    lignes.push(`Le montant de l’aide est plafonné à **${euros(r.ceilingAmount)}** (${scheme.legalBasis}).`);
  }
  return lignes;
};

export function buildFicheDispositif(scheme: DispositifScheme): FicheDispositifContenu {
  const c = scheme.communication || {};
  const { famille, nom, nomCourt } = famillesEtNom(scheme);
  return {
    famille,
    nom,
    accroche: c.accroche || accrocheDerivee(nomCourt, scheme.objective),
    objectifs: c.objectifs || [],
    entreprisesEligibles: c.entreprisesEligibles || finPhrase(scheme.targetBeneficiariesSummary),
    projetsEligibles: c.projetsEligibles || finPhrase(scheme.subtitle),
    depensesEligibles: c.depensesEligibles || scheme.eligibleExpenseCategories,
    formeAide: c.formeAide || formeAideDerivee(scheme)
  };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Échappe le texte puis rend `**gras**` */
const texte = (s: string) => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const liste = (items: string[]) => `<ul>${items.map((i) => `<li>${texte(i)}</li>`).join('')}</ul>`;

const FICHE_CSS = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #e5e7eb; font-family: Arial, Helvetica, sans-serif; color: #000; }
  .page {
    width: 210mm; height: 297mm; margin: 0 auto 8mm; background: #fff;
    padding: 16mm 19mm 12mm; display: flex; flex-direction: column;
    font-size: 10pt; line-height: 1.32; page-break-after: always; break-after: page;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .entete { display: flex; justify-content: space-between; gap: 12mm; font-size: 10pt; margin: 0 4mm 9mm; }
  .entete span:last-child { text-align: right; }
  .accroche { font-weight: bold; text-align: justify; margin: 0 2mm 7mm 4mm; }
  .rubrique { margin: 0 0 5mm; text-align: justify; }
  .rubrique strong.titre { font-weight: bold; }
  ul { margin: 0.5mm 0 0; padding-left: 5mm; list-style: none; }
  li { position: relative; padding-left: 2mm; margin-bottom: 0.3mm; text-align: justify; }
  li::before { content: '•'; position: absolute; left: -4mm; }
  .pied { margin-top: auto; text-align: center; font-size: 9pt; line-height: 1.3; }
  @media print {
    body { background: #fff; }
    .page { margin: 0; box-shadow: none; }
  }
`;

const renderFiche = (scheme: DispositifScheme) => {
  const f = buildFicheDispositif(scheme);
  return `
  <section class="page">
    <div class="entete"><span>${escapeHtml(f.famille)}</span><span>${escapeHtml(f.nom)}</span></div>
    <p class="accroche">${texte(f.accroche)}</p>
    ${f.objectifs.length > 0 ? `<div class="rubrique"><strong class="titre">Objectifs :</strong>${liste(f.objectifs)}</div>` : ''}
    <p class="rubrique"><strong class="titre">Entreprises éligibles :</strong> ${texte(f.entreprisesEligibles)}</p>
    <p class="rubrique"><strong class="titre">Projets éligibles :</strong> ${texte(f.projetsEligibles)}</p>
    <div class="rubrique"><strong class="titre">Dépenses éligibles :</strong>${liste(f.depensesEligibles)}</div>
    <div class="rubrique"><strong class="titre">Forme de l’aide :</strong>${liste(f.formeAide)}</div>
    <div class="pied">${PIED_DE_PAGE}</div>
  </section>`;
};

/**
 * Document HTML imprimable : une fiche (page A4) par dispositif
 */
export function generateGuideAidesHtml(schemes: DispositifScheme[]): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Fiches_Dispositifs_ADEC</title>
  <style>${FICHE_CSS}</style>
</head>
<body>
${schemes.map(renderFiche).join('\n')}
</body>
</html>`;
}

/**
 * Télécharge le document HTML autonome des fiches (à ouvrir puis imprimer en PDF)
 */
export function downloadGuideAidesHtmlFile(schemes: DispositifScheme[]): { fileName: string } {
  const htmlContent = generateGuideAidesHtml(schemes);
  const fileName = 'Fiches_Dispositifs_ADEC.html';
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return { fileName };
}
