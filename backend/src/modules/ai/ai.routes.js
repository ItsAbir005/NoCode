const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const controller = require('./ai.controller');

router.use(authMiddleware);
router.post('/generate', controller.generateComponents);
router.post('/suggestions', controller.getSuggestions);
router.post('/improve', controller.improveComponent);
router.post('/workflow', controller.generateWorkflow);

module.exports = router;