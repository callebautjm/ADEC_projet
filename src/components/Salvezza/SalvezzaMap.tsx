/**
 * Carte Interactive officielle du Fonds SALVEZZA (Corse)
 * Visualisation géographique des 230 communes éligibles aux bonifications territoriales
 * Collectivité de Corse / ADEC
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Mountain, 
  Check, 
  Building, 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Info,
  Sparkles,
  Maximize2,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import { SalvezzaCommune } from '../../types';
import { SALVEZZA_COORDINATES } from '../../data/salvezzaGeoCoords';

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
  const [tileStyle, setTileStyle] = useState<'voyager' | 'osm' | 'topo'>('voyager');

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

    // Tuiles par défaut (CartoDB Voyager: clair, esthétique et très lisible)
    const tileLayer = L.tileLayer(
      tileStyle === 'topo' 
        ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        : tileStyle === 'osm'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO / Collectivité de Corse'
      }
    );
    tileLayer.addTo(map);

    const markersGroup = L.layerGroup();
    markersGroup.addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersGroup;

    // Ajustement de taille après montage dans la modal
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(CORSICA_BOUNDS, { padding: [20, 20] });
    }, 150);

    return () => {
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

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attr = '&copy; OpenStreetMap contributors &copy; CARTO';

    if (tileStyle === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attr = '&copy; OpenStreetMap contributors';
    } else if (tileStyle === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attr = '&copy; OpenTopoMap contributors';
    }

    L.tileLayer(url, { maxZoom: 18, attribution: attr }).addTo(map);
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

      // Couleur selon score de contrainte
      let fillColor = '#0284c7'; // Sky-600 (score 3 à 3.5)
      let borderColor = '#0369a1';
      if (commune.scoreContrainte === 'au dessus de 4') {
        fillColor = '#e11d48'; // Rose-600
        borderColor = '#be123c';
      } else if (commune.scoreContrainte === 'de 3,5 à 4') {
        fillColor = '#d97706'; // Amber-600
        borderColor = '#b45309';
      }

      // Si commune active ou sélectionnée, anneau d'accentuation
      const radius = isActive || isSelected ? 8.5 : 5.5;
      const weight = isActive || isSelected ? 3 : 1.5;
      const markerBorder = isActive || isSelected ? '#10b981' : '#ffffff';

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
          <strong style="color: #0f172a; font-size: 12px;">${commune.nom}</strong> 
          <span style="color: #64748b; font-style: italic;">« ${commune.nomCorse} »</span>
          <div style="margin-top: 3px; display: flex; gap: 4px; align-items: center;">
            <span style="background: ${fillColor}; color: white; border-radius: 4px; padding: 1px 5px; font-weight: 600; font-size: 10px;">
              Score ${commune.scoreContrainte}
            </span>
            ${commune.altitudeSup350m ? '<span style="color: #047857; font-weight: 600; font-size: 10px;">⛰️ >350m</span>' : ''}
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

  return (
    <div className={`relative flex flex-col md:flex-row w-full h-[520px] sm:h-[580px] bg-slate-100 overflow-hidden ${className}`}>
      
      {/* Conteneur de la Carte Leaflet */}
      <div className="relative flex-1 h-full min-h-[320px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Commandes flottantes de Navigation */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 shadow-md rounded-xl bg-white/95 backdrop-blur-xs p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
            title="Zoom avant"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
            title="Zoom arrière"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
            title="Vue d'ensemble de la Corse"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Sélecteur de secteur insulaire (2A / 2B / Corse) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 shadow-md rounded-xl bg-white/95 backdrop-blur-xs p-1 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={handleResetView}
            className="px-2.5 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
          >
            Toute la Corse
          </button>
          <button
            type="button"
            onClick={handleZoom2B}
            className="px-2.5 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
          >
            Haute-Corse (2B)
          </button>
          <button
            type="button"
            onClick={handleZoom2A}
            className="px-2.5 py-1 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition"
          >
            Corse-du-Sud (2A)
          </button>
        </div>

        {/* Légende interactive permanente en bas à gauche */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-2.5 shadow-lg text-[11px] max-w-xs">
          <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-700" />
            Scores de contrainte territoriale
          </span>
          <div className="space-y-1 text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 ring-2 ring-white shrink-0 shadow-2xs" />
              <span>Score &gt; 4 (Contrainte forte)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-white shrink-0 shadow-2xs" />
              <span>Score 3,5 à 4 (Contrainte moyenne)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-500 ring-2 ring-white shrink-0 shadow-2xs" />
              <span>Score 3 à 3,5 (Contrainte de base)</span>
            </div>
            <div className="flex items-center gap-2 pt-0.5 border-t border-slate-100 mt-1">
              <Mountain className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Chef-lieu &gt; 350 m d'altitude</span>
            </div>
          </div>
        </div>

        {/* Sélecteur de style de carte (Fond) */}
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-1 shadow-md flex items-center gap-1 text-[10px] font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setTileStyle('voyager')}
            className={`px-2 py-1 rounded-lg transition ${tileStyle === 'voyager' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}
          >
            Plan Clair
          </button>
          <button
            type="button"
            onClick={() => setTileStyle('osm')}
            className={`px-2 py-1 rounded-lg transition ${tileStyle === 'osm' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}
          >
            OpenStreetMap
          </button>
          <button
            type="button"
            onClick={() => setTileStyle('topo')}
            className={`px-2 py-1 rounded-lg transition ${tileStyle === 'topo' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}
          >
            Relief Topo
          </button>
        </div>
      </div>

      {/* Panneau latéral / Fiche d'information de la commune active */}
      <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col overflow-y-auto max-h-[260px] md:max-h-none shrink-0 p-4">
        {activeCommune ? (
          <div className="space-y-3.5">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Département {activeCommune.departement}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeCommune.nom}
                </h3>
                <p className="text-xs text-slate-500 italic font-serif">
                  « {activeCommune.nomCorse} »
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCommune(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
                title="Désélectionner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Caractéristiques réglementaires */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Code INSEE</span>
                <span className="font-mono font-bold text-slate-800">{activeCommune.codeCommune}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Altitude chef-lieu</span>
                <span className={`font-semibold flex items-center gap-1 ${activeCommune.altitudeSup350m ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {activeCommune.altitudeSup350m ? (
                    <>
                      <Mountain className="w-3.5 h-3.5 text-emerald-600" /> &gt; 350 m
                    </>
                  ) : (
                    'Standard'
                  )}
                </span>
              </div>
            </div>

            {/* Badge Score de contrainte */}
            <div className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Score d'éloignement :</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                  activeCommune.scoreContrainte === 'au dessus de 4'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : activeCommune.scoreContrainte === 'de 3,5 à 4'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    activeCommune.scoreContrainte === 'au dessus de 4'
                      ? 'bg-rose-600'
                      : activeCommune.scoreContrainte === 'de 3,5 à 4'
                      ? 'bg-amber-600'
                      : 'bg-sky-600'
                  }`} />
                  {activeCommune.scoreContrainte}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Éligibilité confirmée à l'ensemble des bonifications du Fonds Salvezza (Délibération N° 21/177 AC).
              </p>
            </div>

            {/* Bonifications applicables */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 bg-blue-50/70 p-2 rounded-lg border border-blue-100 text-blue-900">
                <TrendingUp className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block">Volet Économique</span>
                  Majoration de subvention & priorisation territoriale ADEC.
                </div>
              </div>

              <div className="flex items-start gap-2 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 text-emerald-900">
                <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold block">Volet Emploi (RIESCE)</span>
                  Aide bonifiée par emploi pérenne créé/maintenu.
                </div>
              </div>
            </div>

            {/* Bouton d'action de sélection */}
            {onSelectCommune && (
              <button
                type="button"
                onClick={() => onSelectCommune(activeCommune)}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-2xs ${
                  selectedCommuneCode && selectedCommuneCode.toUpperCase() === activeCommune.codeCommune.toUpperCase()
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {selectedCommuneCode && selectedCommuneCode.toUpperCase() === activeCommune.codeCommune.toUpperCase() ? (
                  <>
                    <Check className="w-4 h-4" /> Commune sélectionnée dans le dossier
                  </>
                ) : (
                  <>
                    <Building className="w-4 h-4" /> Sélectionner cette commune
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 mb-1">
              Explorez la carte de Corse
            </h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Cliquez sur un point de la carte pour consulter les spécificités de la commune, ses bonifications Salvezza et l'assigner à votre dossier.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 w-full flex items-center justify-around text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> {communes.length} communes
              </span>
              <span>2A & 2B</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
