const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, deleteProduct, unlockContact, toggleDisponibilite } = require('../controllers/productController');
const auth = require('../middleware/auth');
const phoneFilter = require('../middleware/phoneFilter');

// Middleware optionnel pour récupérer l'utilisateur sans bloquer
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const User = require('../models/User');
      req.user = await User.findById(decoded.id).select('-motDePasse');
    }
  } catch (e) { /* ignore */ }
  next();
};

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);
router.post('/', auth, phoneFilter, createProduct);
router.put('/:id/disponibilite', auth, toggleDisponibilite);
router.delete('/:id', auth, deleteProduct);
router.post('/:id/unlock-contact', auth, unlockContact);

module.exports = router;
