/**
 * SUMRY Advanced Search Component
 *
 * Global search with:
 * - Instant search across all entities
 * - Fuzzy matching
 * - Autocomplete suggestions
 * - Recent searches
 * - Search history
 * - Keyboard shortcuts (Cmd+K)
 * - Category filters
 * - Date range filters
 * - Results highlighting
 * - Quick actions
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  ChevronRight,
  Filter,
  Download,
  Eye,
  Edit,
  Sparkles,
  BarChart3,
  ArrowRight,
  Command,
} from 'lucide-react';
import {
  buildIndex,
  search,
  getAutocompleteSuggestions,
} from '@/lib/search';
import { FilterPanel } from './FilterPanel';

// =============================================================================
// CONSTANTS
// =============================================================================

const RECENT_SEARCHES_KEY = 'sumry_recent_searches';
const MAX_RECENT_SEARCHES = 10;

const ENTITY_TYPES = {
  student: {
    label: 'Students',
    icon: Users,
    color: 'blue',
    fields: ['name', 'grade', 'disability'],
  },
  goal: {
    label: 'Goals',
    icon: TrendingUp,
    color: 'indigo',
    fields: ['description', 'area', 'baseline', 'target', 'metric'],
  },
  log: {
    label: 'Progress Logs',
    icon: BarChart3,
    color: 'sky',
    fields: ['notes', 'score', 'dateISO'],
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Load recent searches from localStorage
 */
function loadRecentSearches() {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save recent searches to localStorage
 */
function saveRecentSearches(searches) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // Ignore errors
  }
}

/**
 * Add search to recent searches
 */
function addRecentSearch(query) {
  if (!query || query.trim().length < 2) return;

  const recent = loadRecentSearches();
  const filtered = recent.filter(s => s.query !== query);
  filtered.unshift({
    query,
    timestamp: Date.now(),
  });

  saveRecentSearches(filtered.slice(0, MAX_RECENT_SEARCHES));
}

/**
 * Clear recent searches
 */
function clearRecentSearches() {
  saveRecentSearches([]);
}

/**
 * Highlight matching text
 */
function highlightText(text, query) {
  if (!query || !text) return text;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(queryLower);

  if (index === -1) return text;

  return (
    <>
      {text.substring(0, index)}
      <mark className="bg-yellow-200 text-slate-900 font-semibold">
        {text.substring(index, index + query.length)}
      </mark>
      {text.substring(index + query.length)}
    </>
  );
}

// =============================================================================
// ADVANCED SEARCH COMPONENT
// =============================================================================

export function AdvancedSearch({ isOpen, onClose, store, onNavigate }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(loadRecentSearches());
    }
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Build search index
  const searchIndex = useMemo(() => {
    const index = {
      students: buildIndex(store.students || [], ENTITY_TYPES.student.fields),
      goals: buildIndex(store.goals || [], ENTITY_TYPES.goal.fields),
      logs: buildIndex(store.logs || [], ENTITY_TYPES.log.fields),
    };

    return index;
  }, [store.students, store.goals, store.logs]);

  // Enrich data with related entities
  const enrichedData = useMemo(() => {
    const studentMap = new Map(store.students?.map(s => [s.id, s]) || []);
    const goalMap = new Map(store.goals?.map(g => [g.id, g]) || []);

    return {
      students: searchIndex.students,
      goals: searchIndex.goals.map(goal => ({
        ...goal,
        _student: studentMap.get(goal.studentId),
      })),
      logs: searchIndex.logs.map(log => {
        const goal = goalMap.get(log.goalId);
        const student = goal ? studentMap.get(goal.studentId) : null;
        return {
          ...log,
          _goal: goal,
          _student: student,
        };
      }),
    };
  }, [searchIndex, store.students, store.goals]);

  // Perform search
  const searchResults = useMemo(() => {
    if (!query && Object.keys(filters).length === 0) {
      return { students: [], goals: [], logs: [], total: 0 };
    }

    const searchOptions = {
      filters,
      minScore: query ? 1 : 0,
      limit: 50,
    };

    let results = {
      students: [],
      goals: [],
      logs: [],
      total: 0,
    };

    // Search each category
    if (selectedCategory === 'all' || selectedCategory === 'students') {
      const studentResults = search(enrichedData.students, query, searchOptions);
      results.students = studentResults.results;
      results.total += studentResults.total;
    }

    if (selectedCategory === 'all' || selectedCategory === 'goals') {
      const goalResults = search(enrichedData.goals, query, searchOptions);
      results.goals = goalResults.results;
      results.total += goalResults.total;
    }

    if (selectedCategory === 'all' || selectedCategory === 'logs') {
      const logResults = search(enrichedData.logs, query, searchOptions);
      results.logs = logResults.results;
      results.total += logResults.total;
    }

    return results;
  }, [query, filters, selectedCategory, enrichedData]);

  // Flatten results for navigation
  const flatResults = useMemo(() => {
    const flat = [];

    if (searchResults.students.length > 0) {
      flat.push({ type: 'header', category: 'students' });
      searchResults.students.forEach(item => {
        flat.push({ type: 'student', data: item });
      });
    }

    if (searchResults.goals.length > 0) {
      flat.push({ type: 'header', category: 'goals' });
      searchResults.goals.forEach(item => {
        flat.push({ type: 'goal', data: item });
      });
    }

    if (searchResults.logs.length > 0) {
      flat.push({ type: 'header', category: 'logs' });
      searchResults.logs.forEach(item => {
        flat.push({ type: 'log', data: item });
      });
    }

    return flat;
  }, [searchResults]);

  // Get autocomplete suggestions
  useEffect(() => {
    if (query && query.length >= 2) {
      const allEntities = [
        ...enrichedData.students,
        ...enrichedData.goals,
        ...enrichedData.logs,
      ];
      const sugg = getAutocompleteSuggestions(allEntities, query, 5);
      setSuggestions(sugg);
    } else {
      setSuggestions([]);
    }
  }, [query, enrichedData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            Math.min(prev + 1, flatResults.length - 1)
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (flatResults[selectedIndex]?.type !== 'header') {
            handleSelectResult(flatResults[selectedIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          if (query) {
            setQuery('');
          } else {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatResults, query, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const items = resultsRef.current.querySelectorAll('[data-result-item]');
      const selectedItem = items[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Handle search
  const handleSearch = useCallback((searchQuery) => {
    setQuery(searchQuery);
    setSelectedIndex(0);

    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      setRecentSearches(loadRecentSearches());
    }
  }, []);

  // Handle select result
  const handleSelectResult = useCallback((result) => {
    if (!result || result.type === 'header') return;

    onNavigate?.(result.type, result.data);
    onClose();
  }, [onNavigate, onClose]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(f => {
      if (Array.isArray(f?.value)) return f.value.length > 0;
      if (f?.min !== undefined || f?.max !== undefined) return true;
      if (f?.startDate || f?.endDate) return true;
      return false;
    }).length;
  }, [filters]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-3xl max-h-[80vh] p-0 gap-0 overflow-hidden',
          'bg-white/95 backdrop-blur-xl border-white/60 shadow-2xl',
          'rounded-2xl'
        )}
      >
        {/* Search Input */}
        <div className="relative border-b border-slate-200">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
            strokeWidth={2}
          />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search students, goals, progress logs..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className={cn(
              'w-full pl-12 pr-20 py-6 text-base border-0 focus-visible:ring-0',
              'bg-transparent placeholder:text-slate-400'
            )}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setQuery('')}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </Button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-semibold text-slate-500 bg-slate-100 rounded">
              <Command className="h-3 w-3" strokeWidth={2} />K
            </kbd>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'ghost'}
            onClick={() => setSelectedCategory('all')}
            className="flex-shrink-0"
          >
            All Results
          </Button>
          {Object.entries(ENTITY_TYPES).map(([key, config]) => {
            const Icon = config.icon;
            const count =
              key === 'students' ? searchResults.students.length :
              key === 'goals' ? searchResults.goals.length :
              searchResults.logs.length;

            return (
              <Button
                key={key}
                size="sm"
                variant={selectedCategory === key ? 'default' : 'ghost'}
                onClick={() => setSelectedCategory(key)}
                className="flex-shrink-0"
              >
                <Icon className="h-4 w-4 mr-2" strokeWidth={2} />
                {config.label}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex-shrink-0',
                activeFiltersCount > 0 && 'border-blue-500 text-blue-600'
              )}
            >
              <Filter className="h-4 w-4 mr-2" strokeWidth={2} />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            store={store}
            category={selectedCategory}
          />
        )}

        {/* Results */}
        <div
          ref={resultsRef}
          className="flex-1 overflow-y-auto max-h-[50vh] p-2"
        >
          {/* No query - show recent searches and suggestions */}
          {!query && Object.keys(filters).length === 0 && (
            <div className="p-4 space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" strokeWidth={2} />
                      Recent Searches
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        clearRecentSearches();
                        setRecentSearches([]);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((recent, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(recent.query)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg',
                          'hover:bg-slate-100 transition-colors',
                          'flex items-center gap-3 group'
                        )}
                      >
                        <Search className="h-4 w-4 text-slate-400 group-hover:text-slate-600" strokeWidth={2} />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900">
                          {recent.query}
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 ml-auto opacity-0 group-hover:opacity-100" strokeWidth={2} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Tips */}
              <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" strokeWidth={2} />
                  Search Tips
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span>Use quotes for exact phrases: <code className="bg-blue-100 px-1 rounded">"reading fluency"</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span>Exclude terms with minus: <code className="bg-blue-100 px-1 rounded">-behavior</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span>Search specific fields: <code className="bg-blue-100 px-1 rounded">area:math</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    <span>Use filters for advanced searches</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {query && suggestions.length > 0 && searchResults.total === 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Did you mean?
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    onClick={() => handleSearch(suggestion)}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {(query || Object.keys(filters).length > 0) && (
            <>
              {searchResults.total === 0 ? (
                <div className="p-12 text-center">
                  <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" strokeWidth={2} />
                  <p className="text-slate-600 font-medium">No results found</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {flatResults.map((item, idx) => {
                    if (item.type === 'header') {
                      const config = ENTITY_TYPES[item.category];
                      const Icon = config.icon;
                      return (
                        <div
                          key={`header-${item.category}`}
                          className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2"
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                          {config.label}
                        </div>
                      );
                    }

                    const isSelected = idx === selectedIndex;
                    const { type, data } = item;

                    return (
                      <ResultItem
                        key={`${type}-${data.id}`}
                        type={type}
                        data={data}
                        query={query}
                        isSelected={isSelected}
                        onClick={() => handleSelectResult(item)}
                        data-result-item
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {searchResults.total > 0 && (
          <div className="border-t border-slate-200 px-4 py-2 bg-slate-50/50">
            <p className="text-xs text-slate-500 text-center">
              Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''}
              {' • '}
              Use <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-slate-600">↑</kbd>
              {' '}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-slate-600">↓</kbd>
              {' '}to navigate
              {' • '}
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 text-slate-600">↵</kbd>
              {' '}to select
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// RESULT ITEM COMPONENT
// =============================================================================

function ResultItem({ type, data, query, isSelected, onClick }) {
  const renderContent = () => {
    switch (type) {
      case 'student':
        return (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-blue-600" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {highlightText(data.name, query)}
              </p>
              <p className="text-sm text-slate-600">
                Grade {data.grade}
                {data.disability && ` • ${highlightText(data.disability, query)}`}
              </p>
            </div>
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              Student
            </Badge>
          </div>
        );

      case 'goal':
        return (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-indigo-600" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {highlightText(data.description, query)}
              </p>
              <p className="text-sm text-slate-600">
                {data._student?.name} • {highlightText(data.area, query)}
                {data.target && ` • Target: ${data.target}`}
              </p>
            </div>
            <Badge variant="outline" className="border-indigo-200 text-indigo-700">
              Goal
            </Badge>
          </div>
        );

      case 'log':
        return (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-sky-600" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {data._student?.name} • {data._goal?.area}
              </p>
              <p className="text-sm text-slate-600">
                {data.dateISO} • Score: {highlightText(data.score, query)}
                {data.notes && ` • ${highlightText(data.notes, query)}`}
              </p>
            </div>
            <Badge variant="outline" className="border-sky-200 text-sky-700">
              Log
            </Badge>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-3 rounded-lg transition-all',
        'flex items-center gap-3 group',
        isSelected
          ? 'bg-blue-50 border-2 border-blue-500'
          : 'hover:bg-slate-50 border-2 border-transparent'
      )}
      data-result-item
    >
      {renderContent()}
      <ChevronRight
        className={cn(
          'h-5 w-5 flex-shrink-0 transition-opacity',
          isSelected ? 'text-blue-600 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'
        )}
        strokeWidth={2}
      />
    </button>
  );
}

export default AdvancedSearch;
