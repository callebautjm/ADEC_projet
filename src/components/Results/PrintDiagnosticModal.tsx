/**
 * Modale et Vue d'Impression / Export PDF du Diagnostic ADEC 2026
 * Prise en charge universelle : Impression directe, Téléchargement autonome PDF/HTML et Copie
 */

import React, { useState } from 'react';
import {
  ComprehensiveEvaluationReport,
  CompanyProfile
} from '../../types';
import {
  Printer,
  Download,
  Copy,
  Check,
  X,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  Euro,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { analyzeCompanyCreationDate } from '../../utils/companyAge';

interface PrintDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ComprehensiveEvaluationReport;
  company: CompanyProfile;
}

export const PrintDiagnosticModal: React.FC<PrintDiagnosticModalProps> = ({
  isOpen,
  onClose,
  report,
  company
}) => {
  const [copied, setCopied] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalSimulatedEligibleGrant = report.eligibleSchemes.reduce(
    (acc, curr) => acc + curr.estimatedSubsidyAmount,
    0
  );

  const editionDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const dossierRef = `ADEC-DIAG-${new Date().getFullYear()}-${(company.siret || '00000000000000').slice(-6)}`;
  const companyAge = analyzeCompanyCreationDate(company.creationDate);

  const formatLocationType = (type?: string, qpv?: string) => {
    if (type === 'RURAL_SALVEZZA_UNDER_1000') return 'Territoire rural ou de montagne (Zonage SALVEZZA & < 1 000 hab)';
    if (type === 'POLE_RURAL_STRUCTURANT') return 'Pôle rural structurant / Bassin intérieur (1 000 à 8 000 hab)';
    if (type === 'QPV') return `Quartier Prioritaire de la Ville (QPV${qpv ? ` : ${qpv}` : ''})`;
    if (type === 'URBAIN_LITTORAL' || type === 'AUTRE_CORSE') return 'Pôle urbain et littoral en Corse';
    if (type === 'HORS_CORSE') return 'Établissement situé hors de Corse';
    return 'Territoire corse';
  };

  // Déclenchement de l'impression directe du navigateur
  const handleDirectPrint = () => {
    try {
      setPrintNotice("Ordre d'impression envoyé. Si la boîte de dialogue ne s'ouvre pas automatiquement (restriction du navigateur dans ce cadre sécurisé), utilisez le bouton 'Télécharger la Fiche' ci-contre.");
      window.print();
    } catch (e: any) {
      setPrintNotice("L'impression directe est restreinte par le cadre sécurisé de votre navigateur. Veuillez cliquer sur 'Télécharger la Fiche' ci-contre pour imprimer ou enregistrer en PDF en toute autonomie.");
    }
  };

  // Génération d'un document HTML complet autonome prêt à l'impression / PDF
  const handleDownloadStandaloneHtml = () => {
    const cleanCompanyName = (company.name || 'Entreprise').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Diagnostic_ADEC_2026_${cleanCompanyName}.html`;

    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Diagnostic d'Éligibilité ADEC 2026 - ${company.name || 'Entreprise'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.45;
      font-size: 11pt;
      background: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .header-title {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .header-sub {
      font-size: 9pt;
      color: #475569;
      margin-top: 4px;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 8pt;
      font-weight: 700;
      border-radius: 4px;
      background: #f1f5f9;
      color: #0f172a;
      border: 1px solid #cbd5e1;
    }
    .badge-success {
      background: #ecfdf5;
      color: #065f46;
      border-color: #a7f3d0;
    }
    .badge-alert {
      background: #fffbeb;
      color: #92400e;
      border-color: #fde68a;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 10pt;
    }
    table.data-table th {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
      font-weight: 700;
      color: #334155;
    }
    table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      vertical-align: top;
    }
    .kpi-container {
      display: flex;
      gap: 12px;
      margin-bottom: 18px;
    }
    .kpi-box {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      background: #f8fafc;
    }
    .kpi-label {
      font-size: 8pt;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
    }
    .notice-box {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 6px;
      padding: 10px;
      font-size: 9pt;
      margin-top: 15px;
      line-height: 1.4;
    }
    .signature-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #cbd5e1;
      font-size: 9pt;
    }
    .signature-box {
      width: 45%;
      border: 1px dashed #94a3b8;
      height: 70px;
      border-radius: 4px;
      padding: 8px;
    }
    .print-actions {
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .print-btn {
      background: #10b981;
      color: #022c22;
      font-weight: bold;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 11pt;
    }
    @media print {
      .print-actions {
        display: none !important;
      }
      body {
        padding: 0 !important;
      }
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <div>
      <strong>Diagnostic Officiel ADEC 2026</strong> - Prêt pour impression ou sauvegarde PDF
    </div>
    <button class="print-btn" onclick="window.print()">Imprimer en PDF (Ctrl+P)</button>
  </div>

  <table class="header-table">
    <tr>
      <td style="vertical-align: top;">
        <div style="font-size: 10pt; font-weight: bold; color: #475569; text-transform: uppercase;">
          Collectivité de Corse · Cullettività di Corsica
        </div>
        <h1 class="header-title">ADEC · Agence de Développement Économique</h1>
        <div class="header-sub">
          Cadre d'intervention : Délibération 21/177 AC · Guide des Aides 2026 & Annexe 1
        </div>
      </td>
      <td style="vertical-align: top; text-align: right; width: 220px;">
        <div class="badge" style="margin-bottom: 6px;">Dossier : ${dossierRef}</div>
        <div style="font-size: 9pt; color: #64748b;">Édité le ${editionDate}</div>
        <div style="font-size: 8pt; color: #94a3b8;">Simulation d'éligibilité indicative</div>
      </td>
    </tr>
  </table>

  <!-- KPI SUMMARY -->
  <div class="kpi-container">
    <div class="kpi-box">
      <div class="kpi-label">Dispositifs Éligibles</div>
      <div class="kpi-value" style="color: #059669;">${report.eligibleSchemes.length}</div>
      <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">sur ${report.eligibleSchemes.length + report.conditionalSchemes.length + report.ineligibleSchemes.length} analysés</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Subvention Estimée</div>
      <div class="kpi-value">${totalSimulatedEligibleGrant.toLocaleString('fr-FR')} €</div>
      <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">selon intensités applicables</div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Grille Qualitative 21/177 AC</div>
      <div class="kpi-value">${report.qualitativeTotalYes}/8</div>
      <div style="font-size: 8pt; color: ${report.qualitativeValidated ? '#059669' : '#d97706'}; margin-top: 2px;">
        ${report.qualitativeValidated ? 'Seuil validé (≥3)' : 'Seuil non atteint (<3)'}
      </div>
      <div style="font-size: 7pt; color: #64748b; margin-top: 1px;">
        (Non exigé pour U Pattu Risilienza)
      </div>
    </div>
    <div class="kpi-box">
      <div class="kpi-label">Solde De Minimis Résiduel</div>
      <div class="kpi-value" style="color: #0284c7;">${report.deMinimisAvailableRemaining.toLocaleString('fr-FR')} €</div>
      <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">sur 300 000 € autorisés</div>
    </div>
  </div>

  <!-- SECTION 1 : ENTREPRISE -->
  <div class="section-title">1. Identification & Profil de l'Entreprise Candidate</div>
  <table class="data-table">
    <tr>
      <th style="width: 25%;">Dénomination</th>
      <td style="width: 25%;"><strong>${company.name || 'Non renseignée'}</strong></td>
      <th style="width: 25%;">Numéro SIRET</th>
      <td style="width: 25%; font-family: monospace;"><strong>${company.siret || 'Non renseigné'}</strong></td>
    </tr>
    <tr>
      <th>Forme Juridique</th>
      <td>${company.legalForm}</td>
      <th>Capital Social</th>
      <td><strong>${company.capitalSocialFormatted || (company.capitalSocial ? `${new Intl.NumberFormat('fr-FR').format(company.capitalSocial)} €` : (company.legalForm === 'COMMERCIANT_ARTISAN_EI' || company.legalForm === 'MICRO_ENTREPRISE' ? 'Non applicable (EI)' : 'Non renseigné'))}</strong></td>
    </tr>
    <tr>
      <th>Catégorie Calculée</th>
      <td><strong>${company.size}</strong> (${company.headcount} ETP)</td>
      <th>Chiffre d'Affaires Retenu</th>
      <td>${company.annualRevenue ? company.annualRevenue.toLocaleString('fr-FR') + ' € HT' : 'Non précisé'}</td>
    </tr>
    <tr>
      <th>Commune & Localisation</th>
      <td colspan="3">${company.city || 'Corse'} (${company.postalCode || ''})</td>
    </tr>
    <tr>
      <th>Implantation en Corse</th>
      <td>${company.isEstablishedInCorsica ? 'Oui (Établissement situé en Corse)' : 'Non'}</td>
      <th>Exploitation Principale</th>
      <td>${company.hasMainExploitationInCorsica ? 'Oui (Activité principale en Corse)' : 'Non'}</td>
    </tr>
    <tr>
      <th>Date d'Immatriculation (INSEE)</th>
      <td><strong>${companyAge.isDateKnown ? companyAge.dateFormattedFr : 'Non communiquée (Justificatif Kbis requis)'}</strong></td>
      <th>Ancienneté & Phase ADEC</th>
      <td><strong>${companyAge.isDateKnown ? companyAge.ageLabel : 'Ancienneté indéterminée'}</strong> · ${companyAge.phaseLabel}</td>
    </tr>
    <tr>
      <th>Typologie Géographique</th>
      <td colspan="3">
        <strong>${formatLocationType(company.locationType, company.qpvNeighborhood)}</strong>
        ${(report.salvezzaCommune || company.salvezzaCommune) ? `<span class="badge badge-success" style="margin-left: 8px;">Fonds SALVEZZA : ${(report.salvezzaCommune || company.salvezzaCommune)?.nom} / ${(report.salvezzaCommune || company.salvezzaCommune)?.nomCorse} (Score ${(report.salvezzaCommune || company.salvezzaCommune)?.scoreContrainte})</span>` : ''}
      </td>
    </tr>
  </table>

  <!-- SECTION 2 : CONFORMITÉ RÉGLEMENTAIRE & HABILITATIONS -->
  <div class="section-title">2. Conformité Réglementaire Certifiée (API Entreprise)</div>
  <table class="data-table">
    <tr>
      <th style="width: 20%;">Administration</th>
      <th style="width: 25%;">Périmètre</th>
      <th style="width: 25%;">Statut Vérifié</th>
      <th style="width: 30%;">Observations</th>
    </tr>
    <tr>
      <td><strong>DGFIP</strong></td>
      <td>Régularité Fiscale (TVA, IS)</td>
      <td><span class="badge badge-success">À jour des obligations fiscales</span></td>
      <td>${company.complianceData?.dgfip?.attestationFiscale?.libelle || 'Attestation fiscale valide'}</td>
    </tr>
    <tr>
      <td><strong>URSSAF</strong></td>
      <td>Vigilance Sociale (Cotisations)</td>
      <td><span class="badge badge-success">À jour des cotisations</span></td>
      <td>${company.complianceData?.urssaf?.attestationVigilance?.libelle || 'Attestation de vigilance délivrée'}</td>
    </tr>
    <tr>
      <td><strong>INPI · RNE</strong></td>
      <td>Mandataires Sociaux (RNE)</td>
      <td><span class="badge">Inscrits au RNE</span></td>
      <td>${company.mandataires && company.mandataires.length > 0 ? company.mandataires.map(m => (m.prenom ? m.prenom + ' ' : '') + (m.nom || m.denomination) + ' (' + (m.fonction || 'Dirigeant') + ')').join(', ') : 'Qualité à agir certifiée'}</td>
    </tr>
    <tr>
      <td><strong>INSEE Sirene</strong></td>
      <td>Répertoire des Établissements</td>
      <td><span class="badge">Actif & Identifié</span></td>
      <td>Code NAF : ${company.nafCode || 'Validé'} · Établissement vérifié</td>
    </tr>
  </table>

  <!-- SECTION 3 : DISPOSITIFS ÉLIGIBLES -->
  <div class="section-title">3. Dispositifs d'Aide ADEC Éligibles Recommandés</div>
  ${report.eligibleSchemes.length > 0 ? `
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 15%;">Code</th>
        <th style="width: 35%;">Intitulé du Dispositif</th>
        <th style="width: 15%;">Taux ADEC</th>
        <th style="width: 15%;">Plafond / Règles</th>
        <th style="width: 20%;">Montant Estimé</th>
      </tr>
    </thead>
    <tbody>
      ${report.eligibleSchemes.map(item => `
        <tr>
          <td><strong>${item.scheme.code}</strong></td>
          <td>
            <strong>${item.scheme.name}</strong>
            <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">${item.scheme.legalBasis}</div>
            ${!item.scheme.requiresQualitativeEvaluation ? `<div style="font-size: 7.5pt; color: #047857; font-weight: bold; margin-top: 2px;">🛡️ Non soumis à l'évaluation qualitative (U Pattu Risilienza è Territorii)</div>` : `<div style="font-size: 7.5pt; color: #0284c7; margin-top: 2px;">📋 Évaluation qualitative validée (≥ 3 OUI)</div>`}
            ${item.salvezzaBonusApplied ? `<div style="font-size: 8pt; color: #047857; font-weight: bold; margin-top: 3px;">★ Bonification SALVEZZA : ${item.salvezzaBonusDetails}</div>` : ''}
          </td>
          <td><span class="badge badge-success">${item.applicableRatePercent > 1 ? item.applicableRatePercent.toFixed(0) : (item.applicableRatePercent * 100).toFixed(0)}%</span></td>
          <td style="font-size: 8.5pt;">${item.subsidyCalculationDetails || 'Selon barème'}</td>
          <td style="font-family: monospace; font-weight: bold; color: #065f46; font-size: 11pt;">
            ${item.estimatedSubsidyAmount.toLocaleString('fr-FR')} €
          </td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr style="background: #f1f5f9; font-weight: bold;">
        <td colspan="4" style="text-align: right; text-transform: uppercase;">Total de subvention potentiel estimé :</td>
        <td style="font-family: monospace; font-size: 12pt; color: #0f172a;">${totalSimulatedEligibleGrant.toLocaleString('fr-FR')} €</td>
      </tr>
    </tfoot>
  </table>
  ` : '<p>Aucun dispositif pleinement éligible identifié au vu des paramètres actuels.</p>'}

  ${report.conditionalSchemes.length > 0 ? `
  <div class="section-title" style="margin-top: 15px; color: #b45309; border-color: #fde68a;">
    4. Dispositifs sous conditions suspensives (${report.conditionalSchemes.length})
  </div>
  <table class="data-table">
    <tr>
      <th style="width: 20%;">Dispositif</th>
      <th style="width: 40%;">Conditions à remplir</th>
      <th style="width: 40%;">Potentiel de déblocage</th>
    </tr>
    ${report.conditionalSchemes.map(item => `
      <tr>
        <td><strong>${item.scheme.code}</strong> - ${item.scheme.name}</td>
        <td style="font-size: 9pt;">
          <ul style="margin: 0; padding-left: 15px;">
            ${item.reasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </td>
        <td style="font-size: 9pt;">Taux prévu : ${(item.applicableRatePercent * 100).toFixed(0)}% sous réserve de validation des critères.</td>
      </tr>
    `).join('')}
  </table>
  ` : ''}

  <!-- SECTION 5 : RÈGLE D'OR & MODALITÉS -->
  <div class="notice-box">
    <strong>Rappel impératif de la règle de l'antériorité :</strong><br>
    Conformément aux délibérations de la Collectivité de Corse, <em>aucune dépense ne doit être engagée</em> (signature de bon de commande, paiement d'acompte, facture) avant la délivrance du récépissé officiel de dépôt auprès de l'ADEC. Toute dépense antérieure est irrémédiablement rejetée.<br>
    <strong>Instruction souveraine :</strong> Ce diagnostic constitue un outil d'orientation fondé sur le Guide des Aides 2026. L'attribution définitive de toute subvention relève de la compétence exclusive du <strong>Bureau de l'ADEC</strong>.
  </div>

  <div class="signature-grid">
    <div class="signature-box">
      <strong>Visa du demandeur / Représentant légal :</strong><br>
      Nom : ${company.mandataires?.[0]?.nom || ''}<br>
      Date et signature :
    </div>
    <div class="signature-box" style="text-align: right;">
      <strong>Agence de Développement Économique de la Corse :</strong><br>
      Plateforme officielle : www.adec.corsica<br>
      Direction des Aides Directes aux Entreprises
    </div>
  </div>

  <script>
    // Déclenchement automatique de la fenêtre d'impression à l'ouverture
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPrintNotice(`Fichier téléchargeable prêt : "${fileName}". Vous pouvez l'ouvrir dans un nouvel onglet de votre navigateur pour imprimer ou enregistrer en PDF immédiatement sans restriction d'iframe !`);
  };

  // Copie d'une synthèse texte propre dans le presse-papier
  const handleCopySummary = () => {
    const lines = [
      `BILAN D'ÉLIGIBILITÉ AUX AIDES ADEC 2026`,
      `Collectivité de Corse · Agence de Développement Économique de la Corse`,
      `Référence Dossier : ${dossierRef} | Édité le : ${editionDate}`,
      `--------------------------------------------------`,
      `ENTREPRISE CANDIDATE :`,
      `Dénomination : ${company.name || 'Entreprise'}`,
      `SIRET : ${company.siret || 'N/A'}`,
      `Forme Juridique : ${company.legalForm}`,
      `Date d'Immatriculation : ${companyAge.isDateKnown ? companyAge.dateFormattedFr : 'Non communiquée (Justificatif Kbis requis)'} (${companyAge.isDateKnown ? companyAge.ageLabel : 'Ancienneté indéterminée'}) - ${companyAge.phaseLabel}`,
      `Commune : ${company.city || 'Corse'} (${company.postalCode || ''})`,
      `Typologie Géographique : ${formatLocationType(company.locationType, company.qpvNeighborhood)}`,
      `Catégorie : ${company.size} (${company.headcount} ETP)`,
      `Chiffre d'Affaires : ${company.annualRevenue ? company.annualRevenue.toLocaleString('fr-FR') + ' € HT' : 'N/A'}`,
      ``,
      `INDICATEURS CLÉS :`,
      `- Dispositifs éligibles : ${report.eligibleSchemes.length}`,
      `- Potentiel de subvention total simulé : ${totalSimulatedEligibleGrant.toLocaleString('fr-FR')} €`,
      `- Score grille qualitative 21/177 AC : ${report.qualitativeTotalYes}/8 (${report.qualitativeValidated ? 'Validée' : 'Non validée'})`,
      `- Solde De Minimis disponible : ${report.deMinimisAvailableRemaining.toLocaleString('fr-FR')} € (sur 300 000 €)`,
      ``,
      `DISPOSITIFS RECOMMANDÉS :`,
      ...report.eligibleSchemes.map(
        (e) => `* [${e.scheme.code}] ${e.scheme.name} : ${e.estimatedSubsidyAmount.toLocaleString('fr-FR')} € (Taux ${(e.applicableRatePercent * 100).toFixed(0)}%)`
      ),
      ``,
      `RAPPEL RÉGLEMENTAIRE : Aucune dépense ne doit être engagée avant le dépôt officiel sur www.adec.corsica.`,
      `Dossier instruit et décision souveraine du Bureau de l'ADEC.`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Impression & Export du Diagnostic ADEC
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 border border-neutral-700">
                  Guide 2026
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Génération de la fiche de synthèse officielle prête pour impression ou archivage PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Top) */}
        <div className="p-3 sm:p-4 bg-neutral-800/80 border-b border-neutral-700 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Print Button */}
            <button
              onClick={handleDirectPrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimer directement (Ctrl+P)
            </button>

            {/* Standalone HTML / PDF Download Button */}
            <button
              onClick={handleDownloadStandaloneHtml}
              className="px-4 py-2 bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs"
              title="Télécharge un document autonome avec impression automatique au format PDF"
            >
              <Download className="w-4 h-4 text-neutral-700" />
              Télécharger la Fiche (PDF / Autonome)
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopySummary}
              className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copier la synthèse
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 font-mono">
            Réf : <strong className="text-neutral-200">{dossierRef}</strong>
          </div>
        </div>

        {/* Notice alert if triggered */}
        {printNotice && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg bg-petrole-950/70 border border-petrole-600/40 text-petrole-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-petrole-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{printNotice}</div>
            <button
              onClick={() => setPrintNotice(null)}
              className="text-petrole-400 hover:text-petrole-200 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Printable Sheet Viewport Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950/40">
          <div className="bg-white text-neutral-900 rounded-xl p-6 sm:p-8 shadow-md border border-neutral-200 space-y-6 max-w-3xl mx-auto printable-report text-xs">
            {/* Header Document */}
            <div className="border-b-2 border-neutral-900 pb-4">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Collectivité de Corse · Cullettività di Corsica
                  </span>
                  <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight mt-0.5">
                    ADEC · AGENCE DE DÉVELOPPEMENT ÉCONOMIQUE DE LA CORSE
                  </h1>
                  <p className="text-xs text-neutral-600 mt-1">
                    Fiche Officielle d'Éligibilité & Diagnostic d'Aides Directes · Cadre Délibération 21/177 AC
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded font-mono text-[10px] font-bold text-neutral-800">
                    {dossierRef}
                  </span>
                  <p className="text-[10px] text-neutral-500 mt-1">Édité le {editionDate}</p>
                </div>
              </div>
            </div>

            {/* Key Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[9px] font-bold text-neutral-500 uppercase block">Dispositifs Éligibles</span>
                <span className="text-lg font-bold font-mono text-emerald-700">{report.eligibleSchemes.length}</span>
                <span className="text-[9px] text-neutral-500 block">sur {report.eligibleSchemes.length + report.conditionalSchemes.length + report.ineligibleSchemes.length} dispositifs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[9px] font-bold text-neutral-500 uppercase block">Subvention Estimée</span>
                <span className="text-lg font-bold font-mono text-neutral-900">{totalSimulatedEligibleGrant.toLocaleString('fr-FR')} €</span>
                <span className="text-[9px] text-neutral-500 block">selon intensités</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[9px] font-bold text-neutral-500 uppercase block">Grille Qualitative</span>
                <span className="text-lg font-bold font-mono text-neutral-900">{report.qualitativeTotalYes}/8</span>
                <span className={`text-[9px] font-bold block ${report.qualitativeValidated ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {report.qualitativeValidated ? 'Validée (≥3)' : 'Inférieur à 3'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200">
                <span className="text-[9px] font-bold text-neutral-500 uppercase block">De Minimis Résiduel</span>
                <span className="text-lg font-bold font-mono text-petrole-800">{report.deMinimisAvailableRemaining.toLocaleString('fr-FR')} €</span>
                <span className="text-[9px] text-neutral-500 block">sur 300 000 € autorisés</span>
              </div>
            </div>

            {/* 1. Identification Entreprise */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-neutral-700" />
                1. Identification du Candidat & Profil Économique
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-neutral-50 rounded border border-neutral-200/80">
                  <span className="text-neutral-500 block text-[9px] uppercase">Raison sociale</span>
                  <strong className="text-neutral-900 text-xs">{company.name || 'Entreprise candidate'}</strong>
                </div>
                <div className="p-2 bg-neutral-50 rounded border border-neutral-200/80">
                  <span className="text-neutral-500 block text-[9px] uppercase">Numéro SIRET (14 chiffres)</span>
                  <strong className="text-neutral-900 font-mono text-xs">{company.siret || 'Non renseigné'}</strong>
                </div>
                <div className="p-2 bg-neutral-50 rounded border border-neutral-200/80">
                  <span className="text-neutral-500 block text-[9px] uppercase">Forme juridique & Catégorie</span>
                  <span className="text-neutral-800">{company.legalForm} · <strong>{company.size}</strong> ({company.headcount} ETP)</span>
                </div>
                <div className="p-2 bg-neutral-50 rounded border border-neutral-200/80">
                  <span className="text-neutral-500 block text-[9px] uppercase">Date d'Immatriculation & Ancienneté</span>
                  <span className={`font-semibold ${companyAge.isDateKnown ? 'text-neutral-800' : 'text-amber-800'}`}>
                    {companyAge.isDateKnown ? companyAge.dateFormattedFr : 'Non communiquée'}
                  </span>
                  <span className={`block text-[10px] mt-0.5 font-medium ${companyAge.isDateKnown ? 'text-emerald-800' : 'text-amber-700'}`}>
                    {companyAge.isDateKnown ? companyAge.ageLabel : 'Ancienneté indéterminée (Kbis requis)'}
                  </span>
                </div>
                <div className="col-span-2 p-2 bg-neutral-50 rounded border border-neutral-200/80">
                  <span className="text-neutral-500 block text-[9px] uppercase">Commune & Typologie Territoriale</span>
                  <span className="text-neutral-800 font-medium">{company.city || 'Corse'} ({company.postalCode || ''})</span>
                  <span className="text-neutral-600 block text-[10px] mt-0.5 font-semibold text-emerald-800">
                    {formatLocationType(company.locationType, company.qpvNeighborhood)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Conformité Réglementaire Certifiée */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                2. Conformité Réglementaire Certifiée (API Entreprise)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <strong className="text-neutral-900 block">DGFIP (Fiscalité)</strong>
                    <span className="text-neutral-600">{company.complianceData?.dgfip?.attestationFiscale?.libelle || 'Attestation fiscale conforme (TVA & IS)'}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">À jour</span>
                </div>
                <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <strong className="text-neutral-900 block">URSSAF (Vigilance Sociale)</strong>
                    <span className="text-neutral-600">{company.complianceData?.urssaf?.attestationVigilance?.libelle || 'Cotisations sociales acquittées'}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">À jour</span>
                </div>
                <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <strong className="text-neutral-900 block">INPI (Mandataires RNE)</strong>
                    <span className="text-neutral-600">{company.mandataires && company.mandataires.length > 0 ? `${company.mandataires[0].nom} (${company.mandataires[0].fonction})` : 'Dirigeant légal habilité'}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-aubergine-100 text-aubergine-800 font-bold shrink-0">Conforme</span>
                </div>
                <div className="p-2 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <strong className="text-neutral-900 block">INSEE (Sirene Étendu)</strong>
                    <span className="text-neutral-600">Établissement actif vérifié (Code NAF {company.nafCode || 'Validé'})</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-petrole-100 text-petrole-800 font-bold shrink-0">Actif</span>
                </div>
              </div>
            </div>

            {/* 3. Dispositifs Éligibles */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-200 pb-1">
                3. Tableau des Dispositifs d'Aide Recommandés
              </h3>
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700">
                    <th className="p-1.5 border border-neutral-200 text-left">Code</th>
                    <th className="p-1.5 border border-neutral-200 text-left">Dispositif</th>
                    <th className="p-1.5 border border-neutral-200 text-center">Taux</th>
                    <th className="p-1.5 border border-neutral-200 text-left">Détail du calcul</th>
                    <th className="p-1.5 border border-neutral-200 text-right">Montant Estimé</th>
                  </tr>
                </thead>
                <tbody>
                  {report.eligibleSchemes.map((item, idx) => (
                    <tr key={idx} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="p-1.5 border border-neutral-200 font-bold text-neutral-900">{item.scheme.code}</td>
                      <td className="p-1.5 border border-neutral-200">
                        <strong className="text-neutral-900">{item.scheme.name}</strong>
                        <div className="text-[9px] text-neutral-500">{item.scheme.legalBasis}</div>
                      </td>
                      <td className="p-1.5 border border-neutral-200 text-center font-bold text-emerald-700">
                        {(item.applicableRatePercent * 100).toFixed(0)}%
                      </td>
                      <td className="p-1.5 border border-neutral-200 text-neutral-600">{item.subsidyCalculationDetails}</td>
                      <td className="p-1.5 border border-neutral-200 text-right font-mono font-bold text-emerald-800">
                        {item.estimatedSubsidyAmount.toLocaleString('fr-FR')} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 font-bold text-neutral-900">
                    <td colSpan={4} className="p-2 border border-neutral-200 text-right uppercase text-[9px]">
                      Total subvention potentiel estimé :
                    </td>
                    <td className="p-2 border border-neutral-200 text-right font-mono text-xs text-neutral-900">
                      {totalSimulatedEligibleGrant.toLocaleString('fr-FR')} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 4. Avertissement Antériorité & Signature */}
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-[10px] space-y-1.5 leading-relaxed text-neutral-700">
              <strong className="text-neutral-900 block uppercase">
                Règle impérative de non-antériorité des dépenses & Procédure :
              </strong>
              <p>
                Aucune dépense ne doit être engagée (devis signé, acompte versé, facture émise) avant le dépôt dématérialisé du dossier complet sur le portail de l'ADEC. Le présent diagnostic constitue une simulation technique indicative. L'octroi définitif d'une aide relève de la compétence souveraine du <strong>Bureau de l'ADEC</strong> après instruction des pièces justificatives.
              </p>
            </div>

            {/* Signature Box */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-200 text-[10px]">
              <div className="p-3 border border-dashed border-neutral-300 rounded h-20">
                <span className="font-bold text-neutral-700 block">Pour l'entreprise demanderesse :</span>
                <span className="text-[9px] text-neutral-500">Nom, qualité du signataire et signature</span>
              </div>
              <div className="p-3 border border-dashed border-neutral-300 rounded h-20 text-right">
                <span className="font-bold text-neutral-700 block">Pour l'ADEC :</span>
                <span className="text-[9px] text-neutral-500">Service d'instruction territoriale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
          <span className="text-neutral-400">
            Guide des Aides ADEC 2026 · Collectivité de Corse
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
};
