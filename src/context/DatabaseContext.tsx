/**
 * Context & Store for Documentary Databases and Schemes
 * Cullettività di Corsica / ADEC
 * 
 * Permet l'analyse et la mise à jour automatique lors de l'ajout
 * de nouvelles bases de données documentaires ou dispositifs réglementaires.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DispositifScheme, DocumentaryDatabaseMetadata } from '../types';
import { OFFICIAL_DOCUMENTARY_DATABASE } from '../data/adecOfficialData';

interface DatabaseContextType {
  databases: DocumentaryDatabaseMetadata[];
  allActiveSchemes: DispositifScheme[];
  selectedDatabaseId: string | 'ALL';
  setSelectedDatabaseId: (id: string | 'ALL') => void;
  addNewDatabase: (db: DocumentaryDatabaseMetadata) => void;
  addScheme: (scheme: DispositifScheme, targetDbId?: string) => void;
  updateScheme: (schemeId: string, updated: Partial<DispositifScheme>) => void;
  deleteScheme: (schemeId: string) => void;
  toggleSchemeActive: (schemeId: string) => void;
  importFromJson: (jsonString: string) => { success: boolean; message: string };
  exportToJson: () => string;
  resetToOfficial: () => void;
  autoIngestRegulatoryText: (
    title: string,
    rawText: string,
    category: 'Pattu Risilienzia è Territorii' | 'Guide des Aides - Évaluation Qualitative' | 'Base Personnalisée'
  ) => { success: boolean; scheme?: DispositifScheme; error?: string };
}

const STORAGE_KEY = 'adec_documentary_databases_v2026';

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [databases, setDatabases] = useState<DocumentaryDatabaseMetadata[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load databases from localStorage', e);
    }
    return [OFFICIAL_DOCUMENTARY_DATABASE];
  });

  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | 'ALL'>('ALL');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(databases));
    } catch (e) {
      console.error('Failed to save databases to localStorage', e);
    }
  }, [databases]);

  const allActiveSchemes = React.useMemo(() => {
    let result: DispositifScheme[] = [];
    for (const db of databases) {
      if (selectedDatabaseId === 'ALL' || db.id === selectedDatabaseId) {
        result = result.concat(db.schemes);
      }
    }
    return result;
  }, [databases, selectedDatabaseId]);

  const addNewDatabase = (newDb: DocumentaryDatabaseMetadata) => {
    setDatabases((prev) => [...prev, newDb]);
  };

  const addScheme = (scheme: DispositifScheme, targetDbId?: string) => {
    setDatabases((prev) => {
      const targetId = targetDbId || prev[0]?.id || 'custom-base';
      return prev.map((db) => {
        if (db.id === targetId) {
          const updatedSchemes = [...db.schemes, scheme];
          return {
            ...db,
            schemes: updatedSchemes,
            schemesCount: updatedSchemes.length
          };
        }
        return db;
      });
    });
  };

  const updateScheme = (schemeId: string, updated: Partial<DispositifScheme>) => {
    setDatabases((prev) =>
      prev.map((db) => {
        const index = db.schemes.findIndex((s) => s.id === schemeId);
        if (index !== -1) {
          const newSchemes = [...db.schemes];
          newSchemes[index] = { ...newSchemes[index], ...updated };
          return { ...db, schemes: newSchemes };
        }
        return db;
      })
    );
  };

  const deleteScheme = (schemeId: string) => {
    setDatabases((prev) =>
      prev.map((db) => {
        const filtered = db.schemes.filter((s) => s.id !== schemeId);
        return {
          ...db,
          schemes: filtered,
          schemesCount: filtered.length
        };
      })
    );
  };

  const toggleSchemeActive = (schemeId: string) => {
    setDatabases((prev) =>
      prev.map((db) => ({
        ...db,
        schemes: db.schemes.map((s) => (s.id === schemeId ? { ...s, isActive: !s.isActive } : s))
      }))
    );
  };

  const importFromJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].schemes) {
        setDatabases(parsed);
        return { success: true, message: `${parsed.length} base(s) documentaire(s) importée(s) avec succès.` };
      }
      if (parsed.id && parsed.schemes && Array.isArray(parsed.schemes)) {
        setDatabases((prev) => [...prev.filter((d) => d.id !== parsed.id), parsed]);
        return { success: true, message: `Base "${parsed.title}" importée avec ${parsed.schemes.length} dispositif(s).` };
      }
      return { success: false, message: 'Format JSON non reconnu. Doit contenir un objet ou tableau de base documentaire valide.' };
    } catch (e: any) {
      return { success: false, message: `Erreur de syntaxe JSON : ${e.message}` };
    }
  };

  const exportToJson = (): string => {
    return JSON.stringify(databases, null, 2);
  };

  const resetToOfficial = () => {
    setDatabases([OFFICIAL_DOCUMENTARY_DATABASE]);
    setSelectedDatabaseId('ALL');
  };

  /**
   * Analyseur automatique de nouveau document / texte réglementaire
   * Parse et structure automatiquement un nouveau dispositif pour l'intégrer
   * au moteur de règles en temps réel.
   */
  const autoIngestRegulatoryText = (
    title: string,
    rawText: string,
    category: 'Pattu Risilienzia è Territorii' | 'Guide des Aides - Évaluation Qualitative' | 'Base Personnalisée'
  ) => {
    if (!title.trim() || !rawText.trim()) {
      return { success: false, error: 'Le titre et le texte du document sont requis.' };
    }

    try {
      const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
      const textLower = rawText.toLowerCase();

      // Extraction intelligente des taux
      let tpeRate = 0.70;
      let peRate = 0.60;
      let pmeRate = 0.50;

      if (textLower.includes('70 %') || textLower.includes('70%')) tpeRate = 0.70;
      if (textLower.includes('90 %') || textLower.includes('90%')) tpeRate = 0.90;
      if (textLower.includes('50 %') || textLower.includes('50%')) pmeRate = 0.50;
      if (textLower.includes('30 %') || textLower.includes('30%')) pmeRate = 0.30;
      if (textLower.includes('60 %') || textLower.includes('60%')) peRate = 0.60;

      // Détection plafond
      let ceiling = 300000;
      if (textLower.includes('15 000')) ceiling = 15000;
      else if (textLower.includes('30 000')) ceiling = 30000;
      else if (textLower.includes('300 000') || textLower.includes('300000')) ceiling = 300000;

      // Détection plancher
      let floor = 5000;
      if (textLower.includes('15 000 euros') && ceiling > 15000) floor = 15000;

      // Détection de l'évaluation qualitative
      const requiresQual = category === 'Guide des Aides - Évaluation Qualitative' || textLower.includes('qualitative') || textLower.includes('21/177');

      // Détection des secteurs
      const allowedSectors: any[] = ['INDUSTRIE', 'COMMERCE', 'ARTISANAT', 'SERVICES', 'ESS'];
      const excludedSectors: any[] = ['AGRICULTURE_PECHE_SYLVICULTURE', 'HEBERGEMENT_TOURISTIQUE', 'FINANCE_IMMOBILIER'];

      const newId = `custom_${Date.now()}`;
      const newScheme: DispositifScheme = {
        id: newId,
        code: `DOC-${databases.reduce((acc, d) => acc + d.schemes.length, 1)}`,
        name: title,
        subtitle: `Dispositif importé et analysé automatiquement depuis la base documentaire`,
        documentSourceId: databases[0]?.id || 'base-adec-2026-officielle',
        category,
        legalBasis: textLower.includes('de minimis')
          ? 'Règlement (UE) 2023/2831 de minimis (300 000 € sur 3 ans)'
          : 'Cadre réglementaire de la Collectivité de Corse',
        governingDeliberation: requiresQual
          ? 'Délibération N° 21/177 AC (Évaluation qualitative : ≥ 3 OUI)'
          : 'Dispositif spécifique',
        requiresQualitativeEvaluation: requiresQual,
        objective: lines.slice(0, 3).join(' ') || 'Objectif défini par la nouvelle base documentaire.',
        targetBeneficiariesSummary: 'TPE, PE et PME installées et exerçant leur exploitation principale en Corse.',
        allowedSizes: ['TPE', 'PE', 'PME'],
        allowedSectors,
        excludedSectors,
        excludedLegalForms: ['SCI', 'MICRO_ENTREPRISE'],
        specificRequirements: [
          'Établissement et exploitation en Corse',
          'À jour des cotisations fiscales et sociales',
          'Respect des règles européennes applicables'
        ],
        eligibleExpenseCategories: [
          'Dépenses prévues au texte réglementaire analysé',
          'Investissements matériels ou immatériels directement liés au projet'
        ],
        ineligibleExpenseCategories: [
          'Fonctionnement courant sans lien direct',
          'Dépenses antérieures au dépôt de la demande'
        ],
        rates: {
          tpeMaxRate: tpeRate,
          peMaxRate: peRate,
          pmeMaxRate: pmeRate,
          floorAmount: floor,
          ceilingAmount: ceiling
        },
        procedure: {
          portalUrl: 'https://www.adec.corsica',
          submissionMethod: 'Dépôt de la demande en ligne sur le portail ADEC',
          decisionBody: 'Instruction ADEC puis décision en Bureau de l’ADEC',
          requiredDocuments: [
            'Présentation de l’entreprise',
            'Descriptif détaillé du projet',
            'Plan de financement prévisionnel',
            'Déclaration de minimis'
          ],
          mandatoryCommitments: [
            'Mention du soutien ADEC et Cullettività di Corsica',
            'Contrôle sur pièce et sur place pendant 3 ans'
          ],
          controlDurationYears: 3
        },
        sourceDocumentPages: 'Document additionnel intégré',
        isActive: true
      };

      addScheme(newScheme);
      return { success: true, scheme: newScheme };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        databases,
        allActiveSchemes,
        selectedDatabaseId,
        setSelectedDatabaseId,
        addNewDatabase,
        addScheme,
        updateScheme,
        deleteScheme,
        toggleSchemeActive,
        importFromJson,
        exportToJson,
        resetToOfficial,
        autoIngestRegulatoryText
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabases = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabases must be used within a DatabaseProvider');
  }
  return context;
};
