/**
 * Étape 0 — Synthèse du projet (uniquement lorsqu'une fiche projet a été déposée).
 * Chiffres lus de façon exacte et contrôles par règles ; texte rédigé par IA si disponible.
 */

import React from 'react';
import { AnalyseFicheProjetResponse, NiveauAlerte } from '../../types/ficheProjet';
import { FileText, AlertTriangle, AlertCircle, Info, ThumbsUp, Eye, Compass, Sparkles, ListChecks } from 'lucide-react';

interface StepSyntheseProps {
  dossier: AnalyseFicheProjetResponse;
}

const euro = (n?: number) =>
  n === undefined ? '—' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const pct = (r?: number) => (r === undefined ? '—' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(r * 100)} %`);

const ALERTE_STYLE: Record<NiveauAlerte, { box: string; icon: React.ReactNode; label: string }> = {
  bloquant: { box: 'bg-red-50 border-red-200 text-red-900', icon: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />, label: 'Bloquant' },
  attention: { box: 'bg-amber-50 border-amber-200 text-amber-900', icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />, label: 'À vérifier' },
  info: { box: 'bg-petrole-50 border-petrole-200 text-petrole-900', icon: <Info className="w-4 h-4 text-petrole-600 shrink-0" />, label: 'Information' }
};

const Kpi: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">{label}</span>
    <span className="text-base font-extrabold text-neutral-900 block">{value}</span>
    {hint && <span className="text-[11px] text-neutral-500">{hint}</span>}
  </div>
);

const Card: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-white">
    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
      {icon}
      {title}
    </h3>
    {children}
  </section>
);

export const StepSynthese: React.FC<StepSyntheseProps> = ({ dossier }) => {
  const { fiche, synthese } = dossier;
  const { depenses, financement, ratios, redaction } = synthese;
  const fin = fiche.finances;

  return (
    <div className="space-y-5">
      <div className="pb-4 border-b border-neutral-200">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-neutral-700" />
          Synthèse du projet
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          {fiche.entreprise.raisonSociale}
          {fiche.dossierNumero && ` · Fiche projet n° ${fiche.dossierNumero}`}
          {fiche.transmisLe && ` · transmise le ${fiche.transmisLe.slice(0, 10).split('-').reverse().join('/')}`}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {fiche.projet.libelle && (
            <span className="text-sm font-bold text-neutral-900">« {fiche.projet.libelle} »</span>
          )}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-prune-50 text-prune-800 border border-prune-200">
            {synthese.natureBesoinLibelle}
          </span>
          {fiche.appelAProjet.repond && fiche.appelAProjet.intitule && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              Appel à projets : {fiche.appelAProjet.intitule}
            </span>
          )}
        </div>
      </div>

      {/* Synthèse rédigée */}
      <Card icon={<Sparkles className="w-4 h-4 text-aubergine-600" />} title="En résumé">
        {redaction ? (
          <>
            <p className="text-sm text-neutral-800 leading-relaxed">{redaction.resume}</p>
            <span className="text-[10px] text-neutral-400">Rédigé par {redaction.moteur} à partir des données de la fiche — à valider par l’instructeur.</span>
          </>
        ) : (
          <div className="text-xs text-neutral-600 space-y-1">
            <p>{fiche.projet.description ? `${fiche.projet.description.slice(0, 600)}${fiche.projet.description.length > 600 ? '…' : ''}` : 'Aucune description du projet dans la fiche.'}</p>
            {synthese.redactionIndisponible && (
              <p className="text-[11px] text-neutral-400 italic">{synthese.redactionIndisponible} Extrait de la description du projet affiché à la place.</p>
            )}
          </div>
        )}
      </Card>

      {/* Chiffres clés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Coût du projet" value={euro(financement.baseCout)} hint={depenses.totalRecalcule > 0 ? 'Somme des dépenses détaillées' : 'Montant déclaré'} />
        <Kpi label="Aide sollicitée" value={euro(financement.aideSollicitee)} hint={financement.formeAide} />
        <Kpi label="Taux d’aide demandé" value={pct(financement.tauxAideDemande)} hint="Aide / coût du projet" />
        <Kpi
          label="Emplois"
          value={`${fiche.financement.emploisCrees ?? 0} créés`}
          hint={`${fiche.financement.emploisMaintenus ?? 0} maintenus · ${fin.effectifEtp ?? '—'} ETP actuels`}
        />
      </div>

      {/* Points d'attention */}
      {synthese.pointsAttention.length > 0 && (
        <Card icon={<AlertTriangle className="w-4 h-4 text-amber-600" />} title="Points d’attention">
          <ul className="space-y-1.5">
            {synthese.pointsAttention.map((p, i) => {
              const s = ALERTE_STYLE[p.niveau];
              return (
                <li key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${s.box}`}>
                  {s.icon}
                  <span><strong>{s.label} :</strong> {p.message}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Programme de dépenses */}
        <Card icon={<ListChecks className="w-4 h-4 text-neutral-600" />} title="Programme de dépenses">
          {depenses.totalRecalcule > 0 ? (
            <table className="w-full text-xs">
              <tbody className="divide-y divide-neutral-100">
                {[...fiche.depenses.investissements, ...fiche.depenses.autres].map((d, i) => (
                  <tr key={i}>
                    <td className="py-1.5 pr-2">
                      <span className="text-neutral-800">{d.description}</span>
                      <span className="block text-[10px] text-neutral-400">{d.nature}</span>
                    </td>
                    <td className="py-1.5 text-right font-mono whitespace-nowrap">{euro(d.cout)}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="pt-2">Total HT</td>
                  <td className="pt-2 text-right font-mono">{euro(depenses.totalRecalcule)}</td>
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
        </Card>

        {/* Santé financière */}
        <Card icon={<FileText className="w-4 h-4 text-neutral-600" />} title="Situation financière déclarée">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <dt className="text-neutral-500">Chiffre d’affaires</dt><dd className="text-right font-mono">{euro(fin.chiffreAffaires)}</dd>
            <dt className="text-neutral-500">Résultat net</dt><dd className="text-right font-mono">{euro(fin.resultatNet)}</dd>
            <dt className="text-neutral-500">Fonds propres</dt><dd className="text-right font-mono">{euro(fin.fondsPropres)}</dd>
            <dt className="text-neutral-500">Emprunts en cours</dt><dd className="text-right font-mono">{euro(fin.empruntsEnCours)}</dd>
            <dt className="text-neutral-500">CAF</dt><dd className="text-right font-mono">{euro(fin.caf)}</dd>
            <dt className="text-neutral-500">Marge nette</dt><dd className="text-right font-mono">{pct(ratios.margeNette)}</dd>
            <dt className="text-neutral-500">Emprunts / fonds propres</dt>
            <dd className="text-right font-mono">
              {ratios.endettementSurFondsPropres === undefined ? '—' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(ratios.endettementSurFondsPropres)} ×`}
            </dd>
          </dl>
        </Card>
      </div>

      {redaction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card icon={<ThumbsUp className="w-4 h-4 text-emerald-600" />} title="Atouts du dossier">
            <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-800">
              {redaction.forces.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </Card>
          <Card icon={<Eye className="w-4 h-4 text-amber-600" />} title="Points à instruire">
            <ul className="list-disc pl-4 space-y-1 text-xs text-neutral-800">
              {redaction.vigilances.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </Card>
        </div>
      )}

      {redaction && (
        <Card icon={<Compass className="w-4 h-4 text-prune-600" />} title="Orientation proposée">
          <p className="text-sm text-neutral-800 leading-relaxed">{redaction.orientation}</p>
          <p className="text-[11px] text-neutral-500">L’éligibilité et les montants sont calculés à l’étape 5, après vérification des étapes 1 à 4.</p>
        </Card>
      )}

      {synthese.donneesManquantes.length > 0 && (
        <p className="text-xs text-neutral-600">
          <strong>Informations absentes de la fiche :</strong> {synthese.donneesManquantes.join(', ')}.
        </p>
      )}
    </div>
  );
};
