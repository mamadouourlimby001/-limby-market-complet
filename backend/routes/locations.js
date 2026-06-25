const express = require('express');
const router = express.Router();
const { getLocations, getLocation, createLocation, deleteLocation, unlockContact, toggleDisponibilite } = require('../controllers/locationController');
const auth = require('../middleware/auth');

router.get('/', auth.optional, getLocations);
router.get('/:id', auth.optional, getLocation);
router.post('/', auth, createLocation);
router.put('/:id/disponibilite', auth, toggleDisponibilite);
router.delete('/:id', auth, deleteLocation);
router.post('/:id/unlock-contact', auth, unlockContact);

module.exports = router;
