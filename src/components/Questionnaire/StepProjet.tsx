/**
 * Étape 3 — Projet & dépenses : description du projet, programme de dépenses,
 * aide sollicitée, typologie des besoins et ventilation de l'assiette éligible.
 */

import React from 'react';
import { CompanyProfile, CompanySize, DepenseProjet, FormeAide, ProjectFinancials, ProjetSaisi, RegulatoryStatus } from '../../types';
import { StepProjectNeed } from './StepProjectNeed';
import { StepBudgetSimulator } from './StepBudgetSimulator';
import { Target, Plus, Trash2, ListChecks } from 'lucide-react';

interface StepProjetProps {
  projet: ProjetSaisi;
  financials: ProjectFinancials;
  regulatory: RegulatoryStatus;
  company: CompanyProfile;
  companySize: CompanySize;
  onProjetChange: (updated: Partial<ProjetSaisi>) => void;
  onFinancialsChange: (updated: Partial<ProjectFinancials>) => void;
}

const FORMES_AIDE: Array<{ id: FormeAide; label: string }> = [
  { id: 'SUBVENTION', label: 'Subvention' },
  { id: 'AVANCE_REMBOURSABLE', label: 'Avance remboursable' },
  { id: 'PRET', label: 'Prêt' },
  { id: 'AUTRE', label: 'Autre' }
];

const NATURES = ['Investissement matériel', 'Investissement immatériel', 'Investissement immobilier', 'Prestation externe', 'Frais de fonctionnement', 'Autre'];

const euro = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const inputClass = 'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900';

export const StepProjet: React.FC<StepProjetProps> = ({
  projet,
  financials,
  regulatory,
  company,
  companySize,
  onProjetChange,
  onFinancialsChange
}) => {
  const depenses = projet.depenses || [];
  const totalDepenses = depenses.reduce((s, d) => s + (d.montantHT || 0), 0);
  const tauxDemande = projet.aideSollicitee && totalDepenses > 0 ? projet.aideSollicitee / totalDepenses : undefined;

  /** Toute modification des dépenses met à jour le budget total utilisé par le moteur */
  const setDepenses = (next: DepenseProjet[]) => {
    onProjetChange({ depenses: next });
    onFinancialsChange({ totalEstimatedBudgetHT: next.reduce((s, d) => s + (d.montantHT || 0), 0) });
  };
  const updateDepense = (idx: number, patch: Partial<DepenseProjet>) =>
    setDepenses(depenses.map((d, i) => (i === idx ? { ...d, ...patch } : d)));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Target className="w-5 h-5 text-slate-700" />
          3. Projet & dépenses
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Le projet, son programme de dépenses et l’aide sollicitée. Le total des dépenses sert de base au calcul des aides.
        </p>
      </div>

      {/* Le projet */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Intitulé du projet</label>
            <input
              type="text"
              value={projet.libelle || ''}
              onChange={(e) => onProjetChange({ libelle: e.target.value })}
              placeholder="Ex : Modernisation de l’atelier"
              className={`${inputClass} font-semibold`}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={financials.projectDescription}
              onChange={(e) => onFinancialsChange({ projectDescription: e.target.value })}
              rows={4}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Début</label>
            <input type="text" value={projet.dateDebut || ''} onChange={(e) => onProjetChange({ dateDebut: e.target.value })} placeholder="jj/mm/aaaa" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fin</label>
            <input type="text" value={projet.dateFin || ''} onChange={(e) => onProjetChange({ dateFin: e.target.value })} placeholder="jj/mm/aaaa" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Appel à projets visé</label>
            <input type="text" value={projet.appelAProjet || ''} onChange={(e) => onProjetChange({ appelAProjet: e.target.value || undefined })} placeholder="Aucun" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Forme d’aide sollicitée</label>
            <select value={projet.formeAide || ''} onChange={(e) => onProjetChange({ formeAide: (e.target.value || undefined) as FormeAide | undefined })} className={inputClass}>
              <option value="">Non précisée</option>
              {FORMES_AIDE.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Montant d’aide sollicité</label>
            <input
              type="number"
              min="0"
              value={projet.aideSollicitee ?? ''}
              onChange={(e) => onProjetChange({ aideSollicitee: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              className={`${inputClass} font-mono`}
            />
            {tauxDemande !== undefined && (
              <p className={`text-[11px] mt-1 ${tauxDemande > 0.7 ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
                Soit {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(tauxDemande * 100)} % des dépenses
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emplois créés</label>
              <input type="number" min="0" value={projet.emploisCrees ?? ''} onChange={(e) => onProjetChange({ emploisCrees: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })} className={`${inputClass} font-mono`} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenus</label>
              <input type="number" min="0" value={projet.emploisMaintenus ?? ''} onChange={(e) => onProjetChange({ emploisMaintenus: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })} className={`${inputClass} font-mono`} />
            </div>
          </div>
        </div>
      </div>

      {/* Programme de dépenses */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <ListChecks className="w-4 h-4 text-slate-600" />
            Programme de dépenses (HT)
          </h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-900 text-white">Total : {euro(totalDepenses)}</span>
        </div>

        {depenses.length > 0 ? (
          <div className="space-y-2">
            {depenses.map((d, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <select value={d.nature} onChange={(e) => updateDepense(idx, { nature: e.target.value })} className={`${inputClass} col-span-12 sm:col-span-3 text-xs`}>
                  {(NATURES.includes(d.nature) ? NATURES : [d.nature, ...NATURES]).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <input type="text" value={d.description} onChange={(e) => updateDepense(idx, { description: e.target.value })} placeholder="Description" className={`${inputClass} col-span-8 sm:col-span-6 text-xs`} />
                <input
                  type="number"
                  min="0"
                  value={d.montantHT}
                  onChange={(e) => updateDepense(idx, { montantHT: parseFloat(e.target.value) || 0 })}
                  className={`${inputClass} col-span-3 sm:col-span-2 text-xs font-mono text-right`}
                />
                <button
                  type="button"
                  onClick={() => setDepenses(depenses.filter((_, i) => i !== idx))}
                  title="Supprimer la ligne"
                  className="col-span-1 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer justify-self-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Aucune dépense saisie.</p>
        )}

        <button
          type="button"
          onClick={() => setDepenses([...depenses, { nature: 'Investissement matériel', description: '', montantHT: 0 }])}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-[11px] font-semibold transition cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Ajouter une dépense</span>
        </button>
      </div>

      <StepProjectNeed
        data={financials}
        regulatory={regulatory}
        company={company}
        onChange={onFinancialsChange}
        embedded
      />

      <StepBudgetSimulator
        data={financials}
        companySize={companySize}
        onChange={onFinancialsChange}
        embedded
      />
    </div>
  );
};
