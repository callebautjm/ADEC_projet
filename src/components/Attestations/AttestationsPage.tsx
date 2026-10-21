/**
 * Page « Attestations » : recherche par SIRET, rappel succinct de l'entreprise
 * et accès aux 4 pièces exigées par l'ADEC (RNE, DGFiP, URSSAF, mandataires).
 */

import React, { useState } from 'react';
import { ExternalLink, Check } from 'lucide-react';
import { CompanyProfile } from '../../types';
import { isValidLuhn } from '../../services/apiEntreprise';
import { useHasApiEntrepriseToken } from '../../hooks/useHasApiEntrepriseToken';
import { ApiEntrepriseModal } from '../ApiEntrepriseModal';
import { AttestationsList, VerifiedPiecesBadge } from './AttestationsList';
import { SiretSearchForm } from './SiretSearchForm';
import { PageHeader } from '../Layout/PageHeader';
import { Badge, Notice, Panel, btn, pageContainer } from '../Layout/ui';

interface AttestationsPageProps {
  company: CompanyProfile | null;
  onCompanyFound: (profile: Partial<CompanyProfile>) => void;
}

export const AttestationsPage: React.FC<AttestationsPageProps> = ({ company, onCompanyFound }) => {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const hasToken = useHasApiEntrepriseToken();

  const siren = company ? company.siren || (company.siret || '').slice(0, 9) : '';
  const address = company ? [company.address, [company.postalCode, company.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') : '';
  const recap: { label: string; value?: string }[] = company
    ? [
        { label: 'Forme juridique', value: company.natureJuridiqueLibelle || company.legalForm },
        { label: 'Activité (NAF)', value: company.nafCode ? `${company.nafCode}${company.nafLabel ? ` · ${company.nafLabel}` : ''}` : undefined },
        { label: 'Adresse', value: address || undefined },
        { label: 'Création', value: company.creationDate ? `${company.creationDate}${company.companyAgeLabel ? ` (${company.companyAgeLabel})` : ''}` : undefined },
        { label: 'Effectif', value: company.headcountTranche || (company.headcount ? `~${company.headcount} ETP` : undefined) }
      ]
    : [];

  return (
    <div>
      <ApiEntrepriseModal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)} />

      <PageHeader
        title="Attestations"
        description="Pièces justificatives d’une entreprise à partir de son SIRET : immatriculation RNE, attestation fiscale, attestation de vigilance et mandataires."
      />

      <div className={`${pageContainer} py-5 space-y-4`}>
        <Panel>
          <SiretSearchForm
            key={company?.siret || 'vide'}
            id="siret-attestations"
            initialValue={company?.siret || ''}
            onFound={onCompanyFound}
            autoFocus={!company?.siret}
          />
        </Panel>

        {!hasToken && (
          <Notice
            tone="warning"
            action={
              <button type="button" onClick={() => setIsTokenModalOpen(true)} className={btn('secondary', 'sm')}>
                Configurer le jeton
              </button>
            }
          >
            Aucun jeton API Entreprise : les attestations DGFiP et URSSAF ne peuvent pas être délivrées. L’immatriculation RNE reste consultable.
          </Notice>
        )}

        {company?.siret && (
          <>
            {/* Rappel succinct de l'entreprise */}
            <Panel
              title={
                <>
                  {company.name || 'Établissement'}
                  {company.administrativeStatus && <Badge tone="success">{company.administrativeStatus}</Badge>}
                </>
              }
              description={
                <span className="font-mono">
                  SIRET {company.siret}
                  {isValidLuhn(company.siret) && (
                    <span title="Clé de Luhn valide" className="inline-flex align-middle ml-1 text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {siren && <> · SIREN {siren}</>}
                </span>
              }
              actions={
                siren && (
                  <a
                    href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${siren}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btn('secondary', 'sm')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Annuaire des Entreprises
                  </a>
                )
              }
            >
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                {recap.filter((r) => r.value).map((r) => (
                  <div key={r.label} className="flex gap-2 min-w-0">
                    <dt className="text-neutral-500 shrink-0 w-28">{r.label}</dt>
                    <dd className="text-neutral-800 min-w-0 break-words">{r.value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <Panel
              title="Pièces justificatives"
              description="Exigées par l’ADEC pour l’instruction et le versement des aides."
              actions={<VerifiedPiecesBadge data={company} />}
              bodyClassName=""
            >
              <AttestationsList data={company} hasToken={hasToken} showHeading={false} />
            </Panel>
          </>
        )}
      </div>
    </div>
  );
};
