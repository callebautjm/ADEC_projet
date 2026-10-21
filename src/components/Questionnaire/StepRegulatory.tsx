/**
 * Step 2 : Situation réglementaire, fiscale & antécédents ADEC
 * Collectivité de Corse / ADEC
 */

import React from 'react';
import { RegulatoryStatus, ApiEntrepriseComplianceData } from '../../types';
import { ShieldAlert, AlertCircle, CheckCircle2, Euro, FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';

interface StepRegulatoryProps {
  data: RegulatoryStatus;
  complianceData?: ApiEntrepriseComplianceData;
  onChange: (updated: Partial<RegulatoryStatus>) => void;
  /** Section intégrée dans une étape plus large : masque le titre d’étape */
  embedded?: boolean;
}

export const StepRegulatory: React.FC<StepRegulatoryProps> = ({ data, complianceData, onChange, embedded = false }) => {
  const deMinimisLimit = 300000;
  const remainingDeMinimis = Math.max(0, deMinimisLimit - (data.deMinimisPast3Years || 0));

  const hasDgfipOk = complianceData?.dgfip?.attestationFiscale?.status === 'ok';
  const hasUrssafOk = complianceData?.urssaf?.attestationVigilance?.status === 'ok';
  const hasCertifiedProof = Boolean(complianceData && (hasDgfipOk || hasUrssafOk));

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-neutral-700" />
            2. Situation Réglementaire, Fiscale & Règle de Minimis
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            L’ADEC applique des critères stricts de conformité fiscale, sociale et de gestion des aides publiques antérieures.
          </p>
        </div>
      )}

      {/* Cartouche de certification directe par API Entreprise */}
      {hasCertifiedProof && (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Vérification Automatisée par l'API Entreprise (DGFIP & URSSAF)
              </span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-md">
              Attestations officielles conformes
            </span>
          </div>

          <p className="text-xs text-emerald-900 leading-relaxed">
            Grâce aux habilitations ministérielles de votre jeton API Entreprise, la régularité fiscale et sociale de l’établissement a été vérifiée directement auprès des administrations d'État :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Volet Fiscal DGFIP */}
            <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Volet Fiscal (DGFIP)
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${hasDgfipOk ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                  {hasDgfipOk ? 'À jour (TVA / IS)' : 'Non certifié'}
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                {complianceData?.dgfip?.attestationFiscale?.libelle || 'Attestation fiscale'}
              </p>
              {complianceData?.dgfip?.attestationFiscale?.documentUrl && (
                <a
                  href={complianceData.dgfip.attestationFiscale.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-petrole-700 hover:text-petrole-900 pt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger l'attestation fiscale (.pdf)
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Volet Social URSSAF */}
            <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Volet Social (URSSAF)
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${hasUrssafOk ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                  {hasUrssafOk ? 'À jour (Cotisations)' : 'Non certifié'}
                </span>
              </div>
              <p className="text-xs font-semibold text-neutral-800">
                {complianceData?.urssaf?.attestationVigilance?.libelle || 'Attestation de vigilance'}
              </p>
              {complianceData?.urssaf?.attestationVigilance?.documentUrl && (
                <a
                  href={complianceData.urssaf.attestationVigilance.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-petrole-700 hover:text-petrole-900 pt-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger l'attestation de vigilance (.pdf)
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conformité fiscale et sociale */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
          Obligations fiscales & sociales
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-start gap-3 p-3.5 bg-white border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition">
            <input
              type="checkbox"
              checked={data.isUpToDateTaxSocial}
              onChange={(e) => onChange({ isUpToDateTaxSocial: e.target.checked })}
              className="w-4 h-4 text-neutral-900 rounded focus:ring-prune-500 mt-0.5"
            />
            <div className="text-xs">
              <span className="font-semibold text-neutral-900 block">À jour des cotisations fiscales et sociales</span>
              <span className="text-neutral-500">L’entreprise est à jour de l’ensemble de ses déclarations et paiements (URSSAF, impôts).</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-white border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition">
            <input
              type="checkbox"
              checked={data.hasValidDebtRepaymentPlan}
              onChange={(e) => onChange({ hasValidDebtRepaymentPlan: e.target.checked })}
              className="w-4 h-4 text-neutral-900 rounded focus:ring-prune-500 mt-0.5"
            />
            <div className="text-xs">
              <span className="font-semibold text-neutral-900 block">Plan d’étalement ou d’apurement en cours</span>
              <span className="text-neutral-500">Un moratoire officiel validé et respecté est en cours avec l'administration fiscale ou sociale.</span>
            </div>
          </label>
        </div>

        {!data.isUpToDateTaxSocial && !data.hasValidDebtRepaymentPlan && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Motif d’inéligibilité éliminatoire :</span> Conformément aux règles d’ordre public de l’ADEC, les entreprises qui ne sont pas à jour de leurs cotisations et ne bénéficient pas d’un plan d’étalement validé ne peuvent prétendre à aucune aide territoriale.
            </div>
          </div>
        )}
      </div>

      {/* Santé financière & Procédures collectives */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
          Situation financière & Procédures collectives
        </label>

        {complianceData?.bodacc && (
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`w-2 h-2 rounded-full ${complianceData.bodacc.hasProcedureCollective ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="font-semibold text-neutral-800">
                Statut officiel BODACC (API DILA) :
              </span>
              <span className={complianceData.bodacc.hasProcedureCollective ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold'}>
                {complianceData.bodacc.hasProcedureCollective ? 'Procédure collective active' : 'In bonis (Aucune procédure collective en cours)'}
              </span>
            </div>
            {complianceData.bodacc.dernierAvisDate && (
              <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
                Dernier avis : {complianceData.bodacc.dernierAvisDate}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2.5">
          <label className="flex items-start gap-3 p-3 bg-white border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition">
            <input
              type="checkbox"
              checked={data.isCompanyInDifficultyEU}
              onChange={(e) => onChange({ isCompanyInDifficultyEU: e.target.checked })}
              className="w-4 h-4 text-neutral-900 rounded focus:ring-prune-500 mt-0.5"
            />
            <div className="text-xs">
              <span className="font-semibold text-neutral-900 block">
                Entreprise en difficulté au sens européen (Règlement UE n° 651/2014, art. 2 point 18)
              </span>
              <span className="text-neutral-500">
                Plus de la moitié du capital social a disparu (dont plus du quart au cours des 12 derniers mois), ou procédure de sauvegarde/redressement judiciaire.
              </span>
            </div>
          </label>

          {data.isCompanyInDifficultyEU && (
            <div className="p-3 bg-petrole-50 border border-petrole-200 rounded-lg text-xs text-petrole-900">
              <span className="font-bold">Orientation automatique prise en compte :</span> En cochant ce critère de détérioration financière, l’entreprise relève spécifiquement de la mesure d’aide <strong>« Ribumbà »</strong> (restructuration et rebond d’entreprises en difficulté). Ce besoin a été <strong>automatiquement sélectionné en étape 3 (Typologie du projet)</strong>.
            </div>
          )}

          <label className="flex items-start gap-3 p-3 bg-white border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition">
            <input
              type="checkbox"
              checked={data.isInInsolvencyOrBankruptcy}
              onChange={(e) => onChange({ isInInsolvencyOrBankruptcy: e.target.checked })}
              className="w-4 h-4 text-neutral-900 rounded focus:ring-prune-500 mt-0.5"
            />
            <div className="text-xs">
              <span className="font-semibold text-neutral-900 block">
                Procédure collective incompatible avec le maintien de l’activité (Liquidation judiciaire)
              </span>
              <span className="text-neutral-500">
                Cessation définitive ou liquidation rendant impossible la poursuite de l’exploitation.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Antécédents avec l'ADEC et aides publiques */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
          Antécédents d’aides publiques & relations antérieures ADEC
        </label>

        <div className="space-y-2">
          <label className="flex items-start gap-2.5 p-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasPriorAdecUnfulfilledObligations}
              onChange={(e) => onChange({ hasPriorAdecUnfulfilledObligations: e.target.checked })}
              className="w-4 h-4 text-neutral-900 rounded focus:ring-prune-500 mt-0.5"
            />
            <span>
              Défaut de justification ou de pièces pour le Contrôle de Service Fait (CSF) sur une aide ADEC antérieure
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasAdecPriorBreachOfContract}
              onChange={(e) => onChange({ hasAdecPriorBreachOfContract: e.target.checked })}
              className="w-4 h-4 text-neutral-900 rounded focus:ring-prune-500 mt-0.5"
            />
            <span>
              Non-respect des obligations résultant d’une convention antérieure conclue avec l’ADEC (ex: engagement de maintien d’emplois)
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasPendingPublicRecoveryOrder}
              onChange={(e) => onChange({ hasPendingPublicRecoveryOrder: e.target.checked })}
              className="w-4 h-4 text-neutral-900 rounded focus:ring-prune-500 mt-0.5"
            />
            <span>
              Fait l’objet d’une procédure de recouvrement d’une aide publique devenue définitive non régularisée
            </span>
          </label>

          <label className="flex items-start gap-2.5 p-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasBenefitedRescueAidPast10Years}
              onChange={(e) => onChange({ hasBenefitedRescueAidPast10Years: e.target.checked })}
              className="w-4 h-4 text-neutral-900 rounded focus:ring-prune-500 mt-0.5"
            />
            <span>
              A déjà bénéficié d’une aide d’État au sauvetage ou à la restructuration au cours des 10 dernières années (principe de non-récurrence SA.41259)
            </span>
          </label>
        </div>
      </div>

      {/* Plafond de minimis (Règlement UE 2023/2831) */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4 text-neutral-700" />
            <span className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
              Règle de minimis (Règlement UE 2023/2831)
            </span>
          </div>
          <span className="text-xs font-mono text-neutral-600">
            Plafond triennal légal : 300 000 €
          </span>
        </div>

        <p className="text-xs text-neutral-500">
          Indiquez le montant cumulé des aides publiques reçues au titre du régime de minimis au cours des trois derniers exercices fiscaux glissants (ex: aides régionales, subventions locales soumises à de minimis).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Montant de minimis déjà perçu (€)
            </label>
            <input
              type="number"
              min="0"
              max="300000"
              value={data.deMinimisPast3Years}
              onChange={(e) => onChange({ deMinimisPast3Years: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-prune-500 font-mono"
            />
          </div>

          <div className="p-3 bg-white border border-neutral-200 rounded-lg text-xs">
            <span className="text-neutral-500 block mb-0.5">Capacité résiduelle disponible :</span>
            <span className="text-base font-bold font-mono text-emerald-600">
              {remainingDeMinimis.toLocaleString('fr-FR')} €
            </span>
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              sur 300 000 € maximum autorisés par entreprise unique
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
