const mongoose = require('mongoose');

/**
 * Modèle Notification
 * Notifications en temps réel pour les utilisateurs
 * Types : credit_achat, contact_debloque, solde_faible, abonnement_renouveler, general
 */
const notificationSchema = new mongoose.Schema({
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Le message est requis']
  },
  type: {
    type: String,
    enum: ['credit_achat', 'contact_debloque', 'solde_faible', 'abonnement_renouveler', 'general']
  },
  lu: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Suppression automatique après 48 heures
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 });

module.exports = mongoose.model('Notification', notificationSchema);
