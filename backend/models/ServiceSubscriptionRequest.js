const mongoose = require('mongoose');

/**
 * Modèle ServiceSubscriptionRequest
 * Représente une demande de renouvellement d'abonnement pour un profil Service
 * Traitée manuellement par un administrateur après vérification du dépôt
 */
const serviceSubscriptionRequestSchema = new mongoose.Schema({
  nomService: {
    type: String,
    required: [true, 'Le nom du service est requis']
  },
  telephoneDepot: {
    type: String,
    required: [true, 'Le numéro de téléphone de dépôt est requis']
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est requis']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
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

module.exports = mongoose.model('ServiceSubscriptionRequest', serviceSubscriptionRequestSchema);
