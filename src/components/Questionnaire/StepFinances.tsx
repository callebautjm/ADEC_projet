/**
 * Étape 2 — Santé financière & conformité :
 * dimensionnement PME, indicateurs financiers (fiche projet ou saisie) et situation réglementaire.
 */

import React from 'react';
import { CompanyProfile, RegulatoryStatus, SanteFinanciere } from '../../types';
import { determineCompanySize } from '../../services/engine';
import { StepRegulatory } from './StepRegulatory';
import { Users, Landmark, Scale } from 'lucide-react';

interface StepFinancesProps {
  company: CompanyProfile;
  sante: SanteFinanciere;
  regulatory: RegulatoryStatus;
  onCompanyChange: (updated: Partial<CompanyProfile>) => void;
  onSanteChange: (updated: Partial<SanteFinanciere>) => void;
  onRegulatoryChange: (updated: Partial<RegulatoryStatus>) => void;
}

const euroInput = (value: number | undefined, onChange: (v: number | undefined) => void, placeholder?: string) => (
  <div className="relative">
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
      placeholder={placeholder}
      className="w-full pl-3 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
    />
    <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">€</span>
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
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Landmark className="w-5 h-5 text-slate-700" />
          2. Santé financière & conformité
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Taille de l’entreprise au sens européen, indicateurs financiers et situation fiscale, sociale et réglementaire.
        </p>
      </div>

    {/* Dimensionnement économique & critères PME UE */}
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
          <Users className="w-4 h-4 text-slate-600" />
          Dimensionnement Économique & PME (Règlement UE n° 651/2014)
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-900 text-white">
          Catégorie : {calculatedSize}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Effectif Salarié (ETP)
          </label>
          <input
            type="number"
            min="0"
            value={data.headcount}
            onChange={(e) => onChange({ headcount: Math.max(0, parseInt(e.target.value) || 0) })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
          />
          <p className="text-[11px] text-slate-500 mt-1">TPE : &lt;10 · PE : &lt;50 · PME : &lt;250</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Chiffre d’Affaires Annuel HT (€)
          </label>
          <input
            type="number"
            min="0"
            value={data.annualRevenue}
            onChange={(e) => onChange({ annualRevenue: Math.max(0, parseFloat(e.target.value) || 0) })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
          />
          <p className="text-[11px] text-slate-500 mt-1">TPE : ≤2 M€ · PE : ≤10 M€ · PME : ≤50 M€</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Total du Bilan Annuel (€)
          </label>
          <input
            type="number"
            min="0"
            value={data.balanceSheetTotal}
            onChange={(e) => onChange({ balanceSheetTotal: Math.max(0, parseFloat(e.target.value) || 0) })}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
          />
          <p className="text-[11px] text-slate-500 mt-1">TPE : ≤2 M€ · PE : ≤10 M€ · PME : ≤43 M€</p>
        </div>
      </div>

      {/* Conditions opérationnelles */}
      <div className="pt-3 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
          Conditions Opérationnelles
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isSeasonalActivity}
              onChange={(e) => onChange({ isSeasonalActivity: e.target.checked })}
              className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
            />
            <span>Activité saisonnière (&lt; 8 mois/an)</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isFranchiseOrAffiliate}
              onChange={(e) => onChange({ isFranchiseOrAffiliate: e.target.checked })}
              className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
            />
            <span>Affiliée à un réseau ou franchise</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasDistributedProfits}
              onChange={(e) => onChange({ hasDistributedProfits: e.target.checked })}
              className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
            />
            <span>A déjà distribué des dividendes</span>
          </label>
        </div>
      </div>
    </div>

      {/* Indicateurs financiers */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Scale className="w-4 h-4 text-slate-600" />
            Indicateurs financiers du dernier exercice
          </h3>
          {ratioEndettement !== undefined && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded ${ratioEndettement > 2 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'}`}>
              Emprunts / fonds propres : {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(ratioEndettement)} ×
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Résultat net</label>
            {euroInput(sante.resultatNet, (v) => onSanteChange({ resultatNet: v }))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fonds propres</label>
            {euroInput(sante.fondsPropres, (v) => onSanteChange({ fondsPropres: v }))}
            {sante.fondsPropres !== undefined && sante.fondsPropres < 0 && (
              <p className="text-[11px] text-red-700 mt-1">Fonds propres négatifs : vérifier la notion d’entreprise en difficulté.</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emprunts en cours</label>
            {euroInput(sante.empruntsEnCours, (v) => onSanteChange({ empruntsEnCours: v }))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Capacité d’autofinancement (CAF)</label>
            {euroInput(sante.caf, (v) => onSanteChange({ caf: v }))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(sante.difficultesTresorerie)}
            onChange={(e) => onSanteChange({ difficultesTresorerie: e.target.checked })}
            className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
          />
          <span>L’entreprise rencontre des difficultés de trésorerie</span>
        </label>
      </div>

      <StepRegulatory
        data={regulatory}
        complianceData={company.complianceData}
        onChange={onRegulatoryChange}
        embedded
      />
    </div>
  );
};
