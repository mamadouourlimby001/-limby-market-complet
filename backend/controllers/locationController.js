const Location = require('../models/Location');
const ContactUnlock = require('../models/ContactUnlock');
const User = require('../models/User');
const ActionHistory = require('../models/ActionHistory');
const Notification = require('../models/Notification');
const { uploadImagesToCloudinary, deleteImagesFromCloudinary } = require('../utils/cloudinaryUpload');

/**
 * Contrôleur des locations immobilières
 * Même logique que les produits pour le masquage de contact et les crédits
 */

// GET /api/locations - Récupérer toutes les locations actives avec filtres
const getLocations = async (req, res) => {
  try {
    const { ville, categorie, prixMin, prixMax, search } = req.query;
    let filter = { statut: 'actif', $or: [{ disponible: true }, { disponible: { $exists: false } }] };

    if (ville) filter.ville = { $regex: ville, $options: 'i' };
    if (categorie) filter.categorie = categorie;
    if (prixMin || prixMax) {
      filter.prix = {};
      if (prixMin) filter.prix.$gte = Number(prixMin);
      if (prixMax) filter.prix.$lte = Number(prixMax);
    }
    if (search) {
      filter.$or = [
        { titre: { $regex: search, $options: 'i' } }
      ];
    }

    const locations = await Location.find(filter)
      .populate('proprietaire', 'nom telephone isVerified')
      .sort({ createdAt: -1 });

    // Masquer les contacts et les quartiers
    const userId = req.user ? req.user._id : null;
    let unlockedIds = [];
    if (userId) {
      const unlocks = await ContactUnlock.find({ 
        utilisateur: userId, 
        typeContenu: 'location' 
      });
      unlockedIds = unlocks.map(u => u.contenuId.toString());
    }

    const locationsWithContact = locations.map(l => {
      const location = l.toObject();
      if (!unlockedIds.includes(location._id.toString())) {
        location.contact = 'hidden';
        location.quartier = 'hidden';
      }
      return location;
    });

    res.json(locationsWithContact);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/locations/:id - Récupérer le détail d'une location
const getLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('proprietaire', 'nom telephone isVerified');
    
    if (!location) {
      return res.status(404).json({ message: 'Location introuvable.' });
    }

    const locationObj = location.toObject();

    const userId = req.user ? req.user._id : null;
    if (userId) {
      const unlock = await ContactUnlock.findOne({
        utilisateur: userId,
        typeContenu: 'location',
        contenuId: location._id
      });
      if (!unlock) {
        locationObj.contact = 'hidden';
        locationObj.quartier = 'hidden';
      }
    } else {
      locationObj.contact = 'hidden';
      locationObj.quartier = 'hidden';
    }

    res.json(locationObj);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/locations - Créer une location
const createLocation = async (req, res) => {
  try {
    const { titre, categorie, ville, quartier, prix, description, photos, contact } = req.body;

    // Valider que la description ne contient pas plus de 4 chiffres
    if (description) {
      const digitCount = (description.match(/\d/g) || []).length;
      if (digitCount > 4) {
        return res.status(400).json({ message: 'Maximum 4 chiffres autorisés dans la description.' });
      }
    }

    // Uploader les images vers Cloudinary si elles sont en base64
    let photoUrls = [];
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const base64Photos = photos.filter(p => p && p.startsWith('data:'));
      if (base64Photos.length > 0) {
        photoUrls = await uploadImagesToCloudinary(base64Photos, 'limby/locations');
      }
      // Les photos qui ne sont pas en base64 sont déjà des URLs
      const existingUrls = photos.filter(p => p && !p.startsWith('data:'));
      photoUrls = [...photoUrls, ...existingUrls];
    }

    const location = await Location.create({
      titre,
      categorie,
      ville,
      quartier,
      prix,
      description,
      photos: photoUrls,
      proprietaire: req.user._id,
      contact
    });

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/locations/:id - Supprimer une location
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location introuvable.' });
    }

    const isOwner = location.proprietaire.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin_simple' || req.user.role === 'admin_supreme';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    // Supprimer les images de Cloudinary
    if (location.photos && Array.isArray(location.photos) && location.photos.length > 0) {
      await deleteImagesFromCloudinary(location.photos);
    }

    // Hard delete - supprimer complètement de la base de données
    await Location.findByIdAndDelete(req.params.id);

    res.json({ message: 'Location supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/locations/:id/unlock-contact - Débloquer le contact d'une location
const unlockContact = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location introuvable.' });
    }

    const user = await User.findById(req.user._id);

    // Vérifier si déjà débloqué
    const existingUnlock = await ContactUnlock.findOne({
      utilisateur: user._id,
      typeContenu: 'location',
      contenuId: location._id
    });

    if (existingUnlock) {
      return res.json({ contact: location.contact, message: 'Contact déjà débloqué.' });
    }

    // Vérifier le solde (10 crédits pour locations)
    if (user.credits < 10) {
      return res.status(400).json({ message: 'Solde de crédits insuffisant.' });
    }

    // Décrémenter les crédits (10 pour locations)
    user.credits -= 10;
    user.loyaltyCount += 1;

    // Système de fidélité
    let bonusCredit = false;
    if (user.loyaltyCount >= 5) {
      user.credits += 1;
      user.loyaltyCount = 0;
      bonusCredit = true;
    }

    await user.save();

    await ContactUnlock.create({
      utilisateur: user._id,
      typeContenu: 'location',
      contenuId: location._id,
      creditsDepenses: 10
    });

    await ActionHistory.create({
      utilisateur: user._id,
      action: 'contact_debloque',
      details: { typeContenu: 'location', contenuId: location._id, titre: location.titre }
    });

    await Notification.create({
      destinataire: user._id,
      message: `Contact débloqué pour "${location.titre}". ${bonusCredit ? '🎉 Bonus fidélité : +1 crédit gratuit !' : ''}`,
      type: 'contact_debloque'
    });

    if (user.credits === 0) {
      await Notification.create({
        destinataire: user._id,
        message: 'Votre solde de crédits est épuisé. Rechargez pour continuer.',
        type: 'solde_faible'
      });
    }

    res.json({ 
      contact: location.contact,
      quartier: location.quartier,
      credits: user.credits,
      bonusCredit,
      message: bonusCredit ? 'Contact débloqué ! Bonus fidélité : +1 crédit gratuit !' : 'Contact débloqué avec succès.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/locations/:id/disponibilite - Basculer la disponibilité d'une location
const toggleDisponibilite = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location introuvable.' });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (location.proprietaire.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    location.disponible = !location.disponible;
    await location.save();

    res.json({ message: 'Disponibilité mise à jour.', location });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { getLocations, getLocation, createLocation, deleteLocation, unlockContact, toggleDisponibilite };
