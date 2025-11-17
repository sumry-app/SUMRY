# SUMRY Advanced Search & Filtering System

A comprehensive, lightning-fast search and filtering system for SUMRY that provides instant access to all your students, goals, and progress logs.

## Features

### 🔍 **Instant Global Search**
- Search across all entities (students, goals, progress logs) simultaneously
- Real-time results as you type
- Fuzzy matching to find results even with typos
- Relevance-based scoring for best results first

### ⌨️ **Keyboard Shortcuts**
- **`Cmd+K`** (Mac) or **`Ctrl+K`** (Windows/Linux) - Open search from anywhere
- **`↑` / `↓`** - Navigate through results
- **`Enter`** - Select and navigate to result
- **`Esc`** - Clear search or close modal

### 🎯 **Smart Filtering**
- **Multi-select filters** - Filter by students, goal areas, grades
- **Date range filters** - Find logs within specific date ranges
- **Score range filters** - Filter progress logs by score ranges
- **Saved filter presets** - Save your favorite filter combinations
- **Active filter badges** - See all active filters at a glance

### 🔎 **Advanced Search Operators**

#### Exact Phrase Matching
Use quotes for exact phrases:
```
"reading fluency"
```

#### Exclude Terms
Use minus sign to exclude terms:
```
math -behavior
```

#### Field-Specific Search
Search within specific fields:
```
area:math
area:reading
grade:3
```

#### Boolean Operators
Combine search terms with AND/OR logic automatically applied

### 💡 **Autocomplete & Suggestions**
- Smart autocomplete suggestions as you type
- "Did you mean?" suggestions for better results
- Recent searches for quick access to previous queries

### 📊 **Search Results**
- **Organized by category** - Students, Goals, and Logs grouped separately
- **Result highlighting** - Matched text highlighted in results
- **Rich previews** - See relevant details without opening
- **Quick navigation** - Click or press Enter to navigate to full view

### 🎨 **Beautiful UI**
- Spotlight/Command Palette inspired design
- Smooth animations and transitions
- Responsive and mobile-friendly
- Dark mode support (if enabled in app)

## Usage Guide

### Opening Search

**Method 1: Keyboard Shortcut**
- Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)

**Method 2: Search Button**
- Click the "Search" button in the header

### Basic Search

1. Type your search query
2. Results appear instantly as you type
3. Use arrow keys to navigate or click a result
4. Press Enter or click to navigate to the item

### Using Filters

1. Click the "Filters" button
2. Expand the filter sections you want to use
3. Select your filter criteria:
   - **Students** - Select specific students
   - **Goal Areas** - Filter by Reading, Math, Writing, etc.
   - **Grades** - Filter by grade level
   - **Date Range** - Set start and end dates
   - **Score Range** - Set min/max scores
4. Results update automatically
5. Click "Clear All" to remove all filters

### Saving Filter Presets

1. Configure your desired filters
2. Enter a name in the "Save current filters as preset" field
3. Click "Save"
4. Your preset will appear at the top of the filter panel
5. Click a preset to quickly apply those filters

### Search Tips

**For Students:**
- Search by name, grade, or disability
- Example: `John`, `grade 3`, `autism`

**For Goals:**
- Search by description, area, student name
- Example: `reading fluency`, `math computation`, `John's goals`

**For Progress Logs:**
- Search by notes, scores, dates, student names
- Example: `90%`, `2024-01`, `great progress`

**Advanced Techniques:**
- Combine multiple terms: `john reading fluency`
- Use exact phrases: `"will read grade-level text"`
- Exclude terms: `goals -behavior`
- Search specific fields: `area:math grade:3`

## Technical Details

### Architecture

The search system consists of three main components:

1. **`src/lib/search.js`** - Core search engine
   - Fuzzy matching algorithm (Levenshtein distance)
   - Search indexing for performance
   - Relevance scoring
   - Filter combinations
   - Search caching

2. **`src/components/search/AdvancedSearch.jsx`** - Main search UI
   - Search input with autocomplete
   - Category tabs
   - Results display
   - Keyboard navigation
   - Recent searches

3. **`src/components/search/FilterPanel.jsx`** - Advanced filters
   - Multi-select filters
   - Range filters
   - Date filters
   - Filter presets
   - Active filter badges

### Performance Optimizations

- **Search Indexing** - Pre-processes all searchable text for instant results
- **Token-based Matching** - Indexes word prefixes for fast autocomplete
- **Search Caching** - Caches recent searches to avoid re-computation
- **Debouncing** - Prevents excessive re-renders while typing
- **Virtual Scrolling** - Efficient rendering of large result sets
- **Memoization** - React.useMemo for expensive computations

### Search Algorithm

The search engine uses a multi-factor relevance scoring system:

1. **Exact Match Boost** (10 points) - Exact text matches
2. **Prefix Match Boost** (5 points) - Matches at the start of text
3. **Fuzzy Match Boost** (2 points) - Similar words (typo tolerance)
4. **Token Match Boost** (1 point) - Individual word matches

Results are sorted by relevance score, ensuring the best matches appear first.

### Fuzzy Matching

Uses **Levenshtein distance** algorithm to calculate similarity between strings:
- Allows for typos and misspellings
- Configurable similarity threshold (default: 60%)
- Helps find results even with imperfect queries

### Data Indexing

On initialization, the system:
1. Tokenizes all searchable fields
2. Creates prefix tokens for autocomplete (2-8 characters)
3. Stores lowercase versions for case-insensitive search
4. Attaches index to each entity for fast lookup

### Filter Logic

- **AND Logic** (default) - All filters must match
- **OR Logic** - Any filter can match
- **Range Filters** - Min/max values for scores and dates
- **Multi-Select** - Multiple values in array filters
- **Preset Storage** - Saved in localStorage for persistence

## Accessibility

- Full keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Semantic HTML structure
- High contrast text
- Clear visual indicators

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements for future versions:

- [ ] Export search results to CSV/PDF
- [ ] Share search URLs with filters
- [ ] Search history analytics
- [ ] AI-powered search suggestions
- [ ] Voice search integration
- [ ] Search within attachments/notes
- [ ] Saved searches with notifications
- [ ] Search result previews
- [ ] Bulk actions on search results
- [ ] Search performance metrics

## API Reference

### Search Engine (`src/lib/search.js`)

#### `search(entities, query, options)`
Performs a search with scoring and filtering.

**Parameters:**
- `entities` - Array of entities to search
- `query` - Search query string
- `options` - Search options object
  - `filters` - Filter object
  - `filterLogic` - 'AND' or 'OR'
  - `minScore` - Minimum relevance score
  - `limit` - Max results
  - `offset` - Pagination offset
  - `sortBy` - Sort field
  - `sortOrder` - 'asc' or 'desc'

**Returns:**
```javascript
{
  results: [],      // Array of matching entities
  total: 0,         // Total matches
  hasMore: false,   // More results available
  page: 1,          // Current page
  totalPages: 1     // Total pages
}
```

#### `buildIndex(entities, fields)`
Creates search index for entities.

**Parameters:**
- `entities` - Array of entities
- `fields` - Array of field names to index

**Returns:** Array of indexed entities

#### `fuzzyMatch(query, target, threshold)`
Checks if strings fuzzy match.

**Parameters:**
- `query` - Query string
- `target` - Target string
- `threshold` - Similarity threshold (0-1)

**Returns:** Boolean

### Components

#### `<AdvancedSearch>`
Main search component.

**Props:**
- `isOpen` - Boolean, controls visibility
- `onClose` - Function, close handler
- `store` - Object, data store with students/goals/logs
- `onNavigate` - Function, navigation handler

#### `<FilterPanel>`
Filter panel component.

**Props:**
- `filters` - Object, current filters
- `onChange` - Function, filter change handler
- `store` - Object, data store
- `category` - String, current category filter

## Troubleshooting

### Search not opening
- Check that keyboard shortcuts aren't blocked
- Try clicking the search button in header
- Check browser console for errors

### No results found
- Try different search terms
- Remove filters
- Check for typos
- Use fuzzy matching features

### Slow performance
- Clear search cache: `searchCache.clear()`
- Reduce data set size
- Check browser performance

### Filter presets not saving
- Check localStorage availability
- Verify browser storage isn't full
- Check browser privacy settings

## Credits

Built with:
- React 18
- Vite
- Tailwind CSS
- shadcn/ui components
- Lucide Icons
- Recharts

## License

Part of the SUMRY IEP Management System.
