/**
 * Recherche d'une entreprise par SIRET (registres officiels via API Entreprise),
 * partagée entre l'accueil et la page « Attestations ».
 */

import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { CompanyProfile } from '../../types';
import { fetchEntrepriseBySiret } from '../../services/apiEntreprise';
import { cleanSiret, isForbiddenSiretKey } from '../../utils/siret';
import { btn, inputClass, labelClass, Notice } from '../Layout/ui';

interface SiretSearchFormProps {
  id: string;
  onFound: (profile: Partial<CompanyProfile>) => void;
  initialValue?: string;
  autoFocus?: boolean;
}

export const SiretSearchForm: React.FC<SiretSearchFormProps> = ({ id, onFound, initialValue = '', autoFocus }) => {
  const [siretQuery, setSiretQuery] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetSiret = cleanSiret(siretQuery);
    if (targetSiret.length !== 14 || !/^\d+$/.test(targetSiret)) {
      setError('Le SIRET doit comporter exactement 14 chiffres.');
      return;
    }
    setIsLoading(true);
    setError(null);
    const result = await fetchEntrepriseBySiret(targetSiret);
    setIsLoading(false);
    if (result.success && result.mappedProfile) {
      onFound(result.mappedProfile);
    } else {
      setError(result.error || 'Erreur lors de l’interrogation de l’API Entreprise.');
    }
  };

  return (
    <form onSubmit={handleSearch} className="space-y-2">
      <label htmlFor={id} className={labelClass}>
        Numéro SIRET
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoFocus={autoFocus}
            value={siretQuery}
            onChange={(e) => setSiretQuery(cleanSiret(e.target.value))}
            onKeyDown={(e) => {
              if (isForbiddenSiretKey(e.key)) e.preventDefault();
            }}
            onPaste={(e) => {
              e.preventDefault();
              setSiretQuery(cleanSiret(e.clipboardData.getData('text')));
            }}
            placeholder="14 chiffres"
            className={`${inputClass} pr-14 font-mono tracking-wide`}
          />
          <span
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-mono ${
              siretQuery.length === 14 ? 'text-emerald-700' : 'text-neutral-400'
            }`}
          >
            {siretQuery.length}/14
          </span>
        </div>
        <button type="submit" disabled={isLoading || !siretQuery} className={btn('primary')}>
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          {isLoading ? 'Recherche…' : 'Rechercher'}
        </button>
      </div>
      {error && <Notice tone="danger">{error}</Notice>}
    </form>
  );
};
