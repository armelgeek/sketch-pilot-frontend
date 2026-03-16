# Reste à faire — Sketch Pilot Frontend

Analyse complète du projet **sketch-pilot-frontend** (Next.js 16 + React 19 + TypeScript).

---

## État global du projet

| Dimension | État |
|-----------|------|
| Pages / routes | ✅ ~90 % complètes (30+ pages) |
| Workflow de génération vidéo (4 étapes) | ✅ Implémenté |
| Panneau d'administration | ✅ Implémenté |
| Abonnements & facturation (Stripe) | ✅ Implémenté |
| Gestion des modèles de personnages | ✅ Implémenté |
| Couverture de tests | ❌ 0 % — aucun test |
| Gestion des erreurs (production-ready) | 🟡 Partielle |
| Documentation projet | 🟡 Partielle |

---

## 🔴 Priorité haute

### 1. Aucune couverture de tests
**Fichiers concernés :** tous les fichiers `src/` et `app/`

Le projet ne contient aucun fichier de test (`*.test.tsx`, `*.spec.ts`). Il n'y a pas de configuration Jest, ni de setup pour React Testing Library, ni de tests E2E (Playwright / Cypress).

**À faire :**
- [ ] Installer et configurer Jest + React Testing Library
- [ ] Écrire des tests unitaires pour tous les hooks personnalisés :
  - `src/hooks/use-video-progress.ts` (SSE, reconnexion, états d'erreur)
  - `src/hooks/use-sign-in.ts` / `use-sign-up.ts`
  - `src/hooks/use-subscription.ts` / `use-subscription-manager.ts`
  - `src/hooks/use-pricing-plans.ts`
  - Hooks admin dans `src/app/admin/hooks/`
  - Hooks character-models dans `src/app/character-models/`
- [ ] Écrire des tests d'intégration pour les services API :
  - `src/services/base-service.ts`
  - `src/services/videos-service.ts`
  - `src/app/admin/api/admin-service.ts`
- [ ] Écrire des tests de composants pour les pages critiques :
  - `app/(dashboard)/generate/page.tsx` (formulaire de génération)
  - `app/(dashboard)/generate/[id]/storyboard/page.tsx`
  - `app/(dashboard)/generate/[id]/audio/page.tsx`
- [ ] Configurer un test E2E (Playwright ou Cypress) couvrant le parcours complet :
  authentification → génération de script → storyboard → audio → vidéo finale

---

### 2. Validation de formulaires absente (Zod installé mais inutilisé)
**Fichiers concernés :** tous les formulaires de l'application

Le package `zod` (v4.3.6) est installé dans les dépendances mais n'est utilisé nulle part dans le code. Les saisies utilisateur ne sont pas validées côté client avant envoi à l'API.

**À faire :**
- [ ] Créer des schémas Zod pour chaque formulaire :
  - Formulaire de connexion / inscription (`app/(auth)/login/` et `register/`)
  - Formulaire de génération de script (`generate/page.tsx`)
  - Formulaires admin (utilisateurs, modèles, prompts, assets)
  - Formulaires de gestion d'abonnement
- [ ] Intégrer les schémas Zod avec `react-hook-form` (ou similaire) pour un retour d'erreur immédiat
- [ ] Remplacer les vérifications manuelles (`if (!field)`) par des schémas déclaratifs

---

## 🟡 Priorité moyenne

### 3. Logique de reconnexion SSE incomplète
**Fichier :** `src/hooks/use-video-progress.ts`

Le suivi de progression en temps réel utilise `EventSource` (Server-Sent Events). La logique de reconnexion automatique est commentée avec la note *"Optional: reconnect logic if not explicitly finished"*.

**À faire :**
- [ ] Implémenter une stratégie de reconnexion avec backoff exponentiel
- [ ] Ajouter un compteur de tentatives et un délai maximum
- [ ] Exposer un état `connectionStatus` ('connecting' | 'open' | 'error' | 'closed') au composant parent
- [ ] Nettoyer proprement l'`EventSource` lors du démontage du composant (vérifier la présence d'un `cleanup` dans le `useEffect`)

---

### 4. Gestion des erreurs API trop générique
**Fichier :** `src/services/base-service.ts` (ligne ~28)

Le client HTTP lève une erreur générique sans distinguer les codes HTTP (401, 403, 404, 429, 500…).

```typescript
// Actuel — trop générique
throw new Error(error.error || `API error: ${res.status}`);
```

**À faire :**
- [ ] Créer des classes d'erreur dédiées : `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `RateLimitError`, `ServerError`
- [ ] Gérer automatiquement le code `401` pour rediriger vers `/login` ou rafraîchir le token
- [ ] Ajouter une logique de retry avec backoff pour les erreurs `5xx` et `429`
- [ ] Propager les codes d'erreur aux composants pour afficher des messages contextuels

---

### 5. `console.log` / `console.error` à remplacer
**Fichiers concernés :** `use-video-progress.ts`, plusieurs pages dashboard

Des appels `console.log()` et `console.error()` sont présents dans du code qui sera exécuté en production.

**À faire :**
- [ ] Intégrer un logger structuré (`pino`, `winston`) ou une solution SaaS (Sentry, Datadog)
- [ ] Remplacer tous les `console.*` par des appels au logger
- [ ] Configurer le niveau de log selon l'environnement (`DEBUG` en dev, `ERROR` en prod)

---

### 6. Détection de personnages non raccordée
**Fichier :** `src/components/organisms/character-casting.tsx` (lignes 97–100)

Le composant affiche "Aucun personnage détecté" et expose un callback `onDetect`, mais la logique qui appelle ce callback depuis le composant parent n'est pas implémentée.

**À faire :**
- [ ] Implémenter l'appel API de détection automatique de personnages dans le script
- [ ] Relier le résultat au callback `onDetect` dans `generate/[id]/script/page.tsx`
- [ ] Gérer l'état de chargement et les erreurs de détection dans l'UI

---

### 7. Validation des fichiers uploadés absente
**Fichiers :** `app/(dashboard)/admin/assets/page.tsx` et formulaires de modèles

Les formulaires d'upload (voix, musique, images de modèles) n'ont aucune validation côté client sur le type MIME ni sur la taille des fichiers.

**À faire :**
- [ ] Ajouter la validation du type MIME (ex. : `audio/mpeg`, `image/png`) avant envoi
- [ ] Limiter la taille maximale des fichiers avec un message d'erreur explicite
- [ ] Afficher une barre de progression pendant l'upload des fichiers lourds

---

### 8. Pas de Error Boundaries React
**Fichiers concernés :** tous les layouts et pages

Aucun `ErrorBoundary` React n'est défini. Une exception non gérée dans un composant fait crasher toute l'application.

**À faire :**
- [ ] Créer un composant `ErrorBoundary` générique (`src/components/error-boundary.tsx`)
- [ ] Envelopper les layouts principaux (`app/(dashboard)/layout.tsx`, `app/(auth)/layout.tsx`)
- [ ] Ajouter des fallbacks visuels adaptés à chaque section critique (workflow, admin, subscription)

---

### 9. État complexe dans `audio/page.tsx` — refactorisation recommandée
**Fichier :** `app/(dashboard)/generate/[id]/audio/page.tsx` (787 lignes, 20+ `useState`)

La page audio gère plus de 20 variables d'état indépendantes avec des dépendances croisées, ce qui augmente le risque de bugs subtils.

**À faire :**
- [ ] Remplacer les `useState` interdépendants par un `useReducer` avec un état centralisé
- [ ] Extraire la logique métier dans un hook dédié `use-audio-editor.ts`
- [ ] Scinder le composant en sous-composants : `NarrationPanel`, `MusicPanel`, `AssemblyPanel`

---

### 10. React Query installé mais inutilisé
**Package :** `@tanstack/react-query` v5.90.21

La librairie est déclarée dans `package.json` mais aucun `useQuery` ni `useMutation` n'est utilisé. Les appels API sont faits manuellement dans des `useEffect`, sans cache ni invalidation.

**À faire :**
- [ ] Migrer les appels de lecture (listes de vidéos, prompts, utilisateurs admin…) vers `useQuery`
- [ ] Migrer les mutations (génération de script, upload…) vers `useMutation`
- [ ] Profiter de l'invalidation automatique du cache et du refetch en arrière-plan
- [ ] Supprimer `@tanstack/react-query` des dépendances si la migration n'est pas planifiée (éviter la confusion)

---

## 🟠 Priorité basse

### 11. README.md générique (template Next.js par défaut)
**Fichier :** `README.md`

Le README actuel est le template par défaut de Next.js et ne décrit pas le projet Sketch Pilot.

**À faire :**
- [ ] Rédiger un README complet :
  - Description du projet et de ses fonctionnalités
  - Prérequis (Node.js, pnpm, variables d'environnement)
  - Instructions d'installation et de démarrage local
  - Architecture du projet (arborescence, patterns utilisés)
  - Lien vers `SUBSCRIPTION_USAGE_GUIDE.md`

---

### 12. Variables d'environnement non documentées
**Fichiers :** `src/lib/auth-client.ts`, `src/services/base-service.ts`

Les variables `NEXT_PUBLIC_API_URL` et `NEXT_PUBLIC_AUTH_URL` sont utilisées dans le code mais ne sont pas listées dans un fichier `.env.example`.

**À faire :**
- [ ] Créer un fichier `.env.example` à la racine du projet listant toutes les variables requises avec des valeurs fictives
- [ ] Documenter chaque variable dans le README

---

### 13. Accessibilité (a11y) non testée
**Fichiers concernés :** tous les composants UI

Bien que Radix UI fournisse une base accessible, certains composants personnalisés (formulaires dynamiques, sliders audio, galeries de scènes) n'ont pas été audités.

**À faire :**
- [ ] Lancer un audit d'accessibilité avec `axe-core` ou Lighthouse
- [ ] Ajouter des attributs `aria-label`, `aria-describedby` aux éléments interactifs sans texte visible
- [ ] Vérifier la navigation clavier dans le workflow de génération en 4 étapes

---

### 14. Pas de support hors-ligne / PWA
**Fichiers concernés :** `next.config.ts`

L'application n'a pas de Service Worker ni de stratégie de cache hors-ligne.

**À faire (si pertinent pour le produit) :**
- [ ] Évaluer si une PWA est souhaitable pour ce type d'application
- [ ] Intégrer `next-pwa` ou `@ducanh2912/next-pwa` si décidé

---

### 15. Types `any` trop permissifs dans les services
**Fichiers :** `src/services/videos-service.ts`, `src/app/admin/api/admin-service.ts`

Certaines interfaces utilisent `[key: string]: any` comme champ de secours, ce qui affaiblit la sûreté de type TypeScript.

**À faire :**
- [ ] Typer précisément `VideoGenerationOptions` et les payloads des réponses API
- [ ] Activer `"noImplicitAny": true` dans `tsconfig.json` si ce n'est pas déjà le cas
- [ ] Remplacer les `any` résiduels par `unknown` + type guards

---

### 16. Zustand installé mais inutilisé
**Package :** `zustand` v5.0.11

La librairie de gestion d'état est listée dans les dépendances mais aucun store Zustand n'est créé.

**À faire :**
- [ ] Créer un store global pour l'état utilisateur / session si nécessaire
- [ ] Ou supprimer `zustand` des dépendances si la décision est de rester avec les hooks React natifs

---

## Récapitulatif des actions par ordre de priorité

| # | Action | Priorité | Effort estimé |
|---|--------|----------|---------------|
| 1 | Mettre en place Jest + écrire les tests unitaires des hooks | 🔴 Haute | L (3–5 jours) |
| 2 | Intégrer Zod pour la validation des formulaires | 🔴 Haute | M (2–3 jours) |
| 3 | Tests E2E (Playwright) sur le parcours principal | 🔴 Haute | L (3–5 jours) |
| 4 | Implémenter la reconnexion SSE avec backoff | 🟡 Moyenne | S (1 jour) |
| 5 | Améliorer la gestion des erreurs API (`base-service.ts`) | 🟡 Moyenne | S (1 jour) |
| 6 | Remplacer `console.*` par un logger structuré | 🟡 Moyenne | S (0,5 jour) |
| 7 | Implémenter la détection de personnages | 🟡 Moyenne | M (1–2 jours) |
| 8 | Validation des fichiers uploadés | 🟡 Moyenne | S (0,5 jour) |
| 9 | Ajouter des Error Boundaries React | 🟡 Moyenne | S (0,5 jour) |
| 10 | Refactoriser `audio/page.tsx` avec `useReducer` | 🟡 Moyenne | M (1–2 jours) |
| 11 | Migrer les appels API vers React Query (ou supprimer) | 🟡 Moyenne | M (2–3 jours) |
| 12 | Rédiger le README du projet | 🟠 Basse | XS (2–3 h) |
| 13 | Créer `.env.example` | 🟠 Basse | XS (30 min) |
| 14 | Audit d'accessibilité | 🟠 Basse | M (1–2 jours) |
| 15 | Typer précisément les interfaces avec `any` | 🟠 Basse | S (1 jour) |
| 16 | Décider du sort de `zustand` (utiliser ou supprimer) | 🟠 Basse | XS (1 h) |

---

*Analyse réalisée le 2026-03-16. Version du projet : Next.js 16.1.6, React 19.2.3.*
