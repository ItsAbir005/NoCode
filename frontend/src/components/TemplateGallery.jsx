// frontend/src/components/TemplateGallery.jsx
import { useState } from 'react';
import { Search, Plus, Download, Eye, Heart, Star, Zap } from 'lucide-react';

const BUILT_IN_TEMPLATES = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Modern landing page with hero section, features, and CTA',
    category: 'Marketing',
    popularity: 4.8,
    thumbnail: '🚀',
    components: [
      { type: 'Navbar', x: 0, y: 0, width: 1024, height: 60, backgroundColor: '#1f2937', color: '#ffffff' },
      { type: 'Container', x: 100, y: 100, width: 824, height: 400, backgroundColor: '#f3f4f6' },
      { type: 'Text', x: 200, y: 150, width: 600, height: 80, text: 'Welcome to Your Product', fontSize: 48, color: '#1f2937' },
      { type: 'Text', x: 200, y: 250, width: 600, height: 40, text: 'The best solution for your needs', fontSize: 20, color: '#6b7280' },
      { type: 'Button', x: 200, y: 320, width: 150, height: 50, text: 'Get Started', color: '#3b82f6', textColor: '#ffffff', fontSize: 16 }
    ]
  },
  {
    id: 'dashboard',
    name: 'Admin Dashboard',
    description: 'Complete dashboard with sidebar, charts, and data tables',
    category: 'Admin',
    popularity: 4.6,
    thumbnail: '📊',
    components: [
      { type: 'Container', x: 0, y: 0, width: 250, height: 600, backgroundColor: '#1f2937' },
      { type: 'Container', x: 270, y: 20, width: 734, height: 150, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 },
      { type: 'Card', x: 270, y: 190, width: 350, height: 200, bg: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 },
      { type: 'Card', x: 640, y: 190, width: 350, height: 200, bg: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }
    ]
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Professional contact form with validation',
    category: 'Forms',
    popularity: 4.5,
    thumbnail: '📧',
    components: [
      { type: 'Container', x: 200, y: 100, width: 600, height: 500, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 },
      { type: 'Text', x: 230, y: 130, width: 540, height: 40, text: 'Contact Us', fontSize: 32, color: '#1f2937' },
      { type: 'Input', x: 230, y: 190, width: 540, height: 45, placeholder: 'Your Name', borderColor: '#d1d5db', backgroundColor: '#ffffff' },
      { type: 'Input', x: 230, y: 250, width: 540, height: 45, placeholder: 'Email Address', borderColor: '#d1d5db', backgroundColor: '#ffffff' },
      { type: 'Input', x: 230, y: 310, width: 540, height: 120, placeholder: 'Your Message', borderColor: '#d1d5db', backgroundColor: '#ffffff' },
      { type: 'Button', x: 230, y: 450, width: 540, height: 50, text: 'Send Message', color: '#3b82f6', textColor: '#ffffff', fontSize: 16 }
    ]
  },
  {
    id: 'pricing-table',
    name: 'Pricing Table',
    description: '3-tier pricing section with features comparison',
    category: 'Marketing',
    popularity: 4.7,
    thumbnail: '💰',
    components: [
      { type: 'Text', x: 350, y: 50, width: 320, height: 60, text: 'Choose Your Plan', fontSize: 36, color: '#1f2937' },
      { type: 'Card', x: 80, y: 150, width: 280, height: 400, bg: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12 },
      { type: 'Card', x: 380, y: 150, width: 280, height: 400, bg: '#3b82f6', border: 'none', borderRadius: 12 },
      { type: 'Card', x: 680, y: 150, width: 280, height: 400, bg: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12 }
    ]
  },
  {
    id: 'blog-layout',
    name: 'Blog Layout',
    description: 'Blog homepage with article cards and sidebar',
    category: 'Content',
    popularity: 4.4,
    thumbnail: '📝',
    components: [
      { type: 'Navbar', x: 0, y: 0, width: 1024, height: 60, backgroundColor: '#ffffff', color: '#1f2937' },
      { type: 'Container', x: 50, y: 100, width: 650, height: 450, backgroundColor: '#f9fafb' },
      { type: 'Container', x: 720, y: 100, width: 254, height: 450, backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }
    ]
  },
  {
    id: 'ecommerce-product',
    name: 'Product Page',
    description: 'E-commerce product detail page',
    category: 'E-commerce',
    popularity: 4.6,
    thumbnail: '🛒',
    components: [
      { type: 'Container', x: 100, y: 100, width: 400, height: 400, backgroundColor: '#f3f4f6', borderRadius: 8 },
      { type: 'Container', x: 520, y: 100, width: 404, height: 400, backgroundColor: '#ffffff' },
      { type: 'Text', x: 540, y: 120, width: 360, height: 50, text: 'Product Name', fontSize: 28, color: '#1f2937' },
      { type: 'Text', x: 540, y: 180, width: 360, height: 30, text: '$99.99', fontSize: 24, color: '#3b82f6' },
      { type: 'Button', x: 540, y: 420, width: 200, height: 50, text: 'Add to Cart', color: '#3b82f6', textColor: '#ffffff', fontSize: 16 }
    ]
  }
];

export function TemplateGallery({ onUseTemplate, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const categories = ['All', ...new Set(BUILT_IN_TEMPLATES.map(t => t.category))];

  const filteredTemplates = BUILT_IN_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template) => {
    onUseTemplate(template.components);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Template Gallery</h2>
              <p className="text-sm text-gray-600 mt-1">Start with a pre-built template</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-6 h-6 text-gray-600 rotate-45" />
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 transition-all hover:shadow-lg group cursor-pointer"
              >
                <div className="p-4">
                  {/* Thumbnail */}
                  <div className="w-full h-48 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-6xl">{template.thumbnail}</span>
                  </div>

                  {/* Info */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{template.popularity}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {template.components.length} components
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Use
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No templates found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{previewTemplate.name}</h3>
              <button onClick={() => setPreviewTemplate(null)} className="p-2 hover:bg-gray-100 rounded">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="bg-gray-100 rounded-lg p-8 mb-4 flex items-center justify-center" style={{ height: '400px' }}>
              <span className="text-6xl">{previewTemplate.thumbnail}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}