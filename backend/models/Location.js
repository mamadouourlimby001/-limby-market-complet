const mongoose = require('mongoose');

/**
 * Modèle Location
 * Représente une annonce immobilière (location, colocation ou vente)
 * Le champ contact est masqué par défaut et nécessite 1 crédit pour être débloqué
 */
const locationSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis']
  },
  categorie: {
    type: String,
    enum: ['Location', 'Colocation', 'Vente_immobilière'],
    required: [true, 'La catégorie est requise']
  },
  ville: {
    type: String,
    required: [true, 'La ville est requise']
  },
  quartier: {
    type: String,
    required: [true, 'Le quartier est requis']
  },
  prix: {
    type: Number,
    required: [true, 'Le prix est requis']
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  photos: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 3;
      },
      message: 'Maximum 3 photos autorisées'
    }
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    type: String,
    required: [true, 'Le contact est requis']
  },
  statut: {
    type: String,
    enum: ['actif', 'supprimé'],
    default: 'actif'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Location', locationSchema);
