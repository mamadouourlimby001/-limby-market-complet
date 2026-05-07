const mongoose = require('mongoose');

/**
 * Modèle Announcement
 * Représente une annonce d'emploi/offre de travail
 * Le champ contact est masqué par défaut et nécessite 1 crédit pour être débloqué
 */
const announcementSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est requis']
  },
  villeDeTravail: {
    type: String,
    required: [true, 'La ville de travail est requise']
  },
  quartier: {
    type: String,
    required: [true, 'Le quartier est requis']
  },
  salaireMensuel: {
    type: Number,
    required: [true, 'Le salaire mensuel est requis']
  },
  dateLimite: {
    type: Date,
    required: [true, 'La date limite est requise']
  },
  entreprise: {
    type: String,
    required: [true, "Le nom de l'entreprise est requis"]
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  photos: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 3;
      },
      message: 'Maximum 3 photos autorisées'
    }
  },
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    type: String,
    required: [true, 'Le contact est requis']
  },
  statut: {
    type: String,
    enum: ['actif', 'supprimé'],
    default: 'actif'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Announcement', announcementSchema);
