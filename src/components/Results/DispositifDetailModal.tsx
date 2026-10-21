/**
 * Modal d'inspection détaillée d'un dispositif ADEC
 * Reproduction intégrale et fidèle des stipulations des documents officiels
 */

import React from 'react';
import { DispositifScheme } from '../../types';
import { ExternalLink } from 'lucide-react';
import { Badge, Modal, Notice, btn, linkClass } from '../Layout/ui';

interface DispositifDetailModalProps {
  scheme: DispositifScheme | null;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-1.5">
    <h3 className="text-xs font-semibold text-neutral-900">{title}</h3>
    {children}
  </section>
);

const formatRate = (rate?: number) => (rate ? `${Math.round(rate * 100)} %` : 'Forfait / spécifique');

export const DispositifDetailModal: React.FC<DispositifDetailModalProps> = ({ scheme, onClose }) => {
  if (!scheme) return null;

  return (
    <Modal
      size="lg"
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm text-neutral-500">{scheme.code}</span>
          {scheme.name}
        </span>
      }
      subtitle={
        <>
          {scheme.category} · {scheme.sourceDocumentPages}
          {scheme.subtitle && <span className="block mt-0.5 text-neutral-600">{scheme.subtitle}</span>}
        </>
      }
      bodyClassName="p-4 space-y-5 text-xs text-neutral-700"
      footer={
        <>
          <a href={scheme.procedure.portalUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-xs ${linkClass}`}>
            Téléservice ADEC ({scheme.procedure.portalUrl})
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button type="button" onClick={onClose} className={btn('secondary')}>
            Fermer
          </button>
        </>
      }
    >
      {/* Assise juridique */}
      <Section title="Assise juridique et cadre réglementaire">
        <p className="text-neutral-800">{scheme.legalBasis}</p>
        {scheme.governingDeliberation && <p className="text-neutral-500">{scheme.governingDeliberation}</p>}
      </Section>

      {/* Régime d'instruction */}
      {!scheme.requiresQualitativeEvaluation ? (
        <Notice tone="info" title="Non soumis à l’évaluation qualitative préalable">
          Mesure du dispositif <strong>U Pattu Risilienza è Territorii</strong> (Annexe 1) : dispensée de plein droit de la grille de la délibération n° 21/177 AC, sans seuil de 3 « OUI ». Instruction administrative et financière directe.
        </Notice>
      ) : (
        <Notice tone="neutral" title="Soumis à l’évaluation qualitative préalable (≥ 3 OUI)">
          Mesure du <strong>Guide des aides ADEC 2026</strong> : au moins 3 « OUI » sur les 8 critères de la grille qualitative (délibération n° 21/177 AC du 28 octobre 2021) sont requis avant l’instruction financière.
        </Notice>
      )}

      <Section title="1. Objectif de l’aide">
        <p className="leading-relaxed">{scheme.objective}</p>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Section title="2. Bénéficiaires éligibles">
          <p>{scheme.targetBeneficiariesSummary}</p>
          <dl className="text-[11px] text-neutral-600 space-y-0.5">
            <div><dt className="inline">Tailles admises : </dt><dd className="inline font-medium text-neutral-800">{scheme.allowedSizes.join(', ')}</dd></div>
            <div><dt className="inline">Secteurs : </dt><dd className="inline font-medium text-neutral-800">{scheme.allowedSectors.join(', ')}</dd></div>
          </dl>
        </Section>

        <Section title="3. Exclusions expresses">
          <ul className="list-disc pl-4 space-y-0.5 text-red-900">
            <li>Secteurs exclus : {scheme.excludedSectors.join(', ')}</li>
            <li>Micro-entreprises (régime simplifié) exclues</li>
            <li>SCI sans lien d’exploitation exclues</li>
            <li>Litiges ADEC antérieurs ou cotisations non régularisées</li>
          </ul>
        </Section>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <Section title="4. Dépenses éligibles">
          <ul className="list-disc pl-4 space-y-0.5">
            {scheme.eligibleExpenseCategories.map((exp, i) => (
              <li key={i}>{exp}</li>
            ))}
          </ul>
        </Section>
        <Section title="Dépenses inéligibles">
          <ul className="list-disc pl-4 space-y-0.5 text-neutral-600">
            {scheme.ineligibleExpenseCategories.map((exp, i) => (
              <li key={i}>{exp}</li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="5. Intensité, barème et plafonds">
        <table className="w-full text-xs border border-neutral-200 rounded-md">
          <thead>
            <tr className="bg-neutral-50 text-[11px] text-neutral-500">
              <th className="py-1.5 px-3 text-left font-medium">TPE (&lt; 10 sal.)</th>
              <th className="py-1.5 px-3 text-left font-medium">PE (&lt; 50 sal.)</th>
              <th className="py-1.5 px-3 text-left font-medium">PME (&lt; 250 sal.)</th>
              <th className="py-1.5 px-3 text-right font-medium">Plancher</th>
              <th className="py-1.5 px-3 text-right font-medium">Plafond</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-neutral-200 text-neutral-900">
              <td className="py-2 px-3">{formatRate(scheme.rates.tpeMaxRate)}</td>
              <td className="py-2 px-3">{formatRate(scheme.rates.peMaxRate)}</td>
              <td className="py-2 px-3">{formatRate(scheme.rates.pmeMaxRate)}</td>
              <td className="py-2 px-3 text-right">{scheme.rates.floorAmount.toLocaleString('fr-FR')} €</td>
              <td className="py-2 px-3 text-right font-medium">{scheme.rates.ceilingAmount.toLocaleString('fr-FR')} €</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="6. Modalités d’accès, instruction et pièces du dossier">
        <p>
          {scheme.procedure.submissionMethod} · décision par le {scheme.procedure.decisionBody}.
        </p>
        <p className="text-[11px] font-medium text-neutral-500 pt-1">Composition obligatoire du dossier</p>
        <ul className="list-disc pl-4 space-y-0.5">
          {scheme.procedure.requiredDocuments.map((doc, idx) => (
            <li key={idx}>{doc}</li>
          ))}
        </ul>
      </Section>

      <Section title={`7. Obligations contractuelles et contrôles`}>
        <p className="text-[11px] text-neutral-500">
          Durée de contrôle : <Badge>{scheme.procedure.controlDurationYears} ans</Badge>
        </p>
        <ul className="list-disc pl-4 space-y-0.5">
          {scheme.procedure.mandatoryCommitments.map((com, idx) => (
            <li key={idx}>{com}</li>
          ))}
          <li>Obligation de conservation de toutes les pièces justificatives.</li>
        </ul>
      </Section>
    </Modal>
  );
};
