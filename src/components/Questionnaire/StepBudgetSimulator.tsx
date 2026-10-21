/**
 * Step 5 : Budget prévisionnel & Simulateur financier de dépenses
 * Collectivité de Corse / ADEC
 */

import React from 'react';
import { ProjectFinancials, CompanySize } from '../../types';
import { Calculator, AlertTriangle, ShieldCheck, Car, Euro } from 'lucide-react';

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
    <div className="space-y-6">
      {!embedded && (
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-neutral-700" />
            5. Budget Prévisionnel du Projet & Simulateur de Dépenses
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Renseignez le montant prévisionnel hors taxes des investissements envisagés pour calculer l’assiette éligible et les taux d’intervention.
          </p>
        </div>
      )}

      {/* Budget Global HT (intégré à l’étape Projet : le total vient du tableau des dépenses) */}
      {!embedded && (
        <div className="bg-prune-900 text-white rounded-xl p-5 shadow-sm space-y-4 border border-prune-950">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold tracking-wider text-prune-200 uppercase">
              Montant total prévisionnel du projet d’investissement
            </label>
            <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
              Taux indicatif : {companySize === 'TPE' ? 'jusqu’à 70 % (TPE)' : companySize === 'PE' ? 'jusqu’à 60 % (PE)' : 'jusqu’à 50 % (PME)'}
            </span>
          </div>
  
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1000"
              value={data.totalEstimatedBudgetHT || ''}
              onChange={(e) => onChange({ totalEstimatedBudgetHT: Math.max(0, parseFloat(e.target.value) || 0) })}
              placeholder="0"
              className="w-full bg-neutral-800/90 border border-prune-800/70 text-white text-2xl font-bold font-mono px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-prune-400 transition"
            />
            <span className="absolute right-4 top-3.5 text-lg font-mono text-prune-300 font-bold">
              € HT
            </span>
          </div>
  
          <div className="text-xs text-prune-200/80 flex items-center gap-2">
            <Euro className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Règle générale ADEC : Les dépenses doivent être présentées hors taxes (HT) pour les assujettis à la TVA. Les dépenses engagées avant la date de dépôt sont formellement inéligibles.
            </span>
          </div>
        </div>
      )}

      {/* Prise en compte des assurances pour Sinistre (Rinascita) */}
      {hasSinistre && (
        <div className="p-4 bg-petrole-50 border border-petrole-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-petrole-950 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-petrole-700 shrink-0" />
            Mesure Rinascita : Déduction stricte des indemnités d’assurance (Non-surcompensation)
          </div>
          <p className="text-xs text-petrole-900 leading-relaxed">
            Conformément au point 11 du règlement Rinascita, les dépenses éligibles sont retenues <strong>nettes de toute indemnisation d’assurance versée ou à verser</strong>, ainsi que de toute autre compensation publique ou privée.
          </p>

          <div className="max-w-md">
            <label className="block text-xs font-semibold text-petrole-950 mb-1">
              Montant des indemnités d’assurance perçues ou à percevoir (€)
            </label>
            <input
              type="number"
              min="0"
              value={data.insuranceCompensationAmount || 0}
              onChange={(e) => onChange({ insuranceCompensationAmount: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-full px-3 py-2 text-sm bg-white border border-petrole-300 rounded-lg font-mono focus:ring-1 focus:ring-petrole-900"
            />
          </div>
        </div>
      )}

      {/* Option Véhicule propre professionnel (Impresa Sì Dév) */}
      {hasVehicleNeed && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
            <Car className="w-5 h-5 text-emerald-700 shrink-0" />
            Volet Mobilité Durable : Véhicule professionnel propre (Impresa Sì / Impresi paisani)
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Subvention spécifique de <strong>15 % du montant HT</strong> du véhicule (électrique, hybride essence ou GNV), hors options et hors bonus d’État. Un seul véhicule par entreprise sur 3 ans. Preuve de mise au rebut de l’ancien véhicule obligatoire en cas de remplacement. Véhicules de tourisme strictement exclus.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1">
                Catégorie de véhicule
              </label>
              <select
                value={breakdown.cleanVehicles?.type || 'UTILITAIRE_LIGHT'}
                onChange={(e) =>
                  updateBreakdown('cleanVehicles', {
                    ...(breakdown.cleanVehicles || { costHT: 0, scrappageOldVehicleProof: true }),
                    type: e.target.value
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-md"
              >
                <option value="UTILITAIRE_LIGHT">Utilitaire léger (&lt; 2,5 t) – Plafond 3 000 €</option>
                <option value="FOURGON">Fourgon (2,5 t à 3,5 t) – Plafond 7 000 €</option>
                <option value="POIDS_LOURD">Poids lourd (&gt; 3,5 t) – Plafond 10 000 €</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1">
                Prix d'achat HT du véhicule (€)
              </label>
              <input
                type="number"
                min="0"
                value={breakdown.cleanVehicles?.costHT || 0}
                onChange={(e) =>
                  updateBreakdown('cleanVehicles', {
                    ...(breakdown.cleanVehicles || { type: 'UTILITAIRE_LIGHT', scrappageOldVehicleProof: true }),
                    costHT: Math.max(0, parseFloat(e.target.value) || 0)
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-md font-mono"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs text-emerald-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={breakdown.cleanVehicles?.scrappageOldVehicleProof ?? true}
                  onChange={(e) =>
                    updateBreakdown('cleanVehicles', {
                      ...(breakdown.cleanVehicles || { type: 'UTILITAIRE_LIGHT', costHT: 0 }),
                      scrappageOldVehicleProof: e.target.checked
                    })
                  }
                  className="w-4 h-4 text-emerald-900 rounded"
                />
                <span>Mise au rebut de l’ancien véhicule prévue</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Conditions Reprise / Transmission */}
      {hasReprise && (
        <div className="p-4 bg-aubergine-50 border border-aubergine-200 rounded-xl space-y-3">
          <div className="text-aubergine-950 font-bold text-sm">
            Conditions d'éligibilité strictes à la Reprise-Transmission (Impresa Sì)
          </div>
          <ul className="text-xs text-aubergine-900 space-y-1.5 list-disc pl-4">
            <li>Le repreneur doit détenir la <strong>majorité du capital</strong> à l'issue de l'opération.</li>
            <li>L’aide est conditionnée à l’intervention d’un partenaire bancaire ou outil financier.</li>
            <li>L’entreprise cible doit avoir au moins 12 mois d’existence officielle.</li>
            <li>Fourniture obligatoire d’une évaluation indépendante réalisée par un expert.</li>
            <li>Engagement ferme de maintien et de non-cession de l'activité pendant <strong>5 ans minimum</strong>.</li>
            <li>Droit au bail vendu seul et frais d’enregistrement inéligibles.</li>
          </ul>

          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-aubergine-950 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasBankPartnerCommitted ?? false}
                onChange={(e) => onChange({ hasBankPartnerCommitted: e.target.checked })}
                className="w-4 h-4 text-aubergine-900 rounded"
              />
              <span className="font-semibold">Partenaire bancaire ou outil financier déjà engagé sur le dossier</span>
            </label>
          </div>
        </div>
      )}

      {/* Rappel d'encadrement des seuils */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-600 space-y-2">
        <span className="font-semibold text-neutral-800 uppercase tracking-wider block">
          Plafonds & Seuils d'intervention de l'ADEC
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-700">
          <div>
            • <strong>Seuil plancher d’aide :</strong> 5 000 € (les dossiers générant une aide inférieure sont irrecevables).
          </div>
          <div>
            • <strong>Plafond d'aide de minimis :</strong> 300 000 € sur une période glissante de 3 ans par entreprise unique.
          </div>
        </div>
      </div>
    </div>
  );
};
