import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
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
} from '../editorUtils';

describe('editorUtils', () => {
  describe('htmlToMarkdown', () => {
    it('should convert headings to markdown', () => {
      expect(htmlToMarkdown('<h1>Title</h1>')).toContain('# Title');
      expect(htmlToMarkdown('<h2>Subtitle</h2>')).toContain('## Subtitle');
      expect(htmlToMarkdown('<h3>Section</h3>')).toContain('### Section');
    });

    it('should convert bold text', () => {
      expect(htmlToMarkdown('<strong>bold</strong>')).toBe('**bold**');
      expect(htmlToMarkdown('<b>bold</b>')).toBe('**bold**');
    });

    it('should convert italic text', () => {
      expect(htmlToMarkdown('<em>italic</em>')).toBe('*italic*');
      expect(htmlToMarkdown('<i>italic</i>')).toBe('*italic*');
    });

    it('should convert strikethrough text', () => {
      expect(htmlToMarkdown('<s>strike</s>')).toBe('~~strike~~');
      expect(htmlToMarkdown('<del>strike</del>')).toBe('~~strike~~');
    });

    it('should convert links', () => {
      const result = htmlToMarkdown('<a href="https://example.com">Link</a>');
      expect(result).toBe('[Link](https://example.com)');
    });

    it('should convert code', () => {
      expect(htmlToMarkdown('<code>code</code>')).toBe('`code`');
    });

    it('should convert lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = htmlToMarkdown(html);
      expect(result).toContain('- Item 1');
      expect(result).toContain('- Item 2');
    });

    it('should handle empty input', () => {
      expect(htmlToMarkdown('')).toBe('');
      expect(htmlToMarkdown(null)).toBe('');
    });
  });

  describe('markdownToHTML', () => {
    it('should convert headings to HTML', () => {
      expect(markdownToHTML('# Title')).toContain('<h1>Title</h1>');
      expect(markdownToHTML('## Subtitle')).toContain('<h2>Subtitle</h2>');
    });

    it('should convert bold text', () => {
      expect(markdownToHTML('**bold**')).toContain('<strong>bold</strong>');
    });

    it('should convert italic text', () => {
      expect(markdownToHTML('*italic*')).toContain('<em>italic</em>');
    });

    it('should convert strikethrough', () => {
      expect(markdownToHTML('~~strike~~')).toContain('<s>strike</s>');
    });

    it('should convert code', () => {
      expect(markdownToHTML('`code`')).toContain('<code>code</code>');
    });

    it('should convert links', () => {
      const result = markdownToHTML('[Link](https://example.com)');
      expect(result).toContain('<a href="https://example.com">Link</a>');
    });

    it('should handle empty input', () => {
      expect(markdownToHTML('')).toBe('');
      expect(markdownToHTML(null)).toBe('');
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const html = '<p>Safe</p><script>alert("XSS")</script>';
      const result = sanitizeHTML(html);
      expect(result).toContain('<p>Safe</p>');
      expect(result).not.toContain('<script>');
    });

    it('should remove event handlers', () => {
      const html = '<div onclick="alert()">Click</div>';
      const result = sanitizeHTML(html);
      expect(result).not.toContain('onclick');
    });

    it('should remove javascript: URLs', () => {
      const html = '<a href="javascript:alert()">Bad Link</a>';
      const result = sanitizeHTML(html);
      expect(result).not.toContain('javascript:');
    });

    it('should remove style tags', () => {
      const html = '<p>Safe</p><style>.bad{}</style>';
      const result = sanitizeHTML(html);
      expect(result).not.toContain('<style>');
    });

    it('should remove iframe tags', () => {
      const html = '<p>Safe</p><iframe src="bad.html"></iframe>';
      const result = sanitizeHTML(html);
      expect(result).not.toContain('<iframe>');
    });

    it('should handle empty input', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null)).toBe('');
    });
  });

  describe('isValidURL', () => {
    it('should validate HTTP URLs', () => {
      expect(isValidURL('http://example.com')).toBe(true);
      expect(isValidURL('https://example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('')).toBe(false);
      expect(isValidURL(null)).toBe(false);
    });

    it('should reject non-HTTP protocols', () => {
      expect(isValidURL('ftp://example.com')).toBe(false);
      expect(isValidURL('javascript:alert()')).toBe(false);
    });
  });

  describe('formatURL', () => {
    it('should add https:// to URLs without protocol', () => {
      expect(formatURL('example.com')).toBe('https://example.com');
      expect(formatURL('www.example.com')).toBe('https://www.example.com');
    });

    it('should preserve existing protocol', () => {
      expect(formatURL('http://example.com')).toBe('http://example.com');
      expect(formatURL('https://example.com')).toBe('https://example.com');
    });

    it('should handle empty input', () => {
      expect(formatURL('')).toBe('');
      expect(formatURL(null)).toBe('');
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(countWords('Hello world')).toBe(2);
      expect(countWords('One two three four')).toBe(4);
    });

    it('should handle HTML tags', () => {
      expect(countWords('<p>Hello <strong>world</strong></p>')).toBe(2);
    });

    it('should handle multiple spaces', () => {
      expect(countWords('Hello    world')).toBe(2);
    });

    it('should handle empty input', () => {
      expect(countWords('')).toBe(0);
      expect(countWords(null)).toBe(0);
    });
  });

  describe('countCharacters', () => {
    it('should count characters with spaces', () => {
      expect(countCharacters('Hello world', true)).toBe(11);
    });

    it('should count characters without spaces', () => {
      expect(countCharacters('Hello world', false)).toBe(10);
    });

    it('should handle HTML tags', () => {
      const html = '<p>Hello</p>';
      expect(countCharacters(html, true)).toBe(5);
    });

    it('should handle empty input', () => {
      expect(countCharacters('', true)).toBe(0);
      expect(countCharacters(null, true)).toBe(0);
    });
  });

  describe('getReadingTime', () => {
    it('should calculate reading time', () => {
      const text = 'word '.repeat(200); // 200 words
      expect(getReadingTime(text)).toBe(1);
    });

    it('should round up reading time', () => {
      const text = 'word '.repeat(250); // 250 words
      expect(getReadingTime(text)).toBe(2);
    });

    it('should handle custom words per minute', () => {
      const text = 'word '.repeat(300); // 300 words
      expect(getReadingTime(text, 100)).toBe(3); // 100 WPM
    });
  });

  describe('AutoSaveManager', () => {
    let saveCallback;
    let autoSave;

    beforeEach(() => {
      saveCallback = vi.fn().mockResolvedValue(undefined);
      autoSave = new AutoSaveManager({
        saveCallback,
        interval: 1000,
        debounceDelay: 100,
        enabled: true,
      });
    });

    afterEach(() => {
      if (autoSave) {
        autoSave.stop();
      }
    });

    it('should initialize correctly', () => {
      expect(autoSave.enabled).toBe(true);
      expect(autoSave.interval).toBe(1000);
      expect(autoSave.debounceDelay).toBe(100);
    });

    it('should mark content as dirty', () => {
      autoSave.markDirty('new content');
      expect(autoSave.isDirty).toBe(true);
    });

    it('should save when forced', async () => {
      autoSave.isDirty = true;
      await autoSave.forceSave();
      expect(saveCallback).toHaveBeenCalled();
    });

    it('should mark content as clean', () => {
      autoSave.markDirty('content');
      autoSave.markClean('content');
      expect(autoSave.isDirty).toBe(false);
    });

    it('should enable and disable', () => {
      autoSave.disable();
      expect(autoSave.enabled).toBe(false);
      autoSave.enable();
      expect(autoSave.enabled).toBe(true);
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a long text';
      const result = truncateText(text, 10);
      expect(result).toBe('This is...');
    });

    it('should not truncate short text', () => {
      const text = 'Short';
      const result = truncateText(text, 10);
      expect(result).toBe('Short');
    });

    it('should use custom ellipsis', () => {
      const text = 'This is a long text';
      const result = truncateText(text, 10, '…');
      expect(result).toBe('This is a…');
    });
  });

  describe('extractPlainText', () => {
    it('should extract plain text from HTML', () => {
      const html = '<p>Hello <strong>world</strong>!</p>';
      expect(extractPlainText(html)).toBe('Hello world!');
    });

    it('should decode HTML entities', () => {
      const html = '&lt;tag&gt; &amp; &quot;quote&quot;';
      expect(extractPlainText(html)).toBe('<tag> & "quote"');
    });

    it('should handle empty input', () => {
      expect(extractPlainText('')).toBe('');
      expect(extractPlainText(null)).toBe('');
    });
  });

  describe('createTableOfContents', () => {
    it('should create TOC from headings', () => {
      const html = `
        <h1>Title</h1>
        <h2>Subtitle</h2>
        <h3>Section</h3>
      `;
      const toc = createTableOfContents(html);
      expect(toc).toHaveLength(3);
      expect(toc[0].level).toBe(1);
      expect(toc[0].text).toBe('Title');
      expect(toc[1].level).toBe(2);
      expect(toc[2].level).toBe(3);
    });

    it('should generate slugs', () => {
      const html = '<h1>Hello World</h1>';
      const toc = createTableOfContents(html);
      expect(toc[0].slug).toBe('hello-world');
    });

    it('should handle empty input', () => {
      expect(createTableOfContents('')).toEqual([]);
      expect(createTableOfContents(null)).toEqual([]);
    });
  });

  describe('slugify', () => {
    it('should create valid slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Title With Spaces')).toBe('title-with-spaces');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello @#$ World!')).toBe('hello-world');
    });

    it('should handle multiple separators', () => {
      expect(slugify('Hello   World')).toBe('hello-world');
      expect(slugify('Hello___World')).toBe('hello-world');
    });

    it('should trim separators', () => {
      expect(slugify('-Hello World-')).toBe('hello-world');
    });
  });
});
