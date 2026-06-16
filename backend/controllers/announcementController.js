const Announcement = require('../models/Announcement');
const ContactUnlock = require('../models/ContactUnlock');
const User = require('../models/User');
const ActionHistory = require('../models/ActionHistory');
const Notification = require('../models/Notification');
const { uploadImagesToCloudinary, deleteImagesFromCloudinary } = require('../utils/cloudinaryUpload');

// GET /api/announcements
const getAnnouncements = async (req, res) => {
  try {
    const { villeDeTravail, entreprise, dateLimite, search } = req.query;
    let filter = { statut: 'actif', disponible: true };
    if (villeDeTravail) filter.villeDeTravail = { $regex: villeDeTravail, $options: 'i' };
    if (entreprise) filter.entreprise = { $regex: entreprise, $options: 'i' };
    if (dateLimite) filter.dateLimite = { $gte: new Date(dateLimite) };
    if (search) {
      filter.$or = [
        { titre: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { entreprise: { $regex: search, $options: 'i' } }
      ];
    }
    const announcements = await Announcement.find(filter)
      .populate('auteur', 'nom telephone isVerified').sort({ createdAt: -1 });
    const userId = req.user ? req.user._id : null;
    let unlockedIds = [];
    if (userId) {
      const unlocks = await ContactUnlock.find({ utilisateur: userId, typeContenu: 'announcement' });
      unlockedIds = unlocks.map(u => u.contenuId.toString());
    }
    const result = announcements.map(a => {
      const obj = a.toObject();
      if (!unlockedIds.includes(obj._id.toString())) obj.contact = 'hidden';
      return obj;
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// GET /api/announcements/:id
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('auteur', 'nom telephone isVerified');
    if (!announcement) return res.status(404).json({ message: 'Annonce introuvable.' });
    const obj = announcement.toObject();
    const userId = req.user ? req.user._id : null;
    if (userId) {
      const unlock = await ContactUnlock.findOne({ utilisateur: userId, typeContenu: 'announcement', contenuId: announcement._id });
      if (!unlock) obj.contact = 'hidden';
    } else { obj.contact = 'hidden'; }
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/announcements
const createAnnouncement = async (req, res) => {
  try {
    const { titre, villeDeTravail, quartier, salaireMensuel, dateLimite, entreprise, description, photos, contact } = req.body;
    
    // Valider que la description ne contient pas de chiffres
    if (description && /\d/.test(description)) {
      return res.status(400).json({ message: 'Les chiffres sont interdits dans la description.' });
    }
    
    // Uploader les images vers Cloudinary si elles sont en base64
    let photoUrls = [];
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const base64Photos = photos.filter(p => p && p.startsWith('data:'));
      if (base64Photos.length > 0) {
        photoUrls = await uploadImagesToCloudinary(base64Photos, 'limby/announcements');
      }
      // Les photos qui ne sont pas en base64 sont déjà des URLs
      const existingUrls = photos.filter(p => p && !p.startsWith('data:'));
      photoUrls = [...photoUrls, ...existingUrls];
    }
    
    const announcement = await Announcement.create({
      titre, villeDeTravail, quartier, salaireMensuel, dateLimite, entreprise, description,
      photos: photoUrls, auteur: req.user._id, contact
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Annonce introuvable.' });
    const isOwner = announcement.auteur.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin_simple' || req.user.role === 'admin_supreme';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Accès refusé.' });
    
    // Supprimer les images de Cloudinary
    if (announcement.photos && Array.isArray(announcement.photos) && announcement.photos.length > 0) {
      await deleteImagesFromCloudinary(announcement.photos);
    }
    
    // Hard delete - supprimer complètement de la base de données
    await Announcement.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Annonce supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// POST /api/announcements/:id/unlock-contact
const unlockContact = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Annonce introuvable.' });
    const user = await User.findById(req.user._id);
    const existingUnlock = await ContactUnlock.findOne({ utilisateur: user._id, typeContenu: 'announcement', contenuId: announcement._id });
    if (existingUnlock) return res.json({ contact: announcement.contact, message: 'Contact déjà débloqué.' });
    if (user.credits < 1) return res.status(400).json({ message: 'Solde de crédits insuffisant.' });
    user.credits -= 1;
    user.loyaltyCount += 1;
    let bonusCredit = false;
    if (user.loyaltyCount >= 5) { user.credits += 1; user.loyaltyCount = 0; bonusCredit = true; }
    await user.save();
    await ContactUnlock.create({ utilisateur: user._id, typeContenu: 'announcement', contenuId: announcement._id, creditsDepenses: 1 });
    await ActionHistory.create({ utilisateur: user._id, action: 'contact_debloque', details: { typeContenu: 'announcement', contenuId: announcement._id, titre: announcement.titre } });
    await Notification.create({ destinataire: user._id, message: `Contact débloqué pour "${announcement.titre}". ${bonusCredit ? '🎉 Bonus fidélité : +1 crédit gratuit !' : ''}`, type: 'contact_debloque' });
    if (user.credits === 0) {
      await Notification.create({ destinataire: user._id, message: 'Votre solde de crédits est épuisé.', type: 'solde_faible' });
    }
    res.json({ contact: announcement.contact, credits: user.credits, bonusCredit, message: bonusCredit ? 'Contact débloqué ! Bonus fidélité !' : 'Contact débloqué avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/announcements/:id/disponibilite - Basculer la disponibilité d'une annonce
const toggleDisponibilite = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Annonce introuvable.' });
    }

    // Vérifier que l'utilisateur est l'auteur
    if (announcement.auteur.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    announcement.disponible = !announcement.disponible;
    await announcement.save();

    res.json({ message: 'Disponibilité mise à jour.', announcement });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { getAnnouncements, getAnnouncement, createAnnouncement, deleteAnnouncement, unlockContact, toggleDisponibilite };
