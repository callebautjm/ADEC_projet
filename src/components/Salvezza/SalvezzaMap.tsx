/**
 * Carte Interactive officielle du Fonds SALVEZZA (Corse)
 * Visualisation géographique des 230 communes éligibles aux bonifications territoriales
 * Collectivité de Corse / ADEC
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Mountain, Check, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';
import { SalvezzaCommune } from '../../types';
import { SALVEZZA_COORDINATES } from '../../data/salvezzaGeoCoords';
import { SCORE_TONES } from './scoreTones';
import { Badge, SegmentedControl, btn } from '../Layout/ui';

interface SalvezzaMapProps {
  communes: SalvezzaCommune[];
  selectedCommuneCode?: string;
  onSelectCommune?: (commune: SalvezzaCommune) => void;
  className?: string;
}

// Bornes géographiques de la Corse
const CORSICA_BOUNDS: L.LatLngBoundsLiteral = [
  [41.32, 8.52], // Sud-Ouest (Bonifacio)
  [43.05, 9.58]  // Nord-Est (Cap Corse)
];

const CORSICA_CENTER: L.LatLngExpression = [42.15, 9.1];

/** Fonds de carte utilisables sans clé d'API (les tuiles CARTO en exigent désormais une) */
const TILE_LAYERS = {
  osm: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' },
  topo: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', maxZoom: 17, attribution: '&copy; OpenTopoMap contributors' }
};
type TileStyle = keyof typeof TILE_LAYERS;

export const SalvezzaMap: React.FC<SalvezzaMapProps> = ({
  communes,
  selectedCommuneCode,
  onSelectCommune,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [activeCommune, setActiveCommune] = useState<SalvezzaCommune | null>(null);
  const [tileStyle, setTileStyle] = useState<TileStyle>('osm');

  // Trouver la commune actuellement sélectionnée dans les props
  useEffect(() => {
    if (selectedCommuneCode) {
      const match = communes.find(
        (c) => c.codeCommune.toUpperCase() === selectedCommuneCode.toUpperCase()
      );
      if (match) {
        setActiveCommune(match);
      }
    }
  }, [selectedCommuneCode, communes]);

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CORSICA_CENTER,
      zoom: 8.5,
      minZoom: 7.5,
      maxZoom: 16,
      maxBounds: [
        [41.0, 8.0],
        [43.3, 10.0]
      ],
      zoomControl: false,
      attributionControl: true
    });

    // Le fond de carte est ajouté par l'effet ci-dessous (et remplacé à chaque changement de style)
    const markersGroup = L.layerGroup();
    markersGroup.addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersGroup;

    // Ajustement de taille après montage dans la modal
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(CORSICA_BOUNDS, { padding: [20, 20] });
    }, 150);

    return () => {
      // Le minuteur ne doit pas agir sur une carte déjà détruite (démontage, double montage en développement)
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Mettre à jour le fond de carte si le style change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const { url, maxZoom, attribution } = TILE_LAYERS[tileStyle];
    L.tileLayer(url, { maxZoom, attribution }).addTo(map);
  }, [tileStyle]);

  // Rendu des repères de communes sur la carte
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    communes.forEach((commune) => {
      const coords = SALVEZZA_COORDINATES[commune.codeCommune];
      if (!coords) return;

      const latLng: L.LatLngExpression = [coords.lat, coords.lng];
      bounds.push(latLng);

      const isSelected = selectedCommuneCode && selectedCommuneCode.toUpperCase() === commune.codeCommune.toUpperCase();
      const isActive = activeCommune?.codeCommune.toUpperCase() === commune.codeCommune.toUpperCase();

      // Couleur selon score de contrainte (même palette que la légende et le tableau)
      const fillColor = SCORE_TONES[commune.scoreContrainte]?.hex || '#177a9c';

      // Commune active ou sélectionnée : repère agrandi, cerclé de prune
      const radius = isActive || isSelected ? 8.5 : 5.5;
      const weight = isActive || isSelected ? 3 : 1.5;
      const markerBorder = isActive || isSelected ? '#8b2778' : '#ffffff';

      const circle = L.circleMarker(latLng, {
        radius,
        fillColor,
        fillOpacity: isActive || isSelected ? 1 : 0.85,
        color: markerBorder,
        weight
      });

      // Tooltip rapide au survol
      const tooltipContent = `
        <div style="font-family: system-ui, sans-serif; font-size: 11px; padding: 2px;">
          <strong style="color: #171717; font-size: 12px;">${commune.nom}</strong>
          <span style="color: #737373;">« ${commune.nomCorse} »</span>
          <div style="margin-top: 3px; display: flex; gap: 6px; align-items: center;">
            <span style="background: ${fillColor}; color: white; border-radius: 3px; padding: 1px 5px; font-weight: 600; font-size: 10px;">
              Score ${commune.scoreContrainte}
            </span>
            ${commune.altitudeSup350m ? '<span style="color: #525252; font-size: 10px;">Chef-lieu &gt; 350 m</span>' : ''}
          </div>
        </div>
      `;

      circle.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -6],
        className: 'salvezza-leaflet-tooltip'
      });

      circle.on('click', () => {
        setActiveCommune(commune);
        map.flyTo(latLng, Math.max(map.getZoom(), 11), {
          duration: 0.6
        });
      });

      circle.addTo(markersGroup);
    });

    // Si on a des communes filtrées spécifiques et qu'il y en a moins de 50, adapter la vue
    if (communes.length > 0 && communes.length < 230 && bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 12 });
    }
  }, [communes, selectedCommuneCode, activeCommune]);

  // Réinitialiser la vue sur toute la Corse
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyToBounds(CORSICA_BOUNDS, {
      padding: [20, 20],
      duration: 0.8
    });
  };

  // Zoom sur la Corse-du-Sud (2A)
  const handleZoom2A = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyToBounds(
      [
        [41.34, 8.52],
        [42.22, 9.45]
      ],
      { padding: [25, 25], duration: 0.8 }
    );
  };

  // Zoom sur la Haute-Corse (2B)
  const handleZoom2B = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyToBounds(
      [
        [42.05, 8.65],
        [43.05, 9.58]
      ],
      { padding: [25, 25], duration: 0.8 }
    );
  };

  const isSelectedActive = Boolean(
    activeCommune && selectedCommuneCode && selectedCommuneCode.toUpperCase() === activeCommune.codeCommune.toUpperCase()
  );
  const floatingBox = 'absolute z-10 bg-white border border-neutral-200 rounded-md shadow-sm';
  const mapButton = 'p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors cursor-pointer';

  return (
    <div className={`relative flex flex-col md:flex-row w-full h-[520px] sm:h-[560px] bg-neutral-100 overflow-hidden ${className}`}>
      {/* Carte Leaflet */}
      <div className="relative flex-1 h-full min-h-[320px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Zoom */}
        <div className={`${floatingBox} top-3 left-3 flex flex-col p-0.5`}>
          <button type="button" onClick={() => mapInstanceRef.current?.zoomIn()} className={mapButton} title="Zoom avant" aria-label="Zoom avant">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => mapInstanceRef.current?.zoomOut()} className={mapButton} title="Zoom arrière" aria-label="Zoom arrière">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="h-px bg-neutral-200 mx-1 my-0.5" />
          <button type="button" onClick={handleResetView} className={mapButton} title="Vue d'ensemble de la Corse" aria-label="Vue d'ensemble">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Cadrage par département */}
        <div className={`${floatingBox} top-3 right-3 flex items-center p-0.5 text-xs`}>
          <button type="button" onClick={handleResetView} className={`${mapButton} px-2`}>Corse</button>
          <button type="button" onClick={handleZoom2B} className={`${mapButton} px-2`}>Haute-Corse (2B)</button>
          <button type="button" onClick={handleZoom2A} className={`${mapButton} px-2`}>Corse-du-Sud (2A)</button>
        </div>

        {/* Légende */}
        <div className={`${floatingBox} bottom-3 left-3 px-2.5 py-2 text-[11px] text-neutral-700 space-y-1`}>
          <p className="font-semibold text-neutral-900">Score de contrainte territoriale</p>
          {(['au dessus de 4', 'de 3,5 à 4', 'de 3 à 3,5'] as const).map((score) => (
            <p key={score} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${SCORE_TONES[score].dot}`} />
              {SCORE_TONES[score].label}
            </p>
          ))}
        </div>

        {/* Fond de carte */}
        <div className="absolute z-10 bottom-3 right-3">
          <SegmentedControl
            ariaLabel="Fond de carte"
            value={tileStyle}
            onChange={setTileStyle}
            options={[
              { value: 'osm', label: 'Plan' },
              { value: 'topo', label: 'Relief' }
            ]}
          />
        </div>
      </div>

      {/* Fiche de la commune active */}
      <div className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-neutral-200 flex flex-col overflow-y-auto max-h-[260px] md:max-h-none shrink-0 p-4">
        {activeCommune ? (
          <div className="space-y-3 text-xs">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-neutral-100">
              <div>
                <p className="text-[11px] text-neutral-500">Département {activeCommune.departement}</p>
                <h3 className="text-base font-semibold text-neutral-900">{activeCommune.nom}</h3>
                <p className="text-neutral-500">« {activeCommune.nomCorse} »</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCommune(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                title="Désélectionner"
                aria-label="Désélectionner la commune"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <dl className="space-y-1.5">
              <div className="flex justify-between gap-2">
                <dt className="text-neutral-500">Code INSEE</dt>
                <dd className="font-mono text-neutral-900">{activeCommune.codeCommune}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-neutral-500">Chef-lieu</dt>
                <dd className="text-neutral-900 inline-flex items-center gap-1">
                  {activeCommune.altitudeSup350m ? (
                    <>
                      <Mountain className="w-3.5 h-3.5 text-neutral-500" /> &gt; 350 m
                    </>
                  ) : (
                    '≤ 350 m'
                  )}
                </dd>
              </div>
              <div className="flex justify-between items-center gap-2">
                <dt className="text-neutral-500">Score de contrainte</dt>
                <dd>
                  <Badge tone={SCORE_TONES[activeCommune.scoreContrainte].tone}>{activeCommune.scoreContrainte}</Badge>
                </dd>
              </div>
            </dl>

            <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-neutral-700">
              <p>
                <strong className="font-semibold text-neutral-900">Volet Économique :</strong> majoration de subvention et priorisation territoriale ADEC.
              </p>
              <p>
                <strong className="font-semibold text-neutral-900">Volet Emploi (RIESCE) :</strong> aide bonifiée par emploi pérenne créé ou maintenu.
              </p>
              <p className="text-[11px] text-neutral-500">Éligible à l’ensemble des bonifications du Fonds Salvezza (délibération n° 21/177 AC).</p>
            </div>

            {onSelectCommune && (
              isSelectedActive ? (
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-prune-800">
                  <Check className="w-4 h-4" />
                  Commune retenue pour le dossier
                </p>
              ) : (
                <button type="button" onClick={() => onSelectCommune(activeCommune)} className={`${btn('primary')} w-full`}>
                  Retenir cette commune pour le dossier
                </button>
              )
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center text-xs text-neutral-500 gap-2">
            <MapPin className="w-5 h-5 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-800">Aucune commune sélectionnée</p>
            <p className="leading-relaxed">
              Cliquer sur un point de la carte pour afficher la commune et ses bonifications Salvezza{onSelectCommune ? ', puis la retenir pour le dossier' : ''}.
            </p>
            <p className="pt-2 border-t border-neutral-100">
              {communes.length} commune{communes.length > 1 ? 's' : ''} affichée{communes.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
