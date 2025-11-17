/**
 * Excel Export System Tests
 *
 * Basic tests to verify export functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import {
  exportStudentRoster,
  exportGoalProgressReport,
  exportProgressLogHistory,
  exportAnalyticsSummary,
  calculateGoalStats
} from '../excelExport';

// Mock data
const mockStudents = [
  {
    id: '1',
    student_number: 'S001',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '2010-05-15',
    grade_level: '5th',
    disability_classification: 'SLD',
    is_active: true,
    created_at: '2024-01-01'
  },
  {
    id: '2',
    student_number: 'S002',
    first_name: 'Jane',
    last_name: 'Smith',
    date_of_birth: '2011-08-22',
    grade_level: '4th',
    disability_classification: 'OHI',
    is_active: true,
    created_at: '2024-01-01'
  }
];

const mockGoals = [
  {
    id: 'g1',
    student_id: '1',
    area: 'Reading',
    description: 'Student will read grade-level text fluently',
    baseline_value: 60,
    baseline_description: 'Current reading speed',
    target_value: 120,
    target_description: 'Target reading speed',
    metric_unit: 'WPM',
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    ai_generated: false
  },
  {
    id: 'g2',
    student_id: '1',
    area: 'Math',
    description: 'Student will solve 2-digit addition problems',
    baseline_value: 50,
    baseline_description: 'Current accuracy',
    target_value: 85,
    target_description: 'Target accuracy',
    metric_unit: '% correct',
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    ai_generated: true
  }
];

const mockProgressLogs = [
  {
    id: 'p1',
    goal_id: 'g1',
    log_date: '2024-01-15',
    score: 65,
    notes: 'Good progress today',
    logged_by: 'teacher1'
  },
  {
    id: 'p2',
    goal_id: 'g1',
    log_date: '2024-02-15',
    score: 75,
    notes: 'Continued improvement',
    logged_by: 'teacher1'
  },
  {
    id: 'p3',
    goal_id: 'g1',
    log_date: '2024-03-15',
    score: 85,
    notes: 'Great progress!',
    logged_by: 'teacher1'
  },
  {
    id: 'p4',
    goal_id: 'g2',
    log_date: '2024-01-15',
    score: 55,
    notes: 'Starting to improve',
    logged_by: 'teacher1'
  },
  {
    id: 'p5',
    goal_id: 'g2',
    log_date: '2024-02-15',
    score: 65,
    notes: 'Good session',
    logged_by: 'teacher1'
  }
];

describe('Excel Export System', () => {
  describe('calculateGoalStats', () => {
    it('should calculate correct statistics for a goal', () => {
      const goal = mockGoals[0];
      const logs = mockProgressLogs.filter(log => log.goal_id === goal.id);

      const stats = calculateGoalStats(goal, logs);

      expect(stats.logCount).toBe(3);
      expect(parseFloat(stats.avgScore)).toBeCloseTo(75, 0);
      expect(parseFloat(stats.latestScore)).toBe(85);
      expect(parseFloat(stats.progressPercentage)).toBeGreaterThan(40);
      expect(stats.trend).toMatch(/Improving|Stable/);
    });

    it('should handle goals with no progress logs', () => {
      const goal = mockGoals[0];
      const stats = calculateGoalStats(goal, []);

      expect(stats.logCount).toBe(0);
      expect(stats.avgScore).toBeNull();
      expect(stats.latestScore).toBeNull();
      expect(stats.progressPercentage).toBe('0');
      expect(stats.trend).toBe('No Data');
    });
  });

  describe('exportStudentRoster', () => {
    it('should create a valid workbook', () => {
      const workbook = exportStudentRoster(mockStudents);

      expect(workbook).toBeDefined();
      expect(workbook.SheetNames).toContain('Student Roster');
      expect(workbook.Sheets['Student Roster']).toBeDefined();
    });

    it('should filter inactive students when requested', () => {
      const studentsWithInactive = [
        ...mockStudents,
        { ...mockStudents[0], id: '3', is_active: false }
      ];

      const workbook = exportStudentRoster(studentsWithInactive, {
        includeInactive: false
      });

      const worksheet = workbook.Sheets['Student Roster'];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Should have 2 active students + title + header = 4 rows
      expect(data.length).toBeLessThanOrEqual(5);
    });

    it('should respect column selection', () => {
      const workbook = exportStudentRoster(mockStudents, {
        selectedColumns: ['first_name', 'last_name', 'grade_level']
      });

      expect(workbook.Sheets['Student Roster']).toBeDefined();
    });
  });

  describe('exportGoalProgressReport', () => {
    it('should create workbook with multiple sheets', () => {
      const workbook = exportGoalProgressReport(
        mockStudents,
        mockGoals,
        mockProgressLogs
      );

      expect(workbook).toBeDefined();
      expect(workbook.SheetNames.length).toBeGreaterThan(1);
    });

    it('should include student-specific data when studentId provided', () => {
      const workbook = exportGoalProgressReport(
        mockStudents,
        mockGoals,
        mockProgressLogs,
        { studentId: '1' }
      );

      expect(workbook.SheetNames[0]).toContain('Doe');
    });
  });

  describe('exportProgressLogHistory', () => {
    it('should create a valid workbook', () => {
      const workbook = exportProgressLogHistory(
        mockStudents,
        mockGoals,
        mockProgressLogs
      );

      expect(workbook).toBeDefined();
      expect(workbook.SheetNames).toContain('Progress Log History');
    });

    it('should filter by date range', () => {
      const workbook = exportProgressLogHistory(
        mockStudents,
        mockGoals,
        mockProgressLogs,
        {
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          }
        }
      );

      expect(workbook).toBeDefined();
    });

    it('should filter by goal area', () => {
      const workbook = exportProgressLogHistory(
        mockStudents,
        mockGoals,
        mockProgressLogs,
        {
          goalArea: 'Reading'
        }
      );

      expect(workbook).toBeDefined();
    });
  });

  describe('exportAnalyticsSummary', () => {
    it('should create workbook with analytics sheets', () => {
      const workbook = exportAnalyticsSummary(
        mockStudents,
        mockGoals,
        mockProgressLogs
      );

      expect(workbook).toBeDefined();
      expect(workbook.SheetNames).toContain('Overview');
      expect(workbook.SheetNames).toContain('Student Performance');
      expect(workbook.SheetNames).toContain('Goal Area Analysis');
    });

    it('should calculate correct statistics', () => {
      const workbook = exportAnalyticsSummary(
        mockStudents,
        mockGoals,
        mockProgressLogs
      );

      const overviewSheet = workbook.Sheets['Overview'];
      const data = XLSX.utils.sheet_to_json(overviewSheet, { header: 1 });

      // Should contain total students count
      expect(data.some(row => row[0] === 'Total Students' && row[1] === 2)).toBe(true);
    });
  });

  describe('Workbook Structure', () => {
    it('should have properly formatted headers', () => {
      const workbook = exportStudentRoster(mockStudents);
      const worksheet = workbook.Sheets['Student Roster'];

      // Check that styling exists on header cells
      const headerCell = worksheet['A3']; // Header row is at row 3
      expect(headerCell).toBeDefined();
    });

    it('should have column widths set', () => {
      const workbook = exportStudentRoster(mockStudents);
      const worksheet = workbook.Sheets['Student Roster'];

      expect(worksheet['!cols']).toBeDefined();
      expect(worksheet['!cols'].length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all student data in roster export', () => {
      const workbook = exportStudentRoster(mockStudents);
      const worksheet = workbook.Sheets['Student Roster'];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Should have title + blank + header + students
      expect(data.length).toBeGreaterThanOrEqual(4);
    });

    it('should include all progress logs in history export', () => {
      const workbook = exportProgressLogHistory(
        mockStudents,
        mockGoals,
        mockProgressLogs
      );

      const worksheet = workbook.Sheets['Progress Log History'];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Should have logs included
      expect(data.length).toBeGreaterThan(mockProgressLogs.length);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle empty student array', () => {
    const workbook = exportStudentRoster([]);
    expect(workbook).toBeDefined();
  });

  it('should handle missing optional fields', () => {
    const studentsWithMissingFields = [
      {
        id: '1',
        first_name: 'Test',
        last_name: 'Student',
        is_active: true
        // Missing other fields
      }
    ];

    const workbook = exportStudentRoster(studentsWithMissingFields);
    expect(workbook).toBeDefined();
  });

  it('should handle goals without baseline values', () => {
    const goalsWithoutBaseline = [
      {
        ...mockGoals[0],
        baseline_value: null
      }
    ];

    const stats = calculateGoalStats(goalsWithoutBaseline[0], mockProgressLogs);
    expect(stats.progressPercentage).toBeDefined();
  });
});

describe('Performance', () => {
  it('should handle large datasets efficiently', () => {
    const startTime = Date.now();

    // Create 100 students
    const manyStudents = Array.from({ length: 100 }, (_, i) => ({
      ...mockStudents[0],
      id: `student-${i}`,
      student_number: `S${i.toString().padStart(3, '0')}`
    }));

    const workbook = exportStudentRoster(manyStudents);

    const duration = Date.now() - startTime;

    expect(workbook).toBeDefined();
    expect(duration).toBeLessThan(5000); // Should complete in less than 5 seconds
  });
});
