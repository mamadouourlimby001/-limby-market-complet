const express = require('express');
const router = express.Router();
const { getServices, getService, createService, getMyService, updateService, addServicePost, deleteServicePost, createServiceSubscriptionRequest } = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// Routes statiques AVANT les routes dynamiques
router.get('/my-service', auth, getMyService);

// Routes dynamiques APRÈS
router.get('/', getServices);
router.get('/:id', getService);
router.post('/', auth, createService);
router.put('/:id', auth, updateService);
router.post('/:id/posts', auth, addServicePost);
router.delete('/:id/posts/:postId', auth, deleteServicePost);
router.post('/subscription-request', auth, createServiceSubscriptionRequest);

module.exports = router;
