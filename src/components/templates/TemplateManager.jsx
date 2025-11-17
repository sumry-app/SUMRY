/**
 * Template Manager Component
 *
 * Main component that integrates TemplateLibrary and TemplateEditor
 * Provides complete template management functionality
 */

import { useState } from 'react';
import TemplateLibrary from './TemplateLibrary';
import TemplateEditor from './TemplateEditor';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * View modes
 */
const VIEW_MODES = {
  LIBRARY: 'library',
  EDITOR: 'editor',
  USING: 'using',
};

/**
 * Main Template Manager
 */
export default function TemplateManager({
  onUseTemplate,
  onClose,
  className,
}) {
  const [view, setView] = useState(VIEW_MODES.LIBRARY);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Handle template selection from library
  const handleSelectTemplate = (template) => {
    if (onUseTemplate) {
      // If parent provides handler, use it
      onUseTemplate(template);
    } else {
      // Otherwise, show a default usage view
      setSelectedTemplate(template);
      setView(VIEW_MODES.USING);
    }
  };

  // Handle create new template
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setView(VIEW_MODES.EDITOR);
  };

  // Handle save template
  const handleSaveTemplate = async (template) => {
    alert(`Template "${template.name}" saved successfully!`);
    setView(VIEW_MODES.LIBRARY);
  };

  // Handle cancel
  const handleCancel = () => {
    setView(VIEW_MODES.LIBRARY);
    setSelectedTemplate(null);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Back button for non-library views */}
      {view !== VIEW_MODES.LIBRARY && (
        <div className="mb-4">
          <Button onClick={handleCancel} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </div>
      )}

      {/* Library View */}
      {view === VIEW_MODES.LIBRARY && (
        <TemplateLibrary
          onSelectTemplate={handleSelectTemplate}
          onCreateTemplate={handleCreateTemplate}
        />
      )}

      {/* Editor View */}
      {view === VIEW_MODES.EDITOR && (
        <TemplateEditor
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleCancel}
        />
      )}

      {/* Using Template View (default preview) */}
      {view === VIEW_MODES.USING && selectedTemplate && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Using Template</h2>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200">
                Template "{selectedTemplate.name}" has been selected. You can now use it
                in your application by passing the onUseTemplate callback prop to
                TemplateManager.
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Template Details:</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Name:</strong> {selectedTemplate.name}
                </li>
                <li>
                  <strong>Category:</strong> {selectedTemplate.category}
                </li>
                <li>
                  <strong>Description:</strong> {selectedTemplate.description}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
