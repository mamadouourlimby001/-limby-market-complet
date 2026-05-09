const mongoose = require('mongoose');

/**
 * Modèle BoutiqueMessage
 * Messages entre utilisateurs et propriétaires de boutiques
 * Séparé du système Message pour ne pas casser la messagerie admin
 */
const boutiqueMessageSchema = new mongoose.Schema({
  // Boutique destinataire
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },

  // Expéditeur (utilisateur ou admin boutique)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type d'expéditeur: 'acheteur' ou 'boutique'
  senderType: {
    type: String,
    enum: ['acheteur', 'boutique'],
    required: true
  },

  // Destinataire (utilisateur ou propriétaire boutique)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Contenu du message
  contenu: {
    type: String,
    required: true
  },

  // Message parent (pour les réponses)
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoutiqueMessage',
    default: null
  },

  // Type de message: 'initial' ou 'reply'
  messageType: {
    type: String,
    enum: ['initial', 'reply'],
    default: 'initial'
  },

  // Répliques à ce message
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoutiqueMessage'
  }],

  // Informations de lecture
  readBy: {
    type: Boolean,
    default: false
  },

  readAt: {
    type: Date,
    default: null
  },

  // Suppression
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour les recherches fréquentes
boutiqueMessageSchema.index({ boutique: 1, createdAt: -1 });
boutiqueMessageSchema.index({ sender: 1, createdAt: -1 });
boutiqueMessageSchema.index({ recipient: 1, createdAt: -1 });
boutiqueMessageSchema.index({ parentMessage: 1 });
boutiqueMessageSchema.index({ readBy: 1 });

// Middleware pour mettre à jour updatedAt
boutiqueMessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BoutiqueMessage', boutiqueMessageSchema);
