/**
 * Modale d'export des fiches dispositifs (une page A4 par dispositif)
 * Guide des Aides de l'ADEC & U Pattu Risilienzia è Territorii (Version 2026)
 */

import React, { useState } from 'react';
import { DispositifScheme } from '../../types';
import { generateGuideAidesHtml, downloadGuideAidesHtmlFile } from '../../utils/exportGuideAidesPdf';
import { Printer, Download } from 'lucide-react';
import { Modal, Notice, SegmentedControl, btn } from '../Layout/ui';

interface ExportGuideAidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemes: DispositifScheme[];
}

type ExportScope = 'ALL' | 'ANNEXE1' | 'GUIDE2026';

export const ExportGuideAidesModal: React.FC<ExportGuideAidesModalProps> = ({
  isOpen,
  onClose,
  schemes
}) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ExportScope>('ALL');

  if (!isOpen) return null;

  const inScope = (s: DispositifScheme, scope: ExportScope) => {
    if (scope === 'ANNEXE1') return s.category === 'Pattu Risilienzia è Territorii';
    if (scope === 'GUIDE2026') return s.category !== 'Pattu Risilienzia è Territorii';
    return true;
  };
  const filteredSchemes = schemes.filter((s) => inScope(s, activeCategory));
  const countFor = (scope: ExportScope) => schemes.filter((s) => inScope(s, scope)).length;

  const handleDownload = () => {
    const { fileName } = downloadGuideAidesHtmlFile(filteredSchemes);
    setDownloadNotice(`Fiches téléchargées : « ${fileName} ». Ouvrir le fichier dans un navigateur puis l’imprimer en PDF.`);
    setTimeout(() => setDownloadNotice(null), 6000);
  };

  const handlePrint = () => {
    try {
      const htmlContent = generateGuideAidesHtml(filteredSchemes);
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch {
            handleDownload();
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 2000);
          }
        }, 350);
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <Modal
      size="xl"
      title="Exporter les fiches dispositifs"
      subtitle="Une page par dispositif, au format de la fiche de communication ADEC."
      onClose={onClose}
      bodyClassName=""
      footer={
        <>
          <span className="text-xs text-neutral-500">{filteredSchemes.length} fiche{filteredSchemes.length > 1 ? 's' : ''} dans l’export</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={btn('secondary')}>
              Fermer
            </button>
            <button type="button" onClick={handleDownload} className={btn('secondary')} title="Télécharger le fichier autonome (HTML imprimable)">
              <Download className="w-3.5 h-3.5" />
              Télécharger (HTML)
            </button>
            <button type="button" onClick={handlePrint} className={btn('primary')} title="Ouvrir l'impression du navigateur (enregistrement en PDF possible)">
              <Printer className="w-3.5 h-3.5" />
              Imprimer / PDF
            </button>
          </div>
        </>
      }
    >
      <div className="px-4 py-2.5 border-b border-neutral-200 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-500">Périmètre :</span>
        <SegmentedControl
          ariaLabel="Périmètre de l'export"
          value={activeCategory}
          onChange={setActiveCategory}
          options={[
            { value: 'ALL', label: `Tous (${countFor('ALL')})` },
            { value: 'ANNEXE1', label: `Annexe 1 · Risilienza (${countFor('ANNEXE1')})` },
            { value: 'GUIDE2026', label: `Guide 2026 (${countFor('GUIDE2026')})` }
          ]}
        />
      </div>

      {downloadNotice && (
        <div className="px-4 pt-3">
          <Notice tone="success">{downloadNotice}</Notice>
        </div>
      )}

      {/* Aperçu : le document exact qui sera imprimé (une page A4 par dispositif) */}
      <div className="p-4 bg-neutral-100">
        <iframe
          title="Aperçu des fiches dispositifs"
          srcDoc={generateGuideAidesHtml(filteredSchemes)}
          className="w-full h-[62vh] border border-neutral-200 rounded-md bg-white"
        />
      </div>
    </Modal>
  );
};
