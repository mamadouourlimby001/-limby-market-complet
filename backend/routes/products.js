const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, deleteProduct, unlockContact, toggleDisponibilite } = require('../controllers/productController');
const auth = require('../middleware/auth');
const phoneFilter = require('../middleware/phoneFilter');

router.get('/', auth.optional, getProducts);
router.get('/:id', auth.optional, getProduct);
router.post('/', auth, phoneFilter, createProduct);
router.put('/:id/disponibilite', auth, toggleDisponibilite);
router.delete('/:id', auth, deleteProduct);
router.post('/:id/unlock-contact', auth, unlockContact);

module.exports = router;
