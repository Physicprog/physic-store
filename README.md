# DigitalStore — E-commerce fichiers numeriques

React SPA · GitHub Pages · Stripe CB · PayPal · Google Sheets admin · Museo Sans

---

## Demarrage rapide

```bash
npm install
npm run dev          # http://localhost:5173/digital-store/
npm run build        # build dans /dist
npm run deploy       # build + push sur gh-pages
```

---

## Arborescence

```
digital-store/
├── public/
│   ├── fonts/               ← Placez vos fichiers .woff2 Museo Sans ici
│   │   ├── MuseoSans-300.woff2
│   │   ├── MuseoSans-500.woff2
│   │   ├── MuseoSans-700.woff2
│   │   └── MuseoSans-900.woff2
│   ├── 404.html
│   └── favicon.svg
├── google-apps-script/
│   └── Code.gs              ← Script a deployer sur Google Apps Script
├── src/
│   ├── components/          ← Navbar, Cart, ProductCard, Footer
│   ├── hooks/               ← useStore (Google Sheets), useCart
│   ├── pages/               ← Home, Shop, Product, Checkout, Success, Admin
│   ├── utils/
│   │   ├── config.js        ← CONFIGURATION CENTRALE (cles, URL, mdp hash)
│   │   ├── sheets.js        ← Lecture/ecriture Google Sheets
│   │   ├── admin.js         ← Auth admin (SHA-256)
│   │   └── format.js        ← Formatage prix, dates
│   ├── styles/global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html               ← PayPal SDK chargé ici
├── vite.config.js           ← base: '/votre-repo/'
└── package.json
```

---

## ETAPE 1 — Polices Museo Sans

1. Placez vos fichiers `.woff2` dans `/public/fonts/`
2. Nommez-les exactement :
   - `MuseoSans-300.woff2` (light)
   - `MuseoSans-500.woff2` (regular)
   - `MuseoSans-700.woff2` (bold)
   - `MuseoSans-900.woff2` (black)
3. Les `@font-face` sont deja definis dans `src/styles/global.css`

---

## ETAPE 2 — Mot de passe admin

1. Ouvrez `http://localhost:5173/digital-store/admin`
2. Allez dans l'onglet **Configuration**
3. Entrez votre mot de passe → cliquez **Generer**
4. Copiez le hash SHA-256 genere
5. Collez-le dans `src/utils/config.js` :
   ```js
   export const ADMIN_PASSWORD_HASH = 'votre-hash-ici'
   ```

---

## ETAPE 3 — Google Sheets (base de donnees)

1. Allez sur [sheets.new](https://sheets.new)
2. Renommez la feuille **DigitalStore**
3. Creez 2 onglets : **products** et **promos**
4. Allez dans **Extensions > Apps Script**
5. Remplacez tout le code par le contenu de `google-apps-script/Code.gs`
6. Changez `ADMIN_TOKEN` par une chaine secrete dans le code
7. Deployez : **Deployer > Nouveau deploiement**
   - Type : Application Web
   - Executer en tant que : **Moi**
   - Qui peut y acceder : **Tout le monde**
8. Copiez l'URL generee
9. Collez dans `src/utils/config.js` :
   ```js
   export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/VOTRE_ID/exec'
   ```

---

## ETAPE 4 — Stripe (paiement CB)

1. Creez un compte sur [stripe.com](https://stripe.com)
2. Dashboard > **Payment Links** > Creer un lien par produit
3. URL de succes : `https://VOTRE_USERNAME.github.io/VOTRE_REPO/success`
4. Copiez chaque URL `https://buy.stripe.com/...`
5. Dans le panel admin (`/admin`) > Produits > Modifier > champ **Stripe Payment Link**

---

## ETAPE 5 — PayPal

1. Allez sur [developer.paypal.com](https://developer.paypal.com)
2. Apps & Credentials > Creer une app **Live**
3. Copiez le **Client ID**
4. Dans `index.html`, remplacez `YOUR_PAYPAL_CLIENT_ID` :
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=VOTRE_CLIENT_ID&currency=EUR...">
   ```

---

## ETAPE 6 — Liens Google Drive

Pour chaque produit :
1. Uploadez votre fichier ZIP sur Google Drive
2. Clic droit > **Partager** > "Toute personne disposant du lien peut consulter"
3. Copiez le lien `https://drive.google.com/file/d/ID/view`
4. Collez dans le champ **Lien Google Drive** du panel admin

**Note de securite** : Sur GitHub Pages (100% statique), le lien Drive est
present dans le bundle JS et donc techniquement visible dans les DevTools
par quelqu'un de tres motive. Pour une securite maximale, deployez sur
Netlify/Vercel avec une fonction serverless qui envoie le lien par email
apres validation du paiement.

---

## ETAPE 7 — Deploiement GitHub Pages

```bash
# 1. Modifiez vite.config.js
base: '/NOM-DE-VOTRE-REPO/',

# 2. Modifiez les chemins @font-face dans src/styles/global.css
# Remplacez '/digital-store/fonts/' par '/NOM-DE-VOTRE-REPO/fonts/'

# 3. Build et deploy
npm run deploy
# ou manuellement :
npm run build
git subtree push --prefix dist origin gh-pages

# 4. GitHub > Settings > Pages > Source: branche gh-pages
```

---

## Ajouter / modifier les produits

Depuis le panel admin `/admin` :
- Onglet **Produits** → bouton **+ Nouveau produit**
- Tous les champs sont editables : nom, prix, promo, image, lien Drive, Stripe...
- Les modifications sont sauvegardees en temps reel dans Google Sheets
- Si Google Sheets n'est pas configure, les donnees sont sauvegardees localement (localStorage)

---

## Securite de l'admin

- L'URL `/admin` est publique mais protegee par mot de passe hash SHA-256
- La session expire apres 8h (configurable dans `config.js`)
- Personne ne peut modifier les donnees sans le mot de passe
- Le token Apps Script n'est visible que dans votre Google Script (pas dans le code frontend)
