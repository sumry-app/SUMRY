# Advanced Search Usage Examples

## Basic Usage in App

The search has already been integrated into the main App component. Here's how it works:

### Opening Search

**Keyboard Shortcut:**
```
Cmd+K (Mac) or Ctrl+K (Windows/Linux)
```

**Via Button:**
Click the "Search" button in the header (includes the ⌘K hint)

### Search Query Examples

#### Search for Students
```
John Doe
grade 3
autism
```

#### Search for Goals
```
reading fluency
math computation
will read
```

#### Search for Progress Logs
```
90%
2024-01-15
great progress
excellent improvement
```

#### Advanced Search Operators

**Exact Phrase:**
```
"reading fluency goal"
```

**Exclude Terms:**
```
math -behavior
goals -reading
```

**Field-Specific Search:**
```
area:math
area:reading
grade:3
```

## Programmatic Usage

If you want to use the search components in other parts of your app:

### Import the Search Component

```javascript
import { AdvancedSearch } from '@/components/search';

function MyComponent() {
  const [showSearch, setShowSearch] = useState(false);
  const { store } = usePersistentStore();

  const handleNavigate = (type, data) => {
    console.log('Navigating to:', type, data);
    // Handle navigation based on result type
  };

  return (
    <>
      <Button onClick={() => setShowSearch(true)}>
        Open Search
      </Button>

      <AdvancedSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        store={store}
        onNavigate={handleNavigate}
      />
    </>
  );
}
```

### Using the Search Engine Directly

```javascript
import { search, buildIndex } from '@/lib/search';

// Index your data
const indexedStudents = buildIndex(students, ['name', 'grade', 'disability']);

// Perform search
const results = search(indexedStudents, 'john', {
  limit: 10,
  minScore: 1,
  sortBy: 'relevance',
  sortOrder: 'desc'
});

console.log(results.results); // Array of matching students
console.log(results.total);   // Total matches
```

### Using Filters Programmatically

```javascript
import { applyFilters } from '@/lib/search';

const filters = {
  grade: {
    value: ['3', '4', '5']  // Multi-select
  },
  score: {
    min: 70,
    max: 100
  },
  dateISO: {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
};

const filtered = applyFilters(students, filters, 'AND');
```

### Fuzzy Matching

```javascript
import { fuzzyMatch, similarityScore } from '@/lib/search';

// Check if strings match
if (fuzzyMatch('math', 'maths', 0.8)) {
  console.log('Match!');
}

// Get similarity score (0-1)
const score = similarityScore('reading', 'readng');
console.log(score); // 0.857
```

### Autocomplete

```javascript
import { getAutocompleteSuggestions, buildIndex } from '@/lib/search';

const indexed = buildIndex(data, ['name', 'description']);
const suggestions = getAutocompleteSuggestions(indexed, 'rea', 5);

console.log(suggestions); // ['reading', 'read', 'ready', ...]
```

### Search with Caching

```javascript
import { cachedSearch } from '@/lib/search';

// Same API as regular search, but results are cached
const results = cachedSearch(indexedData, 'query', {
  filters: {},
  limit: 20
});

// Clear cache when data changes
import { searchCache } from '@/lib/search';
searchCache.clear();
```

## Customization

### Custom Search Fields

```javascript
// Index additional fields
const customIndex = buildIndex(myData, [
  'customField1',
  'customField2',
  'notes',
  'tags'
]);
```

### Custom Relevance Scoring

```javascript
const results = search(data, query, {
  exactMatchBoost: 20,      // Increase exact match importance
  prefixMatchBoost: 10,     // Increase prefix match importance
  fuzzyMatchBoost: 3,       // Increase fuzzy match importance
  tokenMatchBoost: 2        // Increase token match importance
});
```

### Custom Filter Logic

```javascript
// OR logic instead of AND
const results = applyFilters(data, filters, 'OR');
```

## Integration with Existing Components

The search is already integrated into the main App, but you can also add search to individual views:

### Add Search to Students View

```javascript
import { AdvancedSearch } from '@/components/search';

function StudentsView() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div>
      <Button onClick={() => setShowSearch(true)}>
        Search Students
      </Button>

      <AdvancedSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        store={store}
        onNavigate={(type, data) => {
          if (type === 'student') {
            // Navigate to student detail
          }
        }}
      />
    </div>
  );
}
```

## Tips & Best Practices

1. **Index your data once** - Build the search index when data loads, not on every search
2. **Use memoization** - Wrap expensive computations in `useMemo`
3. **Debounce input** - The component already does this, but be aware if using directly
4. **Clear cache on updates** - When data changes, clear the search cache
5. **Test fuzzy matching threshold** - Adjust based on your data (default is 0.6)
6. **Limit results** - Don't render thousands of results, use pagination
7. **Profile performance** - Use React DevTools to identify bottlenecks

## Common Issues

### Search is slow
- Check if you're rebuilding the index on every search (should only build once)
- Reduce the number of fields being indexed
- Lower the result limit
- Enable search caching

### Results not appearing
- Check that data is indexed with correct fields
- Verify the query matches the indexed content
- Check minimum score threshold
- Inspect the search index structure

### Filters not working
- Ensure filter field names match your data structure
- Check filter logic (AND vs OR)
- Verify filter values are in correct format
- Console log the filtered results to debug

## Performance Metrics

The search system is optimized for:
- **Index building:** < 100ms for 1000 entities
- **Search latency:** < 50ms for most queries
- **Autocomplete:** < 20ms for suggestions
- **Filter application:** < 30ms for complex filters

Test with your data to ensure acceptable performance.
