/**
 * Utilitaire de Téléchargement et Récupération du Justificatif d'Immatriculation RNE (PDF)
 * 
 * Source officielle de l'État :
 * https://annuaire-entreprises.data.gouv.fr/justificatif-immatriculation-pdf/{siren}
 * 
 * Ce module gère la récupération du flux PDF officiel auprès de l'INPI et de l'Annuaire des Entreprises,
 * via notre proxy serveur (/api/rne/pdf/:siren) avec bascule directe vers le téléchargement navigateur.
 */

export const OFFICIAL_RNE_PDF_BASE_URL = 'https://annuaire-entreprises.data.gouv.fr/justificatif-immatriculation-pdf/';

/**
 * Construit l'URL officielle de téléchargement direct du PDF de l'attestation RNE
 * @param siren Numéro SIREN (9 chiffres)
 */
export function getOfficialRneDownloadUrl(siren: string): string {
  const clean = (siren || '').replace(/\D/g, '').slice(0, 9);
  return `${OFFICIAL_RNE_PDF_BASE_URL}${clean}`;
}

export interface RneDownloadResult {
  success: boolean;
  method: 'direct_stream' | 'browser_download' | 'error';
  fileName: string;
  message: string;
}

/**
 * Récupère le PDF de l'attestation RNE et déclenche son enregistrement sur le poste de l'utilisateur
 * 1. Tente d'abord de récupérer le flux binaire PDF via le proxy serveur dédié /api/rne/pdf/:siren
 * 2. Si le flux est reçu, génère un Blob et déclenche le téléchargement localement
 * 3. En cas de blocage réseau ou de redirection, déclenche le téléchargement direct depuis l'Annuaire des Entreprises
 */
export async function retrieveAndDownloadOfficialRnePdf(
  siren: string,
  companyName?: string
): Promise<RneDownloadResult> {
  const clean = (siren || '').replace(/\D/g, '').slice(0, 9);
  if (!clean || clean.length !== 9) {
    return {
      success: false,
      method: 'error',
      fileName: '',
      message: 'Numéro SIREN invalide (9 chiffres requis).'
    };
  }

  const officialUrl = getOfficialRneDownloadUrl(clean);
  const targetFileName = `justificatif_immatriculation_rne_${clean}${companyName ? `_${companyName.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}` : ''}.pdf`;

  try {
    // 1. Tenter de récupérer le flux binaire PDF via le proxy serveur
    const response = await fetch(`/api/rne/pdf/${clean}`);
    const contentType = response.headers.get('content-type') || '';

    if (response.ok && contentType.includes('application/pdf')) {
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = targetFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);

      return {
        success: true,
        method: 'direct_stream',
        fileName: targetFileName,
        message: 'Le justificatif RNE officiel (PDF INPI) a été récupéré et téléchargé avec succès.'
      };
    }
  } catch (err) {
    console.warn('[RNE Downloader] Tentative de récupération via proxy non aboutie, ouverture directe:', err);
  }

  // 2. Déclenchement du téléchargement direct depuis l'adresse officielle
  try {
    const link = document.createElement('a');
    link.href = officialUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = targetFileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      method: 'browser_download',
      fileName: targetFileName,
      message: 'Téléchargement de l’attestation RNE lancé directement depuis l’Annuaire des Entreprises (data.gouv.fr).'
    };
  } catch (browserErr) {
    // Dernier recours : ouverture de la page
    window.open(officialUrl, '_blank');
    return {
      success: true,
      method: 'browser_download',
      fileName: targetFileName,
      message: 'Ouverture du document officiel dans un nouvel onglet.'
    };
  }
}
