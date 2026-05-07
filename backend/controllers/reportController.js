const Report = require('../models/Report');
const Notification = require('../models/Notification');
const User = require('../models/User');

// POST /api/reports - Créer un signalement
const createReport = async (req, res) => {
  try {
    const { typeContenu, contenuId, raison } = req.body;
    const report = await Report.create({ signalePar: req.user._id, typeContenu, contenuId, raison });
    // Notifier tous les admins
    const admins = await User.find({ role: { $in: ['admin_simple', 'admin_supreme'] } });
    for (const admin of admins) {
      await Notification.create({
        destinataire: admin._id,
        message: `Nouveau signalement: ${typeContenu} - "${raison || 'Aucune raison'}"`,
        type: 'general'
      });
    }
    res.status(201).json({ message: 'Signalement envoyé. Merci.', report });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { createReport };
