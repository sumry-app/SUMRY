import { useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Type,
  ChevronDown,
  X,
  Check,
  Code2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Toolbar button component
 */
const ToolbarButton = ({
  icon: Icon,
  title,
  isActive = false,
  disabled = false,
  onClick,
  shortcut,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${title}${shortcut ? ` (${shortcut})` : ''}`}
      className={cn(
        'p-2 rounded-lg transition-all duration-200',
        'hover:bg-gray-100 dark:hover:bg-gray-700',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
        isActive && 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
        !isActive && 'text-gray-700 dark:text-gray-300',
        className
      )}
      aria-pressed={isActive}
      aria-label={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

/**
 * Toolbar divider
 */
const ToolbarDivider = () => (
  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
);

/**
 * Toolbar dropdown component
 */
const ToolbarDropdown = ({ value, options, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'text-sm font-medium',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'transition-colors duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'text-gray-700 dark:text-gray-300'
        )}
        aria-label="Text format"
      >
        <selectedOption.icon className="w-4 h-4" />
        <span>{selectedOption.label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 mt-1 z-50',
            'bg-white dark:bg-gray-800 rounded-lg shadow-lg',
            'border border-gray-200 dark:border-gray-700',
            'min-w-[160px] py-1'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2',
                'text-left text-sm',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'transition-colors duration-200',
                value === option.value && 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              )}
            >
              <option.icon className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Link dialog component
 */
const LinkDialog = ({ isOpen, onClose, onInsert, initialUrl = '', initialText = '' }) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setText(initialText);
    }
  }, [isOpen, initialUrl, initialText]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onInsert(url, text);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg shadow-xl',
          'w-full max-w-md mx-4 p-6'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Insert Link
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="link-text"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Link Text
            </label>
            <input
              id="link-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter link text"
              className={cn(
                'w-full px-3 py-2 rounded-lg',
                'border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-900',
                'text-gray-900 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder:text-gray-400'
              )}
            />
          </div>

          <div>
            <label
              htmlFor="link-url"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              URL
            </label>
            <input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className={cn(
                'w-full px-3 py-2 rounded-lg',
                'border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-900',
                'text-gray-900 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder:text-gray-400'
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'px-4 py-2 rounded-lg',
                'text-sm font-medium',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'transition-colors duration-200'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                'px-4 py-2 rounded-lg',
                'text-sm font-medium',
                'bg-blue-600 hover:bg-blue-700',
                'text-white',
                'transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              disabled={!url}
            >
              <Check className="w-4 h-4 inline mr-1" />
              Insert Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Table dialog component
 */
const TableDialog = ({ isOpen, onClose, onInsert }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onInsert(rows, cols);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg shadow-xl',
          'w-full max-w-sm mx-4 p-6'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Insert Table
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="table-rows"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Rows
            </label>
            <input
              id="table-rows"
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              className={cn(
                'w-full px-3 py-2 rounded-lg',
                'border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-900',
                'text-gray-900 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            />
          </div>

          <div>
            <label
              htmlFor="table-cols"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Columns
            </label>
            <input
              id="table-cols"
              type="number"
              min="1"
              max="10"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              className={cn(
                'w-full px-3 py-2 rounded-lg',
                'border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-900',
                'text-gray-900 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'px-4 py-2 rounded-lg',
                'text-sm font-medium',
                'text-gray-700 dark:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'transition-colors duration-200'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={cn(
                'px-4 py-2 rounded-lg',
                'text-sm font-medium',
                'bg-blue-600 hover:bg-blue-700',
                'text-white',
                'transition-colors duration-200'
              )}
            >
              <Check className="w-4 h-4 inline mr-1" />
              Insert Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Editor Toolbar Component
 */
export default function Toolbar({
  editor,
  showWordCount = true,
  wordCount = 0,
  charCount = 0,
  readingTime = 0,
  className,
}) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);

  if (!editor) {
    return null;
  }

  // Text format options for dropdown
  const textFormatOptions = [
    { value: 'paragraph', label: 'Paragraph', icon: Type },
    { value: 'h1', label: 'Heading 1', icon: Heading1 },
    { value: 'h2', label: 'Heading 2', icon: Heading2 },
    { value: 'h3', label: 'Heading 3', icon: Heading3 },
    { value: 'code', label: 'Code Block', icon: Code2 },
    { value: 'quote', label: 'Quote', icon: Quote },
  ];

  // Get current text format
  const getCurrentFormat = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    if (editor.isActive('codeBlock')) return 'code';
    if (editor.isActive('blockquote')) return 'quote';
    return 'paragraph';
  };

  // Handle text format change
  const handleFormatChange = (format) => {
    switch (format) {
      case 'h1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'code':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'quote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      default:
        editor.chain().focus().setParagraph().run();
    }
  };

  // Handle link insertion
  const handleLinkInsert = (url, text) => {
    if (url) {
      if (text) {
        editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  // Handle table insertion
  const handleTableInsert = (rows, cols) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center flex-wrap gap-1 p-2',
          'bg-gray-50 dark:bg-gray-800',
          'border-b border-gray-200 dark:border-gray-700',
          'sticky top-0 z-10',
          className
        )}
        role="toolbar"
        aria-label="Text formatting toolbar"
      >
        {/* Text Format Dropdown */}
        <ToolbarDropdown
          value={getCurrentFormat()}
          options={textFormatOptions}
          onChange={handleFormatChange}
          disabled={!editor.can().setParagraph()}
        />

        <ToolbarDivider />

        {/* Text Formatting */}
        <ToolbarButton
          icon={Bold}
          title="Bold"
          shortcut="Ctrl+B"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().toggleBold()}
        />
        <ToolbarButton
          icon={Italic}
          title="Italic"
          shortcut="Ctrl+I"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().toggleItalic()}
        />
        <ToolbarButton
          icon={Underline}
          title="Underline"
          shortcut="Ctrl+U"
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().toggleUnderline()}
        />
        <ToolbarButton
          icon={Strikethrough}
          title="Strikethrough"
          shortcut="Ctrl+Shift+S"
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().toggleStrike()}
        />
        <ToolbarButton
          icon={Code}
          title="Inline Code"
          shortcut="Ctrl+E"
          isActive={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().toggleCode()}
        />

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          icon={List}
          title="Bullet List"
          shortcut="Ctrl+Shift+8"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!editor.can().toggleBulletList()}
        />
        <ToolbarButton
          icon={ListOrdered}
          title="Numbered List"
          shortcut="Ctrl+Shift+7"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!editor.can().toggleOrderedList()}
        />

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          icon={AlignLeft}
          title="Align Left"
          isActive={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          disabled={!editor.can().setTextAlign('left')}
        />
        <ToolbarButton
          icon={AlignCenter}
          title="Align Center"
          isActive={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          disabled={!editor.can().setTextAlign('center')}
        />
        <ToolbarButton
          icon={AlignRight}
          title="Align Right"
          isActive={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          disabled={!editor.can().setTextAlign('right')}
        />
        <ToolbarButton
          icon={AlignJustify}
          title="Justify"
          isActive={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          disabled={!editor.can().setTextAlign('justify')}
        />

        <ToolbarDivider />

        {/* Insert Options */}
        <ToolbarButton
          icon={LinkIcon}
          title="Insert Link"
          shortcut="Ctrl+K"
          isActive={editor.isActive('link')}
          onClick={() => setLinkDialogOpen(true)}
        />
        <ToolbarButton
          icon={Table}
          title="Insert Table"
          onClick={() => setTableDialogOpen(true)}
        />

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          icon={Undo}
          title="Undo"
          shortcut="Ctrl+Z"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          icon={Redo}
          title="Redo"
          shortcut="Ctrl+Y"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />

        {/* Word Count */}
        {showWordCount && (
          <>
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 px-2">
              <span title="Word count">{wordCount} words</span>
              <span title="Character count">{charCount} chars</span>
              {readingTime > 0 && (
                <span title="Estimated reading time">{readingTime} min read</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Dialogs */}
      <LinkDialog
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onInsert={handleLinkInsert}
        initialText={editor.state.selection.empty ? '' : editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)}
      />
      <TableDialog
        isOpen={tableDialogOpen}
        onClose={() => setTableDialogOpen(false)}
        onInsert={handleTableInsert}
      />
    </>
  );
}
