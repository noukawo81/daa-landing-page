# Audit initial — Digital Artisans Academy

État relevé le 10 novembre 2026 à partir du dépôt local. Aucun fichier existant n’a été modifié. La branche `refonte` a été créée depuis `main`; `api/generate.js` présentait déjà une modification locale avant l’audit et a été laissée intacte.

## 1. Fichiers et structure

Fichiers présents au début de l’audit :

- `index.html` — site institutionnel, services, packs, témoignages, devis et accès Studio.
- `studio.html` — Studio IA statique.
- `api/generate.js` — fonction serverless Vercel appelée par le Studio.
- `vercel.json` — configuration de la fonction API (`maxDuration: 90`).
- `images/service-video.jpg`
- `images/service-retouche-photo.jpg`
- `images/service-logo.jpg`
- `images/service-catalogue.jpg`
- `images/service-carte.jpg`
- `images/service-agent-ia.jpg`
- `images/réponses-automatiques.jpg`
- `images/logo.png`
- `images/logo-pied de page.png`
- `images/hero-logo.png`
- `images/Fiche Google Maps.jpg`
- `images/boutique-en-ligne.jpg`
- `images/Bannières & Affiches Publicitaires.jpg`

Aucun `README`, fichier `AGENTS.md`, `docs/` ni `logo-DAA.jpeg` n’était présent dans l’inventaire initial. Pourtant, `index.html` référence `logo-DAA.jpeg` comme favicon à la ligne 9 : ressource potentiellement manquante.

### Sections de `index.html` et ancres

| Ancre | Section / rôle | Emplacement |
|---|---|---:|
| `#accueil` | Hero et accroche | ligne 234 |
| `#bourse-vip` | Bourse VIP, partage et accès Masterclass | ligne 326 |
| `#services` | Services à la carte, quatre pôles, dont les services ajoutés dans le pôle Automatisation & IA | ligne 385 |
| `#packs` | Packs Départ, Pro et Empire | ligne 639 |
| `#corporate` | Solutions Corporate & PME sur mesure | ligne 761 |
| `#temoignages` | Note affichée, trois témoignages, lien d’avis Google | ligne 886 |
| `#realisations` | Comparateurs avant/après | ligne 962 |
| `#avantages` | Avantages DAA | ligne 1077 |
| `#faq` | Questions fréquentes | ligne 1110 |
| `#devis` | Formulaire Devis Express vers WhatsApp | ligne 1171 |

Le header contient une navbar desktop et une navbar mobile (lignes 192 et 218); leurs liens utilisent les ancres ci-dessus. La bannière de lancement pointe vers `#bourse-vip`. Le footer n’a pas d’ancre dédiée.

Les accès `studio.html` sont présents dans la navbar desktop à la ligne 198 et dans le CTA du hero à la ligne 269. Le premier est dans la navbar `hidden md:flex`, donc absent sur mobile; la navbar mobile ne comporte pas de lien Studio. Le CTA du hero n’a pas de classe qui le masque sur petit écran.

`studio.html` n’a pas de section dotée d’un `id` d’ancrage : sa zone de création est une section `aria-label="Votre création"` (ligne 87), la palette est un `aside` (ligne 149), et l’argumentaire est une section `aria-label="Argumentaire de vente"` (ligne 203). Le header comporte l’accès retour vers `index.html`.

## 2. Couleurs observées

Les classes de couleur Tailwind non personnalisées (`slate-*`, `white`, `amber-*`, etc.) proviennent de la palette par défaut du CDN Tailwind; leurs valeurs ne sont pas redéfinies dans le code. Les valeurs hexadécimales explicites et les tokens personnalisés relevés sont :

### `index.html`

- Configuration Tailwind, lignes 23, 24, 25, 26 et 27 : `primary` `#059669`, `primarydark` `#047857`, `night` `#0F172A`, `gold` `#D97706`, `mist` `#F8FAFC`.
- CSS, ligne 47 : sélection `#D97706` et blanc `#fff`. CSS du texte dégradé, ligne 73 : `#34d399`, `#059669`, `#047857`. Anneau du widget WhatsApp, ligne 113 : `#059669`.
- Badges de paiement sous les packs, lignes 717, 723, 729 et 734, repris dans le footer lignes 1288, 1289, 1290 et 1291 : `#1BA2DE`, `#FF6600`, `#FFCC00`, `#005CA9`.
- SVG Visa/Mastercard, lignes 742, 746, 747 et 748 : `#1434CB`, `#EB001B`, `#F79E1B`, `#FF5F00`.
- Bloc Corporate, ligne 763 : fond `#090d16`. Icône Google, ligne 955 : `#4285F4`.
- Exemples des classes Tailwind standard utilisées : `text-slate-600` correspond à `#475569`, `bg-slate-50` à `#F8FAFC`, `text-slate-900` à `#0F172A`; ces valeurs viennent du CDN Tailwind et ne sont pas déclarées localement.

### `studio.html`

- `theme-color`, ligne 6 : `#0B1120`.
- Configuration Tailwind, lignes 17, 18, 19, 20 et 21 : `navy` `#0F172A`, `night` `#0B1120`, `emerald` `#059669` / `dark` `#047857`, `gold` `#F59E0B` / `deep` `#D97706` / `soft` `#FBBF24`, `mint` `#A7D8C5`.
- CSS, ligne 27 : carte `#fff` et bordure `#A7D8C5`; ligne 34 : focus `#F59E0B`.
- Favicon SVG en data URI, ligne 7, et logos SVG inline, lignes 47 et 261 : `#0B1120`, `#34D399`, `#CBD5E1`, `#5EEAD4`, `#059669`.
- Presets de décor, lignes 385, 386, 387 et 388 : marbre `#FFFFFF` / `#E7DCC3`; bois `#8B5E3C` / `#3F2A1A`; minimal `#F1F5F9` / `#CBD5E1`; afro `#059669` / `#F59E0B`.

Les teintes brunes/ivoire des presets, les bleus et rouges/oranges des logos de paiement, le bleu Google et le fond Corporate très sombre sont également présents dans le code : à préserver ou à arbitrer explicitement si une future partie vise une harmonisation stricte de palette. Aucun remplacement n’a été fait pendant cet audit.

## 3. Scripts et contrats JavaScript critiques

### `index.html`

Scripts et dépendances observés : Tailwind CDN et configuration inline (script ligne 17, configuration à partir de la ligne 18), Font Awesome CDN (ligne 38), Lenis CDN (ligne 41), synchronisation de la hauteur de bannière par `ResizeObserver` (script ligne 166), logique inline de page (script principal ligne 1307), beacon Cloudflare ligne 1476 et script challenge ligne 1477. Les polices Inter sont chargées depuis Google Fonts.

Fonctions et comportements à ne pas casser : `syncBannerHeight` (IIFE), `commander(produit, prix)`, `diagnosticGratuit()`, `closeMobileMenu()`, `updateShareProgress()`, observers `IntersectionObserver` pour `.reveal` et `[data-counter]`, synchronisation du comparateur `.ba-range` avec `.ba-frame`, soumission `devis-form` vers WhatsApp, ombre de `site-header`, tilt du visuel hero.

IDs interrogés par le JavaScript : `launch-banner`, `mobile-menu-toggle`, `mobile-menu`, `mobile-menu-icon`, `share-count`, `share-progress`, `share-progress-bar`, `share-invite-button`, `share-vip-button`, `devis-form`, `devis-nom`, `devis-activite`, `devis-besoin`, `devis-details`, `site-header`, `hero-visual`, `hero-visual-zone`.

Sélecteurs/classes et données utilisés : `--launch-banner-height`, `.hidden`, `.reveal` / `.is-visible`, `.ba-range`, `.ba-frame`, `.is-scrolled`, `[data-counter]`, `a[href^="#"]`; les états de révélation et le menu dépendent des classes `is-visible` et `hidden`.

### `studio.html`

Scripts : Tailwind CDN et configuration inline (script ligne 9, configuration ligne 11), application JavaScript inline (script ligne 337). Pas de framework ni d’étape de build détectés.

Fonctions critiques : gestion des crédits et UI (`loadCredits`, `saveCredits`, `updateCreditsUI`); modes et onglets (`setMode`, `setSelectedMode`, `setTab`); import/validation photo (`handlePick`, `loadPicked`, `discardPhoto`, `photoToBase64`); dictée (`toggleMic`, `stopMicUI`); génération (`launchGeneration`, `callGenerate`, `runGeneration`); rendu et filigrane (`renderCanvas`, `drawWatermark`); texte et partage (`renderCopy`, `copyText`, `shareWhatsApp`); export (`downloadAsset`); menu latéral, bibliothèque et historique (`openDrawer`, `closeDrawer`, `renderLibrary`, `showFromLibrary`, `renderHistory`); recharge (`openRechargeModal`, `closeRechargeModal`). `notifyVideo()` ouvre WhatsApp avec un message prérempli.

IDs critiques, regroupés par rôle : modes `btn-artisan`, `btn-pme`, `btn-enterprise`, `smode-packaging`, `smode-publicite`, `smode-fiche`; onglets `tablist`, `tab-photo`, `tab-text`, `tab-video`; génération `stage`, `studio-canvas`, `workspace-photo`, `result-placeholder`, `panel-video`, `generation-badge`, `canvas-loading`, `loading-text`, `btn-generate`; barre `bar`, `chips`, `prompt-bar`, `btn-plus`, `plus-wrap`, `plus-menu`, `file-gallery`, `file-camera`; crédits `credits-badge`, `btn-recharge`, `recharge-modal`, `modal-title`; copie `ai-copy`, `copy-actions`, `copy-label`; drawer `drawer-overlay`, `drawer`, `btn-burger`, `drawer-close`, `library-grid`, `library-empty`, `history-list`, `history-empty`; erreurs et dictée `form-error`, `note-prompt-bar`, `mic-prompt-bar`.

Sélecteurs/classes d’état critiques : `hidden`, `border-emerald`, `border-slate-200`, `-translate-x-full`, `bg-emerald`, `bg-gold`, `[data-fmt]`, `[data-field]`, `[data-listening]`, `[data-ring]`, `[data-mic]`, `input[name="decor"]`. Ces noms sont manipulés directement par le JavaScript.

### API et déploiement

`studio.html` appelle `POST /api/generate` avec `productName`, `prompt`, `imageBase64` et `mode` (`packaging`, `publicite`, `fiche`), lignes 343 et 675. La fonction est `module.exports` dans `api/generate.js` (ligne 1 et gestionnaire ligne 188), routée comme fonction Vercel; `vercel.json` fixe `maxDuration` à 90 secondes. Les identifiants fournisseur attendus sont des variables d’environnement (`META_MODEL_API_KEY`, `BASETEN_API_KEY`, etc.); aucune valeur de clé n’a été relevée dans le code lu.

Le secours renvoie `degraded: true` et un texte modèle et/ou la photo d’origine lorsque le fournisseur échoue (`api/generate.js`, gestionnaire à partir de la ligne 188); le client n’enlève un crédit qu’en cas de réponse non dégradée (`studio.html`, ligne 739). Le filigrane `DAA AI — MODE DÉCOUVERTE` est dessiné côté client lorsque `IS_PREMIUM` vaut `false` (`studio.html`, ligne 354 et fonction `drawWatermark` ligne 820). Dictée via `SpeechRecognition` / `webkitSpeechRecognition` (`studio.html`, ligne 574).

## 4. Paiements et WhatsApp

### Paystack

Les trois liens protégés se trouvent dans la modale de recharge de `studio.html` :

- `https://paystack.shop/pay/daa-studio-decouverte`, ligne 315 — Pack Découverte, 20 crédits, 3 000 FCFA.
- `https://paystack.shop/pay/daa-studio-pro`, ligne 319 — Pack Pro, 100 crédits, 10 000 FCFA.
- `https://paystack.shop/pay/daa-studio-business`, ligne 327 — Pack Entreprise, 500 crédits, 45 000 FCFA.

`index.html` ne contient pas de lien Paystack sortant relevé; son bandeau sous les packs affirme « Règlements sécurisés en ligne ou via WhatsApp certifiés conformes Paystack (UEMOA) » à la ligne 754. `studio.html` mentionne le paiement Paystack et les moyens pris en charge à la ligne 333. Les trois boutons de recharge ouvrent les liens directs; le flux de génération ne valide pas un achat Paystack côté serveur. Les crédits d’essai sont stockés en `localStorage` sous `daa_studio_credits` (clé ligne 340, lecture ligne 362, initialisation ligne 364, sauvegarde ligne 368) et sont modifiables côté client, comme le signale le commentaire près de `loadCredits()`.

### Liens et messages WhatsApp relevés

`index.html` :

- Ligne 348 : invitation au groupe `https://chat.whatsapp.com/HE27sT0Ub6lDinv1FR3SW8?s=cl&p=a&ilr=1`, révélée après trois invitations.
- Ligne 353 : contact direction `https://wa.me/2250544188155`, sans texte prérempli.
- Ligne 873 : devis Corporate prérempli : « Bonjour Mr. TEKEU, je représente une entreprise et souhaite un devis ainsi qu’un audit pour une solution digitale sur-mesure. »
- Ligne 1268 : contact footer prérempli pour demander un diagnostic digital gratuit.
- Ligne 1311, fonction `commander` : message généré avec le produit et le prix : « Bonjour DAA, je souhaite commander le produit : {produit} au prix de {prix} FCFA ».
- Ligne 1317, fonction `diagnosticGratuit` : « Bonjour DAA, je souhaite bénéficier d’un diagnostic digital gratuit. »
- Ligne 1363 : invitation via `https://api.whatsapp.com/send?text=...`, texte d’invitation à la formation DAA et URL publique `https://digitalartisansacademy.vercel.app`.
- Ligne 1451 : Devis Express génère un message contenant nom/commerce, activité, besoin et détails facultatifs. Il s’ouvre vers WhatsApp et la page précise ligne 1225 qu’aucune donnée n’est stockée.

`studio.html` :

- Ligne 301 : assistance directe vers `https://wa.me/2250544188155` avec le texte prérempli « Bonjour l’équipe DAA, j’utilise le Studio IA et j’ai besoin d’assistance technique. »
- Ligne 485, fonction `notifyVideo()` : message prérempli demandant à être prévenu du lancement de la Vidéo Promo IA V2.
- Ligne 868, fonction `shareWhatsApp()` : partage du texte généré via `https://wa.me/?text=` et `encodeURIComponent(lastCopy)`.
- Ligne 127 : bouton de notification vidéo qui appelle `notifyVideo()`.

## 5. Mentions et preuves sociales

Tous les emplacements ci-dessous sont dans `index.html` :

- `4,9/5` : preuve sociale du hero, ligne 260; compteur animé (valeur `4.9`), ligne 297; résumé « 4.9/5 · 85+ avis » dans la bourse VIP, ligne 312; résumé des témoignages « 4.9 / 5 sur la base de 85+ avis vérifiés », ligne 895.
- `85+` : hero, ligne 260; bourse VIP, ligne 312; commerces digitalisés, ligne 318; avis vérifiés, ligne 895.
- « avis vérifiés » : résumé de la section témoignages, ligne 895. La page n’associe pas de source de vérification individuelle aux trois témoignages : provenance/preuve `[À COMPLÉTER]`.
- `+40 %` : « +40% de clients le week-end », réalisation Google Maps, ligne 1002.
- `+30 %` : « +30% de ventes dès le 1er mois », réalisation Agent IA, ligne 1069.
- « 2x plus rapides » : « Commandes 2x plus rapides », réalisation catalogue WhatsApp, ligne 1038.
- Trois témoignages, section `#temoignages` : M. Kouassi (Restauration), ligne 911, sur les nouveaux clients après Google Maps et TikTok; Mme Awa (Atelier de Couture), ligne 928, sur le catalogue WhatsApp et le choix des modèles; M. Roland (Commerce), ligne 945, sur l’agent IA qui répond tard le soir et l’augmentation des ventes. Les trois affichent cinq étoiles.
- « N°1 » : meta description, ligne 8, et accroche hero, ligne 252.
- « certifiés conformes Paystack » : bandeau de paiement, ligne 754.
- Bandeau « 96 / 100 places réservées » : bannière de lancement, ligne 159.

Aucun `<script type="application/ld+json">`, `aggregateRating`, `ratingValue`, `reviewCount` ou propriété `review` n’a été trouvé dans `index.html` ni dans `studio.html`. Les métriques affichées ne sont donc pas exposées comme données structurées d’avis.

## 6. Risques de casse pour les parties 2, 3 et 4

### Partie 2 — preuves, avis et statistiques

- Les valeurs 4,9/5, 85+ avis, +40 %, +30 % et 2x sont des affirmations éditoriales présentes dans le HTML; aucune source vérifiable ni donnée structurée correspondante n’a été trouvée. Source/méthode de calcul et autorisation d’utiliser les avis : `[À COMPLÉTER]`. Ne pas fabriquer ni présenter de données d’avis comme vérifiées sans source.
- Les ancres `#temoignages`, les cartes `<figure>`, le lien Google et les attributs/test IDs de la section sont des points de navigation et de test à conserver.

### Partie 3 — contenu, services et identité visuelle

- Les services, tarifs, ancres, boutons `commander(...)` et libellés de packs sont des contrats existants à préserver. Toute édition de la grille des services ou des packs risque de casser des entrées JavaScript ou des liens d’ancre.
- La palette explicite du Studio comprend aussi les décors marbre/bois/minimal, et `index.html` utilise plusieurs couleurs de marques de paiement. Les remplacer au nom d’une harmonisation ferait perdre des choix visuels existants; toute exception à la palette de référence doit être arbitrée.
- `index.html` référence `logo-DAA.jpeg`, absent de l’inventaire local; vérifier le déploiement ou fournir le fichier avant de considérer le favicon comme fonctionnel.

### Partie 4 — Studio, paiement et génération

- Ne pas modifier les trois URL Paystack, les liens/messages WhatsApp, le Devis Express, `POST /api/generate`, les champs du contrat JSON, la branche `degraded` sans débit, le filigrane ou la dictée vocale sans autorisation explicite. Les noms d’IDs, attributs `data-*` et classes changées par le JavaScript sont sensibles.
- Les crédits d’essai sont dans `localStorage` et contournables côté client; les URL de recharge ne sont pas reliées à une validation d’achat ou à un webhook dans le flux audité. Ne pas annoncer une validation de paiement ou une sécurité des crédits qui n’est pas implémentée. L’ajout d’un vrai contrôle de crédits demanderait un périmètre et une architecture autorisés `[À COMPLÉTER]`.
- `api/generate.js` lit ses clés depuis les variables d’environnement. Le contenu de ces variables n’a pas été inspecté; aucune valeur secrète ne doit être ajoutée au code ni aux commits. `api/generate.js` était déjà modifié localement avant l’audit et doit rester hors de ce périmètre.
- `vercel.json` fixe 90 s, tandis que le client attend jusqu’à 110 s; vérifier les délais de bout en bout si le flux API évolue.

### Vérifications transversales

- Le site est statique, sans build ni framework; Tailwind, polices, icônes et Lenis dépendent de CDN externes. Une indisponibilité réseau/CDN peut changer le rendu ou les comportements associés.
- Après toute évolution UI, vérifier les largeurs 360, 768 et 1280 px demandées, la navigation mobile, les ancres, les formulaires et l’absence d’erreur console. Ces tests n’ont pas été exécutés pendant cette phase d’audit documentaire.
- Avant toute partie qui nécessite des données absentes (sources des avis, chiffres réellement validés, état du favicon sur Vercel), utiliser `[À COMPLÉTER]` et demander confirmation; ne rien inventer.