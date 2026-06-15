const Visit = require('../models/Visit');
const crypto = require('crypto');

const trackVisits = async (req, res, next) => {
  try {
    let visitId = null;
    let identifier = null;

    // Déterminer l'identifiant du visiteur
    if (req.user && req.user._id) {
      visitId = req.user._id;
    } else {
      // Créer un identifiant unique pour les visiteurs non authentifiés
      identifier = req.ip || req.connection.remoteAddress || crypto.randomBytes(8).toString('hex');
    }

    // Enregistrer la visite si ce n'est pas une requête API
    const isApiRequest = req.path.startsWith('/api/');
    if (!isApiRequest) {
      const now = new Date();

      if (req.user && req.user._id) {
        const visit = await Visit.findOne({
          utilisateur: req.user._id,
          dateFin: null
        });

        if (visit) {
          visit.pagesVisitees.push({
            page: req.path,
            tempsDebut: now,
            tempsFin: null
          });
          visit.save().catch(err => console.error('Erreur sauvegarde visite:', err));
        } else {
          await Visit.create({
            utilisateur: req.user._id,
            nom: req.user.nom,
            telephone: req.user.telephone,
            pagesVisitees: [{
              page: req.path,
              tempsDebut: now
            }],
            nombrePages: 1
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Erreur trackVisits:', error);
    next();
  }
};

module.exports = trackVisits;
