/**
 * Présence d'un jeton API Entreprise, tenue à jour dans tous les composants
 * (barre latérale, page Attestations, étape 1 du simulateur) et entre onglets.
 */

import { useEffect, useState } from 'react';
import { 
  API_TOKEN_CHANGE_EVENT, 
  hasConfiguredToken, 
  syncApiEntrepriseConfigFromServer 
} from '../services/apiEntreprise';

export function useHasApiEntrepriseToken(): boolean {
  const [hasToken, setHasToken] = useState<boolean>(hasConfiguredToken);

  useEffect(() => {
    // Synchroniser avec l'état du serveur pour toutes les connexions
    syncApiEntrepriseConfigFromServer().then(() => {
      setHasToken(hasConfiguredToken());
    });

    const update = () => setHasToken(hasConfiguredToken());
    window.addEventListener(API_TOKEN_CHANGE_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(API_TOKEN_CHANGE_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return hasToken;
}
