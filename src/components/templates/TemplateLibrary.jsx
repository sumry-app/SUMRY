/**
 * Template Library Component
 *
 * Browse, search, and manage IEP goal templates with:
 * - 50+ pre-built templates
 * - Category filtering
 * - Search functionality
 * - Preview templates
 * - Favorite/recent templates
 * - Create custom templates
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Star,
  Clock,
  Plus,
  Eye,
  Copy,
  Download,
  Upload,
  Filter,
  BookOpen,
  Calculator,
  PenTool,
  Target,
  MessageSquare,
  Users,
  Activity,
  TrendingUp,
  FileText,
  ClipboardList,
  X,
  Check,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { cn } from '../../lib/utils';
import {
  templateEngine,
  TEMPLATE_CATEGORIES,
  Template,
} from '../../lib/templateEngine';
import { loadPrebuiltTemplates } from '../../lib/prebuiltTemplates';

// Category icons mapping
const CATEGORY_ICONS = {
  [TEMPLATE_CATEGORIES.READING]: BookOpen,
  [TEMPLATE_CATEGORIES.MATH]: Calculator,
  [TEMPLATE_CATEGORIES.WRITING]: PenTool,
  [TEMPLATE_CATEGORIES.BEHAVIOR]: Target,
  [TEMPLATE_CATEGORIES.COMMUNICATION]: MessageSquare,
  [TEMPLATE_CATEGORIES.SOCIAL_SKILLS]: Users,
  [TEMPLATE_CATEGORIES.MOTOR_SKILLS]: Activity,
  [TEMPLATE_CATEGORIES.TRANSITION]: TrendingUp,
  [TEMPLATE_CATEGORIES.PROGRESS_MONITORING]: ClipboardList,
  [TEMPLATE_CATEGORIES.MEETING_NOTES]: FileText,
  [TEMPLATE_CATEGORIES.REPORTS]: FileText,
  [TEMPLATE_CATEGORIES.CUSTOM]: Plus,
};

// Category display names
const CATEGORY_NAMES = {
  [TEMPLATE_CATEGORIES.READING]: 'Reading',
  [TEMPLATE_CATEGORIES.MATH]: 'Math',
  [TEMPLATE_CATEGORIES.WRITING]: 'Writing',
  [TEMPLATE_CATEGORIES.BEHAVIOR]: 'Behavior',
  [TEMPLATE_CATEGORIES.COMMUNICATION]: 'Communication',
  [TEMPLATE_CATEGORIES.SOCIAL_SKILLS]: 'Social Skills',
  [TEMPLATE_CATEGORIES.MOTOR_SKILLS]: 'Motor Skills',
  [TEMPLATE_CATEGORIES.TRANSITION]: 'Transition',
  [TEMPLATE_CATEGORIES.PROGRESS_MONITORING]: 'Progress Monitoring',
  [TEMPLATE_CATEGORIES.MEETING_NOTES]: 'Meeting Notes',
  [TEMPLATE_CATEGORIES.REPORTS]: 'Reports',
  [TEMPLATE_CATEGORIES.CUSTOM]: 'Custom',
};

/**
 * Template Card Component
 */
function TemplateCard({ template, onUse, onPreview, onFavorite, isFavorite }) {
  const Icon = CATEGORY_ICONS[template.category] || FileText;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {CATEGORY_NAMES[template.category]}
              </CardDescription>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(template.id);
            }}
            className={cn(
              'p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
              isFavorite && 'text-yellow-500'
            )}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {template.description}
        </p>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onUse(template)}
            className="flex-1"
            size="sm"
          >
            <Check className="w-4 h-4 mr-1" />
            Use Template
          </Button>
          <Button
            onClick={() => onPreview(template)}
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Template Preview Modal
 */
function TemplatePreview({ template, onClose, onUse }) {
  if (!template) return null;

  const variables = templateEngine.extractVariables(template.content);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge>{CATEGORY_NAMES[template.category]}</Badge>
            {template.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Template Content */}
            <div>
              <h3 className="font-semibold mb-2">Template Content:</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap text-sm font-mono">
                {template.content}
              </div>
            </div>

            {/* Variables */}
            {variables.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Variables ({variables.length}):</h3>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="font-mono">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <Button onClick={() => onUse(template)} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Template Library Component
 */
export default function TemplateLibrary({
  onSelectTemplate,
  onCreateTemplate,
  className,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  // Initialize templates
  useEffect(() => {
    // Load pre-built templates if not already loaded
    if (templateEngine.getAllTemplates().length === 0) {
      loadPrebuiltTemplates(templateEngine);
    }

    // Get all templates
    setTemplates(templateEngine.getAllTemplates());

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('sumry_template_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(
      'sumry_template_favorites',
      JSON.stringify(Array.from(favorites))
    );
  }, [favorites]);

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by tab
    if (activeTab === 'favorites') {
      filtered = filtered.filter((t) => favorites.has(t.id));
    } else if (activeTab === 'recent') {
      const recentIds = templateEngine.getRecentTemplates().map((t) => t.id);
      filtered = filtered.filter((t) => recentIds.includes(t.id));
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [templates, activeTab, selectedCategory, searchQuery, favorites]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    Object.values(TEMPLATE_CATEGORIES).forEach((category) => {
      counts[category] = templates.filter((t) => t.category === category).length;
    });
    return counts;
  }, [templates]);

  // Handle template actions
  const handleUseTemplate = (template) => {
    templateEngine.addToRecent(template.id);
    setPreviewTemplate(null);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const handleToggleFavorite = (id) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const handleExportTemplate = (template) => {
    const json = templateEngine.exportTemplate(template.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const imported = templateEngine.importTemplate(text);
          setTemplates(templateEngine.getAllTemplates());
          alert(`Template "${imported.name}" imported successfully!`);
        } catch (error) {
          alert(`Import failed: ${error.message}`);
        }
      }
    };
    input.click();
  };

  const stats = templateEngine.getStats();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Library</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {stats.total} templates available • {favorites.size} favorites
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleImportTemplate} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={onCreateTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={cn(
            'px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700',
            'bg-white dark:bg-gray-900 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary'
          )}
        >
          <option value="all">All Categories</option>
          {Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => (
            <option key={value} value={value}>
              {CATEGORY_NAMES[value]} ({categoryCounts[value] || 0})
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            All Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="w-4 h-4 mr-2" />
            Favorites ({favorites.size})
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="w-4 h-4 mr-2" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Template Grid */}
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                  onPreview={setPreviewTemplate}
                  onFavorite={handleToggleFavorite}
                  isFavorite={favorites.has(template.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : activeTab === 'favorites'
                  ? 'You haven\'t favorited any templates yet'
                  : 'No recent templates'}
              </p>
              {activeTab === 'all' && (
                <Button onClick={onCreateTemplate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Category Access */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(TEMPLATE_CATEGORIES)
            .filter(([_, value]) => value !== TEMPLATE_CATEGORIES.CUSTOM)
            .map(([key, value]) => {
              const Icon = CATEGORY_ICONS[value];
              const count = categoryCounts[value] || 0;

              return (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedCategory(value);
                    setActiveTab('all');
                  }}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all',
                    'hover:border-primary hover:shadow-md',
                    'text-left',
                    selectedCategory === value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                >
                  <Icon className="w-6 h-6 mb-2 text-primary" />
                  <div className="font-medium text-sm">{CATEGORY_NAMES[value]}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {count} templates
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={handleUseTemplate}
        />
      )}
    </div>
  );
}
