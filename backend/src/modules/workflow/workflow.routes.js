// backend/src/modules/workflow/workflow.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../../middleware/authMiddleware');

// Get all workflows for a project
router.get('/projects/:projectId/workflows', auth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    const workflows = await prisma.workflow.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(workflows);
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new workflow
router.post('/projects/:projectId/workflow', auth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { name, trigger, actions } = req.body;
    
    // Validate input
    if (!name || !trigger || !actions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const workflow = await prisma.workflow.create({
      data: {
        name,
        projectId,
        trigger,
        actions
      }
    });
    
    res.json(workflow);
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update workflow
router.put('/workflows/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, trigger, actions } = req.body;
    
    const workflow = await prisma.workflow.update({
      where: { id },
      data: { name, trigger, actions }
    });
    
    res.json(workflow);
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete workflow
router.delete('/workflows/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await prisma.workflow.delete({
      where: { id }
    });
    
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;