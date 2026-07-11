const mongoose = require('mongoose');

/**
 * Modèle Service
 * Représente le profil d'un prestataire (métier) sur la plateforme
 * Abonnement de 15000 GNF/mois - le profil doit être payé et approuvé pour être actif
 */
const serviceSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    unique: true
  },
  metier: {
    type: String,
    required: [true, 'Le métier est requis']
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  photo: {
    type: String,
    required: [true, 'La photo est requise']
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
    default: false
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
  isCertified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Service', serviceSchema);
