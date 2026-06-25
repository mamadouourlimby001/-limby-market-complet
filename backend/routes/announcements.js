const express = require('express');
const router = express.Router();
const { getAnnouncements, getAnnouncement, createAnnouncement, deleteAnnouncement, unlockContact, toggleDisponibilite } = require('../controllers/announcementController');
const auth = require('../middleware/auth');
const phoneFilter = require('../middleware/phoneFilter');

router.get('/', auth.optional, getAnnouncements);
router.get('/:id', auth.optional, getAnnouncement);
router.post('/', auth, phoneFilter, createAnnouncement);
router.put('/:id/disponibilite', auth, toggleDisponibilite);
router.delete('/:id', auth, deleteAnnouncement);
router.post('/:id/unlock-contact', auth, unlockContact);

module.exports = router;
