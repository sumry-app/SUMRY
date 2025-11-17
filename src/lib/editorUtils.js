/**
 * Rich Text Editor Utilities
 * Provides conversion, sanitization, and management utilities for the editor
 */

/**
 * Converts HTML to Markdown
 * @param {string} html - HTML string to convert
 * @returns {string} Markdown formatted string
 */
export function htmlToMarkdown(html) {
  if (!html) return '';

  let markdown = html;

  // Remove script and style tags
  markdown = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  markdown = markdown.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Headers
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');

  // Italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Strikethrough
  markdown = markdown.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  markdown = markdown.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');
  markdown = markdown.replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~');

  // Code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '\n```\n$1\n```\n');
  markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '\n```\n$1\n```\n');

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
    const lines = content.trim().split('\n');
    return lines.map(line => `> ${line}`).join('\n') + '\n\n';
  });

  // Links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)');

  // Lists - Unordered
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    let list = content.replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n');
    return '\n' + list + '\n';
  });

  // Lists - Ordered
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let index = 1;
    let list = content.replace(/<li[^>]*>(.*?)<\/li>/gis, () => {
      return `${index++}. $1\n`;
    });
    return '\n' + list + '\n';
  });

  // Horizontal rule
  markdown = markdown.replace(/<hr[^>]*>/gi, '\n---\n');

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gis, '$1\n\n');

  // Line breaks
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  markdown = decodeHTMLEntities(markdown);

  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();

  return markdown;
}

/**
 * Converts Markdown to HTML
 * @param {string} markdown - Markdown string to convert
 * @returns {string} HTML formatted string
 */
export function markdownToHTML(markdown) {
  if (!markdown) return '';

  let html = markdown;

  // Escape HTML to prevent XSS
  html = html.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (must be before inline code)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Bold (must be before italic)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Unordered lists
  html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^[-*_]{3,}$/gm, '<hr />');

  // Paragraphs
  html = html.replace(/^(?!<[hubi]|<blockquote|<pre|<hr)(.+)$/gm, '<p>$1</p>');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}

/**
 * Decodes HTML entities
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
function decodeHTMLEntities(text) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  return text.replace(/&[^;]+;/g, entity => entities[entity] || entity);
}

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (!html) return '';

  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/href="javascript:[^"]*"/gi, 'href="#"');
  sanitized = sanitized.replace(/src="javascript:[^"]*"/gi, 'src=""');

  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove object and embed tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*>/gi, '');

  return sanitized;
}

/**
 * Validates a URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidURL(url) {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Formats a URL to ensure it has a protocol
 * @param {string} url - URL to format
 * @returns {string} Formatted URL
 */
export function formatURL(url) {
  if (!url) return '';

  const trimmed = url.trim();

  // If it already has a protocol, return it
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Add https:// if missing
  return `https://${trimmed}`;
}

/**
 * Counts words in text
 * @param {string} text - Text to count
 * @returns {number} Word count
 */
export function countWords(text) {
  if (!text) return 0;

  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, '');

  // Split by whitespace and filter empty strings
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);

  return words.length;
}

/**
 * Counts characters in text
 * @param {string} text - Text to count
 * @param {boolean} includeSpaces - Whether to include spaces
 * @returns {number} Character count
 */
export function countCharacters(text, includeSpaces = true) {
  if (!text) return 0;

  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, '');

  if (includeSpaces) {
    return plainText.length;
  }

  return plainText.replace(/\s/g, '').length;
}

/**
 * Gets reading time estimate
 * @param {string} text - Text to analyze
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {number} Estimated reading time in minutes
 */
export function getReadingTime(text, wordsPerMinute = 200) {
  const words = countWords(text);
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Auto-save manager class
 */
export class AutoSaveManager {
  constructor(options = {}) {
    this.saveCallback = options.saveCallback || (() => {});
    this.interval = options.interval || 30000; // 30 seconds default
    this.debounceDelay = options.debounceDelay || 1000; // 1 second default
    this.enabled = options.enabled !== false;

    this.timer = null;
    this.debounceTimer = null;
    this.lastSavedContent = null;
    this.isDirty = false;
  }

  /**
   * Starts the auto-save manager
   */
  start() {
    if (!this.enabled) return;

    this.timer = setInterval(() => {
      if (this.isDirty) {
        this.save();
      }
    }, this.interval);
  }

  /**
   * Stops the auto-save manager
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Marks content as changed
   * @param {string} content - Current content
   */
  markDirty(content) {
    if (content !== this.lastSavedContent) {
      this.isDirty = true;

      // Debounce save
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        if (this.isDirty) {
          this.save();
        }
      }, this.debounceDelay);
    }
  }

  /**
   * Saves content
   */
  async save() {
    try {
      await this.saveCallback();
      this.lastSavedContent = null; // Will be set by markClean
      this.isDirty = false;
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  /**
   * Marks content as saved
   * @param {string} content - Saved content
   */
  markClean(content) {
    this.lastSavedContent = content;
    this.isDirty = false;
  }

  /**
   * Forces immediate save
   */
  async forceSave() {
    if (this.isDirty) {
      await this.save();
    }
  }

  /**
   * Enables auto-save
   */
  enable() {
    this.enabled = true;
    this.start();
  }

  /**
   * Disables auto-save
   */
  disable() {
    this.enabled = false;
    this.stop();
  }
}

/**
 * Truncates text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} ellipsis - Ellipsis string (default: '...')
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength, ellipsis = '...') {
  if (!text || text.length <= maxLength) return text;

  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Extracts plain text from HTML
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function extractPlainText(html) {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Creates a table of contents from HTML headers
 * @param {string} html - HTML string
 * @returns {Array} Table of contents entries
 */
export function createTableOfContents(html) {
  if (!html) return [];

  const toc = [];
  const headerRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  let id = 0;

  while ((match = headerRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = extractPlainText(match[2]);

    toc.push({
      id: `heading-${id++}`,
      level,
      text,
      slug: text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
    });
  }

  return toc;
}

/**
 * Generates a slug from text
 * @param {string} text - Text to slugify
 * @returns {string} Slug
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
