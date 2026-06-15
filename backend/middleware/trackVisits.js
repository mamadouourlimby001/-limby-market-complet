const Visit = require('../models/Visit');
const crypto = require('crypto');

const trackVisits = async (req, res, next) => {
  try {
    // Ne tracker que les utilisateurs authentifiés
    if (!req.user || !req.user._id) {
      return next();
    }

    const now = new Date();

    // Chercher une visite ouverte pour cet utilisateur
    const visit = await Visit.findOne({
      utilisateur: req.user._id,
      dateFin: null
    }).catch(err => {
      console.error('Erreur recherche visite:', err);
      return null;
    });

    if (visit) {
      // Ajouter la page à la visite existante
      visit.pagesVisitees.push({
        page: req.path,
        tempsDebut: now
      });
      visit.save().catch(err => console.error('Erreur mise à jour visite:', err));
    } else {
      // Créer une nouvelle visite
      Visit.create({
        utilisateur: req.user._id,
        nom: req.user.nom,
        telephone: req.user.telephone,
        pagesVisitees: [{
          page: req.path,
          tempsDebut: now
        }],
        dateDebut: now,
        nombrePages: 1
      }).catch(err => console.error('Erreur création visite:', err));
    }

    next();
  } catch (error) {
    console.error('Erreur trackVisits:', error);
    next();
  }
};

module.exports = trackVisits;
