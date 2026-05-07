const mongoose = require('mongoose');

/**
 * Modèle Report
 * Représente un signalement de contenu par un utilisateur
 * Traité par un administrateur qui peut supprimer ou ignorer
 */
const reportSchema = new mongoose.Schema({
  signalePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  typeContenu: {
    type: String,
    enum: ['product', 'location', 'announcement', 'boutique'],
    required: true
  },
  contenuId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  raison: {
    type: String
  },
  statut: {
    type: String,
    enum: ['en_attente', 'traité'],
    default: 'en_attente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
