/**
 * Étape 0 — Synthèse du projet (uniquement lorsqu'une fiche projet a été déposée).
 * Chiffres lus de façon exacte et contrôles par règles ; texte rédigé par IA si disponible.
 */

import React from 'react';
import { AnalyseFicheProjetResponse, NiveauAlerte } from '../../types/ficheProjet';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Badge, Panel, SectionHeading, StatGrid } from '../Layout/ui';

interface StepSyntheseProps {
  dossier: AnalyseFicheProjetResponse;
}

const euro = (n?: number) =>
  n === undefined ? '—' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const pct = (r?: number) => (r === undefined ? '—' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(r * 100)} %`);

const ALERTE_STYLE: Record<NiveauAlerte, { icon: React.ReactNode; label: string; labelClass: string }> = {
  bloquant: { icon: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />, label: 'Bloquant', labelClass: 'text-red-800' },
  attention: { icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />, label: 'À vérifier', labelClass: 'text-amber-800' },
  info: { icon: <Info className="w-4 h-4 text-petrole-600 shrink-0" />, label: 'Information', labelClass: 'text-petrole-800' }
};

export const StepSynthese: React.FC<StepSyntheseProps> = ({ dossier }) => {
  const { fiche, synthese } = dossier;
  const { depenses, financement, ratios, redaction } = synthese;
  const fin = fiche.finances;

  const financeRows: { label: string; value: string }[] = [
    { label: 'Chiffre d’affaires', value: euro(fin.chiffreAffaires) },
    { label: 'Résultat net', value: euro(fin.resultatNet) },
    { label: 'Fonds propres', value: euro(fin.fondsPropres) },
    { label: 'Emprunts en cours', value: euro(fin.empruntsEnCours) },
    { label: 'CAF', value: euro(fin.caf) },
    { label: 'Marge nette', value: pct(ratios.margeNette) },
    {
      label: 'Emprunts / fonds propres',
      value: ratios.endettementSurFondsPropres === undefined
        ? '—'
        : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(ratios.endettementSurFondsPropres)} ×`
    }
  ];

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Synthèse du projet"
        description={
          <>
            {fiche.entreprise.raisonSociale}
            {fiche.dossierNumero && ` · Fiche projet n° ${fiche.dossierNumero}`}
            {fiche.transmisLe && ` · transmise le ${fiche.transmisLe.slice(0, 10).split('-').reverse().join('/')}`}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {fiche.projet.libelle && <span className="text-sm font-medium text-neutral-900">« {fiche.projet.libelle} »</span>}
        <Badge tone="accent">{synthese.natureBesoinLibelle}</Badge>
        {fiche.appelAProjet.repond && fiche.appelAProjet.intitule && (
          <Badge tone="warning">Appel à projets : {fiche.appelAProjet.intitule}</Badge>
        )}
      </div>

      {/* Synthèse rédigée */}
      <Panel title="En résumé" headingLevel={3}>
        {redaction ? (
          <div className="space-y-1">
            <p className="text-sm text-neutral-800 leading-relaxed">{redaction.resume}</p>
            <p className="text-[11px] text-neutral-500">Rédigé par {redaction.moteur} à partir des données de la fiche — à valider par l’instructeur.</p>
          </div>
        ) : (
          <div className="text-xs text-neutral-700 space-y-1">
            <p>{fiche.projet.description ? `${fiche.projet.description.slice(0, 600)}${fiche.projet.description.length > 600 ? '…' : ''}` : 'Aucune description du projet dans la fiche.'}</p>
            {synthese.redactionIndisponible && (
              <p className="text-[11px] text-neutral-500">{synthese.redactionIndisponible} Extrait de la description du projet affiché à la place.</p>
            )}
          </div>
        )}
      </Panel>

      {/* Chiffres clés */}
      <StatGrid
        items={[
          { label: 'Coût du projet', value: euro(financement.baseCout), hint: depenses.totalRecalcule > 0 ? 'Somme des dépenses détaillées' : 'Montant déclaré' },
          { label: 'Aide sollicitée', value: euro(financement.aideSollicitee), hint: financement.formeAide },
          { label: 'Taux d’aide demandé', value: pct(financement.tauxAideDemande), hint: 'Aide / coût du projet' },
          {
            label: 'Emplois',
            value: `${fiche.financement.emploisCrees ?? 0} créés`,
            hint: `${fiche.financement.emploisMaintenus ?? 0} maintenus · ${fin.effectifEtp ?? '—'} ETP actuels`
          }
        ]}
      />

      {/* Points d'attention */}
      {synthese.pointsAttention.length > 0 && (
        <Panel title="Points d’attention" headingLevel={3} bodyClassName="">
          <ul className="divide-y divide-neutral-100">
            {synthese.pointsAttention.map((p, i) => {
              const s = ALERTE_STYLE[p.niveau];
              return (
                <li key={i} className="flex items-start gap-2 px-4 py-2 text-xs text-neutral-800">
                  {s.icon}
                  <span>
                    <strong className={`font-semibold ${s.labelClass}`}>{s.label} :</strong> {p.message}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Programme de dépenses */}
        <Panel title="Programme de dépenses" headingLevel={3}>
          {depenses.totalRecalcule > 0 ? (
            <table className="w-full text-xs">
              <tbody className="divide-y divide-neutral-100">
                {[...fiche.depenses.investissements, ...fiche.depenses.autres].map((d, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-2">
                      <span className="text-neutral-800">{d.description}</span>
                      <span className="block text-[11px] text-neutral-500">{d.nature}</span>
                    </td>
                    <td className="py-1.5 text-right whitespace-nowrap">{euro(d.cout)}</td>
                  </tr>
                ))}
                <tr className="font-semibold text-neutral-900">
                  <td className="pt-2">Total HT</td>
                  <td className="pt-2 text-right">{euro(depenses.totalRecalcule)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-neutral-500">Aucune dépense détaillée dans la fiche.</p>
          )}
          {(fiche.projet.dateDebut || fiche.projet.dateFin) && (
            <p className="text-[11px] text-neutral-500">
              Période : {fiche.projet.dateDebut || '?'} → {fiche.projet.dateFin || 'non précisée'}
            </p>
          )}
        </Panel>

        {/* Santé financière */}
        <Panel title="Situation financière déclarée" headingLevel={3}>
          <dl className="divide-y divide-neutral-100 text-xs">
            {financeRows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4 py-1.5 tabular-nums">
                <dt className="text-neutral-500">{row.label}</dt>
                <dd className="text-neutral-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      {redaction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Atouts du dossier" headingLevel={3}>
            <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-800">
              {redaction.forces.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </Panel>
          <Panel title="Points à instruire" headingLevel={3}>
            <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-800">
              {redaction.vigilances.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </Panel>
        </div>
      )}

      {redaction && (
        <Panel title="Orientation proposée" headingLevel={3}>
          <div className="space-y-1">
            <p className="text-sm text-neutral-800 leading-relaxed">{redaction.orientation}</p>
            <p className="text-[11px] text-neutral-500">L’éligibilité et les montants sont calculés à l’étape 5, après vérification des étapes 1 à 4.</p>
          </div>
        </Panel>
      )}

      {synthese.donneesManquantes.length > 0 && (
        <p className="text-xs text-neutral-600">
          <strong className="font-semibold">Informations absentes de la fiche :</strong> {synthese.donneesManquantes.join(', ')}.
        </p>
      )}
    </div>
  );
};
