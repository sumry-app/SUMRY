/**
 * SUMRY Filter Panel Component
 *
 * Advanced filtering with:
 * - Multi-select filters
 * - Range sliders (scores, dates)
 * - Tag-based filtering
 * - Saved filter presets
 * - Clear all filters
 * - Filter badges
 * - Active filter count
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  X,
  Calendar,
  BarChart3,
  Users,
  TrendingUp,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// =============================================================================
// CONSTANTS
// =============================================================================

const FILTER_PRESETS_KEY = 'sumry_filter_presets';

const GOAL_AREAS = [
  'Reading',
  'Math',
  'Writing',
  'Behavior',
  'Communication',
  'Social Skills',
  'Motor Skills',
];

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Load filter presets from localStorage
 */
function loadFilterPresets() {
  try {
    const stored = localStorage.getItem(FILTER_PRESETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save filter presets to localStorage
 */
function saveFilterPresets(presets) {
  try {
    localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // Ignore errors
  }
}

// =============================================================================
// FILTER PANEL COMPONENT
// =============================================================================

export function FilterPanel({ filters, onChange, store, category }) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    date: false,
    score: false,
    student: false,
    area: false,
    grade: false,
  });

  const [presets, setPresets] = useState(loadFilterPresets());
  const [presetName, setPresetName] = useState('');

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Update filter
  const updateFilter = (key, value) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onChange({});
  };

  // Save preset
  const savePreset = () => {
    if (!presetName.trim()) return;

    const newPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: { ...filters },
      category,
      createdAt: new Date().toISOString(),
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    saveFilterPresets(updated);
    setPresetName('');
  };

  // Load preset
  const loadPreset = (preset) => {
    onChange(preset.filters);
  };

  // Delete preset
  const deletePreset = (presetId) => {
    const updated = presets.filter(p => p.id !== presetId);
    setPresets(updated);
    saveFilterPresets(updated);
  };

  // Get unique values from store
  const uniqueValues = useMemo(() => {
    const students = [...new Set((store.students || []).map(s => s.id))];
    const areas = [...new Set((store.goals || []).map(g => g.area))].filter(Boolean);
    const grades = [...new Set((store.students || []).map(s => s.grade))].filter(Boolean);

    return { students, areas, grades };
  }, [store]);

  // Multi-select filter component
  const MultiSelectFilter = ({ label, field, options, renderLabel }) => {
    const selected = filters[field]?.value || [];

    const toggleOption = (option) => {
      const newSelected = selected.includes(option)
        ? selected.filter(o => o !== option)
        : [...selected, option];

      updateFilter(field, {
        value: newSelected,
      });
    };

    return (
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">{label}</Label>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {options.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <Checkbox
                id={`${field}-${option}`}
                checked={selected.includes(option)}
                onCheckedChange={() => toggleOption(option)}
              />
              <label
                htmlFor={`${field}-${option}`}
                className="text-sm text-slate-700 cursor-pointer flex-1"
              >
                {renderLabel ? renderLabel(option) : option}
              </label>
            </div>
          ))}
        </div>
        {selected.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => updateFilter(field, { value: [] })}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Clear
          </Button>
        )}
      </div>
    );
  };

  // Range filter component
  const RangeFilter = ({ label, field, min, max, step = 1, suffix = '' }) => {
    const filterValue = filters[field] || {};

    return (
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-700">{label}</Label>
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-slate-600">Min</Label>
            <Input
              type="number"
              placeholder="Min"
              value={filterValue.min ?? ''}
              onChange={(e) =>
                updateFilter(field, {
                  ...filterValue,
                  min: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              min={min}
              max={max}
              step={step}
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-600">Max</Label>
            <Input
              type="number"
              placeholder="Max"
              value={filterValue.max ?? ''}
              onChange={(e) =>
                updateFilter(field, {
                  ...filterValue,
                  max: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              min={min}
              max={max}
              step={step}
              className="mt-1 text-sm"
            />
          </div>
        </div>
        {(filterValue.min !== undefined || filterValue.max !== undefined) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => updateFilter(field, {})}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Clear
          </Button>
        )}
      </div>
    );
  };

  // Date range filter component
  const DateRangeFilter = ({ label, field }) => {
    const filterValue = filters[field] || {};

    return (
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-700">{label}</Label>
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-slate-600">Start Date</Label>
            <Input
              type="date"
              value={filterValue.startDate ?? ''}
              onChange={(e) =>
                updateFilter(field, {
                  ...filterValue,
                  startDate: e.target.value || undefined,
                })
              }
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-slate-600">End Date</Label>
            <Input
              type="date"
              value={filterValue.endDate ?? ''}
              onChange={(e) =>
                updateFilter(field, {
                  ...filterValue,
                  endDate: e.target.value || undefined,
                })
              }
              className="mt-1 text-sm"
            />
          </div>
        </div>
        {(filterValue.startDate || filterValue.endDate) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => updateFilter(field, {})}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Clear
          </Button>
        )}
      </div>
    );
  };

  // Filter section component
  const FilterSection = ({ id, title, icon: Icon, children }) => {
    const isExpanded = expandedSections[id];

    return (
      <div className="border-b border-slate-200 last:border-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-slate-500" strokeWidth={2} />}
            <span className="text-sm font-semibold text-slate-900">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" strokeWidth={2} />
          )}
        </button>
        {isExpanded && (
          <div className="px-3 pb-3">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-b border-slate-200 bg-slate-50/50">
      <div className="max-h-96 overflow-y-auto">
        {/* Filter Presets */}
        {presets.length > 0 && (
          <div className="p-3 border-b border-slate-200">
            <Label className="text-xs font-semibold text-slate-700 mb-2 block">
              Saved Presets
            </Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1"
                >
                  <button
                    onClick={() => loadPreset(preset)}
                    className="text-xs text-slate-700 hover:text-slate-900 font-medium"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="text-slate-400 hover:text-red-600 ml-1"
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {Object.keys(filters).length > 0 && (
          <div className="p-3 border-b border-slate-200 bg-blue-50/50">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold text-blue-900">
                Active Filters
              </Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(filters).map(([key, value]) => {
                let label = '';

                if (Array.isArray(value?.value) && value.value.length > 0) {
                  label = `${key}: ${value.value.length} selected`;
                } else if (value?.min !== undefined || value?.max !== undefined) {
                  const parts = [];
                  if (value.min !== undefined) parts.push(`≥${value.min}`);
                  if (value.max !== undefined) parts.push(`≤${value.max}`);
                  label = `${key}: ${parts.join(' ')}`;
                } else if (value?.startDate || value?.endDate) {
                  const parts = [];
                  if (value.startDate) parts.push(`from ${value.startDate}`);
                  if (value.endDate) parts.push(`to ${value.endDate}`);
                  label = parts.join(' ');
                }

                if (!label) return null;

                return (
                  <Badge
                    key={key}
                    variant="default"
                    className="text-xs flex items-center gap-1"
                  >
                    {label}
                    <button
                      onClick={() => updateFilter(key, undefined)}
                      className="ml-1 hover:text-white"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Sections */}
        <div>
          {/* Student Filter */}
          {(category === 'all' || category === 'goals' || category === 'logs') && (
            <FilterSection id="student" title="Student" icon={Users}>
              <MultiSelectFilter
                label="Select Students"
                field="studentId"
                options={uniqueValues.students}
                renderLabel={(studentId) => {
                  const student = store.students?.find(s => s.id === studentId);
                  return student?.name || studentId;
                }}
              />
            </FilterSection>
          )}

          {/* Goal Area Filter */}
          {(category === 'all' || category === 'goals') && (
            <FilterSection id="area" title="Goal Area" icon={TrendingUp}>
              <MultiSelectFilter
                label="Select Areas"
                field="area"
                options={uniqueValues.areas.length > 0 ? uniqueValues.areas : GOAL_AREAS}
              />
            </FilterSection>
          )}

          {/* Grade Filter */}
          {(category === 'all' || category === 'students') && (
            <FilterSection id="grade" title="Grade Level" icon={Users}>
              <MultiSelectFilter
                label="Select Grades"
                field="grade"
                options={uniqueValues.grades.length > 0 ? uniqueValues.grades : GRADES}
              />
            </FilterSection>
          )}

          {/* Date Range Filter */}
          {(category === 'all' || category === 'logs') && (
            <FilterSection id="date" title="Date Range" icon={Calendar}>
              <DateRangeFilter label="Filter by Date" field="dateISO" />
            </FilterSection>
          )}

          {/* Score Range Filter */}
          {(category === 'all' || category === 'logs') && (
            <FilterSection id="score" title="Score Range" icon={BarChart3}>
              <RangeFilter
                label="Filter by Score"
                field="score"
                min={0}
                max={100}
                step={1}
                suffix="%"
              />
            </FilterSection>
          )}
        </div>
      </div>

      {/* Save Preset */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Save current filters as preset..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                savePreset();
              }
            }}
          />
          <Button
            size="sm"
            onClick={savePreset}
            disabled={!presetName.trim() || Object.keys(filters).length === 0}
            className="flex-shrink-0"
          >
            <Save className="h-4 w-4 mr-2" strokeWidth={2} />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
