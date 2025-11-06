const service = require('./ai.service');

exports.generateLayout = async (req, res) => {
  try {
    const { description, projectId } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const layout = await service.generateLayout(description, { projectId });
    res.json({ layout, message: 'Layout generated successfully!' });
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.generateComponent = async (req, res) => {
  try {
    const { componentType, description } = req.body;
    
    if (!componentType || !description) {
      return res.status(400).json({ error: 'Component type and description are required' });
    }

    const component = await service.generateComponent(componentType, description);
    res.json({ component });
  } catch (error) {
    console.error('AI Component Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.improveLayout = async (req, res) => {
  try {
    const { currentLayout, improvement } = req.body;
    
    if (!currentLayout || !improvement) {
      return res.status(400).json({ error: 'Current layout and improvement are required' });
    }

    const improvedLayout = await service.improveLayout(currentLayout, improvement);
    res.json({ layout: improvedLayout });
  } catch (error) {
    console.error('AI Improvement Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.suggestComponents = async (req, res) => {
  try {
    const { existingComponents, goal } = req.body;
    
    const suggestions = await service.suggestComponents(existingComponents, goal);
    res.json({ suggestions });
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({ error: error.message });
  }
};