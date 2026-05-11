const Boutique = require('../models/Boutique');
const Order = require('../models/Order');

// GET - Récupérer le bilan de la boutique
const getBoutiqueStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer la boutique de l'utilisateur
    const boutique = await Boutique.findOne({ proprietaire: userId });
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    res.json({
      totalOrders: boutique.totalOrders,
      totalConfirmed: boutique.totalConfirmed,
      totalCancelled: boutique.totalCancelled,
      totalRevenue: boutique.totalRevenue,
      lastResetDate: boutique.lastResetDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du bilan' });
  }
};

// PUT - Réinitialiser les stats
const resetBoutiqueStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Récupérer la boutique de l'utilisateur
    const boutique = await Boutique.findOne({ proprietaire: userId });
    if (!boutique) {
      return res.status(404).json({ message: 'Boutique non trouvée' });
    }

    const updated = await Boutique.findByIdAndUpdate(
      boutique._id,
      {
        totalOrders: 0,
        totalConfirmed: 0,
        totalCancelled: 0,
        totalRevenue: 0,
        lastResetDate: new Date()
      },
      { new: true }
    );

    res.json({
      message: 'Statistiques réinitialisées',
      data: {
        totalOrders: updated.totalOrders,
        totalConfirmed: updated.totalConfirmed,
        totalCancelled: updated.totalCancelled,
        totalRevenue: updated.totalRevenue,
        lastResetDate: updated.lastResetDate
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la réinitialisation' });
  }
};

module.exports = {
  getBoutiqueStats,
  resetBoutiqueStats
};
