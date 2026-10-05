/**
 * Modale de Téléchargement & Génération de l'Attestation d'Immatriculation RNE (PDF)
 * Registre National des Entreprises (INPI) & Équivalence Kbis (Décret n° 2021-631)
 */

import React from 'react';
import { CompanyProfile } from '../types';
import { ComplianceAttestationsModal } from './ComplianceAttestationsModal';

export interface RneDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
}

export const RneDownloadModal: React.FC<RneDownloadModalProps> = ({
  isOpen,
  onClose,
  company
}) => {
  return (
    <ComplianceAttestationsModal
      isOpen={isOpen}
      onClose={onClose}
      company={company}
      initialType="rne"
    />
  );
};
