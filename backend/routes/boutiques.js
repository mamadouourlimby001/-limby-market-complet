const express = require('express');
const router = express.Router();
const { getBoutiques, getBoutique, createBoutique, addBoutiqueProduct, deleteBoutiqueProduct, getMyBoutique, toggleProductDisponibilite, updateBoutique, recordBoutiqueVisit, getBoutiqueVisits, deleteBoutiqueVisit, updateOrganisation } = require('../controllers/boutiqueController');
const { getBoutiqueStats, resetBoutiqueStats } = require('../controllers/boutiqueStatsController');
const auth = require('../middleware/auth');

// Routes statiques AVANT les routes dynamiques
router.get('/my-boutique', auth, getMyBoutique);
router.get('/stats/bilan', auth, getBoutiqueStats);
router.put('/stats/reset', auth, resetBoutiqueStats);

// Routes dynamiques APRÈS
router.get('/', getBoutiques);
router.get('/:id', getBoutique);
router.post('/:id/visit', auth, recordBoutiqueVisit);
router.get('/:id/visits', auth, getBoutiqueVisits);
router.post('/', auth, createBoutique);
router.put('/:id', auth, updateBoutique);
router.post('/:id/products', auth, addBoutiqueProduct);
router.delete('/:id/products/:productId', auth, deleteBoutiqueProduct);
router.put('/:id/products/:productId/disponibilite', auth, toggleProductDisponibilite);
router.post('/:id/visits/delete', auth, deleteBoutiqueVisit);
router.put('/:id/organisation', auth, updateOrganisation);

module.exports = router;
