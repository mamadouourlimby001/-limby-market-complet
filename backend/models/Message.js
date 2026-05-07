const mongoose = require('mongoose');

/**
 * Modèle Message
 * Représente une conversation de messagerie entre utilisateurs et administrateurs
 */
const messageSchema = new mongoose.Schema({
  // Expéditeur du message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type d'expéditeur : 'user' ou 'admin'
  senderType: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },

  // Destinataire(s) du message
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Pour les messages de groupe (message à tous les utilisateurs)
  isGroupMessage: {
    type: Boolean,
    default: false
  },

  // Contenu du message
  contenu: {
    type: String,
    required: true,
    trim: true
  },

  // Conversation parente (pour les réponses)
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },

  // Type de message : 'initial', 'reply'
  messageType: {
    type: String,
    enum: ['initial', 'reply'],
    default: 'initial'
  },

  // Statut de lecture pour chaque destinataire
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: null
    }
  }],

  // Messages supprimés par
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

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
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipients: 1, createdAt: -1 });
messageSchema.index({ senderType: 1, createdAt: -1 });
messageSchema.index({ parentMessage: 1 });

// Middleware pour mettre à jour updatedAt
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Message', messageSchema);
