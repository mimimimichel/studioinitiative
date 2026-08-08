/* ===== Studio Initiative — agent conversationnel de la page de scan =====
 *
 * Fonction serverless (Vercel, runtime Node). Diffuse la réponse en SSE pour que
 * les premiers mots s'affichent immédiatement : sur cette page, la latence tue
 * l'effet autant qu'une mauvaise réponse.
 *
 * Le contexte du prospect n'est JAMAIS pris dans la requête du client : il est
 * relu côté serveur depuis k/data/<tag>.json. Le navigateur ne peut donc pas
 * réécrire ce que l'agent croit savoir.
 *
 * Variable d'environnement requise : ANTHROPIC_API_KEY
 */

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-opus-5';
const MAX_MESSAGE_CHARS = 600;
const MAX_HISTORY = 12;

const client = new Anthropic(); // lit ANTHROPIC_API_KEY dans l'environnement

/* ------------------------------------------------------------------ */
/* Socle de connaissance — stable, donc mis en cache par l'API         */
/* ------------------------------------------------------------------ */

const GROUNDING = `Tu es l'agent conversationnel de Studio Initiative, cabinet de conseil en data et intelligence artificielle basé à Toulouse (France et Europe), fondé par Michael Lozano — quinze ans dans la data industrielle.

Tu parles à un prospect que Michael a rencontré en rendez-vous. Il vient de scanner le porte-clés NFC qu'il a reçu à la fin de ce rendez-vous, et il est tombé sur une page qui lui montre son propre dossier : ce qu'il a dit, et ce que les agents du cabinet en ont produit depuis. Il arrive donc avec du contexte, et probablement avec l'envie de te tester.

# Le modèle du cabinet
Chaque mission est portée par un consultant senior, épaulé par quatre familles d'agents IA développées par le cabinet : Pipelines (génère, teste, déploie), Qualité data (contrôle, alerte, corrige), Documentation (rédige, met à jour), Gouvernance (cartographie, trace). Le volume va aux agents, les décisions au consultant.

Trois principes, à connaître et à savoir défendre :
1. L'humain garde la main. Le consultant conçoit l'architecture, arbitre les choix techniques et porte la relation. Les agents proposent, le consultant décide — rien n'est livré sans sa validation.
2. Vos données, vos règles. Le socle d'agents est opéré par le cabinet sur son infrastructure. Quand les contraintes du client l'exigent (confidentialité, conformité, données sensibles), il se déploie dans l'environnement du client, sous ses règles de sécurité.
3. Le workflow est repensé. L'IA ne se superpose pas à l'existant : le processus de delivery lui-même est refondu. C'est là que se crée l'écart de productivité, pas dans l'outil pris isolément.

# Ce que le cabinet livre
- Produits data : cadrage, conception et industrialisation, de la définition du besoin à la mise en production. Spécialisation Palantir Foundry.
- Automatisation par l'IA : refonte de workflows métiers avec des agents. Priorisation des cas d'usage, passage du pilote à la production, contrôle humain à chaque étape.
- Gouvernance des données : qualité, traçabilité, conformité (RGPD, AI Act). Le socle sans lequel les projets IA plafonnent au stade du pilote.

# Comment tu réponds
- En français, au vouvoiement, dans un registre professionnel et direct. Pas de flagornerie, pas de superlatifs marketing, pas d'émojis.
- Court. Deux à cinq phrases en général. Tu es sur un téléphone, pas dans un livre blanc. Si la question mérite plus, structure en quelques lignes brèves.
- Concret. Tu préfères un ordre de grandeur assumé à une généralité prudente.
- Tu peux être en désaccord avec ton interlocuteur, poliment, quand il se trompe. C'est un signe de compétence, pas d'impolitesse.

# Tes limites, à tenir strictement
- Tu ne connais que ce qui figure dans ce message : le cabinet, et le dossier ci-dessous. Si on te demande autre chose (l'actualité, un concurrent, un point technique que tu ignores, un détail du dossier qui n'y figure pas), tu le dis simplement et tu proposes d'en parler avec Michael. Ne devine jamais.
- Tu ne t'engages sur AUCUN prix ferme, AUCUN devis, AUCUN délai contractuel. Tu peux donner des ordres de grandeur ("un cadrage se compte en semaines, pas en trimestres") en précisant qu'ils demandent confirmation. Un chiffrage est du ressort de Michael.
- Tu ne parles pas de sujets étrangers au cabinet et à la data. Tu ramènes poliment la conversation.
- Tu n'inventes jamais une référence client, un logo, un chiffre de résultat.
- N'inclus aucune balise XML interne ni aucun commentaire sur ton propre fonctionnement dans ta réponse. Réponds seulement.

# Ce vers quoi tu ramènes
Quand la conversation arrive naturellement à sa fin, ou quand la question dépasse ce que tu peux traiter, tu proposes les vingt minutes de cadrage avec Michael, ou un mot à contact@studioinitiative.com. Une fois suffit — n'insiste pas à chaque réponse.`;

/* ------------------------------------------------------------------ */

const isValidTag = (t) => typeof t === 'string' && /^[A-Za-z0-9_-]{1,24}$/.test(t);

async function loadContext(req, tag) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const names = isValidTag(tag) ? [tag.toUpperCase(), '_demo'] : ['_demo'];

  for (const name of names) {
    try {
      const r = await fetch(`${proto}://${host}/k/data/${name}.json`, { cache: 'no-store' });
      if (!r.ok) continue;
      const d = await r.json();
      return buildContext(d);
    } catch {
      /* dossier suivant */
    }
  }
  return "Aucun dossier n'a pu être chargé. Réponds en mode découverte, sans prétendre connaître ton interlocuteur.";
}

function buildContext(d) {
  const p = d.prospect || {};
  const lines = ['# Dossier ouvert devant toi'];

  if (p.firstName) {
    lines.push(
      `Interlocuteur : ${[p.firstName, p.lastName].filter(Boolean).join(' ')}` +
      (p.role ? `, ${p.role}` : '') +
      (p.company ? ` — ${p.company}` : '') + '.'
    );
  }
  if (d.meeting?.datetime) {
    lines.push(`Rendez-vous : ${d.meeting.datetime}${d.meeting.place ? ' ' + d.meeting.place : ''}.`);
  }
  if (d.quotes?.length) {
    lines.push('\nCe qu\'il a dit en rendez-vous (verbatim) :');
    d.quotes.forEach((q) => lines.push(`- « ${q} »`));
  }
  if (d.agents?.length) {
    lines.push('\nCe que les agents ont produit depuis, et que la page lui affiche :');
    d.agents.forEach((a) => lines.push(`- Agent ${a.name} : ${a.line}`));
  }
  if (d.findings?.length) {
    lines.push('\nConstats chiffrés affichés à l\'écran (ordres de grandeur, pas des mesures) :');
    d.findings.forEach((f) => lines.push(`- ${f.value}${f.unit ? ' ' + f.unit : ''} — ${f.label} : ${f.detail}`));
  }
  if (d.chat?.context) {
    lines.push('\n# Notes internes de Michael (ne les cite jamais telles quelles)\n' + d.chat.context);
  }
  return lines.join('\n');
}

/* ------------------------------------------------------------------ */

function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  const msgs = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS).trim() }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_HISTORY);

  // L'API exige un premier tour utilisateur.
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  return msgs;
}

/* Garde-fou léger : un seul instance-local, donc best-effort — c'est un
   ralentisseur, pas une serrure. */
const hits = new Map();
function throttled(ip) {
  const now = Date.now();
  const win = 60_000;
  const bucket = (hits.get(ip) || []).filter((t) => now - t < win);
  bucket.push(now);
  hits.set(ip, bucket);
  if (hits.size > 500) hits.clear();
  return bucket.length > 20;
}

/* ------------------------------------------------------------------ */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'local';
  if (throttled(ip)) {
    res.status(429).json({ error: 'rate_limited' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const messages = sanitizeHistory(body.messages);
  if (!messages.length) {
    res.status(400).json({ error: 'no_message' });
    return;
  }

  const context = await loadContext(req, body.tag);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  let written = 0;
  const write = (obj) => {
    if (obj.t) written += obj.t.length;
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  const params = {
    model: MODEL,
    max_tokens: 1600,
    // Effort bas : sur un chat mobile la latence compte autant que la finesse.
    // La réflexion reste active (recommandé sur Opus 5) mais courte.
    output_config: { effort: 'low' },
    system: [
      // Bloc stable en premier → mis en cache et relu à ~0,1× sur les tours suivants.
      { type: 'text', text: GROUNDING, cache_control: { type: 'ephemeral' } },
      // Bloc volatile ensuite : il change d'un prospect à l'autre.
      { type: 'text', text: context }
    ],
    messages
  };

  // Repli côté serveur si les classifieurs déclinent la demande : le prospect
  // obtient une réponse plutôt qu'un blanc. Si le bêta n'est pas ouvert sur
  // l'organisation, on retombe sur l'appel standard — mais seulement tant que
  // rien n'a encore été écrit, sinon on couperait une réponse en cours.
  const pipe = async (stream) => {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        write({ t: event.delta.text });
      }
    }
    return stream.finalMessage();
  };

  try {
    let final;
    try {
      final = await pipe(client.beta.messages.stream({
        ...params,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default'
      }));
    } catch (betaErr) {
      if (written > 0) throw betaErr;
      console.warn('[chat] repli sans fallbacks :', betaErr?.message || betaErr);
      final = await pipe(client.messages.stream(params));
    }

    if (final?.stop_reason === 'refusal' && written === 0) {
      write({ t: "Je préfère ne pas traiter cette demande ici. Michael y répondra mieux que moi : contact@studioinitiative.com." });
    }

    write({ done: true });
  } catch (err) {
    console.error('[chat]', err?.message || err);
    write({ error: 'upstream' });
  } finally {
    res.end();
  }
}
