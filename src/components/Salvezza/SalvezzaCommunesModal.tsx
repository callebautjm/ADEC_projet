/**
 * Modal / Fenêtre interactive officielle du Fonds SALVEZZA
 * Liste des 230 communes éligibles aux bonifications Volets Économique & Emploi
 * Cullettività di Corsica / Agence de Développement Économique de la Corse
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  MapPin, 
  Mountain, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Info, 
  Check, 
  ArrowUpDown,
  Building,
  Sparkles,
  Map as MapIcon,
  TableProperties
} from 'lucide-react';
import { 
  SALVEZZA_COMMUNES, 
  SALVEZZA_STATS, 
  searchSalvezzaCommunes 
} from '../../data/salvezzaCommunes';
import { SalvezzaCommune, SalvezzaConstraintScore } from '../../types';
import { SalvezzaMap } from './SalvezzaMap';

interface SalvezzaCommunesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCommuneCode?: string;
  onSelectCommune?: (commune: SalvezzaCommune) => void;
}

export const SalvezzaCommunesModal: React.FC<SalvezzaCommunesModalProps> = ({
  isOpen,
  onClose,
  selectedCommuneCode,
  onSelectCommune
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<'ALL' | '2A' | '2B'>('ALL');
  const [selectedScore, setSelectedScore] = useState<'ALL' | SalvezzaConstraintScore>('ALL');
  const [altitudeOnly, setAltitudeOnly] = useState(false);
  const [sortField, setSortField] = useState<'nom' | 'codeCommune' | 'scoreContrainte'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredCommunes = useMemo(() => {
    const results = searchSalvezzaCommunes(searchTerm, {
      departement: selectedDept,
      scoreContrainte: selectedScore,
      altitudeOnly
    });

    return [...results].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'nom') {
        comparison = a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
      } else if (sortField === 'codeCommune') {
        comparison = a.codeCommune.localeCompare(b.codeCommune);
      } else if (sortField === 'scoreContrainte') {
        comparison = a.scoreContrainte.localeCompare(b.scoreContrainte);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [searchTerm, selectedDept, selectedScore, altitudeOnly, sortField, sortOrder]);

  if (!isOpen) return null;

  const toggleSort = (field: 'nom' | 'codeCommune' | 'scoreContrainte') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="salvezza-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* En-tête Institutionnel */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between relative border-b border-blue-800/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Collectivité de Corse · Arrêté d'application
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 230 communes éligibles
              </span>
            </div>
            <h2 id="salvezza-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>FONDU DI SALVEZZA ECONOMICA TERRITURIALE</span>
            </h2>
            <p className="text-sm text-blue-100/90 mt-1 font-normal">
              Fonds de Sauvegarde Économique Territoriale — Bonifications Volets « Économique » & « Emploi »
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Boutons bascule Tableau / Carte dans l'en-tête */}
            <div className="flex items-center bg-blue-950/60 p-1 rounded-xl border border-blue-700/60 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
                title="Afficher la liste sous forme de tableau"
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tableau</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  viewMode === 'map'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
                title="Afficher la carte interactive de Corse"
              >
                <MapIcon className="w-3.5 h-3.5 text-emerald-200" />
                <span>Carte</span>
                <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 bg-emerald-400/30 text-emerald-200 rounded-full font-bold uppercase tracking-wider">
                  Corse
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Fermer la fenêtre"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bannière explicative des bonifications réglementaires */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-2xs flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Volet Économique</span>
                <span className="text-slate-600 leading-relaxed">
                  Bonification du taux de subvention & priorité d'octroi (*Impresi paisani*, modernisation, investissements productifs).
                </span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Volet Emploi (RIESCE)</span>
                <span className="text-slate-600 leading-relaxed">
                  Majoration financière pour chaque emploi pérenne créé et maintenu sur le territoire sous contrainte.
                </span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Mountain className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Critère Territorial Q4</span>
                <span className="text-slate-600 leading-relaxed">
                  Validation de plein droit du critère territorial d'aménagement de la montagne et ruralité (Délibération N° 21/177 AC).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barre d'outils, Filtres et Recherche */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom de commune, nom corse (ex: Ghjuncaghju) ou code INSEE (ex: 2B047)..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Filtre département */}
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedDept('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedDept === 'ALL'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toute la Corse ({SALVEZZA_STATS.totalCommunes})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDept('2A')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedDept === '2A'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2A Corse-du-Sud ({SALVEZZA_STATS.communes2A})
              </button>
              <button
                type="button"
                onClick={() => setSelectedDept('2B')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedDept === '2B'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2B Haute-Corse ({SALVEZZA_STATS.communes2B})
              </button>
            </div>
          </div>

          {/* Filtres secondaires : score de contrainte et altitude */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Filtrer par contrainte :
            </span>

            <button
              onClick={() => setSelectedScore('ALL')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                selectedScore === 'ALL'
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Tous scores
            </button>

            <button
              onClick={() => setSelectedScore('de 3 à 3,5')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                selectedScore === 'de 3 à 3,5'
                  ? 'bg-sky-50 border-sky-300 text-sky-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Score 3 à 3,5 ({SALVEZZA_STATS.contrainteBase3a35})
            </button>

            <button
              onClick={() => setSelectedScore('de 3,5 à 4')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                selectedScore === 'de 3,5 à 4'
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Score 3,5 à 4 ({SALVEZZA_STATS.contrainteMoyenne35a4})
            </button>

            <button
              onClick={() => setSelectedScore('au dessus de 4')}
              className={`px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                selectedScore === 'au dessus de 4'
                  ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Score &gt; 4 ({SALVEZZA_STATS.contrainteSevereSup4})
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

            <button
              onClick={() => setAltitudeOnly(!altitudeOnly)}
              className={`px-2.5 py-1 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                altitudeOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Mountain className="w-3.5 h-3.5 text-emerald-600" />
              Chef-lieu &gt; 350 m uniquement ({SALVEZZA_STATS.chefsLieuxAltitudeSup350m})
            </button>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-slate-500 font-medium">
                {filteredCommunes.length} commune{filteredCommunes.length > 1 ? 's' : ''} {viewMode === 'map' ? 'sur la carte' : 'affichée' + (filteredCommunes.length > 1 ? 's' : '')}
              </span>
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Afficher la liste en tableau"
                >
                  <TableProperties className="w-3.5 h-3.5" />
                  <span>Tableau</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                    viewMode === 'map'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Afficher la carte de Corse"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Carte</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vue Carte ou Vue Tableau */}
        {viewMode === 'map' ? (
          <div className="flex-1 overflow-hidden p-0 bg-slate-100">
            <SalvezzaMap
              communes={filteredCommunes}
              selectedCommuneCode={selectedCommuneCode}
              onSelectCommune={(c) => {
                if (onSelectCommune) {
                  onSelectCommune(c);
                  onClose();
                }
              }}
            />
          </div>
        ) : (
          /* Tableau des 230 Communes */
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {filteredCommunes.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Aucune commune ne correspond aux filtres appliqués</p>
                <p className="text-xs text-slate-500 mt-1">Essayez de réinitialiser la recherche ou de changer les critères.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDept('ALL');
                    setSelectedScore('ALL');
                    setAltitudeOnly(false);
                  }}
                  className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th 
                        scope="col" 
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none"
                        onClick={() => toggleSort('nom')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Nom officiel & Nom Corse</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition select-none"
                        onClick={() => toggleSort('codeCommune')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Code INSEE</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition select-none"
                        onClick={() => toggleSort('scoreContrainte')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Score de contrainte</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th scope="col" className="py-3 px-3">
                        <span>Altitude chef-lieu &gt; 350 m</span>
                      </th>
                      <th scope="col" className="py-3 px-4 text-right">
                        <span>Statut & Action</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredCommunes.map((c) => {
                      const isSelected = selectedCommuneCode && selectedCommuneCode.toUpperCase() === c.codeCommune.toUpperCase();
                      
                      return (
                        <tr 
                          key={c.codeCommune}
                          className={`hover:bg-blue-50/40 transition-colors ${
                            isSelected ? 'bg-blue-50/80 font-medium' : ''
                          }`}
                        >
                          {/* Noms */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-slate-900 text-sm">{c.nom}</span>
                              <span className="text-slate-500 italic text-xs font-serif">« {c.nomCorse} »</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {c.departement}
                              </span>
                            </div>
                          </td>

                          {/* Code INSEE */}
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                            {c.codeCommune}
                          </td>

                          {/* Score de contrainte */}
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              c.scoreContrainte === 'au dessus de 4'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : c.scoreContrainte === 'de 3,5 à 4'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-sky-100 text-sky-800 border border-sky-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                c.scoreContrainte === 'au dessus de 4'
                                  ? 'bg-rose-600'
                                  : c.scoreContrainte === 'de 3,5 à 4'
                                  ? 'bg-amber-600'
                                  : 'bg-sky-600'
                              }`} />
                              {c.scoreContrainte}
                            </span>
                          </td>

                          {/* Altitude */}
                          <td className="py-2.5 px-3">
                            {c.altitudeSup350m ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Mountain className="w-3 h-3 text-emerald-600" />
                                OUI (&gt; 350 m)
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs pl-2">—</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-4 text-right">
                            {onSelectCommune ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectCommune(c);
                                  onClose();
                                }}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition shadow-2xs inline-flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" /> Commune active
                                  </>
                                ) : (
                                  <>
                                    <Building className="w-3.5 h-3.5" /> Sélectionner
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> Éligible SALVEZZA
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pied de page */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Source officielle :</span>
            <span>Collectivité de Corse / Délibération N° 21/177 AC · Fondu di Salvezza Economica Territuriale (230 communes)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'map' ? 'table' : 'map')}
              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition text-xs flex items-center gap-1.5"
            >
              {viewMode === 'map' ? (
                <>
                  <TableProperties className="w-3.5 h-3.5 text-blue-600" />
                  <span>Afficher en tableau</span>
                </>
              ) : (
                <>
                  <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Afficher sur la carte</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition text-xs"
            >
              Fermer la fenêtre
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
