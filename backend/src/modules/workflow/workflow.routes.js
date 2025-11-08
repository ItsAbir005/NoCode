const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/authMiddleware');

// Get workflows for a project
router.get('/projects/:projectId/workflows', auth, async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: { projectId: parseInt(req.params.projectId) }
    });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create workflow
router.post('/projects/:projectId/workflow', auth, async (req, res) => {
  try {
    const { name, trigger, actions } = req.body;
    const workflow = await prisma.workflow.create({
      data: {
        name,
        projectId: parseInt(req.params.projectId),
        trigger,
        actions
      }
    });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update workflow
router.put('/workflows/:id', auth, async (req, res) => {
  try {
    const { name, trigger, actions } = req.body;
    const workflow = await prisma.workflow.update({
      where: { id: parseInt(req.params.id) },
      data: { name, trigger, actions }
    });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete workflow
router.delete('/workflows/:id', auth, async (req, res) => {
  try {
    await prisma.workflow.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;