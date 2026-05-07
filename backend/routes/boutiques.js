const express = require('express');
const router = express.Router();
const { getBoutiques, getBoutique, createBoutique, addBoutiqueProduct, deleteBoutiqueProduct } = require('../controllers/boutiqueController');
const auth = require('../middleware/auth');

router.get('/', getBoutiques);
router.get('/:id', getBoutique);
router.post('/', auth, createBoutique);
router.post('/:id/products', auth, addBoutiqueProduct);
router.delete('/:id/products/:productId', auth, deleteBoutiqueProduct);

module.exports = router;
