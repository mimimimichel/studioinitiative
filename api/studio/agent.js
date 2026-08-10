/* ===== M4 — les agents deviennent exécutables =====
 *
 * Les prompts de la page « 🤖 Les agents IA » de Notion, transformés en
 * boutons. Quatre agents servent dès la phase 0 :
 *
 *   eclaireur  — brief d'un compte cible → remplit « Signaux data / IA »
 *                dans la fiche du compte + brief complet en corps de page.
 *   plume      — deux variantes de message pour un contact → posées dans
 *                la fiche du contact, prêtes à copier.
 *   debriefeur — notes de RDV en vrac → proposition de fiche structurée,
 *                renvoyée au navigateur pour relecture. N'écrit rien :
 *                c'est /api/studio/crm qui enregistre après validation.
 *   vigie      — digest hebdomadaire, renvoyé au navigateur.
 *
 * La règle absolue de la page Notion est conservée telle quelle :
 * AUCUN envoi automatique. Les agents écrivent dans Notion ou à l'écran,
 * jamais vers un prospect.
 *
 * Recherche web : disponible avec une clé Anthropic (outil web_search).
 * Avec les modèles gratuits OpenRouter, l'agent travaille de mémoire et
 * le dit — le champ `searched` de la réponse l'indique au cockpit.
 */

import { requireAuth, notion, queryAll, DB, P, W, toBlocks, llm, parseJson, todayParis, dateLisible } from '../_lib/studio.js';

export const config = { maxDuration: 60 };

const PREUVES = `Les trois preuves de Studio Initiative (cabinet data & IA, Toulouse, fondé par Michael Lozano) :
80+ data products livrés sur Airbus Skywise · CSAT 4,8/5 et disponibilité > 98 % · l'un des ~50 profils seniors Palantir Foundry en France.`;

/* ------------------------------------------------------------------ */
/* Éclaireur                                                           */
/* ------------------------------------------------------------------ */

async function eclaireur(body) {
  const page = await notion(`pages/${body.compteId}`, 'GET');
  const nom = P.title(page, 'Nom');
  if (!nom) throw Object.assign(new Error('Compte introuvable.'), { code: 'no_compte' });

  const fiche = [
    `Entreprise : ${nom}`,
    P.select(page, 'Secteur') && `Secteur : ${P.select(page, 'Secteur')}`,
    P.select(page, 'Taille') && `Taille : ${P.select(page, 'Taille')}`,
    P.text(page, 'Localisation') && `Localisation : ${P.text(page, 'Localisation')}`,
    P.url(page, 'Site web') && `Site : ${P.url(page, 'Site web')}`,
    P.text(page, 'Contact') && `Contact visé : ${P.text(page, 'Contact')}`,
    P.text(page, 'Notes') && `Notes de Michael : ${P.text(page, 'Notes')}`
  ].filter(Boolean).join('\n');

  const system = `Tu es l'Éclaireur, l'analyste de prospection de Studio Initiative. ${PREUVES}

Produis un brief d'une page maximum, en français, structuré ainsi :
1. **L'entreprise en 3 lignes** — activité, taille, actualité récente pertinente (12 derniers mois).
2. **Signaux data/IA** — indices publics d'un programme data ou IA : offres d'emploi data, communiqués, conférences, stack citée (Foundry, Databricks, Snowflake…), obligations réglementaires probables (AI Act, secteur régulé).
3. **Hypothèses de douleur** — 2-3 problèmes probables, du point de vue du persona.
4. **Angle d'approche** — laquelle des trois preuves résonne le plus, et pourquoi.
5. **3 questions à poser en RDV** — ouvertes, spécifiques à cette entreprise, jamais génériques.

Si tu ne trouves pas de signal data/IA, dis-le franchement plutôt que d'inventer. Cite tes sources quand tu as pu chercher.

Termine IMPÉRATIVEMENT par une ligne commençant par "SIGNAUX:" suivie d'un résumé des signaux en 400 caractères maximum, sans retour à la ligne — c'est ce qui ira dans la colonne de la base.`;

  const out = await llm(system, `Prépare le brief pour ce compte cible :\n\n${fiche}`, {
    webSearch: true, effort: 'medium', maxTokens: 2500
  });

  /* La ligne SIGNAUX: alimente la colonne ; le reste part en corps de page. */
  const m = out.text.match(/SIGNAUX:\s*([\s\S]+)$/);
  const signaux = (m ? m[1] : out.text).replace(/\s+/g, ' ').trim().slice(0, 1800);
  const brief = m ? out.text.slice(0, m.index).trim() : out.text;

  const avertissement = out.searched ? '' :
    '\n\n⚠ Brief établi sans recherche web (clé Anthropic absente) : à vérifier avant usage.';

  await notion(`pages/${body.compteId}`, 'PATCH', {
    properties: { 'Signaux data / IA': W.text(signaux + (out.searched ? '' : ' [sans recherche web — à vérifier]')) }
  });
  await notion(`blocks/${body.compteId}/children`, 'PATCH', {
    children: [
      { object: 'block', type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: `Brief Éclaireur — ${dateLisible()}` } }] } },
      ...toBlocks(brief + avertissement)
    ]
  });

  return { texte: brief, signaux, searched: out.searched, provider: out.provider, ecrit: true, url: page.url };
}

/* ------------------------------------------------------------------ */
/* Plume réseau                                                        */
/* ------------------------------------------------------------------ */

async function plume(body) {
  const page = await notion(`pages/${body.contactId}`, 'GET');
  const nom = P.title(page, 'Nom');
  if (!nom) throw Object.assign(new Error('Contact introuvable.'), { code: 'no_contact' });

  const entreprise = P.text(page, 'Entreprise');

  /* Si l'Éclaireur est passé sur le compte, son travail sert de munitions. */
  let signaux = '';
  if (entreprise) {
    try {
      const comptes = await queryAll(DB.comptes, { property: 'Nom', title: { equals: entreprise } });
      if (comptes.length) signaux = P.text(comptes[0], 'Signaux data / IA');
    } catch { /* pas bloquant */ }
  }

  const fiche = [
    `Contact : ${nom}`,
    P.text(page, 'Rôle') && `Rôle : ${P.text(page, 'Rôle')}`,
    entreprise && `Entreprise : ${entreprise}`,
    P.select(page, 'Persona') && `Persona : ${P.select(page, 'Persona')}`,
    P.select(page, 'Proximité') && `Proximité : ${P.select(page, 'Proximité')}`,
    P.select(page, 'Statut') && `Statut pipeline : ${P.select(page, 'Statut')}`,
    P.text(page, 'Douleur / verbatim') && `Douleur exprimée : ${P.text(page, 'Douleur / verbatim')}`,
    signaux && `Signaux data/IA du compte (Éclaireur) : ${signaux}`,
    body.contexte && `Contexte donné par Michael : ${body.contexte}`
  ].filter(Boolean).join('\n');

  const system = `Tu es la Plume réseau : tu rédiges les messages de prospection de Michael Lozano, fondateur de Studio Initiative. L'objectif n'est jamais de vendre une mission : c'est d'obtenir une conversation de 30 minutes.

Règles :
- 60 à 110 mots maximum. Tutoiement si proximité forte, vouvoiement sinon.
- Structure : accroche personnelle sincère → une phrase sur le lancement de Studio Initiative → demande d'avis ou de conversation, jamais demande de mission.
- Proximité forte : posture « je fais le tour des gens dont j'estime le regard avant de me lancer ».
- Contact froid : « j'ai vu [signal précis], ça croise ce sur quoi je travaille, curieux d'échanger 20 minutes ».
- Interdits : superlatifs, jargon commercial, flatterie creuse, mention du TJM, plus d'une question par message.

Produis EXACTEMENT deux variantes, précédées de "— Variante directe —" et "— Variante chaleureuse —", puis une ligne "À vérifier avant envoi :" listant ce qui doit être contrôlé ou personnalisé à la main.`;

  const out = await llm(system, `Rédige les deux variantes pour ce contact :\n\n${fiche}`, {
    effort: 'medium', maxTokens: 1200
  });

  await notion(`blocks/${body.contactId}/children`, 'PATCH', {
    children: [
      { object: 'block', type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: `Messages proposés (Plume) — ${dateLisible()}` } }] } },
      ...toBlocks(out.text + '\n\nRien n\'a été envoyé : relire, personnaliser, puis copier dans LinkedIn ou le mail.')
    ]
  });

  return { texte: out.text, provider: out.provider, ecrit: true, url: page.url };
}

/* ------------------------------------------------------------------ */
/* Débriefeur                                                          */
/* ------------------------------------------------------------------ */

async function debriefeur(body) {
  const notes = String(body.notes || '').trim();
  if (notes.length < 40) {
    throw Object.assign(new Error('Trop court pour un débrief : collez vos notes de rendez-vous.'), { code: 'no_notes' });
  }

  const system = `Tu es le Débriefeur : tu transformes les notes brutes de rendez-vous de Michael Lozano (Studio Initiative) en fiche CRM exploitable.

Réponds UNIQUEMENT avec un objet JSON, sans texte autour, avec ces clés :
{
 "nom": "prénom + nom de l'interlocuteur, ou vide",
 "entreprise": "",
 "role": "",
 "persona": "un de : CDO / Head of Data, Directeur de programme data, DSI, Direction métier, ESN / Business manager, Autre",
 "statut": "un de : 2 · Conversation tenue, 3 · RDV qualifié, 4 · Proposition envoyée",
 "verbatim": "les mots exacts les plus forts du client, une phrase",
 "action": "le next step concret convenu ou à provoquer",
 "dateAction": "AAAA-MM-JJ réaliste (sous 7 jours si rien de convenu)",
 "compteRendu": "le débrief complet en markdown : ## Rôle dans la décision / ## Douleurs exprimées (verbatims) / ## Objections entendues / ## Next step / ## Apprentissage ICP",
 "questionsOuvertes": ["ce que les notes ne permettent pas de savoir et qu'il faudra demander"]
}
N'invente rien : une rubrique sans matière reste vide, et la question correspondante va dans questionsOuvertes. La date du jour est ${todayParis()}.`;

  const out = await llm(system, `Mes notes de rendez-vous :\n\n${notes.slice(0, 12000)}`, {
    effort: 'medium', maxTokens: 2200
  });

  const fiche = parseJson(out.text);
  if (!fiche) {
    throw Object.assign(new Error('Le modèle n\'a pas produit une fiche lisible — réessayez, ou passez sur la clé Anthropic.'), { code: 'bad_json' });
  }
  /* Rien n'est écrit : la fiche revient à l'écran pour relecture. */
  return { fiche, provider: out.provider, ecrit: false };
}

/* ------------------------------------------------------------------ */
/* Vigie                                                               */
/* ------------------------------------------------------------------ */

async function vigie() {
  const system = `Tu es la Vigie hebdomadaire de Michael Lozano (Studio Initiative — data, Palantir Foundry, agents IA, Toulouse). Produis un digest en français, 3 blocs, une page maximum :
1. **Écosystème Palantir** — annonces produit (Foundry, AIP), contrats et déploiements en Europe, mouvements chez les industriels français.
2. **Agents IA en entreprise** — sorties majeures, retours d'industrialisation, chiffres d'adoption. Filtre impitoyablement le bruit marketing.
3. **Réglementaire & gouvernance** — échéances AI Act, positions CNIL/UE, obligations sectorielles.

Pour chaque item : 2 lignes de résumé + 1 ligne « pourquoi c'est pertinent ». Cite tes sources quand tu as pu chercher. Termine par **Matière à post** : les 2 items qui feraient les meilleurs posts LinkedIn, avec un angle en une phrase.`;

  const out = await llm(system, `Nous sommes le ${todayParis()}. Prépare le digest de la semaine.`, {
    webSearch: true, effort: 'medium', maxTokens: 2500
  });

  const avert = out.searched ? '' :
    '\n\n⚠ Digest établi sans recherche web (clé Anthropic absente) : les faits récents peuvent manquer.';
  return { texte: out.text + avert, searched: out.searched, provider: out.provider, ecrit: false };
}

/* ------------------------------------------------------------------ */

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!requireAuth(req, res)) return;

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const agents = { eclaireur, plume, debriefeur, vigie };
  const fn = agents[body.agent];
  if (!fn) {
    res.status(400).json({ error: 'bad_agent', message: `Agent inconnu : ${body.agent}` });
    return;
  }

  try {
    const resultat = await fn(body);
    res.status(200).json(resultat);
  } catch (err) {
    console.error('[agent]', body.agent, err.code || '', err.message);
    res.status(502).json({ error: err.code || 'agent_failed', message: err.message });
  }
}
