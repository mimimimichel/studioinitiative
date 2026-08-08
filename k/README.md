# Porte-clés NFC — mode opératoire

Le porte-clés est remis **à la fin du rendez-vous**. Quelques jours plus tard, le
prospect le tape par curiosité et tombe sur son propre dossier : son nom, la date
réelle de notre rendez-vous, ses phrases, et le travail que les agents ont produit
depuis. L'effet ne vient pas de la technologie — il vient de la spécificité.

Tout ce qui suit sert cette idée. Un tag mal programmé ou un dossier générique
retire l'essentiel.

---

## 1. L'adresse

Un tag = un dossier = un identifiant court.

```
https://studioinitiative.com/k/A7F2
```

**N'écrivez jamais l'URL finale d'un service tiers dans le tag.** Le tag pointe
toujours vers votre domaine ; la destination reste modifiable sans réimprimer
quoi que ce soit. C'est le seul vrai avantage du NFC sur une carte de visite :
l'objet est permanent, le contenu évolue.

Trois formes équivalentes sont acceptées, dans cet ordre de priorité :

| Forme | Exemple | Quand |
|---|---|---|
| Chemin | `/k/A7F2` | À écrire dans le tag (réécriture gérée par `vercel.json`) |
| Paramètre | `/k/?t=A7F2` | Hébergement statique sans réécriture |
| Ancre | `/k/#A7F2` | Repli universel |

Identifiants acceptés : `A-Z`, `a-z`, `0-9`, `-`, `_`, 24 caractères maximum.
Prenez-les **non devinables** (`A7F2`, `K91Q`, `7XQ2`) et non séquentiels — un
identifiant incrémental laisse deviner les dossiers voisins.

Un tag inconnu ne tombe jamais dans le vide : il affiche `data/_demo.json`, la
version découverte du cabinet.

---

## 2. Créer un dossier

Copiez `data/_demo.json` vers `data/<ID>.json` et remplissez-le. Les champs :

| Champ | Rôle |
|---|---|
| `prospect.firstName` | Le prénom seul, en très grand. C'est le premier choc — vérifiez l'orthographe deux fois. |
| `meeting.datetime` | ISO 8601 **avec fuseau**. Le jour de la semaine et le compteur vivant en découlent : ne les écrivez jamais en dur. |
| `meeting.place` | Formulé pour suivre une date : `"à Blagnac"`, `"dans vos locaux"`. |
| `meeting.line` | Remplace toute la phrase de rappel. À n'utiliser que pour un cas particulier. |
| `quotes[]` | 2 à 3 verbatims. Ses mots, pas leur reformulation. Laissez vide (`[]`) si vous n'avez pas pris de notes fidèles — un faux verbatim se repère et ruine tout. |
| `agents[]` | Ce que chaque agent a produit. Une ligne concrète et vérifiable par agent, avec un `meta` chiffré. |
| `findings[]` | Trois constats chiffrés. Assumez l'ordre de grandeur, annoncez-le comme tel. |
| `briefNote` | Le rappel que ces chiffres demandent confirmation. Ne le supprimez pas. |
| `cta.calendarUrl` | Lien de réservation. Absent (`null`) → le bouton disparaît, le mail reste. |
| `chat.opener` | Premier message de l'agent. Doit prouver le contexte dès la première ligne. |
| `chat.suggestions` | 3 questions que *lui* se pose, pas 3 questions qui vous arrangent. |
| `chat.context` | **Lu côté serveur uniquement.** Le brief complet donné à l'agent : ce qu'il a dit, ce qu'il n'a pas dit, votre analyse, votre recommandation. C'est ce qui sépare un agent crédible d'un chatbot. |

Règles de contenu :

- **Rien d'inventé.** Un chiffre faux repéré par un directeur industriel coûte
  plus cher que l'absence de chiffre.
- **Datez ce qui est daté.** « Estimation basse à partir du volume que vous avez
  décrit » vaut mieux qu'un chiffre nu.
- **N'écrivez jamais dans `chat.context` ce que vous ne diriez pas devant lui.**
  L'agent est instruit de ne pas le citer, mais un modèle reste un modèle.

---

## 3. Programmer les tags

**Puces.** NTAG213 (144 o) suffit pour une URL courte. NTAG215/216 si vous voulez
de la marge. Type d'enregistrement NDEF : **URI**.

**Métal = puce spéciale.** Un porte-clés en métal court-circuite l'antenne et le
tag ne répond pas. Il faut soit une puce « on-metal » à blindage ferrite, soit un
boîtier non métallique. À tester sur l'objet fini, pas sur la puce nue.

**Verrouillez.** Une fois l'URL écrite, passez le tag en lecture seule
(*lock* / *write protect* dans NFC Tools ou TagWriter). Sans ça, n'importe qui
peut réécrire la destination du porte-clés qui circule sous votre marque.

**QR code au dos, systématiquement.** NFC désactivé, iPhone antérieur au XS, MDM
d'entreprise restrictif : sans repli, vous perdez le prospect *et* vous créez un
moment gêné. Le QR pointe vers la même URL.

**Testez sur les deux plateformes avant de distribuer.** iPhone (XS et plus
récents, écran allumé et déverrouillé, lecture NDEF en arrière-plan) et Android
(NFC activé dans les réglages).

---

## 4. Déployer

L'agent conversationnel est une fonction serverless : `api/chat.js`.

```bash
npm install
# Vercel → Settings → Environment Variables
ANTHROPIC_API_KEY=sk-ant-...
```

Le contexte du prospect est **relu côté serveur** depuis `k/data/<ID>.json` : le
navigateur ne peut pas réécrire ce que l'agent croit savoir. Modèle utilisé :
`claude-opus-5`, effort `low`, réponse diffusée en flux — sur cette page, la
latence coûte autant qu'une mauvaise réponse.

Sans `ANTHROPIC_API_KEY`, ou sur un hébergement purement statique, la page
fonctionne toujours : le chat affiche une invitation à écrire directement plutôt
qu'une erreur technique.

---

## 5. Ce qu'on ne fait pas

Nous vendons de la gouvernance de données. Une page de scan négligée sur ce plan
détruit plus de crédibilité qu'elle n'en crée. Donc :

- Pas de cookie tiers, pas de pixel, pas de traceur publicitaire, pas d'analytics
  externe.
- Le micro ne s'active que sur appui explicite ; la reconnaissance vocale et la
  synthèse restent dans le navigateur.
- La conversation n'est pas conservée après fermeture de la page.
- La page est en `noindex` et sert `Referrer-Policy: no-referrer`.
- Sur demande, le dossier est supprimé et le lien désactivé sous 72 h — supprimez
  `data/<ID>.json`, le tag retombe alors sur la page de découverte.

Ces engagements sont écrits noir sur blanc dans le dépliant « Comment cette page
fonctionne » en bas de l'écran. Ne les affaiblissez pas sans le modifier.

---

## 6. Avant de tendre un porte-clés

- [ ] Prénom correctement orthographié
- [ ] `meeting.datetime` exact, fuseau compris — le jour affiché doit correspondre
- [ ] Verbatims fidèles, ou tableau vide
- [ ] Chiffres défendables, `briefNote` conservée
- [ ] `chat.context` relu comme s'il allait être lu par l'intéressé
- [ ] Lien d'agenda valide
- [ ] Scan testé sur iPhone **et** Android, depuis l'objet fini
- [ ] Tag verrouillé en lecture seule
- [ ] QR de repli présent au dos
