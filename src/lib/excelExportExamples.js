/**
 * SUMRY Excel Export - Usage Examples
 *
 * This file contains comprehensive examples of how to use the Excel export system
 * in your components throughout the SUMRY application.
 */

import {
  exportStudentRoster,
  exportGoalProgressReport,
  exportComplianceTracking,
  exportProgressLogHistory,
  exportAnalyticsSummary,
  exportAllData,
  downloadExcel,
  downloadCSV
} from './excelExport';

// ============================================================================
// EXAMPLE 1: Basic Student Roster Export
// ============================================================================

export function example1_BasicRosterExport(students) {
  // Export all students with default settings
  const workbook = exportStudentRoster(students);
  downloadExcel(workbook, 'Student_Roster');
}

// ============================================================================
// EXAMPLE 2: Filtered Student Roster with Custom Columns
// ============================================================================

export function example2_FilteredRosterExport(students) {
  // Export only active students with selected columns
  const workbook = exportStudentRoster(students, {
    includeInactive: false,
    selectedColumns: ['last_name', 'first_name', 'grade_level', 'disability_classification'],
    sortBy: 'lastName'
  });

  downloadExcel(workbook, 'Active_Students');
}

// ============================================================================
// EXAMPLE 3: Goal Progress Report for Single Student
// ============================================================================

export function example3_SingleStudentProgressReport(students, goals, progressLogs, studentId) {
  // Export progress report for a specific student
  const workbook = exportGoalProgressReport(students, goals, progressLogs, {
    studentId: studentId,
    includeCharts: true
  });

  const student = students.find(s => s.id === studentId);
  const filename = `Progress_Report_${student.last_name}_${student.first_name}`;

  downloadExcel(workbook, filename);
}

// ============================================================================
// EXAMPLE 4: Goal Progress Report for All Students
// ============================================================================

export function example4_AllStudentsProgressReport(students, goals, progressLogs) {
  // Export progress reports for all students (creates multiple sheets)
  const workbook = exportGoalProgressReport(students, goals, progressLogs, {
    studentId: null, // null = all students
    includeCharts: true
  });

  downloadExcel(workbook, 'All_Students_Progress');
}

// ============================================================================
// EXAMPLE 5: Compliance Tracking Export
// ============================================================================

export function example5_ComplianceExport(students, complianceItems, serviceLogs) {
  // Export compliance tracking and service logs
  const workbook = exportComplianceTracking(students, complianceItems, serviceLogs);
  downloadExcel(workbook, 'Compliance_Tracking');
}

// ============================================================================
// EXAMPLE 6: Progress Log History with Date Range Filter
// ============================================================================

export function example6_ProgressLogsWithDateRange(students, goals, progressLogs, startDate, endDate) {
  // Export progress logs within a specific date range
  const workbook = exportProgressLogHistory(students, goals, progressLogs, {
    dateRange: {
      start: startDate,
      end: endDate
    }
  });

  downloadExcel(workbook, `Progress_Logs_${startDate}_to_${endDate}`);
}

// ============================================================================
// EXAMPLE 7: Progress Logs for Specific Goal Area
// ============================================================================

export function example7_ProgressLogsByGoalArea(students, goals, progressLogs, goalArea) {
  // Export progress logs for a specific goal area (e.g., 'Reading', 'Math')
  const workbook = exportProgressLogHistory(students, goals, progressLogs, {
    goalArea: goalArea
  });

  downloadExcel(workbook, `${goalArea}_Progress_Logs`);
}

// ============================================================================
// EXAMPLE 8: Comprehensive Analytics Summary
// ============================================================================

export function example8_AnalyticsSummary(students, goals, progressLogs) {
  // Export comprehensive analytics with multiple sheets
  const workbook = exportAnalyticsSummary(students, goals, progressLogs);
  downloadExcel(workbook, 'Analytics_Summary');
}

// ============================================================================
// EXAMPLE 9: Complete Data Export (All Sheets)
// ============================================================================

export function example9_CompleteDataExport(students, goals, progressLogs, complianceItems, serviceLogs) {
  // Export everything in one comprehensive workbook
  const workbook = exportAllData(
    students,
    goals,
    progressLogs,
    complianceItems,
    serviceLogs,
    {
      includeInactive: true
    }
  );

  downloadExcel(workbook, 'SUMRY_Complete_Export');
}

// ============================================================================
// EXAMPLE 10: Export to CSV Instead of Excel
// ============================================================================

export function example10_ExportToCSV(students) {
  // Export to CSV format (only first sheet)
  const workbook = exportStudentRoster(students);
  downloadCSV(workbook, 'Student_Roster');
}

// ============================================================================
// EXAMPLE 11: Custom Export with Progress Indicator
// ============================================================================

export async function example11_ExportWithProgress(
  students,
  goals,
  progressLogs,
  onProgress
) {
  // Simulate progress updates during export
  onProgress({ percent: 0, message: 'Starting export...' });

  await new Promise(resolve => setTimeout(resolve, 500));

  onProgress({ percent: 25, message: 'Generating student data...' });
  const workbook = exportGoalProgressReport(students, goals, progressLogs);

  await new Promise(resolve => setTimeout(resolve, 500));

  onProgress({ percent: 75, message: 'Formatting workbook...' });

  await new Promise(resolve => setTimeout(resolve, 300));

  onProgress({ percent: 100, message: 'Download complete!' });
  downloadExcel(workbook, 'Progress_Report');
}

// ============================================================================
// EXAMPLE 12: Batch Export for Selected Students
// ============================================================================

export function example12_BatchExportSelectedStudents(
  students,
  goals,
  progressLogs,
  selectedStudentIds
) {
  // Export data only for selected students
  const filteredStudents = students.filter(s => selectedStudentIds.includes(s.id));
  const filteredGoals = goals.filter(g => selectedStudentIds.includes(g.student_id));
  const filteredGoalIds = filteredGoals.map(g => g.id);
  const filteredLogs = progressLogs.filter(log => filteredGoalIds.includes(log.goal_id));

  const workbook = exportGoalProgressReport(
    filteredStudents,
    filteredGoals,
    filteredLogs
  );

  downloadExcel(workbook, 'Selected_Students_Export');
}

// ============================================================================
// EXAMPLE 13: IEP Meeting Prep Export
// ============================================================================

export function example13_IEPMeetingPrepExport(
  students,
  goals,
  progressLogs,
  studentId
) {
  // Export comprehensive data for IEP meeting
  const student = students.find(s => s.id === studentId);
  const studentGoals = goals.filter(g => g.student_id === studentId);
  const goalIds = studentGoals.map(g => g.id);
  const studentLogs = progressLogs.filter(log => goalIds.includes(log.goal_id));

  // Create multi-sheet workbook with all relevant information
  const workbook = exportGoalProgressReport(
    [student],
    studentGoals,
    studentLogs,
    {
      studentId: studentId,
      includeCharts: true
    }
  );

  downloadExcel(workbook, `IEP_Meeting_${student.last_name}_${student.first_name}`);
}

// ============================================================================
// EXAMPLE 14: Quarterly Progress Report
// ============================================================================

export function example14_QuarterlyProgressReport(
  students,
  goals,
  progressLogs,
  quarter,
  year
) {
  // Calculate date range for the quarter
  const quarterRanges = {
    1: { start: `${year}-01-01`, end: `${year}-03-31` },
    2: { start: `${year}-04-01`, end: `${year}-06-30` },
    3: { start: `${year}-07-01`, end: `${year}-09-30` },
    4: { start: `${year}-10-01`, end: `${year}-12-31` }
  };

  const dateRange = quarterRanges[quarter];

  const workbook = exportProgressLogHistory(students, goals, progressLogs, {
    dateRange: dateRange
  });

  downloadExcel(workbook, `Q${quarter}_${year}_Progress_Report`);
}

// ============================================================================
// EXAMPLE 15: End-of-Year Summary Export
// ============================================================================

export function example15_EndOfYearSummary(
  students,
  goals,
  progressLogs,
  complianceItems,
  serviceLogs
) {
  // Comprehensive end-of-year export with all data
  const workbook = exportAllData(
    students,
    goals,
    progressLogs,
    complianceItems,
    serviceLogs,
    {
      includeInactive: true // Include students who left during the year
    }
  );

  const year = new Date().getFullYear();
  downloadExcel(workbook, `SUMRY_End_of_Year_${year}`);
}

// ============================================================================
// INTEGRATION EXAMPLE: React Component
// ============================================================================

/**
 * Example React component showing how to integrate Excel export
 */
export const ExcelExportButton = ({ students, goals, progressLogs }) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Generate and download Excel file
      const workbook = exportGoalProgressReport(students, goals, progressLogs);
      downloadExcel(workbook, 'Progress_Report');

      // Show success notification
      alert('Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50"
    >
      {isExporting ? 'Exporting...' : 'Export to Excel'}
    </button>
  );
};

// ============================================================================
// HELPER FUNCTION: Quick Export Menu
// ============================================================================

export function createQuickExportMenu(students, goals, progressLogs, complianceItems, serviceLogs) {
  return {
    'Student Roster': () => {
      const wb = exportStudentRoster(students);
      downloadExcel(wb, 'Student_Roster');
    },
    'Progress Report': () => {
      const wb = exportGoalProgressReport(students, goals, progressLogs);
      downloadExcel(wb, 'Progress_Report');
    },
    'Progress Logs': () => {
      const wb = exportProgressLogHistory(students, goals, progressLogs);
      downloadExcel(wb, 'Progress_Logs');
    },
    'Analytics': () => {
      const wb = exportAnalyticsSummary(students, goals, progressLogs);
      downloadExcel(wb, 'Analytics');
    },
    'Complete Export': () => {
      const wb = exportAllData(students, goals, progressLogs, complianceItems, serviceLogs);
      downloadExcel(wb, 'Complete_Export');
    }
  };
}

// ============================================================================
// NOTES AND BEST PRACTICES
// ============================================================================

/**
 * BEST PRACTICES:
 *
 * 1. Always wrap exports in try-catch blocks for error handling
 * 2. Show loading indicators for large exports (1000+ records)
 * 3. Use descriptive filenames with dates/timestamps
 * 4. Consider user permissions before allowing exports
 * 5. For very large datasets, consider server-side export generation
 * 6. Test exports with sample data before production use
 * 7. Validate data before passing to export functions
 * 8. Use appropriate export type based on user needs
 * 9. Consider offering both XLSX and CSV formats
 * 10. Show success/failure notifications after export
 *
 * PERFORMANCE TIPS:
 *
 * 1. For exports with >1000 rows, add progress indicators
 * 2. Consider limiting date ranges for historical data
 * 3. Use batch exports during off-peak hours for large datasets
 * 4. Test export performance with production-size datasets
 * 5. Cache workbook generation for repeated exports
 *
 * CUSTOMIZATION:
 *
 * 1. Modify colors in excelExport.js COLORS constant
 * 2. Adjust column widths in export functions
 * 3. Add custom conditional formatting rules
 * 4. Extend export types for custom data models
 * 5. Create organization-specific templates
 */
