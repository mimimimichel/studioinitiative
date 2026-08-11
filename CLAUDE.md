# Studio Initiative

Cabinet de conseil en data et intelligence artificielle, Toulouse. Fondé par
Michael Lozano — quinze ans dans la data industrielle. Des consultants seniors
épaulés par des agents IA développés par le cabinet ; spécialisation Palantir
Foundry.

Ce dépôt contient **le site public et la plateforme interne**. Le pilotage de
l'activité (CRM, comptes cibles, playbook, finances) vit dans Notion — le code
d'ici le lit et l'écrit, il ne le remplace pas.

## Les trois preuves

À citer quand elles servent, jamais en liste générique :

- 80+ data products livrés sur Airbus Skywise ;
- CSAT 4,8/5 et disponibilité > 98 % en production ;
- l'un des ~50 profils seniors Palantir Foundry en France.

## Ce que contient le dépôt

| Chemin | Rôle |
|---|---|
| `index.html`, `assets/` | Le site vitrine |
| `k/` | La page de scan du porte-clés NFC + le générateur de dossier |
| `k/data/<TAG>.json` | Un dossier prospect par porte-clés — lu **côté serveur uniquement** |
| `atelier/decouverte.html` | Le copilote d'entretien de découverte |
| `atelier/maturite.html` | Le diagnostic de maturité data & IA |
| `studio/` | Le cockpit et la console d'agents (espace privé) |
| `api/` | Fonctions serverless Vercel |
| `api/_lib/studio.js` | Socle commun : accès Notion, conversion Markdown → blocs, appel LLM |
| `DEMARRAGE.md` | Le guide de mise en ligne, sans terminal |
| `LIVRAISON-AGENTS.md` | Comment les agents sont livrés chez un client |
| `.claude/skills/` | Les agents exécutables en session Claude Code |
| `.claude/carnets/` | La mémoire durable de chaque agent |

## Les bases Notion

| Base | Identifiant |
|---|---|
| 📇 Contacts — CRM | `365c135b4a41816c89f3dae967e90f59` |
| 🎯 Comptes cibles | `363c135b4a4181ddbd57c9fcb3b26e20` |
| 📈 KPIs | `363c135b4a4181acbc55f195024da3e7` |

Page racine : **🏠 OS Studio Initiative** — tout le playbook en descend.

## Règles qui ne se négocient pas

1. **Aucune clé dans le dépôt.** Ni Notion, ni Anthropic, ni OpenRouter. Leur
   place est dans les variables d'environnement Vercel, nulle part ailleurs.
   Vérifier avant chaque commit.
2. **Aucun envoi automatique.** Les agents rédigent et déposent dans Notion.
   C'est Michael qui relit et qui envoie. Toujours.
3. **Aucune donnée client confidentielle** dans les agents commerciaux :
   données professionnelles publiques uniquement. Pour les agents de mission,
   la distinction porte sur l'exécution, pas sur les fichiers : **leurs
   instructions vivent ici** (c'est l'actif du cabinet, et sa sauvegarde),
   **leur exécution sur du contenu client se fait chez le client**. Voir
   `LIVRAISON-AGENTS.md`.
4. **Aucune fiche CRM sans prochaine action datée.** C'est la discipline n°1 du
   playbook, et le code la fait respecter : l'API refuse d'enregistrer sans.
5. **Ne jamais annoncer un livrable qui n'a pas été produit.** Sur la page du
   porte-clés en particulier : le prospect vérifiera.

## Conventions de code

- **Commentaires et interface en français.** Les commentaires expliquent
  *pourquoi*, pas *quoi*.
- Pas de framework, pas d'étape de build : HTML, CSS et JavaScript lisibles
  directement. Le site doit rester réparable dans cinq ans.
- Les pages dégradent proprement : sans clé d'API, sans micro, sans réseau,
  elles disent ce qui manque et laissent continuer — jamais d'erreur technique
  devant un prospect.
- Tester dans un vrai navigateur avant de pousser (Playwright est configuré,
  binaire dans `/opt/pw-browsers/` côté conteneur). Les tests unitaires ne
  voient pas les chemins d'URL cassés — un vrai navigateur, si.

## Travail courant

Développement sur la branche `claude/nfc-marketing-chatbot-6pob56`, puis
fusion dans `main`. Vercel déploie `main` automatiquement.
