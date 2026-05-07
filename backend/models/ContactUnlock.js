const mongoose = require('mongoose');

/**
 * Modèle ContactUnlock
 * Enregistre chaque déblocage de contact par un utilisateur
 * Permet de ne pas facturer deux fois le même contact
 */
const contactUnlockSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  typeContenu: {
    type: String,
    enum: ['product', 'location', 'announcement'],
    required: true
  },
  contenuId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  creditsDepenses: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ContactUnlock', contactUnlockSchema);
