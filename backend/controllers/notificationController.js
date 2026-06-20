const Notification = require('../models/Notification');

// GET /api/notifications - Notifications de l'utilisateur connecté
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ destinataire: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/notifications/:id/read - Marquer comme lue
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { lu: true }, { new: true });
    if (!notification) return res.status(404).json({ message: 'Notification introuvable.' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// PUT /api/notifications/read-all - Tout marquer comme lu
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ destinataire: req.user._id, lu: false }, { lu: true });
    res.json({ message: 'Toutes les notifications marquées comme lues.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

// DELETE /api/notifications/:id - Supprimer une notification
const deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({ _id: req.params.id, destinataire: req.user._id });
    if (!notif) return res.status(404).json({ message: 'Notification introuvable.' });
    res.json({ message: 'Notification supprimée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
