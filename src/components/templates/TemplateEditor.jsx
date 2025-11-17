/**
 * Template Editor Component
 *
 * Create and edit templates with:
 * - Rich text editor integration
 * - Variable insertion
 * - Conditional logic builder
 * - Preview with sample data
 * - Save/duplicate/share functionality
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Save,
  X,
  Eye,
  Code,
  Plus,
  Copy,
  Download,
  Share2,
  AlertCircle,
  Check,
  ChevronDown,
  Info,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { cn } from '../../lib/utils';
import {
  templateEngine,
  Template,
  TEMPLATE_CATEGORIES,
  VARIABLE_TYPES,
  renderTemplate,
} from '../../lib/templateEngine';

// Category display names
const CATEGORY_NAMES = {
  reading: 'Reading',
  math: 'Math',
  writing: 'Writing',
  behavior: 'Behavior',
  communication: 'Communication',
  social: 'Social Skills',
  motor: 'Motor Skills',
  transition: 'Transition',
  progress: 'Progress Monitoring',
  meeting: 'Meeting Notes',
  report: 'Reports',
  custom: 'Custom',
};

/**
 * Variable Selector Dropdown
 */
function VariableSelector({ onInsert }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleInsert = (varName) => {
    onInsert(`{{${varName}}}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        type="button"
      >
        <Plus className="w-4 h-4 mr-2" />
        Insert Variable
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-96 overflow-auto">
            {Object.entries(VARIABLE_TYPES).map(([groupKey, variables]) => (
              <div key={groupKey}>
                <div
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() =>
                    setSelectedGroup(selectedGroup === groupKey ? null : groupKey)
                  }
                >
                  {groupKey.replace('_', ' ')}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 inline-block ml-2 transition-transform',
                      selectedGroup === groupKey && 'rotate-180'
                    )}
                  />
                </div>
                {selectedGroup === groupKey && (
                  <div className="bg-white dark:bg-gray-900">
                    {Object.entries(variables).map(([varName, description]) => (
                      <button
                        key={varName}
                        onClick={() => handleInsert(varName)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800"
                      >
                        <div className="font-mono text-primary">
                          {`{{${varName}}}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Conditional Logic Builder
 */
function ConditionalBuilder({ onInsert }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conditionType, setConditionType] = useState('if');
  const [variable, setVariable] = useState('');
  const [operator, setOperator] = useState('');
  const [value, setValue] = useState('');

  const handleInsert = () => {
    let syntax = '';

    if (conditionType === 'if-simple') {
      syntax = `{{#if ${variable}}}\n  [Content if true]\n{{/if}}`;
    } else if (conditionType === 'if-else') {
      syntax = `{{#if ${variable}}}\n  [Content if true]\n{{else}}\n  [Content if false]\n{{/if}}`;
    } else if (conditionType === 'if-comparison' && operator && value) {
      syntax = `{{#if ${variable} ${operator} ${value}}}\n  [Content if true]\n{{/if}}`;
    } else if (conditionType === 'unless') {
      syntax = `{{#unless ${variable}}}\n  [Content if false]\n{{/unless}}`;
    }

    if (syntax) {
      onInsert(syntax);
      setIsOpen(false);
      setVariable('');
      setOperator('');
      setValue('');
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        type="button"
      >
        <Code className="w-4 h-4 mr-2" />
        Add Condition
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-4">
            <h4 className="font-semibold mb-3">Insert Conditional Logic</h4>

            <div className="space-y-3">
              <div>
                <Label>Condition Type</Label>
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm mt-1"
                >
                  <option value="if-simple">If (simple)</option>
                  <option value="if-else">If/Else</option>
                  <option value="if-comparison">If (comparison)</option>
                  <option value="unless">Unless</option>
                </select>
              </div>

              <div>
                <Label>Variable Name</Label>
                <Input
                  value={variable}
                  onChange={(e) => setVariable(e.target.value)}
                  placeholder="e.g., useVisualSupports"
                  className="mt-1"
                />
              </div>

              {conditionType === 'if-comparison' && (
                <>
                  <div>
                    <Label>Operator</Label>
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm mt-1"
                    >
                      <option value="">Select operator...</option>
                      <option value="===">equals (===)</option>
                      <option value="!==">not equals (!==)</option>
                      <option value=">">greater than (&gt;)</option>
                      <option value=">=">greater or equal (&gt;=)</option>
                      <option value="<">less than (&lt;)</option>
                      <option value="<=">less or equal (&lt;=)</option>
                    </select>
                  </div>

                  <div>
                    <Label>Value</Label>
                    <Input
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="e.g., true, 5, 'text'"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-xs text-blue-700 dark:text-blue-300">
                <Info className="w-4 h-4 inline mr-1" />
                {conditionType === 'if-simple' && 'Shows content only if variable is truthy'}
                {conditionType === 'if-else' && 'Shows different content based on condition'}
                {conditionType === 'if-comparison' && 'Compares variable to a value'}
                {conditionType === 'unless' && 'Shows content only if variable is falsy'}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleInsert} size="sm" className="flex-1">
                  Insert
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Main Template Editor Component
 */
export default function TemplateEditor({
  template: initialTemplate,
  onSave,
  onCancel,
  className,
}) {
  const isEditMode = !!initialTemplate;

  const [name, setName] = useState(initialTemplate?.name || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [category, setCategory] = useState(
    initialTemplate?.category || TEMPLATE_CATEGORIES.CUSTOM
  );
  const [content, setContent] = useState(initialTemplate?.content || '');
  const [tags, setTags] = useState(initialTemplate?.tags?.join(', ') || '');
  const [currentTag, setCurrentTag] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [previewData, setPreviewData] = useState({});
  const [validation, setValidation] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sample data for preview
  const sampleData = {
    studentName: 'John Doe',
    studentAge: '12',
    studentGrade: '6th',
    studentId: '123456',
    currentLevel: '45',
    baseline: '45',
    target: '68',
    accuracy: '85',
    trials: '4',
    totalTrials: '5',
    endDate: '12/31/2024',
    teacherName: 'Ms. Smith',
    caseManager: 'Mr. Johnson',
    useVisualSupports: 'true',
    useGraphicOrganizer: 'true',
  };

  // Validate template on content change
  useEffect(() => {
    if (name && content) {
      const template = new Template({
        name,
        content,
        category,
        description,
      });
      const result = templateEngine.validate(template);
      setValidation(result);
    }
  }, [name, content, category, description]);

  // Extract variables from content
  const detectedVariables = useMemo(() => {
    return templateEngine.extractVariables(content);
  }, [content]);

  // Initialize preview data with detected variables
  useEffect(() => {
    const data = {};
    detectedVariables.forEach((variable) => {
      if (!previewData[variable]) {
        data[variable] = sampleData[variable] || '';
      }
    });
    if (Object.keys(data).length > 0) {
      setPreviewData((prev) => ({ ...prev, ...data }));
    }
  }, [detectedVariables]);

  // Render preview
  const renderedPreview = useMemo(() => {
    if (!content) return '';
    try {
      return templateEngine.render(content, previewData);
    } catch (error) {
      return `Error rendering template: ${error.message}`;
    }
  }, [content, previewData]);

  // Insert text at cursor position
  const insertAtCursor = (text) => {
    const textarea = document.getElementById('template-content');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);

    setContent(newContent);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // Handle save
  const handleSave = async () => {
    if (!validation?.isValid) {
      alert('Please fix validation errors before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const template = new Template({
        id: initialTemplate?.id,
        name,
        description,
        content,
        category,
        tags: tagArray,
        variables: detectedVariables,
        version: '1.0.0',
        author: 'User',
      });

      if (isEditMode) {
        templateEngine.updateTemplate(template.id, template);
      } else {
        templateEngine.addTemplate(template);
      }

      if (onSave) {
        await onSave(template);
      }
    } catch (error) {
      alert(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = () => {
    setName(`${name} (Copy)`);
  };

  // Handle export
  const handleExport = () => {
    const template = new Template({
      name,
      description,
      content,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    const json = JSON.stringify(template.toJSON(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-fill with smart suggestions
  const handleAutoFill = () => {
    const suggestions = templateEngine.suggestBaselineTarget(category);
    const newData = { ...previewData, ...suggestions };
    setPreviewData(newData);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Template' : 'Create Template'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build powerful, reusable templates with variables and logic
          </p>
        </div>
        <div className="flex gap-2">
          {isEditMode && (
            <>
              <Button onClick={handleDuplicate} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </>
          )}
          <Button onClick={onCancel} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!validation?.isValid || isSaving}>
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation Messages */}
      {validation && (
        <div>
          {validation.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    Validation Errors:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
                    {validation.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Warnings:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                    {validation.warnings.map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Reading Fluency Goal"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this template"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm mt-1"
                  >
                    {Object.entries(TEMPLATE_CATEGORIES).map(([key, value]) => (
                      <option key={value} value={value}>
                        {CATEGORY_NAMES[value]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., fluency, reading, wpm"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Content</CardTitle>
                <div className="flex gap-2">
                  <VariableSelector onInsert={insertAtCursor} />
                  <ConditionalBuilder onInsert={insertAtCursor} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                id="template-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your template content here. Use {{variableName}} for variables and {{#if variable}}...{{/if}} for conditional logic."
                className="min-h-[400px] font-mono text-sm"
              />

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  Template Syntax Guide:
                </h4>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                  <li>
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">
                      {`{{variableName}}`}
                    </code>{' '}
                    - Insert a variable
                  </li>
                  <li>
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">
                      {`{{#if variable}}...{{/if}}`}
                    </code>{' '}
                    - Conditional content
                  </li>
                  <li>
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">
                      {`{{#if variable}}...{{else}}...{{/if}}`}
                    </code>{' '}
                    - If/else condition
                  </li>
                  <li>
                    <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">
                      {`{{#if count > 5}}...{{/if}}`}
                    </code>{' '}
                    - Comparison operators
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="edit">Edit Data</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-3 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold">
                      Sample Data ({detectedVariables.length} variables)
                    </Label>
                    <Button
                      onClick={handleAutoFill}
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Auto-fill
                    </Button>
                  </div>

                  {detectedVariables.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-auto">
                      {detectedVariables.map((variable) => (
                        <div key={variable}>
                          <Label htmlFor={`var-${variable}`} className="text-xs">
                            {variable}
                          </Label>
                          <Input
                            id={`var-${variable}`}
                            value={previewData[variable] || ''}
                            onChange={(e) =>
                              setPreviewData({
                                ...previewData,
                                [variable]: e.target.value,
                              })
                            }
                            placeholder={`Enter ${variable}`}
                            className="mt-1"
                            size="sm"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-gray-500">
                      No variables detected in template
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg min-h-[200px] text-sm whitespace-pre-wrap">
                    {renderedPreview || (
                      <span className="text-gray-400">
                        Add content to see preview...
                      </span>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Variables Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detected Variables</CardTitle>
            </CardHeader>
            <CardContent>
              {detectedVariables.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {detectedVariables.map((variable) => (
                    <Badge key={variable} variant="secondary" className="text-xs font-mono">
                      {variable}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No variables detected. Add variables using {`{{variableName}}`} syntax.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use descriptive variable names for clarity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Test your template with sample data before saving</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Add tags to make your template easier to find</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Use conditionals to create flexible templates</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
