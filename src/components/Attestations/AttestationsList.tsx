/**
 * Les 4 pièces exigées par l'ADEC : immatriculation RNE, attestation fiscale (DGFiP),
 * attestation de vigilance (URSSAF) et extrait des mandataires sociaux.
 * Partagé entre la page « Attestations » et l'étape 1 du simulateur.
 */

import React, { useState } from 'react';
import { Building2, Landmark, ShieldCheck, UserCheck, Download, CheckCircle2 } from 'lucide-react';
import { CompanyProfile, MandataireSocial } from '../../types';
import { downloadExtraitRnePdf } from '../../services/apiEntreprise';
import { ATTESTATIONS_REGISTRY, downloadCertificateFile } from '../../utils/complianceCertificates';
import { getOfficialRneDownloadUrl } from '../../utils/rneDownloader';
import { ComplianceRow } from '../Questionnaire/ComplianceRow';

export const primaryActionClass = 'inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold transition shadow-2xs cursor-pointer';
export const secondaryActionClass = 'inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-[11px] font-semibold transition cursor-pointer';
const disabledActionClass = 'inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-md text-[11px] font-semibold cursor-not-allowed';

/** Mandataires saisis, sinon ceux remontés par les registres */
export function getCurrentMandataires(data: CompanyProfile): MandataireSocial[] {
  if (data.mandataires && data.mandataires.length > 0) return data.mandataires;
  return data.complianceData?.infogreffe?.mandatairesSociaux || [];
}

interface AttestationsListProps {
  data: CompanyProfile;
  hasToken: boolean;
  /** Texte de la ligne « Mandataires & pouvoirs » */
  mandatairesDescription?: string;
  /** Lignes supplémentaires ajoutées sous les 4 attestations (BODACC, observations…) */
  children?: React.ReactNode;
}

export const AttestationsList: React.FC<AttestationsListProps> = ({
  data,
  hasToken,
  mandatairesDescription = 'Représentation légale de la société (dirigeants inscrits au registre).',
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
    setDownloadSuccessNotice(`"${ATTESTATIONS_REGISTRY.infogreffe.title}" a été généré et téléchargé avec succès au format PDF (${fileName}).`);
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

  // Nombre de pièces réellement vérifiées (RNE, DGFiP, URSSAF, mandataires)
  const verifiedCount = [rneOk, dgfipOk, urssafOk, currentMandataires.length > 0].filter(Boolean).length;

  return (
    <div className="space-y-2">
      {downloadSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{downloadSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div>
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Conformité & justificatifs</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border normal-case tracking-normal ${
            verifiedCount === 4
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {verifiedCount}/4 pièces vérifiées
          </span>
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Pièces exigées par l'ADEC pour l'instruction et le versement des aides.
        </p>
      </div>

      <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
        <ComplianceRow
          icon={<Building2 className="w-3.5 h-3.5" />}
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
                className={`${primaryActionClass} disabled:opacity-50`}
                title={hasToken
                  ? "Télécharger l'extrait RNE officiel (INPI, via API Entreprise)"
                  : `Ouvrir le justificatif d'immatriculation public (${getOfficialRneDownloadUrl(activeSiren)})`}
              >
                <Download className={`w-3 h-3 ${isDownloadingRnePdf ? 'animate-bounce' : ''}`} />
                <span>{isDownloadingRnePdf ? 'Génération INPI...' : 'PDF officiel'}</span>
              </button>
            ) : undefined
          }
        >
          {rnePdfError && activeSiren && (
            <div className="md:pl-[15.75rem] text-[11px]">
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-900 space-y-1">
                <p><strong>Extrait RNE indisponible auprès de l’INPI.</strong> {rnePdfError}</p>
                <p className="text-slate-700">
                  Réessayez dans quelques minutes, ou ouvrez le{' '}
                  <a
                    href={getOfficialRneDownloadUrl(activeSiren)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-700 underline hover:text-blue-900"
                  >
                    justificatif d’immatriculation public (Annuaire des Entreprises)
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </ComplianceRow>

        <ComplianceRow
          icon={<Landmark className="w-3.5 h-3.5" />}
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
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
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
          icon={<UserCheck className="w-3.5 h-3.5" />}
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
