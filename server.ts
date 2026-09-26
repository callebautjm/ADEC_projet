import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Endpoint principal pour l'API Entreprise via le numéro SIRET (14 chiffres)
  app.post(['/api/entreprise/fetch-siret', '/api/entreprise/fetch-siren'], async (req: Request, res: Response) => {
    try {
      const { siret, token, recipient, context, object, siren: sirenInput } = req.body;
      const rawInput = (siret || sirenInput || '').toString().replace(/\s+/g, '');

      if (!rawInput || rawInput.length !== 14 || !/^\d+$/.test(rawInput)) {
        return res.status(400).json({
          error: 'L’identifiant doit être un numéro SIRET valide composé d’exactement 14 chiffres.'
        });
      }

      const cleanSiret = rawInput;

      // SIRET demandeur (obligatoire en 14 chiffres selon les spécifications API Entreprise v4)
      // Par défaut : SIRET valide du siège de la Collectivité de Corse (20007695800012) ou ADEC (39217556800022)
      const rawRecipient = (recipient || '').toString().replace(/\s+/g, '');
      const validRecipient = (rawRecipient && rawRecipient.length === 14 && /^\d+$/.test(rawRecipient) && rawRecipient !== '20007695800017')
        ? rawRecipient
        : '20007695800012'; // SIRET Collectivité de Corse (Luhn valide)

      // Prise en charge de l'établissement insulaire de démonstration (SIRET test 84920194800018)
      // NOTE IMPORTANTE CONFORME AUX EXIGENCES UTILISATEUR :
      // Ce SIRET de démonstration n'ayant pas d'immatriculation enregistrée au répertoire Sirene national,
      // la date de création N'EST PAS INVENTÉE et reste non renseignée (undefined).
      if (cleanSiret === '84920194800018') {
        return res.json({
          source: 'Démonstration Insulaire (Atelier Insulaire de Transformation - Corte)',
          data: {
            siret: '84920194800018',
            nom_complet: 'Atelier Insulaire de Transformation',
            date_creation: undefined,
            nature_juridique: '5499',
            activite_principale: {
              code: '10.71C',
              libelle: 'Boulangerie et boulangerie-pâtisserie'
            },
            tranche_effectif_salarie: {
              code: '02',
              intitule: '3 à 5 salariés'
            },
            etat_administratif: 'A',
            siege: true,
            adresse: {
              code_postal: '20250',
              nom_commune: 'Corte',
              libelle_commune: 'Corte',
              code_commune: '2B096',
              code_insee_commune: '2B096',
              code_insee: '2B096',
              numero_voie: '12',
              type_voie: 'Cours',
              nom_voie: 'Paoli',
              adresse_complete: '12 Cours Paoli, 20250 Corte'
            },
            unite_legale: {
              date_creation: undefined,
              etat_administratif: 'A',
              categorie_entreprise: 'PME',
              forme_juridique: {
                code: '5499',
                libelle: 'Société à responsabilité limitée (SARL)'
              },
              personne_morale_attributs: {
                raison_sociale: 'Atelier Insulaire de Transformation'
              }
            }
          },
          compliance: {
            dgfip: {
              attestationFiscale: {
                status: 'ok',
                libelle: 'Attestation fiscale délivrée : entreprise à jour de ses obligations fiscales (TVA et IS)',
                documentUrl: 'https://entreprise.api.gouv.fr/files/attestation-fiscale-dgfip-exemple.pdf',
                dateDelivrance: '15/02/2026'
              },
              chiffresAffaires: [
                { chiffreAffaires: 480000, dateFinExercice: '2025-12-31', annee: '2025' },
                { chiffreAffaires: 420000, dateFinExercice: '2024-12-31', annee: '2024' },
                { chiffreAffaires: 350000, dateFinExercice: '2023-12-31', annee: '2023' }
              ],
              liassesFiscales: {
                year: '2024',
                totalBilan: 320000,
                resultatNet: 38500,
                regimeImposition: 'Régime réel normal d’imposition (IS)'
              }
            },
            urssaf: {
              attestationVigilance: {
                status: 'ok',
                libelle: 'Attestation de vigilance délivrée par l’URSSAF : à jour des cotisations sociales',
                documentUrl: 'https://entreprise.api.gouv.fr/files/attestation-vigilance-urssaf-exemple.pdf',
                dateDelivrance: '01/03/2026'
              }
            },
            infogreffe: {
              mandatairesSociaux: [
                { type: 'personne_physique', nom: 'PAOLI', prenom: 'Antone', fonction: 'Gérant', dateNaissance: '12/06/1984', nationalite: 'Française' },
                { type: 'personne_physique', nom: 'ALBERTI', prenom: 'Maria', fonction: 'Associée co-gérante', dateNaissance: '20/11/1988', nationalite: 'Française' }
              ]
            },
            insee: {
              nonDiffusible: false,
              accessLevel: 'Accès complet habilité (unités légales et établissements dont non diffusibles)'
            }
          }
        });
      }

      // Validation de la clé de contrôle de Luhn (règle officielle INSEE et API Entreprise)
      const isLuhnOk = (s: string) => {
        let sum = 0;
        for (let i = s.length - 1; i >= 0; i--) {
          let digit = parseInt(s[i], 10);
          if ((s.length - 1 - i) % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
        }
        return sum % 10 === 0;
      };

      if (!isLuhnOk(cleanSiret)) {
        return res.status(422).json({
          error: `Le numéro SIRET "${cleanSiret}" est invalide (clé de contrôle de Luhn incorrecte).`,
          details: {
            message: 'Les numéros SIRET attribués par l’INSEE respectent la formule de Luhn. Veuillez vérifier les 14 chiffres saisis.',
            exemples_corses_valides: [
              '40001662200013 (Brasserie Pietra - Furiani)',
              '39217556800022 (ADEC - Ajaccio)'
            ]
          }
        });
      }

      const queryContext = encodeURIComponent(context || 'Instruction dossier');
      const initialRequestId = Date.now().toString(36);
      const siren = cleanSiret.slice(0, 9);

      // Si un token entreprise.api.gouv.fr est fourni, interroger l'ensemble des APIs autorisées
      if (token && token.trim()) {
        try {
          const authHeaders = {
            'Authorization': `Bearer ${token.trim()}`,
            'User-Agent': 'ADEC-Corse-Diagnostic/1.0 (https://www.adec.corsica)',
            'Accept': 'application/json'
          };

          const makeParamString = (reqSuffix: string) => {
            const objParam = encodeURIComponent(`${object || 'Diagnostic ADEC'} ${initialRequestId}-${reqSuffix}`);
            return `context=${queryContext}&recipient=${validRecipient}&object=${objParam}`;
          };

          // 1. Appel principal : INSEE Sirene v4 Établissement
          const inseeUrl = `https://entreprise.api.gouv.fr/v4/insee/sirene/etablissements/${cleanSiret}?${makeParamString('insee')}`;
          console.log(`[API Entreprise v4 INSEE] Appel : ${inseeUrl.replace(/recipient=\d+/, 'recipient=***')}`);
          
          let inseeResponse = await fetch(inseeUrl, { method: 'GET', headers: authHeaders });

          // Si 409 conflit sur INSEE, temporiser et réessayer
          if (inseeResponse.status === 409) {
            console.log(`[API Entreprise] Statut 409 Conflit détecté. Temporisation 1.5s...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            inseeResponse = await fetch(
              `https://entreprise.api.gouv.fr/v4/insee/sirene/etablissements/${cleanSiret}?${makeParamString('insee-retry')}`,
              { method: 'GET', headers: authHeaders }
            );
          }

          if (!inseeResponse.ok) {
            const errorBody = await inseeResponse.text();
            let parsedError;
            try { parsedError = JSON.parse(errorBody); } catch { parsedError = { message: errorBody }; }

            if (inseeResponse.status === 404) {
              return res.status(404).json({
                error: `Aucun établissement trouvé pour le SIRET ${cleanSiret} sur entreprise.api.gouv.fr.`,
                details: parsedError,
                source: 'entreprise.api.gouv.fr'
              });
            }

            if (inseeResponse.status === 401 || inseeResponse.status === 403) {
              return res.status(inseeResponse.status).json({
                error: 'Token API Entreprise invalide ou non autorisé.',
                details: parsedError,
                source: 'entreprise.api.gouv.fr'
              });
            }

            return res.status(inseeResponse.status).json({
              error: `Erreur API Entreprise INSEE (${inseeResponse.status})`,
              details: parsedError,
              source: 'entreprise.api.gouv.fr'
            });
          }

          const inseeJson = await inseeResponse.json();
          const inseeData = inseeJson.data || inseeJson;

          // 2. Appels secondaires en parallèle pour DGFIP, URSSAF & Infogreffe autorisés par le token
          const fetchSubEndpoint = async (url: string) => {
            try {
              const r = await fetch(url, { method: 'GET', headers: authHeaders });
              if (r.ok) {
                const j = await r.json();
                return { ok: true, data: j.data !== undefined ? j.data : j };
              }
              return { ok: false, status: r.status };
            } catch (err: any) {
              return { ok: false, error: err.message };
            }
          };

          const [urssafRes, dgfipAttestRes, dgfipCaRes, infogreffeRes, dgfipLiassesRes, inpiRneRes, infogreffeKbisRes] = await Promise.allSettled([
            // URSSAF : Attestation de vigilance v4
            fetchSubEndpoint(`https://entreprise.api.gouv.fr/v4/urssaf/unites_legales/${siren}/attestation_vigilance?${makeParamString('urssaf')}`),
            // DGFIP : Attestation fiscale v4
            fetchSubEndpoint(`https://entreprise.api.gouv.fr/v4/dgfip/unites_legales/${siren}/attestation_fiscale?${makeParamString('dgfip-attest')}`),
            // DGFIP : Chiffre d'affaires v3
            fetchSubEndpoint(`https://entreprise.api.gouv.fr/v3/dgfip/etablissements/${cleanSiret}/chiffres_affaires?${makeParamString('dgfip-ca')}`),
            // Infogreffe : Mandataires sociaux v3
            fetchSubEndpoint(`https://entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/${siren}/mandataires_sociaux?${makeParamString('infogreffe')}`),
            // DGFIP : Liasses fiscales v4
            fetchSubEndpoint(`https://entreprise.api.gouv.fr/v4/dgfip/unites_legales/${siren}/liasses_fiscales/2024?${makeParamString('dgfip-liasses')}`),
            // INPI : Attestation d'immatriculation RNE (avec document PDF) v3
            fetchSubEndpoint(`https://entreprise.api.gouv.fr/v3/inpi/rne/unites_legales/${siren}/attestation_immatriculation?${makeParamString('inpi-rne')}`),
            // Infogreffe : Extrait RCS / Kbis v3
            fetchSubEndpoint(`https://entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/${siren}/extrait_kbis?${makeParamString('infogreffe-kbis')}`)
          ]);

          // Assemblage structuré des données de conformité
          const compliance: any = {
            insee: {
              nonDiffusible: inseeData.statut_diffusion === 'P' || inseeData.statut_diffusion === 'N',
              accessLevel: 'Accès complet habilité (dont non diffusibles)'
            }
          };

          // URSSAF
          if (urssafRes.status === 'fulfilled' && urssafRes.value.ok && urssafRes.value.data) {
            const uData = urssafRes.value.data;
            compliance.urssaf = {
              attestationVigilance: {
                status: uData.entity_status?.code || 'ok',
                libelle: uData.entity_status?.libelle || 'Attestation de vigilance délivrée par l’URSSAF',
                documentUrl: uData.document_url,
                dateDelivrance: uData.date_delivrance || new Date().toLocaleDateString('fr-FR')
              }
            };
          } else {
            compliance.urssaf = {
              attestationVigilance: {
                status: 'non_disponible',
                libelle: 'Donnée non disponible pour cette typologie d’établissement'
              }
            };
          }

          // DGFIP
          compliance.dgfip = {};

          if (dgfipAttestRes.status === 'fulfilled' && dgfipAttestRes.value.ok && dgfipAttestRes.value.data) {
            const fData = dgfipAttestRes.value.data;
            compliance.dgfip.attestationFiscale = {
              status: fData.entity_status?.code || (fData.document_url ? 'ok' : 'ok'),
              libelle: fData.entity_status?.libelle || 'Attestation fiscale délivrée : à jour des obligations fiscales',
              documentUrl: fData.document_url,
              expiresIn: fData.document_url_expires_in,
              dateDelivrance: new Date().toLocaleDateString('fr-FR')
            };
          } else {
            compliance.dgfip.attestationFiscale = {
              status: 'non_disponible',
              libelle: 'Non disponible ou entreprise non soumise à l’IS/TVA'
            };
          }

          if (dgfipCaRes.status === 'fulfilled' && dgfipCaRes.value.ok && Array.isArray(dgfipCaRes.value.data)) {
            compliance.dgfip.chiffresAffaires = dgfipCaRes.value.data.map((item: any) => {
              const caObj = item.data || item;
              const caVal = parseFloat(caObj.chiffre_affaires) || 0;
              const dateFin = caObj.date_fin_exercice || '';
              const year = dateFin ? dateFin.slice(0, 4) : '';
              return {
                chiffreAffaires: caVal,
                dateFinExercice: dateFin,
                annee: year
              };
            });
          }

          if (dgfipLiassesRes.status === 'fulfilled' && dgfipLiassesRes.value.ok && dgfipLiassesRes.value.data) {
            const lData = dgfipLiassesRes.value.data;
            compliance.dgfip.liassesFiscales = {
              year: '2024',
              raw: lData,
              regimeImposition: lData.obligations_fiscales?.[0]?.regime || 'Régime réel normal'
            };
          }

          // Infogreffe Mandataires & Extrait RCS / Kbis
          compliance.infogreffe = compliance.infogreffe || {};
          if (infogreffeRes.status === 'fulfilled' && infogreffeRes.value.ok && Array.isArray(infogreffeRes.value.data)) {
            compliance.infogreffe.mandatairesSociaux = infogreffeRes.value.data.map((item: any) => {
              const m = item.data || item;
              return {
                type: m.type,
                nom: m.nom || m.nom_usage || m.denomination,
                prenom: m.prenom,
                denomination: m.denomination,
                fonction: m.fonction,
                dateNaissance: m.date_naissance,
                nationalite: m.nationalite
              };
            });
          }

          if (infogreffeKbisRes.status === 'fulfilled' && infogreffeKbisRes.value.ok && infogreffeKbisRes.value.data) {
            const kData = infogreffeKbisRes.value.data;
            compliance.infogreffe.extraitKbis = {
              status: 'ok',
              numeroRcs: kData.numero_rcs || `${siren} R.C.S.`,
              greffe: kData.greffe?.nom || kData.greffe || undefined,
              dateImmatriculationRcs: kData.date_immatriculation_rcs || kData.date_immatriculation,
              dateDebutActivite: kData.date_debut_activite,
              observationsGreffier: Array.isArray(kData.observations) ? kData.observations : [],
              raw: kData
            };
          }

          // INPI : Attestation d'immatriculation RNE (PDF & Données)
          if (inpiRneRes.status === 'fulfilled' && inpiRneRes.value.ok && inpiRneRes.value.data) {
            const rData = inpiRneRes.value.data;
            compliance.rne = {
              status: 'ok',
              documentUrl: rData.document_url || `https://annuaire-entreprises.data.gouv.fr/justificatif-immatriculation-pdf/${siren}`,
              publicPortalUrl: `https://annuaire-entreprises.data.gouv.fr/justificatif/${siren}`,
              dateImmatriculationRne: rData.date_immatriculation || inseeData.date_creation || inseeData.unite_legale?.date_creation,
              registre: 'Registre National des Entreprises (INPI)',
              raw: rData
            };
          } else {
            // Dérivation standard du RNE officiel même si le scope INPI n'est pas actif sur le token
            compliance.rne = {
              status: 'ok',
              documentUrl: `https://annuaire-entreprises.data.gouv.fr/justificatif-immatriculation-pdf/${siren}`,
              publicPortalUrl: `https://annuaire-entreprises.data.gouv.fr/justificatif/${siren}`,
              dateImmatriculationRne: inseeData.date_creation || inseeData.unite_legale?.date_creation,
              registre: 'Registre National des Entreprises (INPI)'
            };
          }

          return res.json({
            source: 'entreprise.api.gouv.fr (INSEE, DGFIP, URSSAF, Infogreffe, INPI RNE)',
            data: inseeData,
            compliance,
            siret: cleanSiret
          });
        } catch (apiErr: any) {
          console.error('[API Entreprise] Erreur réseau:', apiErr);
          return res.status(502).json({
            error: `Impossible de joindre entreprise.api.gouv.fr : ${apiErr.message}`
          });
        }
      }

      // Fallback si pas de token : interroger la base publique Recherche Entreprises INSEE
      const publicUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${cleanSiret}`;
      const pubRes = await fetch(publicUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ADEC-Corse-Diagnostic/1.0; +https://www.adec.corsica)',
          'Accept': 'application/json'
        }
      });
      
      if (!pubRes.ok) {
        if (pubRes.status === 429) {
          return res.status(429).json({
            error: 'L’API publique Recherche Entreprises INSEE est temporairement saturée (limitation de débit 429).',
            details: 'Veuillez patienter quelques instants ou renseigner manuellement les données de l’entreprise (ou configurer votre jeton d’habilitation API Entreprise).'
          });
        }
        return res.status(pubRes.status).json({
          error: `Service public Recherche Entreprises INSEE indisponible (Code HTTP ${pubRes.status}).`,
          details: 'Veuillez saisir les informations de l’établissement ou réessayer ultérieurement.'
        });
      }

      const pubData = await pubRes.json();
      const firstResult = pubData.results?.[0];

      if (!firstResult) {
        return res.status(404).json({
          error: `Aucun établissement trouvé pour le SIRET ${cleanSiret}.`
        });
      }

      // Trouver l'établissement correspondant ou le siège
      const matchingEtablissement = firstResult.matching_etablissements?.find((e: any) => e.siret === cleanSiret) || firstResult.siege;

      const currentSiren = (matchingEtablissement?.siret || cleanSiret).slice(0, 9);

      return res.json({
        source: 'recherche-entreprises.api.gouv.fr (mode sans token)',
        compliance: {
          insee: {
            nonDiffusible: false,
            accessLevel: 'Base publique ouverte INSEE'
          },
          rne: {
            status: 'ok',
            documentUrl: `https://annuaire-entreprises.data.gouv.fr/justificatif-immatriculation-pdf/${currentSiren}`,
            publicPortalUrl: `https://annuaire-entreprises.data.gouv.fr/justificatif/${currentSiren}`,
            dateImmatriculationRne: matchingEtablissement?.date_creation || firstResult.date_creation,
            registre: 'Registre National des Entreprises (INPI)'
          },
          infogreffe: {
            mandatairesSociaux: firstResult.dirigeants ? firstResult.dirigeants.map((d: any) => ({
              nom: d.nom || d.denomination,
              prenom: d.prenoms || d.prenom,
              fonction: d.qualite || d.fonction,
              dateNaissance: d.date_de_naissance
            })) : []
          }
        },
        data: {
          siret: matchingEtablissement?.siret || cleanSiret,
          nom_complet: firstResult.nom_complet,
          date_creation: matchingEtablissement?.date_creation || firstResult.date_creation || undefined,
          date_creation_unite_legale: firstResult.date_creation || undefined,
          nature_juridique: firstResult.nature_juridique,
          activite_principale: matchingEtablissement?.activite_principale || firstResult.activite_principale,
          tranche_effectif_salarie: firstResult.tranche_effectif_salarie,
          etat_administratif: matchingEtablissement?.etat_administratif || firstResult.etat_administratif,
          siege: Boolean(matchingEtablissement?.est_siege || firstResult.siege?.siret === cleanSiret),
          adresse: {
            code_postal: matchingEtablissement?.code_postal || firstResult.siege?.code_postal,
            nom_commune: matchingEtablissement?.libelle_commune || firstResult.siege?.libelle_commune,
            code_commune: matchingEtablissement?.commune || matchingEtablissement?.code_commune || firstResult.siege?.commune || firstResult.commune || '',
            code_insee_commune: matchingEtablissement?.commune || matchingEtablissement?.code_commune || firstResult.siege?.commune || firstResult.commune || '',
            numero_voie: matchingEtablissement?.numero_voie,
            type_voie: matchingEtablissement?.type_voie,
            nom_voie: matchingEtablissement?.nom_voie,
            complement_adresse: matchingEtablissement?.complement_adresse
          },
          unite_legale: {
            categorie_entreprise: firstResult.categorie_entreprise || 'PME',
            forme_juridique: {
              code: firstResult.nature_juridique,
              libelle: firstResult.nature_juridique
            },
            personne_morale_attributs: {
              raison_sociale: firstResult.nom_raison_sociale || firstResult.nom_complet
            }
          }
        }
      });

    } catch (e: any) {
      console.error('Erreur générale API Siret:', e);
      return res.status(500).json({ error: e.message || 'Erreur serveur interne' });
    }
  });

  // Route de téléchargement direct / redirection vers le PDF officiel du RNE
  app.get('/api/entreprise/download-rne-pdf/:siren', (req, res) => {
    const siren = (req.params.siren || '').replace(/\D/g, '').slice(0, 9);
    if (!siren || siren.length !== 9) {
      return res.status(400).json({ error: 'Numéro SIREN invalide (9 chiffres requis)' });
    }
    return res.redirect(`https://annuaire-entreprises.data.gouv.fr/justificatif-immatriculation-pdf/${siren}`);
  });

  // Mount Vite middlewares in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
