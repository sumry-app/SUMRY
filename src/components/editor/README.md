# SUMRY Rich Text Editor

A comprehensive, production-ready rich text editor system built with Tiptap and React. Features a beautiful UI, extensive formatting options, and enterprise-grade functionality.

## Features

### Text Formatting
- **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~
- `Inline code` and code blocks
- Multiple heading levels (H1-H6)
- Text alignment (left, center, right, justify)

### Content Structures
- Bullet lists and numbered lists
- Blockquotes
- Tables with resize support
- Links with custom styling
- Images support

### Advanced Features
- **Auto-save** - Automatic content saving with configurable intervals
- **Character/Word Count** - Real-time statistics
- **Reading Time** - Estimated reading duration
- **Undo/Redo** - Full history management
- **Keyboard Shortcuts** - Power user productivity
- **Markdown Support** - Import/export markdown format
- **Character Limit** - Optional maximum length with warnings
- **Read-only Mode** - Display-only rendering
- **Placeholder Text** - Customizable empty state
- **Accessibility** - ARIA labels and keyboard navigation
- **Dark Mode** - Full dark theme support

## Installation

### 1. Install Dependencies

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-text-align @tiptap/extension-placeholder @tiptap/extension-character-count
```

### 2. File Structure

```
src/
├── components/
│   └── editor/
│       ├── RichTextEditor.jsx    # Main editor component
│       ├── Toolbar.jsx            # Toolbar component
│       ├── EditorExample.jsx      # Usage examples
│       └── README.md              # This file
└── lib/
    └── editorUtils.js             # Utility functions
```

## Usage

### Basic Editor

```jsx
import { useState } from 'react';
import RichTextEditor from './components/editor/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start typing..."
    />
  );
}
```

### Editor with Auto-Save

```jsx
const handleSave = async (content) => {
  // Save to your backend
  await api.saveDocument({ content });
};

<RichTextEditor
  content={content}
  onChange={setContent}
  onSave={handleSave}
  autoSave={true}
  autoSaveInterval={30000} // Save every 30 seconds
  placeholder="Your work is automatically saved"
/>
```

### Character Limited Editor

```jsx
<RichTextEditor
  content={content}
  onChange={setContent}
  maxCharacters={500}
  placeholder="Max 500 characters"
/>
```

### Markdown Mode

```jsx
const [markdownContent, setMarkdownContent] = useState('');

<RichTextEditor
  content={markdownContent}
  onChange={setMarkdownContent}
  markdown={true}
  placeholder="Write in markdown..."
/>
```

### Read-Only Mode

```jsx
<RichTextEditor
  content={savedContent}
  readOnly={true}
  showToolbar={false}
/>
```

### Preview Component

For displaying formatted content without editing capabilities:

```jsx
import { RichTextPreview } from './components/editor/RichTextEditor';

<RichTextPreview
  content={htmlContent}
  className="p-6"
/>
```

## Props

### RichTextEditor

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `''` | Initial content (HTML or Markdown) |
| `onChange` | `function` | - | Callback when content changes `(content: string) => void` |
| `onSave` | `function` | - | Callback for save operations `(content: string) => Promise<void>` |
| `placeholder` | `string` | `'Start typing...'` | Placeholder text when editor is empty |
| `readOnly` | `boolean` | `false` | Enable read-only mode |
| `autoSave` | `boolean` | `false` | Enable automatic saving |
| `autoSaveInterval` | `number` | `30000` | Auto-save interval in milliseconds |
| `showToolbar` | `boolean` | `true` | Show/hide the formatting toolbar |
| `showWordCount` | `boolean` | `true` | Show/hide word/character count |
| `markdown` | `boolean` | `false` | Use markdown mode for input/output |
| `maxCharacters` | `number` | `null` | Maximum character limit (null = unlimited) |
| `className` | `string` | - | Additional CSS classes for the container |
| `editorClassName` | `string` | - | Additional CSS classes for editor content |

### RichTextPreview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `''` | HTML or Markdown content to display |
| `markdown` | `boolean` | `false` | Interpret content as markdown |
| `className` | `string` | - | Additional CSS classes |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + Shift + S` | Strikethrough |
| `Ctrl/Cmd + E` | Inline Code |
| `Ctrl/Cmd + K` | Insert Link |
| `Ctrl/Cmd + Shift + 7` | Numbered List |
| `Ctrl/Cmd + Shift + 8` | Bullet List |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + S` | Save (if onSave provided) |

## Utility Functions

The editor comes with a comprehensive set of utility functions in `editorUtils.js`:

### Conversion Functions

```javascript
import {
  htmlToMarkdown,
  markdownToHTML,
  sanitizeHTML,
} from '../lib/editorUtils';

// Convert HTML to Markdown
const markdown = htmlToMarkdown('<h1>Hello</h1>');

// Convert Markdown to HTML
const html = markdownToHTML('# Hello');

// Sanitize HTML (XSS protection)
const clean = sanitizeHTML(userInput);
```

### Text Analysis

```javascript
import {
  countWords,
  countCharacters,
  getReadingTime,
  extractPlainText,
} from '../lib/editorUtils';

const text = '<p>Hello <strong>world</strong>!</p>';

countWords(text);           // 2
countCharacters(text);      // 12 (with spaces)
countCharacters(text, false); // 11 (without spaces)
getReadingTime(text);       // 1 (minutes)
extractPlainText(text);     // "Hello world!"
```

### URL Utilities

```javascript
import {
  isValidURL,
  formatURL,
} from '../lib/editorUtils';

isValidURL('https://example.com');  // true
isValidURL('not a url');            // false
formatURL('example.com');           // 'https://example.com'
```

### Auto-Save Manager

```javascript
import { AutoSaveManager } from '../lib/editorUtils';

const autoSave = new AutoSaveManager({
  saveCallback: async () => {
    await api.save(content);
  },
  interval: 30000,        // 30 seconds
  debounceDelay: 1000,   // 1 second
  enabled: true,
});

autoSave.start();
autoSave.markDirty(newContent);
autoSave.forceSave();
autoSave.stop();
```

## Styling

The editor uses Tailwind CSS for styling and includes:

- **Dark mode support** - Automatically adapts to system preference
- **Responsive design** - Works on all screen sizes
- **Customizable** - Override styles with className props
- **Prose styling** - Beautiful typography with Tailwind Typography

### Custom Styling Example

```jsx
<RichTextEditor
  content={content}
  onChange={setContent}
  className="shadow-xl rounded-xl"
  editorClassName="min-h-[500px] bg-gray-50 dark:bg-gray-900"
/>
```

## Accessibility

The editor is built with accessibility in mind:

- **ARIA labels** - All buttons and controls are properly labeled
- **Keyboard navigation** - Full keyboard support
- **Focus management** - Clear focus indicators
- **Screen reader support** - Semantic HTML structure
- **Color contrast** - WCAG AA compliant

## Security

The editor includes built-in security features:

- **XSS Protection** - HTML sanitization to prevent script injection
- **Safe URLs** - Validation for links and images
- **Content filtering** - Removes dangerous HTML elements
- **CSP Compatible** - Works with Content Security Policy

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

The editor is optimized for performance:

- **Debounced updates** - Prevents excessive re-renders
- **Lazy initialization** - Fast initial load
- **Efficient auto-save** - Smart dirty checking
- **Memoization** - Optimized render cycles

## Examples

See `EditorExample.jsx` for comprehensive examples including:

1. Basic editor
2. Auto-save functionality
3. Character limits
4. Markdown mode
5. Read-only mode
6. Preview component
7. Minimal configuration
8. Custom styling

## Troubleshooting

### Editor not rendering

Make sure all Tiptap dependencies are installed:

```bash
npm install @tiptap/react @tiptap/starter-kit
```

### Styles not applied

Ensure Tailwind CSS is configured and includes the editor files:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // ...
}
```

### Auto-save not working

Verify that `onSave` callback is provided and `autoSave={true}`:

```jsx
<RichTextEditor
  onSave={handleSave}
  autoSave={true}
/>
```

## License

Part of the SUMRY project.

## Contributing

To contribute improvements:

1. Test changes thoroughly
2. Ensure accessibility standards are met
3. Update documentation
4. Follow existing code style

## Support

For issues or questions, please refer to the SUMRY project documentation.
