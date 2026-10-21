/**
 * Gestionnaire de Bases Documentaires & Analyseur Réglementaire
 * Permet d'analyser d'autres dispositifs et de se mettre à jour automatiquement
 * lors de l'ajout de nouvelles bases de données documentaires.
 */

import React, { useState } from 'react';
import { useDatabases } from '../../context/DatabaseContext';
import { DispositifScheme, ActivitySector, CompanySize } from '../../types';
import { DispositifDetailModal } from '../Results/DispositifDetailModal';
import { PageHero, heroSecondaryActionClass } from '../Layout/PageHero';
import { TabButton } from '../Layout/TabButton';
import {
  Plus,
  Upload,
  Download,
  RotateCcw,
  FileCode,
  CheckCircle2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  BookOpen,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const DatabaseManagerView: React.FC = () => {
  const {
    databases,
    allActiveSchemes,
    selectedDatabaseId,
    setSelectedDatabaseId,
    addScheme,
    deleteScheme,
    toggleSchemeActive,
    importFromJson,
    exportToJson,
    resetToOfficial,
    autoIngestRegulatoryText
  } = useDatabases();

  const [activeSubTab, setActiveSubTab] = useState<'schemes' | 'ingest' | 'import_export'>('schemes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState<DispositifScheme | null>(null);

  // Formulaire d'ingestion automatique de texte réglementaire
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestCategory, setIngestCategory] = useState<'Pattu Risilienzia è Territorii' | 'Guide des Aides - Évaluation Qualitative' | 'Base Personnalisée'>('Base Personnalisée');
  const [ingestRawText, setIngestRawText] = useState('');
  const [ingestStatus, setIngestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Formulaire d'import JSON
  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const filteredSchemes = allActiveSchemes.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.objective.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAutoIngest = (e: React.FormEvent) => {
    e.preventDefault();
    setIngestStatus(null);
    const res = autoIngestRegulatoryText(ingestTitle, ingestRawText, ingestCategory);
    if (res.success && res.scheme) {
      setIngestStatus({
        success: true,
        message: `Dispositif "${res.scheme.name}" analysé et intégré avec succès au moteur de règles ! Code attribué : ${res.scheme.code}`
      });
      setIngestTitle('');
      setIngestRawText('');
      setActiveSubTab('schemes');
    } else {
      setIngestStatus({ success: false, message: res.error || 'Erreur lors de l’analyse du texte.' });
    }
  };

  const handleJsonImport = () => {
    setImportStatus(null);
    if (!jsonInput.trim()) {
      setImportStatus({ success: false, message: 'Veuillez coller un JSON valide.' });
      return;
    }
    const res = importFromJson(jsonInput);
    setImportStatus(res);
    if (res.success) {
      setJsonInput('');
    }
  };

  const handleDownloadExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportToJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `adec_bases_documentaires_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div>
      <PageHero
        eyebrow="Gestionnaire de bases documentaires"
        title="Textes officiels"
        description="Consultez, mettez à jour ou intégrez de nouveaux textes, arrêtés et bases de dispositifs pour enrichir le moteur de diagnostic en temps réel."
        actions={
          <button
            onClick={resetToOfficial}
            title="Restaurer la base officielle ADEC 2026 certifiée"
            className={heroSecondaryActionClass}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser la base officielle
          </button>
        }
      />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        {/* Sélecteur des bases actives */}
        <div className="bg-white border border-neutral-200 p-4 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-neutral-500 font-bold uppercase tracking-wider text-[11px] mr-1">Bases actives :</span>
          <button
            onClick={() => setSelectedDatabaseId('ALL')}
            className={`px-3.5 py-1.5 rounded-full border transition font-semibold cursor-pointer ${
              selectedDatabaseId === 'ALL'
                ? 'bg-prune-600 border-prune-600 text-white'
                : 'bg-white border-neutral-300 text-neutral-700 hover:border-prune-400 hover:text-prune-700'
            }`}
          >
            Toutes les bases ({allActiveSchemes.length} mesures)
          </button>
          {databases.map((db) => (
            <button
              key={db.id}
              onClick={() => setSelectedDatabaseId(db.id)}
              className={`px-3.5 py-1.5 rounded-full border transition font-semibold flex items-center gap-1.5 cursor-pointer ${
                selectedDatabaseId === db.id
                  ? 'bg-prune-600 border-prune-600 text-white'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:border-prune-400 hover:text-prune-700'
              }`}
            >
              {db.isOfficialBase && (
                <CheckCircle2 className={`w-3 h-3 ${selectedDatabaseId === db.id ? 'text-white' : 'text-emerald-600'}`} />
              )}
              {db.title} ({db.schemes.length})
            </button>
          ))}
        </div>

        {/* Onglets */}
        <div className="flex items-center gap-6 border-b border-neutral-200 overflow-x-auto">
          <TabButton active={activeSubTab === 'schemes'} onClick={() => setActiveSubTab('schemes')}>
            <BookOpen className="w-4 h-4" />
            Dispositifs référencés ({allActiveSchemes.length})
          </TabButton>
          <TabButton active={activeSubTab === 'ingest'} onClick={() => setActiveSubTab('ingest')}>
            <Sparkles className="w-4 h-4" />
            Analyser & intégrer un nouveau texte réglementaire
          </TabButton>
          <TabButton active={activeSubTab === 'import_export'} onClick={() => setActiveSubTab('import_export')}>
            <FileCode className="w-4 h-4" />
            Import / Export JSON
          </TabButton>
        </div>

        {/* SUB-TAB 1 : LIST OF REFERENCED SCHEMES */}
        {activeSubTab === 'schemes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative max-w-md w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par mot-clé, code ou objectif..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-prune-500"
                />
              </div>
              <span className="text-xs text-neutral-500">
                {filteredSchemes.length} dispositif(s) affiché(s)
              </span>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Code & Nom</th>
                      <th className="py-3 px-4">Catégorie & Source</th>
                      <th className="py-3 px-4">Éval. Qual.</th>
                      <th className="py-3 px-4">Taux Indicatifs</th>
                      <th className="py-3 px-4 text-right">Plafond</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredSchemes.map((s) => (
                      <tr key={s.id} className="hover:bg-neutral-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-mono text-neutral-500 font-bold">{s.code}</div>
                          <div className="font-bold text-neutral-900 text-xs">{s.name}</div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          <span className="block font-medium">{s.category}</span>
                          <span className="text-[11px] text-neutral-400">{s.sourceDocumentPages}</span>
                        </td>
                        <td className="py-3 px-4">
                          {s.requiresQualitativeEvaluation ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              ≥ 3 OUI requis
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600">
                              Exemptée
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-700">
                          {s.rates.tpeMaxRate ? `${s.rates.tpeMaxRate * 100}% TPE / ${s.rates.peMaxRate ? s.rates.peMaxRate * 100 : '-'}% PE` : s.rates.flatAmount ? s.rates.flatAmount.label : 'Selon barème'}
                        </td>
                        <td className="py-3 px-4 font-mono text-right font-bold text-neutral-900">
                          {s.rates.ceilingAmount.toLocaleString('fr-FR')} €
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleSchemeActive(s.id)}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            {s.isActive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                Actif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                                Désactivé
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedSchemeForModal(s)}
                            className="px-2.5 py-1 text-neutral-700 hover:bg-neutral-200 rounded font-medium text-[11px] transition"
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => deleteScheme(s.id)}
                            className="p-1 text-neutral-400 hover:text-red-600 transition"
                            title="Supprimer le dispositif"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2 : AUTO-INGESTION DE TEXTE RÉGLEMENTAIRE */}
        {activeSubTab === 'ingest' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Analyseur Automatique de Nouveau Dispositif ou Texte Réglementaire
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Collez le texte officiel d'une nouvelle délibération, d'un appel à projets de l'ADEC ou d'un décret territorial. L'analyseur extrait automatiquement les critères d'éligibilité, taux, planchers et plafonds et l'intègre au moteur de diagnostic.
              </p>
            </div>

            {ingestStatus && (
              <div
                className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                  ingestStatus.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border border-red-200 text-red-900'
                }`}
              >
                {ingestStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{ingestStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleAutoIngest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Intitulé officiel de la nouvelle mesure
                  </label>
                  <input
                    type="text"
                    required
                    value={ingestTitle}
                    onChange={(e) => setIngestTitle(e.target.value)}
                    placeholder="Ex: Mesure d'aide à la Décarbonation et Transition Bleue 2026"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:ring-1 focus:ring-prune-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Catégorie / Rattachement
                  </label>
                  <select
                    value={ingestCategory}
                    onChange={(e) => setIngestCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                  >
                    <option value="Base Personnalisée">Nouvelle Base Réglementaire Additionnelle</option>
                    <option value="Guide des Aides - Évaluation Qualitative">
                      Guide des Aides ADEC (Soumis à l'évaluation qualitative 21/177 AC)
                    </option>
                    <option value="Pattu Risilienzia è Territorii">
                      Pattu Risilienzia è Territorii (Non soumis à l'évaluation qualitative)
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Texte intégral ou extrait du règlement / appel à projet
                </label>
                <textarea
                  rows={8}
                  required
                  value={ingestRawText}
                  onChange={(e) => setIngestRawText(e.target.value)}
                  placeholder="Collez ici les articles du dispositif (Objectifs, Bénéficiaires, Exclusions, Dépenses éligibles, Taux d'intensité max 70% pour TPE, Plafond 300 000 euros, assise de minimis)..."
                  className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-prune-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-prune-600 hover:bg-aubergine-600 text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Analyser et Intégrer au Moteur d’Éligibilité
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUB-TAB 3 : IMPORT / EXPORT JSON */}
        {activeSubTab === 'import_export' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                <Upload className="w-4 h-4 text-neutral-600" />
                Importer une Base Documentaire (JSON)
              </div>
              <p className="text-xs text-neutral-500">
                Collez un export JSON de règles pour charger de nouveaux dispositifs ou remplacer le catalogue actif.
              </p>

              {importStatus && (
                <div
                  className={`p-3 rounded-lg text-xs ${
                    importStatus.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {importStatus.message}
                </div>
              )}

              <textarea
                rows={8}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Collez votre code JSON ici..."
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-prune-500"
              />

              <button
                onClick={handleJsonImport}
                className="w-full py-2 bg-prune-600 text-white text-xs font-semibold rounded-full hover:bg-aubergine-600 transition"
              >
                Valider et Importer les Données
              </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
                  <Download className="w-4 h-4 text-neutral-600" />
                  Exporter la Base Active (JSON)
                </div>
                <p className="text-xs text-neutral-500">
                  Sauvegardez l'intégralité des bases documentaires actuellement actives, incluant les règles officielles et vos dispositifs ajoutés.
                </p>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Total des bases :</span>
                    <span className="font-bold text-neutral-900">{databases.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total des dispositifs modélisés :</span>
                    <span className="font-bold text-neutral-900">{allActiveSchemes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format :</span>
                    <span className="font-mono text-neutral-700">JSON v2026.1</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadExport}
                className="w-full py-2 bg-prune-600 hover:bg-aubergine-600 text-white text-xs font-bold rounded-full transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                Télécharger le Fichier d'Exportation JSON
              </button>
            </div>
          </div>
        )}

        {/* Modal inspect */}
        <DispositifDetailModal
          scheme={selectedSchemeForModal}
          onClose={() => setSelectedSchemeForModal(null)}
        />
      </div>
    </div>
  );
};
