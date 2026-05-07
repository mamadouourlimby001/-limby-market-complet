const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.post('/', auth, createReport);

module.exports = router;
