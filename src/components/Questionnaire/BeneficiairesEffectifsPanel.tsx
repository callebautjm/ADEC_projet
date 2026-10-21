/**
 * Bénéficiaires effectifs (RNE · INPI) et détail de leurs modalités de contrôle,
 * tels que renvoyés par /v3/inpi/rne/unites_legales/{siren}/beneficiaires_effectifs
 */

import React from 'react';
import { ApiEntrepriseComplianceData, BeneficiaireEffectif, BeRepartition } from '../../types';
import { Users, PieChart, Vote, Gavel, Hourglass, Lock, Info, Check, X } from 'lucide-react';

interface BeneficiairesEffectifsPanelProps {
  data?: ApiEntrepriseComplianceData['beneficiairesEffectifs'];
}

const formatPct = (value?: number) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value ?? 0)} %`;

const hasShare = (r?: BeRepartition) =>
  Boolean(r && (r.detention || (r.total ?? 0) > 0 || (r.pleine_propriete ?? 0) > 0 || (r.nue_propriete ?? 0) > 0 || (r.usufruit ?? 0) > 0));

/** Ligne de répartition : total éventuel + pleine propriété / nue-propriété / usufruit */
const RepartitionRow: React.FC<{ label: string; r?: BeRepartition; withUsufruit?: boolean }> = ({ label, r, withUsufruit }) => {
  const active = hasShare(r);
  return (
    <tr className={active ? 'text-neutral-800' : 'text-neutral-400'}>
      <td className="py-1 pr-2">{label}</td>
      <td className="py-1 px-2 text-right font-mono">{r?.total !== undefined ? formatPct(r.total) : '—'}</td>
      <td className="py-1 px-2 text-right font-mono">{formatPct(r?.pleine_propriete)}</td>
      <td className="py-1 px-2 text-right font-mono">{formatPct(r?.nue_propriete)}</td>
      {withUsufruit && <td className="py-1 pl-2 text-right font-mono">{formatPct(r?.usufruit)}</td>}
    </tr>
  );
};

const RepartitionTable: React.FC<{ children: React.ReactNode; withUsufruit?: boolean }> = ({ children, withUsufruit }) => (
  <table className="w-full text-[11px]">
    <thead>
      <tr className="text-[10px] uppercase tracking-wider text-neutral-400">
        <th className="text-left font-semibold pb-1 pr-2">Mode de détention</th>
        <th className="text-right font-semibold pb-1 px-2">Total</th>
        <th className="text-right font-semibold pb-1 px-2">Pleine propr.</th>
        <th className="text-right font-semibold pb-1 px-2">Nue-propr.</th>
        {withUsufruit && <th className="text-right font-semibold pb-1 pl-2">Usufruit</th>}
      </tr>
    </thead>
    <tbody className="divide-y divide-neutral-100">{children}</tbody>
  </table>
);

const YesNo: React.FC<{ label: string; value?: boolean }> = ({ label, value }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
      value ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-neutral-50 text-neutral-400 border-neutral-200'
    }`}
  >
    {value ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    {label}
  </span>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; total?: number }> = ({ icon, title, total }) => (
  <div className="flex items-center justify-between gap-2 mb-1.5">
    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
      {icon}
      {title}
    </span>
    {total !== undefined && (
      <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-aubergine-50 text-aubergine-800 border border-aubergine-200">
        {formatPct(total)}
      </span>
    )}
  </div>
);

const BeneficiaireCard: React.FC<{ b: BeneficiaireEffectif }> = ({ b }) => {
  const m = b.modalites || {};
  const capital = m.detention_de_capital;
  const votes = m.droits_de_vote;
  const vocation = m.vocation_a_devenir_titulaire_de_parts;
  const pouvoirs = m.pouvoirs_de_controle;
  const hasVocation =
    hasShare(vocation?.parts_directes) ||
    hasShare(vocation?.parts_indirectes?.par_indivision) ||
    hasShare(vocation?.parts_indirectes?.via_personnes_morales);

  const fullName = [
    (b.nom || '').toUpperCase(),
    b.nomUsage ? `(usage : ${b.nomUsage.toUpperCase()})` : '',
    (b.prenoms || []).join(' ')
  ].filter(Boolean).join(' ');
  const birth = b.dateNaissance?.annee
    ? `${b.dateNaissance.mois ? `${b.dateNaissance.mois}/` : ''}${b.dateNaissance.annee}`
    : 'Non renseignée';

  return (
    <div className="p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-aubergine-100 text-aubergine-700 flex items-center justify-center shrink-0 border border-aubergine-200">
          <Users className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <strong className="text-sm font-bold text-neutral-900 block leading-tight">{fullName || 'Bénéficiaire effectif'}</strong>
          <span className="text-[11px] text-neutral-500 font-medium block mt-0.5">
            Né(e) : {birth}
            {b.nationalite ? ` · Nationalité : ${b.nationalite}` : ''}
            {b.paysResidence ? ` · Résidence : ${b.paysResidence}` : ''}
          </span>
        </div>
      </div>

      <div className="bg-white p-2.5 rounded-lg border border-neutral-100 overflow-x-auto">
        <SectionTitle icon={<PieChart className="w-3 h-3 text-aubergine-600" />} title="Détention du capital" total={capital?.parts_totale} />
        <RepartitionTable>
          <RepartitionRow label="Parts directes" r={capital?.parts_directes} />
          <RepartitionRow label="Indirectes · par indivision" r={capital?.parts_indirectes?.par_indivision} />
          <RepartitionRow label="Indirectes · via personnes morales" r={capital?.parts_indirectes?.via_personnes_morales} />
        </RepartitionTable>
      </div>

      <div className="bg-white p-2.5 rounded-lg border border-neutral-100 overflow-x-auto">
        <SectionTitle icon={<Vote className="w-3 h-3 text-aubergine-600" />} title="Droits de vote" total={votes?.total} />
        <RepartitionTable withUsufruit>
          <RepartitionRow label="Directs" r={votes?.directes} withUsufruit />
          <RepartitionRow label="Indirects · par indivision" r={votes?.indirectes?.par_indivision} withUsufruit />
          <RepartitionRow label="Indirects · via personnes morales" r={votes?.indirectes?.via_personnes_morales} withUsufruit />
        </RepartitionTable>
      </div>

      {hasVocation && (
        <div className="bg-white p-2.5 rounded-lg border border-neutral-100 overflow-x-auto">
          <SectionTitle icon={<Hourglass className="w-3 h-3 text-aubergine-600" />} title="Vocation à devenir titulaire de parts" />
          <RepartitionTable>
            <RepartitionRow label="Parts directes" r={vocation?.parts_directes} />
            <RepartitionRow label="Indirectes · par indivision" r={vocation?.parts_indirectes?.par_indivision} />
            <RepartitionRow label="Indirectes · via personnes morales" r={vocation?.parts_indirectes?.via_personnes_morales} />
          </RepartitionTable>
        </div>
      )}

      <div className="bg-white p-2.5 rounded-lg border border-neutral-100">
        <SectionTitle icon={<Gavel className="w-3 h-3 text-aubergine-600" />} title="Pouvoirs de contrôle & représentation" />
        <div className="flex flex-wrap gap-1.5">
          <YesNo label="Décision en AG" value={pouvoirs?.decision_ag} />
          <YesNo label="Nomination du conseil d'administration" value={pouvoirs?.nommage_membres_conseil_administratif} />
          <YesNo label="Autres moyens de contrôle" value={pouvoirs?.autres} />
          <YesNo label="Représentant légal" value={m.representant_legal} />
          <YesNo label="Représentant légal (placement sans gestion déléguée)" value={m.representant_legal_placement_sans_gestion_deleguee} />
        </div>
      </div>
    </div>
  );
};

export const BeneficiairesEffectifsPanel: React.FC<BeneficiairesEffectifsPanelProps> = ({ data }) => {
  const items = data?.items || [];

  const emptyMessage = !data
    ? 'Données disponibles après une recherche SIRET avec un jeton API Entreprise.'
    : data.status === 'non_habilite'
      ? "Le jeton API Entreprise n'est pas habilité pour les bénéficiaires effectifs (accès réservé, habilitation spécifique à demander sur entreprise.api.gouv.fr)."
      : data.status === 'aucun'
        ? "Aucun bénéficiaire effectif déclaré au RNE pour cette entreprise."
        : 'Bénéficiaires effectifs momentanément indisponibles auprès de l’INPI.';

  return (
    <div className="space-y-3 pt-2 border-t border-neutral-100">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Users className="w-4 h-4 text-aubergine-600" />
            <span>Bénéficiaires effectifs (RNE · INPI)</span>
          </h4>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Personnes physiques détenant, directement ou indirectement, plus de 25 % du capital ou des droits de vote, ou exerçant un contrôle.
          </p>
        </div>
        {items.length > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-aubergine-50 text-aubergine-800 border border-aubergine-200">
            {items.length} {items.length > 1 ? 'bénéficiaires effectifs' : 'bénéficiaire effectif'}
          </span>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {items.map((b, idx) => (
            <BeneficiaireCard key={b.uuid || idx} b={b} />
          ))}
        </div>
      ) : (
        <div className="p-3 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl flex items-start gap-2 text-[11px] text-neutral-600">
          {data?.status === 'non_habilite' ? (
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
          )}
          <span>{emptyMessage}</span>
        </div>
      )}
    </div>
  );
};
