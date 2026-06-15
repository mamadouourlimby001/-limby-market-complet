const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null si l'utilisateur n'a pas de compte
  },
  identifier: {
    type: String,
    default: null // ID unique pour les visiteurs non authentifiés
  },
  nom: String, // Nom de l'utilisateur (s'il a un compte)
  telephone: String, // Téléphone de l'utilisateur (s'il a un compte)
  pagesVisitees: [
    {
      page: String, // URL ou nom de la page
      tempsDebut: Date,
      tempsFin: Date,
      duree: Number // en secondes
    }
  ],
  dateDebut: { type: Date, default: Date.now },
  dateFin: Date,
  dureeTotale: Number, // en secondes
  nombrePages: { type: Number, default: 0 }
}, { timestamps: true });

// Index pour nettoyer les visites après 24h
visitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Visit', visitSchema);
