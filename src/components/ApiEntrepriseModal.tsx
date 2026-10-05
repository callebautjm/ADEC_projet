/**
 * Fenêtre Modale de Configuration du Token API Entreprise
 * Protégée par mot de passe administrateur.
 * Permet de renseigner, modifier et tester le jeton d'accès pour entreprise.api.gouv.fr
 */

import React, { useState, useEffect } from 'react';
import {
  getStoredApiEntrepriseToken,
  saveApiEntrepriseToken,
  removeApiEntrepriseToken,
  getStoredRecipientSiret,
  saveRecipientSiret,
  DEFAULT_RECIPIENT_SIRET,
  fetchEntrepriseByIdentifier,
  verifyAdminPassword,
  setAdminPassword,
  resetAdminPasswordToDefault,
  hasCustomAdminPassword,
  DEFAULT_ADMIN_PASSWORD
} from '../services/apiEntreprise';
import { cleanSiret, isForbiddenSiretKey } from '../utils/siret';
import {
  Key,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  X,
  Sparkles,
  Server,
  Lock,
  Unlock,
  Building,
  KeyRound,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ApiEntrepriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenUpdated?: (hasToken: boolean) => void;
}

export const ApiEntrepriseModal: React.FC<ApiEntrepriseModalProps> = ({
  isOpen,
  onClose,
  onTokenUpdated
}) => {
  // État de verrouillage par mot de passe
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);

  // État de modification du mot de passe
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [passwordChangeNotice, setPasswordChangeNotice] = useState<{ success?: boolean; text?: string } | null>(null);

  // États du token & API
  const [token, setToken] = useState<string>('');
  const [recipientSiret, setRecipientSiret] = useState<string>(DEFAULT_RECIPIENT_SIRET);
  const [showToken, setShowToken] = useState<boolean>(false);
  const [testIdentifier, setTestIdentifier] = useState<string>('40001662200013');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    details?: string;
    source?: string;
  } | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Verrouillé systématiquement à l'ouverture pour la sécurité
      setIsUnlocked(false);
      setPasswordInput('');
      setPasswordError('');
      setShowAdminPassword(false);
      setIsChangingPassword(false);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setPasswordChangeNotice(null);

      const currentToken = getStoredApiEntrepriseToken();
      const currentRecipient = getStoredRecipientSiret();
      setToken(currentToken);
      setRecipientSiret(currentRecipient);
      setTestResult(null);
      setSaveSuccessNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordError('');
    if (!passwordInput.trim()) {
      setPasswordError('Veuillez renseigner le mot de passe administrateur.');
      return;
    }
    if (verifyAdminPassword(passwordInput)) {
      setIsUnlocked(true);
      setPasswordError('');
    } else {
      setPasswordError('Mot de passe administrateur incorrect.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasswordInput('');
    setPasswordError('');
    setIsChangingPassword(false);
    setPasswordChangeNotice(null);
  };

  const handleChangePassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordChangeNotice(null);

    if (!verifyAdminPassword(currentPasswordInput)) {
      setPasswordChangeNotice({ success: false, text: 'Le mot de passe actuel est incorrect.' });
      return;
    }
    if (newPasswordInput.trim().length < 4) {
      setPasswordChangeNotice({ success: false, text: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeNotice({ success: false, text: 'La confirmation ne correspond pas au nouveau mot de passe.' });
      return;
    }

    const res = setAdminPassword(newPasswordInput);
    if (res.success) {
      setPasswordChangeNotice({ success: true, text: 'Mot de passe administrateur mis à jour avec succès !' });
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordChangeNotice(null);
      }, 2000);
    } else {
      setPasswordChangeNotice({ success: false, text: res.error || 'Erreur lors de la mise à jour.' });
    }
  };

  const handleResetPassword = () => {
    resetAdminPasswordToDefault();
    setPasswordChangeNotice({
      success: true,
      text: `Mot de passe réinitialisé à sa valeur d'origine : "${DEFAULT_ADMIN_PASSWORD}".`
    });
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordChangeNotice(null);
    }, 2500);
  };

  const handleSave = () => {
    saveApiEntrepriseToken(token);
    saveRecipientSiret(recipientSiret);
    setSaveSuccessNotice(true);
    if (onTokenUpdated) {
      onTokenUpdated(Boolean(token.trim()));
    }
    setTimeout(() => {
      setSaveSuccessNotice(false);
    }, 2500);
  };

  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  const handleClear = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      return;
    }
    removeApiEntrepriseToken();
    setToken('');
    setRecipientSiret(DEFAULT_RECIPIENT_SIRET);
    saveRecipientSiret(DEFAULT_RECIPIENT_SIRET);
    setTestResult(null);
    setIsConfirmingClear(false);
    if (onTokenUpdated) {
      onTokenUpdated(false);
    }
  };

  const handleTestToken = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await fetchEntrepriseByIdentifier(testIdentifier, token, recipientSiret);
    setIsTesting(false);

    if (res.success && res.mappedProfile) {
      const dgfipOk = res.compliance?.dgfip?.attestationFiscale?.status === 'ok';
      const urssafOk = res.compliance?.urssaf?.attestationVigilance?.status === 'ok';
      const mandatairesCount = res.compliance?.infogreffe?.mandatairesSociaux?.length || 0;

      const complianceSummary = [
        `DGFIP: ${dgfipOk ? 'Attestation fiscale OK' : 'Non dispo'}`,
        `URSSAF: ${urssafOk ? 'Attestation vigilance OK' : 'Non dispo'}`,
        `Infogreffe: ${mandatairesCount > 0 ? `${mandatairesCount} mandataire(s)` : 'Non dispo'}`,
        `INSEE: Sirene v4 OK`
      ].join(' • ');

      setTestResult({
        success: true,
        source: res.source,
        message: `Connexion réussie ! Établissement identifié : "${res.mappedProfile.name}" (SIRET: ${res.mappedProfile.siret || testIdentifier})`,
        details: `Forme : ${res.mappedProfile.legalForm} | Commune : ${res.mappedProfile.city} (${res.mappedProfile.postalCode}) | Effectif : ~${res.mappedProfile.headcount} ETP\nConformité & Pièces certifiées : [${complianceSummary}]`
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Échec de l’interrogation de l’API Entreprise.',
        details: res.details ? JSON.stringify(res.details) : undefined
      });
    }
  };

  const cleanRecipient = (recipientSiret || '').replace(/\s+/g, '') || DEFAULT_RECIPIENT_SIRET;
  const cleanInput = (testIdentifier || '').replace(/\s+/g, '');
  const displayTarget = `/v4/insee/sirene/etablissements/${cleanInput || '{siret}'}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header commun */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-start justify-between gap-4 border-b border-blue-900/60">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
              isUnlocked
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                : 'bg-blue-900/60 text-sky-300 border-blue-700/60'
            }`}>
              {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono mb-0.5">
                <span className={isUnlocked ? 'text-emerald-400 font-semibold' : 'text-sky-300'}>
                  entreprise.api.gouv.fr · API Entreprise v4
                </span>
                <span className="text-blue-500">|</span>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                  isUnlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isUnlocked ? 'Déverrouillé' : 'Verrouillé'}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Configuration du Jeton API Entreprise
              </h2>
              <p className="text-xs text-blue-200/80 mt-0.5 leading-relaxed">
                {isUnlocked
                  ? 'Gestion sécurisée du jeton Bearer et des habilitations officielles.'
                  : 'Accès restreint · Authentification requise pour toute consultation ou modification.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ÉCRAN 1 : VERROUILLÉ (SAISIE DU MOT DE PASSE) */}
        {!isUnlocked ? (
          <div className="p-6 sm:p-7 space-y-6">
            <div className="text-center space-y-2 max-w-md mx-auto">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Accès Administrateur Restreint
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le jeton API Entreprise permet d’interroger directement les serveurs certifiés de la <strong>DGFIP</strong>, de l’<strong>URSSAF</strong>, d’<strong>Infogreffe</strong> et de l’<strong>INSEE</strong>. Sa modification est protégée par un mot de passe.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 max-w-md mx-auto">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mot de passe d'administration
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="Saisissez le mot de passe"
                    autoFocus
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    title={showAdminPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5 pt-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Déverrouiller l'accès au token</span>
                </button>
              </div>

              {/* Raccourci / Indication du mot de passe par défaut */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px] text-blue-900">Mot de passe initial du simulateur :</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordInput(DEFAULT_ADMIN_PASSWORD);
                      setPasswordError('');
                    }}
                    className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline bg-white px-2 py-0.5 rounded border border-blue-200 transition"
                  >
                    Insérer "{DEFAULT_ADMIN_PASSWORD}"
                  </button>
                </div>
                <p className="text-[11px] text-blue-800/90 leading-snug">
                  Par défaut, le code est <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded text-blue-900 border border-blue-200">adec2026</code>. Vous pourrez le personnaliser une fois déverrouillé.
                </p>
              </div>
            </form>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end -mx-6 -mb-6 sm:-mx-7 sm:-mb-7">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* ÉCRAN 2 : DÉVERROUILLÉ (MODIFICATION DU TOKEN & GESTION) */
          <>
            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              {/* Barre de statut administrateur & Action de changement de mot de passe */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-300 rounded-xl flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-xs text-emerald-950 block">
                      Session administrateur active
                    </span>
                    <span className="text-[10px] text-emerald-800">
                      Vous pouvez modifier, effacer ou tester le jeton Bearer.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(!isChangingPassword);
                      setPasswordChangeNotice(null);
                    }}
                    className="text-[11px] font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-2xs"
                  >
                    <KeyRound className="w-3 h-3 text-indigo-600" />
                    <span>{isChangingPassword ? 'Masquer' : 'Changer le mot de passe'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLock}
                    className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-2xs"
                    title="Verrouiller à nouveau"
                  >
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Verrouiller</span>
                  </button>
                </div>
              </div>

              {/* Formulaire rétractable : Changement de mot de passe */}
              {isChangingPassword && (
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      Modifier le mot de passe d'administration
                    </span>
                    {hasCustomAdminPassword() && (
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1"
                        title="Rétablir 'adec2026'"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Rétablir le code par défaut ({DEFAULT_ADMIN_PASSWORD})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="Actuel"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Nouveau (min. 4 car.)"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Confirmer
                      </label>
                      <input
                        type="password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Confirmer"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>

                  {passwordChangeNotice && (
                    <p className={`text-xs font-semibold flex items-center gap-1.5 ${
                      passwordChangeNotice.success ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {passwordChangeNotice.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span>{passwordChangeNotice.text}</span>
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-100"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      className="px-3 py-1 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-2xs"
                    >
                      Valider le nouveau mot de passe
                    </button>
                  </div>
                </div>
              )}

              {/* Information box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 leading-relaxed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    Habilitations & Traçabilité API Entreprise
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                    4 Administrations
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  L’API Entreprise impose la transmission d’un jeton d’accès <code>Bearer</code> ainsi que du numéro <strong>SIRET (14 chiffres)</strong> de l'organisme demandeur (paramètre <code>recipient</code>). Les habilitations actives couvrent :
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-0.5">
                  <div className="p-1.5 rounded bg-white border border-slate-200">
                    <strong className="text-indigo-700 block">DGFIP :</strong> Attestation fiscale, CA (3 exercices) & Liasses
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-200">
                    <strong className="text-emerald-700 block">URSSAF :</strong> Attestation de vigilance & cotisations
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-200">
                    <strong className="text-violet-700 block">INPI · RNE :</strong> Mandataires sociaux & dirigeants d'entreprise
                  </div>
                  <div className="p-1.5 rounded bg-white border border-slate-200">
                    <strong className="text-sky-700 block">INSEE Sirene :</strong> Établissements (dont non-diffusibles)
                  </div>
                </div>
                <div className="pt-1">
                  <a
                    href="https://entreprise.api.gouv.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1 text-[11px]"
                  >
                    Obtenir ou vérifier les scopes sur le portail entreprise.api.gouv.fr
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Champ d'édition du Token */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Jeton Bearer API Entreprise
                  </label>
                  {token.trim() && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Jeton présent
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                    title={showToken ? 'Masquer le token' : 'Afficher le token'}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {saveSuccessNotice && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paramètres enregistrés avec succès !
                  </p>
                )}
              </div>

              {/* Recipient SIRET input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    SIRET Organisme Demandeur (paramètre `recipient`)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">14 chiffres</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientSiret}
                    onChange={(e) => setRecipientSiret(cleanSiret(e.target.value))}
                    onKeyDown={(e) => {
                      if (isForbiddenSiretKey(e.key)) e.preventDefault();
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const text = e.clipboardData.getData('text');
                      setRecipientSiret(cleanSiret(text));
                    }}
                    placeholder="Ex: 20007695800012 (Collectivité de Corse) ou 39217556800022 (ADEC)"
                    className="w-full px-3.5 pr-20 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
                  />
                  <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                    {recipientSiret && (
                      <button
                        type="button"
                        onClick={() => setRecipientSiret('')}
                        title="Effacer"
                        className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition text-xs"
                      >
                        ✕
                      </button>
                    )}
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      (recipientSiret || '').length === 14
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {(recipientSiret || '').length}/14
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Configuré par défaut sur le SIRET valide du siège de la Collectivité de Corse (<code>20007695800012</code>). Vous pouvez aussi renseigner le SIRET de l’ADEC (<code>39217556800022</code>) ou le SIRET rattaché à votre compte API Entreprise.
                </p>
              </div>

              {/* Zone de test */}
              <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Tester le jeton sur un numéro SIRET (14 chiffres)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    API v4 officielle
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={testIdentifier}
                      onChange={(e) => setTestIdentifier(cleanSiret(e.target.value))}
                      onKeyDown={(e) => {
                        if (isForbiddenSiretKey(e.key)) e.preventDefault();
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData('text');
                        setTestIdentifier(cleanSiret(text));
                      }}
                      placeholder="Numéro SIRET (14 chiffres)"
                      className="w-full px-3 pr-20 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600 font-bold"
                    />
                    <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
                      {testIdentifier && (
                        <button
                          type="button"
                          onClick={() => setTestIdentifier('')}
                          title="Effacer"
                          className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition text-xs"
                        >
                          ✕
                        </button>
                      )}
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        (testIdentifier || '').length === 14
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {(testIdentifier || '').length}/14
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestToken}
                    disabled={isTesting || !testIdentifier.trim()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-2xs"
                  >
                    {isTesting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Test en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                        Tester via l'API v4
                      </>
                    )}
                  </button>
                </div>

                {/* Boutons d'exemples rapides */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Exemples :</span>
                  <button
                    type="button"
                    onClick={() => setTestIdentifier('40001662200013')}
                    className="text-[10px] font-mono px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 rounded border border-slate-200 transition"
                  >
                    Brasserie Pietra (40001662200013)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestIdentifier('39217556800022')}
                    className="text-[10px] font-mono px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 rounded border border-slate-200 transition"
                  >
                    ADEC Ajaccio (39217556800022)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestIdentifier('84920194800018')}
                    className="text-[10px] font-mono px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 transition"
                    title="Numéro fictif de démonstration insulaire"
                  >
                    Démo locale (84920194800018)
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-lg border text-[11px] space-y-1 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-red-50 border-red-200 text-red-950'
                    }`}
                  >
                    <div className="flex items-start gap-1.5 font-bold">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                    {testResult.source && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        Source de réponse : {testResult.source}
                      </p>
                    )}
                    {testResult.details && (
                      <p className="text-[11px] opacity-90 pl-5 break-all">
                        {testResult.details}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Inspecteur de la Requête HTTP envoyée */}
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    Requête HTTP exacte transmise à l'API Entreprise (v4)
                  </span>
                  <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold border border-slate-700">
                    v4 INSEE Sirene
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1.5 border border-slate-800">
                  <div className="text-emerald-400 font-bold break-all">
                    GET {displayTarget}?context=Instruction%20dossier%20aide&recipient={cleanRecipient}&object=Diagnostic%20ADEC%202026 HTTP/1.1
                  </div>
                  <div className="text-slate-400">Host: entreprise.api.gouv.fr</div>
                  <div className="text-slate-400">
                    Authorization: Bearer {token.trim() ? (showToken ? token.trim() : `${token.trim().slice(0, 8)}...${token.trim().slice(-6)}`) : '<VOTRE_TOKEN_API_ENTREPRISE>'}
                  </div>
                  <div className="text-slate-400">User-Agent: ADEC-Corse-Diagnostic/1.0 (https://www.adec.corsica)</div>
                  <div className="text-slate-400">Accept: application/json</div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  <strong>Point d'accès v4 actif :</strong><br />
                  • Point d'accès officiel : <code className="text-sky-300">https://entreprise.api.gouv.fr/v4/insee/sirene/etablissements/&#123;siret&#125;</code><br />
                  • Paramètre <code className="text-sky-300">recipient</code> (SIRET demandeur) : <code>{cleanRecipient}</code>
                </p>
              </div>
            </div>

            {/* Footer déverrouillé */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              {isConfirmingClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-700 font-medium">Confirmer la suppression du jeton ?</span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Oui, supprimer
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(false)}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs transition"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 transition"
                >
                  Effacer le jeton
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-xs"
                >
                  Enregistrer les paramètres
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
