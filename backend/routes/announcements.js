const express = require('express');
const router = express.Router();
const { getAnnouncements, getAnnouncement, createAnnouncement, deleteAnnouncement, unlockContact } = require('../controllers/announcementController');
const auth = require('../middleware/auth');
const phoneFilter = require('../middleware/phoneFilter');

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

router.get('/', optionalAuth, getAnnouncements);
router.get('/:id', optionalAuth, getAnnouncement);
router.post('/', auth, phoneFilter, createAnnouncement);
router.delete('/:id', auth, deleteAnnouncement);
router.post('/:id/unlock-contact', auth, unlockContact);

module.exports = router;
