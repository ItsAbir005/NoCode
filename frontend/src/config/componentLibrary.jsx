// frontend/src/config/componentLibrary.jsx
export const COMPONENT_LIBRARY = [
  {
    id: 'button',
    name: 'Button',
    icon: '🔘',
    category: 'basic',
    description: 'Clickable button element',
    defaultProps: {
      text: 'Click me',
      variant: 'primary', // primary, secondary, outline
      size: 'md', // sm, md, lg
      disabled: false
    },
    propTypes: {
      text: { type: 'string', label: 'Button Text' },
      variant: { type: 'select', label: 'Variant', options: ['primary', 'secondary', 'outline'] },
      size: { type: 'select', label: 'Size', options: ['sm', 'md', 'lg'] },
      disabled: { type: 'boolean', label: 'Disabled' }
    }
  },
  {
    id: 'text',
    name: 'Text',
    icon: '📝',
    category: 'basic',
    description: 'Plain text element',
    defaultProps: {
      content: 'Text content',
      size: 'base', // sm, base, lg, xl, 2xl
      color: '#000000',
      bold: false,
      italic: false,
      tag: 'p' // p, span, div
    },
    propTypes: {
      content: { type: 'textarea', label: 'Content' },
      size: { type: 'select', label: 'Size', options: ['sm', 'base', 'lg', 'xl', '2xl'] },
      color: { type: 'color', label: 'Color' },
      bold: { type: 'boolean', label: 'Bold' },
      italic: { type: 'boolean', label: 'Italic' },
      tag: { type: 'select', label: 'HTML Tag', options: ['p', 'span', 'div'] }
    }
  },
  {
    id: 'heading',
    name: 'Heading',
    icon: '🔤',
    category: 'basic',
    description: 'Heading text (H1-H6)',
    defaultProps: {
      content: 'Heading',
      level: 1, // 1-6
      size: '2xl'
    },
    propTypes: {
      content: { type: 'string', label: 'Content' },
      level: { type: 'select', label: 'Level', options: [1, 2, 3, 4, 5, 6] },
      size: { type: 'select', label: 'Size', options: ['xl', '2xl', '3xl', '4xl'] }
    }
  },
  {
    id: 'image',
    name: 'Image',
    icon: '🖼️',
    category: 'basic',
    description: 'Image element',
    defaultProps: {
      src: '',
      alt: 'Image',
      width: '100%',
      height: 'auto'
    },
    propTypes: {
      src: { type: 'string', label: 'Image URL' },
      alt: { type: 'string', label: 'Alt Text' },
      width: { type: 'string', label: 'Width' },
      height: { type: 'string', label: 'Height' }
    }
  },
  {
    id: 'icon',
    name: 'Icon',
    icon: '⭐',
    category: 'basic',
    description: 'Icon element',
    defaultProps: {
      name: 'check',
      size: 6,
      color: '#000000'
    },
    propTypes: {
      name: { type: 'string', label: 'Icon Name' },
      size: { type: 'number', label: 'Size' },
      color: { type: 'color', label: 'Color' }
    }
  },
  {
    id: 'divider',
    name: 'Divider',
    icon: '➖',
    category: 'basic',
    description: 'Horizontal line divider',
    defaultProps: {
      style: 'solid',
      color: '#e5e7eb',
      thickness: 1
    },
    propTypes: {
      style: { type: 'select', label: 'Style', options: ['solid', 'dashed', 'dotted'] },
      color: { type: 'color', label: 'Color' },
      thickness: { type: 'number', label: 'Thickness' }
    }
  },

  // ==========================================
  // FORM COMPONENTS
  // ==========================================
  {
    id: 'input',
    name: 'Input',
    icon: '📥',
    category: 'form',
    description: 'Text input field',
    defaultProps: {
      type: 'text',
      placeholder: 'Enter text',
      label: 'Input Label',
      required: false,
      disabled: false
    },
    propTypes: {
      type: { type: 'select', label: 'Type', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
      placeholder: { type: 'string', label: 'Placeholder' },
      label: { type: 'string', label: 'Label' },
      required: { type: 'boolean', label: 'Required' },
      disabled: { type: 'boolean', label: 'Disabled' }
    }
  },
  {
    id: 'textarea',
    name: 'Textarea',
    icon: '📄',
    category: 'form',
    description: 'Multi-line text input',
    defaultProps: {
      placeholder: 'Enter text',
      label: 'Textarea Label',
      rows: 4,
      required: false
    },
    propTypes: {
      placeholder: { type: 'string', label: 'Placeholder' },
      label: { type: 'string', label: 'Label' },
      rows: { type: 'number', label: 'Rows' },
      required: { type: 'boolean', label: 'Required' }
    }
  },
  {
    id: 'select',
    name: 'Select',
    icon: '🔽',
    category: 'form',
    description: 'Dropdown select',
    defaultProps: {
      label: 'Select Label',
      options: ['Option 1', 'Option 2', 'Option 3'],
      placeholder: 'Choose an option',
      required: false
    },
    propTypes: {
      label: { type: 'string', label: 'Label' },
      options: { type: 'array', label: 'Options' },
      placeholder: { type: 'string', label: 'Placeholder' },
      required: { type: 'boolean', label: 'Required' }
    }
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    icon: '☑️',
    category: 'form',
    description: 'Checkbox input',
    defaultProps: {
      label: 'Checkbox Label',
      checked: false,
      disabled: false
    },
    propTypes: {
      label: { type: 'string', label: 'Label' },
      checked: { type: 'boolean', label: 'Checked' },
      disabled: { type: 'boolean', label: 'Disabled' }
    }
  },
  {
    id: 'radio',
    name: 'Radio',
    icon: '🔘',
    category: 'form',
    description: 'Radio button input',
    defaultProps: {
      label: 'Radio Label',
      options: ['Option 1', 'Option 2'],
      selected: 0
    },
    propTypes: {
      label: { type: 'string', label: 'Label' },
      options: { type: 'array', label: 'Options' },
      selected: { type: 'number', label: 'Selected Index' }
    }
  },
  {
    id: 'form',
    name: 'Form',
    icon: '📋',
    category: 'form',
    description: 'Form container',
    defaultProps: {
      method: 'POST',
      action: '/submit',
      submitText: 'Submit'
    },
    propTypes: {
      method: { type: 'select', label: 'Method', options: ['POST', 'GET'] },
      action: { type: 'string', label: 'Action URL' },
      submitText: { type: 'string', label: 'Submit Button Text' }
    }
  },

  // ==========================================
  // LAYOUT COMPONENTS
  // ==========================================
  {
    id: 'container',
    name: 'Container',
    icon: '📦',
    category: 'layout',
    description: 'Container for other components',
    defaultProps: {
      padding: '24px',
      backgroundColor: 'transparent',
      maxWidth: '100%'
    },
    propTypes: {
      padding: { type: 'string', label: 'Padding' },
      backgroundColor: { type: 'color', label: 'Background Color' },
      maxWidth: { type: 'string', label: 'Max Width' }
    }
  },
  {
    id: 'grid',
    name: 'Grid',
    icon: '⊞',
    category: 'layout',
    description: 'Grid layout container',
    defaultProps: {
      columns: 2,
      gap: '16px',
      rows: 1
    },
    propTypes: {
      columns: { type: 'number', label: 'Columns' },
      gap: { type: 'string', label: 'Gap' },
      rows: { type: 'number', label: 'Rows' }
    }
  },
  {
    id: 'flexbox',
    name: 'Flexbox',
    icon: '↔️',
    category: 'layout',
    description: 'Flexible box layout',
    defaultProps: {
      direction: 'row', // row, column
      justify: 'flex-start', // flex-start, center, flex-end, space-between
      align: 'flex-start', // flex-start, center, flex-end, stretch
      gap: '16px'
    },
    propTypes: {
      direction: { type: 'select', label: 'Direction', options: ['row', 'column'] },
      justify: { type: 'select', label: 'Justify', options: ['flex-start', 'center', 'flex-end', 'space-between'] },
      align: { type: 'select', label: 'Align', options: ['flex-start', 'center', 'flex-end', 'stretch'] },
      gap: { type: 'string', label: 'Gap' }
    }
  },
  {
    id: 'spacer',
    name: 'Spacer',
    icon: '⬜',
    category: 'layout',
    description: 'Vertical spacing',
    defaultProps: {
      height: '20px'
    },
    propTypes: {
      height: { type: 'string', label: 'Height' }
    }
  },
  {
    id: 'card',
    name: 'Card',
    icon: '🃏',
    category: 'layout',
    description: 'Card container with shadow',
    defaultProps: {
      title: 'Card Title',
      content: 'Card content goes here',
      padding: '24px'
    },
    propTypes: {
      title: { type: 'string', label: 'Title' },
      content: { type: 'textarea', label: 'Content' },
      padding: { type: 'string', label: 'Padding' }
    }
  },

  // ==========================================
  // NAVIGATION COMPONENTS
  // ==========================================
  {
    id: 'navbar',
    name: 'Navbar',
    icon: '🧭',
    category: 'navigation',
    description: 'Navigation bar',
    defaultProps: {
      brand: 'Brand',
      links: ['Home', 'About', 'Contact'],
      backgroundColor: '#ffffff'
    },
    propTypes: {
      brand: { type: 'string', label: 'Brand Name' },
      links: { type: 'array', label: 'Navigation Links' },
      backgroundColor: { type: 'color', label: 'Background Color' }
    }
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    icon: '🍞',
    category: 'navigation',
    description: 'Breadcrumb navigation',
    defaultProps: {
      items: ['Home', 'Products', 'Details']
    },
    propTypes: {
      items: { type: 'array', label: 'Breadcrumb Items' }
    }
  },
  {
    id: 'tabs',
    name: 'Tabs',
    icon: '📑',
    category: 'navigation',
    description: 'Tab navigation',
    defaultProps: {
      tabs: ['Tab 1', 'Tab 2', 'Tab 3'],
      activeTab: 0
    },
    propTypes: {
      tabs: { type: 'array', label: 'Tab Names' },
      activeTab: { type: 'number', label: 'Active Tab Index' }
    }
  },
  {
    id: 'footer',
    name: 'Footer',
    icon: '⬇️',
    category: 'navigation',
    description: 'Page footer',
    defaultProps: {
      content: '© 2024 Your Company. All rights reserved.',
      backgroundColor: '#1f2937'
    },
    propTypes: {
      content: { type: 'string', label: 'Footer Text' },
      backgroundColor: { type: 'color', label: 'Background Color' }
    }
  },

  // ==========================================
  // DATA DISPLAY COMPONENTS
  // ==========================================
  {
    id: 'table',
    name: 'Table',
    icon: '📊',
    category: 'data',
    description: 'Data table',
    defaultProps: {
      columns: ['Column 1', 'Column 2', 'Column 3'],
      rows: []
    },
    propTypes: {
      columns: { type: 'array', label: 'Column Names' },
      rows: { type: 'array', label: 'Table Rows' }
    }
  },
  {
    id: 'list',
    name: 'List',
    icon: '📃',
    category: 'data',
    description: 'Bulleted or numbered list',
    defaultProps: {
      items: ['Item 1', 'Item 2', 'Item 3'],
      ordered: false
    },
    propTypes: {
      items: { type: 'array', label: 'List Items' },
      ordered: { type: 'boolean', label: 'Numbered List' }
    }
  },
  {
    id: 'badge',
    name: 'Badge',
    icon: '🏷️',
    category: 'data',
    description: 'Small status badge',
    defaultProps: {
      text: 'Badge',
      color: 'blue' // blue, green, red, yellow, gray
    },
    propTypes: {
      text: { type: 'string', label: 'Badge Text' },
      color: { type: 'select', label: 'Color', options: ['blue', 'green', 'red', 'yellow', 'gray'] }
    }
  },
  {
    id: 'alert',
    name: 'Alert',
    icon: '⚠️',
    category: 'data',
    description: 'Alert/notification box',
    defaultProps: {
      title: 'Alert Title',
      message: 'Alert message goes here',
      type: 'info' // info, success, warning, error
    },
    propTypes: {
      title: { type: 'string', label: 'Title' },
      message: { type: 'textarea', label: 'Message' },
      type: { type: 'select', label: 'Type', options: ['info', 'success', 'warning', 'error'] }
    }
  }
];

// Group components by category
export const COMPONENT_CATEGORIES = {
  basic: 'Basic Components',
  form: 'Form Components',
  layout: 'Layout Components',
  navigation: 'Navigation',
  data: 'Data Display'
};

// Get components by category
export const getComponentsByCategory = (category) => {
  return COMPONENT_LIBRARY.filter(c => c.category === category);
};

// Get component by ID
export const getComponentById = (id) => {
  return COMPONENT_LIBRARY.find(c => c.id === id);
};

// Get all categories
export const getAllCategories = () => {
  return Object.keys(COMPONENT_CATEGORIES);
};

export default COMPONENT_LIBRARY;