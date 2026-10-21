/**
 * Fenêtre modale de configuration du jeton API Entreprise
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
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  X,
  Lock,
  Building,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { Badge, Modal, Notice, btn, inputClass, labelClass, linkClass } from './Layout/ui';

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
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

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
      setPasswordError('Renseigner le mot de passe administrateur.');
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
      setPasswordChangeNotice({ success: true, text: 'Mot de passe administrateur mis à jour.' });
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
        message: `Connexion réussie : établissement « ${res.mappedProfile.name} » (SIRET ${res.mappedProfile.siret || testIdentifier})`,
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

  const lockBadge = <Badge tone={isUnlocked ? 'success' : 'warning'}>{isUnlocked ? 'Déverrouillé' : 'Verrouillé'}</Badge>;

  // Écran 1 : verrouillé (saisie du mot de passe)
  if (!isUnlocked) {
    return (
      <Modal
        size="md"
        title="Jeton API Entreprise"
        subtitle="entreprise.api.gouv.fr · API Entreprise v4 · accès restreint"
        headerActions={lockBadge}
        onClose={onClose}
        bodyClassName="p-4 space-y-4"
        footer={
          <>
            <span />
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className={btn('secondary')}>
                Fermer
              </button>
              <button type="submit" form="api-token-unlock" className={btn('primary')}>
                <KeyRound className="w-3.5 h-3.5" />
                Déverrouiller
              </button>
            </div>
          </>
        }
      >
        <p className="text-xs text-neutral-600 leading-relaxed">
          Le jeton permet d’interroger directement la <strong>DGFiP</strong>, l’<strong>URSSAF</strong>, l’<strong>INPI</strong> et l’<strong>INSEE</strong>. Sa consultation et sa modification sont protégées par le mot de passe d’administration.
        </p>

        <form id="api-token-unlock" onSubmit={handleUnlock} className="space-y-1">
          <label htmlFor="api-admin-password" className={labelClass}>
            Mot de passe d’administration
          </label>
          <div className="relative">
            <input
              id="api-admin-password"
              type={showAdminPassword ? 'text' : 'password'}
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Mot de passe"
              autoFocus
              className={`${inputClass} pr-9`}
            />
            <button
              type="button"
              onClick={() => setShowAdminPassword(!showAdminPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              title={showAdminPassword ? 'Masquer' : 'Afficher'}
            >
              {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-red-700 font-medium flex items-center gap-1.5 pt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {passwordError}
            </p>
          )}
        </form>

        {/* Indication du mot de passe par défaut */}
        <Notice
          action={
            <button
              type="button"
              onClick={() => {
                setPasswordInput(DEFAULT_ADMIN_PASSWORD);
                setPasswordError('');
              }}
              className={btn('secondary', 'sm')}
            >
              Insérer
            </button>
          }
        >
          Mot de passe initial : <code className="font-mono font-semibold">{DEFAULT_ADMIN_PASSWORD}</code>, modifiable une fois l’accès déverrouillé.
        </Notice>
      </Modal>
    );
  }

  // Écran 2 : déverrouillé (modification du jeton et gestion)
  return (
    <Modal
      size="lg"
      title="Jeton API Entreprise"
      subtitle="entreprise.api.gouv.fr · API Entreprise v4 · session d’administration ouverte"
      headerActions={lockBadge}
      onClose={onClose}
      bodyClassName="p-4 space-y-5 text-xs text-neutral-700"
      footer={
        <>
          {isConfirmingClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-700 font-medium">Supprimer le jeton ?</span>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center h-7 px-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
              >
                Oui, supprimer
              </button>
              <button type="button" onClick={() => setIsConfirmingClear(false)} className={btn('secondary', 'sm')}>
                Annuler
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleClear} className={btn('danger')}>
              Effacer le jeton
            </button>
          )}

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={btn('secondary')}>
              Fermer
            </button>
            <button type="button" onClick={handleSave} className={btn('primary')}>
              Enregistrer
            </button>
          </div>
        </>
      }
    >
      {/* Session d'administration */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-neutral-600">Le jeton peut être modifié, effacé ou testé.</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsChangingPassword(!isChangingPassword);
              setPasswordChangeNotice(null);
            }}
            className={btn('secondary', 'sm')}
          >
            <KeyRound className="w-3 h-3" />
            {isChangingPassword ? 'Masquer' : 'Changer le mot de passe'}
          </button>
          <button type="button" onClick={handleLock} className={btn('secondary', 'sm')} title="Verrouiller à nouveau">
            <Lock className="w-3 h-3" />
            Verrouiller
          </button>
        </div>
      </div>

      {/* Changement de mot de passe */}
      {isChangingPassword && (
        <div className="px-3 py-3 border border-neutral-200 rounded-md bg-neutral-50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-neutral-900">Modifier le mot de passe d’administration</span>
            {hasCustomAdminPassword() && (
              <button
                type="button"
                onClick={handleResetPassword}
                className={`inline-flex items-center gap-1 text-[11px] ${linkClass}`}
                title={`Rétablir « ${DEFAULT_ADMIN_PASSWORD} »`}
              >
                <RefreshCw className="w-3 h-3" />
                Rétablir le mot de passe par défaut ({DEFAULT_ADMIN_PASSWORD})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label htmlFor="admin-current" className={labelClass}>Mot de passe actuel</label>
              <input id="admin-current" type="password" value={currentPasswordInput} onChange={(e) => setCurrentPasswordInput(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="admin-new" className={labelClass}>Nouveau mot de passe</label>
              <input id="admin-new" type="password" value={newPasswordInput} onChange={(e) => setNewPasswordInput(e.target.value)} placeholder="4 caractères minimum" className={inputClass} />
            </div>
            <div>
              <label htmlFor="admin-confirm" className={labelClass}>Confirmation</label>
              <input id="admin-confirm" type="password" value={confirmPasswordInput} onChange={(e) => setConfirmPasswordInput(e.target.value)} className={inputClass} />
            </div>
          </div>

          {passwordChangeNotice && (
            <Notice tone={passwordChangeNotice.success ? 'success' : 'danger'}>{passwordChangeNotice.text}</Notice>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsChangingPassword(false)} className={btn('secondary', 'sm')}>
              Annuler
            </button>
            <button type="button" onClick={handleChangePassword} className={btn('primary', 'sm')}>
              Valider le nouveau mot de passe
            </button>
          </div>
        </div>
      )}

      {/* Habilitations */}
      <div className="space-y-2">
        <p className="leading-relaxed">
          L’API Entreprise exige un jeton <code className="font-mono">Bearer</code> et le <strong>SIRET</strong> de l’organisme demandeur (paramètre <code className="font-mono">recipient</code>). Habilitations couvertes :
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
          <div><dt className="inline font-semibold text-neutral-900">DGFiP : </dt><dd className="inline">attestation fiscale, CA (3 exercices) et liasses</dd></div>
          <div><dt className="inline font-semibold text-neutral-900">URSSAF : </dt><dd className="inline">attestation de vigilance et cotisations</dd></div>
          <div><dt className="inline font-semibold text-neutral-900">INPI · RNE : </dt><dd className="inline">mandataires sociaux et dirigeants</dd></div>
          <div><dt className="inline font-semibold text-neutral-900">INSEE Sirene : </dt><dd className="inline">établissements (dont non diffusibles)</dd></div>
        </dl>
        <a href="https://entreprise.api.gouv.fr" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-[11px] ${linkClass}`}>
          Vérifier les habilitations sur entreprise.api.gouv.fr
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Jeton */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="api-token" className={labelClass}>Jeton Bearer API Entreprise</label>
          {token.trim() && (
            <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Jeton présent
            </span>
          )}
        </div>
        <div className="relative">
          <input
            id="api-token"
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
            className={`${inputClass} pr-9 font-mono`}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            title={showToken ? 'Masquer le jeton' : 'Afficher le jeton'}
          >
            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {saveSuccessNotice && (
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paramètres enregistrés.
          </p>
        )}
      </div>

      {/* SIRET de l'organisme demandeur */}
      <div>
        <label htmlFor="api-recipient" className={`${labelClass} flex items-center justify-between`}>
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-neutral-400" />
            SIRET de l’organisme demandeur (paramètre recipient)
          </span>
          <span className="text-[11px] font-normal text-neutral-500 font-mono">{(recipientSiret || '').length}/14</span>
        </label>
        <div className="relative">
          <input
            id="api-recipient"
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
            placeholder="Ex : 20007695800012 (Collectivité de Corse) ou 39217556800022 (ADEC)"
            className={`${inputClass} pr-8 font-mono`}
          />
          {recipientSiret && (
            <button
              type="button"
              onClick={() => setRecipientSiret('')}
              title="Effacer"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-neutral-500 mt-1">
          Par défaut, SIRET du siège de la Collectivité de Corse (<code className="font-mono">20007695800012</code>) ; possible aussi : SIRET de l’ADEC (<code className="font-mono">39217556800022</code>) ou celui rattaché au compte API Entreprise.
        </p>
      </div>

      {/* Test du jeton */}
      <div className="px-3 py-3 border border-neutral-200 rounded-md space-y-2">
        <label htmlFor="api-test-siret" className={labelClass}>Tester le jeton sur un SIRET</label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              id="api-test-siret"
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
              placeholder="14 chiffres"
              className={`${inputClass} pr-12 font-mono`}
            />
            <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono ${(testIdentifier || '').length === 14 ? 'text-emerald-700' : 'text-neutral-400'}`}>
              {(testIdentifier || '').length}/14
            </span>
          </div>
          <button type="button" onClick={handleTestToken} disabled={isTesting || !testIdentifier.trim()} className={btn('secondary')}>
            {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {isTesting ? 'Test en cours…' : 'Tester'}
          </button>
        </div>

        {/* Exemples */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-neutral-500 mr-1">Exemples :</span>
          {[
            { siret: '40001662200013', label: 'Brasserie Pietra' },
            { siret: '39217556800022', label: 'ADEC Ajaccio' },
            { siret: '84920194800018', label: 'Démo locale', title: 'Numéro fictif de démonstration' }
          ].map((ex) => (
            <button
              key={ex.siret}
              type="button"
              title={ex.title}
              onClick={() => setTestIdentifier(ex.siret)}
              className="text-[11px] px-2 py-0.5 bg-white hover:bg-neutral-50 text-neutral-700 rounded border border-neutral-200 cursor-pointer"
            >
              {ex.label} <span className="font-mono text-neutral-500">({ex.siret})</span>
            </button>
          ))}
        </div>

        {testResult && (
          <Notice tone={testResult.success ? 'success' : 'danger'} title={testResult.message}>
            {testResult.source && <p className="font-mono text-[11px] opacity-80">Source : {testResult.source}</p>}
            {testResult.details && <p className="whitespace-pre-line break-all">{testResult.details}</p>}
          </Notice>
        )}
      </div>

      {/* Requête HTTP transmise */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-neutral-500">Requête transmise à l’API Entreprise (v4, INSEE Sirene)</p>
        <pre className="bg-neutral-900 text-neutral-300 p-3 rounded-md font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
          <span className="text-emerald-400">
            GET {displayTarget}?context=Instruction%20dossier%20aide&amp;recipient={cleanRecipient}&amp;object=Diagnostic%20ADEC%202026 HTTP/1.1
          </span>
          {'\n'}Host: entreprise.api.gouv.fr
          {'\n'}Authorization: Bearer {token.trim() ? (showToken ? token.trim() : `${token.trim().slice(0, 8)}...${token.trim().slice(-6)}`) : '<JETON_API_ENTREPRISE>'}
          {'\n'}User-Agent: ADEC-Corse-Diagnostic/1.0 (https://www.adec.corsica)
          {'\n'}Accept: application/json
        </pre>
      </div>
    </Modal>
  );
};
