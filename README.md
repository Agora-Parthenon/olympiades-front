# front-olympiades

Front-end de la plateforme **Olympiades**, une application web de jeux de société en ligne en temps réel.

## Stack

React 18 · TypeScript · Vite · **MUI** · Vitest + React Testing Library · ESLint + Prettier

## Démarrage

```bash
npm install
npm run dev        # serveur de dev avec HMR (http://localhost:5173)
```

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement (HMR) |
| `npm run build` | Build de production (`dist/`) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run prettier` / `prettier:fix` | Vérifie / applique le formatage |
| `npm run test` | Tests unitaires (Vitest, un seul passage) |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:coverage` | Tests + rapport de couverture (cible ≥ 80 %) |

## Structure `src/`

```
src/
├── core/                  # briques partagées (config, API, auth, hooks communs…)
│   └── services/
├── theme/                 # olympiades.theme.ts — thème MUI unique
├── router/                # configuration React Router
├── App.tsx                # coquille applicative (ThemeProvider, CssBaseline)
├── vitest.setup.ts        # bootstrap Vitest (matchers jest-dom)
└── features/
    ├── platform/          # features plateforme
    │   ├── home/          # accueil, page 404
    │   ├── catalog/
    │   ├── lobby/
    │   └── admin/
    └── games/             # un dossier isolé par jeu — aucun code partagé entre jeux
        └── uno/
```

Chaque feature suit le même découpage interne : `components/`, `constants/`, `hooks/`,
`pages/`, `services/`, `styles/` — chacun avec son sous-dossier `test/`.

## Conventions

**Nommage** — fichiers en `kebab-case` avec suffixe de rôle :
`home.page.tsx`, `game-card.component.tsx`, `use-lobby.hook.ts`, `catalog.service.ts`.
`App.tsx` et `main.tsx` gardent leur nom d'entrée.

**Tests** — `*.spec.ts(x)` dans le sous-dossier `test/` du dossier testé, jamais colocalisés :
`services/catalog.service.ts` → `services/test/catalog.service.spec.ts`.

**Composants** — `const X: FC<Props> = …` puis `export default`.

**Pas de balises brutes ni de wrappers maison** — l'habillage passe par MUI
(`Typography`, `Stack`, `Box`, `Button`…). Aucune couleur, taille ou rayon codé en dur dans
un composant : tout vient de `src/theme/olympiades.theme.ts` ou de la prop `sx`.

**Toute page appartient à une feature.** Il n'y a pas de dossier `pages/` à la racine de
`src/` : les pages sans rattachement métier évident (accueil, 404) vivent dans
`features/platform/home/pages/`.

### Écarts assumés par rapport au DAT §3.1

| Point | DAT | Ici | Raison |
|---|---|---|---|
| Design | Tailwind CSS + shadcn/ui | MUI + thème central | Bibliothèque de composants déjà maîtrisée par l'équipe : acquis réutilisables, pas de montée en compétence à prévoir |
| Arborescence | `features/{catalog,lobby,admin}` et `games/` à la racine de `src/` | `features/platform/*` et `features/games/*` | Regroupe les deux familles de features sous un seul parent ; l'isolation entre jeux est identique |
| Pages | `pages/` à la racine de `src/` | `pages/` interne à chaque feature | Découpage par fonctionnalité cohérent de bout en bout ; un `pages/` racine ferait doublon avec ceux des features |

## Configuration runtime (URL de la gateway)

L'URL de la gateway n'est **pas figée dans le bundle** : elle est lue à l'exécution depuis
`window.__OLYMPIADES_CONFIG__` (fichier `public/config.js`).

- **En dev** : `public/config.js` pointe sur `http://localhost:8080`.
- **En Docker** : l'entrypoint génère `config.js` depuis `config.js.template` avec la
  variable d'environnement `GATEWAY_URL` (envsubst), sans rebuild de l'image.

```bash
docker build -t olympiades-front .
docker run -p 3000:80 -e GATEWAY_URL=http://localhost:8080 olympiades-front
```

En pratique, le front est démarré avec le reste de la stack via `make up` dans `olympiades-infra`.
