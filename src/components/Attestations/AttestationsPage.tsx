/**
 * Page « Attestations » : recherche par SIRET, rappel succinct de l'entreprise
 * et accès aux 4 pièces exigées par l'ADEC (RNE, DGFiP, URSSAF, mandataires).
 */

import React, { useState } from 'react';
import { Search, RefreshCw, CheckCircle2, AlertTriangle, Key, Building2, ExternalLink, Check } from 'lucide-react';
import { CompanyProfile } from '../../types';
import { fetchEntrepriseBySiret, getStoredApiEntrepriseToken, isValidLuhn } from '../../services/apiEntreprise';
import { cleanSiret, isForbiddenSiretKey } from '../../utils/siret';
import { ApiEntrepriseModal } from '../ApiEntrepriseModal';
import { AttestationsList } from './AttestationsList';

interface AttestationsPageProps {
  company: CompanyProfile | null;
  onCompanyFound: (profile: Partial<CompanyProfile>) => void;
}

export const AttestationsPage: React.FC<AttestationsPageProps> = ({ company, onCompanyFound }) => {
  const [siretQuery, setSiretQuery] = useState(company?.siret || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(() => Boolean(getStoredApiEntrepriseToken().trim()));

  const handleSearch = async () => {
    const targetSiret = cleanSiret(siretQuery);
    if (targetSiret.length !== 14 || !/^\d+$/.test(targetSiret)) {
      setError('Veuillez saisir un numéro SIRET valide composé d’exactement 14 chiffres.');
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await fetchEntrepriseBySiret(targetSiret);
    setIsLoading(false);
    if (result.success && result.mappedProfile) {
      onCompanyFound(result.mappedProfile);
    } else {
      setError(result.error || 'Erreur lors de l’interrogation de l’API Entreprise.');
    }
  };

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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <ApiEntrepriseModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenUpdated={(hasTok) => setHasToken(hasTok)}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Attestations de l'entreprise</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immatriculation RNE, attestation fiscale, attestation de vigilance et extrait des mandataires, à partir du SIRET.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsTokenModalOpen(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
            hasToken
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
          title="Configuration du jeton API Entreprise v4 (requis pour les attestations DGFiP et URSSAF)"
        >
          <Key className="w-3.5 h-3.5 text-slate-600" />
          <span>Token API</span>
          <span className={`w-2 h-2 rounded-full ${hasToken ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        </button>
      </div>

      {/* Recherche SIRET */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
        <label htmlFor="siret-attestations" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-4 h-4 text-blue-600" />
          Numéro SIRET
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              id="siret-attestations"
              type="text"
              inputMode="numeric"
              value={siretQuery}
              onChange={(e) => setSiretQuery(cleanSiret(e.target.value))}
              onKeyDown={(e) => {
                if (isForbiddenSiretKey(e.key)) e.preventDefault();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                setSiretQuery(cleanSiret(e.clipboardData.getData('text')));
              }}
              placeholder="Ex: 40001662200013"
              className="w-full pl-3 pr-16 py-2.5 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-semibold"
            />
            <span className={`absolute right-2 top-2.5 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
              siretQuery.length === 14 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {siretQuery.length}/14
            </span>
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading || !siretQuery}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {isLoading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
        {error && (
          <div className="p-3 rounded-lg border bg-red-50 border-red-200 text-red-900 text-xs flex items-start gap-1.5 font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {company?.siret && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-5">
          {/* Rappel succinct de l'entreprise */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <h2 className="text-base font-bold text-slate-900">{company.name || 'Établissement'}</h2>
                  {company.administrativeStatus && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {company.administrativeStatus}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono flex-wrap">
                  <span>SIRET : <strong className="text-slate-800">{company.siret}</strong></span>
                  {isValidLuhn(company.siret) && (
                    <span title="Clé de Luhn valide" className="inline-flex items-center text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {siren && <span>· SIREN : <strong className="text-slate-800">{siren}</strong></span>}
                </div>
              </div>
              {siren && (
                <a
                  href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${siren}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 transition self-start"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Annuaire des Entreprises</span>
                </a>
              )}
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {recap.filter((r) => r.value).map((r) => (
                <div key={r.label} className="flex gap-2 min-w-0">
                  <dt className="text-slate-500 shrink-0 w-28">{r.label}</dt>
                  <dd className="text-slate-800 font-medium min-w-0 break-words">{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <AttestationsList data={company} hasToken={hasToken} />
        </div>
      )}

      {!company?.siret && !error && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          Les attestations DGFiP et URSSAF nécessitent un jeton API Entreprise ; l'immatriculation RNE reste consultable sans jeton.
        </p>
      )}
    </div>
  );
};
