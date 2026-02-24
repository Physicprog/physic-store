// ============================================================
// CONFIG CENTRALE — modifiable via le panel admin
// Les données sont lues depuis Google Sheets via Apps Script
// ============================================================

// URL de votre Google Apps Script Web App
// Voir /google-apps-script/Code.gs pour le script à déployer
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwNufqAd1FkYla1g9uh9KFgk1VaBkkRed60gtf1at427GWpvLKNEbzVXehJroNHJo9u/exec'

// Clé publique Stripe (pour Stripe Payment Links)
// Dashboard Stripe > Developers > API Keys > Publishable key
export const STRIPE_PUBLIC_KEY = 'pk_live_YOUR_STRIPE_PUBLIC_KEY'

// Client ID PayPal
// developer.paypal.com > Apps & Credentials > Client ID
export const PAYPAL_CLIENT_ID = 'YOUR_PAYPAL_CLIENT_ID'

// Mot de passe admin (haché — NE METTEZ PAS votre vrai mot de passe ici en clair)
// Générez le hash avec : btoa('votre_mot_de_passe') dans la console
// Ou utilisez la fonction hashPassword() ci-dessous pour générer le hash
export const ADMIN_PASSWORD_HASH = '9cc28cc80fc09479d140d2579eb3950ee3a1233f3c799af1b9fa3aa2ce748716' // ex: btoa('admin123') = 'YWRtaW4xMjM='

// Durée de session admin (en heures)
export const ADMIN_SESSION_HOURS = 8

// Devise
export const CURRENCY = 'EUR'
export const LOCALE = 'fr-FR'

// ============================================================
// PRODUITS PAR DÉFAUT (utilisés si Google Sheets non configuré)
// Ces données sont écrasées par celles de Google Sheets
// ============================================================
export const DEFAULT_PRODUCTS = [
  {
    id: 'ui-kit-pro',
    name: 'UI Kit Pro 2024',
    tagline: '500+ composants Figma prêts à l\'emploi',
    description: 'Un kit UI complet avec plus de 500 composants Figma.\n\nInclus :\n- 500+ composants en 30 catégories\n- 8 thèmes de couleur\n- 1200 icônes exclusives\n- Templates de pages complètes\n- Documentation PDF\n- Mises à jour à vie',
    price: 49,
    salePrice: 29,
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
    category: 'Design',
    tags: 'figma,ui-kit,design',
    featured: true,
    active: true,
    driveLink: 'https://drive.google.com/file/d/VOTRE_ID_FICHIER/view', // Remplacez
    stripeLink: 'https://buy.stripe.com/VOTRE_LIEN_STRIPE',
    paypalAmount: 29,
    fileSize: '245 MB',
    rating: 4.9,
    reviewCount: 234,
  },
  {
    id: 'next-starter',
    name: 'Next.js Starter Kit',
    tagline: 'Boilerplate complet, prêt en production',
    description: 'Next.js 14 + TypeScript + Auth + Stripe + Prisma + Tailwind.\n\nTout configuré :\n- Next.js 14 App Router\n- TypeScript strict\n- NextAuth.js (Google, GitHub, email)\n- Stripe intégré\n- Prisma + PostgreSQL\n- shadcn/ui components\n- Tests Jest + Playwright\n- CI/CD GitHub Actions',
    price: 79,
    salePrice: null,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    category: 'Code',
    tags: 'nextjs,react,typescript,boilerplate',
    featured: true,
    active: true,
    driveLink: 'https://drive.google.com/file/d/VOTRE_ID_FICHIER/view',
    stripeLink: 'https://buy.stripe.com/VOTRE_LIEN_STRIPE',
    paypalAmount: 79,
    fileSize: '18 MB',
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: 'notion-templates',
    name: 'Pack Notion Entrepreneur',
    tagline: '10 templates Notion pour indépendants',
    description: '10 templates Notion professionnels pour organiser votre activité.\n\nTemplates inclus :\n- Dashboard entrepreneur\n- CRM clients\n- Suivi des projets\n- Finances et facturation\n- Pipeline commercial\n- Planificateur hebdomadaire\n- Base de connaissances\n- Tracker d\'habitudes',
    price: 19,
    salePrice: null,
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
    category: 'Productivite',
    tags: 'notion,templates,organisation,entrepreneur',
    featured: true,
    active: true,
    driveLink: 'https://drive.google.com/file/d/VOTRE_ID_FICHIER/view',
    stripeLink: 'https://buy.stripe.com/VOTRE_LIEN_STRIPE',
    paypalAmount: 19,
    fileSize: '2 MB',
    rating: 4.9,
    reviewCount: 445,
  },
]

export const DEFAULT_PROMOS = [
  {
    code: 'BIENVENUE20',
    type: 'percentage',
    value: 20,
    description: '20% de réduction — offre de bienvenue',
    expiresAt: '2025-12-31',
    maxUses: 100,
    currentUses: 0,
    active: true,
    minOrderAmount: 0,
  },
  {
    code: 'FLASH10',
    type: 'fixed',
    value: 10,
    description: '10 EUR de réduction',
    expiresAt: '2025-06-30',
    maxUses: 50,
    currentUses: 0,
    active: true,
    minOrderAmount: 30,
  },
]
