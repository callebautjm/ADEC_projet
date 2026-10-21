/**
 * Dépôt d'une Fiche Projet ADEC (PDF OpenSub) : lecture exacte, synthèse et pré-remplissage du simulateur.
 * Le document est traité en mémoire côté serveur, rien n'est stocké.
 */

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { AnalyseFicheProjetResponse } from '../../types/ficheProjet';

interface ProjectSheetPreloaderProps {
  dossier: AnalyseFicheProjetResponse | null;
  onFicheAnalysee: (analyse: AnalyseFicheProjetResponse) => void;
  onRemoveDossier: () => void;
}

const ETAPES_ANALYSE = [
  'Lecture du PDF en mémoire (aucun stockage)',
  'Extraction des rubriques de la fiche et contrôles de cohérence',
  'Rédaction de la synthèse du projet'
];

export const ProjectSheetPreloader: React.FC<ProjectSheetPreloaderProps> = ({ dossier, onFicheAnalysee, onRemoveDossier }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [etape, setEtape] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);

  const processUploadedFile = async (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);
    lastFileRef.current = file;
    setIsAnalyzing(true);
    setEtape(0);

    const timers = [setTimeout(() => setEtape(1), 600), setTimeout(() => setEtape(2), 1400)];
    try {
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/dossier/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, fileName: file.name })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || `Erreur serveur (${response.status}) lors de l’analyse de la fiche.`);
      }
      onFicheAnalysee(body as AnalyseFicheProjetResponse);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Impossible d’analyser le document.');
    } finally {
      timers.forEach(clearTimeout);
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) processUploadedFile(e.dataTransfer.files[0]);
  };

  // Analyse en cours
  if (isAnalyzing) {
    return (
      <div className="bg-white border-2 border-prune-500/80 rounded-2xl p-5 shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-prune-600 text-white flex items-center justify-center animate-pulse">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Analyse de la fiche projet…</h3>
            <span className="text-xs text-neutral-500">{fileName}</span>
          </div>
        </div>
        <ol className="space-y-1.5">
          {ETAPES_ANALYSE.map((label, idx) => (
            <li
              key={label}
              className={`flex items-center gap-2 text-xs p-2 rounded-lg border ${
                idx < etape ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : idx === etape ? 'bg-prune-50 border-prune-300 text-prune-950 font-semibold'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-400'
              }`}
            >
              {idx < etape ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                : idx === etape ? <Loader2 className="w-3.5 h-3.5 animate-spin text-prune-600" />
                : <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 inline-block" />}
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // Fiche chargée : bandeau compact (la synthèse est affichée à l'étape 0)
  if (dossier) {
    const { fiche } = dossier;
    return (
      <div className="bg-prune-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-prune-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-prune-800/80 border border-prune-500/40 text-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              Fiche projet{fiche.dossierNumero ? ` n° ${fiche.dossierNumero}` : ''} · simulateur pré-rempli
            </span>
            <h2 className="text-sm sm:text-base font-bold truncate">
              {fiche.entreprise.raisonSociale || 'Entreprise'}
              {fiche.projet.libelle && <span className="font-normal text-prune-200"> — {fiche.projet.libelle}</span>}
            </h2>
            <span className="text-[11px] text-prune-300">{dossier.sourceDocumentName}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemoveDossier}
          title="Retirer la fiche projet et repartir d'un simulateur vierge"
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium border border-white/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-300" />
          <span>Retirer la fiche</span>
        </button>
      </div>
    );
  }

  // Aucune fiche : zone de dépôt
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
          Vous disposez d’une fiche projet ADEC ?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-3xl leading-relaxed">
          Déposez-la pour obtenir une synthèse du projet et pré-remplir toutes les étapes. Sinon, saisissez simplement le SIRET à l’étape 1 :
          le simulateur fonctionnera sans synthèse de projet.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition ${
          isDragging ? 'border-prune-600 bg-prune-50/80' : 'border-safran-300 hover:border-prune-500 hover:bg-prune-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => { if (e.target.files?.length) processUploadedFile(e.target.files[0]); }}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-3 text-xs sm:text-sm">
          <div className="w-12 h-12 rounded-full bg-prune-600 text-white flex items-center justify-center shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span>
            <strong className="text-neutral-900">Glissez-déposez la fiche projet (PDF)</strong>
            <span className="text-neutral-500"> ou <strong className="text-prune-700 underline font-medium">parcourez vos fichiers</strong></span>
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          {lastFileRef.current && (
            <button
              type="button"
              onClick={() => processUploadedFile(lastFileRef.current!)}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px] hover:bg-amber-700 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Réessayer</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
