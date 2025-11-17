# Mobile-First Components

A collection of production-ready mobile-first React components with native-feeling touch gestures and animations for the SUMRY platform.

## Components

### 1. BottomSheet

A mobile-first bottom sheet component with smooth swipe gestures and multiple snap points.

**Features:**
- Swipe to open/close with drag gestures
- Three configurable states: closed, half-open, full-open
- Backdrop overlay with optional click-to-close
- Visual swipe handle indicator
- Smart snap points with smooth animations
- Keyboard-aware positioning for iOS/Android
- Smooth spring animations via Framer Motion

**Usage:**

```jsx
import { BottomSheet, SNAP_POINTS } from '@/components/mobile'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Create New Item"
      initialSnap="HALF"
      snapPoints={SNAP_POINTS}
      keyboardAware={true}
    >
      <div className="p-6">
        {/* Your content here */}
      </div>
    </BottomSheet>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | - | Controls visibility |
| `onClose` | function | - | Called when sheet should close |
| `title` | string | - | Optional header title |
| `snapPoints` | object | SNAP_POINTS | Snap point configuration |
| `initialSnap` | string | 'HALF' | Initial snap position |
| `showHandle` | boolean | true | Show drag handle |
| `showBackdrop` | boolean | true | Show backdrop overlay |
| `closeOnBackdrop` | boolean | true | Close on backdrop click |
| `keyboardAware` | boolean | true | Adjust for keyboard |

---

### 2. SwipeActions

Swipeable list items with configurable action buttons.

**Features:**
- Swipe left/right to reveal actions
- Smooth action button reveals
- Pre-configured action presets (delete, edit, archive, more)
- Color-coded action zones
- Visual feedback during swipe
- Auto-reset after action execution
- Optional haptic feedback (iOS/Android)

**Usage:**

```jsx
import { SwipeActions, ACTION_PRESETS } from '@/components/mobile'

function ListItem({ item, onAction }) {
  return (
    <SwipeActions
      rightActions={['edit', 'delete']}
      leftActions={['archive']}
      onAction={(action) => onAction(item.id, action)}
      hapticFeedback={true}
    >
      <div className="p-4 bg-white">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </SwipeActions>
  )
}
```

**Custom Actions:**

```jsx
<SwipeActions
  rightActions={[
    {
      icon: Star,
      label: 'Favorite',
      color: 'bg-yellow-500',
      textColor: 'text-white',
      threshold: 60,
    }
  ]}
  onAction={(action) => console.log(action)}
>
  {/* Content */}
</SwipeActions>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leftActions` | array | [] | Actions for right swipe |
| `rightActions` | array | ['delete'] | Actions for left swipe |
| `onAction` | function | - | Called with action id/label |
| `autoReset` | boolean | true | Auto-reset after action |
| `resetDelay` | number | 300 | Delay before reset (ms) |
| `hapticFeedback` | boolean | true | Enable haptic feedback |

**Available Presets:**
- `delete` - Red delete action
- `edit` - Blue edit action
- `archive` - Orange archive action
- `more` - Gray more options action

---

### 3. MobileNav

Comprehensive mobile navigation with bottom tabs, FAB, and hamburger menu.

**Features:**
- Bottom tab bar with icons and labels
- Floating Action Button (FAB) with expand animation
- Hamburger side menu
- Badge notifications support
- Active state indicators with smooth animations
- Safe area handling for iOS notch/home indicator
- Smooth tab transitions

**Usage:**

```jsx
import { MobileNav, DEFAULT_TABS } from '@/components/mobile'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <>
      {/* Your content */}

      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFabClick={() => console.log('FAB clicked')}
        onMenuItemClick={(id) => console.log('Menu:', id)}
        badges={{ home: 3, notifications: 5 }}
        safeAreaInset={true}
      />
    </>
  )
}
```

**Custom Tabs:**

```jsx
import { Target, BarChart } from 'lucide-react'

const customTabs = [
  { id: 'goals', icon: Target, label: 'Goals' },
  { id: 'analytics', icon: BarChart, label: 'Analytics' },
]

<MobileNav tabs={customTabs} activeTab={activeTab} />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | array | DEFAULT_TABS | Tab configuration |
| `activeTab` | string | - | Currently active tab |
| `onTabChange` | function | - | Tab change handler |
| `showFAB` | boolean | true | Show floating action button |
| `fabIcon` | component | Plus | FAB icon component |
| `onFabClick` | function | - | FAB click handler |
| `fabLabel` | string | 'Add' | FAB label text |
| `showMenu` | boolean | true | Show hamburger menu |
| `menuItems` | array | DEFAULT_MENU_ITEMS | Menu items |
| `onMenuItemClick` | function | - | Menu item handler |
| `badges` | object | {} | Badge counts by tab/item id |
| `safeAreaInset` | boolean | true | iOS safe area handling |

---

### 4. PullToRefresh

Pull-to-refresh functionality with visual feedback.

**Features:**
- Pull down gesture to refresh
- Animated spinner indicator
- Configurable pull threshold
- Success/error feedback states
- Optional haptic feedback
- Smooth spring animations
- Progress bar during refresh
- Keyboard-aware

**Usage:**

```jsx
import { PullToRefresh } from '@/components/mobile'

function ContentView() {
  const handleRefresh = async () => {
    // Fetch new data
    await fetchData()
  }

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      threshold={80}
      maxPull={120}
      hapticFeedback={true}
      showFeedback={true}
    >
      <div>
        {/* Your scrollable content */}
      </div>
    </PullToRefresh>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRefresh` | function | - | Async refresh handler |
| `threshold` | number | 80 | Pull distance to trigger (px) |
| `maxPull` | number | 120 | Maximum pull distance (px) |
| `refreshingText` | string | 'Refreshing...' | Loading text |
| `pullText` | string | 'Pull to refresh' | Initial pull text |
| `readyText` | string | 'Release to refresh' | Ready state text |
| `successText` | string | 'Updated!' | Success message |
| `errorText` | string | 'Failed to refresh' | Error message |
| `hapticFeedback` | boolean | true | Enable haptic feedback |
| `showFeedback` | boolean | true | Show success/error states |
| `feedbackDuration` | number | 1500 | Feedback display time (ms) |

---

### 5. MobileFilters

Mobile-optimized filter drawer with chip-based selections.

**Features:**
- Slide-in panel from left or right
- Chip-based filter selections
- Collapsible filter groups
- Apply/reset buttons
- Active filter count badge
- Visual feedback on selection
- Mobile-optimized touch targets
- Revert on cancel

**Usage:**

```jsx
import { MobileFilters, FilterChip, FilterGroup } from '@/components/mobile'

function DataView() {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
  })

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Filters {filters.status.length + filters.priority.length > 0 && '(Active)'}
      </button>

      <MobileFilters
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={(applied) => console.log('Applied:', applied)}
        onReset={() => console.log('Reset filters')}
      >
        <FilterGroup title="Status">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="Active"
              isActive={filters.status.includes('active')}
              onChange={(active) => {/* handle change */}}
              count={12}
            />
          </div>
        </FilterGroup>
      </MobileFilters>
    </>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | - | Controls visibility |
| `onClose` | function | - | Close handler |
| `filters` | object | {} | Current filter state |
| `onFiltersChange` | function | - | Filter change handler |
| `onApply` | function | - | Apply button handler |
| `onReset` | function | - | Reset button handler |
| `title` | string | 'Filters' | Drawer title |
| `showActiveCount` | boolean | true | Show active filter count |
| `position` | string | 'right' | 'left' or 'right' |

**FilterChip Props:**

| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Chip label text |
| `value` | any | Chip value |
| `isActive` | boolean | Selected state |
| `onChange` | function | Selection handler |
| `count` | number | Optional count badge |

**FilterGroup Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Group title |
| `collapsible` | boolean | false | Can collapse |
| `defaultExpanded` | boolean | true | Initial state |

---

## Demo

See `MobileDemo.jsx` for a complete working example with all components integrated.

```jsx
import MobileDemo from '@/components/mobile/MobileDemo'

// Render in your app
<MobileDemo />
```

## Installation

These components are already set up in the SUMRY project. They use:

- **Framer Motion** - For smooth animations and gestures
- **Lucide React** - For icons
- **Tailwind CSS** - For styling
- **Shadcn/ui utilities** - For className merging

## Touch Gesture Support

All components are optimized for touch interactions:

- **Native scrolling** - `WebkitOverflowScrolling: 'touch'`
- **Overscroll behavior** - Proper containment
- **Touch actions** - Optimized pan directions
- **Haptic feedback** - iOS/Android vibration API
- **Safe areas** - iOS notch/home indicator support
- **Keyboard awareness** - Auto-adjust for virtual keyboard

## Browser Support

- iOS Safari 13+
- Chrome Mobile 80+
- Android WebView 80+
- Modern mobile browsers with touch support

## Performance Tips

1. **Lazy load** - Use React.lazy for better initial load
2. **Memoization** - Wrap in React.memo for list items
3. **Virtualization** - Consider react-window for long lists
4. **Animations** - Framer Motion uses GPU acceleration
5. **Bundle size** - Components are tree-shakeable

## Accessibility

All components include:

- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly
- High contrast mode support

## Customization

All components accept standard React props and className for custom styling:

```jsx
<BottomSheet
  className="custom-sheet"
  style={{ zIndex: 999 }}
>
  {/* content */}
</BottomSheet>
```

Use Tailwind classes for quick customization:

```jsx
<FilterChip className="bg-blue-500 text-white hover:bg-blue-600" />
```

## TypeScript Support

While these components are written in JSX, they can be easily converted to TypeScript by:

1. Renaming files from `.jsx` to `.tsx`
2. Adding prop type interfaces
3. Adding return type annotations

## Best Practices

1. **Pull to Refresh** - Place at root of scrollable content
2. **Bottom Sheet** - Use for forms and quick actions
3. **Swipe Actions** - Limit to 2-3 actions per side
4. **Mobile Nav** - Keep tabs to 4-5 items max
5. **Filters** - Group related filters together
6. **Haptics** - Use sparingly for important interactions
7. **Safe Areas** - Always enable for iOS devices
8. **Testing** - Test on real devices when possible

## Contributing

When adding new mobile components:

1. Follow the existing pattern with forwardRef
2. Use Framer Motion for animations
3. Include haptic feedback options
4. Support safe areas for iOS
5. Add comprehensive prop documentation
6. Include usage examples

## License

Part of the SUMRY project.
