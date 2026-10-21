/**
 * Modale d'Export PDF & Synthèse pour la Communication
 * Guide des Aides de l'ADEC & U Pattu Risilienzia è Territorii (Version 2026)
 */

import React, { useState } from 'react';
import { DispositifScheme } from '../../types';
import { generateGuideAidesHtml, downloadGuideAidesHtmlFile } from '../../utils/exportGuideAidesPdf';
import { Printer, Download, X, CheckCircle2, BookOpen } from 'lucide-react';

interface ExportGuideAidesModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemes: DispositifScheme[];
}

export const ExportGuideAidesModal: React.FC<ExportGuideAidesModalProps> = ({
  isOpen,
  onClose,
  schemes
}) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'ANNEXE1' | 'GUIDE2026'>('ALL');

  if (!isOpen) return null;

  const filteredSchemes = schemes.filter(s => {
    if (activeCategory === 'ANNEXE1') return s.category === 'Pattu Risilienzia è Territorii';
    if (activeCategory === 'GUIDE2026') return s.category !== 'Pattu Risilienzia è Territorii';
    return true;
  });

  const handleDownload = () => {
    const { fileName } = downloadGuideAidesHtmlFile(filteredSchemes);
    setDownloadNotice(`Fiches téléchargées : « ${fileName} ». Ouvrez le fichier dans un navigateur puis imprimez-le en PDF.`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Export PDF · Fiches dispositifs
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Synthèse Communication
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Une page par dispositif, au format de la fiche de communication ADEC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium">Périmètre de l'export :</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveCategory('ALL')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  activeCategory === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous ({schemes.length} fiches)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('ANNEXE1')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  activeCategory === 'ANNEXE1' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Annexe 1 : Risilienzia (4)
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('GUIDE2026')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  activeCategory === 'GUIDE2026' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Guide 2026 : Éval. Qual. (12)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-98"
              title="Générer et ouvrir l'aperçu avant impression pour enregistrement en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF Direct</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold transition"
              title="Télécharger le fichier autonome au format HTML/PDF complet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger (HTML)</span>
            </button>
          </div>
        </div>

        {downloadNotice && (
          <div className="p-3 bg-emerald-950/80 border-b border-emerald-800 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Aperçu : le document exact qui sera imprimé (une page A4 par dispositif) */}
        <div className="bg-slate-950/70 flex-1 min-h-0">
          <iframe
            title="Aperçu des fiches dispositifs"
            srcDoc={generateGuideAidesHtml(filteredSchemes)}
            className="w-full h-[65vh] border-0 bg-slate-200"
          />
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger les fiches (HTML)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
