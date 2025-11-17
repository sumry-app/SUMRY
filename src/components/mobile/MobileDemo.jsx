import * as React from "react"
import { BottomSheet } from "./BottomSheet"
import { SwipeActions } from "./SwipeActions"
import { MobileNav } from "./MobileNav"
import { PullToRefresh } from "./PullToRefresh"
import { MobileFilters, FilterChip, FilterGroup } from "./MobileFilters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const MobileDemo = () => {
  const [activeTab, setActiveTab] = React.useState('home')
  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false)
  const [filters, setFilters] = React.useState({
    status: [],
    priority: [],
    category: [],
  })
  const [items, setItems] = React.useState([
    { id: 1, title: 'IEP Goal: Reading Comprehension', status: 'In Progress' },
    { id: 2, title: 'IEP Goal: Math Skills', status: 'Active' },
    { id: 3, title: 'IEP Goal: Social Skills', status: 'Completed' },
    { id: 4, title: 'IEP Goal: Writing Development', status: 'In Progress' },
    { id: 5, title: 'IEP Goal: Speech Therapy', status: 'Active' },
  ])

  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Refreshed!')
  }

  const handleSwipeAction = (itemId, action) => {
    console.log(`Action ${action} on item ${itemId}`)

    if (action === 'delete') {
      setItems(items.filter(item => item.id !== itemId))
    } else if (action === 'edit') {
      console.log('Edit item:', itemId)
    }
  }

  const handleMenuItemClick = (itemId) => {
    console.log('Menu item clicked:', itemId)
  }

  const handleFabClick = () => {
    setIsBottomSheetOpen(true)
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    console.log('Tab changed to:', tabId)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">SUMRY Mobile</h1>
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(true)}
            size="sm"
          >
            Filters
            {(filters.status?.length + filters.priority?.length + filters.category?.length) > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                {filters.status?.length + filters.priority?.length + filters.category?.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content with Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 space-y-4">
          {/* Demo Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile Components Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Try out the following mobile-first features:
              </p>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>Pull down to refresh this page</li>
                <li>Swipe left on items below to reveal actions</li>
                <li>Tap the + button to open bottom sheet</li>
                <li>Use bottom navigation to switch tabs</li>
                <li>Open the hamburger menu for more options</li>
                <li>Tap Filters to see the filter drawer</li>
              </ul>
            </CardContent>
          </Card>

          {/* Swipeable Items */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold mb-3">IEP Goals</h2>
            {items.map(item => (
              <SwipeActions
                key={item.id}
                rightActions={['edit', 'delete']}
                leftActions={['archive']}
                onAction={(action) => handleSwipeAction(item.id, action)}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SwipeActions>
            ))}
          </div>

          {/* Placeholder for more content */}
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">More content here...</p>
          </div>
        </div>
      </PullToRefresh>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Create New Goal"
        initialSnap="HALF"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Goal Title</label>
            <input
              type="text"
              placeholder="Enter goal title..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Enter description..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Active</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>On Hold</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={() => setIsBottomSheetOpen(false)}>
              Create Goal
            </Button>
            <Button variant="outline" onClick={() => setIsBottomSheetOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Mobile Filters */}
      <MobileFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={(appliedFilters) => {
          console.log('Filters applied:', appliedFilters)
        }}
        onReset={() => {
          console.log('Filters reset')
        }}
      >
        <FilterGroup title="Status">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="Active"
              value="active"
              isActive={filters.status?.includes('active')}
              onChange={(isActive) => {
                setFilters(prev => ({
                  ...prev,
                  status: isActive
                    ? [...prev.status, 'active']
                    : prev.status.filter(s => s !== 'active')
                }))
              }}
              count={12}
            />
            <FilterChip
              label="In Progress"
              value="in-progress"
              isActive={filters.status?.includes('in-progress')}
              onChange={(isActive) => {
                setFilters(prev => ({
                  ...prev,
                  status: isActive
                    ? [...prev.status, 'in-progress']
                    : prev.status.filter(s => s !== 'in-progress')
                }))
              }}
              count={8}
            />
            <FilterChip
              label="Completed"
              value="completed"
              isActive={filters.status?.includes('completed')}
              onChange={(isActive) => {
                setFilters(prev => ({
                  ...prev,
                  status: isActive
                    ? [...prev.status, 'completed']
                    : prev.status.filter(s => s !== 'completed')
                }))
              }}
              count={45}
            />
          </div>
        </FilterGroup>

        <FilterGroup title="Priority" collapsible>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="High"
              value="high"
              isActive={filters.priority?.includes('high')}
              onChange={(isActive) => {
                setFilters(prev => ({
                  ...prev,
                  priority: isActive
                    ? [...prev.priority, 'high']
                    : prev.priority.filter(p => p !== 'high')
                }))
              }}
            />
            <FilterChip
              label="Medium"
              value="medium"
              isActive={filters.priority?.includes('medium')}
              onChange={(isActive) => {
                setFilters(prev => ({
                  ...prev,
                  priority: isActive
                    ? [...prev.priority, 'medium']
                    : prev.priority.filter(p => p !== 'medium')
                }))
              }}
            />
            <FilterChip
              label="Low"
              value="low"
              isActive={filters.priority?.includes('low')}
              onChange={(isActive) => {
                setFilters(prev => ({
                  ...prev,
                  priority: isActive
                    ? [...prev.priority, 'low']
                    : prev.priority.filter(p => p !== 'low')
                }))
              }}
            />
          </div>
        </FilterGroup>
      </MobileFilters>

      {/* Mobile Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onFabClick={handleFabClick}
        onMenuItemClick={handleMenuItemClick}
        badges={{
          home: 3,
          notifications: 5,
        }}
      />
    </div>
  )
}

export default MobileDemo
