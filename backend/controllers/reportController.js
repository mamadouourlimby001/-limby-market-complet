const Report = require('../models/Report');
const Notification = require('../models/Notification');
const User = require('../models/User');

const VALID_TYPES = ['product', 'location', 'announcement', 'boutique'];

// POST /api/reports - Créer un signalement
const createReport = async (req, res) => {
  try {
    const { typeContenu, contenuId, raison } = req.body;

    if (!typeContenu || !VALID_TYPES.includes(typeContenu)) {
      return res.status(400).json({ message: 'Type de contenu invalide.' });
    }
    if (!contenuId) {
      return res.status(400).json({ message: 'Identifiant du contenu requis.' });
    }
    if (raison && typeof raison === 'string' && raison.length > 500) {
      return res.status(400).json({ message: 'La raison ne peut pas dépasser 500 caractères.' });
    }

    const report = await Report.create({ signalePar: req.user._id, typeContenu, contenuId, raison });
    const admins = await User.find({ role: { $in: ['admin_simple', 'admin_supreme'] } });
    for (const admin of admins) {
      await Notification.create({
        destinataire: admin._id,
        message: `Nouveau signalement: ${typeContenu}`,
        type: 'general'
      });
    }
    res.status(201).json({ message: 'Signalement envoyé. Merci.' });
  } catch (error) {
    console.error('createReport error:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { createReport };
