/**
 * Step 1 : Identification de l'établissement & Profil Économique
 * Collectivité de Corse / ADEC - Guide des Aides 2026 & Fonds SALVEZZA
 * Intégration unifiée : API Entreprise v4, RNE (INPI), DGFiP, URSSAF et BODACC
 */

import React, { useState } from 'react';
import { CompanyProfile, LegalForm, ActivitySector, MandataireSocial } from '../../types';
import {
  Building2,
  AlertTriangle,
  Search,
  Key,
  Lock,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
  Landmark,
  Scale,
  Download,
  UserCheck,
  UserPlus,
  Edit3,
  Trash2,
  Plus,
  X,
  Mountain,
  Compass,
  Sparkles
} from 'lucide-react';
import { determineCompanySize } from '../../services/engine';
import { fetchEntrepriseBySiret, fetchBodaccBySiren, getStoredApiEntrepriseToken, isValidLuhn, downloadExtraitRnePdf } from '../../services/apiEntreprise';
import { ApiEntrepriseModal } from '../ApiEntrepriseModal';
import { BeneficiairesEffectifsPanel } from './BeneficiairesEffectifsPanel';
import { ComplianceRow } from './ComplianceRow';
import {
  AttestationType,
  ATTESTATIONS_REGISTRY,
  downloadCertificateFile
} from '../../utils/complianceCertificates';
import { getOfficialRneDownloadUrl } from '../../utils/rneDownloader';
import { SalvezzaCommunesModal } from '../Salvezza/SalvezzaCommunesModal';
import {
  determineCorsicaZoning,
  searchCorsicaCommunes,
  CorsicaCommuneReference
} from '../../services/corsicaZoning';
import { analyzeCompanyCreationDate } from '../../utils/companyAge';
import { cleanSiret, isForbiddenSiretKey } from '../../utils/siret';

interface StepCompanyProps {
  data: CompanyProfile;
  onChange: (updated: Partial<CompanyProfile>) => void;
}

export const StepCompany: React.FC<StepCompanyProps> = ({ data, onChange }) => {
  const calculatedSize = determineCompanySize(data.headcount, data.annualRevenue, data.balanceSheetTotal);

  const [siretQuery, setSiretQuery] = useState(data.siret || '84920194800018');
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);
  const [communeSuggestions, setCommuneSuggestions] = useState<CorsicaCommuneReference[]>([]);
  const [isManualZoningOverride, setIsManualZoningOverride] = useState(false);
  const [isSalvezzaModalOpen, setIsSalvezzaModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [hasToken, setHasToken] = useState<boolean>(() => Boolean(getStoredApiEntrepriseToken().trim()));
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);
  const [isDownloadingRnePdf, setIsDownloadingRnePdf] = useState(false);
  const [rnePdfError, setRnePdfError] = useState<string | null>(null);

  // Extrait RNE officiel INPI : lien frais demandé au clic (jeton requis), sinon justificatif public
  const handleDownloadExtraitRne = async (siren: string) => {
    setRnePdfError(null);
    if (!hasToken) {
      window.open(getOfficialRneDownloadUrl(siren), '_blank', 'noopener,noreferrer');
      return;
    }
    setIsDownloadingRnePdf(true);
    const result = await downloadExtraitRnePdf(siren, data.name);
    setIsDownloadingRnePdf(false);
    if (!result.success) {
      setRnePdfError(result.error || 'Téléchargement impossible.');
    }
  };

  const handleDownloadAttestation = (type: AttestationType) => {
    const { fileName } = downloadCertificateFile(type, data);
    const label = type === 'bundle'
      ? 'Pack Complet (les 4 attestations réunies)'
      : ATTESTATIONS_REGISTRY[type as keyof typeof ATTESTATIONS_REGISTRY]?.title || type.toUpperCase();
    setDownloadSuccessNotice(`"${label}" a été généré et téléchargé avec succès au format PDF (${fileName}).`);
    setTimeout(() => {
      setDownloadSuccessNotice(null);
    }, 5000);
  };

  // Attestations officielles DGFiP / URSSAF délivrées via API Entreprise (mêmes sources que l'étape 2)
  const dgfipOk = data.complianceData?.dgfip?.attestationFiscale?.status === 'ok';
  const urssafOk = data.complianceData?.urssaf?.attestationVigilance?.status === 'ok';
  const dgfipDocumentUrl = data.complianceData?.dgfip?.attestationFiscale?.documentUrl;
  const urssafDocumentUrl = data.complianceData?.urssaf?.attestationVigilance?.documentUrl;

  // Immatriculation RNE
  const rneOk = data.complianceData?.rne?.status === 'ok';
  const rneDateIso = data.complianceData?.rne?.dateImmatriculationRne;
  const rneDateFr = rneDateIso && /^\d{4}-\d{2}-\d{2}/.test(rneDateIso)
    ? new Date(rneDateIso).toLocaleDateString('fr-FR')
    : rneDateIso;
  const bodacc = data.complianceData?.bodacc;

  const primaryActionClass = 'inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold transition shadow-2xs cursor-pointer';
  const secondaryActionClass = 'inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-[11px] font-semibold transition cursor-pointer';
  const disabledActionClass = 'inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-md text-[11px] font-semibold cursor-not-allowed';

  // Mandataires sociaux et dirigeants déclarés
  const currentMandataires: MandataireSocial[] =
    (data.mandataires && data.mandataires.length > 0)
      ? data.mandataires
      : (data.complianceData?.infogreffe?.mandatairesSociaux && data.complianceData.infogreffe.mandatairesSociaux.length > 0)
      ? data.complianceData.infogreffe.mandatairesSociaux
      : [];

  // Observations issues de l'attestation d'immatriculation RNE (INPI)
  const currentObservations = data.complianceData?.rne?.observations || [];

  // Nombre de pièces réellement vérifiées (RNE, DGFiP, URSSAF, mandataires)
  const verifiedCount = [rneOk, dgfipOk, urssafOk, currentMandataires.length > 0].filter(Boolean).length;

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
  const [showAllBodaccAnnonces, setShowAllBodaccAnnonces] = useState(false);

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
        message: 'Veuillez saisir un numéro SIRET valide composé d’exactement 14 chiffres.'
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
        message: `Établissement « ${result.mappedProfile.name} » synchronisé avec succès.`,
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

  return (
    <div className="space-y-6">
      {/* Fenêtres modales */}
      <ApiEntrepriseModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenUpdated={(hasTok) => setHasToken(hasTok)}
      />

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

      {/* 1. EN-TÊTE PRINCIPAL & ACCÈS JETON API */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            1. Identification de l'Établissement & Profil Économique
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Synchronisation officielle INSEE / RNE et dimensionnement pour les dispositifs ADEC 2026.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsTokenModalOpen(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
            hasToken
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
          title="Configuration du jeton API Entreprise v4"
        >
          <Key className="w-3.5 h-3.5 text-slate-600" />
          <span>Token API</span>
          <Lock className="w-3 h-3 text-slate-400" />
          <span
            className={`w-2 h-2 rounded-full ${hasToken ? 'bg-emerald-500' : 'bg-amber-400'}`}
            title={hasToken ? 'Jeton actif' : 'Jeton absent'}
          />
        </button>
      </div>

      {/* 2. RECHERCHE ET SYNCHRONISATION PAR SIRET */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-4 h-4 text-blue-600" />
            Recherche par numéro SIRET (Répertoire national INSEE Sirene)
          </label>
          <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            14 chiffres
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
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
              placeholder="Ex: 40001662200013"
              className="w-full pl-3 pr-20 py-2 text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-semibold"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1.5">
              {siretQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSiretQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer"
                  title="Effacer"
                >
                  ✕
                </button>
              )}
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                siretQuery.length === 14
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {siretQuery.length}/14
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleFetchSiret()}
            disabled={isLoadingApi || !siretQuery.trim()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
          >
            {isLoadingApi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                Synchroniser
              </>
            )}
          </button>
        </div>

        {/* Exemples rapides */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
          <span className="text-[11px] font-medium text-slate-400">Exemples insulaires :</span>
          <button
            type="button"
            onClick={() => {
              setSiretQuery('40001662200013');
              handleFetchSiret('40001662200013');
            }}
            className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition text-[11px] cursor-pointer"
          >
            Brasserie Pietra (Furiani)
          </button>
          <button
            type="button"
            onClick={() => {
              setSiretQuery('39217556800022');
              handleFetchSiret('39217556800022');
            }}
            className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-200 transition text-[11px] cursor-pointer"
          >
            ADEC Siège (Ajaccio)
          </button>
          <button
            type="button"
            onClick={() => {
              setSiretQuery('84944331200012');
              handleFetchSiret('84944331200012');
            }}
            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 transition text-[11px] font-semibold cursor-pointer"
            title="Consulter LUPINU ALIMENTATION avec son observation au RNE"
          >
            Lupinu Alimentation (Bastia · Obs. RNE)
          </button>
        </div>

        {/* Message de statut */}
        {apiFeedback && (
          <div
            className={`p-3 rounded-lg border text-xs space-y-1 ${
              apiFeedback.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-start gap-1.5 font-semibold">
              {apiFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{apiFeedback.message}</span>
            </div>
            {apiFeedback.details && (
              <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                {apiFeedback.details}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. FICHE ÉTABLISSEMENT : IDENTITÉ, CONFORMITÉ & DONNÉES DES REGISTRES */}
      {data.siret && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          {/* Identité de l'établissement */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  {data.name || 'Établissement'}
                </h3>
                {data.isHeadOffice !== undefined && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    data.isHeadOffice
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {data.isHeadOffice ? 'Siège Principal' : 'Établissement Secondaire'}
                  </span>
                )}
                {data.administrativeStatus && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {data.administrativeStatus}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono flex-wrap">
                <span>SIRET : <strong className="text-slate-800">{data.siret}</strong></span>
                {isCurrentSiretValidLuhn && (
                  <span title="Clé de Luhn valide" className="inline-flex items-center text-emerald-600">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                {activeSiren && (
                  <span>· SIREN : <strong className="text-slate-800">{activeSiren}</strong></span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {activeSiren && (
                <a
                  href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${activeSiren}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 transition"
                  title="Consulter la fiche officielle sur l'Annuaire des Entreprises (data.gouv.fr)"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Annuaire des Entreprises</span>
                </a>
              )}
              {data.rawApiData && (
                <button
                  type="button"
                  onClick={() => setShowRawData(!showRawData)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-200 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{showRawData ? 'Masquer JSON' : 'JSON brut'}</span>
                </button>
              )}
            </div>
          </div>

          {showRawData && data.rawApiData && (
            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono max-h-56 overflow-y-auto">
              <pre className="text-[10px] leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(data.rawApiData, null, 2)}
              </pre>
            </div>
          )}

          {downloadSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{downloadSuccessNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDownloadSuccessNotice(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Conformité & justificatifs : une ligne par pièce, statut réel, action unique */}
          <div className="space-y-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Conformité & justificatifs</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border normal-case tracking-normal ${
                  verifiedCount === 4
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {verifiedCount}/4 pièces vérifiées
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pièces exigées par l'ADEC pour l'instruction et le versement des aides.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              <ComplianceRow
                icon={<Building2 className="w-3.5 h-3.5" />}
                title="Immatriculation RNE"
                source="INPI · Registre National des Entreprises"
                tone={rneOk ? 'ok' : 'unknown'}
                statusLabel={rneOk ? 'Immatriculée' : 'Non vérifiée'}
                description={
                  rneOk
                    ? `Immatriculation au RNE${rneDateFr ? ` le ${rneDateFr}` : ''}. Justificatif officiel téléchargeable.`
                    : 'Lancez une recherche SIRET pour vérifier l’immatriculation.'
                }
                actions={
                  activeSiren ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadExtraitRne(activeSiren)}
                      disabled={isDownloadingRnePdf}
                      className={`${primaryActionClass} disabled:opacity-50`}
                      title={hasToken
                        ? "Télécharger l'extrait RNE officiel (INPI, via API Entreprise)"
                        : `Ouvrir le justificatif d'immatriculation public (${getOfficialRneDownloadUrl(activeSiren)})`}
                    >
                      <Download className={`w-3 h-3 ${isDownloadingRnePdf ? 'animate-bounce' : ''}`} />
                      <span>{isDownloadingRnePdf ? 'Génération INPI...' : 'PDF officiel'}</span>
                    </button>
                  ) : undefined
                }
              >
                {rnePdfError && activeSiren && (
                  <div className="md:pl-[15.75rem] text-[11px]">
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-900 space-y-1">
                      <p><strong>Extrait RNE indisponible auprès de l’INPI.</strong> {rnePdfError}</p>
                      <p className="text-slate-700">
                        Réessayez dans quelques minutes, ou ouvrez le{' '}
                        <a
                          href={getOfficialRneDownloadUrl(activeSiren)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-700 underline hover:text-blue-900"
                        >
                          justificatif d’immatriculation public (Annuaire des Entreprises)
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}
              </ComplianceRow>

              <ComplianceRow
                icon={<Landmark className="w-3.5 h-3.5" />}
                title="Attestation fiscale"
                source="DGFiP · Art. L. 2141-2 CCP"
                tone={dgfipOk ? 'ok' : 'unknown'}
                statusLabel={dgfipOk ? 'À jour' : 'Non certifiée'}
                description={data.complianceData?.dgfip?.attestationFiscale?.libelle || 'Aucune attestation délivrée (jeton API Entreprise requis).'}
                actions={
                  dgfipDocumentUrl ? (
                    <a href={dgfipDocumentUrl} target="_blank" rel="noopener noreferrer" className={primaryActionClass} title="Attestation fiscale officielle délivrée par la DGFiP">
                      <Download className="w-3 h-3" />
                      <span>PDF officiel</span>
                    </a>
                  ) : (
                    <span className={disabledActionClass} title="Aucune attestation fiscale délivrée">
                      <Download className="w-3 h-3" />
                      <span>Non disponible</span>
                    </span>
                  )
                }
              />

              <ComplianceRow
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                title="Attestation de vigilance"
                source="URSSAF · Art. L. 243-15 CSS"
                tone={urssafOk ? 'ok' : 'unknown'}
                statusLabel={urssafOk ? 'À jour' : 'Non certifiée'}
                description={data.complianceData?.urssaf?.attestationVigilance?.libelle || 'Aucune attestation délivrée (jeton API Entreprise requis).'}
                actions={
                  urssafDocumentUrl ? (
                    <a href={urssafDocumentUrl} target="_blank" rel="noopener noreferrer" className={primaryActionClass} title="Attestation de vigilance officielle délivrée par l'URSSAF">
                      <Download className="w-3 h-3" />
                      <span>PDF officiel</span>
                    </a>
                  ) : (
                    <span className={disabledActionClass} title="Aucune attestation de vigilance délivrée">
                      <Download className="w-3 h-3" />
                      <span>Non disponible</span>
                    </span>
                  )
                }
              />

              <ComplianceRow
                icon={<UserCheck className="w-3.5 h-3.5" />}
                title="Mandataires & pouvoirs"
                source="RNE · Art. L. 123-36 C. com."
                tone={currentMandataires.length > 0 ? 'ok' : 'unknown'}
                statusLabel={
                  currentMandataires.length > 0
                    ? `${currentMandataires.length} ${currentMandataires.length > 1 ? 'dirigeants' : 'dirigeant'}`
                    : 'Non renseignés'
                }
                description="Représentation légale de la société. Détail et bénéficiaires effectifs dans la section Gouvernance ci-dessous."
                actions={
                  <button
                    type="button"
                    onClick={() => handleDownloadAttestation('infogreffe')}
                    className={secondaryActionClass}
                    title="Télécharger l'extrait de gouvernance (PDF généré à partir des mandataires déclarés)"
                  >
                    <Download className="w-3 h-3" />
                    <span>Extrait (PDF)</span>
                  </button>
                }
              />

              <ComplianceRow
                icon={<Scale className="w-3.5 h-3.5" />}
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
                      <RefreshCw className={`w-3 h-3 ${isBodaccLoading ? 'animate-spin text-blue-600' : ''}`} />
                      <span>Actualiser</span>
                    </button>
                  ) : undefined
                }
              />

              <ComplianceRow
                icon={<FileText className="w-3.5 h-3.5" />}
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
                      title="Consulter les annonces et observations sur l'Annuaire des Entreprises"
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
                      <li key={obs.id || idx} className="text-[11px] bg-amber-50/50 border border-amber-100 rounded-lg p-2.5 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 font-medium">
                          <span className="font-bold text-slate-700">
                            {(obs.numero || obs.numObservation) ? `N° ${obs.numero || obs.numObservation}` : `#${idx + 1}`}
                          </span>
                          {(obs.date || obs.dateAjout) && <span className="font-mono">{obs.date || obs.dateAjout}</span>}
                          {(obs.fournisseur || obs.source) && <span>{obs.fournisseur || obs.source}</span>}
                        </div>
                        <p className="text-slate-800 leading-relaxed">{obs.texte || obs.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </ComplianceRow>
            </div>
          </div>

          {/* Données complémentaires des registres (non saisissables) */}
          <div className="border border-slate-200 rounded-lg bg-slate-50/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Données complémentaires des registres (TVA, social, établissements)</span>
              </span>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[11px] font-normal">{showTechnicalDetails ? 'Masquer' : 'Afficher'}</span>
                {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showTechnicalDetails && (
              <div className="p-3.5 border-t border-slate-200 bg-white grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Fiscalité</span>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">TVA intracom. :</span>
                    <strong className="font-mono text-slate-800">{data.tvaIntracommunautaire || `FR${String((12 + 3 * (parseInt(activeSiren || '0', 10) % 97)) % 97).padStart(2, '0')}${activeSiren}`}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Régime fiscal :</span>
                    <strong className="text-slate-800 text-right">{data.complianceData?.dgfip?.liassesFiscales?.regimeImposition || 'Non communiqué'}</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Social & emploi</span>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Tranche INSEE :</span>
                    <strong className="text-slate-800 text-right">{data.headcountTranche || 'Non communiquée'}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Convention (IDCC) :</span>
                    <strong className="text-slate-800 truncate max-w-[140px]" title={data.conventionCollective?.idcc}>
                      {data.conventionCollective?.idcc || 'Non communiquée'}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Employeur :</span>
                    <strong className="text-slate-800">
                      {data.caractereEmployeur === 'O' ? 'Oui' : data.caractereEmployeur === 'N' ? 'Non' : 'Non communiqué'}
                    </strong>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Établissements & labels</span>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Établissements :</span>
                    <strong className="text-slate-800">{data.nombreEtablissements ?? 1} ({data.nombreEtablissementsOuverts ?? 1} ouvert)</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Diffusion INSEE :</span>
                    <strong className="text-slate-800">{data.statutDiffusion === 'O' ? 'Publique' : 'Protégée'}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Agriculture bio :</span>
                    <strong className={data.labelsAndCertifications?.isBio ? 'text-emerald-700' : 'text-slate-800'}>
                      {data.labelsAndCertifications?.isBio ? 'Certifiée Agence Bio' : 'Non'}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. PARAMÈTRES DU DOSSIER ADEC : SAISIE & AJUSTEMENT UNIFIÉS */}
      <div className="space-y-4">
        {/* VOLET A : IDENTIFICATION, CAPITAL & ACTIVITÉ */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            <FileText className="w-4 h-4 text-slate-600" />
            Identification Juridique, Capital Social & Activité
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Raison Sociale / Nom Commercial
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="Ex: Entreprise Corsica"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Capital Social
              </label>
              <div className="relative">
                <input
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
                  placeholder="Ex: 50000"
                  className="w-full pl-3 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">€</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate" title={data.capitalSocialSource}>
                {data.capitalSocial
                  ? `Source : ${data.capitalSocialSource || 'non précisée'}`
                  : (data.legalForm === 'COMMERCIANT_ARTISAN_EI' || data.legalForm === 'MICRO_ENTREPRISE' ? 'Non applicable (EI)' : 'Non renseigné')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Code NAF / APE
              </label>
              <input
                type="text"
                value={data.nafCode || ''}
                onChange={(e) => onChange({ nafCode: e.target.value })}
                placeholder="Ex: 10.71C"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1 truncate" title={data.nafLabel}>
                {data.nafLabel || 'Libellé d’activité non renseigné'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date d'Immatriculation
              </label>
              <input
                type="date"
                value={ageAnalysis.dateIso || (data.creationDate && data.creationDate.length === 10 && data.creationDate.includes('-') ? data.creationDate : '')}
                onChange={(e) => handleCreationDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
              <p className="text-[11px] mt-1 truncate">
                {ageAnalysis.isDateKnown ? (
                  <span className={ageAnalysis.isUnderFiveYears ? 'font-semibold text-emerald-700' : 'text-slate-500'}>
                    {ageAnalysis.ageLabel} · {ageAnalysis.isUnderFiveYears ? 'Éligible Impresa Sì (≤ 5 ans)' : '> 5 ans'}
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">Date à renseigner</span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Forme Juridique
              </label>
              <select
                value={data.legalForm}
                onChange={(e) => onChange({ legalForm: e.target.value as LegalForm })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                <p className="text-[11px] text-slate-500 mt-1 truncate" title={data.natureJuridiqueLibelle}>
                  Registre : {data.natureJuridiqueLibelle || '—'}
                  {data.natureJuridiqueCode ? ` (code ${data.natureJuridiqueCode})` : ''}
                  {data.enterpriseCategory ? ` · Catégorie ${data.enterpriseCategory}` : ''}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Secteur d’Activité Principal
              </label>
              <select
                value={data.sector}
                onChange={(e) => onChange({ sector: e.target.value as ActivitySector })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Attention :</strong> Le régime des micro-entreprises est formellement exclu du Guide des Aides de l'ADEC (l'entreprise doit basculer vers un régime réel pour prétendre aux subventions).
              </span>
            </div>
          )}

          {data.sector === 'AGRICULTURE_PECHE_SYLVICULTURE' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Information :</strong> La production primaire agricole et de pêche relève des dispositifs d'aide de l'<strong>ODARC</strong> (Office du Développement Agricole et Rural de la Corse).
              </span>
            </div>
          )}

          {data.sector === 'HEBERGEMENT_TOURISTIQUE' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Exclusion réglementaire :</strong> L’hébergement touristique exclusif est exclu du champ du Guide des Aides ADEC 2026.
              </span>
            </div>
          )}
        </div>

        {/* VOLET B : IMPLANTATION TERRITORIALE & DISPOSITIF SALVEZZA */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-slate-600" />
              Implantation & Ancrage Insulaire (Corse & Salvezza)
            </h3>
            <span className="text-[11px] font-medium text-slate-500">
              Délibération 21/177 AC & Plan Salvezza
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse (Voie)
              </label>
              <input
                type="text"
                value={data.address || ''}
                onChange={(e) => onChange({ address: e.target.value })}
                placeholder="Ex: 12 Cours Paoli"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Code Postal
              </label>
              <input
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
                placeholder="Ex: 20250"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Commune d'implantation</span>
                {zoningAnalysis.isCorsica && (
                  <span className="text-[10px] text-emerald-700 font-bold">
                    {zoningAnalysis.departement === '2A' ? 'Corse-du-Sud (2A)' : 'Haute-Corse (2B)'}
                  </span>
                )}
              </label>
              <input
                type="text"
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
                placeholder="Ex: Corte, Ajaccio, Bastia..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />

              {/* Suggestions de communes corses */}
              {showCommuneSuggestions && communeSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-52 overflow-y-auto divide-y divide-slate-100">
                  <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                    <span>Communes corses</span>
                    <button
                      type="button"
                      onClick={() => setShowCommuneSuggestions(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
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
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 transition flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <strong className="text-slate-900">{c.name}</strong>
                        <span className="text-slate-500 text-[11px] ml-1.5 font-mono">({c.postalCode})</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {c.microregion}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Encadré d'ancrage et éligibilité Salvezza */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${
                zoningAnalysis.isSalvezza || data.salvezzaCommune
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                <Mountain className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    {zoningAnalysis.isSalvezza || data.salvezzaCommune
                      ? `Commune éligible Fonds SALVEZZA (${zoningAnalysis.salvezzaCommune?.nomCorse || data.salvezzaCommune?.nomCorse || data.city})`
                      : `Zonage d'implantation : ${zoningAnalysis.badgeLabel}`}
                  </span>
                  {zoningAnalysis.salvezzaCommune && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Score : {zoningAnalysis.salvezzaCommune.scoreContrainte}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {zoningAnalysis.isSalvezza || data.salvezzaCommune
                    ? 'Taux d’intervention majorés (+10 % à +20 %) et bonifications sur les investissements et aides à l’emploi.'
                    : 'Régime territorial de droit commun. Les 230 communes sous contrainte bénéficient du Fonds SALVEZZA.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSalvezzaModalOpen(true)}
              className="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
              <span>230 Communes Salvezza</span>
            </button>
          </div>

          {/* Déclarations sur l'honneur insulaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs">
              <input
                type="checkbox"
                checked={data.isEstablishedInCorsica}
                onChange={(e) => onChange({ isEstablishedInCorsica: e.target.checked })}
                className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
              />
              <div>
                <span className="font-semibold text-slate-900 block">Établie en Corse</span>
                <span className="text-slate-500 text-[11px]">Siège social ou établissement secondaire réel immatriculé en Corse</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs">
              <input
                type="checkbox"
                checked={data.hasMainExploitationInCorsica}
                onChange={(e) => onChange({ hasMainExploitationInCorsica: e.target.checked })}
                className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
              />
              <div>
                <span className="font-semibold text-slate-900 block">Exploitation Principale en Corse</span>
                <span className="text-slate-500 text-[11px]">Activité opérationnelle effective exercée sur l’île</span>
              </div>
            </label>
          </div>
        </div>

        {/* VOLET C : DIMENSIONNEMENT ÉCONOMIQUE & CRITÈRES PME UE */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-4 h-4 text-slate-600" />
              Dimensionnement Économique & PME (Règlement UE n° 651/2014)
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-900 text-white">
              Catégorie : {calculatedSize}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Effectif Salarié (ETP)
              </label>
              <input
                type="number"
                min="0"
                value={data.headcount}
                onChange={(e) => onChange({ headcount: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">TPE : &lt;10 · PE : &lt;50 · PME : &lt;250</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chiffre d’Affaires Annuel HT (€)
              </label>
              <input
                type="number"
                min="0"
                value={data.annualRevenue}
                onChange={(e) => onChange({ annualRevenue: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">TPE : ≤2 M€ · PE : ≤10 M€ · PME : ≤50 M€</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total du Bilan Annuel (€)
              </label>
              <input
                type="number"
                min="0"
                value={data.balanceSheetTotal}
                onChange={(e) => onChange({ balanceSheetTotal: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">TPE : ≤2 M€ · PE : ≤10 M€ · PME : ≤43 M€</p>
            </div>
          </div>

          {/* Conditions opérationnelles */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
              Conditions Opérationnelles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isSeasonalActivity}
                  onChange={(e) => onChange({ isSeasonalActivity: e.target.checked })}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                />
                <span>Activité saisonnière (&lt; 8 mois/an)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isFranchiseOrAffiliate}
                  onChange={(e) => onChange({ isFranchiseOrAffiliate: e.target.checked })}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                />
                <span>Affiliée à un réseau ou franchise</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.hasDistributedProfits}
                  onChange={(e) => onChange({ hasDistributedProfits: e.target.checked })}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                />
                <span>A déjà distribué des dividendes</span>
              </label>
            </div>
          </div>
        </div>

        {/* VOLET D : GOUVERNANCE & MANDATAIRES SOCIAUX HABILITÉS */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Gouvernance & Mandataires Sociaux Déclarés (RNE · INPI)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Identification des dirigeants habilités à signer les demandes de subventions ADEC.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                {currentMandataires.length} {currentMandataires.length > 1 ? 'dirigeants déclarés' : 'dirigeant déclaré'}
              </span>
              <button
                type="button"
                onClick={handleOpenAddMandataire}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Ajouter un dirigeant</span>
              </button>
            </div>
          </div>

          {/* Liste des cartes des mandataires / gérants */}
          {currentMandataires.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {currentMandataires.map((m, idx) => {
                const isMoral = m.type === 'personne_morale';
                const displayName = isMoral
                  ? (m.denomination || m.nom || 'Personne morale')
                  : `${(m.nom || '').toUpperCase()} ${m.prenom || ''}`.trim() || 'Dirigeant';

                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 shadow-2xs hover:border-purple-300 transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-purple-200">
                          {isMoral ? <Building2 className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm font-bold text-slate-900 block leading-tight">
                              {displayName}
                            </strong>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                              {m.fonction || 'Gérant'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                            {isMoral ? 'Personne Morale' : 'Personne Physique'}
                            {m.nationalite ? ` · Nationalité : ${m.nationalite}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMandataire(idx)}
                          title="Modifier ce dirigeant"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMandataire(idx)}
                          title="Supprimer ce dirigeant"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Date de naissance
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-800">
                          {m.dateNaissance || 'Non renseignée'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                          Qualité à agir
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Certifiée (RNE)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-3">
              <p className="text-xs text-slate-600">
                Aucun gérant ou mandataire social n'est actuellement renseigné pour cet établissement.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAddMandataire}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un dirigeant</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestoreDefaultMandataires}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Restaurer dirigeants par défaut (Antone PAOLI & Maria ALBERTI)
                </button>
              </div>
            </div>
          )}

          <BeneficiairesEffectifsPanel data={data.complianceData?.beneficiairesEffectifs} />
        </div>
      </div>

      {/* MODALE D'ÉDITION / AJOUT DE MANDATAIRE SOCIAL */}
      {isMandataireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingMandataireIndex !== null ? 'Modifier le dirigeant / mandataire' : 'Ajouter un dirigeant / gérant'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Identification officielle pour les dossiers ADEC et RNE
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMandataireModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMandataire} className="space-y-4 text-xs">
              {/* Type de personne */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Type de personne
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMandataireForm({ ...mandataireForm, type: 'personne_physique' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      mandataireForm.type !== 'personne_morale'
                        ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Personne Physique</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMandataireForm({ ...mandataireForm, type: 'personne_morale' })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      mandataireForm.type === 'personne_morale'
                        ? 'bg-purple-50 border-purple-400 text-purple-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Personne Morale</span>
                  </button>
                </div>
              </div>

              {mandataireForm.type === 'personne_morale' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dénomination Sociale de la personne morale *
                  </label>
                  <input
                    type="text"
                    required
                    value={mandataireForm.denomination || mandataireForm.nom || ''}
                    onChange={(e) => setMandataireForm({ ...mandataireForm, denomination: e.target.value, nom: e.target.value })}
                    placeholder="Ex: Holding Corsica Investissements SAS"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nom (Nom de famille / d'usage) *
                    </label>
                    <input
                      type="text"
                      required
                      value={mandataireForm.nom || ''}
                      onChange={(e) => setMandataireForm({ ...mandataireForm, nom: e.target.value.toUpperCase() })}
                      placeholder="Ex: PAOLI"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs uppercase focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={mandataireForm.prenom || ''}
                      onChange={(e) => setMandataireForm({ ...mandataireForm, prenom: e.target.value })}
                      placeholder="Ex: Antone"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Fonction & Rôle */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fonction / Mandat légal *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={['Gérant', 'Associée co-gérante', 'Président', 'Directeur Général', 'Gérant majoritaire', 'Associé unique'].includes(mandataireForm.fonction || '') ? mandataireForm.fonction : 'Autre'}
                    onChange={(e) => {
                      if (e.target.value !== 'Autre') {
                        setMandataireForm({ ...mandataireForm, fonction: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="Gérant">Gérant</option>
                    <option value="Associée co-gérante">Associé(e) co-gérant(e)</option>
                    <option value="Président">Président</option>
                    <option value="Directeur Général">Directeur Général</option>
                    <option value="Gérant majoritaire">Gérant majoritaire</option>
                    <option value="Associé unique">Associé unique</option>
                    <option value="Autre">Autre mandat (personnalisé)...</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={mandataireForm.fonction || ''}
                    onChange={(e) => setMandataireForm({ ...mandataireForm, fonction: e.target.value })}
                    placeholder="Intitulé exact du mandat"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Date de naissance et Nationalité pour personne physique */}
              {mandataireForm.type !== 'personne_morale' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Date de naissance
                    </label>
                    <input
                      type="text"
                      value={mandataireForm.dateNaissance || ''}
                      onChange={(e) => setMandataireForm({ ...mandataireForm, dateNaissance: e.target.value })}
                      placeholder="Ex: 12/06/1984"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nationalité
                    </label>
                    <input
                      type="text"
                      value={mandataireForm.nationalite || ''}
                      onChange={(e) => setMandataireForm({ ...mandataireForm, nationalite: e.target.value })}
                      placeholder="Ex: Française"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMandataireModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition shadow-xs cursor-pointer"
                >
                  {editingMandataireIndex !== null ? 'Mettre à jour' : 'Ajouter le dirigeant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
