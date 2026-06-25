const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    unique: true,
    trim: true,
    maxlength: [20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères']
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
    question: { type: String, maxlength: 200 },
    answer: { type: String }
  }],
  adminPermissions: {
    type: [String],
    default: []
  },
  // Utilisé pour invalider les tokens JWT émis avant un changement de mot de passe
  passwordChangedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
