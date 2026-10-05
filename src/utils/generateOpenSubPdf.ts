/**
 * Générateur de Fiche Projet OpenSub (Format PDF Officiel ADEC Corse)
 * 
 * Cette fiche simule le document PDF généré par le portail de téléprocédure OpenSub
 * de la Collectivité de Corse / ADEC pour le dossier de demande N° 11103.
 * 
 * Le fichier est généré en mémoire et téléchargé directement dans le dossier "Téléchargements"
 * du navigateur de l'utilisateur, prêt à être glissé-déposé dans l'analyseur.
 */

export function buildOpenSubPdfContent(): string {
  const lines = [
    'COLLECTIVITE DE CORSE - AGENCE DE DEVELOPPEMENT ECONOMIQUE DE LA CORSE (ADEC)',
    'PORTAIL DE TELEPROCEDURE OPENSUB - DOSSIER DE DEMANDE DE SUBVENTION',
    '==================================================================================',
    'FICHE PROJET INITIALE N 11103',
    'Date de teletransmission : 18/02/2026 a 14:32:10',
    'Plateforme d origine : OpenSub ADEC - Guichet Unique des Aides Regionales',
    'Statut du dossier : Transmis - En attente d instruction ADEC',
    '',
    '----------------------------------------------------------------------------------',
    'SECTION 1 : DEMANDEUR ET ENTREPRISE BENEFICIAIRE',
    '----------------------------------------------------------------------------------',
    'Raison Sociale : Atelier Insulaire de Transformation',
    'Forme Juridique : SARL (Societe a responsabilite limitee)',
    'Numero SIRET (14 chiffres) : 84920194800018',
    'Code NAF / APE : 10.71C - Boulangerie et boulangerie-patisserie artisanale',
    'Adresse du siege : 12 Cours Paoli, 20250 Corte (Haute-Corse)',
    'Commune d implantation : Corte (Code INSEE : 2B096) - Territoire Centre Corse',
    'Representant legal : Antone PAOLI (Gerant et Porteur de projet)',
    'Associee co-gerante : Maria ALBERTI',
    'Effectif salarie declare : 6 personnes (TPE artisanale)',
    'Chiffre d affaires 2025 : 480 000 EUR',
    'Total du Bilan : 320 000 EUR',
    'Courriel de contact : contact@atelier-corse.fr',
    'Telephone professionnel : 04 95 46 12 34',
    '',
    '----------------------------------------------------------------------------------',
    'SECTION 2 : CADRE D INTERVENTION ET APPEL A PROJET',
    '----------------------------------------------------------------------------------',
    'Section Appel a projet : RENSEIGNEE DANS OPENSUB',
    'Intitule AAP : Appel a projets Risilienza 2026 - Pattu Risilienzia e Territorii',
    'Reference AAP : AAP-ADEC-2026-RISILIENZA-01',
    'Dispositif cible declare : Mesure d aide Risilienza',
    'Motivation : Adaptation aux hausses des couts de l energie et de la farine, modernisation',
    'du fournil artisanal et securisation de la tournee d approvisionnement en zone rurale.',
    '',
    '----------------------------------------------------------------------------------',
    'SECTION 3 : DESCRIPTION DU PROJET ET PROGRAMME D INVESTISSEMENT',
    '----------------------------------------------------------------------------------',
    'Intitule du projet : Modernisation de l outil de production artisanale, resilience energetique',
    'et acquisition d un utilitaire propre pour tournee rurale en zone de montagne',
    'Localisation : Corte (20250) - Zonage prioritaire SALVEZZA & Pole rural structurant',
    'Calendrier d execution : Du 01/04/2026 au 31/03/2027 (12 mois)',
    'Programme d investissement preselectionne :',
    ' 1. Equipements de production et transition energetique : 35 000 EUR HT',
    '    (Fournil a haute efficacite thermique et groupe de froid ecologique)',
    ' 2. Numerique et gestion commerciale : 16 000 EUR HT',
    '    (Systeme informatise de gestion des tournees et module interactif de commande)',
    ' 3. Vehicule professionnel propre : 24 000 EUR HT',
    '    (Utilitaire electrique leger propre pour tournee rurale avec mise au rebut ancien)',
    'Montant Total des Investissements HT : 75 000 EUR',
    'Subvention Regionale ADEC sollicitee : 45 000 EUR',
    '',
    '----------------------------------------------------------------------------------',
    'SECTION 4 : PRESENCE SUR INTERNET ET RESEAUX SOCIAUX',
    '----------------------------------------------------------------------------------',
    'Site Internet officiel : https://atelier-insulaire-transformation.corsica',
    'Type de site actuel : Vitrine de presentation d informations (sans paiement ni commande)',
    'Reseaux sociaux actifs : Facebook (@AtelierInsulaireCorte - 1450 abonnes), Instagram (@atelier_insulaire)',
    'Projet numerique prefigure : Deploiement d un module click and collect connecte pour les villages ruraux.'
  ];

  let stream = 'BT\n/F1 9 Tf\n12.5 TL\n38 806 Td\n';
  for (const line of lines) {
    if (line === '') {
      stream += 'T*\n';
    } else {
      const safe = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      if (line.startsWith('COLLECTIVITE') || line.startsWith('FICHE PROJET') || line.startsWith('SECTION')) {
        stream += '/F2 9.5 Tf (' + safe + ') Tj /F1 9 Tf T*\n';
      } else {
        stream += '(' + safe + ') Tj T*\n';
      }
    }
  }
  stream += 'ET';

  const streamLen = new TextEncoder().encode(stream).length;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  function add(s: string) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += s + '\n';
  }

  add('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  add('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  add('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj');
  add('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  add('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
  add(`6 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj`);

  const startXref = new TextEncoder().encode(pdf).length;
  pdf += 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 0; i < 6; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;
  return pdf;
}

export function generateOpenSubPdfBlob(): Blob {
  const pdfString = buildOpenSubPdfContent();
  const bytes = new TextEncoder().encode(pdfString);
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Déclenche le téléchargement du fichier PDF directement dans le dossier "Téléchargements" du navigateur
 */
export function downloadOpenSubPdf(fileName: string = 'Fiche_Projet_OpenSub_11103.pdf'): void {
  const blob = generateOpenSubPdfBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
