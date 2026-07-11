const mongoose = require('mongoose');

/**
 * Modèle ServicePost
 * Représente une publication (preuve de compétence) d'un prestataire Service :
 * photos + description d'une réalisation, pour informer ses clients potentiels.
 */
const servicePostSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  titre: {
    type: String,
    required: [true, 'Le titre est requis']
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  photos: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 photos autorisées'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServicePost', servicePostSchema);
