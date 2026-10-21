/**
 * Rédaction de la synthèse d'une Fiche Projet par IA, à partir des données lues
 * de façon exacte et des contrôles par règles. Claude (ANTHROPIC_API_KEY) en priorité,
 * Gemini (GEMINI_API_KEY) sinon. Sans clé : pas de texte rédigé, la synthèse par règles reste affichée.
 */

import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import type { FicheProjet, SyntheseProjet } from '../src/types/ficheProjet';

const RedactionSchema = z.object({
  resume: z.string().describe('Résumé du projet en 4 à 6 phrases : entreprise, besoin, programme, financement demandé.'),
  forces: z.array(z.string()).describe('2 à 5 atouts du dossier, chacun appuyé sur une donnée de la fiche.'),
  vigilances: z.array(z.string()).describe('2 à 5 points à vérifier par l’instructeur, en reprenant les points d’attention calculés.'),
  orientation: z.string().describe('Orientation vers une mesure d’aide ADEC, justifiée en 2 à 3 phrases.')
});

export type Redaction = z.infer<typeof RedactionSchema> & { moteur: string };

export interface DispositifResume {
  id: string;
  name: string;
  objective: string;
}

const SYSTEM_PROMPT = `Tu es instructeur des aides aux entreprises de l'Agence de Développement Économique de la Corse (ADEC).
Tu rédiges la synthèse d'une fiche projet déposée par une entreprise, à destination d'un chargé d'affaires.

Règles :
- Appuie-toi uniquement sur les données fournies. N'invente aucun chiffre, aucun fait, aucun nom.
- Les montants de la section « controles » sont recalculés à partir des lignes de dépenses : ils font foi sur les montants déclarés.
- Reprends dans les vigilances les points d'attention « bloquant » et « attention » fournis, reformulés pour un instructeur.
- Appel à projets : si l'entreprise répond à un appel à projets, c'est la mesure à proposer en orientation principale ; indique si elle correspond à l'un des dispositifs listés ou si elle n'y figure pas.
- Sinon, propose au plus deux dispositifs de la liste fournie, en justifiant par la nature du besoin. Précise que l'éligibilité définitive est établie par le simulateur.
- Français professionnel, phrases courtes, pas de formules creuses.`;

/** Données transmises à l'IA : la fiche sans coordonnées personnelles du demandeur */
const buildUserContent = (fiche: FicheProjet, synthese: SyntheseProjet, dispositifs: DispositifResume[]) => {
  const { demandeur: _demandeur, ...ficheSansContact } = fiche;
  return JSON.stringify({
    fiche: ficheSansContact,
    controles: {
      natureBesoin: synthese.natureBesoinLibelle,
      depenses: synthese.depenses,
      financement: synthese.financement,
      ratios: synthese.ratios,
      pointsAttention: synthese.pointsAttention,
      donneesManquantes: synthese.donneesManquantes
    },
    dispositifsAdec: dispositifs
  }, null, 1);
};

async function redigerAvecClaude(content: string): Promise<Redaction> {
  const client = new Anthropic();
  // fallbacks 'default' : si Claude décline la requête, l'API la relance sur un modèle de repli
  const response = await client.beta.messages.parse({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM_PROMPT,
    output_config: {
      effort: 'medium',
      format: betaZodOutputFormat(RedactionSchema)
    },
    messages: [{ role: 'user', content: `Rédige la synthèse de cette fiche projet.\n\n${content}` }]
  });
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    throw new Error(`Réponse Claude inexploitable (stop_reason : ${response.stop_reason})`);
  }
  return { ...response.parsed_output, moteur: 'Claude Opus 5.5' };
}

async function redigerAvecGemini(content: string): Promise<Redaction> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: `${SYSTEM_PROMPT}\n\nRéponds uniquement en JSON avec les clés "resume" (string), "forces" (string[]), "vigilances" (string[]), "orientation" (string).\n\n${content}`,
    config: { responseMimeType: 'application/json' }
  });
  const parsed = RedactionSchema.parse(JSON.parse(response.text || '{}'));
  return { ...parsed, moteur: 'Gemini Flash' };
}

export async function redigerSynthese(
  fiche: FicheProjet,
  synthese: SyntheseProjet,
  dispositifs: DispositifResume[]
): Promise<{ redaction?: Redaction; indisponible?: string }> {
  const content = buildUserContent(fiche, synthese, dispositifs);
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_PROFILE);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  if (!hasClaude && !hasGemini) {
    return { indisponible: 'Synthèse rédigée indisponible : aucune clé API IA configurée (ANTHROPIC_API_KEY ou GEMINI_API_KEY dans le fichier .env).' };
  }

  try {
    return { redaction: hasClaude ? await redigerAvecClaude(content) : await redigerAvecGemini(content) };
  } catch (err: any) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { indisponible: 'Synthèse rédigée indisponible : clé ANTHROPIC_API_KEY invalide.' };
    }
    if (err instanceof Anthropic.RateLimitError) {
      return { indisponible: 'Synthèse rédigée indisponible : limite de requêtes atteinte, réessayez dans un instant.' };
    }
    console.error('[Synthèse IA] Échec de la rédaction :', err?.message);
    return { indisponible: `Synthèse rédigée indisponible : ${err?.message || 'erreur du service IA'}.` };
  }
}
