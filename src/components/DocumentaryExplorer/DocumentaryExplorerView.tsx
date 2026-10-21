/**
 * Explorateur Documentaire & Réglementaire Intégral
 * Guide des Aides ADEC - Version 2026 & Annexe 1
 */

import React, { useState } from 'react';
import { useDatabases } from '../../context/DatabaseContext';
import { DispositifScheme } from '../../types';
import { QUALITATIVE_EVALUATION_QUESTIONS } from '../../data/adecOfficialData';
import { DispositifDetailModal } from '../Results/DispositifDetailModal';
import { ExportGuideAidesModal } from './ExportGuideAidesModal';
import { PageHero, heroActionClass } from '../Layout/PageHero';
import { TabButton } from '../Layout/TabButton';
import {
  Search,
  Filter,
  FileText,
  Award,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Scale,
  Printer,
  Download
} from 'lucide-react';

export const DocumentaryExplorerView: React.FC = () => {
  const { allActiveSchemes } = useDatabases();
  const [selectedScheme, setSelectedScheme] = useState<DispositifScheme | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ANNEXE1' | 'GUIDE2026'>('ALL');
  const [activeTab, setActiveTab] = useState<'dispositifs' | 'evaluation_methodologie'>('dispositifs');

  const filteredSchemes = allActiveSchemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.eligibleExpenseCategories.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (categoryFilter === 'ANNEXE1') {
      return scheme.category === 'Pattu Risilienzia è Territorii';
    }
    if (categoryFilter === 'GUIDE2026') {
      return scheme.category === 'Guide des Aides - Évaluation Qualitative';
    }
    return true;
  });

  return (
    <div>
      <PageHero
        eyebrow="Répertoire officiel dématérialisé · Version 2026"
        title="Guide des aides de l’ADEC & Pattu Risilienzia"
        description="Consultez le texte intégral des dispositifs de soutien aux entreprises adoptés par la Collectivité de Corse : objectifs, bénéficiaires, exclusions expresses, dépenses éligibles, intensités et seuils financiers."
        actions={
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className={heroActionClass}
            title="Créer un export PDF officiel de l'ensemble des fiches d'aides synthétisées pour la communication et les usagers"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF des fiches</span>
          </button>
        }
      />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Onglets */}
        <div className="flex items-center gap-6 border-b border-neutral-200 overflow-x-auto">
          <TabButton active={activeTab === 'dispositifs'} onClick={() => setActiveTab('dispositifs')}>
            Catalogue des dispositifs ({allActiveSchemes.length})
          </TabButton>
          <TabButton active={activeTab === 'evaluation_methodologie'} onClick={() => setActiveTab('evaluation_methodologie')}>
            <Award className="w-3.5 h-3.5" />
            Méthodologie d’évaluation qualitative (Délibération 21/177 AC)
          </TabButton>
        </div>

        {activeTab === 'dispositifs' && (
          <div className="space-y-6">
            {/* Controls & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-md w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par mot clé, dépense, secteur..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-prune-500"
                />
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg text-xs">
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-3 py-1.5 font-medium rounded-md transition ${
                    categoryFilter === 'ALL' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Tous ({allActiveSchemes.length})
                </button>
                <button
                  onClick={() => setCategoryFilter('ANNEXE1')}
                  className={`px-3 py-1.5 font-medium rounded-md transition ${
                    categoryFilter === 'ANNEXE1' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Annexe 1 : Risilienzia (4)
                </button>
                <button
                  onClick={() => setCategoryFilter('GUIDE2026')}
                  className={`px-3 py-1.5 font-medium rounded-md transition ${
                    categoryFilter === 'GUIDE2026' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Guide 2026 : Éval. Qual.
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                        {scheme.code}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {scheme.sourceDocumentPages}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 group-hover:text-prune-700 transition leading-snug mb-1">
                      {scheme.name}
                    </h3>

                    <p className="text-xs text-neutral-600 line-clamp-3 mb-4 leading-relaxed">
                      {scheme.objective}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Intensité max :</span>
                      <span className="font-bold font-mono text-neutral-900">
                        {scheme.rates.tpeMaxRate ? `jusqu’à ${scheme.rates.tpeMaxRate * 100} %` : scheme.rates.flatAmount ? 'Forfait' : 'Variable'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Plafond :</span>
                      <span className="font-bold font-mono text-neutral-900">
                        {scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs font-semibold text-prune-700 group-hover:translate-x-0.5 transition">
                      <span>Consulter le texte intégral</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'evaluation_methodologie' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-neutral-200 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-safran-300 text-neutral-900">
                  Délibération N° 21/177 AC du 28 octobre 2021
                </span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900">
                Méthodologie de l’Évaluation Qualitative des Projets
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Assemblée de Corse · Modèle de développement au service du peuple corse (PADDUC / SRDE2I).
              </p>
            </div>

            {/* Rappel des thématiques transversales */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-neutral-700 space-y-2">
              <span className="font-bold text-neutral-900 block uppercase tracking-wider text-[11px]">
                Thématiques transversales directrices :
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc pl-4 text-neutral-700">
                <li>Limiter les facteurs de dépendance du territoire (vis-à-vis de l’extérieur)</li>
                <li>Gérer durablement les ressources naturelles du territoire</li>
                <li>Mettre les ressources culturelles, identitaires et patrimoniales au service du projet</li>
                <li>Renforcer les solidarités sociales et territoriales</li>
                <li>Encourager l’initiative privée et les activités productives créatrices d’emplois durables</li>
              </ul>
            </div>

            {/* Règle des 3 OUI */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Condition sine qua non d’accès à l’accompagnement :</span>
                <p className="mt-0.5 leading-relaxed">
                  Le projet est éligible à la procédure d’accompagnement de l’ADEC pour les 5 dispositifs soumis s’il obtient <strong>au moins 3 « OUI »</strong> sur la grille des 8 questions expertisées.
                </p>
              </div>
            </div>

            {/* Liste détaillée des 8 critères avec citations exactes */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 block">
                Les 8 critères soumis à expertise (Page 28) :
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {QUALITATIVE_EVALUATION_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="p-3.5 border border-neutral-200 rounded-xl bg-neutral-50/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-500">0{idx + 1}.</span>
                      <span className="font-bold text-neutral-900">{q.title}</span>
                    </div>
                    <p className="text-neutral-700 text-[11px] leading-relaxed">
                      {q.label}
                    </p>
                    <p className="text-[10px] text-neutral-400 italic">
                      {q.clarification}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal inspect */}
        <DispositifDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />

        {/* Modal d'export PDF de synthèse pour la communication */}
        <ExportGuideAidesModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          schemes={allActiveSchemes}
        />
      </div>
    </div>
  );
};
