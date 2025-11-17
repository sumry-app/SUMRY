import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Save, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import Toolbar from './Toolbar';
import {
  countWords,
  countCharacters,
  getReadingTime,
  AutoSaveManager,
  sanitizeHTML,
  htmlToMarkdown,
  markdownToHTML,
} from '../../lib/editorUtils';

/**
 * Rich Text Editor Component
 *
 * A full-featured, production-ready rich text editor built on Tiptap.
 *
 * Features:
 * - Text formatting (bold, italic, underline, strikethrough)
 * - Headings (H1-H6)
 * - Lists (bullet, numbered)
 * - Blockquotes and code blocks
 * - Links with preview
 * - Tables
 * - Text alignment
 * - Undo/redo
 * - Character/word count
 * - Auto-save
 * - Placeholder support
 * - Read-only mode
 * - Markdown support
 *
 * @param {Object} props - Component props
 * @param {string} props.content - Initial content (HTML or Markdown)
 * @param {Function} props.onChange - Callback when content changes
 * @param {Function} props.onSave - Callback for manual/auto save
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.readOnly - Read-only mode
 * @param {boolean} props.autoSave - Enable auto-save
 * @param {number} props.autoSaveInterval - Auto-save interval in ms
 * @param {boolean} props.showToolbar - Show/hide toolbar
 * @param {boolean} props.showWordCount - Show/hide word count
 * @param {boolean} props.markdown - Use markdown mode
 * @param {number} props.maxCharacters - Maximum character limit
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.editorClassName - CSS classes for editor content
 */
export default function RichTextEditor({
  content = '',
  onChange,
  onSave,
  placeholder = 'Start typing...',
  readOnly = false,
  autoSave = false,
  autoSaveInterval = 30000,
  showToolbar = true,
  showWordCount = true,
  markdown = false,
  maxCharacters = null,
  className,
  editorClassName,
}) {
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveManagerRef = useRef(null);

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline hover:text-blue-700',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 px-3 py-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-700 font-semibold',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
      CharacterCount.configure({
        limit: maxCharacters,
      }),
    ],
    content: markdown ? markdownToHTML(content) : content,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none',
          'focus:outline-none min-h-[300px] p-4',
          'text-gray-900 dark:text-gray-100',
          editorClassName
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const sanitized = sanitizeHTML(html);

      // Call onChange callback
      if (onChange) {
        onChange(markdown ? htmlToMarkdown(sanitized) : sanitized);
      }

      // Mark as dirty for auto-save
      if (autoSave && autoSaveManagerRef.current) {
        autoSaveManagerRef.current.markDirty(sanitized);
        setSaveStatus('unsaved');
      }
    },
  });

  // Initialize auto-save manager
  useEffect(() => {
    if (autoSave && onSave) {
      autoSaveManagerRef.current = new AutoSaveManager({
        saveCallback: async () => {
          setSaveStatus('saving');
          try {
            const html = editor.getHTML();
            const sanitized = sanitizeHTML(html);
            await onSave(markdown ? htmlToMarkdown(sanitized) : sanitized);
            setSaveStatus('saved');
            setLastSaved(new Date());
            autoSaveManagerRef.current.markClean(sanitized);
          } catch (error) {
            setSaveStatus('error');
            console.error('Auto-save failed:', error);
          }
        },
        interval: autoSaveInterval,
        enabled: true,
      });

      autoSaveManagerRef.current.start();

      return () => {
        if (autoSaveManagerRef.current) {
          autoSaveManagerRef.current.stop();
        }
      };
    }
  }, [autoSave, onSave, autoSaveInterval, editor, markdown]);

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      const newContent = markdown ? markdownToHTML(content) : content;

      // Only update if content has actually changed
      if (currentContent !== newContent) {
        editor.commands.setContent(newContent);
      }
    }
  }, [content, editor, markdown]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  // Manual save handler
  const handleManualSave = useCallback(async () => {
    if (onSave && editor) {
      setSaveStatus('saving');
      try {
        const html = editor.getHTML();
        const sanitized = sanitizeHTML(html);
        await onSave(markdown ? htmlToMarkdown(sanitized) : sanitized);
        setSaveStatus('saved');
        setLastSaved(new Date());

        if (autoSaveManagerRef.current) {
          autoSaveManagerRef.current.markClean(sanitized);
        }
      } catch (error) {
        setSaveStatus('error');
        console.error('Save failed:', error);
      }
    }
  }, [onSave, editor, markdown]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  // Calculate stats
  const wordCount = editor ? countWords(editor.getText()) : 0;
  const charCount = editor ? editor.storage.characterCount.characters() : 0;
  const readingTime = editor ? getReadingTime(editor.getText()) : 0;

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return null;

    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return lastSaved.toLocaleDateString();
  };

  if (!editor) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-b-lg" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg',
        'bg-white dark:bg-gray-900',
        'overflow-hidden',
        className
      )}
    >
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <Toolbar
          editor={editor}
          showWordCount={showWordCount}
          wordCount={wordCount}
          charCount={charCount}
          readingTime={readingTime}
        />
      )}

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />

        {/* Character Limit Warning */}
        {maxCharacters && charCount > maxCharacters * 0.9 && (
          <div
            className={cn(
              'absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium',
              charCount >= maxCharacters
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
            )}
          >
            {charCount}/{maxCharacters}
          </div>
        )}
      </div>

      {/* Status Bar */}
      {(onSave || showWordCount) && (
        <div
          className={cn(
            'flex items-center justify-between px-4 py-2',
            'bg-gray-50 dark:bg-gray-800',
            'border-t border-gray-200 dark:border-gray-700',
            'text-xs text-gray-500 dark:text-gray-400'
          )}
        >
          {/* Save Status */}
          {onSave && (
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <>
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Save className="w-3 h-3 text-green-600" />
                  <span>
                    Saved {formatLastSaved()}
                  </span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <span>Save failed</span>
                </>
              )}
              {saveStatus === 'unsaved' && !autoSave && (
                <>
                  <AlertCircle className="w-3 h-3 text-yellow-600" />
                  <span>Unsaved changes</span>
                </>
              )}

              {/* Manual Save Button */}
              {!autoSave && (
                <button
                  onClick={handleManualSave}
                  disabled={saveStatus === 'saving'}
                  className={cn(
                    'ml-2 px-3 py-1 rounded',
                    'text-xs font-medium',
                    'bg-blue-600 hover:bg-blue-700',
                    'text-white',
                    'transition-colors duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  Save
                </button>
              )}
            </div>
          )}

          {/* Word Count (if not in toolbar) */}
          {showWordCount && (!showToolbar || readOnly) && (
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              {readingTime > 0 && <span>{readingTime} min read</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Read-only preview component for displaying formatted content
 */
export function RichTextPreview({ content, markdown = false, className }) {
  const html = markdown ? markdownToHTML(content) : content;
  const sanitized = sanitizeHTML(html);

  return (
    <div
      className={cn(
        'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none',
        'text-gray-900 dark:text-gray-100',
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
