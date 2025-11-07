const { GoogleGenerativeAI } = require('@google/generative-ai');

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in .env file!');
  console.log('🔑 Get your free API key: https://aistudio.google.com/app/apikey');
} else {
  console.log('✅ Gemini API Key loaded');
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.8,
    responseMimeType: "application/json",
  }
});

exports.generateLayout = async (description, projectContext = {}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file');
  }

  const prompt = `You are an expert UI/UX designer for a no-code platform. 
Generate a React Flow layout configuration based on this description: "${description}"

Return ONLY valid JSON in this EXACT format (no markdown, no extra text):
{
  "nodes": [
    {
      "id": "unique_id",
      "type": "default",
      "data": {
        "label": "🔘 Component Name",
        "type": "Button",
        "props": {
          "text": "Click Me",
          "color": "#3B82F6",
          "size": "medium"
        }
      },
      "position": {
        "x": 200,
        "y": 100
      },
      "style": {
        "background": "#EFF6FF",
        "border": "2px solid #3B82F6",
        "borderRadius": "8px",
        "padding": "12px"
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "node1_id",
      "target": "node2_id",
      "animated": true
    }
  ]
}

Component Types & Icons:
- Button: "🔘 Button" - props: { text: string, color: string, size: "small|medium|large" }
- Input: "📝 Input Field" - props: { placeholder: string, type: "text|email|password", label: string }
- Text: "📄 Text" - props: { content: string, fontSize: string, color: string }
- Image: "🖼️ Image" - props: { url: string, alt: string }
- Form: "📋 Form" - props: { title: string, fields: [] }
- Container: "📦 Container" - props: { width: string, height: string, background: string }
- Table: "📊 Table" - props: { rows: number, columns: number }
- Chart: "📈 Chart" - props: { type: "bar|line|pie", data: [] }

Style Guidelines (copy these exactly):
- Button: { background: "#EFF6FF", border: "2px solid #3B82F6", borderRadius: "8px", padding: "12px" }
- Input: { background: "#F9FAFB", border: "2px solid #9CA3AF", borderRadius: "8px", padding: "12px" }
- Text: { background: "#FFFBEB", border: "2px solid #F59E0B", borderRadius: "8px", padding: "12px" }
- Image: { background: "#F0FDF4", border: "2px solid #10B981", borderRadius: "8px", padding: "12px" }
- Form: { background: "#FDF2F8", border: "2px solid #EC4899", borderRadius: "8px", padding: "12px" }
- Container: { background: "#F3F4F6", border: "2px solid #6B7280", borderRadius: "8px", padding: "12px" }
- Table: { background: "#EDE9FE", border: "2px solid #8B5CF6", borderRadius: "8px", padding: "12px" }
- Chart: { background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: "8px", padding: "12px" }

Position Guidelines:
- Spread nodes across canvas (x: 100-700, y: 100-600)
- Leave 150-250px spacing between nodes
- Arrange logically (inputs on left, buttons on right)
- Create 3-6 components

Generate a complete, functional layout now.`;

  try {
    console.log('🤖 Calling Gemini API...');
    console.log('📝 Description:', description);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('✅ Gemini Response received');
    console.log('📄 Raw response:', text.substring(0, 200) + '...');

    // Clean the response (remove markdown if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    const layout = JSON.parse(cleanedText);
    console.log('✅ Layout parsed successfully');
    console.log('📊 Nodes:', layout.nodes?.length || 0);
    console.log('🔗 Edges:', layout.edges?.length || 0);
    
    return layout;
  } catch (error) {
    console.error('❌ Gemini Error Details:', {
      message: error.message,
      name: error.name,
    });

    // Better error messages
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file');
    } else if (error.message?.includes('RATE_LIMIT')) {
      throw new Error('Gemini rate limit exceeded. Please try again in a moment');
    } else if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response. Please try again with a different description');
    } else {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
};

exports.generateComponent = async (componentType, description) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `Generate component properties for a ${componentType} based on: "${description}"
Return ONLY valid JSON: { "props": { /* properties */ } }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean response
    let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('❌ Component generation error:', error);
    throw new Error(`Failed to generate component: ${error.message}`);
  }
};

exports.improveLayout = async (currentLayout, improvement) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `Improve this layout based on the feedback.

Current layout:
${JSON.stringify(currentLayout, null, 2)}

Improvement request: "${improvement}"

Return the complete modified layout in the same JSON format. Make sure to keep all existing nodes and edges, just modify them according to the improvement request.`;

  try {
    console.log('🤖 Improving layout with Gemini...');
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean response
    let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const improvedLayout = JSON.parse(cleanedText);
    console.log('✅ Layout improved successfully');
    
    return improvedLayout;
  } catch (error) {
    console.error('❌ Layout improvement error:', error);
    throw new Error(`Failed to improve layout: ${error.message}`);
  }
};

exports.suggestComponents = async (existingComponents, goal) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `Based on existing components and goal, suggest 3-5 additional useful components.

Existing components: ${JSON.stringify(existingComponents)}
Goal: "${goal}"

Return JSON: { "suggestions": [{ "type": "Button", "reason": "why useful", "position": {"x": 100, "y": 100} }] }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Clean response
    let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('❌ Suggestion error:', error);
    throw new Error(`Failed to suggest components: ${error.message}`);
  }
};