const mongoose = require('mongoose');

/**
 * Modèle Order
 * Représente une commande de produit de boutique
 * Permet aux utilisateurs de commander des produits auprès des boutiques
 */
const orderSchema = new mongoose.Schema({
  acheteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoutiqueProduct',
    required: true
  },
  quantite: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [1, 'La quantité doit être au minimum 1']
  },
  prixUnitaire: {
    type: Number,
    required: [true, 'Le prix unitaire est requis']
  },
  prixTotal: {
    type: Number,
    required: [true, 'Le prix total est requis']
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmé', 'expédié', 'livré', 'annulé'],
    default: 'en_attente'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
