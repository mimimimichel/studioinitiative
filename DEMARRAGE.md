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

## Étape 3 — Brancher votre domaine (facultatif)

Vercel → **Settings** → **Domains** → saisissez `studioinitiative.com` → Vercel
affiche les deux lignes DNS à recopier chez votre registrar. Vos adresses
deviennent `studioinitiative.com/k/A7F2` — nettement plus crédible sur un objet
qu'on tend en main.

---

## Étape 4 — Créer un dossier prospect (deux minutes, après chaque rendez-vous)

1. Ouvrez **`votre-site.com/k/nouveau.html`**. Mettez-la en favori.
2. Remplissez le formulaire pendant que le rendez-vous est frais.
3. **« Voir le résultat »** ouvre la page exactement telle qu'il la verra.
   Corrigez, regardez à nouveau, autant de fois que nécessaire. Rien n'est publié.
4. Quand c'est bon : **« Télécharger »**.
5. Sur GitHub → dossier `k/data` → **Add file → Upload files** → glissez le
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
