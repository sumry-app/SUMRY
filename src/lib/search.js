/**
 * SUMRY Search Engine
 *
 * Advanced search and filtering system with:
 * - Full-text search across all entities
 * - Fuzzy matching (Levenshtein distance)
 * - Search indexing for performance
 * - Relevance scoring
 * - Filter combinations (AND/OR logic)
 * - Sort options
 * - Pagination
 * - Search caching
 */

// =============================================================================
// FUZZY MATCHING - Levenshtein Distance
// =============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Edit distance
 */
export function levenshteinDistance(a, b) {
  if (!a || !b) return Math.max(a?.length || 0, b?.length || 0);

  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score between two strings (0-1)
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Similarity score (0-1)
 */
export function similarityScore(a, b) {
  if (!a || !b) return 0;

  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);

  return 1 - (distance / maxLength);
}

/**
 * Check if strings are fuzzy match
 * @param {string} query - Query string
 * @param {string} target - Target string
 * @param {number} threshold - Similarity threshold (0-1)
 * @returns {boolean}
 */
export function fuzzyMatch(query, target, threshold = 0.6) {
  if (!query || !target) return false;

  const score = similarityScore(query, target);
  return score >= threshold;
}

// =============================================================================
// SEARCH INDEXING
// =============================================================================

/**
 * Create search index for an entity
 * @param {object} entity - Entity object
 * @param {string[]} fields - Fields to index
 * @returns {object} - Indexed entity
 */
export function createIndex(entity, fields) {
  const tokens = new Set();

  fields.forEach(field => {
    const value = entity[field];
    if (!value) return;

    const str = String(value).toLowerCase();

    // Tokenize by word boundaries
    const words = str.split(/\s+/);
    words.forEach(word => {
      if (word.length > 0) {
        tokens.add(word);

        // Add prefixes for autocomplete (min 2 chars)
        for (let i = 2; i <= Math.min(word.length, 8); i++) {
          tokens.add(word.substring(0, i));
        }
      }
    });
  });

  return {
    ...entity,
    _searchTokens: Array.from(tokens),
    _searchText: fields.map(f => entity[f]).filter(Boolean).join(' ').toLowerCase()
  };
}

/**
 * Build search index for multiple entities
 * @param {object[]} entities - Array of entities
 * @param {string[]} fields - Fields to index
 * @returns {object[]} - Indexed entities
 */
export function buildIndex(entities, fields) {
  return entities.map(entity => createIndex(entity, fields));
}

// =============================================================================
// SEARCH SCORING
// =============================================================================

/**
 * Calculate relevance score for search result
 * @param {object} entity - Entity with search index
 * @param {string} query - Search query
 * @param {object} options - Scoring options
 * @returns {number} - Relevance score
 */
export function calculateRelevanceScore(entity, query, options = {}) {
  const {
    exactMatchBoost = 10,
    prefixMatchBoost = 5,
    fuzzyMatchBoost = 2,
    tokenMatchBoost = 1,
  } = options;

  if (!entity._searchText || !query) return 0;

  const queryLower = query.toLowerCase().trim();
  const searchText = entity._searchText;
  let score = 0;

  // Exact match
  if (searchText.includes(queryLower)) {
    score += exactMatchBoost;

    // Bonus if at start
    if (searchText.startsWith(queryLower)) {
      score += prefixMatchBoost;
    }
  }

  // Token matches
  if (entity._searchTokens) {
    entity._searchTokens.forEach(token => {
      // Exact token match
      if (token === queryLower) {
        score += tokenMatchBoost * 2;
      }
      // Prefix match
      else if (token.startsWith(queryLower)) {
        score += tokenMatchBoost;
      }
      // Fuzzy match
      else if (fuzzyMatch(queryLower, token, 0.7)) {
        score += fuzzyMatchBoost;
      }
    });
  }

  // Fuzzy match on full text
  const words = searchText.split(/\s+/);
  words.forEach(word => {
    if (fuzzyMatch(queryLower, word, 0.75)) {
      score += fuzzyMatchBoost;
    }
  });

  return score;
}

// =============================================================================
// SEARCH FILTERS
// =============================================================================

/**
 * Apply filters to entities
 * @param {object[]} entities - Array of entities
 * @param {object} filters - Filter object
 * @param {string} logic - 'AND' or 'OR'
 * @returns {object[]} - Filtered entities
 */
export function applyFilters(entities, filters, logic = 'AND') {
  if (!filters || Object.keys(filters).length === 0) {
    return entities;
  }

  return entities.filter(entity => {
    const filterResults = Object.entries(filters).map(([key, filter]) => {
      if (!filter) return true;

      // Array filter (multi-select)
      if (Array.isArray(filter.value) && filter.value.length > 0) {
        return filter.value.includes(entity[key]);
      }

      // Range filter
      if (filter.min !== undefined || filter.max !== undefined) {
        const value = parseFloat(entity[key]);
        if (isNaN(value)) return false;

        if (filter.min !== undefined && value < filter.min) return false;
        if (filter.max !== undefined && value > filter.max) return false;

        return true;
      }

      // Date range filter
      if (filter.startDate || filter.endDate) {
        const date = entity[key];
        if (!date) return false;

        if (filter.startDate && date < filter.startDate) return false;
        if (filter.endDate && date > filter.endDate) return false;

        return true;
      }

      // Exact match
      if (filter.value !== undefined && filter.value !== null) {
        return entity[key] === filter.value;
      }

      return true;
    });

    // Apply AND/OR logic
    if (logic === 'AND') {
      return filterResults.every(result => result);
    } else {
      return filterResults.some(result => result);
    }
  });
}

// =============================================================================
// SEARCH OPERATORS
// =============================================================================

/**
 * Parse search query with operators
 * @param {string} query - Search query
 * @returns {object} - Parsed query
 */
export function parseSearchQuery(query) {
  if (!query) return { terms: [], exact: [], exclude: [], field: null };

  const result = {
    terms: [],
    exact: [],
    exclude: [],
    field: null
  };

  // Extract exact phrases (quoted)
  const exactMatches = query.match(/"([^"]+)"/g);
  if (exactMatches) {
    result.exact = exactMatches.map(m => m.replace(/"/g, ''));
    query = query.replace(/"([^"]+)"/g, '');
  }

  // Extract exclusions (-)
  const exclusions = query.match(/-(\w+)/g);
  if (exclusions) {
    result.exclude = exclusions.map(m => m.substring(1));
    query = query.replace(/-(\w+)/g, '');
  }

  // Extract field search (field:value)
  const fieldMatch = query.match(/(\w+):(\w+)/);
  if (fieldMatch) {
    result.field = { name: fieldMatch[1], value: fieldMatch[2] };
    query = query.replace(/(\w+):(\w+)/, '');
  }

  // Extract regular terms
  result.terms = query
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0);

  return result;
}

/**
 * Search with operators support
 * @param {object[]} entities - Indexed entities
 * @param {string} query - Search query
 * @returns {object[]} - Matching entities
 */
export function searchWithOperators(entities, query) {
  const parsed = parseSearchQuery(query);

  return entities.filter(entity => {
    const searchText = entity._searchText || '';

    // Check exact phrases
    if (parsed.exact.length > 0) {
      const hasAll = parsed.exact.every(phrase =>
        searchText.includes(phrase.toLowerCase())
      );
      if (!hasAll) return false;
    }

    // Check exclusions
    if (parsed.exclude.length > 0) {
      const hasAny = parsed.exclude.some(term =>
        searchText.includes(term.toLowerCase())
      );
      if (hasAny) return false;
    }

    // Check field search
    if (parsed.field) {
      const fieldValue = String(entity[parsed.field.name] || '').toLowerCase();
      if (!fieldValue.includes(parsed.field.value.toLowerCase())) {
        return false;
      }
    }

    // Check regular terms (OR logic)
    if (parsed.terms.length > 0) {
      return parsed.terms.some(term =>
        searchText.includes(term.toLowerCase())
      );
    }

    return true;
  });
}

// =============================================================================
// MAIN SEARCH FUNCTION
// =============================================================================

/**
 * Search entities with scoring and filtering
 * @param {object[]} entities - Array of entities
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {object[]} - Search results with scores
 */
export function search(entities, query, options = {}) {
  const {
    filters = {},
    filterLogic = 'AND',
    minScore = 0,
    limit = 50,
    offset = 0,
    sortBy = 'relevance',
    sortOrder = 'desc',
    useOperators = true,
  } = options;

  let results = [...entities];

  // Apply filters first
  results = applyFilters(results, filters, filterLogic);

  // Apply search query
  if (query && query.trim()) {
    if (useOperators) {
      results = searchWithOperators(results, query);
    }

    // Calculate relevance scores
    results = results.map(entity => ({
      ...entity,
      _relevanceScore: calculateRelevanceScore(entity, query, options)
    }));

    // Filter by minimum score
    results = results.filter(r => r._relevanceScore >= minScore);
  } else {
    // No query, set default score
    results = results.map(entity => ({
      ...entity,
      _relevanceScore: 0
    }));
  }

  // Sort results
  if (sortBy === 'relevance') {
    results.sort((a, b) => {
      const scoreA = a._relevanceScore || 0;
      const scoreB = b._relevanceScore || 0;
      return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
    });
  } else if (sortBy) {
    results.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      if (valueA === valueB) return 0;

      const comparison = valueA < valueB ? -1 : 1;
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Apply pagination
  const total = results.length;
  results = results.slice(offset, offset + limit);

  return {
    results,
    total,
    hasMore: offset + limit < total,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit)
  };
}

// =============================================================================
// AUTOCOMPLETE / SUGGESTIONS
// =============================================================================

/**
 * Get autocomplete suggestions
 * @param {object[]} entities - Indexed entities
 * @param {string} query - Query string
 * @param {number} limit - Max suggestions
 * @returns {string[]} - Suggestions
 */
export function getAutocompleteSuggestions(entities, query, limit = 5) {
  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();
  const suggestions = new Set();

  entities.forEach(entity => {
    if (!entity._searchTokens) return;

    entity._searchTokens.forEach(token => {
      if (token.startsWith(queryLower) && token.length > queryLower.length) {
        suggestions.add(token);
      }
    });
  });

  return Array.from(suggestions)
    .slice(0, limit * 2)
    .sort((a, b) => {
      // Prioritize shorter, more exact matches
      const lenDiff = a.length - b.length;
      if (lenDiff !== 0) return lenDiff;
      return a.localeCompare(b);
    })
    .slice(0, limit);
}

// =============================================================================
// SEARCH CACHE
// =============================================================================

class SearchCache {
  constructor(maxSize = 50, ttl = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl; // Time to live in ms
  }

  _getCacheKey(query, filters, options) {
    return JSON.stringify({ query, filters, options });
  }

  get(query, filters, options) {
    const key = this._getCacheKey(query, filters, options);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.results;
  }

  set(query, filters, options, results) {
    const key = this._getCacheKey(query, filters, options);

    // Evict oldest if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      results,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  invalidate(pattern) {
    if (!pattern) {
      this.clear();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}

export const searchCache = new SearchCache();

// =============================================================================
// CACHED SEARCH
// =============================================================================

/**
 * Search with caching
 * @param {object[]} entities - Array of entities
 * @param {string} query - Search query
 * @param {object} options - Search options
 * @returns {object} - Search results
 */
export function cachedSearch(entities, query, options = {}) {
  const { filters = {}, ...searchOptions } = options;

  // Try to get from cache
  const cached = searchCache.get(query, filters, searchOptions);
  if (cached) {
    return cached;
  }

  // Perform search
  const results = search(entities, query, options);

  // Cache results
  searchCache.set(query, filters, searchOptions, results);

  return results;
}

// =============================================================================
// EXPORT ALL
// =============================================================================

export default {
  // Fuzzy matching
  levenshteinDistance,
  similarityScore,
  fuzzyMatch,

  // Indexing
  createIndex,
  buildIndex,

  // Scoring
  calculateRelevanceScore,

  // Filtering
  applyFilters,

  // Operators
  parseSearchQuery,
  searchWithOperators,

  // Search
  search,
  cachedSearch,

  // Autocomplete
  getAutocompleteSuggestions,

  // Cache
  searchCache,
};
