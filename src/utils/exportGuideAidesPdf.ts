/**
 * Générateur et Exportateur Officiel du Recueil & Fiches de Synthèse des Aides ADEC 2026
 * Destiné aux équipes de communication, aux conseillers entreprises et à la direction générale.
 * Cadre : Délibération N° 21/177 AC & U Pattu Risilienzia è Territorii (Annexe 1).
 */

import { DispositifScheme } from '../types';
import { QUALITATIVE_EVALUATION_QUESTIONS } from '../data/adecOfficialData';

const A4_PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 14mm 14mm 14mm 14mm;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 9pt;
    line-height: 1.45;
    color: #0f172a;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }
  .page-break {
    page-break-before: always;
  }
  .cover-container {
    padding: 40px 20px;
    text-align: center;
    border: 3px solid #000091;
    border-radius: 8px;
    margin-bottom: 20px;
    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  }
  .marianne-band {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 16px;
  }
  .marianne-color {
    width: 14px;
    height: 32px;
    border-radius: 2px;
  }
  .header-institution {
    font-size: 11pt;
    font-weight: 800;
    color: #000091;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.3;
  }
  .header-sub {
    font-size: 9.5pt;
    font-weight: 600;
    color: #e1000f;
    margin-top: 2px;
  }
  .cover-title {
    font-size: 22pt;
    font-weight: 900;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    margin: 25px 0 10px 0;
    line-height: 1.15;
  }
  .cover-subtitle {
    font-size: 13pt;
    font-weight: 700;
    color: #0369a1;
    margin-bottom: 15px;
  }
  .cover-meta {
    font-size: 9pt;
    color: #64748b;
    margin-top: 25px;
    line-height: 1.6;
  }
  .badge-tag {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: 700;
  }
  .badge-blue { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
  .badge-emerald { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  .badge-purple { background: #faf5ff; color: #6b21a8; border: 1px solid #e9d5ff; }
  .section-heading {
    font-size: 12pt;
    font-weight: 900;
    color: #000091;
    text-transform: uppercase;
    border-bottom: 2px solid #000091;
    padding-bottom: 4px;
    margin: 18px 0 10px 0;
  }
  .summary-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8pt;
    margin-bottom: 15px;
  }
  .summary-table th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 6px 8px;
    border: 1px solid #334155;
  }
  .summary-table td {
    padding: 5px 8px;
    border: 1px solid #cbd5e1;
    vertical-align: middle;
  }
  .summary-table tr:nth-child(even) td {
    background: #f8fafc;
  }
  .fiche-card {
    border: 1.5px solid #cbd5e1;
    border-radius: 6px;
    padding: 14px;
    margin-bottom: 16px;
    background: #ffffff;
  }
  .fiche-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1.5px solid #000091;
    padding-bottom: 6px;
    margin-bottom: 8px;
  }
  .fiche-code {
    font-family: monospace;
    font-weight: 900;
    font-size: 10pt;
    color: #000091;
    background: #eff6ff;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #bfdbfe;
  }
  .fiche-title {
    font-size: 12pt;
    font-weight: 900;
    color: #0f172a;
    margin: 2px 0 1px 0;
  }
  .fiche-subtitle {
    font-size: 8.5pt;
    font-weight: 600;
    color: #475569;
  }
  .grid-2 {
    display: table;
    width: 100%;
    margin-bottom: 6px;
  }
  .col-1, .col-2 {
    display: table-cell;
    vertical-align: top;
    width: 50%;
  }
  .col-1 { padding-right: 8px; }
  .col-2 { padding-left: 8px; }
  .info-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 6px 8px;
    margin-bottom: 6px;
    font-size: 8pt;
  }
  .info-box strong {
    color: #0f172a;
  }
  .rates-strip {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 4px;
    padding: 6px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5pt;
    margin: 6px 0;
  }
  .rates-strip strong {
    color: #166534;
  }
  .footer-stamp {
    margin-top: 14px;
    padding-top: 6px;
    border-top: 1px solid #e2e8f0;
    font-size: 7.5pt;
    color: #94a3b8;
    text-align: center;
  }
`;

/**
 * Génère le code HTML complet et imprimable du recueil des fiches d'aides ADEC
 */
export function generateGuideAidesHtml(schemes: DispositifScheme[]): string {
  const dateFormatted = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const annexe1Schemes = schemes.filter(s => s.category === 'Pattu Risilienzia è Territorii');
  const guideSchemes = schemes.filter(s => s.category !== 'Pattu Risilienzia è Territorii');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Recueil_Fiches_Aides_ADEC_2026_Synthese_Communication.pdf</title>
  <style>${A4_PRINT_CSS}</style>
</head>
<body>

  <!-- ================= PAGE 1 : PAGE DE GARDE INSTITUTIONNELLE ================= -->
  <div class="cover-container">
    <div class="marianne-band">
      <div class="marianne-color" style="background: #000091;"></div>
      <div class="marianne-color" style="background: #ffffff; border: 1px solid #cbd5e1;"></div>
      <div class="marianne-color" style="background: #e1000f;"></div>
    </div>
    
    <div class="header-institution">
      Collectivité de Corse · Cullettività di Corsica<br />
      Agence de Développement Économique de la Corse (ADEC)
    </div>
    <div class="header-sub">
      Direction du Développement Économique & Service de la Communication
    </div>

    <div class="cover-title">
      Recueil & Fiches de Synthèse des Dispositifs d'Aides 2026
    </div>
    <div class="cover-subtitle">
      Guide Pratique des Interventions Régionales pour la Communication & l'Information des Entreprises
    </div>

    <div style="margin: 20px auto; max-width: 650px; font-size: 9.5pt; line-height: 1.5; color: #334155; text-align: justify; padding: 12px 16px; background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1;">
      <strong>Note de cadrage pour la communication :</strong> Ce recueil synthétise l'intégralité des mesures d'aide directe aux entreprises corses adoptées par l'Assemblée de Corse. Il regroupe les <strong>4 mesures du dispositif U PATTU RISILIENZA È TERRITORII</strong> (Annexe 1) ainsi que les <strong>12 mesures sectorielles du Guide des Aides 2026</strong> soumises à la grille qualitative des 8 critères (Délibération N° 21/177 AC). Il est destiné à la rédaction des fiches de communication, des dossiers de presse et des supports d'information des acteurs économiques.
    </div>

    <div style="display: flex; justify-content: center; gap: 15px; margin-top: 15px;">
      <span class="badge-tag badge-blue">16 Dispositifs d'Aides Actifs</span>
      <span class="badge-tag badge-emerald">Bonification SALVEZZA jusqu'à 70 %</span>
      <span class="badge-tag badge-purple">Délibération N° 21/177 AC</span>
    </div>

    <div class="cover-meta">
      Édité le <strong>${dateFormatted}</strong> · Document de Référence ADEC 2026<br />
      Source officielle : Assemblée de Corse · Agence de Développement Économique de la Corse (adec.corsica)
    </div>
  </div>

  <!-- ================= PAGE 2 : SOMMAIRE & TABLEAU RÉCAPITULATIF ================= -->
  <div class="page-break"></div>

  <div class="section-heading">
    1. Tableau Récapitulatif des 16 Dispositifs d'Aides (Vue Synthétique)
  </div>

  <table class="summary-table">
    <thead>
      <tr>
        <th style="width: 10%;">Code</th>
        <th style="width: 28%;">Dispositif & Intitulé</th>
        <th style="width: 22%;">Volet Réglementaire</th>
        <th style="width: 15%;">Taux Max TPE</th>
        <th style="width: 13%;">Plafond Subvention</th>
        <th style="width: 12%;">Grille Qualit.</th>
      </tr>
    </thead>
    <tbody>
      ${schemes.map(s => `
        <tr>
          <td><strong style="font-family: monospace; color: #000091;">${s.code}</strong></td>
          <td>
            <strong>${s.name}</strong><br />
            <span style="font-size: 7.5pt; color: #64748b;">${s.allowedSizes.join(', ')} · ${s.allowedSectors.slice(0, 3).join(', ')}</span>
          </td>
          <td>${s.category === 'Pattu Risilienzia è Territorii' ? 'Annexe 1 · U Pattu Risilienzia' : 'Guide 2026 (Délib. 21/177 AC)'}</td>
          <td><strong style="color: #166534;">${s.rates.tpeMaxRate ? `${Math.round(s.rates.tpeMaxRate * 100)} %` : s.rates.flatAmount ? 'Forfait' : 'Variable'}</strong></td>
          <td style="font-family: monospace; font-weight: bold;">${s.rates.ceilingAmount ? `${s.rates.ceilingAmount.toLocaleString('fr-FR')} €` : 'Selon assiette'}</td>
          <td>${s.requiresQualitativeEvaluation ? '<span style="color: #b45309; font-weight: 700;">≥ 3 OUI</span>' : '<span style="color: #166534; font-weight: 700;">Directe</span>'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- GRILLE QUALITATIVE EN BREF -->
  <div class="section-heading" style="margin-top: 25px;">
    2. Cadre d'Évaluation Qualitative (Délibération N° 21/177 AC - Page 28)
  </div>

  <div style="background: #fefce8; border: 1.5px solid #fde047; border-radius: 6px; padding: 10px 14px; font-size: 8.5pt; color: #854d0e; margin-bottom: 12px; line-height: 1.45;">
    <strong>Règle éliminatoire obligatoire :</strong> Pour les mesures relevant du Guide des Aides 2026, l'accès à l'instruction financière exige l'obtention d'au moins <strong>3 « OUI » sur les 8 critères</strong>. Les 4 mesures du Pattu Risilienzia en sont expressément dispensées.
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 8pt;">
    ${QUALITATIVE_EVALUATION_QUESTIONS.map((q, idx) => `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 10px;">
        <strong style="color: #000091;">Critère ${idx + 1} : ${q.title}</strong><br />
        <span style="color: #334155;">${q.label}</span>
      </div>
    `).join('')}
  </div>

  <!-- ================= PAGES SUIVANTES : FICHES DÉTAILLÉES ================= -->
  ${schemes.map((scheme, index) => `
    <div class="page-break"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000091; padding-bottom: 6px; margin-bottom: 12px;">
      <div>
        <div style="font-size: 7.5pt; font-weight: 700; color: #000091; text-transform: uppercase;">
          Fiche Synthétique N° ${index + 1}/16 · Collectivité de Corse · ADEC
        </div>
        <div style="font-size: 14pt; font-weight: 900; color: #0f172a; margin-top: 1px;">
          ${scheme.name}
        </div>
      </div>
      <div style="text-align: right;">
        <span class="fiche-code">${scheme.code}</span>
        <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">Réf. : ${scheme.sourceDocumentPages}</div>
      </div>
    </div>

    <!-- BANDEAU DES TAUX ET PLAFONDS -->
    <div class="rates-strip">
      <div>
        <span style="font-size: 8pt; color: #166534; text-transform: uppercase; font-weight: 700;">Taux d'intervention maximal :</span>
        <strong style="font-size: 10pt; margin-left: 6px;">
          TPE : ${scheme.rates.tpeMaxRate ? `${Math.round(scheme.rates.tpeMaxRate * 100)} %` : 'Forfait'}
          ${scheme.rates.peMaxRate ? ` · PE : ${Math.round(scheme.rates.peMaxRate * 100)} %` : ''}
          ${scheme.rates.pmeMaxRate ? ` · PME : ${Math.round(scheme.rates.pmeMaxRate * 100)} %` : ''}
        </strong>
      </div>
      <div>
        <span style="font-size: 8pt; color: #166534; text-transform: uppercase; font-weight: 700;">Plafond d'aide :</span>
        <strong style="font-size: 10pt; margin-left: 6px;">${scheme.rates.ceilingAmount ? `${scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €` : 'Selon barème'}</strong>
      </div>
    </div>

    <!-- OBJECTIFS & CADRE -->
    <div class="info-box" style="border-left: 4px solid #000091;">
      <strong>Objectif du dispositif : </strong>${scheme.objective}
      <div style="margin-top: 4px; font-size: 7.5pt; color: #64748b;">
        <strong>Cadre juridique & Délibération : </strong>${scheme.governingDeliberation || scheme.legalBasis}
      </div>
    </div>

    <!-- 2 COLONNES : BÉNÉFICIAIRES & DÉPENSES -->
    <div class="grid-2">
      <div class="col-1">
        <div class="info-box">
          <strong style="color: #000091; text-transform: uppercase; font-size: 8pt; display: block; margin-bottom: 3px;">
            1. Bénéficiaires & Publics Visés
          </strong>
          <p style="margin: 0 0 4px 0;">${scheme.targetBeneficiariesSummary}</p>
          <div><strong>Tailles admises :</strong> ${scheme.allowedSizes.join(', ')}</div>
          <div><strong>Secteurs éligibles :</strong> ${scheme.allowedSectors.join(', ')}</div>
          <div style="color: #991b1b; margin-top: 2px;"><strong>Exclusions formelles :</strong> ${scheme.excludedLegalForms.join(', ')} · ${scheme.excludedSectors.join(', ')}</div>
        </div>
      </div>

      <div class="col-2">
        <div class="info-box">
          <strong style="color: #000091; text-transform: uppercase; font-size: 8pt; display: block; margin-bottom: 3px;">
            2. Dépenses & Investissements Éligibles
          </strong>
          <ul style="margin: 0; padding-left: 14px;">
            ${scheme.eligibleExpenseCategories.slice(0, 5).map(e => `<li>${e}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>

    <!-- CONDITIONS SPÉCIFIQUES & CRITÈRES -->
    <div class="info-box">
      <strong style="color: #000091; text-transform: uppercase; font-size: 8pt; display: block; margin-bottom: 3px;">
        3. Conditions Particulières d'Instruction & Engagements
      </strong>
      <ul style="margin: 0; padding-left: 14px;">
        ${scheme.specificRequirements.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <!-- DÉPÔT ET PROCÉDURE -->
    <div class="info-box" style="background: #f1f5f9; border-color: #cbd5e1;">
      <strong style="color: #0f172a; text-transform: uppercase; font-size: 8pt; display: block; margin-bottom: 2px;">
        4. Modalités de Dépôt & Pièces Justificatives (Communication aux Usagers)
      </strong>
      <div style="font-size: 8pt; color: #334155;">
        <strong>Plateforme de dépôt :</strong> ${scheme.procedure.portalUrl} (${scheme.procedure.submissionMethod})<br />
        <strong>Instance de décision :</strong> ${scheme.procedure.decisionBody}<br />
        <strong>Pièces principales :</strong> ${scheme.procedure.requiredDocuments.join(' · ')}
      </div>
    </div>

    <div class="footer-stamp">
      Recueil Officiel des Aides ADEC 2026 · Document de communication interne et externe · adec.corsica
    </div>
  `).join('')}

</body>
</html>`;
}

/**
 * Télécharge directement le document HTML autonome du guide des aides
 */
export function downloadGuideAidesHtmlFile(schemes: DispositifScheme[]): { fileName: string } {
  const htmlContent = generateGuideAidesHtml(schemes);
  const fileName = `Recueil_Fiches_Aides_ADEC_2026_Synthese_Communication.html`;
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
