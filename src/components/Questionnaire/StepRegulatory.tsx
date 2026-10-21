/**
 * Step 2 : Situation réglementaire, fiscale & antécédents ADEC
 * Collectivité de Corse / ADEC
 */

import React from 'react';
import { RegulatoryStatus, ApiEntrepriseComplianceData } from '../../types';
import { Download } from 'lucide-react';
import { Badge, Notice, Panel, SectionHeading, StatusDot, checkRowClass, inputClass, labelClass, linkClass } from '../Layout/ui';

interface StepRegulatoryProps {
  data: RegulatoryStatus;
  complianceData?: ApiEntrepriseComplianceData;
  onChange: (updated: Partial<RegulatoryStatus>) => void;
  /** Section intégrée dans une étape plus large : masque le titre d’étape */
  embedded?: boolean;
}

/** Case à cocher avec libellé et précision */
const CheckRow: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; title: React.ReactNode; detail?: React.ReactNode }> = ({
  checked,
  onChange,
  title,
  detail
}) => (
  <label className={checkRowClass}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 mt-px shrink-0" />
    <span>
      <span className={`block ${detail ? 'font-medium text-neutral-900' : 'text-neutral-800'}`}>{title}</span>
      {detail && <span className="text-neutral-500">{detail}</span>}
    </span>
  </label>
);

export const StepRegulatory: React.FC<StepRegulatoryProps> = ({ data, complianceData, onChange, embedded = false }) => {
  const deMinimisLimit = 300000;
  const remainingDeMinimis = Math.max(0, deMinimisLimit - (data.deMinimisPast3Years || 0));

  const hasDgfipOk = complianceData?.dgfip?.attestationFiscale?.status === 'ok';
  const hasUrssafOk = complianceData?.urssaf?.attestationVigilance?.status === 'ok';
  const hasCertifiedProof = Boolean(complianceData && (hasDgfipOk || hasUrssafOk));

  return (
    <div className="space-y-4">
      {!embedded && (
        <SectionHeading
          title="2. Situation réglementaire, fiscale & règle de minimis"
          description="Critères de conformité fiscale, sociale et de gestion des aides publiques antérieures appliqués par l’ADEC."
        />
      )}

      {/* Vérification directe par API Entreprise */}
      {hasCertifiedProof && (
        <Panel
          headingLevel={3}
          title="Régularité vérifiée par l’API Entreprise"
          description="Attestations délivrées par les administrations (DGFiP, URSSAF) via le jeton API Entreprise."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                key: 'dgfip',
                label: 'Volet fiscal (DGFiP)',
                ok: hasDgfipOk,
                okLabel: 'À jour (TVA / IS)',
                libelle: complianceData?.dgfip?.attestationFiscale?.libelle || 'Attestation fiscale',
                url: complianceData?.dgfip?.attestationFiscale?.documentUrl,
                linkLabel: 'Télécharger l’attestation fiscale (PDF)'
              },
              {
                key: 'urssaf',
                label: 'Volet social (URSSAF)',
                ok: hasUrssafOk,
                okLabel: 'À jour (cotisations)',
                libelle: complianceData?.urssaf?.attestationVigilance?.libelle || 'Attestation de vigilance',
                url: complianceData?.urssaf?.attestationVigilance?.documentUrl,
                linkLabel: 'Télécharger l’attestation de vigilance (PDF)'
              }
            ].map((volet) => (
              <div key={volet.key} className="px-3 py-2.5 border border-neutral-200 rounded-md space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-neutral-500">{volet.label}</span>
                  <Badge tone={volet.ok ? 'success' : 'neutral'}>{volet.ok ? volet.okLabel : 'Non certifié'}</Badge>
                </div>
                <p className="font-medium text-neutral-800">{volet.libelle}</p>
                {volet.url && (
                  <a href={volet.url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-[11px] ${linkClass}`}>
                    <Download className="w-3 h-3" />
                    {volet.linkLabel}
                  </a>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Conformité fiscale et sociale */}
      <Panel headingLevel={3} title="Obligations fiscales et sociales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CheckRow
            checked={data.isUpToDateTaxSocial}
            onChange={(checked) => onChange({ isUpToDateTaxSocial: checked })}
            title="À jour des cotisations fiscales et sociales"
            detail="L’entreprise est à jour de l’ensemble de ses déclarations et paiements (URSSAF, impôts)."
          />
          <CheckRow
            checked={data.hasValidDebtRepaymentPlan}
            onChange={(checked) => onChange({ hasValidDebtRepaymentPlan: checked })}
            title="Plan d’étalement ou d’apurement en cours"
            detail="Un moratoire officiel validé et respecté est en cours avec l’administration fiscale ou sociale."
          />
        </div>

        {!data.isUpToDateTaxSocial && !data.hasValidDebtRepaymentPlan && (
          <Notice tone="danger" title="Motif d’inéligibilité éliminatoire">
            Une entreprise qui n’est pas à jour de ses cotisations et ne bénéficie pas d’un plan d’étalement validé ne peut prétendre à aucune aide territoriale.
          </Notice>
        )}
      </Panel>

      {/* Santé financière & procédures collectives */}
      <Panel headingLevel={3} title="Situation financière et procédures collectives">
        {complianceData?.bodacc && (
          <div className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusDot tone={complianceData.bodacc.hasProcedureCollective ? 'danger' : 'success'} />
              <span className="text-neutral-600">Statut BODACC (DILA) :</span>
              <span className={`font-medium ${complianceData.bodacc.hasProcedureCollective ? 'text-red-700' : 'text-emerald-700'}`}>
                {complianceData.bodacc.hasProcedureCollective ? 'Procédure collective active' : 'In bonis (aucune procédure collective en cours)'}
              </span>
            </div>
            {complianceData.bodacc.dernierAvisDate && (
              <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
                Dernier avis : {complianceData.bodacc.dernierAvisDate}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2">
          <CheckRow
            checked={data.isCompanyInDifficultyEU}
            onChange={(checked) => onChange({ isCompanyInDifficultyEU: checked })}
            title="Entreprise en difficulté au sens européen (règlement UE n° 651/2014, art. 2 point 18)"
            detail="Plus de la moitié du capital social a disparu (dont plus du quart au cours des 12 derniers mois), ou procédure de sauvegarde / redressement judiciaire."
          />

          {data.isCompanyInDifficultyEU && (
            <Notice tone="info" title="Orientation automatique">
              L’entreprise relève de la mesure <strong>« Ribumbà »</strong> (restructuration et rebond d’entreprises en difficulté) : ce besoin est sélectionné automatiquement à l’étape 3.
            </Notice>
          )}

          <CheckRow
            checked={data.isInInsolvencyOrBankruptcy}
            onChange={(checked) => onChange({ isInInsolvencyOrBankruptcy: checked })}
            title="Procédure collective incompatible avec le maintien de l’activité (liquidation judiciaire)"
            detail="Cessation définitive ou liquidation rendant impossible la poursuite de l’exploitation."
          />
        </div>
      </Panel>

      {/* Antécédents avec l'ADEC et aides publiques */}
      <Panel headingLevel={3} title="Antécédents d’aides publiques et relations avec l’ADEC">
        <div className="space-y-2">
          <CheckRow
            checked={data.hasPriorAdecUnfulfilledObligations}
            onChange={(checked) => onChange({ hasPriorAdecUnfulfilledObligations: checked })}
            title="Défaut de justification ou de pièces pour le contrôle de service fait (CSF) sur une aide ADEC antérieure"
          />
          <CheckRow
            checked={data.hasAdecPriorBreachOfContract}
            onChange={(checked) => onChange({ hasAdecPriorBreachOfContract: checked })}
            title="Non-respect des obligations d’une convention antérieure conclue avec l’ADEC (ex. : engagement de maintien d’emplois)"
          />
          <CheckRow
            checked={data.hasPendingPublicRecoveryOrder}
            onChange={(checked) => onChange({ hasPendingPublicRecoveryOrder: checked })}
            title="Procédure de recouvrement d’une aide publique devenue définitive et non régularisée"
          />
          <CheckRow
            checked={data.hasBenefitedRescueAidPast10Years}
            onChange={(checked) => onChange({ hasBenefitedRescueAidPast10Years: checked })}
            title="Aide d’État au sauvetage ou à la restructuration déjà perçue au cours des 10 dernières années (principe de non-récurrence SA.41259)"
          />
        </div>
      </Panel>

      {/* Plafond de minimis (Règlement UE 2023/2831) */}
      <Panel
        headingLevel={3}
        title="Règle de minimis (règlement UE 2023/2831)"
        description="Montant cumulé des aides de minimis reçues sur les trois derniers exercices fiscaux glissants (aides régionales, subventions locales…)."
        actions={<span className="text-xs text-neutral-500">Plafond : 300 000 € sur 3 ans</span>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label htmlFor="deminimis-percu" className={labelClass}>Montant de minimis déjà perçu (€)</label>
            <input
              id="deminimis-percu"
              type="number"
              min="0"
              max="300000"
              value={data.deMinimisPast3Years}
              onChange={(e) => onChange({ deMinimisPast3Years: Math.max(0, parseFloat(e.target.value) || 0) })}
              className={inputClass}
            />
          </div>

          <div className="px-3 py-2 border border-neutral-200 rounded-md text-xs">
            <span className="text-neutral-500 block">Capacité résiduelle disponible</span>
            <span className={`text-base font-semibold tabular-nums ${remainingDeMinimis > 0 ? 'text-neutral-900' : 'text-red-700'}`}>
              {remainingDeMinimis.toLocaleString('fr-FR')} €
            </span>
            <span className="text-[11px] text-neutral-500 block">sur 300 000 € par entreprise unique</span>
          </div>
        </div>
      </Panel>
    </div>
  );
};
