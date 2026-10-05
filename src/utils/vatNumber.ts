/**
 * Calcul officiel de la clé et du numéro de TVA Intracommunautaire français
 * Formule DGI / DGFiP : Clé = (12 + 3 * (SIREN modulo 97)) modulo 97
 */
export function calculateFrenchVatNumber(sirenOrSiret: string | undefined): string {
  if (!sirenOrSiret) return '';
  const clean = sirenOrSiret.replace(/\D/g, '').slice(0, 9);
  if (clean.length !== 9) return '';
  const num = parseInt(clean, 10);
  if (isNaN(num)) return '';
  const key = (12 + 3 * (num % 97)) % 97;
  return `FR ${String(key).padStart(2, '0')} ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
}
