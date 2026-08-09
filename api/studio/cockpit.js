/* ===== M1 — Le cockpit du jour =====
 *
 * Une seule lecture, tout ce qu'il faut savoir le matin :
 *   - les relances J+7 arrivées à échéance ;
 *   - les actions du jour (et celles en retard) ;
 *   - les fiches mortes — engagées mais sans prochaine action datée ;
 *   - l'entonnoir réel contre les objectifs du playbook ;
 *   - les comptes cibles dont la colonne Signaux data/IA est vide.
 *
 * Les KPI ne sont plus saisis : ils sont calculés ici, à chaque affichage,
 * depuis l'état réel du CRM.
 */

import { requireAuth, notion, queryAll, DB, P, todayParis } from '../_lib/studio.js';

/* L'entonnoir annuel du playbook (Machine à leads) : en remontant depuis
   4 missions signées. */
const OBJECTIFS = [
  { statutMin: 1, label: 'Prises de contact', but: 150 },
  { statutMin: 2, label: 'Conversations tenues', but: 60 },
  { statutMin: 3, label: 'RDV qualifiés', but: 30 },
  { statutMin: 4, label: 'Propositions envoyées', but: 10 },
  { statutMin: 5, label: 'Missions signées', but: 4 }
];

const FERMES = new Set(['5 · Mission signée', '✖ Perdu', '⚪ Hors cible']);

function rangStatut(s) {
  const m = /^(\d)/.exec(s || '');
  return m ? Number(m[1]) : -1; // -1 = pas de statut du tout
}

function ficheLight(c) {
  return {
    id: c.id,
    url: c.url,
    nom: P.title(c, 'Nom'),
    entreprise: P.text(c, 'Entreprise'),
    role: P.text(c, 'Rôle'),
    statut: P.select(c, 'Statut'),
    persona: P.select(c, 'Persona'),
    priorite: P.select(c, 'Priorité'),
    action: P.text(c, 'Prochaine action'),
    dateAction: P.date(c, 'Date prochaine action'),
    relance: P.date(c, 'Relance J+7'),
    verbatim: P.text(c, 'Douleur / verbatim')
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!requireAuth(req, res)) return;

  try {
    const [contacts, comptes] = await Promise.all([
      queryAll(DB.contacts),
      queryAll(DB.comptes)
    ]);
    const today = todayParis();

    const fiches = contacts.map(ficheLight);

    /* Relances J+7 échues — sur des fiches encore ouvertes. */
    const relances = fiches
      .filter((f) => f.relance && f.relance.slice(0, 10) <= today && !FERMES.has(f.statut))
      .sort((a, b) => a.relance.localeCompare(b.relance));

    /* Actions du jour : datées d'aujourd'hui ou en retard. */
    const jour = fiches
      .filter((f) => f.dateAction && f.dateAction.slice(0, 10) <= today && !FERMES.has(f.statut))
      .map((f) => ({ ...f, enRetard: f.dateAction.slice(0, 10) < today }))
      .sort((a, b) => a.dateAction.localeCompare(b.dateAction));

    /* Fiches mortes : pas fermées, pas de prochaine action datée.
       C'est la discipline n°1 du playbook, rendue visible. */
    const mortes = fiches
      .filter((f) => !FERMES.has(f.statut) && !f.dateAction)
      .sort((a, b) => (rangStatut(b.statut) - rangStatut(a.statut)) ||
                      (a.priorite || '').localeCompare(b.priorite || ''));

    /* Entonnoir cumulé — un contact compte pour chaque étape atteinte. */
    const entonnoir = OBJECTIFS.map((o) => ({
      label: o.label,
      but: o.but,
      atteint: fiches.filter((f) => rangStatut(f.statut) >= o.statutMin).length
    }));

    const introductions = fiches.filter((f) => P.checkbox(
      contacts.find((c) => c.id === f.id), 'Introduction obtenue')).length;

    /* Comptes cibles sans le travail de l'Éclaireur. */
    const comptesLight = comptes.map((c) => ({
      id: c.id,
      url: c.url,
      nom: P.title(c, 'Nom'),
      secteur: P.select(c, 'Secteur'),
      cercle: P.select(c, 'Cercle ICP'),
      statut: P.select(c, 'Statut'),
      signaux: P.text(c, 'Signaux data / IA'),
      site: P.url(c, 'Site web'),
      notes: P.text(c, 'Notes')
    }));
    const sansSignaux = comptesLight.filter((c) => !c.signaux.trim());

    res.status(200).json({
      today,
      relances,
      jour,
      mortes,
      contacts: fiches,
      entonnoir,
      introductions,
      totalContacts: fiches.length,
      comptes: comptesLight,
      sansSignaux: sansSignaux.length,
      sante: {
        fichesSansDate: mortes.length,
        message: mortes.length === 0
          ? 'Aucune fiche morte. La discipline n°1 est tenue.'
          : `${mortes.length} fiche${mortes.length > 1 ? 's' : ''} sans prochaine action datée — le playbook les appelle des fiches mortes.`
      }
    });
  } catch (err) {
    console.error('[cockpit]', err.code || '', err.message);
    res.status(502).json({ error: err.code || 'notion_failed', message: err.message });
  }
}
