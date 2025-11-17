# Advanced Search - Quick Start Guide

## 🚀 Ready to Use!

The advanced search system is already integrated and ready to use. No additional setup required.

## Opening Search

### Method 1: Keyboard Shortcut (Recommended)
Press **`Cmd+K`** (Mac) or **`Ctrl+K`** (Windows/Linux) anywhere in the app

### Method 2: Click Button
Click the **"Search"** button in the header (top-right, shows ⌘K hint)

## Basic Search

Just start typing:
- Student names: `john`, `sarah`
- Goal descriptions: `reading fluency`, `math facts`
- Areas: `reading`, `math`, `behavior`
- Progress notes: `great progress`, `needs support`
- Scores: `90%`, `85`

## Advanced Search Tricks

### Exact Phrases
Use quotes for exact matches:
```
"reading fluency goal"
"will solve 2-digit addition"
```

### Exclude Words
Use minus to exclude:
```
math -behavior
goals -writing
```

### Search Specific Fields
```
area:math          (find math goals)
area:reading       (find reading goals)
grade:3            (find grade 3 items)
```

## Using Filters

1. Click the **"Filters"** button (right side of category tabs)
2. Expand the sections you need:
   - **Student** - Filter by specific students
   - **Goal Area** - Reading, Math, Writing, etc.
   - **Grade Level** - K-12
   - **Date Range** - Start and end dates
   - **Score Range** - Min/max scores
3. Select your criteria
4. Results update automatically

### Save Your Filters

1. Set up your filters
2. Type a name in "Save current filters as preset"
3. Click **Save**
4. Next time, just click your saved preset!

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Cmd+K` / `Ctrl+K` | Open search |
| `↑` / `↓` | Navigate results |
| `Enter` | Select result |
| `Esc` | Clear search or close |

## Example Searches

### Find a specific student
```
John Smith
```

### Find all math goals
```
area:math
```
or use filters: Click Filters → Goal Area → Select "Math"

### Find recent progress logs
```
2024-11
```
or use filters: Click Filters → Date Range → Set dates

### Find high-performing goals
Use filters: Click Filters → Score Range → Min: 80, Max: 100

### Find reading goals for grade 3
```
area:reading grade:3
```
or use filters for more precision

## Tips

✅ **Search updates instantly** as you type
✅ **Recent searches** appear when search is empty
✅ **Fuzzy matching** finds results even with typos
✅ **Results are highlighted** - matched text is yellow
✅ **Categories** group results by type (Students/Goals/Logs)
✅ **Filters** can be combined for precise results
✅ **Presets** save time on frequent searches

## Common Use Cases

### 1. Find all goals for a student
**Search:** `John Smith`
**Filter:** Category → Goals

### 2. Review recent progress
**Filter:** Date Range → Last 30 days

### 3. Find struggling goals
**Filter:** Score Range → Max: 60

### 4. Find specific goal type
**Search:** `area:behavior`
or
**Filter:** Goal Area → Behavior

### 5. Export/Share results
Currently: Copy search query and share with team
Future: Export to CSV/PDF (coming soon)

## Need Help?

- **Full Documentation:** See `SEARCH_FEATURES.md`
- **Developer Guide:** See `src/components/search/USAGE.md`
- **Technical Details:** See `SEARCH_IMPLEMENTATION_SUMMARY.md`

## Questions?

**Q: Why no results?**
A: Try removing filters, check spelling, or use broader terms

**Q: Search is slow?**
A: Contact support - it should be < 50ms typically

**Q: Can I search files/attachments?**
A: Not yet - currently searches text fields only

**Q: Can I export results?**
A: Coming in a future update!

**Q: How do I clear recent searches?**
A: Open search → Click "Clear" next to "Recent Searches"

---

**Enjoy lightning-fast search!** ⚡

Press `Cmd+K` or `Ctrl+K` to get started.
