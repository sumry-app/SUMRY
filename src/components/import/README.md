# SUMRY Data Import System

A comprehensive, production-ready data import system for SUMRY with CSV/Excel parsing, smart column mapping, data validation, duplicate detection, and error handling.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Import Types](#import-types)
- [Column Mappings](#column-mappings)
- [Data Validation](#data-validation)
- [Duplicate Detection](#duplicate-detection)
- [Error Handling](#error-handling)
- [Advanced Usage](#advanced-usage)
- [API Reference](#api-reference)
- [Testing](#testing)

## Features

### 1. File Upload & Parsing
- **Drag-and-drop interface** - Easy file upload with visual feedback
- **CSV and Excel support** - Handles .csv, .xlsx, and .xls files
- **Large file handling** - Incremental processing for files with thousands of rows
- **File validation** - Automatic file type detection and validation

### 2. Smart Column Mapping
- **Auto-detection** - Fuzzy matching algorithm automatically maps columns
- **Confidence scores** - Shows how confident the auto-mapping is
- **Manual override** - Easy interface to adjust mappings
- **Alias support** - Recognizes common variations of column names
- **Required field validation** - Ensures all required fields are mapped

### 3. Data Validation
- **Required field checking** - Validates that required data is present
- **Data type validation** - Ensures correct data types (dates, numbers, etc.)
- **Format validation** - Validates date formats, email formats, etc.
- **Custom validation rules** - Extensible validation system
- **Line-by-line error reporting** - Shows exactly which rows have errors

### 4. Duplicate Detection
- **Student duplicates** - Detects by name or student number
- **Goal duplicates** - Detects by description similarity and area
- **Smart matching** - Uses fuzzy matching for intelligent detection
- **Skip option** - Option to skip duplicates during import

### 5. Preview & Validation
- **Data preview** - Shows first 10 rows before importing
- **Validation status** - Visual indicators for valid/invalid rows
- **Summary statistics** - Total rows, valid rows, error count
- **Error details** - Expandable error list with line numbers
- **Duplicate warnings** - Highlights potential duplicates

### 6. Import Progress
- **Real-time progress** - Shows import progress with percentage
- **Status messages** - Clear messages about what's happening
- **Success/error summary** - Detailed results after import
- **Rollback capability** - Data not saved if errors occur

### 7. Import Templates
- **Download templates** - Pre-formatted Excel templates
- **Sample data** - Templates include example rows
- **Correct headers** - Ensures proper column naming
- **Easy customization** - Templates can be customized for your needs

## Quick Start

### Basic Usage

```jsx
import { ImportDialog } from './components/import';

function MyComponent() {
  const handleImportComplete = (result) => {
    console.log(`Imported ${result.count} ${result.type}`);
  };

  return (
    <ImportDialog onImportComplete={handleImportComplete} />
  );
}
```

### With Custom Trigger

```jsx
import { ImportDialog } from './components/import';
import { Upload } from 'lucide-react';

function MyComponent() {
  return (
    <ImportDialog
      trigger={
        <button className="btn-primary">
          <Upload /> Import Data
        </button>
      }
    />
  );
}
```

## Import Types

### 1. Student Roster

Import student information including name, grade, disability classification, and student number.

**Required Fields:**
- Student Name

**Optional Fields:**
- Grade Level
- Disability Classification
- Student Number
- Date of Birth

**Column Aliases:**
- Name: "student name", "student", "full name", "name"
- Grade: "grade", "grade level", "gradelevel"
- Disability: "disability", "classification", "disability type", "primary disability"
- Student Number: "student number", "student id", "id", "student#"

**Example Template:**

| Student Name | Grade Level | Disability Classification | Student Number | Date of Birth |
|--------------|-------------|---------------------------|----------------|---------------|
| John Doe     | 3rd Grade   | Autism Spectrum Disorder  | 123456         | 01/15/2015    |
| Jane Smith   | 5th Grade   | Specific Learning Disability | 123457      | 03/22/2013    |

### 2. Goals List

Import IEP goals with student association, area, description, baseline, and target.

**Required Fields:**
- Student Name
- Goal Area
- Goal Description
- Target

**Optional Fields:**
- Student Number
- Baseline
- Metric/Unit

**Column Aliases:**
- Student Name: "student name", "student", "name"
- Area: "area", "goal area", "domain", "category"
- Description: "description", "goal", "goal description", "text"
- Target: "target", "target value", "goal target", "objective"

**Example Template:**

| Student Name | Student Number | Goal Area | Goal Description | Baseline | Target | Metric/Unit |
|--------------|----------------|-----------|------------------|----------|--------|-------------|
| John Doe     | 123456         | Reading   | Student will read grade-level text | 60% | 90% | percentage |
| Jane Smith   | 123457         | Math      | Solve 2-digit addition problems | 45% | 85% | percentage |

### 3. Progress Logs

Import progress data for existing goals.

**Required Fields:**
- Goal Description
- Date
- Score/Value

**Optional Fields:**
- Student Name
- Notes

**Column Aliases:**
- Goal: "goal", "goal description", "description"
- Date: "date", "log date", "observation date", "date recorded"
- Score: "score", "value", "result", "performance", "data"

**Example Template:**

| Student Name | Goal Description | Date | Score | Notes |
|--------------|------------------|------|-------|-------|
| John Doe     | Student will read grade-level text | 10/15/2024 | 75 | Good progress |
| Jane Smith   | Solve 2-digit addition problems | 10/15/2024 | 68 | Used manipulatives |

## Column Mappings

The import system uses intelligent fuzzy matching to automatically detect column mappings.

### How Auto-Detection Works

1. **Exact Match** - Looks for exact column name matches (case-insensitive)
2. **Alias Match** - Checks against known column name variations
3. **Fuzzy Match** - Uses string similarity to find close matches
4. **Confidence Score** - Each mapping gets a confidence score (0-1)
5. **High Confidence Threshold** - Only auto-maps if confidence ≥ 0.6

### Example Auto-Detection

```javascript
// File Headers
['student_name', 'grade_level', 'primary_disability']

// Auto-Detected Mappings
{
  name: 'student_name',        // confidence: 0.95
  grade: 'grade_level',        // confidence: 0.92
  disability: 'primary_disability'  // confidence: 0.88
}
```

### Manual Mapping Override

Users can always override auto-detected mappings through the UI:

```jsx
<select value={mappedHeader} onChange={(e) => handleMapping(field, e.target.value)}>
  <option value="">-- Select Column --</option>
  {headers.map(h => <option key={h} value={h}>{h}</option>)}
</select>
```

## Data Validation

### Validation Rules

#### Student Validation
- **Name**: Required, minimum 2 characters
- **Grade**: Optional, any text
- **Disability**: Optional, any text
- **Student Number**: Optional, any format
- **Date of Birth**: Optional, must be valid date (MM/DD/YYYY or YYYY-MM-DD)

#### Goal Validation
- **Student Name**: Required, must match existing student
- **Area**: Required, minimum 1 character
- **Description**: Required, minimum 5 characters
- **Baseline**: Optional, any format
- **Target**: Required, any format
- **Metric**: Optional, any text

#### Progress Log Validation
- **Goal Description**: Required, must match existing goal
- **Date**: Required, must be valid date
- **Score**: Required, can be any value
- **Notes**: Optional, any text

### Date Format Support

The system accepts multiple date formats:

```javascript
// Supported Formats
'01/15/2024'     // MM/DD/YYYY
'2024-01-15'     // YYYY-MM-DD
'1/15/2024'      // M/D/YYYY
'2024/01/15'     // YYYY/MM/DD

// All converted to ISO format: '2024-01-15'
```

### Custom Validation

You can extend validation rules in `/src/lib/dataImport.js`:

```javascript
const VALIDATION_RULES = {
  customField: (value) => {
    if (!value.match(/^[A-Z]{3}\d{3}$/)) {
      return 'Must be 3 letters followed by 3 numbers';
    }
    return null; // null means valid
  }
};
```

## Duplicate Detection

### Student Duplicate Detection

Students are considered duplicates if they match on:

1. **Student Number** (exact match, case-insensitive)
2. **Name** (exact match, case-insensitive)

```javascript
// Detected as duplicate
Import: { name: 'John Doe', studentNumber: '12345' }
Existing: { name: 'John Doe', studentNumber: '12345' }

// Also detected (student number match)
Import: { name: 'Johnny Doe', studentNumber: '12345' }
Existing: { name: 'John Doe', studentNumber: '12345' }
```

### Goal Duplicate Detection

Goals are considered duplicates if:

1. **Same student** (by ID)
2. **Same area**
3. **Description similarity** ≥ 85%

```javascript
// Detected as duplicate (high similarity)
Import: 'Read grade level text with 90% accuracy'
Existing: 'Read grade-level text with 90% accuracy'
```

### Handling Duplicates

Users can choose to:

1. **Skip duplicates** - Import only unique records
2. **Import anyway** - Import all records (may create duplicates)
3. **Review manually** - See list of duplicates before importing

## Error Handling

### Error Types

#### 1. File Errors
- Invalid file type
- Empty file
- Corrupted file
- File too large

#### 2. Mapping Errors
- Required column not mapped
- Invalid column selection

#### 3. Validation Errors
- Missing required field
- Invalid data format
- Invalid date
- String too short/long

#### 4. Import Errors
- Student not found (for goals/logs)
- Goal not found (for logs)
- Database error
- Network error

### Error Display

Errors are displayed with:
- **Row number** - Exact line in the file
- **Field name** - Which field has the error
- **Error message** - Clear description of the problem
- **Value** - The invalid value (for context)

```javascript
// Error Example
{
  row: 5,
  field: 'name',
  value: 'A',
  message: 'Name must be at least 2 characters long'
}
```

### Error Limits

To prevent overwhelming users:
- Maximum 100 errors shown by default
- Expandable error list
- Summary count shows total errors

## Advanced Usage

### Direct API Usage

You can use the import functions directly without the UI:

```javascript
import {
  parseFile,
  autoDetectColumns,
  validateAllData,
  transformStudentData
} from '@/lib/dataImport';

// Parse file
const parsed = await parseFile(file);

// Auto-detect columns
const mapping = autoDetectColumns(parsed.headers, 'students');

// Validate data
const validation = validateAllData(parsed.data, mapping.mappings, 'students');

// Transform valid data
const students = transformStudentData(validation.validData);

// Import to store
students.forEach(student => {
  await createStudent(student);
});
```

### Template Downloads

Download import templates programmatically:

```javascript
import { downloadImportTemplate, IMPORT_TYPES } from '@/lib/dataImport';

// Download student template
downloadImportTemplate(IMPORT_TYPES.STUDENTS);

// Download goal template
downloadImportTemplate(IMPORT_TYPES.GOALS);

// Download progress log template
downloadImportTemplate(IMPORT_TYPES.PROGRESS_LOGS);
```

### Incremental Import

For very large files, use incremental import:

```javascript
import { processIncrementalImport } from '@/lib/dataImport';

const results = await processIncrementalImport(
  data,
  100, // batch size
  async (batch, batchIndex) => {
    // Process batch
    const transformed = transformStudentData(batch);
    await Promise.all(transformed.map(s => createStudent(s)));

    return {
      successCount: transformed.length,
      errorCount: 0,
      errors: []
    };
  }
);
```

### Custom Import Type

Add a new import type:

```javascript
// 1. Add to IMPORT_TYPES
export const IMPORT_TYPES = {
  STUDENTS: 'students',
  GOALS: 'goals',
  PROGRESS_LOGS: 'progress_logs',
  ACCOMMODATIONS: 'accommodations' // New type
};

// 2. Define column mappings
export const COLUMN_MAPPINGS = {
  accommodations: [
    { key: 'name', label: 'Accommodation Name', required: true },
    { key: 'type', label: 'Type', required: true },
    { key: 'description', label: 'Description', required: false }
  ]
};

// 3. Add validation rules
const VALIDATION_RULES = {
  type: (value) => {
    const validTypes = ['Environmental', 'Instructional', 'Assessment'];
    if (!validTypes.includes(value)) {
      return `Type must be one of: ${validTypes.join(', ')}`;
    }
    return null;
  }
};

// 4. Add transformation function
export function transformAccommodationData(validData) {
  return validData.map(item => ({
    id: uid(),
    name: item.data.name,
    type: item.data.type,
    description: item.data.description || '',
    createdAt: new Date().toISOString()
  }));
}
```

## API Reference

### Components

#### `ImportDialog`

Main import dialog component.

**Props:**
- `trigger?: ReactNode` - Custom trigger button
- `onImportComplete?: (result) => void` - Callback when import completes

**Example:**
```jsx
<ImportDialog
  trigger={<button>Import</button>}
  onImportComplete={(result) => {
    console.log(`Imported ${result.count} items`);
  }}
/>
```

### Functions

#### `parseFile(file: File): Promise<ParsedData>`

Parse CSV or Excel file.

**Returns:**
```javascript
{
  headers: string[],
  data: object[],
  totalRows: number,
  fileName: string,
  fileType: 'csv' | 'excel'
}
```

#### `autoDetectColumns(headers: string[], importType: string): MappingResult`

Auto-detect column mappings using fuzzy matching.

**Returns:**
```javascript
{
  mappings: { [key: string]: string },
  confidence: { [key: string]: number },
  unmappedHeaders: string[],
  expectedColumns: ColumnDefinition[]
}
```

#### `validateAllData(data: object[], mappings: object, importType: string): ValidationResult`

Validate all rows of data.

**Returns:**
```javascript
{
  totalRows: number,
  validRows: number,
  invalidRows: number,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  validData: ValidRow[],
  invalidData: InvalidRow[]
}
```

#### `transformStudentData(validData: ValidRow[]): Student[]`

Transform validated data into student objects.

#### `transformGoalData(validData: ValidRow[], studentMapping: object): Goal[]`

Transform validated data into goal objects.

#### `transformProgressLogData(validData: ValidRow[], goalMapping: object): ProgressLog[]`

Transform validated data into progress log objects.

#### `downloadImportTemplate(importType: string): string`

Download import template for specified type. Returns filename.

## Testing

Run tests:

```bash
npm test src/lib/__tests__/dataImport.test.js
```

### Test Coverage

- ✅ Column auto-detection
- ✅ Fuzzy matching
- ✅ Validation rules
- ✅ Duplicate detection
- ✅ Data transformation
- ✅ Error handling
- ✅ Edge cases

### Example Test

```javascript
import { autoDetectColumns, IMPORT_TYPES } from '@/lib/dataImport';

test('auto-detects student columns', () => {
  const headers = ['Student Name', 'Grade', 'Disability'];
  const result = autoDetectColumns(headers, IMPORT_TYPES.STUDENTS);

  expect(result.mappings.name).toBe('Student Name');
  expect(result.mappings.grade).toBe('Grade');
  expect(result.confidence.name).toBeGreaterThan(0.8);
});
```

## Troubleshooting

### Common Issues

**Issue:** Auto-detection not working
- **Solution:** Check that column headers match common aliases or add new aliases to `COLUMN_MAPPINGS`

**Issue:** Date validation failing
- **Solution:** Ensure dates are in MM/DD/YYYY or YYYY-MM-DD format

**Issue:** Duplicates not detected
- **Solution:** Check that student/goal matching criteria are met (exact name match, etc.)

**Issue:** Import hanging on large files
- **Solution:** Use incremental import for files with >1000 rows

**Issue:** Student/Goal not found during goal/log import
- **Solution:** Ensure students/goals are imported first, check name matching

## Best Practices

1. **Import Order**: Import students first, then goals, then progress logs
2. **Use Templates**: Always start with downloaded templates for correct format
3. **Validate Before Import**: Review preview and fix errors before importing
4. **Handle Duplicates**: Decide on duplicate strategy before importing
5. **Backup Data**: Export existing data before large imports
6. **Test with Small Files**: Test import with 5-10 rows before full import
7. **Check Mappings**: Verify auto-detected mappings are correct
8. **Review Errors**: Read error messages carefully for quick fixes

## Support

For issues or questions:
1. Check this documentation
2. Review integration examples in `INTEGRATION_EXAMPLE.jsx`
3. Check test files for usage examples
4. Consult inline code comments in `dataImport.js`

## License

Part of the SUMRY application.
