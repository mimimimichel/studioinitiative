# Livrer les agents chez le client

> La phrase qui ferme le S5 — *« mes agents tournent dans votre environnement,
> rien ne sort de chez vous »* — n'est vraie que si vous savez répondre à la
> question qui suit : **« concrètement, comment ? »** Cette note est la réponse.

## Le principe, à énoncer tel quel en rendez-vous

**Ce que vous livrez n'est pas un système qui tourne. C'est un actif portable :
des instructions, des trames, des workflows.** Le moteur — le modèle, la
machine, les identifiants — est celui du client. C'est ce qui rend l'argument
vrai, et c'est aussi ce qui protège votre propriété intellectuelle : vous
apportez le savoir-faire, vous n'installez pas une boîte noire dont ils
dépendraient.

Dit autrement à un DSI : *« je n'introduis aucun fournisseur nouveau dans votre
chaîne. Vos données restent dans votre périmètre, sous vos droits, avec vos
logs. Ce que j'apporte, c'est ce que les agents savent faire. »*

---

## Les quatre voies, de la plus naturelle à la plus lourde

### 1. AIP sur Foundry — quand le client est déjà chez Palantir

C'est votre terrain, et vous le connaissez mieux que quiconque : l'agent vit
dans la plateforme, sur l'ontologie, sous les permissions existantes. Rien à
négocier côté sécurité, puisque rien ne sort.

**C'est la voie qui rend votre positionnement cohérent** : vous ne vendez pas
« de l'IA en plus », vous vendez de l'automatisation dans la plateforme qu'ils
ont déjà payée et déjà auditée. Sur un compte Foundry, c'est la réponse, et
c'est la plus courte.

### 2. Le point d'accès du client — la voie la plus fréquente hors Foundry

La plupart des grands comptes industriels français ont déjà un accès modèle
sous contrat : Azure OpenAI dans leur abonnement, **Mistral** (argument de
souveraineté qui compte en aéronautique et en défense), ou Bedrock.

Le montage : **votre code et vos instructions, leur point d'accès, leur
tenancy.** La donnée ne quitte pas leur périmètre contractuel. C'est le schéma
d'entreprise standard — les équipes sécurité le connaissent, ce qui raccourcit
beaucoup la discussion.

Les trois questions à poser tôt : *quel point d'accès avez-vous déjà sous
contrat ? quelle est la politique de rétention configurée ? qui détient les
logs ?* Un client incapable de répondre vous dit quelque chose sur sa maturité
— et c'est du matériau pour le diagnostic.

### 3. Un poste ou une machine fournis par le client

Les agents sont des **fichiers** — c'est tout l'intérêt de la forme qu'ils ont
ici. Le dossier `.claude/skills/` se dépose sur un poste que le client fournit,
avec ses identifiants à lui. Vous travaillez dedans, rien ne transite par vos
machines, et à la fin de la mission le poste reste chez eux avec le dossier de
transfert.

C'est souvent la voie la plus rapide à obtenir : elle ne demande aucun projet
d'architecture, juste un poste et un compte.

### 4. Auto-hébergé, hors ligne — pour les contraintes de défense

Un modèle à poids ouverts hébergé sur leur infrastructure. C'est lourd, lent à
monter, et à ne proposer que si les contraintes l'imposent réellement. À garder
en réserve : le sortir trop tôt fait peur au lieu de rassurer.

---

## Comment choisir, en une question

| Ce que le client a déjà | La voie |
|---|---|
| Foundry | **1 — AIP.** Pas de débat. |
| Azure OpenAI, Mistral ou Bedrock sous contrat | **2 — leur point d'accès.** |
| Ni l'un ni l'autre, mais une DSI coopérative | **3 — un poste fourni.** |
| Classifié, hors ligne | **4 — auto-hébergé.** |

Posez la question dès le premier rendez-vous — elle est déjà dans la trame de
découverte, section *Le terrain*. Vous saurez avant de proposer, et ça vous
évite de vendre un montage qu'ils refuseront.

---

## À verrouiller avant la première ligne de code

- **Accord écrit** avant tout usage d'un outil IA externe sur du contenu de
  mission. C'est votre règle, elle est dans le playbook — et c'est aussi ce qui
  vous protège si le sujet remonte au juridique en cours de route.
- **Propriété intellectuelle** : vos instructions d'agent ne tombent **jamais**
  dans la PI du client. Le livrable est ce que l'agent produit — pas l'agent.
  C'est le point le plus critique de vos contrats : sans lui, vous vendez
  Theseus une fois au lieu de le vendre huit.
- **Rétention et journalisation** : qui garde quoi, combien de temps, qui peut
  le lire.
- **Réversibilité** : ce que le client garde et sait opérer quand vous partez.
  C'est aussi le critère de succès du S4 — l'équipe opère sans vous trente
  jours après la fin.

---

## Ce qui reste chez vous, quoi qu'il arrive

Les six agents de mission sont un actif, pas une prestation. **Leurs
instructions vivent dans ce dépôt** — c'est votre sauvegarde, votre historique
de versions, et ce que vous emportez au client suivant.

Deux d'entre eux ne touchent d'ailleurs presque pas à la donnée client et
peuvent tourner chez vous sans réserve :

- le **Pilote** — jours vendus contre jours consommés, dérive de périmètre,
  alerte J-45. Ce sont vos chiffres de gestion, pas les leurs.
- le **Capitalisateur** — case study anonymisée en fin de mission. L'anonymat
  est dans sa définition même.

Les quatre autres — Cadreur, Documentaliste, Rapporteur, Testeur — travaillent
dans le contenu du client. Leurs instructions restent ici ; leur exécution part
là-bas, par l'une des quatre voies ci-dessus.
