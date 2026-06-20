const mongoose = require('mongoose');

/**
 * Modèle User
 * Représente un utilisateur de la plateforme Limby Market
 * Rôles : acheteur (défaut), vendeur, vendeur_boutique, admin_simple, admin_supreme
 */
const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis']
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    unique: true
  },
  motDePasse: {
    type: String,
    required: [true, 'Le mot de passe est requis']
  },
  role: {
    type: String,
    enum: ['acheteur', 'vendeur', 'vendeur_boutique', 'admin_simple', 'admin_supreme'],
    default: 'acheteur'
  },
  credits: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  creditExpiry: {
    type: Date
  },
  loyaltyCount: {
    type: Number,
    default: 0
  },
  securityQuestions: [{
    question: String,
    answer: String
  }],
  adminPermissions: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
