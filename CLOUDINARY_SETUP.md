# Migration vers le Stockage Cloud - Cloudinary

## Résumé des Changements

Ce projet a été migré pour stocker les images dans **Cloudinary** au lieu de les stocker directement dans la base de données. Cela améliore considérablement les performances et réduit la consommation de stockage.

## Changements Effectués

### Backend (`/backend`)

1. **Installation de Cloudinary** - Ajout du package `cloudinary` au `package.json`

2. **Nouveau fichier de configuration** (`config/cloudinary.js`):
   - Configure l'accès à Cloudinary avec les clés d'API

3. **Nouvel utilitaire** (`utils/cloudinaryUpload.js`):
   - `uploadImageToCloudinary()` - Upload une image en base64 vers Cloudinary
   - `uploadImagesToCloudinary()` - Upload plusieurs images

4. **Contrôleurs modifiés**:
   - `controllers/productController.js` - `createProduct()`
   - `controllers/locationController.js` - `createLocation()`
   - `controllers/announcementController.js` - `createAnnouncement()`
   - `controllers/boutiqueController.js` - `addBoutiqueProduct()`
   
   Tous les contrôleurs de création convertissent maintenant les images base64 en URLs Cloudinary avant de les stocker dans la BD.

### Frontend (`/frontend`)

1. **Nouvel utilitaire** (`src/utils/cloudinaryUpload.js`):
   - `fileToBase64()` - Convertit un fichier en base64 pour prévisualisation locale
   - `uploadImageToCloudinary()` - (Optionnel) Upload directement depuis le frontend

2. **Pages modifiées**:
   - `pages/AddProduct.jsx`
   - `pages/AddLocation.jsx`
   - `pages/AddAnnouncement.jsx`
   - `pages/AddBoutiqueProduct.jsx`
   
   Les images continuent à être affichées localement en base64 pour la prévisualisation, puis sont converties en URLs Cloudinary côté serveur.

## Configuration Cloudinary

### 1. Créer un compte Cloudinary

1. Allez sur [cloudinary.com](https://cloudinary.com)
2. Inscrivez-vous (gratuit)
3. Connectez-vous à votre dashboard

### 2. Récupérer vos identifiants

Dans votre dashboard Cloudinary, vous trouverez:
- **Cloud Name** - Utilisé dans les variables d'environnement
- **API Key** - Clé API
- **API Secret** - Secret API (gardez-le confidentiel!)

### 3. Configurer les variables d'environnement

#### Backend (.env)

```bash
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

#### Frontend (.env ou .env.local) - Optionnel

```bash
VITE_CLOUDINARY_CLOUD_NAME=votre_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=votre_upload_preset
```

### 4. Installation des dépendances

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

## Architecture du Flux d'Upload

### Avant (Base64 dans la BD)
```
Frontend (file) → FileReader (base64) → Backend → MongoDB
```

### Après (Cloudinary)
```
Frontend (file) → FileReader (base64 pour prévisualisation) → Backend
         ↓
    Cloudinary (upload + URL) → MongoDB (stocke l'URL)
         ↓
    Frontend (affiche via URL Cloudinary)
```

## Avantages de cette Migration

✅ **Réduction du stockage BD** - Les images ne sont plus dans MongoDB  
✅ **Meilleures performances** - Les images sont servies via CDN Cloudinary  
✅ **Scalabilité** - Cloudinary gère automatiquement la compression et les formats  
✅ **Sécurité** - Les images sont sauvegardées séparément de la BD  
✅ **Transformation d'images** - Possibilité de redimensionner/optimiser les images via Cloudinary  

## Notes Importantes

- Les images en base64 reçues du frontend sont converties en URLs Cloudinary côté serveur
- Les images existantes dans la BD (base64) ne seront pas automatiquement migrées
- Pour migrer les images existantes, vous devez créer une tâche de migration
- Cloudinary offre un plan gratuit avec 25 GB de stockage

## Dépannage

**Erreur: "Erreur lors de l'upload vers Cloudinary"**
- Vérifiez que vos variables d'environnement Cloudinary sont correctes
- Vérifiez que vous avez un compte Cloudinary valide
- Vérifiez que les images ne sont pas corrompues

**Images ne s'affichent pas**
- Vérifiez que l'URL Cloudinary est valide
- Vérifiez que le dossier 'limby' existe dans Cloudinary
- Vérifiez les logs du serveur pour plus d'erreurs

## Commandes Utiles

Redémarrer le backend:
```bash
cd backend
npm install
npm run dev
```

Redémarrer le frontend:
```bash
cd frontend
npm install
npm run dev
```
