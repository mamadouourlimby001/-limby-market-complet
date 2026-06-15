const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nom: String,
  telephone: String,
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
