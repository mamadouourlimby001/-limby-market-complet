# 🇬🇳 Limby Market - Plateforme de Marketplace Guinéenne

Une plateforme e-commerce complète pour connecter les vendeurs et les acheteurs en Guinée.

## 📋 Architecture

```
limby01/
├── backend/          # API Node.js/Express
├── frontend/         # React + Vite
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js (v16+)
- MongoDB
- Compte Cloudinary (pour les images)

### Backend Setup

```bash
cd backend
npm install

# Créer le fichier .env (copier depuis .env.example)
cp .env.example .env

# Lancer le serveur
npm run dev  # mode développement
npm start    # mode production
```

### Frontend Setup

```bash
cd frontend
npm install

# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build
```

## 🔐 Variables d'Environnement

### Backend (`.env`)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## 📚 Fonctionnalités

- ✅ Authentification utilisateur (JWT)
- ✅ Système de crédits
- ✅ Gestion des produits et boutiques
- ✅ Upload d'images via Cloudinary
- ✅ Système de notifications
- ✅ Messagerie
- ✅ Reportage
- ✅ Admin Dashboard

## 📁 Structure du Projet

**Backend:**
- `routes/` - Routes API
- `controllers/` - Logique métier
- `models/` - Schémas MongoDB
- `middleware/` - Authentification et filtrage
- `config/` - Configuration (BD, Cloudinary)
- `utils/` - Utilitaires

**Frontend:**
- `pages/` - Pages principales
- `components/` - Composants réutilisables
- `context/` - État global (AuthContext)
- `utils/` - Utilitaires (API, Cloudinary)

## 🛠️ Scripts

### Backend
- `npm run dev` - Lancer en mode développement avec nodemon
- `npm start` - Lancer en mode production

### Frontend
- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Générer la build production
- `npm run preview` - Prévisualiser la build
- `npm run lint` - Lancer ESLint

## 🔄 Tâches Planifiées (Cron)

- **Minuit** : Vérification expiration des crédits
- **8 AM** : Archivage des boutiques fermées
- **10 AM** : Envoi notifications abonnement expirant

## 👥 Rôles Utilisateurs

- **Admin Suprême** : Accès complet
- **Admin** : Gestion modérée
- **Utilisateur** : Achat et vente

## 📝 Documentation

Voir [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) pour la configuration Cloudinary.

## 📞 Support

Pour tout problème ou question, veuillez créer une issue sur GitHub.

---

**Made with ❤️ for Limby Market**
