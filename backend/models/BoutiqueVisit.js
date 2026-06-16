const mongoose = require('mongoose');

const boutiqueVisitSchema = new mongoose.Schema({
  boutique: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boutique',
    required: true
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  visitorId: {
    type: String,
    default: null
  },
  nom: String,
  telephone: String,
  pays: { type: String, default: null },
  region: { type: String, default: null },
  ville: { type: String, default: null },
  dateDebut: { type: Date, default: Date.now },
  dateFin: Date,
  dureeTotale: { type: Number, default: 0 }
}, { timestamps: true });

// TTL Index : les documents sont supprimés après 2592000 secondes (30 jours)
boutiqueVisitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('BoutiqueVisit', boutiqueVisitSchema);
