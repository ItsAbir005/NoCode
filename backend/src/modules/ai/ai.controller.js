const service = require('./ai.service');

exports.generateComponents = async (req, res) => {
  try {
    const { prompt, existingComponents } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const components = await service.generateComponents(prompt, existingComponents);
    
    res.json({ 
      success: true,
      components,
      message: 'Components generated successfully'
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate components'
    });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { component, allComponents } = req.body;
    
    if (!component) {
      return res.status(400).json({ error: 'Component data is required' });
    }

    const suggestions = await service.getSuggestions(component, allComponents);
    
    res.json({ 
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get suggestions'
    });
  }
};

exports.improveComponent = async (req, res) => {
  try {
    const { component, instruction } = req.body;
    
    if (!component || !instruction) {
      return res.status(400).json({ 
        error: 'Component and instruction are required' 
      });
    }

    const improved = await service.improveComponent(component, instruction);
    
    res.json({ 
      success: true,
      component: improved
    });
  } catch (error) {
    console.error('Improvement error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to improve component'
    });
  }
};

exports.generateWorkflow = async (req, res) => {
  try {
    const { description, components } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const workflow = await service.generateWorkflow(description, components);
    
    res.json({ 
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Workflow generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate workflow'
    });
  }
};

exports.generateWorkflowFromPrompt = async (req, res) => {
  try {
    const { prompt, components = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const workflow = await service.generateWorkflowFromPrompt(prompt, components);

    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Workflow generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.suggestWorkflows = async (req, res) => {
  try {
    const { components = [] } = req.body;

    const workflows = await service.suggestWorkflows(components);

    res.json({
      success: true,
      workflows
    });
  } catch (error) {
    console.error('Workflow suggestions error:', error);
    res.status(500).json({
      success: false,
      workflows: []
    });
  }
};
