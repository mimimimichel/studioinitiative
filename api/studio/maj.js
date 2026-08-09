/* ===== M1 — mise à jour d'une fiche depuis le cockpit =====
 *
 * Le triage des fiches mortes : donner une prochaine action datée, changer
 * un statut, solder une relance. La règle du playbook est appliquée ici,
 * structurellement : une action sans date est refusée.
 */

import { requireAuth, notion, W } from '../_lib/studio.js';

const STATUTS = new Set([
  '0 · À contacter', '1 · Contact envoyé', '2 · Conversation tenue',
  '3 · RDV qualifié', '4 · Proposition envoyée', '5 · Mission signée',
  '✖ Perdu', '⚪ Hors cible'
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!requireAuth(req, res)) return;

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { pageId, action, dateAction, statut, solderRelance } = body || {};

  if (!pageId || typeof pageId !== 'string') {
    res.status(400).json({ error: 'no_page', message: 'Fiche introuvable dans la requête.' });
    return;
  }

  const properties = {};

  /* La discipline n°1 : l'action et sa date vont ensemble, toujours. */
  if (action !== undefined || dateAction !== undefined) {
    if (!action || !String(action).trim()) {
      res.status(400).json({ error: 'no_action', message: 'Écrivez la prochaine action — « relancer » ne suffit pas, dites quoi.' });
      return;
    }
    if (!dateAction || !/^\d{4}-\d{2}-\d{2}$/.test(dateAction)) {
      res.status(400).json({ error: 'no_date', message: 'Une action sans date est une fiche morte : choisissez le jour.' });
      return;
    }
    properties['Prochaine action'] = W.text(action);
    properties['Date prochaine action'] = W.date(dateAction);
  }

  if (statut !== undefined) {
    if (!STATUTS.has(statut)) {
      res.status(400).json({ error: 'bad_statut', message: `Statut inconnu : ${statut}` });
      return;
    }
    properties['Statut'] = W.select(statut);
  }

  if (solderRelance) properties['Relance J+7'] = W.date(null);

  if (!Object.keys(properties).length) {
    res.status(400).json({ error: 'nothing', message: 'Rien à mettre à jour.' });
    return;
  }

  try {
    await notion(`pages/${pageId}`, 'PATCH', { properties });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[maj]', err.code || '', err.message);
    res.status(502).json({ error: err.code || 'notion_failed', message: err.message });
  }
}
