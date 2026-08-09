/* ===== Studio Initiative — socle commun de la plateforme privée =====
 *
 * Tout ce qui est partagé par les fonctions /api/studio/* :
 *   - la porte d'entrée (mot de passe unique, variable STUDIO_PASSWORD) ;
 *   - le client de l'API Notion (variable NOTION_API_KEY) ;
 *   - les identifiants des bases du Notion de Michael ;
 *   - un appel LLM non-streamé qui réutilise la chaîne de fournisseurs du chat.
 *
 * Principe de la plateforme : Notion garde la mémoire, ces fonctions sont les
 * mains. Aucune donnée n'est stockée ailleurs que dans Notion.
 */

/* ------------------------------------------------------------------ */
/* Porte d'entrée                                                      */
/* ------------------------------------------------------------------ */

/* Comparaison en temps constant — inutilement luxueux pour un cockpit
   personnel, mais gratuit. */
function sameKey(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* Vérifie l'accès. Écrit la réponse d'erreur et renvoie false si refusé. */
export function requireAuth(req, res) {
  const expected = process.env.STUDIO_PASSWORD;
  if (!expected) {
    res.status(503).json({
      error: 'no_password',
      message: "Le cockpit n'est pas encore activé : ajoutez la variable STUDIO_PASSWORD sur Vercel (Settings → Environment Variables), puis redéployez."
    });
    return false;
  }
  const given = req.headers['x-studio-key'] || '';
  if (!sameKey(given, expected)) {
    res.status(401).json({ error: 'bad_password', message: 'Mot de passe incorrect.' });
    return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/* Client Notion                                                       */
/* ------------------------------------------------------------------ */

/* Les identifiants des bases de l'espace de Michael. Stables tant que les
   bases ne sont pas recréées ; surchargeables par variable au cas où. */
export const DB = {
  contacts: process.env.NOTION_DB_CONTACTS || '365c135b4a41816c89f3dae967e90f59',
  comptes: process.env.NOTION_DB_COMPTES || '363c135b4a4181ddbd57c9fcb3b26e20',
  kpis: process.env.NOTION_DB_KPIS || '363c135b4a4181acbc55f195024da3e7'
};

const NOTION_BASE = process.env.NOTION_URL || 'https://api.notion.com';

export async function notion(path, method = 'GET', body) {
  const key = process.env.NOTION_API_KEY;
  if (!key) {
    const err = new Error("NOTION_API_KEY absente : créez une intégration sur notion.so/my-integrations, connectez-la à la page « OS Studio Initiative », et posez la clé dans Vercel.");
    err.code = 'no_notion_key';
    throw err;
  }
  const r = await fetch(`${NOTION_BASE}/v1/${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${key}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(data.message || `Notion → ${r.status}`);
    err.code = data.code || `http_${r.status}`;
    // 404 sur une base = l'intégration n'a pas été connectée à la page racine.
    if (r.status === 404) {
      err.message = "Notion répond « introuvable ». Le plus probable : l'intégration n'est pas connectée à la page « 🏠 OS Studio Initiative » (menu ⋯ de la page → Connexions → votre intégration).";
    }
    throw err;
  }
  return data;
}

/* Lit toutes les pages d'une base, pagination comprise. */
export async function queryAll(dbId, filter, sorts) {
  const results = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;
    if (cursor) body.start_cursor = cursor;
    const page = await notion(`databases/${dbId}/query`, 'POST', body);
    results.push(...(page.results || []));
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  return results;
}

/* --- Lecture des propriétés (l'API Notion est verbeuse, on aplatit) --- */

export const P = {
  title: (page, name) => (page.properties?.[name]?.title || []).map((t) => t.plain_text).join('') || '',
  text: (page, name) => (page.properties?.[name]?.rich_text || []).map((t) => t.plain_text).join('') || '',
  select: (page, name) => page.properties?.[name]?.select?.name || '',
  date: (page, name) => page.properties?.[name]?.date?.start || '',
  checkbox: (page, name) => !!page.properties?.[name]?.checkbox,
  url: (page, name) => page.properties?.[name]?.url || ''
};

/* --- Écriture des propriétés --- */

export const W = {
  title: (v) => ({ title: [{ text: { content: String(v).slice(0, 2000) } }] }),
  text: (v) => ({ rich_text: v ? [{ text: { content: String(v).slice(0, 1900) } }] : [] }),
  select: (v) => (v ? { select: { name: v } } : { select: null }),
  date: (v) => (v ? { date: { start: v } } : { date: null }),
  checkbox: (v) => ({ checkbox: !!v })
};

/* Découpe un texte long en blocs paragraphe pour le corps d'une page.
   L'API refuse les rich_text de plus de 2000 caractères. */
export function toBlocks(text) {
  const blocks = [];
  for (const para of String(text).split(/\n{2,}/)) {
    const clean = para.trim();
    if (!clean) continue;
    if (/^#{1,3}\s/.test(clean)) {
      const level = clean.match(/^#+/)[0].length;
      blocks.push({
        object: 'block',
        type: `heading_${level}`,
        [`heading_${level}`]: { rich_text: [{ text: { content: clean.replace(/^#+\s*/, '').slice(0, 1990) } }] }
      });
      continue;
    }
    for (let i = 0; i < clean.length; i += 1900) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ text: { content: clean.slice(i, i + 1900) } }] }
      });
    }
  }
  return blocks.slice(0, 90);
}

/* ------------------------------------------------------------------ */
/* Le temps, vu de Toulouse                                            */
/* ------------------------------------------------------------------ */

export function todayParis() {
  return new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date()); // fr-CA → AAAA-MM-JJ
}

/* ------------------------------------------------------------------ */
/* Appel LLM non-streamé — pour les agents                             */
/* ------------------------------------------------------------------ */

const ANTHROPIC_MODEL = 'claude-opus-5';
const OPENROUTER_MODELS = (process.env.OPENROUTER_MODELS ||
  'google/gemma-4-26b-a4b-it:free,nvidia/nemotron-3-ultra-550b-a55b:free,openai/gpt-oss-20b:free'
).split(',').map((s) => s.trim()).filter(Boolean);

function pickProvider() {
  const forced = (process.env.CHAT_PROVIDER || '').toLowerCase();
  if (forced === 'anthropic' && process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (forced === 'openrouter' && process.env.OPENROUTER_API_KEY) return 'openrouter';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENROUTER_API_KEY) return 'openrouter';
  return null;
}

/* Retire un éventuel raisonnement en clair des modèles ouverts. */
function stripThoughts(s) {
  return String(s).replace(/<(think|thought|reasoning|analysis)>[\s\S]*?<\/\1>/gi, '').trim();
}

/* Un appel, une réponse complète.
 *   opts.webSearch : autorise la recherche web (Claude uniquement — les
 *   modèles gratuits n'y ont pas accès ; l'appelant doit le savoir via
 *   le champ `searched` de la réponse).
 */
export async function llm(system, user, opts = {}) {
  const provider = pickProvider();
  if (!provider) {
    const err = new Error("Aucune clé de modèle : ajoutez OPENROUTER_API_KEY (gratuit) ou ANTHROPIC_API_KEY sur Vercel.");
    err.code = 'no_provider';
    throw err;
  }

  if (provider === 'anthropic') {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();
    const params = {
      model: ANTHROPIC_MODEL,
      max_tokens: opts.maxTokens || 2000,
      output_config: { effort: opts.effort || 'medium' },
      system,
      messages: [{ role: 'user', content: user }]
    };
    if (opts.webSearch) {
      params.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
    }
    const msg = await client.messages.create(params);
    const text = (msg.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    return { text: text.trim(), provider: 'anthropic', searched: !!opts.webSearch };
  }

  /* OpenRouter — chaîne de repli sur les modèles gratuits saturés. */
  const orBase = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1';
  let lastErr = 'aucun modèle disponible';
  for (const model of OPENROUTER_MODELS) {
    let res;
    try {
      res = await fetch(`${orBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Title': 'Studio Initiative'
        },
        body: JSON.stringify({
          model,
          max_tokens: opts.maxTokens || 2000,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
        })
      });
    } catch (e) { lastErr = e.message; continue; }
    if (!res.ok) { lastErr = `${model} → ${res.status}`; continue; }
    const data = await res.json().catch(() => ({}));
    const text = stripThoughts(data?.choices?.[0]?.message?.content || '');
    if (text) return { text, provider: model, searched: false };
    lastErr = `${model} → réponse vide`;
  }
  const err = new Error(lastErr);
  err.code = 'llm_failed';
  throw err;
}

/* Récupère un objet JSON dans une réponse de modèle, même enrobée. */
export function parseJson(text) {
  const raw = String(text).replace(/```json|```/g, '').trim();
  try { return JSON.parse(raw); } catch { /* on cherche le premier objet */ }
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch { /* tant pis */ }
  }
  return null;
}
