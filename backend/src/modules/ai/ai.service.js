const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', temperature: 0.7 });
const COMPONENT_TYPES = {
  Button: { hasText: true, hasColor: true, hasSize: true },
  Text: { hasText: true, hasColor: true, fontSize: true },
  Input: { hasPlaceholder: true, hasValidation: true },
  Container: { hasChildren: true, hasLayout: true },
  Image: { hasSrc: true, hasAlt: true },
  Card: { hasTitle: true, hasContent: true },
  Table: { hasColumns: true, hasRows: true },
  Navbar: { hasLinks: true, hasLogo: true },
  Alert: { hasType: true, hasMessage: true },
  Modal: { hasTitle: true, hasContent: true, hasActions: true },
};
exports.generateComponents = async (prompt, existingComponents = []) => {
  try {
    const systemPrompt = `You are a UI component generator. Convert natural language descriptions into JSON component definitions.

Available component types: ${Object.keys(COMPONENT_TYPES).join(', ')}

Component structure:
{
  "id": "unique-id",
  "type": "ComponentType",
  "x": number (0-924),
  "y": number (0-500),
  "width": number,
  "height": number,
  ... type-specific properties
}

Common properties by type:
- Button: { color, text, textColor, fontSize }
- Text: { text, color, fontSize }
- Input: { placeholder, borderColor, backgroundColor }
- Container: { backgroundColor, border, borderRadius }
- Card: { bg, border, borderRadius, title, content }
- Navbar: { backgroundColor, color, height }
- Alert: { backgroundColor, border, text, borderRadius }

Rules:
1. Return ONLY valid JSON array of components
2. Position components logically (top to bottom, left to right)
3. Use appropriate sizes (buttons: 120x40, inputs: 200x40, etc.)
4. Generate unique IDs using timestamp
5. Use good color schemes (indigo/blue for primary, gray for neutral)
6. Space components apart (at least 20px)

User request: "${prompt}"

${existingComponents.length > 0 ? `Existing components count: ${existingComponents.length}` : ''}

Return ONLY the JSON array, no markdown or explanation.`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();
    let jsonText = response.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
    }
    const components = JSON.parse(jsonText);
    const validatedComponents = components.map((comp, index) => ({
      ...comp,
      id: `${comp.type.toLowerCase()}-${Date.now()}-${index}`,
      x: Math.min(Math.max(0, comp.x || 50), 924),
      y: Math.min(Math.max(0, comp.y || 50), 500),
    }));

    return validatedComponents;
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw new Error('Failed to generate components with AI');
  }
};

// Get suggestions for selected component
exports.getSuggestions = async (component, allComponents = []) => {
  try {
    const prompt = `Analyze this UI component and provide 3-5 actionable suggestions to improve it.

Component:
Type: ${component.type}
Properties: ${JSON.stringify(component, null, 2)}

Context: ${allComponents.length} other components on the page

Provide suggestions as a JSON array of strings. Focus on:
- Accessibility improvements
- Visual design enhancements
- UX best practices
- Common patterns for this component type

Return ONLY a JSON array of strings, no explanation.
Example: ["Add hover effect", "Increase padding", "Add icon"]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let jsonText = response.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
    }

    const suggestions = JSON.parse(jsonText);
    return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
  } catch (error) {
    console.error('Suggestions error:', error);
    return [
      'Increase font size for better readability',
      'Add spacing around the component',
      'Consider adding a shadow for depth'
    ];
  }
};

// Improve component based on instruction
exports.improveComponent = async (component, instruction) => {
  try {
    const prompt = `Improve this component based on the instruction.

Current component:
${JSON.stringify(component, null, 2)}

Instruction: "${instruction}"

Return the improved component as JSON with the same structure but updated properties.
Only modify properties relevant to the instruction.
Return ONLY the JSON object, no explanation.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let jsonText = response.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
    }

    const improved = JSON.parse(jsonText);
    return { ...component, ...improved, id: component.id };
  } catch (error) {
    console.error('Improvement error:', error);
    throw new Error('Failed to improve component');
  }
};

// Generate workflow/automation
exports.generateWorkflow = async (description, components = []) => {
  try {
    const prompt = `Create a workflow/automation based on this description.

Description: "${description}"

Available components: ${components.map(c => `${c.type} (${c.id})`).join(', ')}

Return a JSON workflow with this structure:
{
  "name": "Workflow name",
  "description": "What it does",
  "trigger": { "type": "click|submit|load", "componentId": "id" },
  "actions": [
    { "type": "action-type", "target": "component-id", "params": {} }
  ]
}

Action types: show, hide, setValue, validate, submit, navigate
Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let jsonText = response.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Workflow generation error:', error);
    throw new Error('Failed to generate workflow');
  }
};
exports.generateWorkflowFromPrompt = async (prompt, components = []) => {
  try {
    const systemPrompt = `You are a workflow automation expert. Convert natural language descriptions into workflow JSON definitions.

Available components: ${components.map(c => `${c.type} (${c.id})`).join(', ')}

Workflow structure:
{
  "name": "Workflow name",
  "description": "What it does",
  "trigger": {
    "type": "click|submit|load",
    "componentId": "component-id" // required for click/submit, omit for load
  },
  "actions": [
    {
      "type": "show|hide|setValue|validate|navigate|alert",
      "target": "component-id", // required for show/hide/setValue/validate
      "params": {} // optional parameters
    }
  ]
}

Action types explained:
- show: Make a component visible (requires target)
- hide: Hide a component (requires target)
- setValue: Set a component's value (requires target and params.value)
- validate: Validate input field (requires target)
- navigate: Navigate to path (requires params.path)
- alert: Show alert message (requires params.message)

Examples:

User: "When submit button is clicked, validate the email input and show success message"
Response:
{
  "name": "Form Validation",
  "description": "Validate email and show success",
  "trigger": {
    "type": "click",
    "componentId": "button-123"
  },
  "actions": [
    {
      "type": "validate",
      "target": "input-456"
    },
    {
      "type": "alert",
      "params": {
        "message": "Form submitted successfully!"
      }
    }
  ]
}

User: "On page load, hide the login form"
Response:
{
  "name": "Hide Login on Load",
  "description": "Hide login form when page loads",
  "trigger": {
    "type": "load"
  },
  "actions": [
    {
      "type": "hide",
      "target": "container-789"
    }
  ]
}

User request: "${prompt}"

Return ONLY a valid JSON workflow object, no markdown or explanation.`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();

    let jsonText = response.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
    }

    const workflow = JSON.parse(jsonText);

    // Add unique ID
    workflow.id = `workflow-${Date.now()}`;

    // Validate workflow structure
    if (!workflow.name || !workflow.trigger || !workflow.actions) {
      throw new Error('Invalid workflow structure');
    }

    return workflow;
  } catch (error) {
    console.error('Workflow generation error:', error);
    throw new Error('Failed to generate workflow: ' + error.message);
  }
};

// Generate multiple workflow suggestions
exports.suggestWorkflows = async (components = []) => {
  try {
    const prompt = `Analyze these UI components and suggest 3-5 useful workflows.

Components: ${components.map(c => `${c.type} (${c.id})`).join(', ')}

Suggest workflows that would be useful for these components. Focus on:
- Form validation and submission
- Component visibility toggling
- User interactions
- Navigation flows
- Data validation

Return a JSON array of workflow objects. Each workflow should have:
- name: descriptive name
- description: what it does
- trigger: { type, componentId }
- actions: array of actions

Return ONLY a JSON array, no explanation.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let jsonText = response.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?/g, '');
    }

    const workflows = JSON.parse(jsonText);

    // Add unique IDs
    return workflows.map((workflow, index) => ({
      ...workflow,
      id: `workflow-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error('Workflow suggestions error:', error);
    return [];
  }
};