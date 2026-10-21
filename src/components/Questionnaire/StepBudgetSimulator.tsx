/**
 * Step 5 : Budget prévisionnel & Simulateur financier de dépenses
 * Collectivité de Corse / ADEC
 */

import React from 'react';
import { ProjectFinancials, CompanySize } from '../../types';
import { Badge, Panel, SectionHeading, inputClass, labelClass } from '../Layout/ui';

interface StepBudgetSimulatorProps {
  data: ProjectFinancials;
  companySize: CompanySize;
  onChange: (updated: Partial<ProjectFinancials>) => void;
  /** Section intégrée dans une étape plus large : masque le titre d’étape */
  embedded?: boolean;
}

export const StepBudgetSimulator: React.FC<StepBudgetSimulatorProps> = ({
  data,
  companySize,
  onChange,
  embedded = false
}) => {
  const breakdown = data.eligibleExpensesBreakdown || {};

  const updateBreakdown = (field: string, value: any) => {
    onChange({
      eligibleExpensesBreakdown: {
        ...breakdown,
        [field]: value
      }
    });
  };

  const hasSinistre = data.selectedNeedCategories.includes('SINISTRE_CATASTROPHE');
  const hasVehicleNeed = data.selectedNeedCategories.includes('INVESTISSEMENT_DEVELOPPEMENT') || data.selectedNeedCategories.includes('RURALITE_PROXIMITE');
  const hasReprise = data.selectedNeedCategories.includes('REPRISE_TRANSMISSION');

  return (
    <div className="space-y-4">
      {!embedded && (
        <SectionHeading
          title="5. Budget prévisionnel du projet"
          description="Montant prévisionnel hors taxes des investissements, pour le calcul de l’assiette éligible et des taux d’intervention."
        />
      )}

      {/* Budget global HT (intégré à l’étape Projet : le total vient du tableau des dépenses) */}
      {!embedded && (
        <Panel
          headingLevel={3}
          title="Montant total prévisionnel du projet"
          actions={
            <Badge tone="accent">
              Taux indicatif : {companySize === 'TPE' ? 'jusqu’à 70 % (TPE)' : companySize === 'PE' ? 'jusqu’à 60 % (PE)' : 'jusqu’à 50 % (PME)'}
            </Badge>
          }
        >
          <div className="relative max-w-sm">
            <input
              type="number"
              min="0"
              step="1000"
              aria-label="Montant total prévisionnel HT"
              value={data.totalEstimatedBudgetHT || ''}
              onChange={(e) => onChange({ totalEstimatedBudgetHT: Math.max(0, parseFloat(e.target.value) || 0) })}
              placeholder="0"
              className={`${inputClass} pr-12`}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">€ HT</span>
          </div>
          <p className="text-xs text-neutral-500">
            Les dépenses sont présentées hors taxes pour les assujettis à la TVA. Les dépenses engagées avant la date de dépôt sont inéligibles.
          </p>
        </Panel>
      )}

      {/* Prise en compte des assurances pour Sinistre (Rinascita) */}
      {hasSinistre && (
        <Panel
          headingLevel={3}
          title="Rinascita : déduction des indemnités d’assurance (non-surcompensation)"
          description="Point 11 du règlement Rinascita : dépenses éligibles retenues nettes de toute indemnisation d’assurance versée ou à verser, et de toute autre compensation publique ou privée."
        >
          <div className="max-w-sm">
            <label htmlFor="budget-assurance" className={labelClass}>
              Indemnités d’assurance perçues ou à percevoir (€)
            </label>
            <input
              id="budget-assurance"
              type="number"
              min="0"
              value={data.insuranceCompensationAmount || 0}
              onChange={(e) => onChange({ insuranceCompensationAmount: Math.max(0, parseFloat(e.target.value) || 0) })}
              className={inputClass}
            />
          </div>
        </Panel>
      )}

      {/* Option véhicule propre professionnel (Impresa Sì Dév) */}
      {hasVehicleNeed && (
        <Panel
          headingLevel={3}
          title="Mobilité durable : véhicule professionnel propre (Impresa Sì / Impresi paisani)"
          description="Subvention de 15 % du montant HT du véhicule (électrique, hybride essence ou GNV), hors options et hors bonus d’État. Un seul véhicule par entreprise sur 3 ans ; preuve de mise au rebut de l’ancien véhicule en cas de remplacement ; véhicules de tourisme exclus."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label htmlFor="vehicule-type" className={labelClass}>
                Catégorie de véhicule
              </label>
              <select
                id="vehicule-type"
                value={breakdown.cleanVehicles?.type || 'UTILITAIRE_LIGHT'}
                onChange={(e) =>
                  updateBreakdown('cleanVehicles', {
                    ...(breakdown.cleanVehicles || { costHT: 0, scrappageOldVehicleProof: true }),
                    type: e.target.value
                  })
                }
                className={inputClass}
              >
                <option value="UTILITAIRE_LIGHT">Utilitaire léger (&lt; 2,5 t) – plafond 3 000 €</option>
                <option value="FOURGON">Fourgon (2,5 t à 3,5 t) – plafond 7 000 €</option>
                <option value="POIDS_LOURD">Poids lourd (&gt; 3,5 t) – plafond 10 000 €</option>
              </select>
            </div>

            <div>
              <label htmlFor="vehicule-prix" className={labelClass}>
                Prix d’achat HT du véhicule (€)
              </label>
              <input
                id="vehicule-prix"
                type="number"
                min="0"
                value={breakdown.cleanVehicles?.costHT || 0}
                onChange={(e) =>
                  updateBreakdown('cleanVehicles', {
                    ...(breakdown.cleanVehicles || { type: 'UTILITAIRE_LIGHT', scrappageOldVehicleProof: true }),
                    costHT: Math.max(0, parseFloat(e.target.value) || 0)
                  })
                }
                className={inputClass}
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer pb-2">
              <input
                type="checkbox"
                checked={breakdown.cleanVehicles?.scrappageOldVehicleProof ?? true}
                onChange={(e) =>
                  updateBreakdown('cleanVehicles', {
                    ...(breakdown.cleanVehicles || { type: 'UTILITAIRE_LIGHT', costHT: 0 }),
                    scrappageOldVehicleProof: e.target.checked
                  })
                }
                className="w-4 h-4"
              />
              <span>Mise au rebut de l’ancien véhicule prévue</span>
            </label>
          </div>
        </Panel>
      )}

      {/* Conditions Reprise / Transmission */}
      {hasReprise && (
        <Panel headingLevel={3} title="Reprise-transmission (Impresa Sì) : conditions d’éligibilité">
          <ul className="text-xs text-neutral-700 space-y-1 list-disc pl-4">
            <li>Le repreneur doit détenir la <strong>majorité du capital</strong> à l’issue de l’opération.</li>
            <li>L’aide est conditionnée à l’intervention d’un partenaire bancaire ou outil financier.</li>
            <li>L’entreprise cible doit avoir au moins 12 mois d’existence officielle.</li>
            <li>Fourniture obligatoire d’une évaluation indépendante réalisée par un expert.</li>
            <li>Engagement ferme de maintien et de non-cession de l’activité pendant <strong>5 ans minimum</strong>.</li>
            <li>Droit au bail vendu seul et frais d’enregistrement inéligibles.</li>
          </ul>

          <label className="flex items-center gap-2 text-xs text-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasBankPartnerCommitted ?? false}
              onChange={(e) => onChange({ hasBankPartnerCommitted: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="font-medium">Partenaire bancaire ou outil financier déjà engagé sur le dossier</span>
          </label>
        </Panel>
      )}

      {/* Rappel d'encadrement des seuils */}
      <Panel headingLevel={3} title="Plafonds et seuils d’intervention de l’ADEC">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <div>
            <dt className="inline font-medium text-neutral-900">Seuil plancher d’aide : </dt>
            <dd className="inline text-neutral-700">5 000 € (une demande générant une aide inférieure est irrecevable).</dd>
          </div>
          <div>
            <dt className="inline font-medium text-neutral-900">Plafond de minimis : </dt>
            <dd className="inline text-neutral-700">300 000 € sur une période glissante de 3 ans par entreprise unique.</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
};
