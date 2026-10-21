/**
 * Dépôt d'une Fiche Projet ADEC (PDF OpenSub) : lecture exacte, synthèse et pré-remplissage du simulateur.
 * Le document est traité en mémoire côté serveur, rien n'est stocké.
 * Sans fiche : zone de dépôt (à placer dans un Panel) ; avec fiche : bandeau de rappel.
 */

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Check, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { AnalyseFicheProjetResponse } from '../../types/ficheProjet';
import { btn, Notice } from '../Layout/ui';

interface ProjectSheetPreloaderProps {
  dossier: AnalyseFicheProjetResponse | null;
  onFicheAnalysee: (analyse: AnalyseFicheProjetResponse) => void;
  onRemoveDossier: () => void;
  /** Zone de dépôt sur une ligne (simulation saisie manuellement) */
  compact?: boolean;
}

const ETAPES_ANALYSE = [
  'Lecture du PDF en mémoire (aucun stockage)',
  'Extraction des rubriques de la fiche et contrôles de cohérence',
  'Rédaction de la synthèse du projet'
];

export const ProjectSheetPreloader: React.FC<ProjectSheetPreloaderProps> = ({ dossier, onFicheAnalysee, onRemoveDossier, compact = false }) => {
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
      <div className="bg-white border border-neutral-200 rounded-md px-4 py-3 space-y-2" aria-live="polite">
        <p className="flex items-center gap-2 text-sm min-w-0">
          <Loader2 className="w-4 h-4 animate-spin text-prune-700 shrink-0" />
          <span className="font-medium text-neutral-900">Analyse de la fiche projet…</span>
          <span className="text-xs text-neutral-500 truncate">{fileName}</span>
        </p>
        <ol className="space-y-1 text-xs pl-6">
          {ETAPES_ANALYSE.map((label, idx) => (
            <li
              key={label}
              className={`flex items-center gap-2 ${
                idx < etape ? 'text-neutral-500' : idx === etape ? 'text-neutral-900 font-medium' : 'text-neutral-400'
              }`}
            >
              {idx < etape ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : idx === etape ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-prune-700" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 inline-block" />
              )}
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
      <div className="bg-white border border-neutral-200 rounded-md px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {fiche.entreprise.raisonSociale || 'Entreprise'}
              {fiche.projet.libelle && <span className="font-normal text-neutral-500"> — {fiche.projet.libelle}</span>}
            </p>
            <p className="text-[11px] text-neutral-500 truncate">
              Fiche projet{fiche.dossierNumero ? ` n° ${fiche.dossierNumero}` : ''} · {dossier.sourceDocumentName} · simulation pré-remplie
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemoveDossier}
          title="Retirer la fiche projet et repartir d'une simulation vierge"
          className={`${btn('ghost', 'sm')} self-start sm:self-auto`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Retirer la fiche
        </button>
      </div>
    );
  }

  // Aucune fiche : zone de dépôt
  const openFilePicker = () => fileInputRef.current?.click();
  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFilePicker();
          }
        }}
        className={`border border-dashed rounded-md cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-prune-600 ${
          isDragging ? 'border-prune-600 bg-prune-50' : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-white'
        } ${compact ? 'px-3 py-2.5 flex items-center gap-2.5' : 'px-4 py-6 text-center'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => { if (e.target.files?.length) processUploadedFile(e.target.files[0]); }}
          className="hidden"
        />
        <UploadCloud className={`text-neutral-400 shrink-0 ${compact ? 'w-4 h-4' : 'w-5 h-5 mx-auto'}`} />
        {compact ? (
          <span className="text-xs text-neutral-600">
            <span className="font-medium text-neutral-800">Déposer une fiche projet (PDF)</span> pour pré-remplir la simulation et obtenir la synthèse du projet
          </span>
        ) : (
          <>
            <p className="mt-2 text-sm text-neutral-700">
              <span className="font-medium text-neutral-900">Déposer la fiche projet (PDF)</span> ou{' '}
              <span className="text-prune-700 underline underline-offset-2">choisir un fichier</span>
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">Export OpenSub de la fiche projet ADEC · lu en mémoire, aucun document conservé</p>
          </>
        )}
      </div>

      {errorMessage && (
        <Notice
          tone="warning"
          action={
            lastFileRef.current && (
              <button type="button" onClick={() => processUploadedFile(lastFileRef.current!)} className={btn('secondary', 'sm')}>
                <RefreshCw className="w-3 h-3" />
                Réessayer
              </button>
            )
          }
        >
          {errorMessage}
        </Notice>
      )}
    </div>
  );
};
