/* ===== Studio Initiative — agent conversationnel de la page de scan =====
 *
 * Fonction serverless (Vercel, runtime Node). Diffuse la réponse en SSE pour que
 * les premiers mots s'affichent immédiatement : sur cette page, la latence tue
 * l'effet autant qu'une mauvaise réponse.
 *
 * Deux fournisseurs, choisis automatiquement selon les variables présentes :
 *
 *   ANTHROPIC_API_KEY   → Claude (claude-opus-5). C'est la qualité de service
 *                         qu'on veut devant un prospect.
 *   OPENROUTER_API_KEY  → modèle gratuit via OpenRouter. Pour tester sans payer.
 *   CHAT_PROVIDER       → "anthropic" | "openrouter" pour forcer, si les deux
 *                         clés sont présentes.
 *
 * Le contexte du prospect n'est JAMAIS pris dans la requête du client : il est
 * relu côté serveur depuis k/data/<tag>.json. Le navigateur ne peut donc pas
 * réécrire ce que l'agent croit savoir.
 */

const MAX_MESSAGE_CHARS = 600;
const MAX_HISTORY = 12;

const ANTHROPIC_MODEL = 'claude-opus-5';

/* Chaîne de repli OpenRouter : les modèles gratuits sont régulièrement saturés
   (429), on essaie le suivant. Ordre établi par mesure sur une vraie question
   de prospect en français — délai avant le premier mot, justesse du ton,
   absence de raisonnement en clair.
   Mesures (premier mot, en flux) : gemma-4-26b 0,8 s stable · nemotron ultra
   3,5 à 7,6 s selon la charge, mais réponses plus fines.
   Pour changer l'ordre sans toucher au code : variable OPENROUTER_MODELS,
   liste séparée par des virgules. */
const OPENROUTER_MODELS = (process.env.OPENROUTER_MODELS ||
  'google/gemma-4-26b-a4b-it:free,nvidia/nemotron-3-ultra-550b-a55b:free,openai/gpt-oss-20b:free'
).split(',').map((s) => s.trim()).filter(Boolean);

/* ------------------------------------------------------------------ */
/* Socle de connaissance — stable, donc mis en cache côté Claude       */
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
- Tu ne connais pas le genre de ton interlocuteur, sauf s'il ressort clairement du dossier. Évite les accords genrés qui le supposent ("vous êtes venu", "vous seriez intéressé") : tourne autrement. Un accord faux se remarque tout de suite et abîme l'effet.
- Court. Deux à cinq phrases en général. Tu es sur un téléphone, pas dans un livre blanc. Si la question mérite plus, structure en quelques lignes brèves.
- Concret. Tu préfères un ordre de grandeur assumé à une généralité prudente.
- Tu peux être en désaccord avec ton interlocuteur, poliment, quand il se trompe. C'est un signe de compétence, pas d'impolitesse.
- Tu t'adresses directement à lui. Ne parle jamais de lui à la troisième personne, et ne le nomme pas comme s'il s'agissait d'un tiers.

# Tes limites, à tenir strictement
- Tu ne connais que ce qui figure dans ce message : le cabinet, et le dossier ci-dessous. Si on te demande autre chose (l'actualité, un concurrent, un point technique que tu ignores, un détail du dossier qui n'y figure pas), tu le dis simplement et tu proposes d'en parler avec Michael. Ne devine jamais.
- Tu n'inventes pas la méthode de calcul d'un chiffre du dossier. Si on te demande d'où vient un chiffre, tu dis honnêtement qu'il s'agit d'un ordre de grandeur établi à partir de ce qui a été décrit en rendez-vous, et qu'il demande confirmation sur pièces. N'invente jamais une formule ni un temps unitaire.
- Tu ne t'engages sur AUCUN prix ferme, AUCUN devis, AUCUN délai contractuel. Tu peux donner des ordres de grandeur ("un cadrage se compte en semaines, pas en trimestres") en précisant qu'ils demandent confirmation. Un chiffrage est du ressort de Michael.
- Tu ne parles pas de sujets étrangers au cabinet et à la data. Tu ramènes poliment la conversation.
- Tu n'inventes jamais une référence client, un logo, un chiffre de résultat.
- Réponds directement, en français. N'écris jamais ton raisonnement, ni de balise interne, ni de commentaire sur ton propre fonctionnement.

# Ce vers quoi tu ramènes
Quand la conversation arrive naturellement à sa fin, ou quand la question dépasse ce que tu peux traiter, tu proposes les vingt minutes de cadrage avec Michael, ou un mot à contact@studioinitiative.com. Une fois suffit — n'insiste pas à chaque réponse.`;

/* ------------------------------------------------------------------ */
/* Dossier prospect — relu côté serveur                                */
/* ------------------------------------------------------------------ */

const isValidTag = (t) => typeof t === 'string' && /^[A-Za-z0-9_-]{1,24}$/.test(t);

function originOf(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  // Derrière Vercel l'en-tête est toujours présent ; en local il ne l'est pas,
  // et forcer https ferait échouer la lecture du dossier.
  const proto = req.headers['x-forwarded-proto'] ||
    (req.socket?.encrypted ? 'https' : /^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https');
  return `${proto}://${host}`;
}

async function loadContext(req, tag) {
  const origin = originOf(req);
  const names = isValidTag(tag) ? [tag.toUpperCase(), '_demo'] : ['_demo'];

  for (const name of names) {
    try {
      const r = await fetch(`${origin}/k/data/${name}.json`, { cache: 'no-store' });
      if (!r.ok) continue;
      return buildContext(await r.json());
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
/* Fournisseur A — Claude                                              */
/* ------------------------------------------------------------------ */

async function* streamAnthropic(system, context, messages) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();

  const params = {
    model: ANTHROPIC_MODEL,
    max_tokens: 1600,
    // Effort bas : sur un chat mobile la latence compte autant que la finesse.
    // La réflexion reste active (recommandé sur Opus 5) mais courte.
    output_config: { effort: 'low' },
    system: [
      // Bloc stable en premier → mis en cache et relu à ~0,1× sur les tours suivants.
      { type: 'text', text: system, cache_control: { type: 'ephemeral' } },
      // Bloc volatile ensuite : il change d'un prospect à l'autre.
      { type: 'text', text: context }
    ],
    messages
  };

  const drain = async function* (stream) {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  };

  // Repli côté serveur si les classifieurs déclinent la demande. Si le bêta
  // n'est pas ouvert sur l'organisation, on retombe sur l'appel standard.
  try {
    yield* drain(client.beta.messages.stream({
      ...params,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default'
    }));
  } catch (err) {
    console.warn('[chat] repli sans fallbacks :', err?.message || err);
    yield* drain(client.messages.stream(params));
  }
}

/* ------------------------------------------------------------------ */
/* Fournisseur B — OpenRouter (modèles gratuits)                       */
/* ------------------------------------------------------------------ */

async function* streamOpenRouter(system, context, messages, req) {
  const key = process.env.OPENROUTER_API_KEY;
  const origin = originOf(req);
  const body = {
    stream: true,
    max_tokens: 700,
    messages: [{ role: 'system', content: system + '\n\n' + context }, ...messages]
  };

  let lastErr = 'aucun modèle disponible';

  for (const model of OPENROUTER_MODELS) {
    let res;
    try {
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          // Attribution demandée par OpenRouter.
          'HTTP-Referer': origin,
          'X-Title': 'Studio Initiative'
        },
        body: JSON.stringify({ ...body, model })
      });
    } catch (e) {
      lastErr = e.message;
      continue;
    }

    // 429 = modèle gratuit saturé : on essaie le suivant de la chaîne.
    if (!res.ok || !res.body) {
      lastErr = `${model} → ${res.status}`;
      console.warn('[chat] openrouter', lastErr);
      continue;
    }

    let emitted = false;
    for await (const chunk of readSse(res.body)) {
      if (chunk === '[DONE]') break;
      let piece;
      try { piece = JSON.parse(chunk)?.choices?.[0]?.delta?.content; } catch { continue; }
      if (piece) { emitted = true; yield piece; }
    }
    if (emitted) return;
    lastErr = `${model} → réponse vide`;
  }

  throw new Error(lastErr);
}

async function* readSse(stream) {
  const reader = stream.getReader();
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n');
    buf = parts.pop();
    for (const line of parts) {
      const t = line.trim();
      if (t.startsWith('data:')) yield t.slice(5).trim();
    }
  }
}

/* ------------------------------------------------------------------ */
/* Filtre de sortie                                                    */
/* ------------------------------------------------------------------ */

/* Certains modèles ouverts recrachent leur raisonnement entre balises, parfois
   en anglais. Devant un prospect c'est rédhibitoire : on le retire au vol. */
function makeCleaner() {
  let buf = '';
  let inThought = false;
  const OPEN = /<(think|thought|reasoning|analysis)>/i;
  const CLOSE = /<\/(think|thought|reasoning|analysis)>/i;

  return {
    push(chunk) {
      buf += chunk;
      let out = '';
      for (;;) {
        if (inThought) {
          const m = buf.match(CLOSE);
          if (!m) { buf = buf.slice(-24); return out; }
          buf = buf.slice(m.index + m[0].length);
          inThought = false;
        } else {
          const m = buf.match(OPEN);
          if (!m) {
            // On retient une queue courte, au cas où une balise soit coupée
            // entre deux morceaux du flux.
            const keep = Math.min(buf.length, 12);
            out += buf.slice(0, buf.length - keep);
            buf = buf.slice(buf.length - keep);
            return out;
          }
          out += buf.slice(0, m.index);
          buf = buf.slice(m.index + m[0].length);
          inThought = true;
        }
      }
    },
    flush() { return inThought ? '' : buf; }
  };
}

/* ------------------------------------------------------------------ */
/* Entrée client                                                       */
/* ------------------------------------------------------------------ */

function sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  const msgs = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS).trim() }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_HISTORY);

  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  return msgs;
}

/* Garde-fou léger : local à l'instance, donc best-effort — c'est un
   ralentisseur, pas une serrure. */
const hits = new Map();
function throttled(ip) {
  const now = Date.now();
  const bucket = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  bucket.push(now);
  hits.set(ip, bucket);
  if (hits.size > 500) hits.clear();
  return bucket.length > 20;
}

function pickProvider() {
  const forced = (process.env.CHAT_PROVIDER || '').toLowerCase();
  if (forced === 'anthropic' && process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (forced === 'openrouter' && process.env.OPENROUTER_API_KEY) return 'openrouter';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENROUTER_API_KEY) return 'openrouter';
  return null;
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

  const provider = pickProvider();
  if (!provider) {
    res.status(503).json({ error: 'no_provider' });
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

  const cleaner = makeCleaner();

  try {
    const source = provider === 'anthropic'
      ? streamAnthropic(GROUNDING, context, messages)
      : streamOpenRouter(GROUNDING, context, messages, req);

    for await (const chunk of source) {
      const clean = cleaner.push(chunk);
      if (clean) write({ t: clean });
    }
    const tail = cleaner.flush();
    if (tail) write({ t: tail });

    if (!written) write({ t: "Je n'ai pas de réponse utile à vous donner sur ce point. Michael y répondra mieux que moi : contact@studioinitiative.com." });
    write({ done: true });
  } catch (err) {
    console.error('[chat]', provider, err?.message || err);
    if (!written) write({ error: 'upstream' });
    write({ done: true });
  } finally {
    res.end();
  }
}
