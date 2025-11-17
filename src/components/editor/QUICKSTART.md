# Quick Start Guide - SUMRY Rich Text Editor

Get up and running with the SUMRY Rich Text Editor in 5 minutes!

## Step 1: Install Dependencies

Run the installation script from the project root:

```bash
bash src/components/editor/install-dependencies.sh
```

Or manually install:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-text-align @tiptap/extension-placeholder @tiptap/extension-character-count
```

## Step 2: Import and Use

### Basic Usage

```jsx
import { useState } from 'react';
import RichTextEditor from './components/editor/RichTextEditor';

function App() {
  const [content, setContent] = useState('');

  return (
    <div className="p-6">
      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="Start typing..."
      />
    </div>
  );
}
```

### With Auto-Save

```jsx
import { useState } from 'react';
import RichTextEditor from './components/editor/RichTextEditor';

function App() {
  const [content, setContent] = useState('');

  const handleSave = async (content) => {
    // Save to your backend
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  };

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      onSave={handleSave}
      autoSave={true}
      autoSaveInterval={30000}
    />
  );
}
```

## Step 3: Customize

### Character Limit

```jsx
<RichTextEditor
  content={content}
  onChange={setContent}
  maxCharacters={500}
/>
```

### Markdown Mode

```jsx
<RichTextEditor
  content={content}
  onChange={setContent}
  markdown={true}
/>
```

### Read-Only Preview

```jsx
import { RichTextPreview } from './components/editor/RichTextEditor';

<RichTextPreview content={htmlContent} />
```

## Common Patterns

### 1. Document Editor with Save Button

```jsx
function DocumentEditor() {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await api.saveDocument(content);
    setSaving(false);
  };

  return (
    <div>
      <RichTextEditor
        content={content}
        onChange={setContent}
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
```

### 2. Meeting Notes

```jsx
import MeetingNotesEditor from './components/editor/MeetingNotesEditor';

<MeetingNotesEditor
  meetingId="123"
  initialNotes={existingNotes}
/>
```

### 3. Comment System

```jsx
function CommentEditor({ onSubmit }) {
  const [comment, setComment] = useState('');

  return (
    <div>
      <RichTextEditor
        content={comment}
        onChange={setComment}
        placeholder="Write a comment..."
        showWordCount={false}
        maxCharacters={1000}
      />
      <button onClick={() => onSubmit(comment)}>
        Post Comment
      </button>
    </div>
  );
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + K` | Insert Link |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |

## Examples

Explore full examples in:
- `/src/components/editor/EditorExample.jsx` - All configurations
- `/src/components/editor/MeetingNotesEditor.jsx` - Real-world integration

## Utilities

Import helper functions:

```jsx
import {
  htmlToMarkdown,
  markdownToHTML,
  sanitizeHTML,
  countWords,
  getReadingTime,
} from './lib/editorUtils';

// Convert between formats
const markdown = htmlToMarkdown('<h1>Title</h1>');
const html = markdownToHTML('# Title');

// Analyze text
const words = countWords(content);
const readTime = getReadingTime(content);

// Sanitize user input
const clean = sanitizeHTML(userContent);
```

## Next Steps

1. Read the full documentation: `src/components/editor/README.md`
2. Explore examples: `src/components/editor/EditorExample.jsx`
3. Run tests: `npm test editorUtils`
4. Customize styling with Tailwind classes

## Troubleshooting

**Editor not showing?**
- Ensure all dependencies are installed
- Check that Tailwind CSS is configured

**Auto-save not working?**
- Verify `onSave` prop is provided
- Set `autoSave={true}`

**Styles look wrong?**
- Make sure Tailwind is processing the editor files
- Check `tailwind.config.js` includes `./src/**/*.{js,jsx}`

## Support

For more help:
- Full documentation: `README.md`
- Test file: `src/lib/__tests__/editorUtils.test.js`
- Example code: `EditorExample.jsx`

Happy editing! 🎉
