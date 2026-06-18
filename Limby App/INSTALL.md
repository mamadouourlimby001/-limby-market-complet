# Limby App — Guide d'installation

## Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI : `npm install -g expo-cli`
- Application Expo Go sur votre téléphone (Android/iOS)

## Installation

```bash
cd "Limby App"
npm install
```

## Démarrer l'application

```bash
npx expo start
```

Scannez le QR code avec Expo Go (Android) ou l'app Appareil Photo (iOS).

## Variables d'environnement

Le fichier `.env` est déjà configuré avec les URLs de production du projet web.

Si nécessaire, modifiez `.env` :

```
EXPO_PUBLIC_API_URL=https://limby01-production.up.railway.app/api
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dylqtseje
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=limby_unsigned
```

## Configuration Cloudinary (important)

Pour l'upload de photos, vous devez créer un **Upload Preset non signé** dans votre compte Cloudinary :

1. Connectez-vous à cloudinary.com
2. Settings → Upload → Upload Presets
3. Créer un preset avec Mode = "Unsigned"
4. Nommez-le `limby_unsigned`

## Structure du projet

```
Limby App/
├── app/                    # Screens (Expo Router)
│   ├── _layout.jsx         # Root layout + AuthProvider
│   ├── index.jsx           # Redirect auth/home
│   ├── (auth)/             # Login, Register, Forgot password
│   ├── (tabs)/             # Main tabs (Accueil, Occasion, Boutiques, Compte)
│   ├── occasion/           # Products list, detail, add
│   ├── locations/          # Real estate list, detail, add
│   ├── annonces/           # Job postings list, detail, add
│   ├── boutiques/          # Create boutique
│   ├── ma-boutique/        # Store owner dashboard
│   ├── commandes/          # Orders (buyer & seller)
│   ├── credits/            # Buy credits, renew subscription
│   ├── notifications/      # Notifications
│   ├── messages/           # Messages to admin
│   └── mon-compte/         # Change password
├── components/             # Shared components
├── context/                # AuthContext
├── services/               # API (axios)
├── utils/                  # Storage, Cloudinary upload
└── constants/              # Colors, config, categories
```

## Fonctionnalités implémentées

- [x] Authentification (Login, Register, Forgot Password)
- [x] Navigation par onglets
- [x] Produits occasion (liste, détail, ajout)
- [x] Immobilier (liste, détail, ajout)
- [x] Offres d'emploi (liste, détail, ajout)
- [x] Boutiques (liste, détail, créer)
- [x] Ma boutique (dashboard, produits, bilan)
- [x] Commandes (acheteur et vendeur)
- [x] Système de crédits (achat, déblocage contacts)
- [x] Renouvellement abonnement boutique
- [x] Notifications
- [x] Messages support admin
- [x] Changer mot de passe
- [x] Upload photos Cloudinary

## Backend utilisé

Le même backend que le site web : `https://limby01-production.up.railway.app`

Aucune modification du backend n'est nécessaire.
