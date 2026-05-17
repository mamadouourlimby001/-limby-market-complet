const Boutique = require('../models/Boutique');
const BoutiqueProduct = require('../models/BoutiqueProduct');
const User = require('../models/User');
const { uploadImagesToCloudinary, deleteImagesFromCloudinary } = require('../utils/cloudinaryUpload');

// GET /api/boutiques - Toutes les boutiques actives (gratuit)
const getBoutiques = async (req, res) => {
  try {
    const boutiques = await Boutique.find({ isActive: true })
      .populate('proprietaire', 'nom telephone isVerified').sort({ dateCreation: -1 });
    res.json(boutiques);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/boutiques/:id - Détail boutique + ses produits
const getBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate('proprietaire', 'nom telephone isVerified');
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    const products = await BoutiqueProduct.find({ boutique: boutique._id, statut: 'actif' }).sort({ createdAt: -1 });
    res.json({ boutique, products });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/boutiques - Créer une boutique
const createBoutique = async (req, res) => {
  try {
    const { nom, description, logo, telephone, categorie, ville, quartier } = req.body;
    
    // Valider que la description ne contient pas de chiffres
    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }
    
    // Boutique créée inactive - nécessite paiement et approbation admin
    const boutique = await Boutique.create({
      nom, description, logo, proprietaire: req.user._id, telephone, categorie, ville, quartier,
      isActive: false, dateExpiration: null
    });
    // Changer le rôle de l'utilisateur en vendeur_boutique
    await User.findByIdAndUpdate(req.user._id, { role: 'vendeur_boutique' });
    res.status(201).json(boutique);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Une boutique avec ce nom existe déjà.' });
    }
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/boutiques/:id/products - Ajouter un produit à la boutique
const addBoutiqueProduct = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    if (boutique.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le propriétaire.' });
    }
    if (!boutique.isActive) {
      return res.status(400).json({ message: 'Boutique inactive. Renouvelez votre abonnement.' });
    }
    const { titre, description, prix, photos, categorie } = req.body;
    
    // Valider que la description ne contient pas de chiffres
    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }
    
    // Uploader les images vers Cloudinary si elles sont en base64
    let photoUrls = [];
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const base64Photos = photos.filter(p => p && p.startsWith('data:'));
      if (base64Photos.length > 0) {
        photoUrls = await uploadImagesToCloudinary(base64Photos, 'limby/boutiques');
      }
      // Les photos qui ne sont pas en base64 sont déjà des URLs
      const existingUrls = photos.filter(p => p && !p.startsWith('data:'));
      photoUrls = [...photoUrls, ...existingUrls];
    }
    
    const product = await BoutiqueProduct.create({
      boutique: boutique._id, titre, description, prix, photos: photoUrls, categorie
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/boutiques/:id/products/:productId
const deleteBoutiqueProduct = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    const isOwner = boutique.proprietaire.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin_simple' || req.user.role === 'admin_supreme';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Accès refusé.' });
    const product = await BoutiqueProduct.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
    
    // Supprimer les images de Cloudinary
    if (product.photos && Array.isArray(product.photos) && product.photos.length > 0) {
      await deleteImagesFromCloudinary(product.photos);
    }
    
    // Hard delete - supprimer complètement de la base de données
    await BoutiqueProduct.findByIdAndDelete(req.params.productId);
    
    res.json({ message: 'Produit supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/boutiques/my-boutique - Boutique de l'utilisateur connecté + ses produits
const getMyBoutique = async (req, res) => {
  try {
    const myBoutique = await Boutique.findOne({ proprietaire: req.user._id })
      .populate('proprietaire', 'nom telephone isVerified');
    if (!myBoutique) return res.status(404).json({ message: 'Aucune boutique trouvée.' });
    const products = await BoutiqueProduct.find({ boutique: myBoutique._id, statut: 'actif' }).sort({ createdAt: -1 });
    res.json({ boutique: myBoutique, products });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/boutiques/:id/products/:productId/disponibilite - Mettre à jour la disponibilité
const toggleProductDisponibilite = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id);
    if (!boutique) return res.status(404).json({ message: 'Boutique introuvable.' });
    
    const isOwner = boutique.proprietaire.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin_simple' || req.user.role === 'admin_supreme';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Accès refusé.' });
    
    const product = await BoutiqueProduct.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
    
    product.disponible = !product.disponible;
    await product.save();
    
    res.json({ message: 'Disponibilité mise à jour.', product });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { getBoutiques, getBoutique, createBoutique, addBoutiqueProduct, deleteBoutiqueProduct, getMyBoutique, toggleProductDisponibilite };
