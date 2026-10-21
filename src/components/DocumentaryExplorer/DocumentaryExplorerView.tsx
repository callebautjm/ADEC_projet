/**
 * Guide des aides : catalogue des dispositifs (Guide 2026 & Annexe 1)
 * et méthodologie de l'évaluation qualitative (délibération 21/177 AC).
 */

import React, { useState } from 'react';
import { useDatabases } from '../../context/DatabaseContext';
import { DispositifScheme } from '../../types';
import { QUALITATIVE_EVALUATION_QUESTIONS } from '../../data/adecOfficialData';
import { DispositifDetailModal } from '../Results/DispositifDetailModal';
import { ExportGuideAidesModal } from './ExportGuideAidesModal';
import { PageHeader } from '../Layout/PageHeader';
import { TabButton } from '../Layout/TabButton';
import { Badge, Notice, Panel, SegmentedControl, btn, inputClass, pageContainer } from '../Layout/ui';
import { Search, ChevronRight, Printer } from 'lucide-react';

type CategoryFilter = 'ALL' | 'ANNEXE1' | 'GUIDE2026';

const ANNEXE1_CATEGORY = 'Pattu Risilienzia è Territorii';
const GUIDE2026_CATEGORY = 'Guide des Aides - Évaluation Qualitative';

/** Libellé court de la base d'origine d'un dispositif */
export function shortCategoryLabel(category: string): string {
  if (category === ANNEXE1_CATEGORY) return 'Annexe 1';
  if (category === GUIDE2026_CATEGORY) return 'Guide 2026';
  return category;
}

const matchesCategory = (scheme: DispositifScheme, filter: CategoryFilter) =>
  filter === 'ALL' ||
  (filter === 'ANNEXE1' && scheme.category === ANNEXE1_CATEGORY) ||
  (filter === 'GUIDE2026' && scheme.category === GUIDE2026_CATEGORY);

export const DocumentaryExplorerView: React.FC = () => {
  const { allActiveSchemes } = useDatabases();
  const [selectedScheme, setSelectedScheme] = useState<DispositifScheme | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [activeTab, setActiveTab] = useState<'dispositifs' | 'evaluation_methodologie'>('dispositifs');

  const query = searchQuery.toLowerCase();
  const filteredSchemes = allActiveSchemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(query) ||
      scheme.code.toLowerCase().includes(query) ||
      scheme.objective.toLowerCase().includes(query) ||
      scheme.eligibleExpenseCategories.some((e) => e.toLowerCase().includes(query));
    return matchesSearch && matchesCategory(scheme, categoryFilter);
  });

  const countFor = (filter: CategoryFilter) => allActiveSchemes.filter((s) => matchesCategory(s, filter)).length;

  return (
    <div>
      <PageHeader
        title="Guide des aides"
        description="Dispositifs du Guide des aides 2026 et de l’Annexe 1 (U Pattu Risilienza è Territorii) : objectifs, bénéficiaires, exclusions, dépenses éligibles, taux et plafonds."
        actions={
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className={btn('secondary')}
            title="Exporter les fiches des dispositifs (une page par dispositif) pour impression ou PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            Exporter les fiches
          </button>
        }
        tabs={
          <>
            <TabButton active={activeTab === 'dispositifs'} onClick={() => setActiveTab('dispositifs')}>
              Dispositifs
              <span className="text-xs text-neutral-400 font-normal">{allActiveSchemes.length}</span>
            </TabButton>
            <TabButton active={activeTab === 'evaluation_methodologie'} onClick={() => setActiveTab('evaluation_methodologie')}>
              Évaluation qualitative (délib. 21/177 AC)
            </TabButton>
          </>
        }
      />

      <div className={`${pageContainer} py-5 space-y-4`}>
        {activeTab === 'dispositifs' && (
          <>
            {/* Recherche et filtre */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative w-full sm:max-w-sm">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mot clé, code, dépense…"
                  className={`${inputClass} pl-8`}
                />
              </div>
              <SegmentedControl
                ariaLabel="Base d’origine"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'ALL', label: `Tous (${countFor('ALL')})` },
                  { value: 'ANNEXE1', label: `Annexe 1 · Risilienza (${countFor('ANNEXE1')})` },
                  { value: 'GUIDE2026', label: `Guide 2026 (${countFor('GUIDE2026')})` }
                ]}
              />
              <span className="text-xs text-neutral-500 sm:ml-auto">
                {filteredSchemes.length} dispositif{filteredSchemes.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Catalogue */}
            <Panel bodyClassName="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
                    <th className="py-2 px-4 font-medium">Code</th>
                    <th className="py-2 px-3 font-medium">Dispositif</th>
                    <th className="py-2 px-3 font-medium">Base</th>
                    <th className="py-2 px-3 font-medium">Éval. qualitative</th>
                    <th className="py-2 px-3 font-medium text-right">Intensité max</th>
                    <th className="py-2 px-3 font-medium text-right">Plafond</th>
                    <th className="py-2 pr-4" aria-label="Ouvrir" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredSchemes.map((scheme) => (
                    <tr
                      key={scheme.id}
                      onClick={() => setSelectedScheme(scheme)}
                      className="group hover:bg-neutral-50 cursor-pointer align-top"
                    >
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-medium text-neutral-700">{scheme.code}</span>
                        <span className="block text-[11px] text-neutral-400">{scheme.sourceDocumentPages}</span>
                      </td>
                      <td className="py-2.5 px-3 min-w-[16rem]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScheme(scheme);
                          }}
                          className="text-left text-sm font-medium text-neutral-900 group-hover:text-prune-800 cursor-pointer"
                        >
                          {scheme.name}
                        </button>
                        <p className="text-neutral-500 line-clamp-2 mt-0.5 max-w-xl">{scheme.objective}</p>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-neutral-600">{shortCategoryLabel(scheme.category)}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {scheme.requiresQualitativeEvaluation ? <Badge>≥ 3 OUI</Badge> : <Badge tone="info">Non requise</Badge>}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right text-neutral-800">
                        {scheme.rates.tpeMaxRate ? `${Math.round(scheme.rates.tpeMaxRate * 100)} %` : scheme.rates.flatAmount ? 'Forfait' : 'Variable'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-medium text-neutral-900">
                        {scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €
                      </td>
                      <td className="py-2.5 pr-4 text-right">
                        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-prune-700 inline" />
                      </td>
                    </tr>
                  ))}
                  {filteredSchemes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500">
                        Aucun dispositif ne correspond à la recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Panel>
            <p className="text-[11px] text-neutral-500">Intensité maximale applicable aux TPE ; le détail par taille d’entreprise figure dans la fiche du dispositif.</p>
          </>
        )}

        {activeTab === 'evaluation_methodologie' && (
          <Panel
            title="Méthodologie de l’évaluation qualitative des projets"
            description="Délibération n° 21/177 AC du 28 octobre 2021 · Assemblée de Corse · modèle de développement (PADDUC / SRDE2I)."
          >
            <Notice tone="info" title="Condition d’accès à l’accompagnement">
              Le projet est éligible à la procédure d’accompagnement de l’ADEC pour les 5 dispositifs soumis s’il obtient <strong>au moins 3 « OUI »</strong> sur la grille des 8 questions expertisées.
            </Notice>

            <div>
              <h3 className="text-xs font-semibold text-neutral-900 mb-1.5">Thématiques transversales</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 list-disc pl-4 text-xs text-neutral-700">
                <li>Limiter les facteurs de dépendance du territoire (vis-à-vis de l’extérieur)</li>
                <li>Gérer durablement les ressources naturelles du territoire</li>
                <li>Mettre les ressources culturelles, identitaires et patrimoniales au service du projet</li>
                <li>Renforcer les solidarités sociales et territoriales</li>
                <li>Encourager l’initiative privée et les activités productives créatrices d’emplois durables</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-neutral-900 mb-1.5">Les 8 critères soumis à expertise (page 28 du Guide)</h3>
              <ol className="border border-neutral-200 rounded-md divide-y divide-neutral-100">
                {QUALITATIVE_EVALUATION_QUESTIONS.map((q, idx) => (
                  <li key={q.id} className="px-3 py-2.5 flex gap-3 text-xs">
                    <span className="font-mono text-neutral-400 w-5 shrink-0">{idx + 1}.</span>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-medium text-neutral-900">{q.title}</p>
                      <p className="text-neutral-700 leading-relaxed">{q.label}</p>
                      <p className="text-[11px] text-neutral-500">{q.clarification}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Panel>
        )}

        <DispositifDetailModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />

        <ExportGuideAidesModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          schemes={allActiveSchemes}
        />
      </div>
    </div>
  );
};
