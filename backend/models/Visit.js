const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  visitorId: {
    type: String,
    default: null // ID unique pour les visiteurs non authentifiés
  },
  nom: String,
  telephone: String,
  pays: { type: String, default: null },
  region: { type: String, default: null },
  ville: { type: String, default: null },
  pagesVisitees: [
    {
      page: String,
      tempsDebut: { type: Date, default: Date.now },
      tempsFin: Date,
      duree: Number
    }
  ],
  dateDebut: { type: Date, default: Date.now },
  dateFin: Date,
  dureeTotale: { type: Number, default: 0 },
  nombrePages: { type: Number, default: 0 }
}, { timestamps: true });

// TTL Index : les documents sont supprimés après 86400 secondes (24h)
visitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Visit', visitSchema);
