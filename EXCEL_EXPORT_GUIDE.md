# SUMRY Advanced Excel Export System

## Overview

The SUMRY Excel Export System provides comprehensive, professional-grade Excel exports with advanced formatting, conditional formatting, charts, and multi-sheet workbooks. Built with the `xlsx` library, it supports multiple export types tailored to IEP management workflows.

## Features

### Core Capabilities

✅ **Multi-sheet Workbooks** - Organize related data across multiple sheets
✅ **Professional Formatting** - Bold headers, colored cells, borders, and fills
✅ **Auto-sized Columns** - Automatically adjusts column widths based on content
✅ **Conditional Formatting** - Color-coded cells based on status (on-track = green, off-track = red)
✅ **Freeze Panes** - Lock headers for easy scrolling
✅ **Print Settings** - Professional print layouts (margins, orientation, page size)
✅ **Formulas** - Built-in calculations for statistics and aggregations
✅ **Multiple Formats** - Export to XLSX or CSV
✅ **Progress Indicators** - Real-time feedback for large exports
✅ **Batch Export** - Export all data at once in a comprehensive workbook

### Export Types

1. **Student Roster** - Complete student demographics and information
2. **Goal Progress Report** - Detailed goal tracking with progress statistics
3. **Compliance Tracking** - Compliance items and service log summaries
4. **Progress Log History** - Complete history of all progress entries
5. **Analytics Summary** - Comprehensive statistics and performance metrics

## Installation

The `xlsx` library is already installed in SUMRY:

```bash
npm install xlsx
# Already in package.json: "xlsx": "^0.18.5"
```

## Quick Start

### Basic Usage

```javascript
import { exportStudentRoster, downloadExcel } from '@/lib/excelExport';

// Export student roster
const workbook = exportStudentRoster(students);
downloadExcel(workbook, 'Student_Roster');
```

### Using the UI Component

```javascript
import ExcelExportDialog from '@/components/shared/ExcelExportDialog';

function MyComponent() {
  return (
    <div>
      <ExcelExportDialog />
    </div>
  );
}
```

### Quick Actions Integration

The Excel export is integrated into the Quick Actions menu:
- Press `Ctrl+E` (or `Cmd+E` on Mac) to open Excel export dialog
- Or click the Quick Actions button and select "Export to Excel"

## API Reference

### Export Functions

#### 1. exportStudentRoster()

Export comprehensive student roster with all details.

```javascript
exportStudentRoster(students, options)
```

**Parameters:**
- `students` (Array) - Array of student objects
- `options` (Object) - Optional configuration
  - `includeInactive` (Boolean) - Include inactive students (default: false)
  - `selectedColumns` (Array) - Columns to include (default: ['all'])
  - `sortBy` (String) - Sort field: 'lastName' or 'grade' (default: 'lastName')

**Returns:** Workbook object

**Example:**
```javascript
const workbook = exportStudentRoster(students, {
  includeInactive: false,
  selectedColumns: ['last_name', 'first_name', 'grade_level'],
  sortBy: 'lastName'
});
```

#### 2. exportGoalProgressReport()

Export detailed goal progress report with charts and statistics.

```javascript
exportGoalProgressReport(students, goals, progressLogs, options)
```

**Parameters:**
- `students` (Array) - Array of student objects
- `goals` (Array) - Array of goal objects
- `progressLogs` (Array) - Array of progress log objects
- `options` (Object) - Optional configuration
  - `studentId` (String|null) - Specific student ID or null for all
  - `includeCharts` (Boolean) - Include chart data (default: true)

**Returns:** Workbook object with multiple sheets

**Features:**
- Summary sheet with all goals and progress statistics
- Individual sheets for each goal with detailed progress data
- Conditional formatting for on-track/off-track goals
- Trend analysis (Improving, Stable, Declining)

**Example:**
```javascript
const workbook = exportGoalProgressReport(students, goals, progressLogs, {
  studentId: 'specific-student-id',
  includeCharts: true
});
```

#### 3. exportComplianceTracking()

Export compliance items and service log tracking.

```javascript
exportComplianceTracking(students, complianceItems, serviceLogs, options)
```

**Parameters:**
- `students` (Array) - Array of student objects
- `complianceItems` (Array) - Array of compliance item objects
- `serviceLogs` (Array) - Array of service log objects
- `options` (Object) - Optional configuration

**Returns:** Workbook object with compliance and service sheets

**Features:**
- Compliance overview with due dates and status
- Days until due calculation with color coding
- Service log summary
- Overdue item highlighting (red)

#### 4. exportProgressLogHistory()

Export comprehensive progress log history.

```javascript
exportProgressLogHistory(students, goals, progressLogs, options)
```

**Parameters:**
- `students` (Array) - Array of student objects
- `goals` (Array) - Array of goal objects
- `progressLogs` (Array) - Array of progress log objects
- `options` (Object) - Optional configuration
  - `dateRange` (Object) - { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
  - `studentId` (String|null) - Filter by student
  - `goalArea` (String|null) - Filter by goal area

**Returns:** Workbook object

**Example:**
```javascript
const workbook = exportProgressLogHistory(students, goals, progressLogs, {
  dateRange: { start: '2024-01-01', end: '2024-12-31' },
  goalArea: 'Reading'
});
```

#### 5. exportAnalyticsSummary()

Export comprehensive analytics with multiple sheets.

```javascript
exportAnalyticsSummary(students, goals, progressLogs, options)
```

**Returns:** Workbook object with multiple analytics sheets

**Sheets:**
- **Overview** - Total counts and summary statistics
- **Student Performance** - Per-student metrics and progress
- **Goal Area Analysis** - Breakdown by goal area

**Features:**
- Average progress percentages
- On-track goal counts
- Trend analysis
- Color-coded performance indicators

#### 6. exportAllData()

Export all data in a comprehensive workbook.

```javascript
exportAllData(students, goals, progressLogs, complianceItems, serviceLogs, options)
```

**Returns:** Workbook object with all export types combined

**Sheets:**
- Student Roster
- Progress History
- Overview (Analytics)
- Student Performance (Analytics)
- Goal Area Analysis (Analytics)
- Compliance Tracking (if available)
- Service Logs (if available)

### Download Functions

#### downloadExcel()

Download workbook as XLSX file.

```javascript
downloadExcel(workbook, filename)
```

**Parameters:**
- `workbook` (Object) - Workbook object from export function
- `filename` (String) - Base filename (timestamp added automatically)

**Returns:** String - Full filename with timestamp

**Example:**
```javascript
const workbook = exportStudentRoster(students);
const filename = downloadExcel(workbook, 'Student_Roster');
// Downloads: Student_Roster_20250117_143025.xlsx
```

#### downloadCSV()

Download workbook as CSV file (first sheet only).

```javascript
downloadCSV(workbook, filename)
```

**Parameters:**
- `workbook` (Object) - Workbook object
- `filename` (String) - Base filename

**Example:**
```javascript
const workbook = exportStudentRoster(students);
downloadCSV(workbook, 'Student_Roster');
```

#### workbookToBlob()

Generate blob from workbook for upload or preview.

```javascript
workbookToBlob(workbook)
```

**Returns:** Blob object

### Utility Functions

#### calculateGoalStats()

Calculate progress statistics for a goal.

```javascript
calculateGoalStats(goal, progressLogs)
```

**Returns:** Object with:
- `logCount` - Number of progress logs
- `avgScore` - Average score
- `latestScore` - Most recent score
- `progressPercentage` - Progress toward target
- `trend` - 'Improving', 'Stable', 'Declining', or 'No Data'

## Styling and Formatting

### Colors

The system uses a consistent color scheme:

```javascript
const COLORS = {
  primary: { rgb: 'E38673' },      // Coral
  secondary: { rgb: '65A39B' },    // Teal
  success: { rgb: '4CAF50' },      // Green (On-track)
  warning: { rgb: 'FFC107' },      // Yellow (Needs attention)
  danger: { rgb: 'F44336' },       // Red (Off-track/Overdue)
  lightGray: { rgb: 'F5F5F5' },
  darkGray: { rgb: '757575' },
  white: { rgb: 'FFFFFF' },
  black: { rgb: '000000' }
};
```

### Conditional Formatting Rules

#### Goal Status
- **Active** - Green background
- **Completed** - Teal background
- **Discontinued** - Red background

#### Progress Percentage
- **≥80%** - Green background (On-track)
- **50-79%** - Yellow background (Needs attention)
- **<50%** - Red background (Off-track)

#### Trend
- **Improving** - Green background
- **Declining** - Red background
- **Stable** - White background

#### Compliance Status
- **Completed** - Green background
- **Pending** - Yellow background
- **Overdue** - Red background

#### Days Until Due
- **Negative (overdue)** - Red background
- **0-7 days** - Yellow background
- **8-30 days** - Light gray background
- **>30 days** - White background

## UI Component

### ExcelExportDialog

A comprehensive React dialog component for Excel exports.

**Features:**
- Export type selection (5 types)
- Format selection (XLSX/CSV)
- Student filtering
- Date range filtering
- Column selection for roster exports
- Include/exclude inactive students
- Progress indicators
- Batch export option
- Success notifications

**Usage:**

```javascript
import ExcelExportDialog from '@/components/shared/ExcelExportDialog';

// Default trigger button
<ExcelExportDialog />

// Custom trigger
<ExcelExportDialog
  trigger={
    <Button>Custom Export Button</Button>
  }
/>
```

## Integration Points

### 1. Quick Actions Menu

Already integrated in `/src/components/shared/QuickActions.jsx`:
- Keyboard shortcut: `Ctrl+E` (or `Cmd+E`)
- Action: 'export-excel'

### 2. Student Detail Pages

Add export button to student pages:

```javascript
import ExcelExportDialog from '@/components/shared/ExcelExportDialog';

function StudentDetailPage({ student }) {
  return (
    <div>
      <ExcelExportDialog />
      {/* Student details */}
    </div>
  );
}
```

### 3. Dashboard

Add to dashboard for quick access:

```javascript
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { exportAnalyticsSummary, downloadExcel } from '@/lib/excelExport';

function Dashboard({ students, goals, progressLogs }) {
  const handleQuickExport = () => {
    const workbook = exportAnalyticsSummary(students, goals, progressLogs);
    downloadExcel(workbook, 'Dashboard_Analytics');
  };

  return (
    <div>
      <Button onClick={handleQuickExport}>
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Export Analytics
      </Button>
    </div>
  );
}
```

### 4. IEP Meeting Prep

Add to meeting preparation workflow:

```javascript
import { exportGoalProgressReport, downloadExcel } from '@/lib/excelExport';

function IEPMeetingPrep({ student, goals, progressLogs }) {
  const handleExportForMeeting = () => {
    const workbook = exportGoalProgressReport(
      [student],
      goals.filter(g => g.student_id === student.id),
      progressLogs,
      { studentId: student.id }
    );

    downloadExcel(workbook, `IEP_Meeting_${student.last_name}`);
  };

  return <Button onClick={handleExportForMeeting}>Export for Meeting</Button>;
}
```

## Advanced Usage

### Custom Export with Progress Tracking

```javascript
async function exportWithProgress(students, goals, progressLogs) {
  const progressCallback = (percent, message) => {
    console.log(`${percent}%: ${message}`);
    // Update UI with progress
  };

  progressCallback(0, 'Starting export...');

  await new Promise(resolve => setTimeout(resolve, 500));
  progressCallback(25, 'Generating workbook...');

  const workbook = exportGoalProgressReport(students, goals, progressLogs);

  progressCallback(75, 'Formatting...');
  await new Promise(resolve => setTimeout(resolve, 300));

  progressCallback(100, 'Complete!');
  downloadExcel(workbook, 'Progress_Report');
}
```

### Batch Export for Selected Students

```javascript
function batchExportSelected(students, goals, progressLogs, selectedIds) {
  const filteredStudents = students.filter(s => selectedIds.includes(s.id));
  const filteredGoals = goals.filter(g => selectedIds.includes(g.student_id));
  const goalIds = filteredGoals.map(g => g.id);
  const filteredLogs = progressLogs.filter(log => goalIds.includes(log.goal_id));

  const workbook = exportGoalProgressReport(
    filteredStudents,
    filteredGoals,
    filteredLogs
  );

  downloadExcel(workbook, 'Selected_Students');
}
```

### Scheduled/Automated Exports

```javascript
// Example: Weekly automated export
function scheduleWeeklyExport(students, goals, progressLogs) {
  const exportData = () => {
    const workbook = exportAnalyticsSummary(students, goals, progressLogs);
    downloadExcel(workbook, 'Weekly_Report');
  };

  // Run every Monday at 9 AM
  // (Use a proper scheduler like node-cron in production)
  setInterval(exportData, 7 * 24 * 60 * 60 * 1000);
}
```

## Best Practices

### 1. Error Handling

Always wrap exports in try-catch blocks:

```javascript
try {
  const workbook = exportStudentRoster(students);
  downloadExcel(workbook, 'Student_Roster');
  showSuccessNotification('Export completed!');
} catch (error) {
  console.error('Export failed:', error);
  showErrorNotification('Export failed. Please try again.');
}
```

### 2. Data Validation

Validate data before exporting:

```javascript
function validateExportData(students, goals, progressLogs) {
  if (!students || students.length === 0) {
    throw new Error('No students to export');
  }

  if (!goals || goals.length === 0) {
    console.warn('No goals found for export');
  }

  return true;
}

// Use before export
validateExportData(students, goals, progressLogs);
const workbook = exportGoalProgressReport(students, goals, progressLogs);
```

### 3. Performance Optimization

For large datasets:

```javascript
// Add loading indicator
setIsLoading(true);

// Use setTimeout to allow UI to update
setTimeout(() => {
  const workbook = exportStudentRoster(students);
  downloadExcel(workbook, 'Student_Roster');
  setIsLoading(false);
}, 100);
```

### 4. User Permissions

Check permissions before allowing exports:

```javascript
function canExportData(user) {
  return ['admin', 'teacher'].includes(user.role);
}

if (!canExportData(currentUser)) {
  showErrorNotification('You do not have permission to export data');
  return;
}
```

### 5. File Naming

Use descriptive, timestamped filenames:

```javascript
const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
const filename = `SUMRY_${exportType}_${studentName}_${timestamp}`;
downloadExcel(workbook, filename);
```

## Troubleshooting

### Issue: Export is slow for large datasets

**Solution:** Add progress indicators and consider pagination:

```javascript
// For >1000 records, show progress
if (students.length > 1000) {
  showProgressDialog();
}
```

### Issue: Columns are too wide/narrow

**Solution:** Adjust the `autoSizeColumns` parameters in `excelExport.js`:

```javascript
autoSizeColumns(worksheet, data, minWidth = 10, maxWidth = 50);
// Adjust minWidth and maxWidth as needed
```

### Issue: Colors not appearing correctly

**Solution:** Verify RGB color format (no '#' prefix):

```javascript
// Correct
{ rgb: 'FF0000' }

// Incorrect
{ rgb: '#FF0000' }
```

### Issue: Merged cells not working

**Solution:** Ensure merge range is valid:

```javascript
worksheet['!merges'] = [{
  s: { r: 0, c: 0 },  // Start row, col
  e: { r: 0, c: 5 }   // End row, col
}];
```

## Examples

See `/src/lib/excelExportExamples.js` for 15+ comprehensive examples including:

- Basic exports
- Filtered exports
- Date range exports
- Custom column selection
- Progress indicators
- Batch exports
- IEP meeting prep
- Quarterly reports
- End-of-year summaries

## Support

For issues or questions:
1. Check the examples in `excelExportExamples.js`
2. Review the API reference above
3. Check the XLSX library documentation: https://docs.sheetjs.com/

## Future Enhancements

Potential future features:
- [ ] Embedded charts (requires additional library)
- [ ] Data validation dropdowns
- [ ] Cell comments
- [ ] Protected sheets
- [ ] Custom templates
- [ ] Email exports directly
- [ ] Cloud storage integration
- [ ] Scheduled automated exports
- [ ] Export history tracking

## License

Part of the SUMRY IEP Management System.
