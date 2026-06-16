const express = require('express');
const router = express.Router();
const { getLocations, getLocation, createLocation, deleteLocation, unlockContact, toggleDisponibilite } = require('../controllers/locationController');
const auth = require('../middleware/auth');

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

router.get('/', optionalAuth, getLocations);
router.get('/:id', optionalAuth, getLocation);
router.post('/', auth, createLocation);
router.put('/:id/disponibilite', auth, toggleDisponibilite);
router.delete('/:id', auth, deleteLocation);
router.post('/:id/unlock-contact', auth, unlockContact);

module.exports = router;
