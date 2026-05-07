const mongoose = require('mongoose');

/**
 * Modèle CreditRequest
 * Représente une demande d'achat de crédits via Orange Money
 * Traitée manuellement par un administrateur après vérification du dépôt
 */
const creditRequestSchema = new mongoose.Schema({
  nomCompte: {
    type: String,
    required: [true, 'Le nom du compte est requis']
  },
  telephoneDepot: {
    type: String,
    required: [true, 'Le numéro de téléphone de dépôt est requis']
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est requis']
  },
  telephoneCompte: {
    type: String,
    required: [true, 'Le numéro du compte Limby est requis']
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

module.exports = mongoose.model('CreditRequest', creditRequestSchema);
