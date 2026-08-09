# Mise en ligne — le parcours sans terminal

Aucune ligne de commande dans ce document. Uniquement des clics.
Comptez vingt minutes la première fois, puis deux minutes par prospect.

---

## Étape 0 — Fusionner la branche

Le travail est sur la branche `claude/nfc-marketing-chatbot-6pob56`. Tant qu'elle
n'est pas fusionnée dans `main`, elle n'existe pas pour le site.

Sur GitHub → onglet **Pull requests** → **New pull request** → base `main`,
compare `claude/nfc-marketing-chatbot-6pob56` → **Create** → **Merge**.

---

## Étape 1 — Mettre le site en ligne (une seule fois)

1. Allez sur **vercel.com**, créez un compte avec votre compte GitHub.
2. **Add New → Project**.
3. Dans la liste, choisissez **studioinitiative** → **Import**.
4. Ne touchez à rien. Framework : *Other*. → **Deploy**.

Une minute plus tard, une adresse en `.vercel.app` s'affiche. Le site est en ligne.
Testez tout de suite : ajoutez `/k/A7F2` à la fin de cette adresse — vous devez
voir la démonstration avec Marc Delaunay.

> **À ce stade, tout fonctionne sauf le chat**, qui affiche une invitation à vous
> écrire directement. C'est volontaire : la page ne montre jamais d'erreur technique.

---

## Étape 2 — Allumer l'agent conversationnel

Deux voies. Vous pouvez commencer par la gratuite et basculer plus tard sans
retoucher une ligne de code : c'est la présence de la variable qui décide.

### Voie A — gratuite, pour tester (OpenRouter)

1. **openrouter.ai** → créez un compte → **Keys** → **Create Key**.
2. Vercel → votre projet → **Settings** → **Environment Variables**.
3. Nom : `OPENROUTER_API_KEY`. Valeur : votre clé. → **Save**.
4. **Deployments** → menu `···` du déploiement du haut → **Redeploy**.

Trois modèles gratuits sont essayés dans l'ordre ; si le premier est saturé
— ça arrive souvent sur le gratuit — le suivant prend le relais automatiquement.

Pour changer l'ordre, ajoutez la variable `OPENROUTER_MODELS` avec la liste
séparée par des virgules. Par défaut :

```
google/gemma-4-26b-a4b-it:free,nvidia/nemotron-3-ultra-550b-a55b:free,openai/gpt-oss-20b:free
```

Gemma est en tête parce qu'il livre son premier mot en 0,8 s de façon stable.
Nemotron Ultra répond mieux sur le fond, mais met entre 3,5 et 7,6 s selon la
charge — mettez-le en tête si vous préférez la finesse à la vivacité.

### Voie B — payante, pour de vrai (Claude)

1. **console.anthropic.com** → **API Keys** → **Create Key**. La clé commence par
   `sk-ant-` et ne s'affiche qu'une fois.
2. Même chemin sur Vercel, nom : `ANTHROPIC_API_KEY`. → **Save** → **Redeploy**.

Dès que cette variable existe, elle prend le pas sur OpenRouter. Pour rester sur
le gratuit alors que les deux clés sont présentes, ajoutez `CHAT_PROVIDER` =
`openrouter`.

> **Ne mettez jamais une clé dans un fichier du dépôt** — sur GitHub elle serait
> publique en quelques secondes. Sa place est dans les variables d'environnement,
> et nulle part ailleurs. Si une clé a traîné ailleurs (un mail, une conversation,
> une capture d'écran), révoquez-la et regénérez-en une.

**Ce que ça coûte :** Vercel est gratuit à ce volume. OpenRouter en modèles
`:free` ne coûte rien mais n'offre aucune garantie de disponibilité. Côté
Anthropic vous payez à l'usage — quelques centimes par conversation ; mettez un
plafond mensuel dans **Billing → Limits** et le sujet est clos.

**Sans aucune clé**, la page fonctionne toujours : le chat invite à vous écrire
directement. Elle ne montre jamais d'erreur technique à un prospect.

---

## Étape 2 bis — Allumer la plateforme (le cockpit et les agents)

La plateforme lit et écrit **votre Notion** : le CRM, les comptes cibles.
Rien n'est stocké ailleurs, rien n'est saisi deux fois. Deux variables à ajouter,
toujours au même endroit (Vercel → Settings → Environment Variables) :

1. **`STUDIO_PASSWORD`** — le mot de passe de votre espace privé. Choisissez-le
   long ; c'est la seule serrure du cockpit.
2. **`NOTION_API_KEY`** — la clé qui relie le site à votre Notion :
   - allez sur **notion.so/my-integrations** → **New integration** ;
   - nom « Studio Initiative », votre espace de travail, capacités lecture + écriture ;
   - copiez la **clé secrète** (elle commence par `ntn_`) dans la variable ;
   - dernier geste, dans Notion : ouvrez la page **🏠 OS Studio Initiative** →
     menu **⋯** en haut à droite → **Connexions** → ajoutez votre intégration.
     Ce geste donne accès à toutes les sous-pages d'un coup.

**Redeploy**, puis ouvrez `votre-site.com/studio/` :

- **Le cockpit** — la réponse à « qu'est-ce que je fais ce matin ? » : relances
  échues, actions du jour, fiches mortes à dater en deux clics, entonnoir contre
  les objectifs. Les KPI ne se saisissent plus : ils se calculent.
- **La console d'agents** (`/studio/agents.html`) — l'Éclaireur remplit la colonne
  Signaux de vos comptes cibles, la Plume pose deux variantes de message dans la
  fiche, le Débriefeur transforme vos notes en fiche que vous validez, la Vigie
  prépare le digest du lundi. **Aucun agent n'envoie jamais rien** : ils écrivent
  dans Notion, vous relisez, vous envoyez.
- **Le diagnostic de maturité** (`/atelier/maturite.html`) — 20 questions, radar,
  lecture par axe. En rendez-vous, remplissez-le avec le prospect : c'est la porte
  d'entrée naturelle du Diagnostic Scale-Up. Le mode cabinet l'enregistre dans le CRM.

> Avec la clé gratuite OpenRouter, l'Éclaireur et la Vigie travaillent **sans
> recherche web** et l'écrivent noir sur blanc dans leur réponse. La clé Anthropic
> leur donne accès au web — c'est le moment où elle vaut vraiment son prix.

---

## Étape 3 — Brancher votre domaine (facultatif)

Vercel → **Settings** → **Domains** → saisissez `studioinitiative.com` → Vercel
affiche les deux lignes DNS à recopier chez votre registrar. Vos adresses
deviennent `studioinitiative.com/k/A7F2` — nettement plus crédible sur un objet
qu'on tend en main.

---

## Étape 4 — Le rendez-vous, puis le dossier

Deux outils qui s'enchaînent. Mettez les deux en favori.

### Pendant l'entretien — `votre-site.com/atelier/decouverte.html`

L'outil a deux visages, un onglet en haut à droite pour passer de l'un à l'autre.

**Mode Entretien** — le poste de travail pendant le rendez-vous.

Avant toute écoute, une porte : vous confirmez avoir prévenu la ou les personnes
présentes. Ce n'est pas décoratif. En France, transcrire une conversation
professionnelle suppose leur accord, et vous vendez de la gouvernance des données —
c'est le premier endroit où elle se prouve. Une phrase suffit : *« Je prends mes
notes avec un outil qui transcrit pour ne rien perdre. Ça vous va ? »*

Où va le son, dit noir sur blanc dans l'outil : la reconnaissance vocale du
navigateur envoie l'audio aux serveurs de son moteur (Google pour Chrome) le temps
de la transcription. **Le texte, lui, ne quitte jamais l'appareil** — aucun serveur
de votre côté ne le reçoit.

L'écran se lit en trois colonnes :

- **La trame** — sept temps d'entretien, chacun avec ses questions prêtes à poser
  et un bloc de notes. Ce que vous tapez là atterrit directement dans la bonne
  section de la fiche.
- **Ce qui se dit** — la transcription en direct. Sélectionnez une phrase et
  capturez-la : elle rejoint « Ses mots », au mot près. Sans lâcher la conversation
  des yeux, **Ctrl + Entrée** garde la dernière phrase entendue.
- **Où vous en êtes** — les sujets déjà effleurés se cochent en vert, et l'outil
  affiche la première question qu'il vous reste à poser, avec un bouton pour y
  aller. Il repère aussi les phrases marquantes et **tous les chiffres prononcés** :
  un clic les place dans les frictions.

Un point d'honnêteté que l'outil affiche lui-même : le suivi repère des **mots**,
pas des idées. Un point vert dit que le sujet a été effleuré — c'est vous qui jugez
s'il a été traité.

Sans Chrome, la transcription n'est pas disponible : la trame, les notes et la
fiche fonctionnent quand même, l'outil vous le dit et vous laisse continuer.

**En visio**, votre micro ne capte que vous. Deux réponses, toutes deux gratuites :

- *Après l'appel* — activez la transcription native de Meet ou de Zoom, puis
  **« Coller une transcription »** dans l'outil. Horodatages, noms de locuteurs et
  numéros de sous-titres sont nettoyés automatiquement ; l'analyse est identique à
  une écoute en direct. C'est la voie sans installation.
- *Pendant l'appel*, si vous voulez l'aiguillage en temps réel — un câble audio
  virtuel (*BlackHole* sur macOS, *VoiceMeeter* sur Windows, tous deux gratuits)
  fait passer le son de la visio pour un micro. L'outil entend alors les deux voix
  sans modification. Un quart d'heure d'installation, une seule fois. Attention à
  l'annulation d'écho de Chrome : faites tourner la visio dans un navigateur et
  l'outil dans l'autre, et testez à vide avant un vrai rendez-vous.

Aucun abonnement de transcription n'est nécessaire dans un cas comme dans l'autre.

**Mode Fiche** — juste après, dans la voiture.

Tout ce que vous avez capté est déjà là. Complétez, surtout la section 09
« Votre lecture » : elle nourrit l'agent conversationnel et ne s'affiche jamais
à l'écran du prospect.

Le panneau de droite note le rendez-vous sur cinq axes et vous dit **si l'objet
vaut le coup** : un porte-clés sur mesure vous coûte du temps, autant le réserver
aux dossiers où il fera une différence. En dessous de 5/10, une relance simple
suffit.

### À la fin de la fiche — **« Enregistrer dans le CRM »**

Le bouton envoie la fiche directement dans votre base 📇 Contacts : identité,
verbatim le plus fort, statut, et le compte rendu complet en corps de page.
Une condition, appliquée mécaniquement : **la prochaine étape et sa date**
(section 09) doivent être remplies — une fiche sans date est une fiche morte,
l'outil refuse de l'écrire.

### Puis — **« Préparer le porte-clés »**

Le bouton ouvre le générateur **déjà rempli** avec vos notes : identité, date,
verbatims, constats chiffrés, et le brief complet de l'agent rédigé à partir de
vos réponses. Rien n'est inventé — les champs qui demandent une décision
éditoriale restent vides exprès :

- le **titre court** de chaque constat chiffré ;
- le **travail des agents**, qui doit décrire ce que vous avez réellement produit
  depuis le rendez-vous. N'annoncez jamais un livrable que vous n'avez pas fait.

Ensuite :

1. **« Voir le résultat »** ouvre la page exactement telle qu'il la verra.
   Corrigez, regardez à nouveau, autant de fois que nécessaire. Rien n'est publié.
2. Quand c'est bon : **« Télécharger »**.
3. Sur GitHub → dossier `k/data` → **Add file → Upload files** → glissez le
   fichier → **Commit changes**.

Une minute plus tard, l'adresse est vivante.

> Le formulaire tire un identifiant au hasard (`K7QM`, `P3XR`…) dans un alphabet
> sans caractères ambigus. Ne le remplacez pas par un numéro qui se suit : un
> identifiant séquentiel laisse deviner les dossiers des autres.

---

## Étape 5 — Graver la puce

Sur votre téléphone Android, installez **NFC Tools** (gratuit).

1. Onglet **Écrire** → **Ajouter un enregistrement** → **URL / URI**.
2. Collez l'adresse copiée depuis le générateur.
3. **Écrire / Write** → approchez le porte-clés.
4. Vérifiez : verrouillez l'écran, rapprochez à nouveau, la page doit s'ouvrir seule.

Puis **verrouillez la puce** : onglet **Autres** → **Rendre en lecture seule**.
C'est définitif — faites-le seulement après avoir vérifié que le scan fonctionne.
Sans ce verrou, n'importe qui peut réécrire la destination d'un porte-clés qui
circule sous votre marque.

Comme vous imprimez les coques vous-même, prévoyez un logement qui laisse la puce
à moins de 2 mm de la surface, et gardez le PETG/PLA autour d'elle : c'est
transparent au NFC. Une seule règle : **pas d'insert métallique en face de la
puce**, sinon elle ne répond plus.

---

## Ce qu'il faut retenir

| Question | Réponse |
|---|---|
| Un tag pas encore rattaché ? | Affiche la page de découverte du cabinet. Jamais d'erreur. |
| Un prospect demande la suppression ? | Supprimez `k/data/<ID>.json` sur GitHub. Le tag retombe sur la découverte. |
| Le chat tombe en panne ? | La page affiche « écrivez-nous », le reste continue de fonctionner. |
| Je veux changer un texte du dossier ? | Regénérez le fichier et réuploadez-le. L'adresse et la puce ne bougent pas. |
| Je veux changer la destination d'un tag déjà gravé ? | Impossible si vous l'avez verrouillé — mais inutile : c'est le contenu du fichier qui change, pas l'adresse. |

Le détail éditorial (que mettre dans chaque champ, ce qu'il ne faut jamais
inventer) est dans `k/README.md`.
