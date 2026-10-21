/**
 * Étape 2 — Santé financière & conformité :
 * dimensionnement PME, indicateurs financiers (fiche projet ou saisie) et situation réglementaire.
 */

import React from 'react';
import { CompanyProfile, RegulatoryStatus, SanteFinanciere } from '../../types';
import { determineCompanySize } from '../../services/engine';
import { StepRegulatory } from './StepRegulatory';
import { Badge, Panel, SectionHeading, hintClass, inputClass, labelClass } from '../Layout/ui';

interface StepFinancesProps {
  company: CompanyProfile;
  sante: SanteFinanciere;
  regulatory: RegulatoryStatus;
  onCompanyChange: (updated: Partial<CompanyProfile>) => void;
  onSanteChange: (updated: Partial<SanteFinanciere>) => void;
  onRegulatoryChange: (updated: Partial<RegulatoryStatus>) => void;
}

const euroInput = (id: string, value: number | undefined, onChange: (v: number | undefined) => void, placeholder?: string) => (
  <div className="relative">
    <input
      id={id}
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
      placeholder={placeholder}
      className={`${inputClass} pr-7`}
    />
    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">€</span>
  </div>
);

export const StepFinances: React.FC<StepFinancesProps> = ({
  company,
  sante,
  regulatory,
  onCompanyChange,
  onSanteChange,
  onRegulatoryChange
}) => {
  const data = company;
  const onChange = onCompanyChange;
  const calculatedSize = determineCompanySize(data.headcount, data.annualRevenue, data.balanceSheetTotal);
  const ratioEndettement = sante.empruntsEnCours !== undefined && sante.fondsPropres ? sante.empruntsEnCours / sante.fondsPropres : undefined;

  return (
    <div className="space-y-4">
      <SectionHeading
        title="2. Santé financière & conformité"
        description="Taille de l’entreprise au sens européen, indicateurs financiers et situation fiscale, sociale et réglementaire."
      />

      {/* Dimensionnement économique & critères PME UE */}
      <Panel
        headingLevel={3}
        title="Taille de l’entreprise (règlement UE n° 651/2014)"
        actions={<Badge tone="accent">Catégorie : {calculatedSize}</Badge>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="fin-headcount" className={labelClass}>Effectif salarié (ETP)</label>
            <input
              id="fin-headcount"
              type="number"
              min="0"
              value={data.headcount}
              onChange={(e) => onChange({ headcount: Math.max(0, parseInt(e.target.value) || 0) })}
              className={inputClass}
            />
            <p className={hintClass}>TPE : &lt; 10 · PE : &lt; 50 · PME : &lt; 250</p>
          </div>

          <div>
            <label htmlFor="fin-revenue" className={labelClass}>Chiffre d’affaires annuel HT (€)</label>
            <input
              id="fin-revenue"
              type="number"
              min="0"
              value={data.annualRevenue}
              onChange={(e) => onChange({ annualRevenue: Math.max(0, parseFloat(e.target.value) || 0) })}
              className={inputClass}
            />
            <p className={hintClass}>TPE : ≤ 2 M€ · PE : ≤ 10 M€ · PME : ≤ 50 M€</p>
          </div>

          <div>
            <label htmlFor="fin-balance" className={labelClass}>Total du bilan annuel (€)</label>
            <input
              id="fin-balance"
              type="number"
              min="0"
              value={data.balanceSheetTotal}
              onChange={(e) => onChange({ balanceSheetTotal: Math.max(0, parseFloat(e.target.value) || 0) })}
              className={inputClass}
            />
            <p className={hintClass}>TPE : ≤ 2 M€ · PE : ≤ 10 M€ · PME : ≤ 43 M€</p>
          </div>
        </div>

        {/* Conditions opérationnelles */}
        <fieldset className="pt-3 border-t border-neutral-100">
          <legend className="text-xs font-medium text-neutral-700 mb-2">Conditions opérationnelles</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-neutral-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.isSeasonalActivity}
                onChange={(e) => onChange({ isSeasonalActivity: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Activité saisonnière (&lt; 8 mois/an)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.isFranchiseOrAffiliate}
                onChange={(e) => onChange({ isFranchiseOrAffiliate: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Affiliée à un réseau ou franchise</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasDistributedProfits}
                onChange={(e) => onChange({ hasDistributedProfits: e.target.checked })}
                className="w-4 h-4"
              />
              <span>A déjà distribué des dividendes</span>
            </label>
          </div>
        </fieldset>
      </Panel>

      {/* Indicateurs financiers */}
      <Panel
        headingLevel={3}
        title="Indicateurs financiers du dernier exercice"
        actions={
          ratioEndettement !== undefined && (
            <Badge tone={ratioEndettement > 2 ? 'warning' : 'neutral'}>
              Emprunts / fonds propres : {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(ratioEndettement)} ×
            </Badge>
          )
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="fin-resultat" className={labelClass}>Résultat net</label>
            {euroInput('fin-resultat', sante.resultatNet, (v) => onSanteChange({ resultatNet: v }))}
          </div>
          <div>
            <label htmlFor="fin-fonds-propres" className={labelClass}>Fonds propres</label>
            {euroInput('fin-fonds-propres', sante.fondsPropres, (v) => onSanteChange({ fondsPropres: v }))}
            {sante.fondsPropres !== undefined && sante.fondsPropres < 0 && (
              <p className="text-[11px] text-red-700 mt-1">Fonds propres négatifs : vérifier la notion d’entreprise en difficulté.</p>
            )}
          </div>
          <div>
            <label htmlFor="fin-emprunts" className={labelClass}>Emprunts en cours</label>
            {euroInput('fin-emprunts', sante.empruntsEnCours, (v) => onSanteChange({ empruntsEnCours: v }))}
          </div>
          <div>
            <label htmlFor="fin-caf" className={labelClass}>Capacité d’autofinancement (CAF)</label>
            {euroInput('fin-caf', sante.caf, (v) => onSanteChange({ caf: v }))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(sante.difficultesTresorerie)}
            onChange={(e) => onSanteChange({ difficultesTresorerie: e.target.checked })}
            className="w-4 h-4"
          />
          <span>L’entreprise rencontre des difficultés de trésorerie</span>
        </label>
      </Panel>

      <StepRegulatory
        data={regulatory}
        complianceData={company.complianceData}
        onChange={onRegulatoryChange}
        embedded
      />
    </div>
  );
};
