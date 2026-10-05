/**
 * Modale d'Export PDF & Synthèse pour la Communication
 * Guide des Aides de l'ADEC & U Pattu Risilienzia è Territorii (Version 2026)
 */

import React, { useState } from 'react';
import { DispositifScheme } from '../../types';
import { QUALITATIVE_EVALUATION_QUESTIONS } from '../../data/adecOfficialData';
import { generateGuideAidesHtml, downloadGuideAidesHtmlFile } from '../../utils/exportGuideAidesPdf';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

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
    setDownloadNotice(`Le recueil complet des fiches d'aides a été téléchargé avec succès : "${fileName}". Prêt à imprimer ou à convertir en PDF haute définition.`);
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

  const editionDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

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
                  Export PDF · Recueil des Fiches d'Aides ADEC 2026
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Synthèse Communication
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Document institutionnel récapitulant les 16 dispositifs et la grille des 8 critères (Délibération N° 21/177 AC)
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
              <span>Télécharger le Fichier</span>
            </button>
          </div>
        </div>

        {downloadNotice && (
          <div className="p-3 bg-emerald-950/80 border-b border-emerald-800 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {/* Viewport de Prévisualisation Haute Définition */}
        <div className="p-4 sm:p-6 bg-slate-950/70 overflow-y-auto flex-1">
          <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto border border-slate-200 space-y-6 printable-document">
            
            {/* Page de garde synthétique */}
            <div className="text-center p-6 border-2 border-[#000091] rounded-xl bg-slate-50/60 space-y-3">
              <div className="inline-flex items-center gap-1 mb-1">
                <span className="w-2.5 h-6 bg-[#000091] inline-block rounded-xs" />
                <span className="w-2.5 h-6 bg-white border border-slate-300 inline-block rounded-xs" />
                <span className="w-2.5 h-6 bg-[#e1000f] inline-block rounded-xs" />
                <div className="ml-1 leading-none text-left">
                  <div className="text-[9px] font-black uppercase text-[#000091]">Collectivité de Corse · Cullettività di Corsica</div>
                  <div className="text-[8px] font-bold text-[#e1000f]">Agence de Développement Économique de la Corse (ADEC)</div>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                Recueil & Fiches de Synthèse des Dispositifs d'Aides 2026
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-sky-800 max-w-2xl mx-auto">
                Synthèse opérationnelle destinée à la communication, aux dossiers d'information économique et aux partenaires institutionnels
              </p>

              <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-[11px] font-medium text-slate-600">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">{filteredSchemes.length} Dispositifs d'aides</span>
                <span>·</span>
                <span>Édité le {editionDate}</span>
                <span>·</span>
                <span className="font-mono text-slate-500">Délibération N° 21/177 AC</span>
              </div>
            </div>

            {/* Tableau récapitulatif sommaire */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#000091] border-b-2 border-[#000091] pb-1 mb-3">
                1. Tableau Récapitulatif des Mesures d'Intervention ({filteredSchemes.length} fiches)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px]">
                      <th className="p-2 text-left w-16">Code</th>
                      <th className="p-2 text-left">Dispositif & Intitulé</th>
                      <th className="p-2 text-left">Volet Réglementaire</th>
                      <th className="p-2 text-left">Taux Max TPE</th>
                      <th className="p-2 text-left">Plafond</th>
                      <th className="p-2 text-left">Grille Qualit.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchemes.map((s, idx) => (
                      <tr key={s.id} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}>
                        <td className="p-2 font-mono font-bold text-[#000091]">{s.code}</td>
                        <td className="p-2">
                          <strong className="text-slate-900 block">{s.name}</strong>
                          <span className="text-[10px] text-slate-500">{s.allowedSizes.join(', ')} · {s.allowedSectors.slice(0, 3).join(', ')}</span>
                        </td>
                        <td className="p-2 text-slate-600 text-[10px]">
                          {s.category === 'Pattu Risilienzia è Territorii' ? 'Annexe 1 · U Pattu Risilienzia' : 'Guide 2026 (Délib. 21/177 AC)'}
                        </td>
                        <td className="p-2 font-bold text-emerald-700">
                          {s.rates.tpeMaxRate ? `${Math.round(s.rates.tpeMaxRate * 100)} %` : s.rates.flatAmount ? 'Forfait' : 'Variable'}
                        </td>
                        <td className="p-2 font-mono font-bold text-slate-800">
                          {s.rates.ceilingAmount ? `${s.rates.ceilingAmount.toLocaleString('fr-FR')} €` : 'Selon barème'}
                        </td>
                        <td className="p-2 font-bold text-[10px]">
                          {s.requiresQualitativeEvaluation ? (
                            <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">≥ 3 OUI</span>
                          ) : (
                            <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Directe</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Méthodologie des 8 critères */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wider text-[11px]">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Rappel de la Grille Qualitative (Délibération N° 21/177 AC · Page 28)</span>
              </div>
              <p className="text-[11px] text-amber-950 leading-relaxed">
                Pour l'ensemble des mesures relevant du Guide des Aides 2026, l'accès à l'instruction financière par l'ADEC requiert d'obtenir <strong>au moins 3 « OUI » sur les 8 critères d'évaluation qualitative</strong> (modèle de développement corse, valeur ajoutée non délocalisable, transition écologique, innovation, etc.). Les 4 mesures du Pattu Risilienzia è Territorii en sont expressément exemptées.
              </p>
            </div>

            {/* Fiches détaillées sélectionnées */}
            <div className="space-y-6 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#000091] border-b-2 border-[#000091] pb-1">
                2. Fiches Synthétiques Détaillées par Dispositif
              </h3>

              {filteredSchemes.map((scheme, idx) => (
                <div key={scheme.id} className="border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 bg-white shadow-2xs">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-50 text-[#000091] border border-blue-200">
                          {scheme.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {scheme.category === 'Pattu Risilienzia è Territorii' ? 'Annexe 1 · Risilienzia' : 'Guide des Aides 2026'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {scheme.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {scheme.subtitle}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                        {scheme.sourceDocumentPages}
                      </span>
                    </div>
                  </div>

                  {/* Bandeau intensité et plafond */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Taux Max TPE</span>
                      <strong className="text-emerald-700">
                        {scheme.rates.tpeMaxRate ? `${Math.round(scheme.rates.tpeMaxRate * 100)} %` : scheme.rates.flatAmount ? 'Forfait' : 'Variable'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Plafond</span>
                      <strong className="text-slate-800">
                        {scheme.rates.ceilingAmount ? `${scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €` : 'Selon barème'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Plancher Min.</span>
                      <span className="text-slate-700">{scheme.rates.floorAmount ? `${scheme.rates.floorAmount.toLocaleString('fr-FR')} €` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Évaluation</span>
                      <span className="font-semibold text-slate-800">{scheme.requiresQualitativeEvaluation ? '≥ 3 OUI requis' : 'Directe'}</span>
                    </div>
                  </div>

                  {/* Objectif */}
                  <div className="text-xs text-slate-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg border-l-3 border-[#000091]">
                    <strong>Objectif opérationnel : </strong>{scheme.objective}
                  </div>

                  {/* 2 Colonnes Bénéficiaires & Dépenses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                      <strong className="text-slate-900 block text-xs">Publics & Bénéficiaires</strong>
                      <p className="text-slate-600">{scheme.targetBeneficiariesSummary}</p>
                      <div className="text-slate-700 pt-1">
                        <strong>Tailles : </strong>{scheme.allowedSizes.join(', ')}<br />
                        <strong>Secteurs : </strong>{scheme.allowedSectors.slice(0, 4).join(', ')}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                      <strong className="text-slate-900 block text-xs">Dépenses Finançables</strong>
                      <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                        {scheme.eligibleExpenseCategories.slice(0, 4).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Modalités */}
                  <div className="p-2.5 bg-slate-100 rounded-lg text-[10px] text-slate-600 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <strong>Dépôt en ligne : </strong>{scheme.procedure.portalUrl} · <strong>Décision : </strong>{scheme.procedure.decisionBody}
                    </div>
                    <span className="font-mono text-slate-500">Contrôle sur {scheme.procedure.controlDurationYears} ans</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer document */}
            <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Collectivité de Corse · Agence de Développement Économique de la Corse · Document de synthèse officiel pour la communication
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger le Recueil Complet (HTML/PDF)</span>
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
