const mongoose = require('mongoose');

/**
 * Modèle BoutiqueProduct
 * Représente un produit vendu dans une boutique
 * Pas de champ état car les produits boutique sont neufs par définition
 * Gratuit pour les acheteurs, aucun crédit requis
 */
const boutiqueProductSchema = new mongoose.Schema({
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
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
  prix: {
    type: Number,
    required: [true, 'Le prix est requis']
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
  categorie: {
    type: String,
    required: [true, 'La catégorie est requise']
  },
  statut: {
    type: String,
    enum: ['actif', 'supprimé'],
    default: 'actif'
  },
  disponible: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BoutiqueProduct', boutiqueProductSchema);
