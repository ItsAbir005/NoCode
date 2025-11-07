const express = require('express');
const router = express.Router();
const controller = require('./ai.controller');
const auth = require('../../middleware/authMiddleware');

router.post('/generate-layout', auth, controller.generateLayout);
router.post('/generate-component', auth, controller.generateComponent);
router.post('/improve-layout', auth, controller.improveLayout);
router.post('/suggest-components', auth, controller.suggestComponents);

module.exports = router;