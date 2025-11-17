/**
 * Smart Template Engine for SUMRY
 *
 * Provides powerful template creation, editing, and rendering with:
 * - Variable substitution
 * - Conditional logic
 * - Template categories and validation
 * - Import/export capabilities
 * - Template versioning
 * - Auto-fill from student data
 */

// Template version for compatibility
export const TEMPLATE_VERSION = '1.0.0';

// Template categories
export const TEMPLATE_CATEGORIES = {
  READING: 'reading',
  MATH: 'math',
  WRITING: 'writing',
  BEHAVIOR: 'behavior',
  COMMUNICATION: 'communication',
  SOCIAL_SKILLS: 'social',
  MOTOR_SKILLS: 'motor',
  TRANSITION: 'transition',
  PROGRESS_MONITORING: 'progress',
  MEETING_NOTES: 'meeting',
  REPORTS: 'report',
  CUSTOM: 'custom',
};

// Variable types for smart field detection
export const VARIABLE_TYPES = {
  STUDENT: {
    studentName: 'Student name',
    studentAge: 'Student age',
    studentGrade: 'Student grade',
    studentId: 'Student ID',
    studentGender: 'Student gender/pronouns',
  },
  ACADEMIC: {
    currentLevel: 'Current performance level',
    baseline: 'Baseline measurement',
    target: 'Target goal',
    subject: 'Subject area',
    skill: 'Specific skill',
    accuracy: 'Accuracy percentage',
    frequency: 'Frequency of behavior',
  },
  DATES: {
    startDate: 'Start date',
    endDate: 'End date',
    reviewDate: 'Review date',
    meetingDate: 'Meeting date',
    currentDate: 'Current date',
    schoolYear: 'School year',
  },
  STAFF: {
    teacherName: 'Teacher name',
    caseManager: 'Case manager',
    provider: 'Service provider',
    evaluator: 'Evaluator name',
  },
  PROGRESS: {
    attempts: 'Number of attempts',
    trials: 'Number of trials',
    successRate: 'Success rate',
    progressLevel: 'Progress level',
    mastery: 'Mastery percentage',
  },
};

/**
 * Template class representing a single template
 */
export class Template {
  constructor({
    id = null,
    name = '',
    content = '',
    category = TEMPLATE_CATEGORIES.CUSTOM,
    description = '',
    variables = [],
    conditions = [],
    tags = [],
    isPublic = false,
    isFavorite = false,
    version = TEMPLATE_VERSION,
    createdAt = new Date(),
    updatedAt = new Date(),
    author = 'System',
  } = {}) {
    this.id = id || this.generateId();
    this.name = name;
    this.content = content;
    this.category = category;
    this.description = description;
    this.variables = variables;
    this.conditions = conditions;
    this.tags = tags;
    this.isPublic = isPublic;
    this.isFavorite = isFavorite;
    this.version = version;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.author = author;
  }

  generateId() {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      content: this.content,
      category: this.category,
      description: this.description,
      variables: this.variables,
      conditions: this.conditions,
      tags: this.tags,
      isPublic: this.isPublic,
      isFavorite: this.isFavorite,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      author: this.author,
    };
  }

  static fromJSON(data) {
    return new Template({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  clone() {
    return new Template({
      ...this.toJSON(),
      id: null, // Generate new ID
      name: `${this.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Template Engine - Core functionality
 */
export class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.favorites = new Set();
    this.recentTemplates = [];
    this.maxRecentTemplates = 10;
  }

  /**
   * Variable substitution with fallback values
   */
  substituteVariables(content, data = {}, options = {}) {
    const {
      fallback = '[Not Provided]',
      preserveUnknown = false,
      caseSensitive = false,
    } = options;

    let result = content;

    // Replace {{variable}} with actual values
    const variableRegex = /\{\{([^}]+)\}\}/g;
    result = result.replace(variableRegex, (match, varName) => {
      const trimmedVarName = varName.trim();
      const key = caseSensitive ? trimmedVarName : trimmedVarName.toLowerCase();

      // Search for matching key in data (case-insensitive if needed)
      const dataKeys = Object.keys(data);
      const matchingKey = caseSensitive
        ? dataKeys.find(k => k === key)
        : dataKeys.find(k => k.toLowerCase() === key);

      if (matchingKey && data[matchingKey] !== undefined && data[matchingKey] !== null) {
        return data[matchingKey];
      }

      return preserveUnknown ? match : fallback;
    });

    return result;
  }

  /**
   * Process conditional logic
   * Syntax: {{#if variable}}content{{/if}}
   * Syntax: {{#if variable}}content{{else}}alternate{{/if}}
   */
  processConditionals(content, data = {}) {
    let result = content;

    // Process if/else conditionals
    const conditionalRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;

    result = result.replace(conditionalRegex, (match, condition, trueContent, falseContent = '') => {
      const conditionTrimmed = condition.trim();
      const value = this.evaluateCondition(conditionTrimmed, data);

      return value ? trueContent : falseContent;
    });

    // Process unless conditionals (opposite of if)
    const unlessRegex = /\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
    result = result.replace(unlessRegex, (match, condition, content) => {
      const conditionTrimmed = condition.trim();
      const value = this.evaluateCondition(conditionTrimmed, data);

      return !value ? content : '';
    });

    return result;
  }

  /**
   * Evaluate a condition
   */
  evaluateCondition(condition, data) {
    // Handle comparison operators
    const comparisonRegex = /(.+?)\s*(===|!==|==|!=|>|>=|<|<=)\s*(.+)/;
    const match = condition.match(comparisonRegex);

    if (match) {
      const [, left, operator, right] = match;
      const leftValue = this.getValue(left.trim(), data);
      const rightValue = this.getValue(right.trim(), data);

      switch (operator) {
        case '===':
          return leftValue === rightValue;
        case '!==':
          return leftValue !== rightValue;
        case '==':
          return leftValue == rightValue;
        case '!=':
          return leftValue != rightValue;
        case '>':
          return Number(leftValue) > Number(rightValue);
        case '>=':
          return Number(leftValue) >= Number(rightValue);
        case '<':
          return Number(leftValue) < Number(rightValue);
        case '<=':
          return Number(leftValue) <= Number(rightValue);
        default:
          return false;
      }
    }

    // Simple truthy check
    const value = this.getValue(condition, data);
    return !!value;
  }

  /**
   * Get value from data or return as literal
   */
  getValue(expression, data) {
    expression = expression.trim();

    // Check if it's a quoted string
    if ((expression.startsWith('"') && expression.endsWith('"')) ||
        (expression.startsWith("'") && expression.endsWith("'"))) {
      return expression.slice(1, -1);
    }

    // Check if it's a number
    if (!isNaN(expression)) {
      return Number(expression);
    }

    // Check if it's a boolean
    if (expression === 'true') return true;
    if (expression === 'false') return false;

    // Otherwise, treat as variable name
    return data[expression];
  }

  /**
   * Extract variables from template content
   */
  extractVariables(content) {
    const variables = new Set();
    const variableRegex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const varName = match[1].trim();
      // Skip conditional directives
      if (!varName.startsWith('#') && !varName.startsWith('/')) {
        variables.add(varName);
      }
    }

    return Array.from(variables);
  }

  /**
   * Render template with data
   */
  render(template, data = {}, options = {}) {
    let content = typeof template === 'string' ? template : template.content;

    // Process conditionals first
    content = this.processConditionals(content, data);

    // Then substitute variables
    content = this.substituteVariables(content, data, options);

    return content;
  }

  /**
   * Validate template
   */
  validate(template) {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required');
    }

    if (!template.content || template.content.trim() === '') {
      errors.push('Template content is required');
    }

    if (!template.category) {
      warnings.push('Template category not specified');
    }

    // Check for unclosed tags
    const content = template.content || '';
    const openIf = (content.match(/\{\{#if/g) || []).length;
    const closeIf = (content.match(/\{\{\/if\}\}/g) || []).length;
    if (openIf !== closeIf) {
      errors.push('Mismatched {{#if}} and {{/if}} tags');
    }

    const openUnless = (content.match(/\{\{#unless/g) || []).length;
    const closeUnless = (content.match(/\{\{\/unless\}\}/g) || []).length;
    if (openUnless !== closeUnless) {
      errors.push('Mismatched {{#unless}} and {{/unless}} tags');
    }

    // Extract and validate variables
    const variables = this.extractVariables(content);
    if (variables.length === 0) {
      warnings.push('Template contains no variables');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      variables,
    };
  }

  /**
   * Add template to engine
   */
  addTemplate(template) {
    const validation = this.validate(template);
    if (!validation.isValid) {
      throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
    }

    this.templates.set(template.id, template);
    this.addToRecent(template.id);
    return template;
  }

  /**
   * Update template
   */
  updateTemplate(id, updates) {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }

    Object.assign(template, updates, { updatedAt: new Date() });

    const validation = this.validate(template);
    if (!validation.isValid) {
      throw new Error(`Invalid template: ${validation.errors.join(', ')}`);
    }

    this.templates.set(id, template);
    return template;
  }

  /**
   * Delete template
   */
  deleteTemplate(id) {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.favorites.delete(id);
      this.recentTemplates = this.recentTemplates.filter(tid => tid !== id);
    }
    return deleted;
  }

  /**
   * Get template by ID
   */
  getTemplate(id) {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Filter templates
   */
  filterTemplates(filters = {}) {
    const { category, search, tags, isFavorite } = filters;
    let templates = this.getAllTemplates();

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.content.toLowerCase().includes(searchLower)
      );
    }

    if (tags && tags.length > 0) {
      templates = templates.filter(t =>
        tags.some(tag => t.tags.includes(tag))
      );
    }

    if (isFavorite) {
      templates = templates.filter(t => this.favorites.has(t.id));
    }

    return templates;
  }

  /**
   * Toggle favorite
   */
  toggleFavorite(id) {
    if (this.favorites.has(id)) {
      this.favorites.delete(id);
      return false;
    } else {
      this.favorites.add(id);
      return true;
    }
  }

  /**
   * Add to recent templates
   */
  addToRecent(id) {
    // Remove if already exists
    this.recentTemplates = this.recentTemplates.filter(tid => tid !== id);

    // Add to front
    this.recentTemplates.unshift(id);

    // Limit size
    if (this.recentTemplates.length > this.maxRecentTemplates) {
      this.recentTemplates = this.recentTemplates.slice(0, this.maxRecentTemplates);
    }
  }

  /**
   * Get recent templates
   */
  getRecentTemplates() {
    return this.recentTemplates
      .map(id => this.templates.get(id))
      .filter(Boolean);
  }

  /**
   * Get favorite templates
   */
  getFavoriteTemplates() {
    return Array.from(this.favorites)
      .map(id => this.templates.get(id))
      .filter(Boolean);
  }

  /**
   * Export template to JSON
   */
  exportTemplate(id) {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }

    return JSON.stringify(template.toJSON(), null, 2);
  }

  /**
   * Export all templates
   */
  exportAllTemplates() {
    const data = {
      version: TEMPLATE_VERSION,
      exportDate: new Date().toISOString(),
      templates: this.getAllTemplates().map(t => t.toJSON()),
      favorites: Array.from(this.favorites),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import template from JSON
   */
  importTemplate(json) {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      const template = Template.fromJSON(data);

      // Generate new ID to avoid conflicts
      template.id = template.generateId();
      template.createdAt = new Date();
      template.updatedAt = new Date();

      return this.addTemplate(template);
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Import multiple templates
   */
  importTemplates(json) {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      const imported = [];

      if (data.templates && Array.isArray(data.templates)) {
        for (const templateData of data.templates) {
          const template = Template.fromJSON(templateData);
          template.id = template.generateId();
          template.createdAt = new Date();
          template.updatedAt = new Date();

          this.addTemplate(template);
          imported.push(template);
        }
      }

      return imported;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Auto-fill template with student data
   */
  autoFill(template, studentData = {}) {
    const suggestions = {};
    const variables = this.extractVariables(template.content);

    for (const variable of variables) {
      const varLower = variable.toLowerCase();

      // Match student info
      if (varLower.includes('name') || varLower === 'student') {
        suggestions[variable] = studentData.name || studentData.studentName;
      } else if (varLower.includes('age')) {
        suggestions[variable] = studentData.age;
      } else if (varLower.includes('grade')) {
        suggestions[variable] = studentData.grade;
      } else if (varLower.includes('id')) {
        suggestions[variable] = studentData.id || studentData.studentId;
      } else if (varLower.includes('gender') || varLower.includes('pronoun')) {
        suggestions[variable] = studentData.gender || studentData.pronouns;
      }
      // Match dates
      else if (varLower.includes('currentdate') || varLower === 'date') {
        suggestions[variable] = new Date().toLocaleDateString();
      } else if (varLower.includes('schoolyear')) {
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        suggestions[variable] = month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
      }
      // Match teacher/staff
      else if (varLower.includes('teacher')) {
        suggestions[variable] = studentData.teacher;
      } else if (varLower.includes('casemanager')) {
        suggestions[variable] = studentData.caseManager;
      }
    }

    return suggestions;
  }

  /**
   * Generate baseline/target suggestions based on category
   */
  suggestBaselineTarget(category, currentLevel = null) {
    const suggestions = {
      baseline: currentLevel || '',
      target: '',
      measurement: '',
    };

    switch (category) {
      case TEMPLATE_CATEGORIES.READING:
        suggestions.measurement = 'words per minute (WPM)';
        if (currentLevel) {
          suggestions.target = Math.round(currentLevel * 1.5);
        }
        break;

      case TEMPLATE_CATEGORIES.MATH:
        suggestions.measurement = 'problems correct out of 10 trials';
        if (currentLevel) {
          suggestions.target = Math.min(10, Math.round(currentLevel + 3));
        }
        break;

      case TEMPLATE_CATEGORIES.WRITING:
        suggestions.measurement = 'complete sentences with proper grammar';
        break;

      case TEMPLATE_CATEGORIES.BEHAVIOR:
        suggestions.measurement = 'occurrences per day';
        if (currentLevel) {
          suggestions.target = Math.max(0, Math.round(currentLevel * 0.5));
        }
        break;

      case TEMPLATE_CATEGORIES.COMMUNICATION:
        suggestions.measurement = 'appropriate responses in 4 out of 5 trials';
        break;

      default:
        suggestions.measurement = 'trials with 80% accuracy';
    }

    return suggestions;
  }

  /**
   * Clear all templates (use with caution)
   */
  clear() {
    this.templates.clear();
    this.favorites.clear();
    this.recentTemplates = [];
  }

  /**
   * Get statistics
   */
  getStats() {
    const templates = this.getAllTemplates();
    const categoryCounts = {};

    for (const category of Object.values(TEMPLATE_CATEGORIES)) {
      categoryCounts[category] = templates.filter(t => t.category === category).length;
    }

    return {
      total: templates.length,
      favorites: this.favorites.size,
      recent: this.recentTemplates.length,
      byCategory: categoryCounts,
      public: templates.filter(t => t.isPublic).length,
      custom: templates.filter(t => t.category === TEMPLATE_CATEGORIES.CUSTOM).length,
    };
  }
}

// Create singleton instance
export const templateEngine = new TemplateEngine();

// Export utility functions
export const createTemplate = (data) => new Template(data);
export const renderTemplate = (template, data, options) =>
  templateEngine.render(template, data, options);
export const validateTemplate = (template) =>
  templateEngine.validate(template);

export default templateEngine;
