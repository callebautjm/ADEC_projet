/**
 * Étape 5 — Proposition de mesures : éligibilité calculée par le moteur ADEC,
 * confrontée à la demande de la fiche projet lorsqu'il y en a une.
 */

import React, { useMemo } from 'react';
import { FullQuestionnaireState } from '../../types';
import { AnalyseFicheProjetResponse } from '../../types/ficheProjet';
import { evaluateCompanyEligibility } from '../../services/engine';
import { useDatabases } from '../../context/DatabaseContext';
import { ResultsView } from '../Results/ResultsView';
import { Scale, Info, AlertTriangle } from 'lucide-react';

interface StepPropositionProps {
  state: FullQuestionnaireState;
  dossier: AnalyseFicheProjetResponse | null;
  onModifyQuestionnaire: () => void;
}

const euro = (n?: number) =>
  n === undefined ? '—' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

const FORME_LIBELLE: Record<string, string> = {
  SUBVENTION: 'Subvention',
  AVANCE_REMBOURSABLE: 'Avance remboursable',
  PRET: 'Prêt',
  AUTRE: 'Autre'
};

export const StepProposition: React.FC<StepPropositionProps> = ({ state, dossier, onModifyQuestionnaire }) => {
  const { allActiveSchemes } = useDatabases();
  const report = useMemo(() => evaluateCompanyEligibility(state, allActiveSchemes), [state, allActiveSchemes]);

  const projet = state.projet;
  const principal = report.eligibleSchemes[0] || report.conditionalSchemes[0];
  const aap = state.dossierSource?.aapTitre;
  const aapReconnu = Boolean(state.dossierSource?.primarySchemeId);

  return (
    <div className="space-y-6">
      {dossier && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Scale className="w-4 h-4 text-neutral-600" />
            Demande de la fiche projet face à la proposition
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Aide sollicitée</span>
              <span className="text-base font-extrabold text-neutral-900 block">{euro(projet?.aideSollicitee)}</span>
              <span className="text-neutral-500">{projet?.formeAide ? FORME_LIBELLE[projet.formeAide] : 'Forme non précisée'}</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Mesure principale proposée</span>
              <span className="text-sm font-bold text-neutral-900 block">{principal ? principal.scheme.name : 'Aucune mesure éligible'}</span>
              {principal && <span className="text-neutral-500">Estimation : {euro(principal.estimatedSubsidyAmount)}</span>}
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Appel à projets</span>
              <span className="text-sm font-bold text-neutral-900 block">{aap || 'Aucun'}</span>
              {aap && (
                <span className={aapReconnu ? 'text-emerald-700' : 'text-amber-700'}>
                  {aapReconnu ? `Rattaché à ${state.dossierSource?.primarySchemeName}` : 'Non référencé dans la base du simulateur'}
                </span>
              )}
            </div>
          </div>

          {aap && !aapReconnu && (
            <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                L’entreprise répond à l’appel à projets « {aap} », que le simulateur ne connaît pas : ses règles propres (taux, plafonds, critères) priment
                sur les mesures ci-dessous, données à titre indicatif.
              </span>
            </p>
          )}
          {projet?.formeAide && projet.formeAide !== 'SUBVENTION' && (
            <p className="text-xs text-petrole-900 bg-petrole-50 border border-petrole-200 rounded-lg p-2.5 flex items-start gap-2">
              <Info className="w-4 h-4 text-petrole-600 shrink-0" />
              <span>
                La fiche sollicite un(e) {FORME_LIBELLE[projet.formeAide].toLowerCase()}. Le simulateur estime des subventions ADEC :
                un financement remboursable relève aussi des partenaires (CADEC, fonds de prêts d’honneur).
              </span>
            </p>
          )}
          {principal && projet?.aideSollicitee !== undefined && principal.estimatedSubsidyAmount < projet.aideSollicitee && (
            <p className="text-xs text-neutral-700">
              L’estimation de la mesure principale est inférieure de {euro(projet.aideSollicitee - principal.estimatedSubsidyAmount)} à l’aide sollicitée.
            </p>
          )}
        </div>
      )}

      <ResultsView report={report} company={state.company} onModifyQuestionnaire={onModifyQuestionnaire} />
    </div>
  );
};
