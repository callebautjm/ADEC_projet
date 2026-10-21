/**
 * Step 1 : Identification de l'établissement & Profil Économique
 * Collectivité de Corse / ADEC - Guide des Aides 2026 & Fonds SALVEZZA
 * Intégration unifiée : API Entreprise v4, RNE (INPI), DGFiP, URSSAF et BODACC
 */

import React, { useState } from 'react';
import { CompanyProfile, LegalForm, ActivitySector, MandataireSocial } from '../../types';
import {
  Search,
  KeyRound,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  Scale,
  FileText,
  UserPlus,
  Edit3,
  Trash2,
  X,
  MapPin
} from 'lucide-react';
import { fetchEntrepriseBySiret, fetchBodaccBySiren, isValidLuhn } from '../../services/apiEntreprise';
import { useHasApiEntrepriseToken } from '../../hooks/useHasApiEntrepriseToken';
import { ApiEntrepriseModal } from '../ApiEntrepriseModal';
import { BeneficiairesEffectifsPanel } from './BeneficiairesEffectifsPanel';
import { ComplianceRow } from './ComplianceRow';
import { AttestationsList, getCurrentMandataires, secondaryActionClass } from '../Attestations/AttestationsList';
import { SalvezzaCommunesModal } from '../Salvezza/SalvezzaCommunesModal';
import {
  determineCorsicaZoning,
  searchCorsicaCommunes,
  CorsicaCommuneReference
} from '../../services/corsicaZoning';
import { analyzeCompanyCreationDate } from '../../utils/companyAge';
import { cleanSiret, isForbiddenSiretKey } from '../../utils/siret';
import {
  Badge,
  Modal,
  Notice,
  Panel,
  SectionHeading,
  StatusDot,
  SegmentedControl,
  btn,
  checkRowClass,
  hintClass,
  iconBtn,
  iconBtnDanger,
  inputClass,
  labelClass
} from '../Layout/ui';

interface StepCompanyProps {
  data: CompanyProfile;
  onChange: (updated: Partial<CompanyProfile>) => void;
}

const MANDAT_PRESETS = ['Gérant', 'Associée co-gérante', 'Président', 'Directeur Général', 'Gérant majoritaire', 'Associé unique'];

export const StepCompany: React.FC<StepCompanyProps> = ({ data, onChange }) => {

  const [siretQuery, setSiretQuery] = useState(() => cleanSiret(data.siret || ''));
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);
  const [communeSuggestions, setCommuneSuggestions] = useState<CorsicaCommuneReference[]>([]);
  const [isManualZoningOverride, setIsManualZoningOverride] = useState(false);
  const [isSalvezzaModalOpen, setIsSalvezzaModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const hasToken = useHasApiEntrepriseToken();
  const bodacc = data.complianceData?.bodacc;

  // Mandataires sociaux et dirigeants déclarés
  const currentMandataires = getCurrentMandataires(data);

  // Observations issues de l'attestation d'immatriculation RNE (INPI)
  const currentObservations = data.complianceData?.rne?.observations || [];

  const [isMandataireModalOpen, setIsMandataireModalOpen] = useState(false);
  const [editingMandataireIndex, setEditingMandataireIndex] = useState<number | null>(null);
  const [mandataireForm, setMandataireForm] = useState<MandataireSocial>({
    type: 'personne_physique',
    nom: '',
    prenom: '',
    denomination: '',
    fonction: 'Gérant',
    dateNaissance: '',
    nationalite: 'Française'
  });

  const handleOpenAddMandataire = () => {
    setMandataireForm({
      type: 'personne_physique',
      nom: '',
      prenom: '',
      denomination: '',
      fonction: 'Gérant',
      dateNaissance: '',
      nationalite: 'Française'
    });
    setEditingMandataireIndex(null);
    setIsMandataireModalOpen(true);
  };

  const handleOpenEditMandataire = (index: number) => {
    const target = currentMandataires[index];
    if (target) {
      setMandataireForm({ ...target });
      setEditingMandataireIndex(index);
      setIsMandataireModalOpen(true);
    }
  };

  const handleSaveMandataire = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList = [...currentMandataires];
    if (editingMandataireIndex !== null && editingMandataireIndex >= 0) {
      updatedList[editingMandataireIndex] = { ...mandataireForm };
    } else {
      updatedList.push({ ...mandataireForm });
    }

    const updatedCompliance = {
      ...data.complianceData,
      infogreffe: {
        ...data.complianceData?.infogreffe,
        mandatairesSociaux: updatedList
      }
    };

    onChange({
      mandataires: updatedList,
      complianceData: updatedCompliance
    });

    setIsMandataireModalOpen(false);
  };

  const handleDeleteMandataire = (index: number) => {
    const updatedList = currentMandataires.filter((_, idx) => idx !== index);
    const updatedCompliance = {
      ...data.complianceData,
      infogreffe: {
        ...data.complianceData?.infogreffe,
        mandatairesSociaux: updatedList
      }
    };

    onChange({
      mandataires: updatedList,
      complianceData: updatedCompliance
    });
  };

  const handleRestoreDefaultMandataires = () => {
    const defaultList: MandataireSocial[] = [
      { type: 'personne_physique', nom: 'PAOLI', prenom: 'Antone', fonction: 'Gérant', dateNaissance: '12/06/1984', nationalite: 'Française' },
      { type: 'personne_physique', nom: 'ALBERTI', prenom: 'Maria', fonction: 'Associée co-gérante', dateNaissance: '20/11/1988', nationalite: 'Française' }
    ];
    const updatedCompliance = {
      ...data.complianceData,
      infogreffe: {
        ...data.complianceData?.infogreffe,
        mandatairesSociaux: defaultList
      }
    };
    onChange({
      mandataires: defaultList,
      complianceData: updatedCompliance
    });
  };

  const [isBodaccLoading, setIsBodaccLoading] = useState(false);

  const [apiFeedback, setApiFeedback] = useState<{
    success?: boolean;
    message?: string;
    details?: string;
    source?: string;
  } | null>(null);

  // Typologie géographique basée sur la commune
  const zoningAnalysis = determineCorsicaZoning(
    data.city,
    data.postalCode,
    data.qpvNeighborhood,
    data.communeCode || data.salvezzaCommune?.codeCommune
  );

  // Analyse d'ancienneté d'entreprise
  const ageAnalysis = analyzeCompanyCreationDate(data.creationDate);

  const handleCreationDateChange = (rawDate: string) => {
    const analysis = analyzeCompanyCreationDate(rawDate);
    onChange({
      creationDate: rawDate,
      creationYear: analysis.creationYear,
      companyAgeLabel: analysis.ageLabel,
      companyAgeMonths: analysis.ageInMonths,
      isUnderFiveYears: analysis.isUnderFiveYears,
      registeredSinceAtLeast12Months: analysis.registeredSinceAtLeast12Months
    });
  };

  const handleFetchSiret = async (customSiret?: string) => {
    const targetSiret = cleanSiret(customSiret || siretQuery || '');
    if (!targetSiret || targetSiret.length !== 14 || !/^\d+$/.test(targetSiret)) {
      setApiFeedback({
        success: false,
        message: 'Le SIRET doit comporter exactement 14 chiffres.'
      });
      return;
    }

    setIsLoadingApi(true);
    setApiFeedback(null);

    const result = await fetchEntrepriseBySiret(targetSiret);
    setIsLoadingApi(false);

    if (result.success && result.mappedProfile) {
      onChange(result.mappedProfile);
      setSiretQuery(targetSiret);
      const isDateFound = Boolean(result.mappedProfile.creationDate);
      const dateText = isDateFound
        ? `Création INSEE : ${result.mappedProfile.companyAgeLabel || result.mappedProfile.creationDate}`
        : 'Date non communiquée (à renseigner)';

      setApiFeedback({
        success: true,
        source: result.source,
        message: `Établissement « ${result.mappedProfile.name} » synchronisé.`,
        details: `${result.mappedProfile.legalForm} · ${result.mappedProfile.city} (${result.mappedProfile.postalCode}) · ~${result.mappedProfile.headcount} ETP · ${dateText}`
      });
    } else {
      setApiFeedback({
        success: false,
        message: result.error || 'Erreur lors de l’interrogation de l’API Entreprise.',
        details: result.details ? JSON.stringify(result.details) : undefined
      });
    }
  };

  const isCurrentSiretValidLuhn = data.siret ? isValidLuhn(data.siret) : false;
  const activeSiren = data.siren || (data.siret ? data.siret.replace(/\D/g, '').slice(0, 9) : '');

  const handleRefreshBodacc = async () => {
    if (!activeSiren) return;
    setIsBodaccLoading(true);
    const bodaccResult = await fetchBodaccBySiren(activeSiren);
    setIsBodaccLoading(false);
    if (bodaccResult) {
      onChange({
        complianceData: {
          ...data.complianceData,
          bodacc: bodaccResult
        }
      });
    }
  };

  const isSalvezzaCommune = zoningAnalysis.isSalvezza || Boolean(data.salvezzaCommune);

  return (
    <div className="space-y-4">
      {/* Fenêtres modales */}
      <ApiEntrepriseModal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)} />

      <SalvezzaCommunesModal
        isOpen={isSalvezzaModalOpen}
        onClose={() => setIsSalvezzaModalOpen(false)}
        selectedCommuneCode={data.communeCode || data.salvezzaCommune?.codeCommune}
        onSelectCommune={(commune) => {
          onChange({
            city: commune.nom,
            communeName: commune.nom,
            communeCode: commune.codeCommune,
            salvezzaCommune: commune,
            locationType: 'RURAL_SALVEZZA_UNDER_1000',
            isEstablishedInCorsica: true,
            hasMainExploitationInCorsica: true
          });
        }}
      />

      <SectionHeading
        title="1. Entreprise"
        description="Identité, registres officiels (INSEE, RNE, DGFiP, URSSAF, BODACC), implantation et gouvernance."
        actions={
          <button
            type="button"
            onClick={() => setIsTokenModalOpen(true)}
            className={btn('secondary', 'sm')}
            title="Configuration du jeton API Entreprise v4"
          >
            <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
            Jeton API
            <StatusDot tone={hasToken ? 'success' : 'warning'} />
          </button>
        }
      />

      {/* Recherche et synchronisation par SIRET */}
      <Panel title="Recherche par SIRET" description="Répertoire Sirene (INSEE) et registres associés : les champs ci-dessous sont mis à jour." headingLevel={3}>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              inputMode="numeric"
              aria-label="Numéro SIRET"
              value={siretQuery}
              onChange={(e) => {
                const clean = cleanSiret(e.target.value);
                setSiretQuery(clean);
                if (clean.length === 14) {
                  onChange({ siret: clean });
                }
              }}
              onKeyDown={(e) => {
                if (isForbiddenSiretKey(e.key)) e.preventDefault();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleFetchSiret();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text');
                const clean = cleanSiret(text);
                setSiretQuery(clean);
                if (clean.length === 14) {
                  onChange({ siret: clean });
                }
              }}
              placeholder="14 chiffres"
              className={`${inputClass} pr-20 font-mono tracking-wide`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {siretQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSiretQuery('')}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  title="Effacer"
                  aria-label="Effacer le SIRET"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className={`text-[11px] font-mono ${siretQuery.length === 14 ? 'text-emerald-700' : 'text-neutral-400'}`}>
                {siretQuery.length}/14
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleFetchSiret()}
            disabled={isLoadingApi || !siretQuery.trim()}
            className={btn('primary')}
          >
            {isLoadingApi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {isLoadingApi ? 'Synchronisation…' : 'Synchroniser'}
          </button>
        </div>

        {apiFeedback && (
          <Notice tone={apiFeedback.success ? 'success' : 'danger'} title={apiFeedback.message}>
            {apiFeedback.details && <p className="text-neutral-600">{apiFeedback.details}</p>}
          </Notice>
        )}
      </Panel>

      {/* Fiche établissement : identité, conformité & données des registres */}
      {data.siret && (
        <Panel
          headingLevel={3}
          title={
            <>
              {data.name || 'Établissement'}
              {data.isHeadOffice !== undefined && (
                <Badge tone={data.isHeadOffice ? 'info' : 'neutral'}>{data.isHeadOffice ? 'Siège' : 'Établissement secondaire'}</Badge>
              )}
              {data.administrativeStatus && <Badge tone="success">{data.administrativeStatus}</Badge>}
            </>
          }
          description={
            <span className="font-mono">
              SIRET {data.siret}
              {isCurrentSiretValidLuhn && (
                <span title="Clé de Luhn valide" className="inline-flex align-middle ml-1 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                </span>
              )}
              {activeSiren && <> · SIREN {activeSiren}</>}
            </span>
          }
          actions={
            <>
              {activeSiren && (
                <a
                  href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${activeSiren}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btn('secondary', 'sm')}
                  title="Fiche officielle sur l'Annuaire des Entreprises (data.gouv.fr)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Annuaire des Entreprises
                </a>
              )}
              {data.rawApiData && (
                <button type="button" onClick={() => setShowRawData(!showRawData)} className={btn('ghost', 'sm')}>
                  <FileText className="w-3.5 h-3.5" />
                  {showRawData ? 'Masquer le JSON' : 'JSON brut'}
                </button>
              )}
            </>
          }
        >
          {showRawData && data.rawApiData && (
            <pre className="bg-neutral-900 text-neutral-200 p-3 rounded-md text-[10px] leading-relaxed font-mono max-h-56 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(data.rawApiData, null, 2)}
            </pre>
          )}

          {/* Pièces justificatives : les 4 attestations, puis BODACC et observations */}
          <AttestationsList
            data={data}
            hasToken={hasToken}
            mandatairesDescription="Représentation légale de la société. Détail et bénéficiaires effectifs dans la partie Gouvernance ci-dessous."
          >
            <ComplianceRow
              icon={<Scale className="w-4 h-4" />}
              title="Situation judiciaire"
              source="BODACC · DILA / Journal officiel"
              tone={!bodacc ? 'unknown' : bodacc.hasProcedureCollective ? 'alert' : 'ok'}
              statusLabel={!bodacc ? 'Non consultée' : bodacc.hasProcedureCollective ? 'Procédure collective' : 'In bonis'}
              description={
                bodacc?.synthese ||
                (bodacc ? 'Aucune procédure collective publiée au BODACC.' : 'Lancez une recherche SIRET pour consulter le BODACC.')
              }
              actions={
                activeSiren ? (
                  <button
                    type="button"
                    onClick={handleRefreshBodacc}
                    disabled={isBodaccLoading}
                    className={secondaryActionClass}
                    title="Actualiser les avis BODACC"
                  >
                    <RefreshCw className={`w-3 h-3 ${isBodaccLoading ? 'animate-spin' : ''}`} />
                    <span>Actualiser</span>
                  </button>
                ) : undefined
              }
            />

            <ComplianceRow
              icon={<FileText className="w-4 h-4" />}
              title="Observations au RNE"
              source="INPI · Mentions RCS / RNM"
              tone={!data.complianceData?.rne ? 'unknown' : currentObservations.length > 0 ? 'warning' : 'ok'}
              statusLabel={
                !data.complianceData?.rne
                  ? 'Non consultées'
                  : currentObservations.length > 0
                    ? `${currentObservations.length} observation${currentObservations.length > 1 ? 's' : ''}`
                    : 'Aucune'
              }
              description={
                !data.complianceData?.rne
                  ? 'Lancez une recherche SIRET pour consulter les observations.'
                  : currentObservations.length > 0
                    ? 'Mentions inscrites au registre, à examiner pour l’instruction :'
                    : 'Aucune observation ni mention d’office inscrite au registre.'
              }
              actions={
                activeSiren ? (
                  <a
                    href={`https://annuaire-entreprises.data.gouv.fr/annonces/${activeSiren}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={secondaryActionClass}
                    title="Annonces et observations sur l'Annuaire des Entreprises"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Annonces</span>
                  </a>
                ) : undefined
              }
            >
              {currentObservations.length > 0 && (
                <ul className="space-y-1.5 md:pl-[15.75rem]">
                  {currentObservations.map((obs, idx) => (
                    <li key={obs.id || idx} className="text-[11px] bg-amber-50 border border-amber-200 rounded-md px-2.5 py-2 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-500">
                        <span className="font-semibold text-neutral-700">
                          {(obs.numero || obs.numObservation) ? `N° ${obs.numero || obs.numObservation}` : `#${idx + 1}`}
                        </span>
                        {(obs.date || obs.dateAjout) && <span className="font-mono">{obs.date || obs.dateAjout}</span>}
                        {(obs.fournisseur || obs.source) && <span>{obs.fournisseur || obs.source}</span>}
                      </div>
                      <p className="text-neutral-800 leading-relaxed">{obs.texte || obs.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </ComplianceRow>
          </AttestationsList>

          {/* Données complémentaires des registres (non saisissables) */}
          <div className="border border-neutral-200 rounded-md">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              aria-expanded={showTechnicalDetails}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <span>Données complémentaires des registres (TVA, social, établissements)</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
            </button>

            {showTechnicalDetails && (
              <div className="px-3 py-3 border-t border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 text-xs">
                <dl className="space-y-1">
                  <p className="text-[11px] font-semibold text-neutral-500">Fiscalité</p>
                  <div className="flex justify-between gap-2">
                    <dt className="text-neutral-500">TVA intracom.</dt>
                    <dd className="font-mono text-neutral-800">{data.tvaIntracommunautaire || `FR${String((12 + 3 * (parseInt(activeSiren || '0', 10) % 97)) % 97).padStart(2, '0')}${activeSiren}`}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-neutral-500">Régime fiscal</dt>
                    <dd className="text-neutral-800 text-right">{data.complianceData?.dgfip?.liassesFiscales?.regimeImposition || 'Non communiqué'}</dd>
                  </div>
                </dl>

                <dl className="space-y-1">
                  <p className="text-[11px] font-semibold text-neutral-500">Social & emploi</p>
                  <div className="flex justify-between gap-2">
                    <dt className="text-neutral-500">Tranche INSEE</dt>
                    <dd className="text-neutral-800 text-right">{data.headcountTranche || 'Non communiquée'}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-neutral-500">Convention (IDCC)</dt>
                    <dd className="text-neutral-800 truncate max-w-[140px]" title={data.conventionCollective?.idcc}>
                      {data.conventionCollective?.idcc || 'Non communiquée'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-neutral-500">Employeur</dt>
                    <dd className="text-neutral-800">
                      {data.caractereEmployeur === 'O' ? 'Oui' : data.caractereEmployeur === 'N' ? 'Non' : 'Non communiqué'}
                    </dd>
                  </div>
                </dl>

                <dl className="space-y-1">
                  <p className="text-[11px] font-semibold text-neutral-500">Établissements & labels</p>
                  <div className="flex justify-between gap-2">
                    <dt className="text-neutral-500">Établissements</dt>
                    <dd className="text-neutral-800">{data.nombreEtablissements ?? 1} ({data.nombreEtablissementsOuverts ?? 1} ouvert)</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-neutral-500">Diffusion INSEE</dt>
                    <dd className="text-neutral-800">{data.statutDiffusion === 'O' ? 'Publique' : 'Protégée'}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-neutral-500">Agriculture bio</dt>
                    <dd className={data.labelsAndCertifications?.isBio ? 'text-emerald-700' : 'text-neutral-800'}>
                      {data.labelsAndCertifications?.isBio ? 'Certifiée Agence Bio' : 'Non'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* Volet A : identification, capital & activité */}
      <Panel title="Identification juridique, capital et activité" headingLevel={3}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="company-name" className={labelClass}>Raison sociale / nom commercial</label>
            <input
              id="company-name"
              type="text"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Ex : Entreprise Corsica"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="company-capital" className={labelClass}>Capital social</label>
            <div className="relative">
              <input
                id="company-capital"
                type="number"
                min="0"
                step="1000"
                value={data.capitalSocial ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                  onChange({
                    capitalSocial: val,
                    capitalSocialFormatted: val !== undefined ? `${new Intl.NumberFormat('fr-FR').format(val)} €` : undefined,
                    capitalSocialSource: val !== undefined ? 'Saisie manuelle' : undefined
                  });
                }}
                placeholder="Ex : 50000"
                className={`${inputClass} pr-7`}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">€</span>
            </div>
            <p className={`${hintClass} truncate`} title={data.capitalSocialSource}>
              {data.capitalSocial
                ? `Source : ${data.capitalSocialSource || 'non précisée'}`
                : (data.legalForm === 'COMMERCIANT_ARTISAN_EI' || data.legalForm === 'MICRO_ENTREPRISE' ? 'Non applicable (EI)' : 'Non renseigné')}
            </p>
          </div>

          <div>
            <label htmlFor="company-naf" className={labelClass}>Code NAF / APE</label>
            <input
              id="company-naf"
              type="text"
              value={data.nafCode || ''}
              onChange={(e) => onChange({ nafCode: e.target.value })}
              placeholder="Ex : 10.71C"
              className={`${inputClass} font-mono`}
            />
            <p className={`${hintClass} truncate`} title={data.nafLabel}>
              {data.nafLabel || 'Libellé d’activité non renseigné'}
            </p>
          </div>

          <div>
            <label htmlFor="company-creation" className={labelClass}>Date d’immatriculation</label>
            <input
              id="company-creation"
              type="date"
              value={ageAnalysis.dateIso || (data.creationDate && data.creationDate.length === 10 && data.creationDate.includes('-') ? data.creationDate : '')}
              onChange={(e) => handleCreationDateChange(e.target.value)}
              className={`${inputClass} font-mono`}
            />
            <p className={`${hintClass} truncate`}>
              {ageAnalysis.isDateKnown ? (
                <span className={ageAnalysis.isUnderFiveYears ? 'font-medium text-emerald-700' : ''}>
                  {ageAnalysis.ageLabel} · {ageAnalysis.isUnderFiveYears ? 'Éligible Impresa Sì (≤ 5 ans)' : '> 5 ans'}
                </span>
              ) : (
                <span className="text-amber-700 font-medium">Date à renseigner</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company-legal-form" className={labelClass}>Forme juridique</label>
            <select
              id="company-legal-form"
              value={data.legalForm}
              onChange={(e) => onChange({ legalForm: e.target.value as LegalForm })}
              className={inputClass}
            >
              <option value="SARL_EURL">SARL / EURL (Société à responsabilité limitée)</option>
              <option value="SAS_SASU">SAS / SASU (Société par actions simplifiée)</option>
              <option value="SA">SA (Société anonyme)</option>
              <option value="COMMERCIANT_ARTISAN_EI">Entreprise Individuelle (Artisan, Commerçant en nom propre)</option>
              <option value="MICRO_ENTREPRISE">Micro-entreprise / Auto-entrepreneur (Régime simplifié)</option>
              <option value="ASSOCIATION_ESS">Association loi 1901 à activité économique (ESS)</option>
              <option value="SIAE">Structure d’Insertion par l’Activité Économique (SIAE)</option>
              <option value="COOPERATIVE_SCOP_SCIC">Société coopérative (SCOP, SCIC)</option>
              <option value="SCI">SCI (Société Civile Immobilière)</option>
              <option value="PROFESSION_LIBERALE">Profession libérale réglementée</option>
              <option value="AUTRE">Autre forme juridique</option>
            </select>
            {(data.natureJuridiqueLibelle || data.enterpriseCategory) && (
              <p className={`${hintClass} truncate`} title={data.natureJuridiqueLibelle}>
                Registre : {data.natureJuridiqueLibelle || '—'}
                {data.natureJuridiqueCode ? ` (code ${data.natureJuridiqueCode})` : ''}
                {data.enterpriseCategory ? ` · Catégorie ${data.enterpriseCategory}` : ''}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="company-sector" className={labelClass}>Secteur d’activité principal</label>
            <select
              id="company-sector"
              value={data.sector}
              onChange={(e) => onChange({ sector: e.target.value as ActivitySector })}
              className={inputClass}
            >
              <option value="INDUSTRIE">Industrie manufacturière, transformation, production</option>
              <option value="COMMERCE">Commerce de détail et de proximité</option>
              <option value="ARTISANAT">Artisanat de fabrication ou de services</option>
              <option value="SERVICES">Services aux entreprises ou aux particuliers</option>
              <option value="ESS">Économie Sociale et Solidaire (ESS)</option>
              <option value="AGRICULTURE_PECHE_SYLVICULTURE">Agriculture, pêche, sylviculture (Production primaire)</option>
              <option value="HEBERGEMENT_TOURISTIQUE">Hébergement touristique exclusif (Hôtels, meublés)</option>
              <option value="FINANCE_IMMOBILIER">Intermédiation financière, assurance ou promotion</option>
            </select>
          </div>
        </div>

        {/* Alertes réglementaires contextuelles */}
        {data.legalForm === 'MICRO_ENTREPRISE' && (
          <Notice tone="warning" title="Régime micro-entreprise">
            Le régime des micro-entreprises est exclu du Guide des aides de l’ADEC : l’entreprise doit basculer vers un régime réel pour prétendre aux subventions.
          </Notice>
        )}

        {data.sector === 'AGRICULTURE_PECHE_SYLVICULTURE' && (
          <Notice tone="warning" title="Production primaire">
            La production primaire agricole et de pêche relève des dispositifs d’aide de l’<strong>ODARC</strong> (Office du Développement Agricole et Rural de la Corse).
          </Notice>
        )}

        {data.sector === 'HEBERGEMENT_TOURISTIQUE' && (
          <Notice tone="warning" title="Exclusion réglementaire">
            L’hébergement touristique exclusif est exclu du champ du Guide des aides ADEC 2026.
          </Notice>
        )}
      </Panel>

      {/* Volet B : implantation territoriale & dispositif Salvezza */}
      <Panel title="Implantation en Corse et zonage Salvezza" description="Délibération 21/177 AC et Plan Salvezza." headingLevel={3}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="company-address" className={labelClass}>Adresse (voie)</label>
            <input
              id="company-address"
              type="text"
              value={data.address || ''}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Ex : 12 cours Paoli"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="company-postal-code" className={labelClass}>Code postal</label>
            <input
              id="company-postal-code"
              type="text"
              value={data.postalCode || ''}
              onChange={(e) => {
                const cp = e.target.value;
                const isCorse = cp.startsWith('20') || cp.startsWith('2A') || cp.startsWith('2B');
                const autoZoning = determineCorsicaZoning(data.city, cp, data.qpvNeighborhood, data.communeCode);
                onChange({
                  postalCode: cp,
                  isEstablishedInCorsica: isCorse,
                  hasMainExploitationInCorsica: isCorse,
                  salvezzaCommune: autoZoning.salvezzaCommune,
                  ...(!isManualZoningOverride ? { locationType: autoZoning.locationType } : {})
                });
              }}
              placeholder="Ex : 20250"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div className="relative">
            <label htmlFor="company-city" className={`${labelClass} flex items-center justify-between`}>
              <span>Commune d’implantation</span>
              {zoningAnalysis.isCorsica && (
                <span className="text-[11px] font-normal text-neutral-500">
                  {zoningAnalysis.departement === '2A' ? 'Corse-du-Sud (2A)' : 'Haute-Corse (2B)'}
                </span>
              )}
            </label>
            <input
              id="company-city"
              type="text"
              autoComplete="off"
              value={data.city || ''}
              onChange={(e) => {
                const val = e.target.value;
                const suggestions = searchCorsicaCommunes(val);
                setCommuneSuggestions(suggestions);
                setShowCommuneSuggestions(suggestions.length > 0);

                const autoZoning = determineCorsicaZoning(val, data.postalCode, data.qpvNeighborhood, data.communeCode);
                onChange({
                  city: val,
                  communeName: val,
                  salvezzaCommune: autoZoning.salvezzaCommune,
                  isEstablishedInCorsica: autoZoning.isCorsica,
                  hasMainExploitationInCorsica: autoZoning.isCorsica,
                  ...(!isManualZoningOverride ? { locationType: autoZoning.locationType } : {})
                });
              }}
              onFocus={() => {
                if (data.city && data.city.length >= 2) {
                  const suggestions = searchCorsicaCommunes(data.city);
                  setCommuneSuggestions(suggestions);
                  setShowCommuneSuggestions(suggestions.length > 0);
                }
              }}
              placeholder="Ex : Corte, Ajaccio, Bastia…"
              className={inputClass}
            />

            {/* Suggestions de communes corses */}
            {showCommuneSuggestions && communeSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-30 max-h-52 overflow-y-auto divide-y divide-neutral-100">
                <div className="px-3 py-1.5 bg-neutral-50 text-[11px] font-medium text-neutral-500 flex items-center justify-between">
                  <span>Communes corses</span>
                  <button
                    type="button"
                    onClick={() => setShowCommuneSuggestions(false)}
                    className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                    aria-label="Fermer les suggestions"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {communeSuggestions.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const autoZoning = determineCorsicaZoning(c.name, c.postalCode, undefined, c.inseeCode);
                      onChange({
                        city: c.name,
                        communeName: c.name,
                        postalCode: c.postalCode,
                        communeCode: c.inseeCode,
                        salvezzaCommune: autoZoning.salvezzaCommune,
                        isEstablishedInCorsica: true,
                        hasMainExploitationInCorsica: true,
                        locationType: autoZoning.locationType,
                        qpvNeighborhood: undefined
                      });
                      setShowCommuneSuggestions(false);
                      setIsManualZoningOverride(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span>
                      <span className="text-neutral-900">{c.name}</span>
                      <span className="text-neutral-500 ml-1.5 font-mono">({c.postalCode})</span>
                    </span>
                    <span className="text-[11px] text-neutral-500">{c.microregion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zonage et éligibilité Salvezza */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md">
          <div className="flex items-start gap-2.5 min-w-0">
            <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSalvezzaCommune ? 'text-emerald-600' : 'text-neutral-400'}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-medium text-neutral-900">
                  {isSalvezzaCommune
                    ? `Commune éligible au Fonds Salvezza (${zoningAnalysis.salvezzaCommune?.nomCorse || data.salvezzaCommune?.nomCorse || data.city})`
                    : `Zonage d’implantation : ${zoningAnalysis.badgeLabel}`}
                </span>
                {zoningAnalysis.salvezzaCommune && (
                  <Badge tone="success">Score : {zoningAnalysis.salvezzaCommune.scoreContrainte}</Badge>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {isSalvezzaCommune
                  ? 'Taux d’intervention majorés (+10 % à +20 %) et bonifications sur les investissements et aides à l’emploi.'
                  : 'Régime territorial de droit commun. Les 230 communes sous contrainte bénéficient du Fonds Salvezza.'}
              </p>
            </div>
          </div>

          <button type="button" onClick={() => setIsSalvezzaModalOpen(true)} className={btn('secondary', 'sm')}>
            Liste des 230 communes
          </button>
        </div>

        {/* Déclarations d'implantation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className={checkRowClass}>
            <input
              type="checkbox"
              checked={data.isEstablishedInCorsica}
              onChange={(e) => onChange({ isEstablishedInCorsica: e.target.checked })}
              className="w-4 h-4 mt-px shrink-0"
            />
            <span>
              <span className="font-medium text-neutral-900 block">Établie en Corse</span>
              <span className="text-neutral-500">Siège social ou établissement secondaire réel immatriculé en Corse</span>
            </span>
          </label>

          <label className={checkRowClass}>
            <input
              type="checkbox"
              checked={data.hasMainExploitationInCorsica}
              onChange={(e) => onChange({ hasMainExploitationInCorsica: e.target.checked })}
              className="w-4 h-4 mt-px shrink-0"
            />
            <span>
              <span className="font-medium text-neutral-900 block">Exploitation principale en Corse</span>
              <span className="text-neutral-500">Activité opérationnelle effective exercée sur l’île</span>
            </span>
          </label>
        </div>
      </Panel>

      {/* Volet D : gouvernance & mandataires sociaux */}
      <Panel
        headingLevel={3}
        title="Gouvernance et mandataires sociaux (RNE · INPI)"
        description="Dirigeants habilités à signer les demandes de subvention."
        actions={
          <>
            <Badge>
              {currentMandataires.length} {currentMandataires.length > 1 ? 'dirigeants' : 'dirigeant'}
            </Badge>
            <button type="button" onClick={handleOpenAddMandataire} className={btn('secondary', 'sm')}>
              <UserPlus className="w-3.5 h-3.5" />
              Ajouter un dirigeant
            </button>
          </>
        }
      >
        {currentMandataires.length > 0 ? (
          <div className="border border-neutral-200 rounded-md overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
                  <th className="py-2 px-3 font-medium">Dirigeant</th>
                  <th className="py-2 px-3 font-medium">Fonction</th>
                  <th className="py-2 px-3 font-medium">Date de naissance</th>
                  <th className="py-2 px-3 font-medium">Nationalité</th>
                  <th className="py-2 px-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {currentMandataires.map((m, idx) => {
                  const isMoral = m.type === 'personne_morale';
                  const displayName = isMoral
                    ? (m.denomination || m.nom || 'Personne morale')
                    : `${(m.nom || '').toUpperCase()} ${m.prenom || ''}`.trim() || 'Dirigeant';

                  return (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-2 px-3">
                        <span className="font-medium text-neutral-900 block">{displayName}</span>
                        <span className="text-[11px] text-neutral-500">{isMoral ? 'Personne morale' : 'Personne physique'}</span>
                      </td>
                      <td className="py-2 px-3 text-neutral-800">{m.fonction || 'Gérant'}</td>
                      <td className="py-2 px-3 font-mono text-neutral-700">{isMoral ? '—' : m.dateNaissance || 'Non renseignée'}</td>
                      <td className="py-2 px-3 text-neutral-700">{m.nationalite || '—'}</td>
                      <td className="py-1.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMandataire(idx)}
                          title="Modifier ce dirigeant"
                          aria-label={`Modifier ${displayName}`}
                          className={iconBtn}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMandataire(idx)}
                          title="Supprimer ce dirigeant"
                          aria-label={`Supprimer ${displayName}`}
                          className={iconBtnDanger}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-3 py-4 border border-dashed border-neutral-300 rounded-md text-center space-y-2.5">
            <p className="text-xs text-neutral-600">Aucun gérant ni mandataire social renseigné pour cet établissement.</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={handleOpenAddMandataire} className={btn('secondary', 'sm')}>
                <UserPlus className="w-3.5 h-3.5" />
                Ajouter un dirigeant
              </button>
              <button type="button" onClick={handleRestoreDefaultMandataires} className={btn('ghost', 'sm')}>
                Restaurer les dirigeants par défaut (Antone PAOLI & Maria ALBERTI)
              </button>
            </div>
          </div>
        )}

        <BeneficiairesEffectifsPanel data={data.complianceData?.beneficiairesEffectifs} />
      </Panel>

      {/* Modale d'édition / ajout de mandataire social */}
      {isMandataireModalOpen && (
        <Modal
          size="md"
          title={editingMandataireIndex !== null ? 'Modifier le dirigeant' : 'Ajouter un dirigeant'}
          subtitle="Identification pour le dossier ADEC et le RNE."
          onClose={() => setIsMandataireModalOpen(false)}
          footer={
            <>
              <span />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIsMandataireModalOpen(false)} className={btn('secondary')}>
                  Annuler
                </button>
                <button type="submit" form="mandataire-form" className={btn('primary')}>
                  {editingMandataireIndex !== null ? 'Mettre à jour' : 'Ajouter le dirigeant'}
                </button>
              </div>
            </>
          }
        >
          <form id="mandataire-form" onSubmit={handleSaveMandataire} className="space-y-4 text-xs">
            <div>
              <span className={labelClass}>Type de personne</span>
              <SegmentedControl
                ariaLabel="Type de personne"
                value={mandataireForm.type === 'personne_morale' ? 'personne_morale' : 'personne_physique'}
                onChange={(type) => setMandataireForm({ ...mandataireForm, type })}
                options={[
                  { value: 'personne_physique', label: 'Personne physique' },
                  { value: 'personne_morale', label: 'Personne morale' }
                ]}
              />
            </div>

            {mandataireForm.type === 'personne_morale' ? (
              <div>
                <label htmlFor="mandataire-denomination" className={labelClass}>
                  Dénomination sociale de la personne morale *
                </label>
                <input
                  id="mandataire-denomination"
                  type="text"
                  required
                  value={mandataireForm.denomination || mandataireForm.nom || ''}
                  onChange={(e) => setMandataireForm({ ...mandataireForm, denomination: e.target.value, nom: e.target.value })}
                  placeholder="Ex : Holding Corsica Investissements SAS"
                  className={inputClass}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="mandataire-nom" className={labelClass}>
                    Nom (de famille / d’usage) *
                  </label>
                  <input
                    id="mandataire-nom"
                    type="text"
                    required
                    value={mandataireForm.nom || ''}
                    onChange={(e) => setMandataireForm({ ...mandataireForm, nom: e.target.value.toUpperCase() })}
                    placeholder="Ex : PAOLI"
                    className={`${inputClass} uppercase`}
                  />
                </div>
                <div>
                  <label htmlFor="mandataire-prenom" className={labelClass}>
                    Prénom *
                  </label>
                  <input
                    id="mandataire-prenom"
                    type="text"
                    required
                    value={mandataireForm.prenom || ''}
                    onChange={(e) => setMandataireForm({ ...mandataireForm, prenom: e.target.value })}
                    placeholder="Ex : Antone"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Fonction & rôle */}
            <div>
              <label htmlFor="mandataire-fonction" className={labelClass}>
                Fonction / mandat légal *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  aria-label="Mandat type"
                  value={MANDAT_PRESETS.includes(mandataireForm.fonction || '') ? mandataireForm.fonction : 'Autre'}
                  onChange={(e) => {
                    if (e.target.value !== 'Autre') {
                      setMandataireForm({ ...mandataireForm, fonction: e.target.value });
                    }
                  }}
                  className={inputClass}
                >
                  <option value="Gérant">Gérant</option>
                  <option value="Associée co-gérante">Associé(e) co-gérant(e)</option>
                  <option value="Président">Président</option>
                  <option value="Directeur Général">Directeur Général</option>
                  <option value="Gérant majoritaire">Gérant majoritaire</option>
                  <option value="Associé unique">Associé unique</option>
                  <option value="Autre">Autre mandat (personnalisé)…</option>
                </select>

                <input
                  id="mandataire-fonction"
                  type="text"
                  required
                  value={mandataireForm.fonction || ''}
                  onChange={(e) => setMandataireForm({ ...mandataireForm, fonction: e.target.value })}
                  placeholder="Intitulé exact du mandat"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Date de naissance et nationalité pour une personne physique */}
            {mandataireForm.type !== 'personne_morale' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="mandataire-naissance" className={labelClass}>
                    Date de naissance
                  </label>
                  <input
                    id="mandataire-naissance"
                    type="text"
                    value={mandataireForm.dateNaissance || ''}
                    onChange={(e) => setMandataireForm({ ...mandataireForm, dateNaissance: e.target.value })}
                    placeholder="jj/mm/aaaa"
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label htmlFor="mandataire-nationalite" className={labelClass}>
                    Nationalité
                  </label>
                  <input
                    id="mandataire-nationalite"
                    type="text"
                    value={mandataireForm.nationalite || ''}
                    onChange={(e) => setMandataireForm({ ...mandataireForm, nationalite: e.target.value })}
                    placeholder="Ex : Française"
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
};
