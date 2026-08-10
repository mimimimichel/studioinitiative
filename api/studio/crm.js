/* ===== M2 — l'entretien écrit lui-même dans le CRM =====
 *
 * Reçoit la fiche de l'outil d'entretien (ou du Débriefeur) et la pose dans
 * la base 📇 Contacts : mise à jour si le contact existe, création sinon.
 * Le compte rendu complet est ajouté au corps de la page, daté.
 *
 * La discipline n°1 est structurelle : pas de prochaine action datée,
 * pas d'enregistrement.
 */

import { requireAuth, notion, queryAll, DB, P, W, toBlocks, dateLisible } from '../_lib/studio.js';

const STATUTS = new Set([
  '0 · À contacter', '1 · Contact envoyé', '2 · Conversation tenue',
  '3 · RDV qualifié', '4 · Proposition envoyée', '5 · Mission signée',
  '✖ Perdu', '⚪ Hors cible'
]);
const PERSONAS = new Set([
  'CDO / Head of Data', 'Directeur de programme data', 'DSI',
  'Direction métier', 'ESN / Business manager', 'Autre'
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!requireAuth(req, res)) return;

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const nom = String(body.nom || '').trim();
  const entreprise = String(body.entreprise || '').trim();
  const action = String(body.action || '').trim();
  const dateAction = String(body.dateAction || '').trim();

  if (!nom) {
    res.status(400).json({ error: 'no_nom', message: 'Il faut au minimum le nom du contact.' });
    return;
  }
  if (!action) {
    res.status(400).json({ error: 'no_action', message: 'Pas de prochaine action, pas de fiche : c’est la règle n°1 du playbook.' });
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateAction)) {
    res.status(400).json({ error: 'no_date', message: 'Datez la prochaine action — une fiche sans date est une fiche morte.' });
    return;
  }

  const properties = {
    'Nom': W.title(nom),
    'Prochaine action': W.text(action),
    'Date prochaine action': W.date(dateAction)
  };
  if (entreprise) properties['Entreprise'] = W.text(entreprise);
  if (body.role) properties['Rôle'] = W.text(String(body.role).trim());
  if (body.verbatim) properties['Douleur / verbatim'] = W.text(String(body.verbatim).trim());
  if (STATUTS.has(body.statut)) properties['Statut'] = W.select(body.statut);
  if (PERSONAS.has(body.persona)) properties['Persona'] = W.select(body.persona);
  if (body.linkedin && /^https?:\/\//.test(body.linkedin)) properties['LinkedIn'] = { url: body.linkedin };

  try {
    /* Le contact existe-t-il déjà ? Recherche par nom, départage par entreprise. */
    const candidats = await queryAll(DB.contacts, {
      property: 'Nom', title: { equals: nom }
    });
    const existant = candidats.find((c) =>
      !entreprise || !P.text(c, 'Entreprise') ||
      P.text(c, 'Entreprise').toLowerCase() === entreprise.toLowerCase()
    );

    let pageId, pageUrl, created;
    if (existant) {
      await notion(`pages/${existant.id}`, 'PATCH', { properties });
      pageId = existant.id; pageUrl = existant.url; created = false;
    } else {
      const page = await notion('pages', 'POST', {
        parent: { database_id: DB.contacts },
        properties
      });
      pageId = page.id; pageUrl = page.url; created = true;
    }

    /* Le compte rendu, en corps de page — l'historique complet reste lisible. */
    if (body.compteRendu && String(body.compteRendu).trim()) {
      const blocs = [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: { rich_text: [{ text: { content: `Compte rendu — ${dateLisible()}` } }] }
        },
        ...toBlocks(String(body.compteRendu))
      ];
      await notion(`blocks/${pageId}/children`, 'PATCH', { children: blocs });
    }

    res.status(200).json({ ok: true, created, url: pageUrl });
  } catch (err) {
    console.error('[crm]', err.code || '', err.message);
    res.status(502).json({ error: err.code || 'notion_failed', message: err.message });
  }
}
