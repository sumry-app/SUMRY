# Mobile Components Integration Guide

Quick guide to integrate mobile-first components into your SUMRY application.

## Quick Start

### 1. Import Components

```jsx
import {
  BottomSheet,
  SwipeActions,
  MobileNav,
  PullToRefresh,
  MobileFilters,
} from '@/components/mobile'
```

### 2. Import CSS (in your main file or layout)

```jsx
import '@/components/mobile/mobile.css'
```

### 3. Use Hooks

```jsx
import { useMobile, useHaptic, useSwipe } from '@/components/mobile/useMobile'

function MyComponent() {
  const { isMobile, isIOS } = useMobile()
  const { triggerHaptic } = useHaptic()

  // Your component logic
}
```

## Real-World Integration Examples

### Example 1: IEP Goals List with Swipe Actions

```jsx
import { useState } from 'react'
import { SwipeActions } from '@/components/mobile'
import { Card, CardContent } from '@/components/ui/card'

function IEPGoalsList() {
  const [goals, setGoals] = useState([
    { id: 1, title: 'Reading Comprehension', status: 'Active' },
    { id: 2, title: 'Math Skills', status: 'In Progress' },
  ])

  const handleAction = (goalId, action) => {
    if (action === 'delete') {
      setGoals(goals.filter(g => g.id !== goalId))
    } else if (action === 'edit') {
      // Navigate to edit page
      console.log('Edit goal:', goalId)
    }
  }

  return (
    <div className="space-y-2">
      {goals.map(goal => (
        <SwipeActions
          key={goal.id}
          rightActions={['edit', 'delete']}
          onAction={(action) => handleAction(goal.id, action)}
        >
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium">{goal.title}</h3>
              <p className="text-sm text-muted-foreground">{goal.status}</p>
            </CardContent>
          </Card>
        </SwipeActions>
      ))}
    </div>
  )
}
```

### Example 2: Student Dashboard with Mobile Nav

```jsx
import { useState } from 'react'
import { MobileNav } from '@/components/mobile'
import { Home, Calendar, User, FileText } from 'lucide-react'

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('home')

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'goals', icon: FileText, label: 'Goals' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'profile', icon: User, label: 'Profile' },
  ]

  const menuItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'reports', icon: FileText, label: 'Reports' },
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* Your content based on activeTab */}
      {activeTab === 'home' && <HomeView />}
      {activeTab === 'goals' && <GoalsView />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'profile' && <ProfileView />}

      <MobileNav
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        menuItems={menuItems}
        onMenuItemClick={(id) => console.log('Menu item:', id)}
        badges={{ home: 3, goals: 5 }}
      />
    </div>
  )
}
```

### Example 3: Form in Bottom Sheet

```jsx
import { useState } from 'react'
import { BottomSheet } from '@/components/mobile'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

function CreateGoalButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Submit form
    await createGoal(formData)
    setIsOpen(false)
    // Reset form
    setFormData({ title: '', description: '', category: 'academic' })
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Goal
      </Button>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Goal"
        initialSnap="HALF"
        keyboardAware={true}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="academic">Academic</option>
              <option value="behavioral">Behavioral</option>
              <option value="social">Social</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Create Goal
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </BottomSheet>
    </>
  )
}
```

### Example 4: Goals List with Filters

```jsx
import { useState } from 'react'
import { MobileFilters, FilterChip, FilterGroup } from '@/components/mobile'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'

function GoalsWithFilters() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: [],
    category: [],
    priority: [],
  })
  const [goals, setGoals] = useState([]) // Your goals data

  const applyFilters = (appliedFilters) => {
    // Filter your goals based on appliedFilters
    const filtered = goals.filter(goal => {
      const statusMatch = appliedFilters.status.length === 0 ||
        appliedFilters.status.includes(goal.status)

      const categoryMatch = appliedFilters.category.length === 0 ||
        appliedFilters.category.includes(goal.category)

      return statusMatch && categoryMatch
    })

    setFilteredGoals(filtered)
    setIsFiltersOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">IEP Goals</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFiltersOpen(true)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {Object.values(filters).flat().length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {Object.values(filters).flat().length}
            </span>
          )}
        </Button>
      </div>

      {/* Goals list */}
      <GoalsList goals={filteredGoals} />

      <MobileFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={applyFilters}
        onReset={() => setFilters({ status: [], category: [], priority: [] })}
      >
        <FilterGroup title="Status">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="Active"
              isActive={filters.status.includes('active')}
              onChange={(active) => {
                setFilters(prev => ({
                  ...prev,
                  status: active
                    ? [...prev.status, 'active']
                    : prev.status.filter(s => s !== 'active')
                }))
              }}
            />
            {/* Add more filter chips */}
          </div>
        </FilterGroup>
      </MobileFilters>
    </div>
  )
}
```

### Example 5: Pull to Refresh on Data List

```jsx
import { useState } from 'react'
import { PullToRefresh } from '@/components/mobile'

function StudentsList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/students')
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Failed to refresh:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      threshold={80}
      hapticFeedback={true}
    >
      <div className="p-4 space-y-4">
        {students.map(student => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </PullToRefresh>
  )
}
```

## Progressive Enhancement

Start with basic functionality and enhance for mobile:

```jsx
import { useMobile } from '@/components/mobile/useMobile'

function AdaptiveComponent() {
  const { isMobile } = useMobile()

  return (
    <div>
      {isMobile ? (
        <MobileOptimizedView />
      ) : (
        <DesktopView />
      )}
    </div>
  )
}
```

## Combining Components

Create a complete mobile experience:

```jsx
import {
  MobileNav,
  BottomSheet,
  PullToRefresh,
  SwipeActions,
  MobileFilters,
} from '@/components/mobile'

function CompleteMobileApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  return (
    <div className="min-h-screen pb-20">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4">
          {data.map(item => (
            <SwipeActions
              key={item.id}
              rightActions={['edit', 'delete']}
              onAction={(action) => handleAction(item.id, action)}
            >
              <ItemCard item={item} />
            </SwipeActions>
          ))}
        </div>
      </PullToRefresh>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Details"
      >
        {/* Content */}
      </BottomSheet>

      <MobileFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApply={handleApply}
      />

      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFabClick={() => setIsSheetOpen(true)}
      />
    </div>
  )
}
```

## Testing on Mobile

### Using Browser DevTools

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select a mobile device
4. Ensure "Touch" is enabled

### Testing on Real Device

1. **Development Server:**
   ```bash
   npm run dev -- --host
   ```

2. **Access from mobile:**
   - Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Visit: `http://YOUR_IP:5173` on mobile device

3. **Remote Debugging:**
   - **iOS:** Safari > Develop > Your Device
   - **Android:** Chrome > chrome://inspect

## Performance Optimization

### Lazy Load Components

```jsx
import { lazy, Suspense } from 'react'

const MobileNav = lazy(() => import('@/components/mobile/MobileNav'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MobileNav {...props} />
    </Suspense>
  )
}
```

### Optimize Touch Handlers

```jsx
// Use passive listeners for scroll performance
useEffect(() => {
  const handler = (e) => { /* ... */ }
  element.addEventListener('touchstart', handler, { passive: true })

  return () => element.removeEventListener('touchstart', handler)
}, [])
```

### Reduce Motion

```jsx
// Respect user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

<BottomSheet
  transition={prefersReducedMotion ? { duration: 0.1 } : undefined}
/>
```

## Troubleshooting

### Issue: Gestures not working

**Solution:** Ensure parent doesn't prevent touch events:

```jsx
<div style={{ touchAction: 'manipulation' }}>
  <SwipeActions>...</SwipeActions>
</div>
```

### Issue: Keyboard covering content

**Solution:** Use keyboardAware prop:

```jsx
<BottomSheet keyboardAware={true}>
  <input type="text" />
</BottomSheet>
```

### Issue: Scrolling issues on iOS

**Solution:** Add CSS to parent:

```css
.parent {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

## Next Steps

1. Try the demo: `import MobileDemo from '@/components/mobile/MobileDemo'`
2. Read the full [README.md](./README.md)
3. Explore custom hooks in [useMobile.js](./useMobile.js)
4. Check out [mobile.css](./mobile.css) for utilities

## Support

For issues or questions:
- Check README.md for detailed API documentation
- Review MobileDemo.jsx for complete examples
- Test on real devices when possible
