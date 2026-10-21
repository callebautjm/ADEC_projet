/**
 * Étape 3 — Projet & dépenses : description du projet, programme de dépenses,
 * aide sollicitée, typologie des besoins et ventilation de l'assiette éligible.
 */

import React from 'react';
import { CompanyProfile, CompanySize, DepenseProjet, FormeAide, ProjectFinancials, ProjetSaisi, RegulatoryStatus } from '../../types';
import { StepProjectNeed } from './StepProjectNeed';
import { StepBudgetSimulator } from './StepBudgetSimulator';
import { Plus, Trash2 } from 'lucide-react';
import { Panel, SectionHeading, btn, hintClass, iconBtnDanger, inputClass, inputSmClass, labelClass } from '../Layout/ui';

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
    <div className="space-y-4">
      <SectionHeading
        title="3. Projet & dépenses"
        description="Le projet, son programme de dépenses et l’aide sollicitée. Le total des dépenses sert de base au calcul des aides."
      />

      {/* Le projet */}
      <Panel headingLevel={3} title="Projet">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label htmlFor="projet-libelle" className={labelClass}>Intitulé du projet</label>
            <input
              id="projet-libelle"
              type="text"
              value={projet.libelle || ''}
              onChange={(e) => onProjetChange({ libelle: e.target.value })}
              placeholder="Ex : Modernisation de l’atelier"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="projet-description" className={labelClass}>Description</label>
            <textarea
              id="projet-description"
              value={financials.projectDescription}
              onChange={(e) => onFinancialsChange({ projectDescription: e.target.value })}
              rows={4}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="projet-debut" className={labelClass}>Début</label>
            <input id="projet-debut" type="text" value={projet.dateDebut || ''} onChange={(e) => onProjetChange({ dateDebut: e.target.value })} placeholder="jj/mm/aaaa" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label htmlFor="projet-fin" className={labelClass}>Fin</label>
            <input id="projet-fin" type="text" value={projet.dateFin || ''} onChange={(e) => onProjetChange({ dateFin: e.target.value })} placeholder="jj/mm/aaaa" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label htmlFor="projet-aap" className={labelClass}>Appel à projets visé</label>
            <input id="projet-aap" type="text" value={projet.appelAProjet || ''} onChange={(e) => onProjetChange({ appelAProjet: e.target.value || undefined })} placeholder="Aucun" className={inputClass} />
          </div>
          <div>
            <label htmlFor="projet-forme" className={labelClass}>Forme d’aide sollicitée</label>
            <select id="projet-forme" value={projet.formeAide || ''} onChange={(e) => onProjetChange({ formeAide: (e.target.value || undefined) as FormeAide | undefined })} className={inputClass}>
              <option value="">Non précisée</option>
              {FORMES_AIDE.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="projet-aide" className={labelClass}>Montant d’aide sollicité (€)</label>
            <input
              id="projet-aide"
              type="number"
              min="0"
              value={projet.aideSollicitee ?? ''}
              onChange={(e) => onProjetChange({ aideSollicitee: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              className={inputClass}
            />
            {tauxDemande !== undefined && (
              <p className={tauxDemande > 0.7 ? 'text-[11px] mt-1 text-amber-700 font-medium' : hintClass}>
                Soit {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(tauxDemande * 100)} % des dépenses
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="projet-emplois-crees" className={labelClass}>Emplois créés</label>
              <input id="projet-emplois-crees" type="number" min="0" value={projet.emploisCrees ?? ''} onChange={(e) => onProjetChange({ emploisCrees: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })} className={inputClass} />
            </div>
            <div>
              <label htmlFor="projet-emplois-maintenus" className={labelClass}>Maintenus</label>
              <input id="projet-emplois-maintenus" type="number" min="0" value={projet.emploisMaintenus ?? ''} onChange={(e) => onProjetChange({ emploisMaintenus: e.target.value === '' ? undefined : parseInt(e.target.value, 10) })} className={inputClass} />
            </div>
          </div>
        </div>
      </Panel>

      {/* Programme de dépenses */}
      <Panel
        headingLevel={3}
        title="Programme de dépenses (HT)"
        actions={<span className="text-sm font-semibold text-neutral-900 tabular-nums">Total : {euro(totalDepenses)}</span>}
      >
        {depenses.length > 0 ? (
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-medium text-neutral-500">
              <span className="col-span-3">Nature</span>
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-right">Montant HT (€)</span>
            </div>
            {depenses.map((d, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <select
                  aria-label={`Nature de la dépense ${idx + 1}`}
                  value={d.nature}
                  onChange={(e) => updateDepense(idx, { nature: e.target.value })}
                  className={`${inputSmClass} col-span-12 sm:col-span-3`}
                >
                  {(NATURES.includes(d.nature) ? NATURES : [d.nature, ...NATURES]).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <input
                  type="text"
                  aria-label={`Description de la dépense ${idx + 1}`}
                  value={d.description}
                  onChange={(e) => updateDepense(idx, { description: e.target.value })}
                  placeholder="Description"
                  className={`${inputSmClass} col-span-8 sm:col-span-6`}
                />
                <input
                  type="number"
                  min="0"
                  aria-label={`Montant HT de la dépense ${idx + 1}`}
                  value={d.montantHT}
                  onChange={(e) => updateDepense(idx, { montantHT: parseFloat(e.target.value) || 0 })}
                  className={`${inputSmClass} col-span-3 sm:col-span-2 text-right`}
                />
                <button
                  type="button"
                  onClick={() => setDepenses(depenses.filter((_, i) => i !== idx))}
                  title="Supprimer la ligne"
                  aria-label={`Supprimer la dépense ${idx + 1}`}
                  className={`${iconBtnDanger} col-span-1 justify-self-center`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500">Aucune dépense saisie.</p>
        )}

        <button
          type="button"
          onClick={() => setDepenses([...depenses, { nature: 'Investissement matériel', description: '', montantHT: 0 }])}
          className={btn('secondary', 'sm')}
        >
          <Plus className="w-3 h-3" />
          Ajouter une dépense
        </button>
      </Panel>

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
