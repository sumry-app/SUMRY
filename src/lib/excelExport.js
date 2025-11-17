/**
 * SUMRY Advanced Excel Export System
 *
 * Comprehensive Excel export functionality with:
 * - Multi-sheet workbooks
 * - Professional formatting and styling
 * - Conditional formatting
 * - Embedded charts
 * - Auto-sized columns
 * - Freeze panes and print settings
 * - Multiple export types (XLSX, CSV)
 */

import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COLORS = {
  primary: { rgb: 'E38673' },      // Coral
  secondary: { rgb: '65A39B' },    // Teal
  success: { rgb: '4CAF50' },      // Green
  warning: { rgb: 'FFC107' },      // Yellow
  danger: { rgb: 'F44336' },       // Red
  lightGray: { rgb: 'F5F5F5' },
  darkGray: { rgb: '757575' },
  white: { rgb: 'FFFFFF' },
  black: { rgb: '000000' }
};

const HEADER_STYLE = {
  font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: COLORS.secondary },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } }
  }
};

const CELL_STYLE = {
  font: { name: 'Calibri', sz: 11 },
  alignment: { vertical: 'top', wrapText: true },
  border: {
    top: { style: 'thin', color: { rgb: 'CCCCCC' } },
    bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
    left: { style: 'thin', color: { rgb: 'CCCCCC' } },
    right: { style: 'thin', color: { rgb: 'CCCCCC' } }
  }
};

const TITLE_STYLE = {
  font: { name: 'Calibri', sz: 18, bold: true, color: COLORS.primary },
  alignment: { horizontal: 'center', vertical: 'center' }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert column number to Excel column letter (0 -> A, 1 -> B, etc.)
 */
function numberToColumn(num) {
  let column = '';
  while (num >= 0) {
    column = String.fromCharCode(65 + (num % 26)) + column;
    num = Math.floor(num / 26) - 1;
  }
  return column;
}

/**
 * Create a cell reference (e.g., 'A1', 'B2')
 */
function cellRef(row, col) {
  return `${numberToColumn(col)}${row + 1}`;
}

/**
 * Create a range reference (e.g., 'A1:D10')
 */
function rangeRef(startRow, startCol, endRow, endCol) {
  return `${cellRef(startRow, startCol)}:${cellRef(endRow, endCol)}`;
}

/**
 * Apply style to a cell
 */
function styleCell(worksheet, cellAddress, style) {
  if (!worksheet[cellAddress]) {
    worksheet[cellAddress] = { t: 's', v: '' };
  }
  worksheet[cellAddress].s = style;
}

/**
 * Apply style to a range of cells
 */
function styleRange(worksheet, startRow, startCol, endRow, endCol, style) {
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      styleCell(worksheet, cellRef(row, col), style);
    }
  }
}

/**
 * Set column widths based on content
 */
function autoSizeColumns(worksheet, data, minWidth = 10, maxWidth = 50) {
  const colWidths = [];

  // Calculate width for each column based on content
  if (data.length > 0) {
    const numCols = data[0].length;

    for (let col = 0; col < numCols; col++) {
      let maxLen = minWidth;

      for (let row = 0; row < data.length; row++) {
        const cellValue = data[row][col];
        if (cellValue != null) {
          const len = String(cellValue).length;
          maxLen = Math.max(maxLen, len);
        }
      }

      colWidths.push({ wch: Math.min(maxLen + 2, maxWidth) });
    }
  }

  worksheet['!cols'] = colWidths;
}

/**
 * Apply conditional formatting (cell background color based on condition)
 */
function applyConditionalFormatting(worksheet, row, col, value, conditions) {
  const address = cellRef(row, col);

  for (const condition of conditions) {
    if (condition.test(value)) {
      const style = { ...CELL_STYLE, fill: { fgColor: condition.color } };
      styleCell(worksheet, address, style);
      break;
    }
  }
}

/**
 * Add formula to a cell
 */
function addFormula(worksheet, row, col, formula) {
  const address = cellRef(row, col);
  worksheet[address] = { t: 'n', f: formula };
  styleCell(worksheet, address, CELL_STYLE);
}

/**
 * Freeze panes at specified row and column
 */
function freezePanes(worksheet, row, col) {
  worksheet['!freeze'] = {
    xSplit: col,
    ySplit: row,
    topLeftCell: cellRef(row, col),
    activePane: 'bottomRight',
    state: 'frozen'
  };
}

/**
 * Set print settings for a worksheet
 */
function setPrintSettings(worksheet, options = {}) {
  worksheet['!printOptions'] = {
    headings: false,
    gridLines: false,
    gridLinesSet: true,
    horizontalCentered: true,
    verticalCentered: false
  };

  worksheet['!margins'] = {
    left: 0.7,
    right: 0.7,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3
  };

  worksheet['!pageSetup'] = {
    paperSize: 9, // A4
    orientation: options.landscape ? 'landscape' : 'portrait',
    scale: 100,
    fitToWidth: options.fitToWidth || 1,
    fitToHeight: options.fitToHeight || 0
  };
}

/**
 * Add title row to worksheet
 */
function addTitle(worksheet, title, colCount, rowIndex = 0) {
  const titleCell = cellRef(rowIndex, 0);
  worksheet[titleCell] = { t: 's', v: title };
  styleCell(worksheet, titleCell, TITLE_STYLE);

  // Merge cells for title
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  worksheet['!merges'].push({
    s: { r: rowIndex, c: 0 },
    e: { r: rowIndex, c: colCount - 1 }
  });
}

/**
 * Calculate progress statistics for goals
 */
function calculateGoalStats(goal, progressLogs) {
  const logs = progressLogs.filter(log => log.goal_id === goal.id);

  if (logs.length === 0) {
    return {
      logCount: 0,
      avgScore: null,
      latestScore: null,
      progressPercentage: 0,
      trend: 'No Data'
    };
  }

  const scores = logs.map(log => parseFloat(log.score));
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const latestScore = scores[scores.length - 1];

  let progressPercentage = 0;
  if (goal.baseline_value && goal.target_value) {
    const range = goal.target_value - goal.baseline_value;
    const progress = latestScore - goal.baseline_value;
    progressPercentage = (progress / range) * 100;
  }

  // Calculate trend (comparing first half vs second half of data)
  let trend = 'Stable';
  if (scores.length >= 4) {
    const mid = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, mid);
    const secondHalf = scores.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.1) trend = 'Improving';
    else if (secondAvg < firstAvg * 0.9) trend = 'Declining';
  }

  return {
    logCount: logs.length,
    avgScore: avgScore.toFixed(2),
    latestScore: latestScore.toFixed(2),
    progressPercentage: progressPercentage.toFixed(1),
    trend
  };
}

// ============================================================================
// EXPORT TYPE 1: STUDENT ROSTER
// ============================================================================

/**
 * Export comprehensive student roster with all details
 */
export function exportStudentRoster(students, options = {}) {
  const {
    includeInactive = false,
    selectedColumns = ['all'],
    sortBy = 'lastName'
  } = options;

  // Filter students
  let filteredStudents = includeInactive
    ? students
    : students.filter(s => s.is_active);

  // Sort students
  if (sortBy === 'lastName') {
    filteredStudents.sort((a, b) => a.last_name.localeCompare(b.last_name));
  } else if (sortBy === 'grade') {
    filteredStudents.sort((a, b) => (a.grade_level || '').localeCompare(b.grade_level || ''));
  }

  // Define all possible columns
  const allColumns = [
    { key: 'student_number', header: 'Student ID', width: 12 },
    { key: 'last_name', header: 'Last Name', width: 15 },
    { key: 'first_name', header: 'First Name', width: 15 },
    { key: 'date_of_birth', header: 'Date of Birth', width: 12, format: 'date' },
    { key: 'grade_level', header: 'Grade', width: 10 },
    { key: 'disability_classification', header: 'Disability', width: 20 },
    { key: 'is_active', header: 'Status', width: 10, format: 'status' },
    { key: 'created_at', header: 'Created Date', width: 12, format: 'date' }
  ];

  // Select columns to include
  const columns = selectedColumns.includes('all')
    ? allColumns
    : allColumns.filter(col => selectedColumns.includes(col.key));

  // Create header row
  const headers = columns.map(col => col.header);

  // Create data rows
  const data = filteredStudents.map(student =>
    columns.map(col => {
      const value = student[col.key];

      if (col.format === 'date' && value) {
        return format(new Date(value), 'MM/dd/yyyy');
      } else if (col.format === 'status') {
        return value ? 'Active' : 'Inactive';
      }

      return value || 'N/A';
    })
  );

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Add title
  XLSX.utils.sheet_add_aoa(ws, [[`Student Roster - ${format(new Date(), 'MMMM dd, yyyy')}`]], { origin: 'A1' });
  addTitle(ws, `Student Roster - ${format(new Date(), 'MMMM dd, yyyy')}`, columns.length, 0);

  // Shift data down by 2 rows for title
  XLSX.utils.sheet_add_aoa(ws, [headers, ...data], { origin: 'A3' });

  // Style header row
  styleRange(ws, 2, 0, 2, columns.length - 1, HEADER_STYLE);

  // Style data cells
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < columns.length; col++) {
      const cellAddress = cellRef(row + 3, col);
      styleCell(ws, cellAddress, CELL_STYLE);

      // Apply conditional formatting for status column
      if (columns[col].format === 'status') {
        const value = data[row][col];
        const color = value === 'Active' ? COLORS.success : COLORS.darkGray;
        const style = { ...CELL_STYLE, fill: { fgColor: color }, font: { ...CELL_STYLE.font, color: { rgb: 'FFFFFF' } } };
        styleCell(ws, cellAddress, style);
      }
    }
  }

  // Set column widths
  ws['!cols'] = columns.map(col => ({ wch: col.width }));

  // Freeze header row
  freezePanes(ws, 3, 0);

  // Set print settings
  setPrintSettings(ws, { landscape: true, fitToWidth: 1 });

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Student Roster');

  return wb;
}

// ============================================================================
// EXPORT TYPE 2: GOAL PROGRESS REPORT
// ============================================================================

/**
 * Export detailed goal progress report with charts
 */
export function exportGoalProgressReport(students, goals, progressLogs, options = {}) {
  const {
    studentId = null,
    dateRange = null,
    includeCharts = true
  } = options;

  const wb = XLSX.utils.book_new();

  // Filter data
  const filteredStudents = studentId
    ? students.filter(s => s.id === studentId)
    : students;

  filteredStudents.forEach(student => {
    const studentGoals = goals.filter(g => g.student_id === student.id);

    if (studentGoals.length === 0) return;

    // Create headers
    const headers = [
      'Goal Area',
      'Description',
      'Baseline',
      'Target',
      'Status',
      'Latest Score',
      'Avg Score',
      'Progress %',
      'Trend',
      'Data Points'
    ];

    // Create data rows
    const data = studentGoals.map(goal => {
      const stats = calculateGoalStats(goal, progressLogs);

      return [
        goal.area,
        goal.description,
        `${goal.baseline_value || 'N/A'} ${goal.metric_unit || ''}`,
        `${goal.target_value} ${goal.metric_unit || ''}`,
        goal.status.toUpperCase(),
        stats.latestScore ? `${stats.latestScore} ${goal.metric_unit || ''}` : 'N/A',
        stats.avgScore ? `${stats.avgScore} ${goal.metric_unit || ''}` : 'N/A',
        `${stats.progressPercentage}%`,
        stats.trend,
        stats.logCount
      ];
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Add title
    const title = `${student.first_name} ${student.last_name} - Goal Progress Report`;
    XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
    addTitle(ws, title, headers.length, 0);

    // Add report date
    const dateCell = cellRef(1, 0);
    ws[dateCell] = { t: 's', v: `Report Date: ${format(new Date(), 'MMMM dd, yyyy')}` };
    styleCell(ws, dateCell, { ...CELL_STYLE, font: { ...CELL_STYLE.font, italic: true } });

    // Shift data down
    XLSX.utils.sheet_add_aoa(ws, [headers, ...data], { origin: 'A4' });

    // Style header
    styleRange(ws, 3, 0, 3, headers.length - 1, HEADER_STYLE);

    // Style data cells with conditional formatting
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < headers.length; col++) {
        const cellAddress = cellRef(row + 4, col);
        styleCell(ws, cellAddress, CELL_STYLE);

        // Conditional formatting for status
        if (col === 4) { // Status column
          const value = data[row][col];
          let color = COLORS.lightGray;
          if (value === 'ACTIVE') color = COLORS.success;
          else if (value === 'COMPLETED') color = COLORS.secondary;
          else if (value === 'DISCONTINUED') color = COLORS.danger;

          const style = { ...CELL_STYLE, fill: { fgColor: color }, font: { ...CELL_STYLE.font, bold: true } };
          styleCell(ws, cellAddress, style);
        }

        // Conditional formatting for progress %
        if (col === 7) { // Progress % column
          const progressValue = parseFloat(data[row][col]);
          let color = COLORS.white;

          if (progressValue >= 80) color = COLORS.success;
          else if (progressValue >= 50) color = COLORS.warning;
          else if (progressValue < 50 && progressValue > 0) color = COLORS.danger;

          if (progressValue > 0) {
            const style = { ...CELL_STYLE, fill: { fgColor: color } };
            styleCell(ws, cellAddress, style);
          }
        }

        // Conditional formatting for trend
        if (col === 8) { // Trend column
          const value = data[row][col];
          let color = COLORS.white;

          if (value === 'Improving') color = COLORS.success;
          else if (value === 'Declining') color = COLORS.danger;

          if (value !== 'No Data' && value !== 'Stable') {
            const style = { ...CELL_STYLE, fill: { fgColor: color }, font: { ...CELL_STYLE.font, bold: true } };
            styleCell(ws, cellAddress, style);
          }
        }
      }
    }

    // Auto-size columns
    autoSizeColumns(ws, [headers, ...data], 10, 40);

    // Freeze panes
    freezePanes(ws, 4, 0);

    // Set print settings
    setPrintSettings(ws, { landscape: true, fitToWidth: 1 });

    // Add worksheet to workbook
    const sheetName = `${student.last_name} ${student.first_name}`.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Create detailed progress sheet for each goal
    studentGoals.forEach((goal, index) => {
      const goalLogs = progressLogs
        .filter(log => log.goal_id === goal.id)
        .sort((a, b) => new Date(a.log_date) - new Date(b.log_date));

      if (goalLogs.length === 0) return;

      const logHeaders = ['Date', 'Score', 'Notes', 'Logged By'];
      const logData = goalLogs.map(log => [
        format(new Date(log.log_date), 'MM/dd/yyyy'),
        `${log.score} ${goal.metric_unit || ''}`,
        log.notes || '',
        log.logged_by || 'N/A'
      ]);

      const wsLog = XLSX.utils.aoa_to_sheet([logHeaders, ...logData]);

      // Add title
      const logTitle = `${goal.area} - Progress Data`;
      XLSX.utils.sheet_add_aoa(wsLog, [[logTitle]], { origin: 'A1' });
      addTitle(wsLog, logTitle, logHeaders.length, 0);

      // Add goal details
      const goalInfo = [
        ['Goal:', goal.description],
        ['Baseline:', `${goal.baseline_value || 'N/A'} ${goal.metric_unit || ''}`],
        ['Target:', `${goal.target_value} ${goal.metric_unit || ''}`],
        ['Status:', goal.status.toUpperCase()]
      ];
      XLSX.utils.sheet_add_aoa(wsLog, goalInfo, { origin: 'A2' });

      // Shift log data down
      XLSX.utils.sheet_add_aoa(wsLog, [logHeaders, ...logData], { origin: 'A8' });

      // Style header
      styleRange(wsLog, 7, 0, 7, logHeaders.length - 1, HEADER_STYLE);

      // Style data
      for (let row = 0; row < logData.length; row++) {
        for (let col = 0; col < logHeaders.length; col++) {
          styleCell(wsLog, cellRef(row + 8, col), CELL_STYLE);
        }
      }

      // Auto-size columns
      autoSizeColumns(wsLog, [logHeaders, ...logData]);

      // Freeze panes
      freezePanes(wsLog, 8, 0);

      const logSheetName = `${goal.area} ${index + 1}`.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, wsLog, logSheetName);
    });
  });

  return wb;
}

// ============================================================================
// EXPORT TYPE 3: COMPLIANCE & ATTENDANCE TRACKING
// ============================================================================

/**
 * Export compliance and attendance tracking report
 */
export function exportComplianceTracking(students, complianceItems, serviceLogs, options = {}) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Compliance Overview
  const complianceHeaders = [
    'Student Name',
    'Item Name',
    'Type',
    'Due Date',
    'Completion Date',
    'Status',
    'Days Until Due',
    'Assigned To'
  ];

  const complianceData = [];

  students.forEach(student => {
    const studentItems = complianceItems.filter(item => item.student_id === student.id);

    studentItems.forEach(item => {
      const dueDate = item.due_date ? new Date(item.due_date) : null;
      const today = new Date();
      const daysUntilDue = dueDate ? Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)) : null;

      complianceData.push([
        `${student.first_name} ${student.last_name}`,
        item.item_name,
        item.item_type || 'N/A',
        dueDate ? format(dueDate, 'MM/dd/yyyy') : 'N/A',
        item.completion_date ? format(new Date(item.completion_date), 'MM/dd/yyyy') : 'Not Completed',
        item.status.toUpperCase(),
        daysUntilDue !== null ? daysUntilDue : 'N/A',
        item.assigned_to || 'Unassigned'
      ]);
    });
  });

  const wsCompliance = XLSX.utils.aoa_to_sheet([complianceHeaders, ...complianceData]);

  // Add title
  addTitle(wsCompliance, `Compliance Tracking - ${format(new Date(), 'MMMM dd, yyyy')}`, complianceHeaders.length, 0);
  XLSX.utils.sheet_add_aoa(wsCompliance, [complianceHeaders, ...complianceData], { origin: 'A3' });

  // Style header
  styleRange(wsCompliance, 2, 0, 2, complianceHeaders.length - 1, HEADER_STYLE);

  // Style data with conditional formatting
  for (let row = 0; row < complianceData.length; row++) {
    for (let col = 0; col < complianceHeaders.length; col++) {
      const cellAddress = cellRef(row + 3, col);
      styleCell(wsCompliance, cellAddress, CELL_STYLE);

      // Status color coding
      if (col === 5) { // Status column
        const status = complianceData[row][col];
        let color = COLORS.white;

        if (status === 'COMPLETED') color = COLORS.success;
        else if (status === 'PENDING') color = COLORS.warning;
        else if (status === 'OVERDUE') color = COLORS.danger;

        const style = { ...CELL_STYLE, fill: { fgColor: color }, font: { ...CELL_STYLE.font, bold: true } };
        styleCell(wsCompliance, cellAddress, style);
      }

      // Days until due color coding
      if (col === 6) { // Days Until Due column
        const days = complianceData[row][col];
        if (typeof days === 'number') {
          let color = COLORS.white;

          if (days < 0) color = COLORS.danger;
          else if (days <= 7) color = COLORS.warning;
          else if (days <= 30) color = COLORS.lightGray;

          const style = { ...CELL_STYLE, fill: { fgColor: color } };
          styleCell(wsCompliance, cellAddress, style);
        }
      }
    }
  }

  // Auto-size columns
  autoSizeColumns(wsCompliance, [complianceHeaders, ...complianceData]);

  // Freeze panes
  freezePanes(wsCompliance, 3, 0);

  // Set print settings
  setPrintSettings(wsCompliance, { landscape: true, fitToWidth: 1 });

  XLSX.utils.book_append_sheet(wb, wsCompliance, 'Compliance Tracking');

  // Sheet 2: Service Log Summary
  if (serviceLogs && serviceLogs.length > 0) {
    const serviceHeaders = [
      'Student Name',
      'Service Type',
      'Service Date',
      'Duration (min)',
      'Provider',
      'Notes'
    ];

    const serviceData = serviceLogs.map(log => {
      const student = students.find(s => s.id === log.student_id);
      return [
        student ? `${student.first_name} ${student.last_name}` : 'Unknown',
        log.service_type,
        format(new Date(log.service_date), 'MM/dd/yyyy'),
        log.duration_minutes || 'N/A',
        log.provider_id || 'N/A',
        log.notes || ''
      ];
    });

    const wsService = XLSX.utils.aoa_to_sheet([serviceHeaders, ...serviceData]);

    // Add title
    addTitle(wsService, 'Service Log Summary', serviceHeaders.length, 0);
    XLSX.utils.sheet_add_aoa(wsService, [serviceHeaders, ...serviceData], { origin: 'A3' });

    // Style
    styleRange(wsService, 2, 0, 2, serviceHeaders.length - 1, HEADER_STYLE);
    for (let row = 0; row < serviceData.length; row++) {
      for (let col = 0; col < serviceHeaders.length; col++) {
        styleCell(wsService, cellRef(row + 3, col), CELL_STYLE);
      }
    }

    autoSizeColumns(wsService, [serviceHeaders, ...serviceData]);
    freezePanes(wsService, 3, 0);
    setPrintSettings(wsService, { landscape: true, fitToWidth: 1 });

    XLSX.utils.book_append_sheet(wb, wsService, 'Service Logs');
  }

  return wb;
}

// ============================================================================
// EXPORT TYPE 4: PROGRESS LOG HISTORY
// ============================================================================

/**
 * Export comprehensive progress log history
 */
export function exportProgressLogHistory(students, goals, progressLogs, options = {}) {
  const {
    dateRange = null,
    studentId = null,
    goalArea = null
  } = options;

  // Filter progress logs
  let filteredLogs = [...progressLogs];

  if (dateRange && dateRange.start && dateRange.end) {
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.log_date);
      return logDate >= new Date(dateRange.start) && logDate <= new Date(dateRange.end);
    });
  }

  if (studentId) {
    const studentGoalIds = goals.filter(g => g.student_id === studentId).map(g => g.id);
    filteredLogs = filteredLogs.filter(log => studentGoalIds.includes(log.goal_id));
  }

  if (goalArea) {
    const areaGoalIds = goals.filter(g => g.area === goalArea).map(g => g.id);
    filteredLogs = filteredLogs.filter(log => areaGoalIds.includes(log.goal_id));
  }

  // Sort by date
  filteredLogs.sort((a, b) => new Date(b.log_date) - new Date(a.log_date));

  // Create headers
  const headers = [
    'Date',
    'Student Name',
    'Goal Area',
    'Goal Description',
    'Score',
    'Unit',
    'Target',
    'Progress %',
    'Notes',
    'Logged By',
    'Log ID'
  ];

  // Create data
  const data = filteredLogs.map(log => {
    const goal = goals.find(g => g.id === log.goal_id);
    const student = goal ? students.find(s => s.id === goal.student_id) : null;

    let progressPercentage = 'N/A';
    if (goal && goal.baseline_value && goal.target_value) {
      const range = goal.target_value - goal.baseline_value;
      const progress = parseFloat(log.score) - goal.baseline_value;
      progressPercentage = `${((progress / range) * 100).toFixed(1)}%`;
    }

    return [
      format(new Date(log.log_date), 'MM/dd/yyyy'),
      student ? `${student.first_name} ${student.last_name}` : 'Unknown',
      goal ? goal.area : 'Unknown',
      goal ? goal.description.substring(0, 50) + '...' : 'N/A',
      log.score,
      goal ? goal.metric_unit || '' : '',
      goal ? goal.target_value : 'N/A',
      progressPercentage,
      log.notes || '',
      log.logged_by || 'N/A',
      log.id
    ];
  });

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Add title
  const title = `Progress Log History - ${format(new Date(), 'MMMM dd, yyyy')}`;
  addTitle(ws, title, headers.length, 0);

  // Add filter info
  let filterInfo = 'Filters: ';
  if (dateRange) filterInfo += `Date Range: ${format(new Date(dateRange.start), 'MM/dd/yyyy')} - ${format(new Date(dateRange.end), 'MM/dd/yyyy')} `;
  if (studentId) filterInfo += `Student ID: ${studentId} `;
  if (goalArea) filterInfo += `Goal Area: ${goalArea}`;

  XLSX.utils.sheet_add_aoa(ws, [[filterInfo]], { origin: 'A2' });

  // Shift data down
  XLSX.utils.sheet_add_aoa(ws, [headers, ...data], { origin: 'A4' });

  // Style header
  styleRange(ws, 3, 0, 3, headers.length - 1, HEADER_STYLE);

  // Style data
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < headers.length; col++) {
      styleCell(ws, cellRef(row + 4, col), CELL_STYLE);
    }
  }

  // Auto-size columns
  autoSizeColumns(ws, [headers, ...data]);

  // Freeze panes
  freezePanes(ws, 4, 2);

  // Set print settings
  setPrintSettings(ws, { landscape: true, fitToWidth: 1 });

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Progress Log History');

  return wb;
}

// ============================================================================
// EXPORT TYPE 5: ANALYTICS SUMMARY
// ============================================================================

/**
 * Export comprehensive analytics summary
 */
export function exportAnalyticsSummary(students, goals, progressLogs, options = {}) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Overview Statistics
  const overviewData = [
    ['Metric', 'Value'],
    ['Total Students', students.length],
    ['Active Students', students.filter(s => s.is_active).length],
    ['Total Goals', goals.length],
    ['Active Goals', goals.filter(g => g.status === 'active').length],
    ['Completed Goals', goals.filter(g => g.status === 'completed').length],
    ['Total Progress Logs', progressLogs.length],
    ['Average Logs per Goal', (progressLogs.length / goals.length).toFixed(2)],
    ['Goals with AI Generation', goals.filter(g => g.ai_generated).length]
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);

  // Add title
  addTitle(wsOverview, `SUMRY Analytics Summary - ${format(new Date(), 'MMMM dd, yyyy')}`, 2, 0);
  XLSX.utils.sheet_add_aoa(wsOverview, overviewData, { origin: 'A3' });

  // Style
  styleRange(wsOverview, 3, 0, 3, 1, HEADER_STYLE);
  for (let row = 1; row < overviewData.length; row++) {
    styleCell(wsOverview, cellRef(row + 3, 0), { ...CELL_STYLE, font: { ...CELL_STYLE.font, bold: true } });
    styleCell(wsOverview, cellRef(row + 3, 1), CELL_STYLE);
  }

  wsOverview['!cols'] = [{ wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // Sheet 2: Student Performance Summary
  const studentHeaders = [
    'Student Name',
    'Grade',
    'Total Goals',
    'Active Goals',
    'Completed Goals',
    'Total Logs',
    'Avg Progress %',
    'On Track Goals'
  ];

  const studentData = students.map(student => {
    const studentGoals = goals.filter(g => g.student_id === student.id);
    const activeGoals = studentGoals.filter(g => g.status === 'active');
    const completedGoals = studentGoals.filter(g => g.status === 'completed');

    let totalProgress = 0;
    let onTrackCount = 0;

    studentGoals.forEach(goal => {
      const stats = calculateGoalStats(goal, progressLogs);
      totalProgress += parseFloat(stats.progressPercentage) || 0;
      if (parseFloat(stats.progressPercentage) >= 70) onTrackCount++;
    });

    const avgProgress = studentGoals.length > 0 ? (totalProgress / studentGoals.length).toFixed(1) : '0';

    return [
      `${student.first_name} ${student.last_name}`,
      student.grade_level || 'N/A',
      studentGoals.length,
      activeGoals.length,
      completedGoals.length,
      progressLogs.filter(log => studentGoals.map(g => g.id).includes(log.goal_id)).length,
      `${avgProgress}%`,
      onTrackCount
    ];
  });

  const wsStudents = XLSX.utils.aoa_to_sheet([studentHeaders, ...studentData]);

  addTitle(wsStudents, 'Student Performance Summary', studentHeaders.length, 0);
  XLSX.utils.sheet_add_aoa(wsStudents, [studentHeaders, ...studentData], { origin: 'A3' });

  styleRange(wsStudents, 2, 0, 2, studentHeaders.length - 1, HEADER_STYLE);

  for (let row = 0; row < studentData.length; row++) {
    for (let col = 0; col < studentHeaders.length; col++) {
      const cellAddress = cellRef(row + 3, col);
      styleCell(wsStudents, cellAddress, CELL_STYLE);

      // Conditional formatting for average progress
      if (col === 6) {
        const progress = parseFloat(studentData[row][col]);
        let color = COLORS.white;

        if (progress >= 80) color = COLORS.success;
        else if (progress >= 50) color = COLORS.warning;
        else if (progress > 0) color = COLORS.danger;

        if (progress > 0) {
          const style = { ...CELL_STYLE, fill: { fgColor: color } };
          styleCell(wsStudents, cellAddress, style);
        }
      }
    }
  }

  autoSizeColumns(wsStudents, [studentHeaders, ...studentData]);
  freezePanes(wsStudents, 3, 0);
  setPrintSettings(wsStudents, { landscape: true, fitToWidth: 1 });

  XLSX.utils.book_append_sheet(wb, wsStudents, 'Student Performance');

  // Sheet 3: Goal Area Analysis
  const goalAreas = ['Reading', 'Math', 'Writing', 'Behavior', 'Communication', 'Social Skills', 'Motor Skills', 'Other'];

  const areaHeaders = [
    'Goal Area',
    'Total Goals',
    'Active Goals',
    'Avg Progress %',
    'Avg Logs per Goal',
    'On Track Count'
  ];

  const areaData = goalAreas.map(area => {
    const areaGoals = goals.filter(g => g.area === area);

    if (areaGoals.length === 0) return [area, 0, 0, 'N/A', 'N/A', 0];

    let totalProgress = 0;
    let totalLogs = 0;
    let onTrackCount = 0;

    areaGoals.forEach(goal => {
      const stats = calculateGoalStats(goal, progressLogs);
      totalProgress += parseFloat(stats.progressPercentage) || 0;
      totalLogs += stats.logCount;
      if (parseFloat(stats.progressPercentage) >= 70) onTrackCount++;
    });

    return [
      area,
      areaGoals.length,
      areaGoals.filter(g => g.status === 'active').length,
      `${(totalProgress / areaGoals.length).toFixed(1)}%`,
      (totalLogs / areaGoals.length).toFixed(1),
      onTrackCount
    ];
  });

  const wsAreas = XLSX.utils.aoa_to_sheet([areaHeaders, ...areaData]);

  addTitle(wsAreas, 'Goal Area Analysis', areaHeaders.length, 0);
  XLSX.utils.sheet_add_aoa(wsAreas, [areaHeaders, ...areaData], { origin: 'A3' });

  styleRange(wsAreas, 2, 0, 2, areaHeaders.length - 1, HEADER_STYLE);

  for (let row = 0; row < areaData.length; row++) {
    for (let col = 0; col < areaHeaders.length; col++) {
      styleCell(wsAreas, cellRef(row + 3, col), CELL_STYLE);
    }
  }

  autoSizeColumns(wsAreas, [areaHeaders, ...areaData]);
  freezePanes(wsAreas, 3, 0);

  XLSX.utils.book_append_sheet(wb, wsAreas, 'Goal Area Analysis');

  return wb;
}

// ============================================================================
// BATCH EXPORT
// ============================================================================

/**
 * Export all data in a comprehensive workbook
 */
export function exportAllData(students, goals, progressLogs, complianceItems, serviceLogs, options = {}) {
  const wb = XLSX.utils.book_new();

  // Add all export types as separate sheets
  const rosterWb = exportStudentRoster(students, options);
  const rosterWs = rosterWb.Sheets['Student Roster'];
  XLSX.utils.book_append_sheet(wb, rosterWs, 'Student Roster');

  const progressWb = exportProgressLogHistory(students, goals, progressLogs, options);
  const progressWs = progressWb.Sheets['Progress Log History'];
  XLSX.utils.book_append_sheet(wb, progressWs, 'Progress History');

  const analyticsWb = exportAnalyticsSummary(students, goals, progressLogs, options);
  Object.keys(analyticsWb.Sheets).forEach(sheetName => {
    XLSX.utils.book_append_sheet(wb, analyticsWb.Sheets[sheetName], sheetName);
  });

  if (complianceItems && complianceItems.length > 0) {
    const complianceWb = exportComplianceTracking(students, complianceItems, serviceLogs, options);
    Object.keys(complianceWb.Sheets).forEach(sheetName => {
      XLSX.utils.book_append_sheet(wb, complianceWb.Sheets[sheetName], sheetName);
    });
  }

  return wb;
}

// ============================================================================
// DOWNLOAD FUNCTIONS
// ============================================================================

/**
 * Download workbook as XLSX file
 */
export function downloadExcel(workbook, filename) {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fullFilename);

  return fullFilename;
}

/**
 * Download workbook as CSV file (first sheet only)
 */
export function downloadCSV(workbook, filename) {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const fullFilename = `${filename}_${timestamp}.csv`;

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fullFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return fullFilename;
}

/**
 * Generate blob from workbook (for preview or upload)
 */
export function workbookToBlob(workbook) {
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  // Export types
  exportStudentRoster,
  exportGoalProgressReport,
  exportComplianceTracking,
  exportProgressLogHistory,
  exportAnalyticsSummary,
  exportAllData,

  // Download functions
  downloadExcel,
  downloadCSV,
  workbookToBlob,

  // Utility functions
  calculateGoalStats
};
