const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateLayout = async (description, projectContext = {}) => {
  // Add validation
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file');
  }

  const systemPrompt = `You are an expert UI/UX designer for a no-code platform. 
Generate a React Flow layout configuration based on user descriptions.

Return ONLY valid JSON in this exact format:
{
  "nodes": [
    {
      "id": "unique_id",
      "type": "default",
      "data": {
        "label": "Component Name",
        "type": "Button|Input|Text|Image|Form|Container|Table|Chart",
        "props": {}
      },
      "position": { "x": 100, "y": 100 },
      "style": { "background": "#EFF6FF", "border": "2px solid #3B82F6", "borderRadius": "8px", "padding": "12px" }
    }
  ],
  "edges": []
}

Component Types:
- Button: { text: string, color: string, size: "medium" }
- Input: { placeholder: string, type: "text", label: string }
- Text: { content: string, fontSize: "16", color: "#000000" }
- Image: { url: string, alt: string }
- Form: { title: string, fields: [] }
- Container: { width: "100%", height: "auto", background: "#F3F4F6" }

Generate 3-5 components arranged logically.`;

  try {
    console.log('🤖 Calling OpenAI API...');
    console.log('📝 Description:', description);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: description },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    console.log('✅ OpenAI Response received');
    const layout = JSON.parse(response.choices[0].message.content);
    console.log('✅ Layout parsed:', layout);
    
    return layout;
  } catch (error) {
    console.error('❌ OpenAI Error Details:', {
      message: error.message,
      status: error.status,
      type: error.type,
    });

    // Better error messages
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file');
    } else if (error.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again in a moment');
    } else if (error.status === 500) {
      throw new Error('OpenAI service error. Please try again');
    } else {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
};

// Keep other exports the same...
exports.generateComponent = async (componentType, description) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const systemPrompt = `Generate component properties. Return JSON: { "props": {} }`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: description },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('❌ Component generation error:', error);
    throw new Error(`Failed to generate component: ${error.message}`);
  }
};

exports.improveLayout = async (currentLayout, improvement) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const systemPrompt = `Improve the layout based on feedback. Return complete modified layout JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Current: ${JSON.stringify(currentLayout)}\n\nImprovement: ${improvement}` 
        },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('❌ Layout improvement error:', error);
    throw new Error(`Failed to improve layout: ${error.message}`);
  }
};

exports.suggestComponents = async (existingComponents, goal) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const systemPrompt = `Suggest useful components. Return JSON: { "suggestions": [] }`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Existing: ${JSON.stringify(existingComponents)}\nGoal: ${goal}` },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('❌ Suggestion error:', error);
    throw new Error(`Failed to suggest components: ${error.message}`);
  }
};