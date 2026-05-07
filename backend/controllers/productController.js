const Product = require('../models/Product');
const ContactUnlock = require('../models/ContactUnlock');
const User = require('../models/User');
const ActionHistory = require('../models/ActionHistory');
const Notification = require('../models/Notification');
const { uploadImagesToCloudinary, deleteImagesFromCloudinary } = require('../utils/cloudinaryUpload');

/**
 * Contrôleur des produits d'occasion
 * Gère le CRUD des produits et le déblocage de contacts
 */

// GET /api/products - Récupérer tous les produits actifs avec filtres
const getProducts = async (req, res) => {
  try {
    const { ville, categorie, prixMin, prixMax, search } = req.query;
    let filter = { statut: 'actif' };

    if (ville) filter.ville = { $regex: ville, $options: 'i' };
    if (categorie) filter.categorie = { $regex: categorie, $options: 'i' };
    if (prixMin || prixMax) {
      filter.prix = {};
      if (prixMin) filter.prix.$gte = Number(prixMin);
      if (prixMax) filter.prix.$lte = Number(prixMax);
    }
    if (search) {
      filter.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .populate('vendeur', 'nom telephone isVerified')
      .sort({ createdAt: -1 });

    // Masquer les contacts sauf si déjà débloqués par l'utilisateur connecté
    const userId = req.user ? req.user._id : null;
    let unlockedIds = [];
    if (userId) {
      const unlocks = await ContactUnlock.find({ 
        utilisateur: userId, 
        typeContenu: 'product' 
      });
      unlockedIds = unlocks.map(u => u.contenuId.toString());
    }

    const productsWithContact = products.map(p => {
      const product = p.toObject();
      if (!unlockedIds.includes(product._id.toString())) {
        product.contact = 'hidden';
      }
      return product;
    });

    res.json(productsWithContact);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/products/:id - Récupérer le détail d'un produit
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendeur', 'nom telephone isVerified');
    
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    const productObj = product.toObject();

    // Masquer le contact sauf si déjà débloqué
    const userId = req.user ? req.user._id : null;
    if (userId) {
      const unlock = await ContactUnlock.findOne({
        utilisateur: userId,
        typeContenu: 'product',
        contenuId: product._id
      });
      if (!unlock) {
        productObj.contact = 'hidden';
      }
    } else {
      productObj.contact = 'hidden';
    }

    res.json(productObj);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/products - Créer un produit
const createProduct = async (req, res) => {
  try {
    const { titre, categorie, sousCategorie, ville, quartier, prix, description, etat, photos, contact } = req.body;

    // Valider que la description ne contient pas de chiffres
    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }

    // Uploader les images vers Cloudinary si elles sont en base64
    let photoUrls = [];
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const base64Photos = photos.filter(p => p && p.startsWith('data:'));
      if (base64Photos.length > 0) {
        photoUrls = await uploadImagesToCloudinary(base64Photos, 'limby/products');
      }
      // Les photos qui ne sont pas en base64 sont déjà des URLs
      const existingUrls = photos.filter(p => p && !p.startsWith('data:'));
      photoUrls = [...photoUrls, ...existingUrls];
    }

    const product = await Product.create({
      titre,
      categorie,
      sousCategorie,
      ville,
      quartier,
      prix,
      description,
      etat,
      photos: photoUrls,
      vendeur: req.user._id,
      contact
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/products/:id - Supprimer un produit (propriétaire ou admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    const isOwner = product.vendeur.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin_simple' || req.user.role === 'admin_supreme';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    // Supprimer les images de Cloudinary
    if (product.photos && Array.isArray(product.photos) && product.photos.length > 0) {
      await deleteImagesFromCloudinary(product.photos);
    }

    product.statut = 'supprimé';
    await product.save();

    res.json({ message: 'Produit supprimé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/products/:id/unlock-contact - Débloquer le contact d'un produit
const unlockContact = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    const user = await User.findById(req.user._id);

    // Vérifier si déjà débloqué
    const existingUnlock = await ContactUnlock.findOne({
      utilisateur: user._id,
      typeContenu: 'product',
      contenuId: product._id
    });

    if (existingUnlock) {
      return res.json({ contact: product.contact, message: 'Contact déjà débloqué.' });
    }

    // Vérifier le solde de crédits
    if (user.credits < 1) {
      return res.status(400).json({ message: 'Solde de crédits insuffisant. Achetez des crédits pour débloquer ce contact.' });
    }

    // Décrémenter le crédit
    user.credits -= 1;
    user.loyaltyCount += 1;

    // Système de fidélité : 1 crédit gratuit après 5 déblocages
    let bonusCredit = false;
    if (user.loyaltyCount >= 5) {
      user.credits += 1;
      user.loyaltyCount = 0;
      bonusCredit = true;
    }

    await user.save();

    // Créer le document ContactUnlock
    await ContactUnlock.create({
      utilisateur: user._id,
      typeContenu: 'product',
      contenuId: product._id,
      creditsDepenses: 1
    });

    // Enregistrer dans l'historique
    await ActionHistory.create({
      utilisateur: user._id,
      action: 'contact_debloque',
      details: {
        typeContenu: 'product',
        contenuId: product._id,
        titre: product.titre
      }
    });

    // Notification contact débloqué
    await Notification.create({
      destinataire: user._id,
      message: `Contact débloqué pour "${product.titre}". ${bonusCredit ? '🎉 Bonus fidélité : +1 crédit gratuit !' : ''}`,
      type: 'contact_debloque'
    });

    // Si solde atteint 0, notification solde faible
    if (user.credits === 0) {
      await Notification.create({
        destinataire: user._id,
        message: 'Votre solde de crédits est épuisé. Rechargez pour continuer à débloquer des contacts.',
        type: 'solde_faible'
      });
    }

    res.json({ 
      contact: product.contact, 
      credits: user.credits,
      bonusCredit,
      message: bonusCredit ? 'Contact débloqué ! Bonus fidélité : +1 crédit gratuit !' : 'Contact débloqué avec succès.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, deleteProduct, unlockContact };
