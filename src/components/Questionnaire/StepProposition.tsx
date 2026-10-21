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
import { Notice, Panel, StatGrid } from '../Layout/ui';

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
    <ResultsView report={report} company={state.company} onModifyQuestionnaire={onModifyQuestionnaire}>
      {dossier && (
        <Panel headingLevel={3} title="Demande de la fiche projet face à la proposition">
          <StatGrid
            columnsClassName="grid-cols-1 sm:grid-cols-3"
            items={[
              {
                label: 'Aide sollicitée',
                value: euro(projet?.aideSollicitee),
                hint: projet?.formeAide ? FORME_LIBELLE[projet.formeAide] : 'Forme non précisée'
              },
              {
                label: 'Mesure principale proposée',
                value: <span className="text-sm">{principal ? principal.scheme.name : 'Aucune mesure éligible'}</span>,
                hint: principal ? `Estimation : ${euro(principal.estimatedSubsidyAmount)}` : undefined
              },
              {
                label: 'Appel à projets',
                value: <span className="text-sm">{aap || 'Aucun'}</span>,
                hint: aap ? (
                  <span className={aapReconnu ? 'text-emerald-700' : 'text-amber-700'}>
                    {aapReconnu ? `Rattaché à ${state.dossierSource?.primarySchemeName}` : 'Non référencé dans la base du simulateur'}
                  </span>
                ) : undefined
              }
            ]}
          />

          {aap && !aapReconnu && (
            <Notice tone="warning">
              L’entreprise répond à l’appel à projets « {aap} », que le simulateur ne connaît pas : ses règles propres (taux, plafonds, critères) priment
              sur les mesures ci-dessous, données à titre indicatif.
            </Notice>
          )}
          {projet?.formeAide && projet.formeAide !== 'SUBVENTION' && (
            <Notice tone="info">
              La fiche sollicite un(e) {FORME_LIBELLE[projet.formeAide].toLowerCase()}. Le simulateur estime des subventions ADEC :
              un financement remboursable relève aussi des partenaires (CADEC, fonds de prêts d’honneur).
            </Notice>
          )}
          {principal && projet?.aideSollicitee !== undefined && principal.estimatedSubsidyAmount < projet.aideSollicitee && (
            <p className="text-xs text-neutral-700">
              L’estimation de la mesure principale est inférieure de {euro(projet.aideSollicitee - principal.estimatedSubsidyAmount)} à l’aide sollicitée.
            </p>
          )}
        </Panel>
      )}
    </ResultsView>
  );
};
