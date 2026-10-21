/**
 * Fenêtre du Fonds SALVEZZA : liste et carte des 230 communes éligibles
 * aux bonifications des volets Économique & Emploi
 * Cullettività di Corsica / Agence de Développement Économique de la Corse
 */

import React, { useState, useMemo } from 'react';
import { Search, MapPin, Mountain, Check, ArrowUpDown, X } from 'lucide-react';
import {
  SALVEZZA_STATS,
  searchSalvezzaCommunes
} from '../../data/salvezzaCommunes';
import { SalvezzaCommune, SalvezzaConstraintScore } from '../../types';
import { SalvezzaMap } from './SalvezzaMap';
import { SCORE_TONES } from './scoreTones';
import { Badge, Modal, SegmentedControl, btn, inputClass } from '../Layout/ui';

interface SalvezzaCommunesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCommuneCode?: string;
  onSelectCommune?: (commune: SalvezzaCommune) => void;
}

type SortField = 'nom' | 'codeCommune' | 'scoreContrainte';

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
  const [sortField, setSortField] = useState<SortField>('nom');
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

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDept('ALL');
    setSelectedScore('ALL');
    setAltitudeOnly(false);
  };

  const sortHeader = (field: SortField, label: string, className: string) => (
    <th scope="col" className={`py-2 font-medium ${className}`}>
      <button type="button" onClick={() => toggleSort(field)} className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-neutral-900 cursor-pointer">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-neutral-700' : 'text-neutral-300'}`} />
      </button>
    </th>
  );

  return (
    <Modal
      size="xl"
      title="Fonds Salvezza : 230 communes éligibles"
      subtitle="Fondu di Salvezza Economica Territuriale · bonifications des volets « Économique » et « Emploi »"
      headerActions={
        <SegmentedControl
          ariaLabel="Affichage"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'map', label: 'Carte' },
            { value: 'table', label: 'Tableau' }
          ]}
        />
      }
      onClose={onClose}
      bodyClassName="flex flex-col"
      footer={
        <>
          <span className="text-[11px] text-neutral-500">
            Source : Collectivité de Corse, délibération n° 21/177 AC · Fondu di Salvezza Economica Territuriale
          </span>
          <button type="button" onClick={onClose} className={btn('secondary')}>
            Fermer
          </button>
        </>
      }
    >
      {/* Bonifications réglementaires */}
      <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 text-[11px] text-neutral-600">
        <div>
          <dt className="inline font-semibold text-neutral-900">Volet Économique : </dt>
          <dd className="inline">bonification du taux de subvention et priorité d’octroi (Impresi paisani, modernisation, investissements productifs).</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-neutral-900">Volet Emploi (RIESCE) : </dt>
          <dd className="inline">majoration pour chaque emploi pérenne créé et maintenu sur le territoire sous contrainte.</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-neutral-900">Critère territorial Q4 : </dt>
          <dd className="inline">validé de plein droit (montagne et ruralité, délibération n° 21/177 AC).</dd>
        </div>
      </dl>

      {/* Recherche et filtres */}
      <div className="px-4 py-3 border-b border-neutral-200 space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom de commune, nom corse (ex. Ghjuncaghju) ou code INSEE (ex. 2B047)…"
              aria-label="Rechercher une commune"
              className={`${inputClass} pl-8`}
            />
          </div>
          <SegmentedControl
            ariaLabel="Département"
            value={selectedDept}
            onChange={setSelectedDept}
            options={[
              { value: 'ALL', label: `Toute la Corse (${SALVEZZA_STATS.totalCommunes})` },
              { value: '2A', label: `2A (${SALVEZZA_STATS.communes2A})`, title: 'Corse-du-Sud' },
              { value: '2B', label: `2B (${SALVEZZA_STATS.communes2B})`, title: 'Haute-Corse' }
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-500">Score de contrainte :</span>
          <SegmentedControl
            ariaLabel="Score de contrainte"
            value={selectedScore}
            onChange={setSelectedScore}
            options={[
              { value: 'ALL', label: 'Tous' },
              {
                value: 'de 3 à 3,5',
                label: <><span className={`w-2 h-2 rounded-full ${SCORE_TONES['de 3 à 3,5'].dot}`} />3 à 3,5 ({SALVEZZA_STATS.contrainteBase3a35})</>
              },
              {
                value: 'de 3,5 à 4',
                label: <><span className={`w-2 h-2 rounded-full ${SCORE_TONES['de 3,5 à 4'].dot}`} />3,5 à 4 ({SALVEZZA_STATS.contrainteMoyenne35a4})</>
              },
              {
                value: 'au dessus de 4',
                label: <><span className={`w-2 h-2 rounded-full ${SCORE_TONES['au dessus de 4'].dot}`} />&gt; 4 ({SALVEZZA_STATS.contrainteSevereSup4})</>
              }
            ]}
          />

          <label className="inline-flex items-center gap-1.5 text-neutral-700 cursor-pointer">
            <input type="checkbox" checked={altitudeOnly} onChange={(e) => setAltitudeOnly(e.target.checked)} className="w-4 h-4" />
            Chef-lieu &gt; 350 m uniquement ({SALVEZZA_STATS.chefsLieuxAltitudeSup350m})
          </label>

          <span className="sm:ml-auto text-neutral-500">
            {filteredCommunes.length} commune{filteredCommunes.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Vue carte ou vue tableau */}
      {viewMode === 'map' ? (
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
      ) : filteredCommunes.length === 0 ? (
        <div className="text-center py-12 px-4">
          <MapPin className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-700">Aucune commune ne correspond aux filtres</p>
          <button type="button" onClick={resetFilters} className={`${btn('secondary', 'sm')} mt-3`}>
            <X className="w-3.5 h-3.5" />
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-[11px] text-neutral-500 border-b border-neutral-200">
              <tr>
                {sortHeader('nom', 'Commune', 'px-4')}
                {sortHeader('codeCommune', 'Code INSEE', 'px-3')}
                {sortHeader('scoreContrainte', 'Score de contrainte', 'px-3')}
                <th scope="col" className="py-2 px-3 font-medium uppercase tracking-wide">Chef-lieu &gt; 350 m</th>
                <th scope="col" className="py-2 px-4 font-medium uppercase tracking-wide text-right">{onSelectCommune ? 'Action' : 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCommunes.map((c) => {
                const isSelected = Boolean(selectedCommuneCode && selectedCommuneCode.toUpperCase() === c.codeCommune.toUpperCase());
                return (
                  <tr key={c.codeCommune} className={isSelected ? 'bg-prune-50/60' : 'hover:bg-neutral-50'}>
                    <td className="py-2 px-4">
                      <span className="font-medium text-neutral-900">{c.nom}</span>
                      <span className="text-neutral-500 ml-1.5">« {c.nomCorse} »</span>
                      <span className="ml-1.5 text-[11px] text-neutral-400">{c.departement}</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-neutral-700">{c.codeCommune}</td>
                    <td className="py-2 px-3">
                      <Badge tone={SCORE_TONES[c.scoreContrainte].tone}>{c.scoreContrainte}</Badge>
                    </td>
                    <td className="py-2 px-3 text-neutral-700">
                      {c.altitudeSup350m ? (
                        <span className="inline-flex items-center gap-1">
                          <Mountain className="w-3.5 h-3.5 text-neutral-500" />
                          Oui
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-1.5 px-4 text-right">
                      {onSelectCommune ? (
                        isSelected ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-prune-800">
                            <Check className="w-3.5 h-3.5" />
                            Commune du dossier
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCommune(c);
                              onClose();
                            }}
                            className={btn('secondary', 'sm')}
                          >
                            Sélectionner
                          </button>
                        )
                      ) : (
                        <Badge tone="success">Éligible</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};
