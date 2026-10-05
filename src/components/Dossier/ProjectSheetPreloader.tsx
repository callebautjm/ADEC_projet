/**
 * Accélérateur Fiche Projet - Simulateur Unique ADEC 2026
 * Collectivité de Corse / Agence de Développement Économique de la Corse
 *
 * Rôle exclusif :
 * 1. Analyse sécurisée du document en mémoire vive (RAM) (aucun stockage disque).
 * 2. Détection de la section "Appel à projet" (dispositif prioritaire cible).
 * 3. Préremplissage automatique et transparent des 5 étapes du simulateur unique.
 * 4. Déclenchement de la simulation et des propositions d'intervention officielles.
 */

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  Search,
  Building2,
  Trash2,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { DossierProjectAnalysis, FullQuestionnaireState } from '../../types';

interface ProjectSheetPreloaderProps {
  questionnaireState: FullQuestionnaireState;
  activeDossier: DossierProjectAnalysis | null;
  onAnalysisComplete: (analysis: DossierProjectAnalysis) => void;
  onRemoveDossier: () => void;
  onRunImmediateEvaluation: () => void;
  apiToken?: string;
  recipientSiret?: string;
}

export const ProjectSheetPreloader: React.FC<ProjectSheetPreloaderProps> = ({
  questionnaireState,
  activeDossier,
  onAnalysisComplete,
  onRemoveDossier,
  onRunImmediateEvaluation,
  apiToken,
  recipientSiret
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);

  const analysisStepsLabels = [
    'Chargement sécurisé en mémoire vive (aucun stockage disque)',
    'Extraction des métadonnées & détection du numéro SIRET (14 chiffres)',
    'Consultation des registres légaux (API Entreprise, INSEE, DGFIP, URSSAF, RNE)',
    'Analyse des données d’entreprise et du programme d’investissement',
    'Détection de la section « Appel à projet » & préremplissage du simulateur'
  ];

  const processUploadedFile = async (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);
    lastFileRef.current = file;
    setIsAnalyzing(true);
    setAnalyzingStep(1);

    try {
      const reader = new FileReader();

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const fileBase64 = await base64Promise;

      const stepTimer1 = setTimeout(() => setAnalyzingStep(2), 1200);
      const stepTimer2 = setTimeout(() => setAnalyzingStep(3), 2600);
      const stepTimer3 = setTimeout(() => setAnalyzingStep(4), 4200);

      const response = await fetch('/api/dossier/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileBase64,
          fileName: file.name,
          fileMimeType: file.type || 'application/pdf',
          token: apiToken,
          recipient: recipientSiret
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setAnalyzingStep(5);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Erreur serveur (${response.status}) lors de l'analyse du document.`);
      }

      const resData = await response.json();
      if (!resData.success || !resData.analysis) {
        throw new Error('La réponse de l’analyseur ne contient pas les données attendues.');
      }

      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalysisComplete(resData.analysis);
      }, 600);

    } catch (err: any) {
      console.error('Erreur traitement fiche projet:', err);
      setIsAnalyzing(false);
      const rawMsg = err.message || '';
      if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand') || rawMsg.includes('temporaire')) {
        setErrorMessage('Forte demande temporaire sur les serveurs d’IA (Code 503). Le mode haute disponibilité est prêt : vous pouvez relancer l’analyse.');
      } else {
        setErrorMessage(rawMsg || 'Impossible d’analyser le document. Vérifiez le format (PDF recommandé).');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleLoadSample = async () => {
    setErrorMessage(null);
    setFileName('Exemple_Fiche_Projet_ADEC_Risilienza_2026.pdf');
    setIsAnalyzing(true);
    setAnalyzingStep(1);

    try {
      const stepTimer1 = setTimeout(() => setAnalyzingStep(2), 800);
      const stepTimer2 = setTimeout(() => setAnalyzingStep(3), 1600);
      const stepTimer3 = setTimeout(() => setAnalyzingStep(4), 2400);

      const response = await fetch('/api/dossier/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleDossierId: '11103',
          token: apiToken,
          recipient: recipientSiret,
          fileName: 'Exemple_Fiche_Projet_ADEC_Risilienza_2026.pdf'
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setAnalyzingStep(5);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la fiche projet exemple.');
      }

      const resData = await response.json();
      if (!resData.success || !resData.analysis) {
        throw new Error('Données exemple non disponibles.');
      }

      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalysisComplete(resData.analysis);
      }, 500);

    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err?.message || 'Erreur chargement exemple.');
    }
  };

  // CAS 1 : Analyse en cours
  if (isAnalyzing) {
    return (
      <div className="bg-white border-2 border-blue-500/80 rounded-2xl p-6 shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-pulse shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Analyse & pré-remplissage du simulateur en cours...
              </h3>
              <span className="text-xs text-slate-500 block">
                Document : {fileName || 'Fiche_Projet.pdf'} (RAM exclusive · aucun stockage)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Étape {analyzingStep}/5</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {analysisStepsLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isDone = analyzingStep > stepNum;
            const isCurr = analyzingStep === stepNum;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                    : isCurr
                    ? 'bg-blue-50/90 border-blue-300 text-blue-950 font-bold shadow-2xs'
                    : 'bg-slate-50/50 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurr
                      ? 'bg-blue-600 text-white animate-spin'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // CAS 2 : Fiche Projet active déjà chargée et synchronisée
  if (activeDossier || questionnaireState.dossierSource) {
    const ds = questionnaireState.dossierSource;
    const comp = questionnaireState.company;
    const proj = questionnaireState.financials;

    return (
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-blue-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-800/80 border border-blue-500/40 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Fiche Projet Active · Pré-remplissage Appliqué
                </span>
                <span className="text-xs text-blue-300 font-mono">
                  {ds?.dossierNumber || 'Dossier ADEC'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
                <span>{comp.name || 'Entreprise candidate'}</span>
                {comp.siret && (
                  <span className="text-xs text-blue-200 font-mono font-normal">
                    (SIRET {comp.siret})
                  </span>
                )}
                {comp.city && (
                  <span className="text-xs text-blue-300 font-medium">
                    · {comp.city}
                  </span>
                )}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-100/90 pt-0.5">
                <span>
                  Appel à projet ciblé : <strong className="text-amber-300">{ds?.primarySchemeName || ds?.aapTitre || 'Non spécifié'}</strong>
                </span>
                <span>·</span>
                <span>
                  Budget prévisionnel : <strong className="text-white font-mono">{proj.totalEstimatedBudgetHT.toLocaleString('fr-FR')} € HT</strong>
                </span>
                <span>·</span>
                <span className="text-emerald-300">
                  5 étapes préremplies
                </span>
              </div>
            </div>
          </div>

          {/* Boutons d'action unifiés */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onRunImmediateEvaluation}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Calculer les aides & interventions</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              type="button"
              onClick={onRemoveDossier}
              title="Retirer la fiche projet et revenir à la saisie manuelle libre"
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium transition border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-300" />
              <span>Retirer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CAS 3 : Aucune fiche projet active -> Bloc d'accélération fluide et élégant
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-blue-50/40 to-indigo-50/30 border-b border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Accélérateur de simulation (Optionnel)</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 font-medium">Pré-remplissage en 1 clic</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Vous disposez de votre Fiche Projet / Demande d'aide d'entreprise ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Déposez votre document pour préremplir automatiquement les 5 étapes du simulateur (entreprise, critères qualitatifs, programme d'investissement et budget). L'analyse s'effectue strictement en mémoire vive (RAM) de manière confidentielle.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-blue-900 font-semibold text-xs border border-blue-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Charger l'exemple ADEC</span>
            </button>
          </div>
        </div>

        {/* Zone de glisser-déposer compacte */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-600 bg-blue-50/80 scale-[0.99]'
              : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div className="text-center sm:text-left">
              <span className="font-bold text-slate-900 hover:text-blue-700">
                Glissez-déposez votre fiche projet ici
              </span>
              <span className="text-slate-500 block sm:inline sm:ml-1">
                ou <strong className="text-blue-700 underline font-medium">cliquez pour parcourir</strong> vos fichiers (PDF recommandé)
              </span>
            </div>
          </div>
        </div>

        {/* Message d'erreur éventuel */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {lastFileRef.current && (
              <button
                type="button"
                onClick={() => processUploadedFile(lastFileRef.current!)}
                className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px] hover:bg-amber-700 transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Réessayer</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
