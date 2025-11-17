import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  uid,
  createTimestamp,
  formatTimestamp,
  normalizeStoreData,
  loadStore,
  saveStore,
  parseScore,
  calculateTrendline,
  predictProgress,
  getProgressStatus,
  computeStoreStats,
  getEmptyNormalizedStore,
  storageKey
} from './data.js';

describe('uid', () => {
  it('generates a string ID', () => {
    const id = uid();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(uid());
    }
    expect(ids.size).toBe(100);
  });
});

describe('createTimestamp', () => {
  it('returns an ISO timestamp string', () => {
    const timestamp = createTimestamp();
    expect(typeof timestamp).toBe('string');
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('creates valid Date objects', () => {
    const timestamp = createTimestamp();
    const date = new Date(timestamp);
    expect(date.toString()).not.toBe('Invalid Date');
  });
});

describe('formatTimestamp', () => {
  it('formats valid ISO strings', () => {
    const iso = '2024-01-15T10:30:00.000Z';
    const formatted = formatTimestamp(iso);
    expect(typeof formatted).toBe('string');
  });

  it('returns empty string for invalid input', () => {
    expect(formatTimestamp('')).toBe('');
    expect(formatTimestamp(null)).toBe('');
    expect(formatTimestamp(undefined)).toBe('');
    expect(formatTimestamp('invalid')).toBe('');
  });
});

describe('parseScore', () => {
  it('parses valid numeric strings', () => {
    expect(parseScore('42')).toBe(42);
    expect(parseScore('3.14')).toBe(3.14);
    expect(parseScore('-5')).toBe(-5);
  });

  it('parses numbers', () => {
    expect(parseScore(42)).toBe(42);
    expect(parseScore(3.14)).toBe(3.14);
  });

  it('returns null for invalid scores', () => {
    expect(parseScore('')).toBe(null);
    expect(parseScore('abc')).toBe(null);
    expect(parseScore(NaN)).toBe(null);
  });
});

describe('calculateTrendline', () => {
  it('calculates trendline for valid data', () => {
    const data = [
      { score: '10' },
      { score: '20' },
      { score: '30' },
      { score: '40' }
    ];
    const result = calculateTrendline(data);
    expect(result).not.toBe(null);
    expect(result.slope).toBeCloseTo(10, 1);
    expect(result.intercept).toBeCloseTo(10, 1);
  });

  it('returns null for insufficient data', () => {
    expect(calculateTrendline([])).toBe(null);
    expect(calculateTrendline([{ score: '10' }])).toBe(null);
  });

  it('filters out non-numeric scores', () => {
    const data = [
      { score: '10' },
      { score: 'abc' },
      { score: '20' },
      { score: '30' }
    ];
    const result = calculateTrendline(data);
    expect(result).not.toBe(null);
  });

  it('handles all same values', () => {
    const data = [
      { score: '50' },
      { score: '50' },
      { score: '50' }
    ];
    const result = calculateTrendline(data);
    expect(result).not.toBe(null);
    expect(result.slope).toBeCloseTo(0, 5);
  });
});

describe('predictProgress', () => {
  const logs = [
    { dateISO: '2024-01-01', score: '10' },
    { dateISO: '2024-01-02', score: '20' },
    { dateISO: '2024-01-03', score: '30' }
  ];

  it('predicts progress with upward trend', () => {
    const result = predictProgress(logs, '40', '10');
    expect(result).not.toBe(null);
    expect(result.trend).toBe('improving');
    expect(result.onTrack).toBe(true);
  });

  it('detects declining trend', () => {
    const declining = [
      { dateISO: '2024-01-01', score: '100' },
      { dateISO: '2024-01-02', score: '80' },
      { dateISO: '2024-01-03', score: '60' }
    ];
    const result = predictProgress(declining, '90', '100');
    expect(result.trend).toBe('declining');
  });

  it('returns null for insufficient data', () => {
    expect(predictProgress([], '50', '10')).toBe(null);
    expect(predictProgress([logs[0]], '50', '10')).toBe(null);
  });

  it('sorts logs by date', () => {
    const unsorted = [
      { dateISO: '2024-01-03', score: '30' },
      { dateISO: '2024-01-01', score: '10' },
      { dateISO: '2024-01-02', score: '20' }
    ];
    const result = predictProgress(unsorted, '40', '10');
    expect(result).not.toBe(null);
  });
});

describe('getProgressStatus', () => {
  it('returns insufficient for too few logs', () => {
    const logs = [
      { dateISO: '2024-01-01', score: '10' },
      { dateISO: '2024-01-02', score: '20' }
    ];
    const status = getProgressStatus(logs, '10', '50');
    expect(status.status).toBe('insufficient');
    expect(status.label).toContain('more data');
  });

  it('returns on-track for good progress', () => {
    const logs = [
      { dateISO: '2024-01-01', score: '10' },
      { dateISO: '2024-01-02', score: '30' },
      { dateISO: '2024-01-03', score: '50' },
      { dateISO: '2024-01-04', score: '70' }
    ];
    const status = getProgressStatus(logs, '10', '80');
    expect(status.status).toBe('on-track');
    expect(status.color).toBe('green');
  });

  it('returns off-track for poor progress', () => {
    const logs = [
      { dateISO: '2024-01-01', score: '10' },
      { dateISO: '2024-01-02', score: '12' },
      { dateISO: '2024-01-03', score: '13' },
      { dateISO: '2024-01-04', score: '14' }
    ];
    const status = getProgressStatus(logs, '10', '100');
    expect(status.status).toBe('off-track');
    expect(status.color).toBe('red');
  });
});

describe('normalizeStoreData', () => {
  it('returns empty store for invalid input', () => {
    expect(normalizeStoreData(null).version).toBe(1);
    expect(normalizeStoreData(undefined).students).toEqual([]);
    expect(normalizeStoreData('invalid').goals).toEqual([]);
  });

  it('normalizes student data', () => {
    const raw = {
      students: [
        { id: 'student1', name: 'John Doe', grade: '5th', disability: 'LD' }
      ]
    };
    const normalized = normalizeStoreData(raw);
    expect(normalized.students).toHaveLength(1);
    expect(normalized.students[0].name).toBe('John Doe');
    expect(normalized.students[0].id).toBe('student1');
  });

  it('generates IDs for students without them', () => {
    const raw = {
      students: [{ name: 'Jane Doe' }]
    };
    const normalized = normalizeStoreData(raw);
    expect(normalized.students[0].id).toBeTruthy();
  });

  it('provides default name for unnamed students', () => {
    const raw = {
      students: [{ id: 'student1' }]
    };
    const normalized = normalizeStoreData(raw);
    expect(normalized.students[0].name).toBe('Unnamed Student');
  });

  it('filters goals without valid student IDs', () => {
    const raw = {
      students: [{ id: 'student1', name: 'John' }],
      goals: [
        { id: 'goal1', studentId: 'student1', description: 'Valid goal' },
        { id: 'goal2', studentId: 'nonexistent', description: 'Invalid goal' }
      ]
    };
    const normalized = normalizeStoreData(raw);
    expect(normalized.goals).toHaveLength(1);
    expect(normalized.goals[0].id).toBe('goal1');
  });

  it('filters logs without valid goal IDs', () => {
    const raw = {
      students: [{ id: 'student1', name: 'John' }],
      goals: [{ id: 'goal1', studentId: 'student1', description: 'Goal 1' }],
      logs: [
        { id: 'log1', goalId: 'goal1', score: '80' },
        { id: 'log2', goalId: 'nonexistent', score: '90' }
      ]
    };
    const normalized = normalizeStoreData(raw);
    expect(normalized.logs).toHaveLength(1);
    expect(normalized.logs[0].id).toBe('log1');
  });

  it('deduplicates items with same ID', () => {
    const raw = {
      students: [
        { id: 'student1', name: 'John' },
        { id: 'student1', name: 'Jane' },
        { id: 'student2', name: 'Bob' }
      ]
    };
    const normalized = normalizeStoreData(raw);
    expect(normalized.students).toHaveLength(2);
  });

  it('preserves AI-generated flag on goals', () => {
    const raw = {
      students: [{ id: 'student1', name: 'John' }],
      goals: [
        { studentId: 'student1', description: 'AI Goal', aiGenerated: true }
      ]
    };
    const normalized = normalizeStoreData(raw);
    expect(normalized.goals[0].aiGenerated).toBe(true);
  });
});

describe('computeStoreStats', () => {
  it('computes statistics for empty store', () => {
    const store = {
      students: [],
      goals: [],
      logs: []
    };
    const stats = computeStoreStats(store);
    expect(stats.totalStudents).toBe(0);
    expect(stats.totalGoals).toBe(0);
    expect(stats.totalLogs).toBe(0);
    expect(stats.onTrackGoals).toBe(0);
  });

  it('computes statistics correctly', () => {
    const store = {
      students: [{ id: 's1' }, { id: 's2' }],
      goals: [
        { id: 'g1', baseline: '10', target: '50' },
        { id: 'g2', baseline: '20', target: '80' }
      ],
      logs: [
        { goalId: 'g1', dateISO: '2024-01-01', score: '20' },
        { goalId: 'g1', dateISO: '2024-01-02', score: '30' },
        { goalId: 'g1', dateISO: '2024-01-03', score: '40' },
        { goalId: 'g1', dateISO: '2024-01-04', score: '50' }
      ]
    };
    const stats = computeStoreStats(store);
    expect(stats.totalStudents).toBe(2);
    expect(stats.totalGoals).toBe(2);
    expect(stats.totalLogs).toBe(4);
    expect(stats.onTrackGoals).toBeGreaterThanOrEqual(0);
  });

  it('handles null/undefined store', () => {
    expect(computeStoreStats(null).totalStudents).toBe(0);
    expect(computeStoreStats(undefined).totalGoals).toBe(0);
  });
});

describe('loadStore / saveStore', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
  });

  it('loads empty store when nothing saved', () => {
    localStorage.getItem.mockReturnValue(null);
    const store = loadStore();
    expect(store.students).toEqual([]);
    expect(store.version).toBe(1);
  });

  it('loads and normalizes saved data', () => {
    const savedData = {
      students: [{ id: 's1', name: 'John' }],
      goals: [],
      logs: []
    };
    localStorage.getItem.mockReturnValue(JSON.stringify(savedData));
    const store = loadStore();
    expect(store.students).toHaveLength(1);
    expect(store.students[0].name).toBe('John');
  });

  it('returns empty store for corrupted data', () => {
    localStorage.getItem.mockReturnValue('{ invalid json');
    const store = loadStore();
    expect(store.students).toEqual([]);
  });

  it('saves normalized store data', () => {
    const store = {
      students: [{ id: 's1', name: 'John' }],
      goals: [],
      logs: []
    };
    saveStore(store);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      storageKey,
      expect.any(String)
    );
  });
});

describe('getEmptyNormalizedStore', () => {
  it('returns a valid empty store structure', () => {
    const empty = getEmptyNormalizedStore();
    expect(empty.version).toBe(1);
    expect(empty.students).toEqual([]);
    expect(empty.goals).toEqual([]);
    expect(empty.logs).toEqual([]);
    expect(empty.lastUpdated).toBeTruthy();
  });
});
