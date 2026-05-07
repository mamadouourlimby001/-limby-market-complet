const mongoose = require('mongoose');

/**
 * Modèle SubscriptionRequest
 * Représente une demande de renouvellement d'abonnement boutique
 * Traitée manuellement par un administrateur après vérification du dépôt
 */
const subscriptionRequestSchema = new mongoose.Schema({
  nomBoutique: {
    type: String,
    required: [true, 'Le nom de la boutique est requis']
  },
  telephoneDepot: {
    type: String,
    required: [true, 'Le numéro de téléphone de dépôt est requis']
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est requis']
  },
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  demandeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statut: {
    type: String,
    enum: ['en_attente', 'approuvé', 'rejeté'],
    default: 'en_attente'
  },
  traitePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SubscriptionRequest', subscriptionRequestSchema);
