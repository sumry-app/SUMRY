/**
 * Template Integration Example
 *
 * Comprehensive example showing how to integrate the template system
 * into your SUMRY application for IEP goals, meeting notes, and more.
 */

import { useState } from 'react';
import { TemplateManager, TemplateLibrary, TemplateEditor } from './index';
import { templateEngine, renderTemplate } from '../../lib/templateEngine';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { FileText, BookOpen, Edit3 } from 'lucide-react';

/**
 * Example 1: Simple Template Usage
 */
function SimpleTemplateExample() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [studentData, setStudentData] = useState({
    studentName: 'Jane Smith',
    baseline: '50',
    target: '75',
    accuracy: '85',
    endDate: '06/15/2025',
  });
  const [renderedContent, setRenderedContent] = useState('');

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    const rendered = renderTemplate(template, studentData);
    setRenderedContent(rendered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 1: Simple Template Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click "Browse Templates" to select a template, then see it rendered with
          sample student data.
        </p>

        {!selectedTemplate ? (
          <TemplateLibrary onSelectTemplate={handleUseTemplate} />
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Selected: {selectedTemplate.name}</h3>
              <p className="text-sm">{selectedTemplate.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Rendered Content:</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap text-sm">
                {renderedContent}
              </div>
            </div>

            <Button onClick={() => setSelectedTemplate(null)} variant="outline">
              Select Another Template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 2: Template with Form Integration
 */
function TemplateFormExample() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    baseline: '',
    target: '',
    accuracy: '85',
    trials: '4',
    totalTrials: '5',
    endDate: '',
  });
  const [goalText, setGoalText] = useState('');

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplates(false);

    // Auto-fill form with template variables
    const variables = templateEngine.extractVariables(template.content);
    const newFormData = { ...formData };
    variables.forEach((variable) => {
      if (!(variable in newFormData)) {
        newFormData[variable] = '';
      }
    });
    setFormData(newFormData);
  };

  const handleGenerateGoal = () => {
    if (!selectedTemplate) {
      alert('Please select a template first');
      return;
    }

    const rendered = renderTemplate(selectedTemplate, formData);
    setGoalText(rendered);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 2: Template with Form Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showTemplates ? (
          <TemplateLibrary
            onSelectTemplate={handleSelectTemplate}
            onCreateTemplate={() => alert('Create template clicked')}
          />
        ) : (
          <>
            {/* Template Selection */}
            <div>
              {selectedTemplate ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{selectedTemplate.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTemplate.description}
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowTemplates(true)}
                      variant="outline"
                      size="sm"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowTemplates(true)}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Select Template
                </Button>
              )}
            </div>

            {/* Form Fields */}
            {selectedTemplate && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student Name</Label>
                  <Input
                    value={formData.studentName}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Baseline</Label>
                  <Input
                    value={formData.baseline}
                    onChange={(e) =>
                      setFormData({ ...formData, baseline: e.target.value })
                    }
                    placeholder="Current level"
                  />
                </div>
                <div>
                  <Label>Target</Label>
                  <Input
                    value={formData.target}
                    onChange={(e) =>
                      setFormData({ ...formData, target: e.target.value })
                    }
                    placeholder="Goal target"
                  />
                </div>
                <div>
                  <Label>Accuracy (%)</Label>
                  <Input
                    value={formData.accuracy}
                    onChange={(e) =>
                      setFormData({ ...formData, accuracy: e.target.value })
                    }
                    placeholder="85"
                  />
                </div>
                <div>
                  <Label>Trials (e.g., 4 out of 5)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.trials}
                      onChange={(e) =>
                        setFormData({ ...formData, trials: e.target.value })
                      }
                      placeholder="4"
                      className="w-20"
                    />
                    <span className="self-center">of</span>
                    <Input
                      value={formData.totalTrials}
                      onChange={(e) =>
                        setFormData({ ...formData, totalTrials: e.target.value })
                      }
                      placeholder="5"
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            {selectedTemplate && (
              <Button onClick={handleGenerateGoal} className="w-full">
                Generate Goal
              </Button>
            )}

            {/* Generated Goal */}
            {goalText && (
              <div>
                <Label>Generated IEP Goal:</Label>
                <Textarea
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  className="mt-2 min-h-[200px]"
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm">Save to IEP</Button>
                  <Button size="sm" variant="outline">
                    Copy to Clipboard
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 3: Full Template Manager
 */
function FullManagerExample() {
  const [usedTemplate, setUsedTemplate] = useState(null);

  const handleUseTemplate = (template) => {
    setUsedTemplate(template);
    // In a real app, you would navigate to goal creation or populate a form
    console.log('Using template:', template);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 3: Complete Template Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This shows the full template manager with library and editor integrated.
        </p>

        {usedTemplate && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="font-semibold">Template Selected!</div>
            <div className="text-sm mt-1">
              You selected "{usedTemplate.name}". In a real application, this would
              navigate to your goal creation form or populate fields automatically.
            </div>
            <Button
              onClick={() => setUsedTemplate(null)}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              Select Another
            </Button>
          </div>
        )}

        {!usedTemplate && (
          <TemplateManager
            onUseTemplate={handleUseTemplate}
            onClose={() => console.log('Manager closed')}
          />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example 4: Programmatic Template Usage
 */
function ProgrammaticExample() {
  const [code, setCode] = useState(`// Load pre-built templates
import { templateEngine } from '@/lib/templateEngine';
import { loadPrebuiltTemplates } from '@/lib/prebuiltTemplates';

// Initialize templates
loadPrebuiltTemplates(templateEngine);

// Get all templates
const allTemplates = templateEngine.getAllTemplates();

// Filter by category
const readingTemplates = templateEngine.filterTemplates({
  category: 'reading'
});

// Search templates
const fluencyTemplates = templateEngine.filterTemplates({
  search: 'fluency'
});

// Render a template
const template = templateEngine.getTemplate(templateId);
const studentData = {
  studentName: 'John Doe',
  baseline: '45',
  target: '68',
  accuracy: '85',
  endDate: '06/15/2025'
};

const rendered = templateEngine.render(template, studentData);

// Create custom template
import { Template } from '@/lib/templateEngine';

const customTemplate = new Template({
  name: 'My Custom Goal',
  content: \`{{studentName}} will improve from {{baseline}} to {{target}} by {{endDate}}.\`,
  category: 'custom',
  description: 'Custom IEP goal template',
  tags: ['custom', 'personalized']
});

templateEngine.addTemplate(customTemplate);

// Export/Import templates
const json = templateEngine.exportTemplate(templateId);
const imported = templateEngine.importTemplate(jsonString);`);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example 4: Programmatic Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Use the template engine programmatically in your code:
        </p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
          {code}
        </pre>
      </CardContent>
    </Card>
  );
}

/**
 * Main Integration Example Component
 */
export default function TemplateIntegrationExample() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Template System Integration Guide</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Learn how to integrate the SUMRY template system into your application
        </p>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold mb-2">1. Import the components:</h3>
            <pre className="bg-white dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
              {`import { TemplateManager, TemplateLibrary, TemplateEditor } from '@/components/templates';`}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Use in your component:</h3>
            <pre className="bg-white dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
              {`<TemplateManager
  onUseTemplate={(template) => {
    // Handle template selection
    console.log('Using template:', template);
  }}
/>`}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3. Render with data:</h3>
            <pre className="bg-white dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
              {`import { renderTemplate } from '@/lib/templateEngine';

const goalText = renderTemplate(template, {
  studentName: 'John Doe',
  baseline: '45',
  target: '68'
});`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <Tabs defaultValue="simple">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="simple">Simple Usage</TabsTrigger>
          <TabsTrigger value="form">Form Integration</TabsTrigger>
          <TabsTrigger value="full">Full Manager</TabsTrigger>
          <TabsTrigger value="code">Programmatic</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="mt-6">
          <SimpleTemplateExample />
        </TabsContent>

        <TabsContent value="form" className="mt-6">
          <TemplateFormExample />
        </TabsContent>

        <TabsContent value="full" className="mt-6">
          <FullManagerExample />
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <ProgrammaticExample />
        </TabsContent>
      </Tabs>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">50+ Pre-built Templates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive library covering all IEP goal categories
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Variable Substitution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dynamic placeholders for student data and measurements
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Conditional Logic</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                If/else statements for flexible template content
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Category Organization</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Templates organized by Reading, Math, Writing, Behavior, etc.
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Search & Filter</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quickly find templates by name, description, or tags
              </p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-2">Import/Export</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share templates between users or backup your custom templates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
