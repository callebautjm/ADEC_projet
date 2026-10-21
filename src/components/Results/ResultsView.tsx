/**
 * Résultat de la simulation : dispositifs éligibles, sous condition ou non retenus,
 * avec le détail des calculs, motifs et rappels d'instruction.
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
import { Printer, Check, AlertTriangle, X, MapPin, ChevronRight } from 'lucide-react';
import { SalvezzaCommunesModal } from '../Salvezza/SalvezzaCommunesModal';
import { shortCategoryLabel } from '../DocumentaryExplorer/DocumentaryExplorerView';
import { Badge, Notice, Panel, SectionHeading, SegmentedControl, StatGrid, btn } from '../Layout/ui';

interface ResultsViewProps {
  report: ComprehensiveEvaluationReport;
  company: CompanyProfile;
  onModifyQuestionnaire: () => void;
  /** Contenu inséré sous les chiffres clés (comparaison avec la fiche projet) */
  children?: React.ReactNode;
}

type FilterView = 'all' | 'eligible' | 'conditional' | 'ineligible';

const euro = (n: number) => `${n.toLocaleString('fr-FR')} €`;

/** Ligne d'un dispositif : en-tête cliquable (ouvre la fiche) et détail */
const SchemeRow: React.FC<{
  item: EvaluationResultItem;
  onOpen: (scheme: DispositifScheme) => void;
  badges?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ item, onOpen, badges, aside, children }) => (
  <li className="group px-4 py-3 hover:bg-neutral-50 cursor-pointer" onClick={() => onOpen(item.scheme)}>
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-x-4 gap-y-1">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-500">
          <span className="font-mono text-neutral-700">{item.scheme.code}</span>
          <span>{shortCategoryLabel(item.scheme.category)}</span>
          {badges}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(item.scheme);
          }}
          className="mt-0.5 text-left text-sm font-medium text-neutral-900 group-hover:text-prune-800 cursor-pointer"
        >
          {item.scheme.name}
        </button>
        {item.scheme.subtitle && <p className="text-xs text-neutral-500 line-clamp-1">{item.scheme.subtitle}</p>}
      </div>
      <div className="flex items-start gap-2 sm:shrink-0 sm:max-w-64">
        {aside && <div className="min-w-0 sm:text-right">{aside}</div>}
        <ChevronRight className="hidden sm:block w-4 h-4 mt-0.5 shrink-0 text-neutral-300 group-hover:text-prune-700" />
      </div>
    </div>
    {children && <div className="mt-2 space-y-1.5 text-[11px]">{children}</div>}
  </li>
);

const BulletList: React.FC<{ items: string[]; tone: 'ok' | 'warning' | 'motif' }> = ({ items, tone }) => {
  if (items.length === 0) return null;
  const icon =
    tone === 'ok' ? <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
      : tone === 'warning' ? <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
        : <X className="w-3 h-3 text-red-600 shrink-0 mt-0.5" />;
  const textClass = tone === 'ok' ? 'text-neutral-600' : tone === 'warning' ? 'text-amber-900' : 'text-red-900';
  return (
    <ul className="space-y-0.5">
      {items.map((text, idx) => (
        <li key={idx} className={`flex items-start gap-1.5 ${textClass}`}>
          {icon}
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  report,
  company,
  onModifyQuestionnaire,
  children
}) => {
  const [selectedScheme, setSelectedScheme] = useState<DispositifScheme | null>(null);
  const [filterView, setFilterView] = useState<FilterView>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSalvezzaModalOpen, setIsSalvezzaModalOpen] = useState(false);
  // Les dispositifs non retenus sont repliés dans la vue « Tous » pour garder la page lisible
  const [showIneligible, setShowIneligible] = useState(false);

  const totalSimulatedEligibleGrant = report.eligibleSchemes.reduce(
    (acc, curr) => acc + curr.estimatedSubsidyAmount,
    0
  );
  const totalAnalysed = report.eligibleSchemes.length + report.conditionalSchemes.length + report.ineligibleSchemes.length;

  const handlePrint = () => {
    // Toujours ouvrir la modale d'impression pour garantir l'accès
    // et éviter les blocages de fenêtres modales par les iframes de navigateurs
    setIsPrintModalOpen(true);
    try {
      window.print();
    } catch (err) {
      console.warn("L'impression directe par window.print() a été bloquée par le cadre sandbox:", err);
    }
  };

  const companyAge = analyzeCompanyCreationDate(company.creationDate);
  const salvezzaCommune = report.salvezzaCommune || company.salvezzaCommune;
  const show = (view: FilterView) => filterView === 'all' || filterView === view;

  return (
    <div className="space-y-4">
      <SalvezzaCommunesModal
        isOpen={isSalvezzaModalOpen}
        onClose={() => setIsSalvezzaModalOpen(false)}
        selectedCommuneCode={company.communeCode || report.salvezzaCommune?.codeCommune}
      />

      <SectionHeading
        title="5. Proposition de mesures"
        description={
          <>
            {company.name || 'Entreprise'} · catégorie {company.size} ({company.headcount} ETP) ·{' '}
            {companyAge.isDateKnown
              ? `immatriculée le ${companyAge.dateFormattedFr} (${companyAge.ageLabel})`
              : 'date d’immatriculation non communiquée'}
          </>
        }
        actions={
          <>
            <button type="button" onClick={onModifyQuestionnaire} className={btn('secondary')}>
              Modifier les données
            </button>
            <button type="button" onClick={handlePrint} className={btn('primary')}>
              <Printer className="w-3.5 h-3.5" />
              Imprimer / exporter
            </button>
          </>
        }
      />

      <StatGrid
        items={[
          { label: 'Dispositifs éligibles', value: report.eligibleSchemes.length, hint: `sur ${totalAnalysed} analysés` },
          { label: 'Aide simulée (éligibles)', value: euro(totalSimulatedEligibleGrant), hint: 'selon assiette et plafonds ADEC' },
          {
            label: 'Score qualitatif (21/177 AC)',
            value: `${report.qualitativeTotalYes} / 8`,
            hint: report.qualitativeValidated ? 'Seuil atteint (≥ 3)' : 'Seuil non atteint · non requis pour l’Annexe 1',
            valueClassName: report.qualitativeValidated ? 'text-emerald-700' : 'text-amber-700'
          },
          { label: 'De minimis disponible', value: euro(report.deMinimisAvailableRemaining), hint: 'sur 300 000 € (Règl. 2023/2831)' }
        ]}
      />

      {children}

      {!companyAge.isDateKnown && (
        <Notice tone="warning" title="Date d’immatriculation non renseignée">
          L’éligibilité aux volets liés à l’ancienneté (<strong>Impresa Sì – Création</strong> : ≤ 5 ans ; <strong>Impresa Sì – Reprise</strong> : ≥ 12 mois) ne peut pas être établie sans date officielle. Saisir la date de l’extrait Kbis à l’étape 1.
        </Notice>
      )}

      {/* Conclusion du moteur */}
      <Panel headingLevel={3} title="Conclusion du moteur">
        <div className="space-y-1">
          <p className="text-sm text-neutral-800 leading-relaxed">{report.overallDiagnosisSummary}</p>
          {report.dossierSource && (
            <p className="text-[11px] text-neutral-500">
              Source : fiche projet {report.dossierSource.dossierNumber ? `n° ${report.dossierSource.dossierNumber}` : ''}
              {(report.dossierSource.primarySchemeName || report.dossierSource.aapTitre) &&
                ` · appel à projets « ${report.dossierSource.primarySchemeName || report.dossierSource.aapTitre} »`}
            </p>
          )}
        </div>
      </Panel>

      {/* Fonds Salvezza */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 bg-white border border-neutral-200 rounded-md">
        <div className="flex items-start gap-2.5 min-w-0 text-xs">
          <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${salvezzaCommune ? 'text-emerald-600' : 'text-neutral-400'}`} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 flex-wrap font-medium text-neutral-900">
              Fonds Salvezza · volets « Économique » et « Emploi »
              {salvezzaCommune ? (
                <Badge tone="success">
                  Bonification : {salvezzaCommune.nom} ({salvezzaCommune.nomCorse})
                </Badge>
              ) : (
                <Badge>Commune non éligible</Badge>
              )}
            </p>
            <p className="text-neutral-500 mt-0.5">
              {salvezzaCommune
                ? `Commune éligible (score de contrainte : ${salvezzaCommune.scoreContrainte}${salvezzaCommune.altitudeSup350m ? ' · chef-lieu > 350 m' : ''}) : les dispositifs des volets Économique et Emploi intègrent les majorations prévues par la délibération 21/177 AC.`
                : 'Les 230 communes de montagne ou de l’intérieur sous fortes contraintes bénéficient d’un soutien majoré (taux bonifié et priorité ADEC).'}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => setIsSalvezzaModalOpen(true)} className={btn('secondary', 'sm')}>
          Liste des 230 communes
        </button>
      </div>

      {/* Filtre */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SegmentedControl
          ariaLabel="Filtrer les dispositifs"
          value={filterView}
          onChange={setFilterView}
          options={[
            { value: 'all', label: `Tous (${totalAnalysed})` },
            { value: 'eligible', label: `Éligibles (${report.eligibleSchemes.length})` },
            { value: 'conditional', label: `Sous condition (${report.conditionalSchemes.length})` },
            { value: 'ineligible', label: `Non retenus (${report.ineligibleSchemes.length})` }
          ]}
        />
        <span className="text-xs text-neutral-500">Cliquer sur un dispositif pour afficher sa fiche réglementaire.</span>
      </div>

      {/* Dispositifs éligibles */}
      {show('eligible') && report.eligibleSchemes.length > 0 && (
        <Panel
          headingLevel={3}
          title={<>Éligibles <Badge tone="success">{report.eligibleSchemes.length}</Badge></>}
          bodyClassName=""
        >
          <ul className="divide-y divide-neutral-100">
            {report.eligibleSchemes.map((item) => (
              <SchemeRow
                key={item.scheme.id}
                item={item}
                onOpen={setSelectedScheme}
                badges={
                  <>
                    {item.isPrimaryFromDossierAAP && <Badge tone="accent">Appel à projets de la fiche</Badge>}
                    {item.scheme.requiresQualitativeEvaluation ? <Badge>Éval. qualitative validée</Badge> : <Badge tone="info">Sans éval. qualitative</Badge>}
                  </>
                }
                aside={
                  <>
                    <p className="text-base font-semibold text-neutral-900 tabular-nums">
                      {item.estimatedSubsidyAmount > 0 ? euro(item.estimatedSubsidyAmount) : 'Forfait / devis'}
                    </p>
                    <p className="text-[11px] text-neutral-500">{item.scheme.procedure.decisionBody}</p>
                  </>
                }
              >
                {item.subsidyCalculationDetails && <p className="text-neutral-600">{item.subsidyCalculationDetails}</p>}
                {item.salvezzaBonusApplied && (
                  <p className="text-emerald-800">
                    <strong className="font-medium">Bonification Salvezza :</strong> {item.salvezzaBonusDetails}
                  </p>
                )}
                <BulletList items={item.reasons} tone="ok" />
                <BulletList items={item.warningNotes} tone="warning" />
              </SchemeRow>
            ))}
          </ul>
        </Panel>
      )}

      {/* Dispositifs sous condition qualitative */}
      {show('conditional') && report.conditionalSchemes.length > 0 && (
        <Panel
          headingLevel={3}
          title={<>Sous condition <Badge tone="warning">{report.conditionalSchemes.length}</Badge></>}
          description="Dispositifs du Guide 2026 : au moins 3 « OUI » sur les 8 critères qualitatifs sont requis avant toute instruction financière (délib. 21/177 AC). Les mesures de l’Annexe 1 ne sont pas concernées."
          bodyClassName=""
        >
          <ul className="divide-y divide-neutral-100">
            {report.conditionalSchemes.map((item) => (
              <SchemeRow
                key={item.scheme.id}
                item={item}
                onOpen={setSelectedScheme}
                aside={<p className="text-[11px] text-neutral-500">Plafond : {euro(item.scheme.rates.ceilingAmount)}</p>}
              >
                <p className="text-amber-900">
                  <strong className="font-medium">Critère bloquant :</strong>{' '}
                  {item.warningNotes[0] || 'Seuil d’au moins 3 OUI requis sur l’évaluation qualitative.'}
                </p>
                {item.salvezzaBonusApplied && (
                  <p className="text-emerald-800">
                    <strong className="font-medium">Fonds Salvezza réservé :</strong> {item.salvezzaBonusDetails}
                  </p>
                )}
              </SchemeRow>
            ))}
          </ul>
        </Panel>
      )}

      {/* Dispositifs non retenus */}
      {show('ineligible') && report.ineligibleSchemes.length > 0 && (
        <Panel
          headingLevel={3}
          title={<>Non retenus <Badge>{report.ineligibleSchemes.length}</Badge></>}
          description="Écartés sur des critères d’exclusion objectifs (forme juridique, secteur, antécédents, ancienneté…)."
          actions={
            filterView === 'all' && (
              <button
                type="button"
                onClick={() => setShowIneligible(!showIneligible)}
                aria-expanded={showIneligible}
                className={btn('secondary', 'sm')}
              >
                {showIneligible ? 'Masquer les motifs' : 'Afficher les motifs'}
              </button>
            )
          }
          bodyClassName=""
        >
          {(filterView === 'ineligible' || showIneligible) && (
            <ul className="divide-y divide-neutral-100">
              {report.ineligibleSchemes.map((item) => (
                <SchemeRow key={item.scheme.id} item={item} onOpen={setSelectedScheme}>
                  <BulletList items={item.ineligibilityMotifs} tone="motif" />
                </SchemeRow>
              ))}
            </ul>
          )}
        </Panel>
      )}

      {/* Rappels d'instruction */}
      <Panel headingLevel={3} title="Rappels pour l’instruction">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-xs text-neutral-700">
          <div className="space-y-1">
            <p className="font-semibold text-neutral-900">Antériorité des dépenses</p>
            <p className="leading-relaxed">
              Aucune dépense ne doit être engagée (devis signé, bon de commande, acompte, facture) avant le dépôt du dossier auprès de l’ADEC : tout engagement antérieur rend la dépense inéligible (hors mesure Rinascita).
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-neutral-900">Pièces justificatives usuelles</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Extrait Kbis de moins de 3 mois ou inscription au registre</li>
              <li>Liasses fiscales et bilans des 3 derniers exercices</li>
              <li>Devis détaillés et non signés des investissements</li>
              <li>Plan de financement prévisionnel équilibré</li>
              <li>Déclaration des aides de minimis obtenues (plafond 300 000 €)</li>
              <li>Attestations de régularité fiscale et sociale (URSSAF, DGFiP)</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-neutral-900">Circuit de décision</p>
            <p className="leading-relaxed">
              Instruction administrative et technique par les services de l’ADEC ; l’octroi des subventions est voté par le <strong>Bureau de l’ADEC</strong> selon la disponibilité budgétaire.
            </p>
          </div>
        </div>
      </Panel>

      <PrintDiagnosticModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        report={report}
        company={company}
      />

      <DispositifDetailModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />
    </div>
  );
};
