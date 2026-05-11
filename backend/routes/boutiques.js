const express = require('express');
const router = express.Router();
const { getBoutiques, getBoutique, createBoutique, addBoutiqueProduct, deleteBoutiqueProduct, getMyBoutique } = require('../controllers/boutiqueController');
const { getBoutiqueStats, resetBoutiqueStats } = require('../controllers/boutiqueStatsController');
const auth = require('../middleware/auth');

router.get('/my-boutique', auth, getMyBoutique);
router.get('/stats/bilan', auth, getBoutiqueStats);
router.get('/', getBoutiques);
router.get('/:id', getBoutique);
router.post('/', auth, createBoutique);
router.post('/:id/products', auth, addBoutiqueProduct);
router.delete('/:id/products/:productId', auth, deleteBoutiqueProduct);
router.put('/stats/reset', auth, resetBoutiqueStats);

module.exports = router;
