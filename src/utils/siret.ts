/**
 * Utilitaires pour le nettoyage et la validation de numéro SIRET
 */

/**
 * Nettoie une chaîne SIRET saisie ou collée :
 * - Supprime tous les espaces (normaux, insécables, tabulations, etc.)
 * - Supprime tous les tirets (tirets courts, tirets cadratin, demi-cadratin, tirets bas, etc.)
 * - Supprime les séparateurs parasites (points, slashs)
 * - Limite la longueur maximale à 14 caractères
 */
export function cleanSiret(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[\s\-_—–−\u00A0\u202F\.\/]/g, '')
    .slice(0, 14);
}

/**
 * Détermine si une touche frappée correspond à un caractère proscrit (espace, tiret, etc.)
 */
export function isForbiddenSiretKey(key: string): boolean {
  return key === ' ' || key === '-' || key === '_' || key === '.' || key === '/';
}
