/**
 * Les 4 pièces exigées par l'ADEC : immatriculation RNE, attestation fiscale (DGFiP),
 * attestation de vigilance (URSSAF) et extrait des mandataires sociaux.
 * Partagé entre la page « Attestations » et l'étape 1 du simulateur.
 */

import React, { useState } from 'react';
import { Building2, Landmark, ShieldCheck, UserCheck, Download, X } from 'lucide-react';
import { CompanyProfile, MandataireSocial } from '../../types';
import { downloadExtraitRnePdf } from '../../services/apiEntreprise';
import { ATTESTATIONS_REGISTRY, downloadCertificateFile } from '../../utils/complianceCertificates';
import { getOfficialRneDownloadUrl } from '../../utils/rneDownloader';
import { ComplianceRow } from '../Questionnaire/ComplianceRow';
import { Badge, btn, iconBtn, linkClass, Notice } from '../Layout/ui';

export const primaryActionClass = btn('primary', 'sm');
export const secondaryActionClass = btn('secondary', 'sm');
const disabledActionClass =
  'inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-400 text-xs font-medium whitespace-nowrap cursor-not-allowed';

/** Mandataires saisis, sinon ceux remontés par les registres */
export function getCurrentMandataires(data: CompanyProfile): MandataireSocial[] {
  if (data.mandataires && data.mandataires.length > 0) return data.mandataires;
  return data.complianceData?.infogreffe?.mandatairesSociaux || [];
}

/** Nombre de pièces réellement vérifiées (RNE, DGFiP, URSSAF, mandataires) */
export function countVerifiedPieces(data: CompanyProfile): number {
  return [
    data.complianceData?.rne?.status === 'ok',
    data.complianceData?.dgfip?.attestationFiscale?.status === 'ok',
    data.complianceData?.urssaf?.attestationVigilance?.status === 'ok',
    getCurrentMandataires(data).length > 0
  ].filter(Boolean).length;
}

export const VerifiedPiecesBadge: React.FC<{ data: CompanyProfile }> = ({ data }) => {
  const count = countVerifiedPieces(data);
  return <Badge tone={count === 4 ? 'success' : 'warning'}>{count}/4 pièces vérifiées</Badge>;
};

interface AttestationsListProps {
  data: CompanyProfile;
  hasToken: boolean;
  /** Texte de la ligne « Mandataires & pouvoirs » */
  mandatairesDescription?: string;
  /** Titre et compteur au-dessus de la liste (masqués quand le parent les affiche) */
  showHeading?: boolean;
  /** Lignes supplémentaires ajoutées sous les 4 attestations (BODACC, observations…) */
  children?: React.ReactNode;
}

export const AttestationsList: React.FC<AttestationsListProps> = ({
  data,
  hasToken,
  mandatairesDescription = 'Représentation légale de la société (dirigeants inscrits au registre).',
  showHeading = true,
  children
}) => {
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);
  const [isDownloadingRnePdf, setIsDownloadingRnePdf] = useState(false);
  const [rnePdfError, setRnePdfError] = useState<string | null>(null);

  const activeSiren = data.siren || (data.siret ? data.siret.replace(/\D/g, '').slice(0, 9) : '');

  // Extrait RNE officiel INPI : lien frais demandé au clic (jeton requis), sinon justificatif public
  const handleDownloadExtraitRne = async (siren: string) => {
    setRnePdfError(null);
    if (!hasToken) {
      window.open(getOfficialRneDownloadUrl(siren), '_blank', 'noopener,noreferrer');
      return;
    }
    setIsDownloadingRnePdf(true);
    const result = await downloadExtraitRnePdf(siren, data.name);
    setIsDownloadingRnePdf(false);
    if (!result.success) {
      setRnePdfError(result.error || 'Téléchargement impossible.');
    }
  };

  const handleDownloadGouvernance = () => {
    const { fileName } = downloadCertificateFile('infogreffe', data);
    setDownloadSuccessNotice(`« ${ATTESTATIONS_REGISTRY.infogreffe.title} » généré et téléchargé (${fileName}).`);
    setTimeout(() => {
      setDownloadSuccessNotice(null);
    }, 5000);
  };

  // Attestations officielles DGFiP / URSSAF délivrées via API Entreprise
  const dgfipOk = data.complianceData?.dgfip?.attestationFiscale?.status === 'ok';
  const urssafOk = data.complianceData?.urssaf?.attestationVigilance?.status === 'ok';
  const dgfipDocumentUrl = data.complianceData?.dgfip?.attestationFiscale?.documentUrl;
  const urssafDocumentUrl = data.complianceData?.urssaf?.attestationVigilance?.documentUrl;

  // Immatriculation RNE
  const rneOk = data.complianceData?.rne?.status === 'ok';
  const rneDateIso = data.complianceData?.rne?.dateImmatriculationRne;
  const rneDateFr = rneDateIso && /^\d{4}-\d{2}-\d{2}/.test(rneDateIso)
    ? new Date(rneDateIso).toLocaleDateString('fr-FR')
    : rneDateIso;

  const currentMandataires = getCurrentMandataires(data);

  return (
    <div className="space-y-2">
      {showHeading && (
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-neutral-900">Pièces justificatives</h3>
          <VerifiedPiecesBadge data={data} />
          <span className="text-xs text-neutral-500">Exigées pour l’instruction et le versement des aides.</span>
        </div>
      )}

      {downloadSuccessNotice && (
        <Notice
          tone="success"
          className={showHeading ? '' : 'mx-4 mt-3'}
          action={
            <button type="button" onClick={() => setDownloadSuccessNotice(null)} className={iconBtn} aria-label="Fermer">
              <X className="w-3.5 h-3.5" />
            </button>
          }
        >
          {downloadSuccessNotice}
        </Notice>
      )}

      <div className={`divide-y divide-neutral-200 bg-white ${showHeading ? 'border border-neutral-200 rounded-md' : ''}`}>
        <ComplianceRow
          icon={<Building2 className="w-4 h-4" />}
          title="Immatriculation RNE"
          source="INPI · Registre National des Entreprises"
          tone={rneOk ? 'ok' : 'unknown'}
          statusLabel={rneOk ? 'Immatriculée' : 'Non vérifiée'}
          description={
            rneOk
              ? `Immatriculation au RNE${rneDateFr ? ` le ${rneDateFr}` : ''}. Justificatif officiel téléchargeable.`
              : 'Lancez une recherche SIRET pour vérifier l’immatriculation.'
          }
          actions={
            activeSiren ? (
              <button
                type="button"
                onClick={() => handleDownloadExtraitRne(activeSiren)}
                disabled={isDownloadingRnePdf}
                className={primaryActionClass}
                title={hasToken
                  ? "Télécharger l'extrait RNE officiel (INPI, via API Entreprise)"
                  : `Ouvrir le justificatif d'immatriculation public (${getOfficialRneDownloadUrl(activeSiren)})`}
              >
                <Download className={`w-3 h-3 ${isDownloadingRnePdf ? 'animate-bounce' : ''}`} />
                <span>{isDownloadingRnePdf ? 'Génération INPI…' : 'PDF officiel'}</span>
              </button>
            ) : undefined
          }
        >
          {rnePdfError && activeSiren && (
            <div className="md:pl-[15.75rem]">
              <Notice tone="danger" title="Extrait RNE indisponible auprès de l’INPI.">
                <p>{rnePdfError}</p>
                <p>
                  Réessayer dans quelques minutes, ou ouvrir le{' '}
                  <a href={getOfficialRneDownloadUrl(activeSiren)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    justificatif d’immatriculation public (Annuaire des Entreprises)
                  </a>
                  .
                </p>
              </Notice>
            </div>
          )}
        </ComplianceRow>

        <ComplianceRow
          icon={<Landmark className="w-4 h-4" />}
          title="Attestation fiscale"
          source="DGFiP · Art. L. 2141-2 CCP"
          tone={dgfipOk ? 'ok' : 'unknown'}
          statusLabel={dgfipOk ? 'À jour' : 'Non certifiée'}
          description={data.complianceData?.dgfip?.attestationFiscale?.libelle || 'Aucune attestation délivrée (jeton API Entreprise requis).'}
          actions={
            dgfipDocumentUrl ? (
              <a href={dgfipDocumentUrl} target="_blank" rel="noopener noreferrer" className={primaryActionClass} title="Attestation fiscale officielle délivrée par la DGFiP">
                <Download className="w-3 h-3" />
                <span>PDF officiel</span>
              </a>
            ) : (
              <span className={disabledActionClass} title="Aucune attestation fiscale délivrée">
                <Download className="w-3 h-3" />
                <span>Non disponible</span>
              </span>
            )
          }
        />

        <ComplianceRow
          icon={<ShieldCheck className="w-4 h-4" />}
          title="Attestation de vigilance"
          source="URSSAF · Art. L. 243-15 CSS"
          tone={urssafOk ? 'ok' : 'unknown'}
          statusLabel={urssafOk ? 'À jour' : 'Non certifiée'}
          description={data.complianceData?.urssaf?.attestationVigilance?.libelle || 'Aucune attestation délivrée (jeton API Entreprise requis).'}
          actions={
            urssafDocumentUrl ? (
              <a href={urssafDocumentUrl} target="_blank" rel="noopener noreferrer" className={primaryActionClass} title="Attestation de vigilance officielle délivrée par l'URSSAF">
                <Download className="w-3 h-3" />
                <span>PDF officiel</span>
              </a>
            ) : (
              <span className={disabledActionClass} title="Aucune attestation de vigilance délivrée">
                <Download className="w-3 h-3" />
                <span>Non disponible</span>
              </span>
            )
          }
        />

        <ComplianceRow
          icon={<UserCheck className="w-4 h-4" />}
          title="Mandataires & pouvoirs"
          source="RNE · Art. L. 123-36 C. com."
          tone={currentMandataires.length > 0 ? 'ok' : 'unknown'}
          statusLabel={
            currentMandataires.length > 0
              ? `${currentMandataires.length} ${currentMandataires.length > 1 ? 'dirigeants' : 'dirigeant'}`
              : 'Non renseignés'
          }
          description={mandatairesDescription}
          actions={
            <button
              type="button"
              onClick={handleDownloadGouvernance}
              className={secondaryActionClass}
              title="Télécharger l'extrait de gouvernance (PDF généré à partir des mandataires déclarés)"
            >
              <Download className="w-3 h-3" />
              <span>Extrait (PDF)</span>
            </button>
          }
        />

        {children}
      </div>
    </div>
  );
};
