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

1. Allez sur **console.anthropic.com** → **API Keys** → **Create Key**. Copiez la
   clé (elle commence par `sk-ant-`). Elle ne s'affiche qu'une fois.
2. Retour sur Vercel → votre projet → **Settings** → **Environment Variables**.
3. Nom : `ANTHROPIC_API_KEY`. Valeur : votre clé. → **Save**.
4. Onglet **Deployments** → sur le déploiement du haut, menu `···` → **Redeploy**.

Le chat est vivant. **Ne mettez jamais cette clé dans un fichier du dépôt** —
elle serait publique. Sa place est ici, et nulle part ailleurs.

**Ce que ça coûte :** Vercel est gratuit à ce volume. Côté Anthropic, vous payez
à l'usage — une conversation de prospect coûte quelques centimes. Mettez un
plafond mensuel dans la console (**Billing → Limits**) et vous dormez tranquille.

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
