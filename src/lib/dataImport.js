/**
 * SUMRY Data Import System
 *
 * Comprehensive data import functionality with:
 * - CSV/Excel file parsing
 * - Smart column mapping with fuzzy matching
 * - Data validation (required fields, types, formats)
 * - Duplicate detection
 * - Error reporting with line numbers
 * - Preview before import
 * - Incremental import for large files
 * - Import templates download
 */

import * as XLSX from 'xlsx';
import { uid } from './data';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

// Import types configuration
export const IMPORT_TYPES = {
  STUDENTS: 'students',
  GOALS: 'goals',
  PROGRESS_LOGS: 'progress_logs',
  BULK: 'bulk'
};

// Column mappings for each import type
export const COLUMN_MAPPINGS = {
  students: [
    { key: 'name', label: 'Student Name', required: true, aliases: ['student name', 'student', 'full name', 'name'] },
    { key: 'grade', label: 'Grade Level', required: false, aliases: ['grade', 'grade level', 'gradelevel'] },
    { key: 'disability', label: 'Disability Classification', required: false, aliases: ['disability', 'classification', 'disability type', 'primary disability'] },
    { key: 'studentNumber', label: 'Student Number', required: false, aliases: ['student number', 'student id', 'id', 'student#'] },
    { key: 'dateOfBirth', label: 'Date of Birth', required: false, aliases: ['date of birth', 'dob', 'birthdate', 'birth date'], format: 'date' },
  ],
  goals: [
    { key: 'studentName', label: 'Student Name', required: true, aliases: ['student name', 'student', 'name'] },
    { key: 'studentNumber', label: 'Student Number', required: false, aliases: ['student number', 'student id', 'id'] },
    { key: 'area', label: 'Goal Area', required: true, aliases: ['area', 'goal area', 'domain', 'category'] },
    { key: 'description', label: 'Goal Description', required: true, aliases: ['description', 'goal', 'goal description', 'text'] },
    { key: 'baseline', label: 'Baseline', required: false, aliases: ['baseline', 'baseline value', 'starting point', 'current level'] },
    { key: 'target', label: 'Target', required: true, aliases: ['target', 'target value', 'goal target', 'objective'] },
    { key: 'metric', label: 'Metric/Unit', required: false, aliases: ['metric', 'unit', 'measurement', 'measure'] },
  ],
  progress_logs: [
    { key: 'studentName', label: 'Student Name', required: false, aliases: ['student name', 'student', 'name'] },
    { key: 'goalDescription', label: 'Goal Description', required: true, aliases: ['goal', 'goal description', 'description'] },
    { key: 'date', label: 'Date', required: true, aliases: ['date', 'log date', 'observation date', 'date recorded'], format: 'date' },
    { key: 'score', label: 'Score/Value', required: true, aliases: ['score', 'value', 'result', 'performance', 'data'] },
    { key: 'notes', label: 'Notes', required: false, aliases: ['notes', 'comments', 'observations', 'remarks', 'description'] },
  ]
};

// Validation rules
const VALIDATION_RULES = {
  name: (value) => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return 'Name is required and must be a non-empty text';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    return null;
  },
  studentName: (value) => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return 'Student name is required';
    }
    return null;
  },
  area: (value) => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return 'Goal area is required';
    }
    const validAreas = ['Reading', 'Math', 'Writing', 'Behavior', 'Communication', 'Social Skills', 'Motor Skills', 'Other'];
    // Allow any value but suggest valid areas
    return null;
  },
  description: (value) => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return 'Description is required';
    }
    if (value.trim().length < 5) {
      return 'Description must be at least 5 characters long';
    }
    return null;
  },
  goalDescription: (value) => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return 'Goal description is required for matching';
    }
    return null;
  },
  target: (value) => {
    if (!value || value.toString().trim().length === 0) {
      return 'Target value is required';
    }
    return null;
  },
  date: (value) => {
    if (!value) {
      return 'Date is required';
    }
    const date = parseDate(value);
    if (!date || isNaN(date.getTime())) {
      return 'Invalid date format. Use MM/DD/YYYY or YYYY-MM-DD';
    }
    return null;
  },
  score: (value) => {
    if (value === null || value === undefined || value.toString().trim() === '') {
      return 'Score is required';
    }
    return null;
  }
};

// ============================================================================
// FILE PARSING
// ============================================================================

/**
 * Parse uploaded file (CSV or Excel) into array of objects
 */
export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: null,
          blankrows: false
        });

        if (jsonData.length === 0) {
          reject(new Error('File is empty or has no data rows'));
          return;
        }

        // Get headers
        const headers = Object.keys(jsonData[0]);

        resolve({
          headers,
          data: jsonData,
          totalRows: jsonData.length,
          fileName: file.name,
          fileType: file.name.endsWith('.csv') ? 'csv' : 'excel'
        });
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Detect file type
 */
export function detectFileType(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'csv') return 'csv';
  if (['xlsx', 'xls'].includes(extension)) return 'excel';

  return null;
}

// ============================================================================
// COLUMN MAPPING
// ============================================================================

/**
 * Calculate similarity between two strings (0-1)
 * Uses Levenshtein distance for fuzzy matching
 */
function stringSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1;

  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Levenshtein distance
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1;

  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  const distance = costs[shorter.length];
  return (longer.length - distance) / longer.length;
}

/**
 * Auto-detect column mappings using fuzzy matching
 */
export function autoDetectColumns(headers, importType) {
  const expectedColumns = COLUMN_MAPPINGS[importType];
  const mappings = {};
  const unmappedHeaders = [...headers];
  const confidence = {};

  expectedColumns.forEach(expectedCol => {
    let bestMatch = null;
    let bestScore = 0;

    headers.forEach(header => {
      // Check against main label and aliases
      const allNames = [expectedCol.label, ...(expectedCol.aliases || [])];

      allNames.forEach(name => {
        const score = stringSimilarity(header, name);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = header;
        }
      });
    });

    // Only auto-map if confidence is high enough
    if (bestScore >= 0.6) {
      mappings[expectedCol.key] = bestMatch;
      confidence[expectedCol.key] = bestScore;

      // Remove from unmapped
      const index = unmappedHeaders.indexOf(bestMatch);
      if (index > -1) {
        unmappedHeaders.splice(index, 1);
      }
    }
  });

  return {
    mappings,
    confidence,
    unmappedHeaders,
    expectedColumns
  };
}

/**
 * Validate column mappings
 */
export function validateColumnMappings(mappings, importType) {
  const expectedColumns = COLUMN_MAPPINGS[importType];
  const errors = [];

  expectedColumns.forEach(col => {
    if (col.required && !mappings[col.key]) {
      errors.push({
        field: col.key,
        message: `Required column "${col.label}" is not mapped`
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// DATA VALIDATION
// ============================================================================

/**
 * Parse date from various formats
 */
function parseDate(value) {
  if (!value) return null;

  // If already a date object
  if (value instanceof Date) {
    return value;
  }

  // Try parsing string
  const str = value.toString().trim();

  // Try various date formats
  const formats = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,  // YYYY-MM-DD
  ];

  for (const format of formats) {
    const match = str.match(format);
    if (match) {
      let year, month, day;

      if (match[1].length === 4) {
        // YYYY-MM-DD format
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else {
        // MM/DD/YYYY format
        month = parseInt(match[1]) - 1;
        day = parseInt(match[2]);
        year = parseInt(match[3]);
      }

      const date = new Date(year, month, day);

      // Validate date is real
      if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
        return date;
      }
    }
  }

  // Try built-in parser as last resort
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
function formatDateISO(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : parseDate(date);
  if (!d) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Validate a single row of data
 */
export function validateRow(rowData, mappings, importType, rowIndex) {
  const errors = [];
  const warnings = [];
  const expectedColumns = COLUMN_MAPPINGS[importType];

  // Build mapped data object
  const mappedData = {};
  Object.keys(mappings).forEach(key => {
    const headerName = mappings[key];
    mappedData[key] = rowData[headerName];
  });

  // Validate each field
  expectedColumns.forEach(col => {
    const value = mappedData[col.key];

    // Check required fields
    if (col.required && (!value || value.toString().trim() === '')) {
      errors.push({
        row: rowIndex,
        field: col.key,
        value: value,
        message: `${col.label} is required`
      });
    }

    // Apply validation rules
    if (VALIDATION_RULES[col.key] && value) {
      const validationError = VALIDATION_RULES[col.key](value);
      if (validationError) {
        errors.push({
          row: rowIndex,
          field: col.key,
          value: value,
          message: validationError
        });
      }
    }

    // Format-specific validation
    if (col.format === 'date' && value) {
      const parsedDate = parseDate(value);
      if (!parsedDate) {
        errors.push({
          row: rowIndex,
          field: col.key,
          value: value,
          message: `Invalid date format for ${col.label}`
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    mappedData
  };
}

/**
 * Validate all data rows
 */
export function validateAllData(data, mappings, importType, options = {}) {
  const { maxErrors = 100 } = options;

  const results = {
    totalRows: data.length,
    validRows: 0,
    invalidRows: 0,
    errors: [],
    warnings: [],
    validData: [],
    invalidData: []
  };

  data.forEach((row, index) => {
    const validation = validateRow(row, mappings, importType, index + 1);

    if (validation.isValid) {
      results.validRows++;
      results.validData.push({
        rowIndex: index + 1,
        data: validation.mappedData,
        originalData: row
      });
    } else {
      results.invalidRows++;
      results.invalidData.push({
        rowIndex: index + 1,
        data: validation.mappedData,
        originalData: row,
        errors: validation.errors
      });

      // Collect errors (up to max)
      validation.errors.forEach(error => {
        if (results.errors.length < maxErrors) {
          results.errors.push(error);
        }
      });
    }

    // Collect warnings
    results.warnings.push(...validation.warnings);
  });

  return results;
}

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

/**
 * Detect duplicate students
 */
export function detectDuplicateStudents(importData, existingStudents) {
  const duplicates = [];

  importData.forEach((item, index) => {
    const name = item.data.name?.trim().toLowerCase();
    const studentNumber = item.data.studentNumber?.trim();

    // Check against existing students
    const existing = existingStudents.find(student => {
      const existingName = student.name?.trim().toLowerCase();
      const existingNumber = student.studentNumber?.trim();

      // Match by student number if available
      if (studentNumber && existingNumber && studentNumber === existingNumber) {
        return true;
      }

      // Match by name (exact match)
      if (name && existingName && name === existingName) {
        return true;
      }

      return false;
    });

    if (existing) {
      duplicates.push({
        rowIndex: item.rowIndex,
        importData: item.data,
        existingData: existing,
        matchType: studentNumber === existing.studentNumber ? 'student_number' : 'name'
      });
    }
  });

  return duplicates;
}

/**
 * Detect duplicate goals
 */
export function detectDuplicateGoals(importData, existingGoals, studentMapping) {
  const duplicates = [];

  importData.forEach((item, index) => {
    const studentId = studentMapping[item.data.studentName];
    const description = item.data.description?.trim().toLowerCase();
    const area = item.data.area?.trim();

    if (!studentId) return;

    // Check against existing goals for the same student
    const existing = existingGoals.find(goal => {
      if (goal.studentId !== studentId) return false;

      const existingDesc = goal.description?.trim().toLowerCase();
      const existingArea = goal.area?.trim();

      // Match by description similarity (high threshold)
      if (description && existingDesc) {
        const similarity = stringSimilarity(description, existingDesc);
        if (similarity > 0.85 && area === existingArea) {
          return true;
        }
      }

      return false;
    });

    if (existing) {
      duplicates.push({
        rowIndex: item.rowIndex,
        importData: item.data,
        existingData: existing,
        matchType: 'description_and_area'
      });
    }
  });

  return duplicates;
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

/**
 * Transform validated data for students
 */
export function transformStudentData(validData) {
  return validData.map(item => {
    const data = item.data;

    return {
      id: uid(),
      name: data.name?.trim() || 'Unnamed Student',
      grade: data.grade?.trim() || '',
      disability: data.disability?.trim() || '',
      studentNumber: data.studentNumber?.trim() || undefined,
      dateOfBirth: data.dateOfBirth ? formatDateISO(parseDate(data.dateOfBirth)) : undefined,
      createdAt: new Date().toISOString()
    };
  });
}

/**
 * Transform validated data for goals
 */
export function transformGoalData(validData, studentMapping) {
  return validData.map(item => {
    const data = item.data;

    // Find student ID by name or student number
    let studentId = null;
    const studentName = data.studentName?.trim();
    const studentNumber = data.studentNumber?.trim();

    if (studentNumber && studentMapping.byNumber) {
      studentId = studentMapping.byNumber[studentNumber];
    }

    if (!studentId && studentName && studentMapping.byName) {
      studentId = studentMapping.byName[studentName.toLowerCase()];
    }

    if (!studentId) {
      return null;
    }

    return {
      id: uid(),
      studentId,
      area: data.area?.trim() || 'General',
      description: data.description?.trim() || '',
      baseline: data.baseline?.trim() || '',
      target: data.target?.trim() || '',
      metric: data.metric?.trim() || '',
      createdAt: new Date().toISOString(),
      aiGenerated: false
    };
  }).filter(Boolean);
}

/**
 * Transform validated data for progress logs
 */
export function transformProgressLogData(validData, goalMapping) {
  return validData.map(item => {
    const data = item.data;

    // Find goal by description
    const goalDescription = data.goalDescription?.trim().toLowerCase();
    let goalId = null;

    if (goalDescription && goalMapping) {
      goalId = goalMapping[goalDescription];
    }

    if (!goalId) {
      return null;
    }

    return {
      id: uid(),
      goalId,
      dateISO: formatDateISO(parseDate(data.date)),
      score: data.score?.toString().trim() || '',
      notes: data.notes?.trim() || '',
      accommodationsUsed: []
    };
  }).filter(Boolean);
}

// ============================================================================
// IMPORT TEMPLATES
// ============================================================================

/**
 * Generate import template for a specific type
 */
export function generateImportTemplate(importType) {
  const columns = COLUMN_MAPPINGS[importType];

  // Create headers
  const headers = columns.map(col => col.label);

  // Create sample data rows
  const sampleData = [];

  if (importType === IMPORT_TYPES.STUDENTS) {
    sampleData.push(
      ['John Doe', '3rd Grade', 'Autism Spectrum Disorder', '123456', '01/15/2015'],
      ['Jane Smith', '5th Grade', 'Specific Learning Disability', '123457', '03/22/2013'],
      ['Alex Johnson', '2nd Grade', 'Speech/Language Impairment', '123458', '09/08/2016']
    );
  } else if (importType === IMPORT_TYPES.GOALS) {
    sampleData.push(
      ['John Doe', '123456', 'Reading', 'Student will read grade-level text with 90% accuracy', '60% accuracy', '90% accuracy', 'percentage'],
      ['Jane Smith', '123457', 'Math', 'Student will solve 2-digit addition problems with 85% accuracy', '45% accuracy', '85% accuracy', 'percentage'],
      ['Alex Johnson', '123458', 'Communication', 'Student will use 3-4 word sentences in 80% of opportunities', '2 words', '3-4 words', 'word count']
    );
  } else if (importType === IMPORT_TYPES.PROGRESS_LOGS) {
    sampleData.push(
      ['John Doe', 'Student will read grade-level text with 90% accuracy', '10/15/2024', '75', 'Good progress, needed some prompting'],
      ['Jane Smith', 'Student will solve 2-digit addition problems with 85% accuracy', '10/15/2024', '68', 'Used manipulatives successfully'],
      ['Alex Johnson', 'Student will use 3-4 word sentences in 80% of opportunities', '10/16/2024', '65', 'Improved from last week']
    );
  }

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

  // Set column widths
  const colWidths = columns.map(col => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  return wb;
}

/**
 * Download import template
 */
export function downloadImportTemplate(importType) {
  const wb = generateImportTemplate(importType);
  const fileName = `SUMRY_Import_Template_${importType}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(wb, fileName);

  return fileName;
}

// ============================================================================
// INCREMENTAL IMPORT
// ============================================================================

/**
 * Process large import in batches
 */
export async function processIncrementalImport(data, batchSize = 100, processBatch) {
  const totalBatches = Math.ceil(data.length / batchSize);
  const results = {
    totalRows: data.length,
    processedRows: 0,
    successCount: 0,
    errorCount: 0,
    errors: []
  };

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, data.length);
    const batch = data.slice(start, end);

    try {
      const batchResult = await processBatch(batch, i);

      results.processedRows += batch.length;
      results.successCount += batchResult.successCount || 0;
      results.errorCount += batchResult.errorCount || 0;

      if (batchResult.errors) {
        results.errors.push(...batchResult.errors);
      }
    } catch (error) {
      results.errorCount += batch.length;
      results.errors.push({
        batch: i,
        message: error.message,
        rowRange: `${start + 1}-${end}`
      });
    }
  }

  return results;
}

// ============================================================================
// PREVIEW GENERATION
// ============================================================================

/**
 * Generate preview data (first N rows)
 */
export function generatePreview(data, mappings, importType, previewRows = 10) {
  const preview = data.slice(0, previewRows).map((row, index) => {
    const mappedData = {};
    Object.keys(mappings).forEach(key => {
      const headerName = mappings[key];
      mappedData[key] = row[headerName];
    });

    return {
      rowIndex: index + 1,
      data: mappedData,
      validation: validateRow(row, mappings, importType, index + 1)
    };
  });

  return preview;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // File parsing
  parseFile,
  detectFileType,

  // Column mapping
  autoDetectColumns,
  validateColumnMappings,

  // Data validation
  validateRow,
  validateAllData,

  // Duplicate detection
  detectDuplicateStudents,
  detectDuplicateGoals,

  // Data transformation
  transformStudentData,
  transformGoalData,
  transformProgressLogData,

  // Templates
  generateImportTemplate,
  downloadImportTemplate,

  // Incremental import
  processIncrementalImport,

  // Preview
  generatePreview,

  // Constants
  IMPORT_TYPES,
  COLUMN_MAPPINGS
};
