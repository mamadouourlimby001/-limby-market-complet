const express = require('express');
const router = express.Router();
const { requestCredits, getMyHistory, subscriptionRequest } = require('../controllers/creditController');
const auth = require('../middleware/auth');

router.post('/request', auth, requestCredits);
router.get('/my-history', auth, getMyHistory);
router.post('/subscription-request', auth, subscriptionRequest);

module.exports = router;
