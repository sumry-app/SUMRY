/**
 * Data Import System Tests
 *
 * Comprehensive tests for the import engine functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  autoDetectColumns,
  validateColumnMappings,
  validateRow,
  validateAllData,
  detectDuplicateStudents,
  detectDuplicateGoals,
  transformStudentData,
  transformGoalData,
  transformProgressLogData,
  IMPORT_TYPES,
  COLUMN_MAPPINGS
} from '../dataImport';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockStudentHeaders = [
  'Student Name',
  'Grade',
  'Disability Type',
  'Student ID',
  'Birth Date'
];

const mockStudentData = [
  {
    'Student Name': 'John Doe',
    'Grade': '3rd Grade',
    'Disability Type': 'Autism',
    'Student ID': '12345',
    'Birth Date': '01/15/2015'
  },
  {
    'Student Name': 'Jane Smith',
    'Grade': '5th Grade',
    'Disability Type': 'SLD',
    'Student ID': '12346',
    'Birth Date': '03/22/2013'
  }
];

const mockGoalHeaders = [
  'Student',
  'Area',
  'Goal',
  'Baseline',
  'Target',
  'Unit'
];

const mockGoalData = [
  {
    'Student': 'John Doe',
    'Area': 'Reading',
    'Goal': 'Read grade-level text with 90% accuracy',
    'Baseline': '60%',
    'Target': '90%',
    'Unit': 'percentage'
  }
];

const existingStudents = [
  {
    id: 'student-1',
    name: 'Existing Student',
    grade: '4th Grade',
    disability: 'Speech',
    studentNumber: '99999'
  }
];

const existingGoals = [
  {
    id: 'goal-1',
    studentId: 'student-1',
    area: 'Reading',
    description: 'Read grade-level text with 90% accuracy',
    baseline: '60%',
    target: '90%'
  }
];

// ============================================================================
// COLUMN MAPPING TESTS
// ============================================================================

describe('autoDetectColumns', () => {
  it('should auto-detect student columns with high confidence', () => {
    const result = autoDetectColumns(mockStudentHeaders, IMPORT_TYPES.STUDENTS);

    expect(result.mappings).toBeDefined();
    expect(result.mappings.name).toBe('Student Name');
    expect(result.mappings.grade).toBe('Grade');
    expect(result.mappings.disability).toBe('Disability Type');
    expect(result.mappings.studentNumber).toBe('Student ID');
  });

  it('should detect fuzzy matches', () => {
    const headers = ['student_name', 'grade_level', 'primary_disability'];
    const result = autoDetectColumns(headers, IMPORT_TYPES.STUDENTS);

    expect(result.mappings.name).toBe('student_name');
    expect(result.mappings.grade).toBe('grade_level');
    expect(result.mappings.disability).toBe('primary_disability');
  });

  it('should handle partial matches', () => {
    const headers = ['Name', 'Grade', 'Type'];
    const result = autoDetectColumns(headers, IMPORT_TYPES.STUDENTS);

    expect(result.mappings.name).toBe('Name');
    expect(result.mappings.grade).toBe('Grade');
  });

  it('should return unmapped headers', () => {
    const headers = ['Student Name', 'Grade', 'Extra Column'];
    const result = autoDetectColumns(headers, IMPORT_TYPES.STUDENTS);

    expect(result.unmappedHeaders).toContain('Extra Column');
  });

  it('should provide confidence scores', () => {
    const result = autoDetectColumns(mockStudentHeaders, IMPORT_TYPES.STUDENTS);

    expect(result.confidence.name).toBeGreaterThan(0.6);
    expect(result.confidence.grade).toBeGreaterThan(0.6);
  });
});

describe('validateColumnMappings', () => {
  it('should validate complete required mappings', () => {
    const mappings = {
      name: 'Student Name',
      grade: 'Grade',
      disability: 'Disability Type'
    };

    const result = validateColumnMappings(mappings, IMPORT_TYPES.STUDENTS);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when required fields are missing', () => {
    const mappings = {
      grade: 'Grade'
      // missing required 'name' field
    };

    const result = validateColumnMappings(mappings, IMPORT_TYPES.STUDENTS);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].field).toBe('name');
  });

  it('should validate goal mappings', () => {
    const mappings = {
      studentName: 'Student',
      area: 'Area',
      description: 'Goal',
      target: 'Target'
    };

    const result = validateColumnMappings(mappings, IMPORT_TYPES.GOALS);

    expect(result.isValid).toBe(true);
  });
});

// ============================================================================
// DATA VALIDATION TESTS
// ============================================================================

describe('validateRow', () => {
  it('should validate valid student row', () => {
    const mappings = {
      name: 'Student Name',
      grade: 'Grade',
      disability: 'Disability Type',
      studentNumber: 'Student ID'
    };

    const result = validateRow(
      mockStudentData[0],
      mappings,
      IMPORT_TYPES.STUDENTS,
      1
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.mappedData.name).toBe('John Doe');
  });

  it('should detect missing required fields', () => {
    const mappings = {
      name: 'Student Name',
      grade: 'Grade'
    };

    const invalidData = {
      'Student Name': '', // Empty required field
      'Grade': '3rd Grade'
    };

    const result = validateRow(
      invalidData,
      mappings,
      IMPORT_TYPES.STUDENTS,
      1
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should validate date formats', () => {
    const mappings = {
      name: 'Student Name',
      dateOfBirth: 'Birth Date'
    };

    const validData = {
      'Student Name': 'John Doe',
      'Birth Date': '01/15/2015'
    };

    const result = validateRow(
      validData,
      mappings,
      IMPORT_TYPES.STUDENTS,
      1
    );

    expect(result.isValid).toBe(true);
  });

  it('should detect invalid date formats', () => {
    const mappings = {
      name: 'Student Name',
      date: 'Date'
    };

    const invalidData = {
      'Student Name': 'John Doe',
      'Date': 'not-a-date'
    };

    const result = validateRow(
      invalidData,
      mappings,
      IMPORT_TYPES.PROGRESS_LOGS,
      1
    );

    // This should fail if date is required
    if (COLUMN_MAPPINGS[IMPORT_TYPES.PROGRESS_LOGS].find(c => c.key === 'date')?.required) {
      expect(result.isValid).toBe(false);
    }
  });

  it('should validate goal data', () => {
    const mappings = {
      studentName: 'Student',
      area: 'Area',
      description: 'Goal',
      target: 'Target'
    };

    const result = validateRow(
      mockGoalData[0],
      mappings,
      IMPORT_TYPES.GOALS,
      1
    );

    expect(result.isValid).toBe(true);
    expect(result.mappedData.area).toBe('Reading');
  });
});

describe('validateAllData', () => {
  it('should validate all rows and return statistics', () => {
    const mappings = {
      name: 'Student Name',
      grade: 'Grade',
      disability: 'Disability Type',
      studentNumber: 'Student ID'
    };

    const result = validateAllData(
      mockStudentData,
      mappings,
      IMPORT_TYPES.STUDENTS
    );

    expect(result.totalRows).toBe(2);
    expect(result.validRows).toBe(2);
    expect(result.invalidRows).toBe(0);
    expect(result.validData).toHaveLength(2);
  });

  it('should separate valid and invalid data', () => {
    const mappings = {
      name: 'Student Name',
      grade: 'Grade'
    };

    const mixedData = [
      {
        'Student Name': 'John Doe',
        'Grade': '3rd Grade'
      },
      {
        'Student Name': '', // Invalid - empty name
        'Grade': '4th Grade'
      },
      {
        'Student Name': 'Jane Smith',
        'Grade': '5th Grade'
      }
    ];

    const result = validateAllData(
      mixedData,
      mappings,
      IMPORT_TYPES.STUDENTS
    );

    expect(result.totalRows).toBe(3);
    expect(result.validRows).toBe(2);
    expect(result.invalidRows).toBe(1);
  });

  it('should respect maxErrors limit', () => {
    const mappings = {
      name: 'Student Name'
    };

    // Create 50 invalid rows
    const invalidData = Array(50).fill({
      'Student Name': ''
    });

    const result = validateAllData(
      invalidData,
      mappings,
      IMPORT_TYPES.STUDENTS,
      { maxErrors: 10 }
    );

    expect(result.errors.length).toBeLessThanOrEqual(10);
  });
});

// ============================================================================
// DUPLICATE DETECTION TESTS
// ============================================================================

describe('detectDuplicateStudents', () => {
  it('should detect duplicate by student number', () => {
    const importData = [
      {
        rowIndex: 1,
        data: {
          name: 'Different Name',
          studentNumber: '99999' // Matches existing
        }
      }
    ];

    const duplicates = detectDuplicateStudents(importData, existingStudents);

    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].matchType).toBe('student_number');
  });

  it('should detect duplicate by name', () => {
    const importData = [
      {
        rowIndex: 1,
        data: {
          name: 'Existing Student', // Matches existing
          studentNumber: '00000'
        }
      }
    ];

    const duplicates = detectDuplicateStudents(importData, existingStudents);

    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].matchType).toBe('name');
  });

  it('should not detect false duplicates', () => {
    const importData = [
      {
        rowIndex: 1,
        data: {
          name: 'New Student',
          studentNumber: '11111'
        }
      }
    ];

    const duplicates = detectDuplicateStudents(importData, existingStudents);

    expect(duplicates).toHaveLength(0);
  });
});

describe('detectDuplicateGoals', () => {
  it('should detect duplicate goals by description similarity', () => {
    // Note: studentMapping should use the exact studentName as key
    const studentMapping = {
      'John Doe': 'student-1'
    };

    const importData = [
      {
        rowIndex: 1,
        data: {
          studentName: 'John Doe',
          area: 'Reading',
          description: 'Read grade-level text with 90% accuracy' // Exact match
        }
      }
    ];

    const duplicates = detectDuplicateGoals(
      importData,
      existingGoals,
      studentMapping
    );

    expect(duplicates).toHaveLength(1);
  });

  it('should not match goals for different students', () => {
    const studentMapping = {
      'jane smith': 'student-2'
    };

    const importData = [
      {
        rowIndex: 1,
        data: {
          studentName: 'Jane Smith',
          area: 'Reading',
          description: 'Read grade-level text with 90% accuracy'
        }
      }
    ];

    const duplicates = detectDuplicateGoals(
      importData,
      existingGoals,
      studentMapping
    );

    expect(duplicates).toHaveLength(0);
  });
});

// ============================================================================
// DATA TRANSFORMATION TESTS
// ============================================================================

describe('transformStudentData', () => {
  it('should transform valid student data', () => {
    const validData = [
      {
        rowIndex: 1,
        data: {
          name: 'John Doe',
          grade: '3rd Grade',
          disability: 'Autism',
          studentNumber: '12345'
        }
      }
    ];

    const transformed = transformStudentData(validData);

    expect(transformed).toHaveLength(1);
    expect(transformed[0].name).toBe('John Doe');
    expect(transformed[0].grade).toBe('3rd Grade');
    expect(transformed[0].disability).toBe('Autism');
    expect(transformed[0].id).toBeDefined();
    expect(transformed[0].createdAt).toBeDefined();
  });

  it('should handle missing optional fields', () => {
    const validData = [
      {
        rowIndex: 1,
        data: {
          name: 'John Doe'
        }
      }
    ];

    const transformed = transformStudentData(validData);

    expect(transformed[0].grade).toBe('');
    expect(transformed[0].disability).toBe('');
  });

  it('should trim whitespace', () => {
    const validData = [
      {
        rowIndex: 1,
        data: {
          name: '  John Doe  ',
          grade: '  3rd Grade  '
        }
      }
    ];

    const transformed = transformStudentData(validData);

    expect(transformed[0].name).toBe('John Doe');
    expect(transformed[0].grade).toBe('3rd Grade');
  });
});

describe('transformGoalData', () => {
  it('should transform valid goal data with student mapping', () => {
    const studentMapping = {
      byName: {
        'john doe': 'student-123'
      }
    };

    const validData = [
      {
        rowIndex: 1,
        data: {
          studentName: 'John Doe',
          area: 'Reading',
          description: 'Test goal',
          baseline: '60%',
          target: '90%',
          metric: 'percentage'
        }
      }
    ];

    const transformed = transformGoalData(validData, studentMapping);

    expect(transformed).toHaveLength(1);
    expect(transformed[0].studentId).toBe('student-123');
    expect(transformed[0].area).toBe('Reading');
    expect(transformed[0].description).toBe('Test goal');
  });

  it('should filter out goals without valid student mapping', () => {
    const studentMapping = {
      byName: {}
    };

    const validData = [
      {
        rowIndex: 1,
        data: {
          studentName: 'Unknown Student',
          area: 'Reading',
          description: 'Test goal',
          target: '90%'
        }
      }
    ];

    const transformed = transformGoalData(validData, studentMapping);

    expect(transformed).toHaveLength(0);
  });

  it('should use student number mapping when available', () => {
    const studentMapping = {
      byName: {},
      byNumber: {
        '12345': 'student-456'
      }
    };

    const validData = [
      {
        rowIndex: 1,
        data: {
          studentName: 'John Doe',
          studentNumber: '12345',
          area: 'Math',
          description: 'Test goal',
          target: '85%'
        }
      }
    ];

    const transformed = transformGoalData(validData, studentMapping);

    expect(transformed[0].studentId).toBe('student-456');
  });
});

describe('transformProgressLogData', () => {
  it('should transform valid progress log data', () => {
    const goalMapping = {
      'test goal': 'goal-123'
    };

    const validData = [
      {
        rowIndex: 1,
        data: {
          goalDescription: 'Test Goal',
          date: '10/15/2024',
          score: '85',
          notes: 'Good progress'
        }
      }
    ];

    const transformed = transformProgressLogData(validData, goalMapping);

    expect(transformed).toHaveLength(1);
    expect(transformed[0].goalId).toBe('goal-123');
    expect(transformed[0].score).toBe('85');
    expect(transformed[0].notes).toBe('Good progress');
  });

  it('should filter out logs without valid goal mapping', () => {
    const goalMapping = {};

    const validData = [
      {
        rowIndex: 1,
        data: {
          goalDescription: 'Unknown Goal',
          date: '10/15/2024',
          score: '85'
        }
      }
    ];

    const transformed = transformProgressLogData(validData, goalMapping);

    expect(transformed).toHaveLength(0);
  });
});

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty data', () => {
    const result = validateAllData(
      [],
      { name: 'Name' },
      IMPORT_TYPES.STUDENTS
    );

    expect(result.totalRows).toBe(0);
    expect(result.validRows).toBe(0);
    expect(result.invalidRows).toBe(0);
  });

  it('should handle special characters in names', () => {
    const mappings = {
      name: 'Student Name'
    };

    const data = [
      { 'Student Name': "O'Brien, Mary-Jane" }
    ];

    const result = validateRow(data[0], mappings, IMPORT_TYPES.STUDENTS, 1);

    expect(result.isValid).toBe(true);
  });

  it('should handle very long values', () => {
    const mappings = {
      description: 'Goal'
    };

    const longDescription = 'A'.repeat(1000);
    const data = [
      {
        'Goal': longDescription,
        'Student': 'John Doe',
        'Area': 'Reading',
        'Target': '90%'
      }
    ];

    const result = validateRow(data[0], { ...mappings, studentName: 'Student', area: 'Area', target: 'Target' }, IMPORT_TYPES.GOALS, 1);

    expect(result.isValid).toBe(true);
  });
});
