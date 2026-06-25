const Location = require('../models/Location');
const ContactUnlock = require('../models/ContactUnlock');
const User = require('../models/User');
const ActionHistory = require('../models/ActionHistory');
const Notification = require('../models/Notification');
const { uploadImagesToCloudinary, deleteImagesFromCloudinary } = require('../utils/cloudinaryUpload');

const MAX_PHOTOS = 5;
const MAX_SEARCH_LEN = 100;
const MAX_STRING_LEN = 200;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parsePrice = (val) => { const n = Number(val); return isFinite(n) && n >= 0 ? n : null; };

// GET /api/locations
const getLocations = async (req, res) => {
  try {
    const { ville, categorie, prixMin, prixMax, search, mine } = req.query;
    const isOwnerRequest = mine === 'true' && req.user;
    let filter = { statut: 'actif' };
    if (!isOwnerRequest) filter.$or = [{ disponible: true }, { disponible: { $exists: false } }];
    if (isOwnerRequest) filter.proprietaire = req.user._id;

    if (ville && typeof ville === 'string' && ville.length <= MAX_STRING_LEN) {
      filter.ville = { $regex: escapeRegex(ville), $options: 'i' };
    }
    if (categorie && typeof categorie === 'string' && categorie.length <= MAX_STRING_LEN) {
      filter.categorie = categorie;
    }
    const minPrice = prixMin ? parsePrice(prixMin) : null;
    const maxPrice = prixMax ? parsePrice(prixMax) : null;
    if (minPrice !== null || maxPrice !== null) {
      filter.prix = {};
      if (minPrice !== null) filter.prix.$gte = minPrice;
      if (maxPrice !== null) filter.prix.$lte = maxPrice;
    }
    if (search && typeof search === 'string' && search.length <= MAX_SEARCH_LEN) {
      filter.$or = [{ titre: { $regex: escapeRegex(search), $options: 'i' } }];
    }

    const locations = await Location.find(filter).populate('proprietaire', 'nom telephone isVerified').sort({ createdAt: -1 });

    const userId = req.user ? req.user._id : null;
    let unlockedIds = [];
    if (userId) {
      const unlocks = await ContactUnlock.find({ utilisateur: userId, typeContenu: 'location' });
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
    console.error('getLocations error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/locations/:id
const getLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate('proprietaire', 'nom telephone isVerified');
    if (!location) return res.status(404).json({ message: 'Location introuvable.' });

    const locationObj = location.toObject();
    const userId = req.user ? req.user._id : null;
    if (userId) {
      const unlock = await ContactUnlock.findOne({ utilisateur: userId, typeContenu: 'location', contenuId: location._id });
      if (!unlock) { locationObj.contact = 'hidden'; locationObj.quartier = 'hidden'; }
    } else {
      locationObj.contact = 'hidden';
      locationObj.quartier = 'hidden';
    }

    res.json(locationObj);
  } catch (error) {
    console.error('getLocation error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/locations
const createLocation = async (req, res) => {
  try {
    const { titre, categorie, ville, quartier, prix, description, photos, contact } = req.body;

    if (!titre || typeof titre !== 'string' || titre.trim().length < 2 || titre.trim().length > 200) {
      return res.status(400).json({ message: 'Le titre doit contenir entre 2 et 200 caractères.' });
    }
    if (description && typeof description === 'string' && description.length > 2000) {
      return res.status(400).json({ message: 'La description ne peut pas dépasser 2000 caractères.' });
    }
    if (description) {
      const digitCount = (description.match(/\d/g) || []).length;
      if (digitCount > 4) {
        return res.status(400).json({ message: 'Maximum 4 chiffres autorisés dans la description.' });
      }
    }
    if (prix !== undefined && (isNaN(Number(prix)) || Number(prix) < 0)) {
      return res.status(400).json({ message: 'Prix invalide.' });
    }

    let photoUrls = [];
    if (photos && Array.isArray(photos)) {
      if (photos.length > MAX_PHOTOS) {
        return res.status(400).json({ message: `Maximum ${MAX_PHOTOS} photos autorisées.` });
      }
      const base64Photos = photos.filter(p => p && typeof p === 'string' && p.startsWith('data:'));
      if (base64Photos.length > 0) photoUrls = await uploadImagesToCloudinary(base64Photos, 'limby/locations');
      const existingUrls = photos.filter(p => p && typeof p === 'string' && !p.startsWith('data:'));
      photoUrls = [...photoUrls, ...existingUrls];
    }

    const location = await Location.create({
      titre: titre.trim(), categorie, ville, quartier,
      prix: prix !== undefined ? Number(prix) : undefined,
      description, photos: photoUrls, proprietaire: req.user._id, contact
    });

    res.status(201).json(location);
  } catch (error) {
    console.error('createLocation error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/locations/:id
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location introuvable.' });

    const isOwner = location.proprietaire.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin_simple' || req.user.role === 'admin_supreme';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Accès refusé.' });

    if (location.photos && location.photos.length > 0) await deleteImagesFromCloudinary(location.photos);
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: 'Location supprimée avec succès.' });
  } catch (error) {
    console.error('deleteLocation error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/locations/:id/unlock-contact
const unlockContact = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location introuvable.' });

    const user = await User.findById(req.user._id);
    const existingUnlock = await ContactUnlock.findOne({ utilisateur: user._id, typeContenu: 'location', contenuId: location._id });
    if (existingUnlock) return res.json({ contact: location.contact, message: 'Contact déjà débloqué.' });

    if (user.credits < 10) return res.status(400).json({ message: 'Solde de crédits insuffisant.' });

    user.credits -= 10;
    user.loyaltyCount += 1;
    let bonusCredit = false;
    if (user.loyaltyCount >= 5) { user.credits += 1; user.loyaltyCount = 0; bonusCredit = true; }
    await user.save();

    await ContactUnlock.create({ utilisateur: user._id, typeContenu: 'location', contenuId: location._id, creditsDepenses: 10 });
    await ActionHistory.create({ utilisateur: user._id, action: 'contact_debloque', details: { typeContenu: 'location', contenuId: location._id, titre: location.titre } });
    await Notification.create({ destinataire: user._id, message: `Contact débloqué pour "${location.titre}".${bonusCredit ? ' Bonus fidélité : +1 crédit gratuit !' : ''}`, type: 'contact_debloque' });

    if (user.credits === 0) {
      await Notification.create({ destinataire: user._id, message: 'Votre solde de crédits est épuisé. Rechargez pour continuer.', type: 'solde_faible' });
    }

    res.json({ contact: location.contact, quartier: location.quartier, credits: user.credits, bonusCredit, message: bonusCredit ? 'Contact débloqué ! Bonus fidélité : +1 crédit gratuit !' : 'Contact débloqué avec succès.' });
  } catch (error) {
    console.error('unlockContact location error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/locations/:id/disponibilite
const toggleDisponibilite = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location introuvable.' });
    if (location.proprietaire.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Accès refusé.' });
    location.disponible = !location.disponible;
    await location.save();
    res.json({ message: 'Disponibilité mise à jour.', location });
  } catch (error) {
    console.error('toggleDisponibilite location error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getLocations, getLocation, createLocation, deleteLocation, unlockContact, toggleDisponibilite };
