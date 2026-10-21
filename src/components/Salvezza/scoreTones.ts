/**
 * Couleur d'un score de contrainte Salvezza, commune au tableau, à la carte et à sa légende.
 */

import { SalvezzaConstraintScore } from '../../types';
import { Tone } from '../Layout/ui';

export const SCORE_TONES: Record<SalvezzaConstraintScore, { tone: Tone; dot: string; hex: string; label: string }> = {
  'au dessus de 4': { tone: 'danger', dot: 'bg-red-600', hex: '#dc2626', label: 'Score > 4 (contrainte forte)' },
  'de 3,5 à 4': { tone: 'warning', dot: 'bg-amber-600', hex: '#d97706', label: 'Score 3,5 à 4 (contrainte moyenne)' },
  'de 3 à 3,5': { tone: 'info', dot: 'bg-petrole-600', hex: '#177a9c', label: 'Score 3 à 3,5 (contrainte de base)' }
};
