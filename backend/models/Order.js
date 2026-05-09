const mongoose = require('mongoose');

/**
 * Modèle Order
 * Représente une commande de produit boutique
 */
const orderSchema = new mongoose.Schema({
  // Produit commandé
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoutiqueProduct',
    required: true
  },

  // Boutique du produit
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },

  // Acheteur
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Statut de la commande: 'en_attente', 'confirmée', 'livrée', 'annulée'
  status: {
    type: String,
    enum: ['en_attente', 'confirmée', 'livrée', 'annulée'],
    default: 'en_attente'
  },

  // Quantité commandée
  quantite: {
    type: Number,
    default: 1,
    min: 1
  },

  // Prix au moment de la commande
  prixTotal: {
    type: Number,
    required: true
  },

  // Notes du vendeur
  noteVendeur: {
    type: String,
    default: ''
  },

  // Notes de l'acheteur
  noteAcheteur: {
    type: String,
    default: ''
  },

  // Date de création
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Date de mise à jour
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour les recherches fréquentes
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ boutique: 1, createdAt: -1 });
orderSchema.index({ product: 1 });
orderSchema.index({ status: 1 });

// Middleware pour mettre à jour updatedAt
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
