/**
 * Gestionnaire de Bases Documentaires & Analyseur Réglementaire
 * Permet d'analyser d'autres dispositifs et de se mettre à jour automatiquement
 * lors de l'ajout de nouvelles bases de données documentaires.
 */

import React, { useState } from 'react';
import { useDatabases } from '../../context/DatabaseContext';
import { DispositifScheme } from '../../types';
import { DispositifDetailModal } from '../Results/DispositifDetailModal';
import { shortCategoryLabel } from '../DocumentaryExplorer/DocumentaryExplorerView';
import { PageHeader } from '../Layout/PageHeader';
import { TabButton } from '../Layout/TabButton';
import { Badge, Notice, Panel, SegmentedControl, btn, iconBtnDanger, inputClass, inputSmClass, labelClass, pageContainer } from '../Layout/ui';
import { Upload, Download, RotateCcw, Trash2, Search } from 'lucide-react';

const formatRate = (rate?: number) => (rate ? `${Math.round(rate * 100)} %` : '–');

export const DatabaseManagerView: React.FC = () => {
  const {
    databases,
    allActiveSchemes,
    selectedDatabaseId,
    setSelectedDatabaseId,
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

  /** Changement d'onglet : le message de la dernière intégration n'est plus pertinent */
  const goToTab = (tab: typeof activeSubTab) => {
    setActiveSubTab(tab);
    setIngestStatus(null);
  };

  const handleAutoIngest = (e: React.FormEvent) => {
    e.preventDefault();
    setIngestStatus(null);
    const res = autoIngestRegulatoryText(ingestTitle, ingestRawText, ingestCategory);
    if (res.success && res.scheme) {
      setIngestStatus({
        success: true,
        message: `Dispositif « ${res.scheme.name} » analysé et intégré au moteur de règles (code attribué : ${res.scheme.code}).`
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
      setImportStatus({ success: false, message: 'Coller un export JSON valide.' });
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
      <PageHeader
        title="Textes officiels"
        description="Bases documentaires du moteur d’éligibilité : consultation des dispositifs, intégration d’un nouveau texte, import et export."
        actions={
          <button onClick={resetToOfficial} title="Restaurer la base officielle ADEC 2026" className={btn('secondary')}>
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser la base officielle
          </button>
        }
        tabs={
          <>
            <TabButton active={activeSubTab === 'schemes'} onClick={() => goToTab('schemes')}>
              Dispositifs référencés
              <span className="text-xs text-neutral-400 font-normal">{allActiveSchemes.length}</span>
            </TabButton>
            <TabButton active={activeSubTab === 'ingest'} onClick={() => goToTab('ingest')}>
              Intégrer un texte réglementaire
            </TabButton>
            <TabButton active={activeSubTab === 'import_export'} onClick={() => goToTab('import_export')}>
              Import / export JSON
            </TabButton>
          </>
        }
      />

      <div className={`${pageContainer} py-5 space-y-4`}>
        {/* Sélecteur des bases actives */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-500">Bases actives :</span>
          <SegmentedControl
            ariaLabel="Bases actives"
            value={selectedDatabaseId}
            onChange={setSelectedDatabaseId}
            options={[
              { value: 'ALL', label: `Toutes (${databases.reduce((n, db) => n + db.schemes.length, 0)})` },
              ...databases.map((db) => ({
                value: db.id,
                label: `${db.title} (${db.schemes.length})`,
                title: db.isOfficialBase ? 'Base officielle' : undefined
              }))
            ]}
          />
        </div>

        {ingestStatus?.success && activeSubTab === 'schemes' && (
          <Notice tone="success">{ingestStatus.message}</Notice>
        )}

        {/* Onglet 1 : dispositifs référencés */}
        {activeSubTab === 'schemes' && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative w-full sm:max-w-sm">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Mot clé, code ou objectif…"
                  className={`${inputClass} pl-8`}
                />
              </div>
              <span className="text-xs text-neutral-500">
                {filteredSchemes.length} dispositif{filteredSchemes.length > 1 ? 's' : ''} affiché{filteredSchemes.length > 1 ? 's' : ''}
              </span>
            </div>

            <Panel bodyClassName="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
                    <th className="py-2 px-4 font-medium">Code & nom</th>
                    <th className="py-2 px-3 font-medium">Catégorie & source</th>
                    <th className="py-2 px-3 font-medium">Éval. qual.</th>
                    <th className="py-2 px-3 font-medium">Taux TPE / PE</th>
                    <th className="py-2 px-3 font-medium text-right">Plafond</th>
                    <th className="py-2 px-3 font-medium text-center">Statut</th>
                    <th className="py-2 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredSchemes.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50 align-top">
                      <td className="py-2.5 px-4">
                        <div className="font-mono text-neutral-500">{s.code}</div>
                        <div className="font-medium text-neutral-900">{s.name}</div>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">
                        <span className="block">{shortCategoryLabel(s.category)}</span>
                        <span className="text-[11px] text-neutral-400">{s.sourceDocumentPages}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {s.requiresQualitativeEvaluation ? <Badge>≥ 3 OUI</Badge> : <Badge tone="info">Non requise</Badge>}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-neutral-700">
                        {s.rates.tpeMaxRate
                          ? `${formatRate(s.rates.tpeMaxRate)} / ${formatRate(s.rates.peMaxRate)}`
                          : s.rates.flatAmount
                            ? s.rates.flatAmount.label
                            : 'Selon barème'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-medium text-neutral-900">
                        {s.rates.ceilingAmount.toLocaleString('fr-FR')} €
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSchemeActive(s.id)}
                          title={s.isActive ? 'Désactiver ce dispositif' : 'Activer ce dispositif'}
                          className="cursor-pointer"
                        >
                          {s.isActive ? <Badge tone="success">Actif</Badge> : <Badge>Désactivé</Badge>}
                        </button>
                      </td>
                      <td className="py-2 px-4 text-right whitespace-nowrap">
                        <button type="button" onClick={() => setSelectedSchemeForModal(s)} className={btn('ghost', 'sm')}>
                          Détails
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteScheme(s.id)}
                          className={iconBtnDanger}
                          title="Supprimer le dispositif"
                          aria-label={`Supprimer ${s.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
          </>
        )}

        {/* Onglet 2 : intégration d'un texte réglementaire */}
        {activeSubTab === 'ingest' && (
          <Panel
            title="Analyser un nouveau dispositif ou texte réglementaire"
            description="Coller le texte d’une délibération, d’un appel à projets ou d’un règlement : critères d’éligibilité, taux, planchers et plafonds sont extraits puis intégrés au moteur."
          >
            {ingestStatus && !ingestStatus.success && <Notice tone="danger">{ingestStatus.message}</Notice>}

            <form onSubmit={handleAutoIngest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ingest-title" className={labelClass}>
                    Intitulé officiel de la mesure
                  </label>
                  <input
                    id="ingest-title"
                    type="text"
                    required
                    value={ingestTitle}
                    onChange={(e) => setIngestTitle(e.target.value)}
                    placeholder="Ex : Mesure d’aide à la décarbonation 2026"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="ingest-category" className={labelClass}>
                    Rattachement
                  </label>
                  <select
                    id="ingest-category"
                    value={ingestCategory}
                    onChange={(e) => setIngestCategory(e.target.value as any)}
                    className={inputClass}
                  >
                    <option value="Base Personnalisée">Nouvelle base réglementaire additionnelle</option>
                    <option value="Guide des Aides - Évaluation Qualitative">Guide des aides ADEC (soumis à l’évaluation qualitative 21/177 AC)</option>
                    <option value="Pattu Risilienzia è Territorii">Pattu Risilienzia è Territorii (non soumis à l’évaluation qualitative)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ingest-text" className={labelClass}>
                  Texte intégral ou extrait du règlement / appel à projets
                </label>
                <textarea
                  id="ingest-text"
                  rows={10}
                  required
                  value={ingestRawText}
                  onChange={(e) => setIngestRawText(e.target.value)}
                  placeholder="Objectifs, bénéficiaires, exclusions, dépenses éligibles, taux d’intensité (ex. 70 % pour les TPE), plafond (ex. 300 000 €), régime de minimis…"
                  className={`${inputSmClass} font-mono leading-relaxed`}
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className={btn('primary')}>
                  Analyser et intégrer au moteur
                </button>
              </div>
            </form>
          </Panel>
        )}

        {/* Onglet 3 : import / export JSON */}
        {activeSubTab === 'import_export' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Importer une base (JSON)" icon={Upload} description="Charger de nouveaux dispositifs ou remplacer le catalogue actif.">
              {importStatus && <Notice tone={importStatus.success ? 'success' : 'danger'}>{importStatus.message}</Notice>}
              <textarea
                rows={9}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Coller l’export JSON ici…"
                aria-label="Contenu JSON à importer"
                className={`${inputSmClass} font-mono`}
              />
              <div className="flex justify-end">
                <button type="button" onClick={handleJsonImport} className={btn('primary')}>
                  Valider et importer
                </button>
              </div>
            </Panel>

            <Panel
              title="Exporter la base active (JSON)"
              icon={Download}
              description="Sauvegarde de toutes les bases actives : règles officielles et dispositifs ajoutés."
            >
              <dl className="text-xs divide-y divide-neutral-100 border border-neutral-200 rounded-md">
                <div className="flex justify-between px-3 py-2">
                  <dt className="text-neutral-500">Bases</dt>
                  <dd className="font-medium text-neutral-900">{databases.length}</dd>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <dt className="text-neutral-500">Dispositifs modélisés</dt>
                  <dd className="font-medium text-neutral-900">{allActiveSchemes.length}</dd>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <dt className="text-neutral-500">Format</dt>
                  <dd className="font-mono text-neutral-700">JSON v2026.1</dd>
                </div>
              </dl>
              <div className="flex justify-end">
                <button type="button" onClick={handleDownloadExport} className={btn('primary')}>
                  <Download className="w-3.5 h-3.5" />
                  Télécharger l’export
                </button>
              </div>
            </Panel>
          </div>
        )}

        <DispositifDetailModal scheme={selectedSchemeForModal} onClose={() => setSelectedSchemeForModal(null)} />
      </div>
    </div>
  );
};
