const mongoose = require('mongoose');

/**
 * Modèle Boutique
 * Représente une boutique/magasin sur la plateforme
 * Abonnement de 10000 GNF - la boutique doit être payée et approuvée pour être active
 */
const boutiqueSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de la boutique est requis'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  logo: {
    type: String,
    required: [true, 'Le logo est requis']
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis']
  },
  categorie: {
    type: String,
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
  isActive: {
    type: Boolean,
    default: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateExpiration: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalConfirmed: {
    type: Number,
    default: 0
  },
  totalCancelled: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Boutique', boutiqueSchema);
