/**
 * Modal d'inspection détaillée d'un dispositif ADEC
 * Reproduction intégrale et fidèle des stipulations des documents officiels
 */

import React from 'react';
import { DispositifScheme } from '../../types';
import { X, ExternalLink, Check, AlertCircle, FileText, Scale, Clock, Shield } from 'lucide-react';

interface DispositifDetailModalProps {
  scheme: DispositifScheme | null;
  onClose: () => void;
}

export const DispositifDetailModal: React.FC<DispositifDetailModalProps> = ({ scheme, onClose }) => {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {scheme.code}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {scheme.category} · {scheme.sourceDocumentPages}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {scheme.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {scheme.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body with smooth scrolling */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Assise Juridique */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-slate-500" />
              Assise juridique & Cadre réglementaire
            </span>
            <p className="text-xs text-slate-800 font-mono">
              {scheme.legalBasis}
            </p>
            {scheme.governingDeliberation && (
              <p className="text-xs text-slate-500 italic mt-0.5">
                {scheme.governingDeliberation}
              </p>
            )}
          </div>

          {/* Statut Évaluation Qualitative */}
          {!scheme.requiresQualitativeEvaluation ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-600 text-white shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-emerald-950 block">
                  Régime d'instruction : NON SOUMIS à l'évaluation qualitative préalable
                </span>
                <p className="text-[11px] text-emerald-900 mt-0.5 leading-relaxed">
                  Cette mesure relève du dispositif <strong>U PATTU RISILIENZA È TERRITORII</strong> (Annexe 1). Elle est <strong>dispensée de plein droit</strong> de la grille d'évaluation qualitative de la Délibération N° 21/177 AC et ne requiert pas le seuil de 3 « OUI ». L'instruction administrative et financière par l'ADEC est directe.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <div className="p-1 rounded bg-blue-600 text-white shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-blue-950 block">
                  Régime d'instruction : SOUMIS à l'évaluation qualitative préalable (Seuil minimal ≥ 3 OUI)
                </span>
                <p className="text-[11px] text-blue-900 mt-0.5 leading-relaxed">
                  Cette mesure relève du <strong>Guide des Aides ADEC 2026</strong>. Conformément à la Délibération N° 21/177 AC du 28 octobre 2021, l'obtention d'au moins <strong>3 « OUI » sur les 8 critères</strong> de la grille qualitative est une condition préalable obligatoire pour engager l'instruction financière de la demande.
                </p>
              </div>
            </div>
          )}

          {/* 1. Objectif */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              1. Objectif officiel de l'aide
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
              {scheme.objective}
            </p>
          </div>

          {/* 2. Bénéficiaires & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                2. Bénéficiaires éligibles
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                {scheme.targetBeneficiariesSummary}
              </p>
              <div className="text-[11px] text-slate-500 space-y-1">
                <div>• Tailles admises : <strong>{scheme.allowedSizes.join(', ')}</strong></div>
                <div>• Secteurs : <strong>{scheme.allowedSectors.join(', ')}</strong></div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                3. Exclusions expresses
              </h3>
              <div className="text-[11px] text-red-700 space-y-1 bg-red-50/50 p-2.5 rounded-lg border border-red-100">
                <div>• Secteurs exclus : {scheme.excludedSectors.join(', ')}</div>
                <div>• Micro-entreprises (régime simplifié) exclues</div>
                <div>• SCI sans lien d'exploitation exclues</div>
                <div>• Litiges ADEC antérieurs ou cotisations non régularisées</div>
              </div>
            </div>
          </div>

          {/* 5. Dépenses Éligibles & Inéligibles */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              5. Dépenses éligibles & Inéligibles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <span className="font-bold text-emerald-900 block mb-1">Dépenses éligibles :</span>
                <ul className="space-y-1 list-disc pl-4 text-emerald-950 text-[11px]">
                  {scheme.eligibleExpenseCategories.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block mb-1">Dépenses inéligibles :</span>
                <ul className="space-y-1 list-disc pl-4 text-slate-600 text-[11px]">
                  {scheme.ineligibleExpenseCategories.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 6. Intensité & Barème */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
              6. Intensité, Barème & Plafonds financiers
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">TPE (&lt;10 sal)</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {scheme.rates.tpeMaxRate ? `${scheme.rates.tpeMaxRate * 100} %` : 'Forfait / Spécifique'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">PE (&lt;50 sal)</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {scheme.rates.peMaxRate ? `${scheme.rates.peMaxRate * 100} %` : 'Forfait / Spécifique'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">PME (&lt;250 sal)</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {scheme.rates.pmeMaxRate ? `${scheme.rates.pmeMaxRate * 100} %` : 'Forfait / Spécifique'}
                </span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between px-1">
              <span>Seuil plancher d’intervention : <strong>{scheme.rates.floorAmount.toLocaleString('fr-FR')} €</strong></span>
              <span>Plafond d’aide : <strong>{scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €</strong></span>
            </div>
          </div>

          {/* 9. Modalités d'accès & Dossier */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              9. Modalités d’accès, Instruction & Pièces du dossier
            </h3>
            <p className="text-xs text-slate-700 mb-2">
              {scheme.procedure.submissionMethod} · <em>Décision par le {scheme.procedure.decisionBody}</em>.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1.5">
              <span className="font-semibold text-slate-800 block text-[11px] uppercase">
                Composition obligatoire du dossier :
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                {scheme.procedure.requiredDocuments.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 10. Obligations de communication et contrôles */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              Obligations contractuelles & Contrôles ({scheme.procedure.controlDurationYears} ans)
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              {scheme.procedure.mandatoryCommitments.map((com, idx) => (
                <li key={idx}>{com}</li>
              ))}
              <li>Obligation de conservation de toutes les pièces justificatives.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <a
            href={scheme.procedure.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
          >
            Accéder au téléservice ADEC ({scheme.procedure.portalUrl})
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
          >
            Fermer la fiche
          </button>
        </div>
      </div>
    </div>
  );
};
