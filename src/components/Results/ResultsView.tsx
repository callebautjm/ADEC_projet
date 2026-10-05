/**
 * Vue des Résultats & Recommandations d'Accompagnement ADEC 2026
 * Analyse rigoureuse et personnalisée
 */

import React, { useState } from 'react';
import {
  ComprehensiveEvaluationReport,
  EvaluationResultItem,
  DispositifScheme,
  CompanyProfile
} from '../../types';
import { DispositifDetailModal } from './DispositifDetailModal';
import { PrintDiagnosticModal } from './PrintDiagnosticModal';
import { analyzeCompanyCreationDate } from '../../utils/companyAge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  Euro,
  FileText,
  Printer,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Mountain,
  ShieldCheck
} from 'lucide-react';
import { SalvezzaCommunesModal } from '../Salvezza/SalvezzaCommunesModal';

interface ResultsViewProps {
  report: ComprehensiveEvaluationReport;
  company: CompanyProfile;
  onModifyQuestionnaire: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  report,
  company,
  onModifyQuestionnaire
}) => {
  const [selectedScheme, setSelectedScheme] = useState<DispositifScheme | null>(null);
  const [filterView, setFilterView] = useState<'all' | 'eligible' | 'conditional' | 'ineligible'>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSalvezzaModalOpen, setIsSalvezzaModalOpen] = useState(false);

  const totalSimulatedEligibleGrant = report.eligibleSchemes.reduce(
    (acc, curr) => acc + curr.estimatedSubsidyAmount,
    0
  );

  const handlePrint = () => {
    // Toujours ouvrir la modale d'impression officielle pour garantir l'accès
    // et éviter les blocages de fenêtres modales par les iframes de navigateurs
    setIsPrintModalOpen(true);
    try {
      window.print();
    } catch (err) {
      console.warn("L'impression directe par window.print() a été bloquée par le cadre sandbox:", err);
    }
  };

  const companyAge = analyzeCompanyCreationDate(company.creationDate);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Fenêtre Modale de la Liste des 230 Communes SALVEZZA */}
      <SalvezzaCommunesModal
        isOpen={isSalvezzaModalOpen}
        onClose={() => setIsSalvezzaModalOpen(false)}
        selectedCommuneCode={company.communeCode || report.salvezzaCommune?.codeCommune}
      />

      {/* Top Banner & Summary Card - Style sobre, institutionnel et lisible */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Collectivité de Corse · Agence de Développement Économique de la Corse</span>
              <span>·</span>
              <span>Guide 2026 & Annexe 1</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Bilan d'Éligibilité & Diagnostic d'Aides ADEC
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Dossier instruit pour <strong className="text-slate-900">{company.name || 'Entreprise candidate'}</strong> · Catégorie retenue : <strong className="text-slate-900">{company.size}</strong> ({company.headcount} ETP)
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium ${
                companyAge.isDateKnown 
                  ? 'bg-slate-50 border-slate-200 text-slate-700' 
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                {companyAge.isDateKnown ? (
                  <span>Immatriculée le {companyAge.dateFormattedFr} ({companyAge.ageLabel})</span>
                ) : (
                  <span>Date d'immatriculation non communiquée</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onModifyQuestionnaire}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition"
            >
              Modifier le questionnaire
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer le diagnostic
            </button>
          </div>
        </div>

        {/* Key Indicators Grid - Teintes distinctes et valorisantes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/40 p-4 rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-emerald-800 font-semibold block mb-1">Dispositifs éligibles</span>
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {report.eligibleSchemes.length}
            </span>
            <span className="text-[11px] text-emerald-700/80 block mt-0.5">
              sur {report.eligibleSchemes.length + report.conditionalSchemes.length + report.ineligibleSchemes.length} analysés
            </span>
          </div>

          <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-100/40 p-4 rounded-xl border border-blue-200 shadow-2xs">
            <span className="text-blue-800 font-semibold block mb-1">Subvention simulée</span>
            <span className="text-2xl font-bold font-mono text-blue-900">
              {totalSimulatedEligibleGrant.toLocaleString('fr-FR')} €
            </span>
            <span className="text-[11px] text-blue-700/80 block mt-0.5">
              selon assiette et plafonds ADEC
            </span>
          </div>

          <div className="bg-gradient-to-br from-teal-50 via-emerald-50/50 to-teal-100/40 p-4 rounded-xl border border-teal-200 shadow-2xs">
            <span className="text-teal-800 font-semibold block mb-1">Score qualitatif (21/177 AC)</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-teal-950">
                {report.qualitativeTotalYes}/8
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs ${
                  report.qualitativeValidated
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {report.qualitativeValidated ? 'Validé (≥ 3)' : 'Seuil non atteint (< 3)'}
              </span>
            </div>
            <span className="text-[11px] text-teal-800/90 block mt-0.5">
              {report.qualitativeValidated ? 'Accès ouvert aux aides du Guide' : 'Non requis pour U Pattu Risilienza'}
            </span>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-indigo-100/40 p-4 rounded-xl border border-indigo-200 shadow-2xs">
            <span className="text-indigo-800 font-semibold block mb-1">Règle de Minimis disponible</span>
            <span className="text-2xl font-bold font-mono text-indigo-900">
              {report.deMinimisAvailableRemaining.toLocaleString('fr-FR')} €
            </span>
            <span className="text-[11px] text-indigo-700/80 block mt-0.5">
              sur 300 000 € autorisés (Règl. 2023/2831)
            </span>
          </div>
        </div>
      </div>

      {/* Encart Synchronisation Fiche Projet */}
      {report.dossierSource && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xs border border-blue-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white text-sm block">
                Simulation alimentée par votre Fiche Projet ({report.dossierSource.dossierNumber || 'Dossier officiel'})
              </span>
              <p className="text-blue-200 mt-0.5">
                Section Appel à projet : <strong className="text-amber-300 font-semibold">{report.dossierSource.primarySchemeName || report.dossierSource.aapTitre}</strong>. La cohérence entre votre document et les dispositifs d'aide de l'ADEC est garantie à 100%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerte si date de création non communiquée */}
      {!companyAge.isDateKnown && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-900 block">
              Attention : Date d'immatriculation non renseignée (aucune hypothèse inventée)
            </span>
            <p className="leading-relaxed text-amber-800">
              L'éligibilité aux volets sensibles à l'ancienneté d'entreprise (notamment <strong>Impresa Sì – Volet Création</strong> qui exige ≤ 5 ans d'immatriculation, et <strong>Impresa Sì – Reprise</strong> qui exige ≥ 12 mois) ne peut être certifiée sans date officielle. Vous pouvez modifier le questionnaire pour saisir la date figurant sur l'extrait Kbis de l'entreprise.
            </p>
          </div>
        </div>
      )}

      {/* Synthèse Diagnostique & Message Global */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block">
            Conclusion officielle du diagnostic :
          </span>
          <p className="leading-relaxed">
            {report.overallDiagnosisSummary}
          </p>
        </div>
      </div>

      {/* Statut & Bonifications Fonds SALVEZZA */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        report.salvezzaCommune || company.salvezzaCommune || company.locationType === 'RURAL_SALVEZZA_UNDER_1000'
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-100/40 border-emerald-300 shadow-2xs'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            report.salvezzaCommune || company.salvezzaCommune
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-500'
          }`}>
            <Mountain className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-xs text-slate-900">
                Fonds SALVEZZA · Volets « Économique » & « Emploi »
              </span>
              {(report.salvezzaCommune || company.salvezzaCommune) ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                  Bonification active : {(report.salvezzaCommune || company.salvezzaCommune)?.nom} ({(report.salvezzaCommune || company.salvezzaCommune)?.nomCorse})
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  230 communes sous contraintes éligibles
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {(report.salvezzaCommune || company.salvezzaCommune) ? (
                <>
                  Implantation certifiée en commune éligible (Score de contrainte : <strong>{(report.salvezzaCommune || company.salvezzaCommune)?.scoreContrainte}</strong>{(report.salvezzaCommune || company.salvezzaCommune)?.altitudeSup350m ? ' · Chef-lieu > 350 m' : ''}). Les dispositifs des volets Économique et Emploi intègrent les majorations de taux et primes prévues par la Délibération 21/177 AC.
                </>
              ) : (
                <>
                  Les 230 communes classées en zones de montagne ou intérieures sous fortes contraintes bénéficient d'un soutien majoré (taux d'aide bonifié et priorité ADEC).
                </>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSalvezzaModalOpen(true)}
          className="shrink-0 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Mountain className="w-4 h-4 text-emerald-200" />
          <span>Consulter les 230 communes</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilterView('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              filterView === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({report.eligibleSchemes.length + report.conditionalSchemes.length + report.ineligibleSchemes.length})
          </button>
          <button
            onClick={() => setFilterView('eligible')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
              filterView === 'eligible'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Éligibles ({report.eligibleSchemes.length})
          </button>
          <button
            onClick={() => setFilterView('conditional')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
              filterView === 'conditional'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Sous Condition ({report.conditionalSchemes.length})
          </button>
          <button
            onClick={() => setFilterView('ineligible')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
              filterView === 'ineligible'
                ? 'bg-white text-red-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Non Éligibles ({report.ineligibleSchemes.length})
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Cliquez sur une mesure pour afficher sa fiche réglementaire intégrale
        </span>
      </div>

      {/* SECTION 1 : DISPOSITIFS PLEINEMENT ÉLIGIBLES */}
      {(filterView === 'all' || filterView === 'eligible') && report.eligibleSchemes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Dispositifs Pleinement Recommandés & Éligibles ({report.eligibleSchemes.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.eligibleSchemes.map((item) => (
              <div
                key={item.scheme.id}
                onClick={() => setSelectedScheme(item.scheme)}
                className={`bg-white border rounded-xl p-5 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group shadow-2xs ${
                  item.isPrimaryFromDossierAAP
                    ? 'border-amber-400 border-l-4 border-l-amber-500 ring-2 ring-amber-400/20 bg-gradient-to-br from-amber-50/20 via-white to-white'
                    : 'border-slate-200 border-l-4 border-l-emerald-500 hover:border-emerald-300'
                }`}
              >
                <div>
                  {item.isPrimaryFromDossierAAP && (
                    <div className="mb-3 px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between text-[11px] font-bold shadow-2xs">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                        ★ Dispositif issu de l'Appel à projet de votre Fiche Projet
                      </span>
                      <span className="text-[10px] uppercase font-mono bg-black/20 px-1.5 py-0.5 rounded text-amber-100">
                        Priorité N° 1
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                          {item.scheme.code}
                        </span>
                        <span>·</span>
                        <span>{item.scheme.category}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition">
                        {item.scheme.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {item.scheme.subtitle}
                      </p>

                      {!item.scheme.requiresQualitativeEvaluation ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300/80">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Non soumis à l’évaluation qualitative (U Pattu Risilienza è Territorii)</span>
                        </div>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Award className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>Évaluation qualitative préalable validée (≥ 3 OUI)</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full block border border-emerald-300/80 shadow-2xs">
                        Éligible
                      </span>
                    </div>
                  </div>

                  {/* Financial calculation block */}
                  <div className="my-3 p-3 bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border border-emerald-200/80 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-900 font-medium">Aide prévisionnelle simulée :</span>
                      <span className="font-bold font-mono text-base text-emerald-700">
                        {item.estimatedSubsidyAmount > 0
                          ? `${item.estimatedSubsidyAmount.toLocaleString('fr-FR')} €`
                          : 'Montant forfaitaire / Devis'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {item.subsidyCalculationDetails}
                    </p>
                  </div>

                  {/* Bonification SALVEZZA si appliquée */}
                  {item.salvezzaBonusApplied && (
                    <div className="my-2.5 p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-lg text-xs text-emerald-950 flex items-start gap-2 shadow-2xs">
                      <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-emerald-900 font-bold">Bonification SALVEZZA appliquée :</strong>
                        <span className="text-[11px] text-emerald-800 leading-snug">{item.salvezzaBonusDetails}</span>
                      </div>
                    </div>
                  )}

                  {/* Reasons & conditions checked */}
                  <div className="space-y-1 text-[11px] text-slate-600 mb-3">
                    {item.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Warnings if any */}
                  {item.warningNotes.length > 0 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-1 mb-3">
                      {item.warningNotes.map((w, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700">
                  <span className="text-slate-500 font-normal">
                    {item.scheme.procedure.decisionBody}
                  </span>
                  <span className="text-slate-900 group-hover:text-emerald-800 transition flex items-center gap-1">
                    Consulter la fiche
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2 : DISPOSITIFS SOUS CONDITION QUALITATIVE */}
      {(filterView === 'all' || filterView === 'conditional') && report.conditionalSchemes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Dispositifs Conditionnés au Seuil de l’Évaluation Qualitative ({report.conditionalSchemes.length})
            </h2>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <span className="font-bold block mb-1">Règle de la Délibération N° 21/177 AC :</span>
            Ces dispositifs relèvent du Guide des Aides 2026 et nécessitent d’obtenir au moins <strong>3 « OUI »</strong> sur la grille des 8 critères qualitatifs pour que l'ADEC puisse engager une instruction financière. <em>Rappel : les mesures du dispositif <strong>U PATTU RISILIENZA È TERRITORII</strong> (Risilienza, Impresi Paisani, Rinascita, Ribumbà) ne relèvent pas de cette grille et sont instruites directement sans ce seuil.</em>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.conditionalSchemes.map((item) => (
              <div
                key={item.scheme.id}
                onClick={() => setSelectedScheme(item.scheme)}
                className="bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-xl p-5 hover:border-amber-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                        <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {item.scheme.code}
                        </span>
                        <span>·</span>
                        <span>{item.scheme.category}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition">
                        {item.scheme.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {item.scheme.subtitle}
                      </p>

                      <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300/80">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Soumis à l'évaluation qualitative préalable (≥ 3 OUI requis)</span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                      Sous condition
                    </span>
                  </div>

                  <div className="my-3 p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1 text-xs text-amber-950">
                    <span className="font-semibold block text-amber-900">Critère bloquant :</span>
                    <p className="text-[11px] leading-relaxed">
                      {item.warningNotes[0] || 'Seuil d’au moins 3 OUI requis sur l’évaluation qualitative.'}
                    </p>
                  </div>

                  {/* Bonification SALVEZZA potentielle après levée de condition */}
                  {item.salvezzaBonusApplied && (
                    <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-emerald-900 leading-snug">
                        <strong>Fonds SALVEZZA réservé :</strong> {item.salvezzaBonusDetails}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-700">
                  <span className="text-slate-500 font-normal">
                    Plafond : {item.scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €
                  </span>
                  <span className="text-amber-800 font-semibold group-hover:text-amber-950 transition flex items-center gap-1">
                    Consulter les conditions
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3 : DISPOSITIFS NON ÉLIGIBLES */}
      {(filterView === 'all' || filterView === 'ineligible') && report.ineligibleSchemes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Dispositifs Non Retenus / Inéligibles ({report.ineligibleSchemes.length})
            </h2>
          </div>

          <p className="text-xs text-slate-500">
            Ces dispositifs ont été analysés par le moteur et rejetés sur la base de critères d'exclusion officiels et objectifs (forme juridique, secteur, historique ou critères d’âge).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.ineligibleSchemes.map((item) => (
              <div
                key={item.scheme.id}
                onClick={() => setSelectedScheme(item.scheme)}
                className="bg-white border border-slate-200 border-l-4 border-l-slate-300 rounded-xl p-5 hover:border-slate-400 transition cursor-pointer flex flex-col justify-between opacity-85 hover:opacity-100"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.scheme.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {item.scheme.name}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      Non éligible
                    </span>
                  </div>

                  <div className="my-2.5 p-3 bg-red-50/60 border border-red-100 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-red-900 block text-[11px] uppercase">
                      Motifs réglementaires d’exclusion :
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-red-950 text-[11px]">
                      {item.ineligibilityMotifs.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-right">
                  <span className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                    Détails du règlement →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLAN D'ACTION & RECOMMANDATIONS PRATIQUES POUR LE DÉPÔT ADEC */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <FileText className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold text-slate-900">
            Démarches & Recommandations pour le dépôt auprès de l'ADEC
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">
              1. Règle d'antériorité des dépenses
            </h3>
            <p className="leading-relaxed text-slate-600">
              <strong>Aucune dépense ne doit être engagée</strong> (signature de devis, bon de commande, acompte, facture) avant le dépôt effectif de votre dossier auprès des services de l'ADEC. Tout engagement antérieur rend la dépense inéligible (hors mesure Rinascita).
            </p>

            <h3 className="font-semibold text-slate-900 text-sm pt-2">
              2. Pièces justificatives usuelles
            </h3>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Extrait Kbis de moins de 3 mois ou inscription au registre</li>
              <li>Liasses fiscales et bilans des 3 derniers exercices</li>
              <li>Devis détaillés et non signés des investissements projetés</li>
              <li>Plan de financement prévisionnel équilibré</li>
              <li>Déclaration des aides de minimis obtenues (plafond 300 000 €)</li>
              <li>Attestations de régularité fiscale et sociale (URSSAF, DGFIP)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">
              3. Circuit et décision d'attribution
            </h3>
            <p className="leading-relaxed text-slate-600">
              L'instruction administrative et technique est menée par les instructeurs de l'ADEC. L'octroi des subventions est voté formellement par le <strong>Bureau de l'ADEC</strong> selon la disponibilité budgétaire territoriale.
            </p>

            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="font-semibold block text-sm text-slate-900">
                Portail officiel de dépôt :
              </span>
              <p className="text-slate-600 text-xs">
                Les dépôts se font directement en ligne sur la plateforme dématérialisée de l'ADEC.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://www.adec.corsica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white font-medium text-xs rounded-lg hover:bg-slate-800 transition"
                >
                  Accéder au portail www.adec.corsica
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                </a>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs rounded-lg transition border border-slate-200"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  Imprimer la synthèse
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'impression et export officiel */}
      <PrintDiagnosticModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        report={report}
        company={company}
      />

      {/* Modal d'inspection */}
      <DispositifDetailModal
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
      />
    </div>
  );
};
