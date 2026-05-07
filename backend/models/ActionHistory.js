const mongoose = require('mongoose');

/**
 * Modèle ActionHistory
 * Journal d'audit de toutes les actions importantes sur la plateforme
 */
const actionHistorySchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: [true, "L'action est requise"]
  },
  details: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActionHistory', actionHistorySchema);
