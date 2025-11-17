/**
 * Rich Text Editor - Main exports
 *
 * Provides easy access to all editor components and utilities
 */

export { default as RichTextEditor, RichTextPreview } from './RichTextEditor';
export { default as Toolbar } from './Toolbar';
export { default as EditorExample } from './EditorExample';

// Re-export utilities for convenience
export {
  htmlToMarkdown,
  markdownToHTML,
  sanitizeHTML,
  isValidURL,
  formatURL,
  countWords,
  countCharacters,
  getReadingTime,
  AutoSaveManager,
  truncateText,
  extractPlainText,
  createTableOfContents,
  slugify,
} from '../../lib/editorUtils';
