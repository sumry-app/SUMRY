import { useState } from 'react';
import RichTextEditor, { RichTextPreview } from './RichTextEditor';

/**
 * Example usage of the RichTextEditor component
 * This demonstrates various configurations and use cases
 */
export default function EditorExample() {
  const [content, setContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  const [readOnlyContent] = useState(`
    <h1>Welcome to SUMRY Rich Text Editor</h1>
    <p>This is a <strong>powerful</strong> and <em>beautiful</em> rich text editor built with Tiptap.</p>
    <h2>Features</h2>
    <ul>
      <li>Text formatting (bold, italic, underline, strikethrough)</li>
      <li>Headings (H1-H6)</li>
      <li>Lists (bullet and numbered)</li>
      <li>Blockquotes and code blocks</li>
      <li>Links and tables</li>
      <li>Text alignment</li>
      <li>Auto-save functionality</li>
    </ul>
  `);

  const handleSave = async (content) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Saved content:', content);
        resolve();
      }, 1000);
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Rich Text Editor Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore different configurations of the SUMRY Rich Text Editor
        </p>
      </div>

      {/* Basic Editor */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            1. Basic Editor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Full-featured editor with toolbar and word count
          </p>
        </div>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Start typing your content here..."
        />
      </section>

      {/* Editor with Auto-Save */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            2. Editor with Auto-Save
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automatically saves content every 30 seconds
          </p>
        </div>
        <RichTextEditor
          content={content}
          onChange={setContent}
          onSave={handleSave}
          autoSave={true}
          autoSaveInterval={30000}
          placeholder="Your content is automatically saved..."
        />
      </section>

      {/* Editor with Character Limit */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            3. Editor with Character Limit
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Limited to 500 characters with warning indicator
          </p>
        </div>
        <RichTextEditor
          content={content}
          onChange={setContent}
          maxCharacters={500}
          placeholder="Max 500 characters..."
        />
      </section>

      {/* Markdown Editor */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            4. Markdown Mode
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Editor that works with Markdown format
          </p>
        </div>
        <RichTextEditor
          content={markdownContent}
          onChange={setMarkdownContent}
          markdown={true}
          placeholder="Write in markdown..."
        />
        {markdownContent && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Markdown Output:
            </h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                {markdownContent}
              </code>
            </pre>
          </div>
        )}
      </section>

      {/* Read-Only Editor */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            5. Read-Only Mode
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Display-only mode without editing capabilities
          </p>
        </div>
        <RichTextEditor
          content={readOnlyContent}
          readOnly={true}
          showToolbar={false}
        />
      </section>

      {/* Preview Component */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            6. Preview Component
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Lightweight preview-only component for displaying formatted content
          </p>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          <RichTextPreview content={readOnlyContent} />
        </div>
      </section>

      {/* Minimal Editor */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            7. Minimal Editor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compact editor without word count
          </p>
        </div>
        <RichTextEditor
          content={content}
          onChange={setContent}
          showWordCount={false}
          placeholder="Minimal configuration..."
          className="max-w-2xl"
        />
      </section>

      {/* Custom Styled Editor */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            8. Custom Styled Editor
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Editor with custom styling and compact height
          </p>
        </div>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Custom styled editor..."
          className="shadow-lg"
          editorClassName="min-h-[150px] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
        />
      </section>

      {/* Usage Code Examples */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Usage Examples
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Code snippets for implementing the editor
          </p>
        </div>

        <div className="space-y-4">
          {/* Basic Usage */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Basic Usage
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{`import RichTextEditor from './components/editor/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}`}</code>
            </pre>
          </div>

          {/* With Auto-Save */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              With Auto-Save
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{`const handleSave = async (content) => {
  await api.saveDocument({ content });
};

<RichTextEditor
  content={content}
  onChange={setContent}
  onSave={handleSave}
  autoSave={true}
  autoSaveInterval={30000} // 30 seconds
/>`}</code>
            </pre>
          </div>

          {/* Preview Only */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Preview Only
            </h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{`import { RichTextPreview } from './components/editor/RichTextEditor';

<RichTextPreview
  content={savedContent}
  className="p-6"
/>`}</code>
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
