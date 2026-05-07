const mongoose = require('mongoose');

/**
 * Modèle Product
 * Représente un produit d'occasion sur la marketplace
 * Le champ contact est masqué par défaut et nécessite 1 crédit pour être débloqué
 */
const productSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis']
  },
  categorie: {
    type: String,
    required: [true, 'La catégorie est requise']
  },
  sousCategorie: {
    type: String
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
  etat: {
    type: String,
    enum: ['neuf', 'occasion', 'bon_etat', 'use'],
    required: [true, "L'état du produit est requis"]
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
  vendeur: {
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
    enum: ['actif', 'vendu', 'supprimé'],
    default: 'actif'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
