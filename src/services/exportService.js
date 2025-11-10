/**
 * Enhanced Export Service - Features #18: CSV/JSON/Google Sheets Export
 *
 * Comprehensive data export functionality
 * Supports multiple formats for compliance and integration
 */

/**
 * Export data to JSON format
 */
export function exportToJSON(data, filename = null) {
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '2.0',
    application: 'SUMRY IEP Management System',
    ...data
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `sumry-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, filename: a.download };
}

/**
 * Export data to CSV format
 */
export function exportToCSV(rows, filename, headers = null) {
  // Add headers if provided
  const allRows = headers ? [headers, ...rows] : rows;

  // Convert to CSV format
  const csv = allRows
    .map(row =>
      row
        .map(cell => {
          // Handle null/undefined
          if (cell === null || cell === undefined) return '';

          // Convert to string and escape quotes
          const str = String(cell).replace(/"/g, '""');

          // Wrap in quotes if contains comma, newline, or quote
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str}"`;
          }

          return str;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, filename };
}

/**
 * Export students with progress data to CSV
 */
export function exportStudentsCSV(students, goals, logs) {
  const headers = [
    'Student ID',
    'Student Name',
    'Grade',
    'Disability',
    'Status',
    'Active Goals',
    'Total Data Points',
    'Last Data Entry',
    'Average Progress %',
    'On Track Goals',
    'At Risk Goals'
  ];

  const rows = students.map(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    const studentLogs = logs.filter(l => l.studentId === student.id);

    const avgProgress = studentLogs.length > 0
      ? Math.round(
          studentLogs.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) /
            studentLogs.length
        )
      : 0;

    const lastEntry = studentLogs.length > 0
      ? new Date(
          Math.max(...studentLogs.map(l => new Date(l.timestamp || l.dateISO)))
        ).toLocaleDateString()
      : 'Never';

    const onTrack = studentGoals.filter(g => {
      const goalLogs = studentLogs.filter(l => l.goalId === g.id);
      const recent = goalLogs.slice(-5);
      const avg = recent.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / (recent.length || 1);
      return avg >= (g.target || 80);
    }).length;

    const atRisk = studentGoals.filter(g => {
      const goalLogs = studentLogs.filter(l => l.goalId === g.id);
      if (goalLogs.length === 0) return true;
      const recent = goalLogs.slice(-5);
      const avg = recent.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / (recent.length || 1);
      return avg < 50;
    }).length;

    return [
      student.id,
      student.name,
      student.grade || '',
      student.disability || '',
      student.status || 'active',
      studentGoals.length,
      studentLogs.length,
      lastEntry,
      avgProgress,
      onTrack,
      atRisk
    ];
  });

  return exportToCSV(rows, `sumry-students-${Date.now()}.csv`, headers);
}

/**
 * Export progress logs to CSV
 */
export function exportProgressLogsCSV(logs, students, goals) {
  const headers = [
    'Log ID',
    'Date',
    'Time',
    'Student Name',
    'Goal Area',
    'Goal Description',
    'Trials',
    'Correct',
    'Accuracy %',
    'Avg Independence %',
    'Session Type',
    'Duration (min)',
    'Para Staff',
    'Notes'
  ];

  const rows = logs.map(log => {
    const student = students.find(s => s.id === log.studentId);
    const goal = goals.find(g => g.id === log.goalId);

    return [
      log.id,
      log.dateISO,
      new Date(log.timestamp || log.dateISO).toLocaleTimeString(),
      student?.name || 'Unknown',
      goal?.area || '',
      goal?.description || '',
      log.stats?.total || log.trials?.length || 0,
      log.stats?.correct || 0,
      log.stats?.accuracy || 0,
      log.stats?.avgIndependence || 0,
      log.sessionType || '',
      Math.round((log.duration || 0) / 60),
      log.paraId || '',
      log.notes || ''
    ];
  });

  return exportToCSV(rows, `sumry-progress-logs-${Date.now()}.csv`, headers);
}

/**
 * Export goals to CSV
 */
export function exportGoalsCSV(goals, students, logs) {
  const headers = [
    'Goal ID',
    'Student Name',
    'Goal Area',
    'Goal Description',
    'Baseline',
    'Target',
    'Current Performance',
    'Progress %',
    'Status',
    'Total Data Points',
    'Last Updated',
    'Days Active',
    'Projected Mastery Date'
  ];

  const rows = goals.map(goal => {
    const student = students.find(s => s.id === goal.studentId);
    const goalLogs = logs.filter(l => l.goalId === goal.id);

    const currentPerformance = goalLogs.length > 0
      ? Math.round(
          goalLogs.slice(-5).reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) /
            Math.min(goalLogs.length, 5)
        )
      : goal.baseline || 0;

    const progress = goal.target
      ? Math.round(((currentPerformance - goal.baseline) / (goal.target - goal.baseline)) * 100)
      : 0;

    const lastUpdated = goalLogs.length > 0
      ? new Date(
          Math.max(...goalLogs.map(l => new Date(l.timestamp || l.dateISO)))
        ).toLocaleDateString()
      : 'Never';

    const daysActive = goal.createdAt
      ? Math.floor((Date.now() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24))
      : 0;

    // Simple projection based on current rate
    let projectedDate = 'Unknown';
    if (goalLogs.length >= 5 && currentPerformance < goal.target) {
      const recentLogs = goalLogs.slice(-10);
      const avgGain = recentLogs.length > 1
        ? (recentLogs[recentLogs.length - 1].stats?.accuracy - recentLogs[0].stats?.accuracy) /
          recentLogs.length
        : 0;

      if (avgGain > 0) {
        const daysToTarget = Math.ceil((goal.target - currentPerformance) / avgGain);
        const targetDate = new Date(Date.now() + daysToTarget * 24 * 60 * 60 * 1000);
        projectedDate = targetDate.toLocaleDateString();
      }
    }

    return [
      goal.id,
      student?.name || 'Unknown',
      goal.area || '',
      goal.description || '',
      goal.baseline || 0,
      goal.target || 100,
      currentPerformance,
      Math.min(progress, 100),
      goal.status || 'active',
      goalLogs.length,
      lastUpdated,
      daysActive,
      projectedDate
    ];
  });

  return exportToCSV(rows, `sumry-goals-${Date.now()}.csv`, headers);
}

/**
 * Export all data (comprehensive export)
 */
export function exportAllData(state) {
  return exportToJSON(
    {
      students: state.students || [],
      goals: state.goals || [],
      logs: state.logs || [],
      users: state.users || [],
      assignments: state.assignments || [],
      reminders: state.reminders || [],
      auditLog: state.auditLog || [],
      compliance: state.compliance || []
    },
    `sumry-complete-backup-${new Date().toISOString().slice(0, 10)}.json`
  );
}

/**
 * Generate Google Sheets import URL
 * Creates a CSV and provides instructions for Google Sheets import
 */
export function exportForGoogleSheets(data, dataType = 'students') {
  let result;

  switch (dataType) {
    case 'students':
      result = exportStudentsCSV(data.students, data.goals, data.logs);
      break;
    case 'logs':
      result = exportProgressLogsCSV(data.logs, data.students, data.goals);
      break;
    case 'goals':
      result = exportGoalsCSV(data.goals, data.students, data.logs);
      break;
    default:
      return { success: false, error: 'Unknown data type' };
  }

  return {
    ...result,
    instructions: [
      '1. Open Google Sheets (sheets.google.com)',
      '2. Click File > Import',
      '3. Click Upload tab',
      `4. Upload the downloaded file: ${result.filename}`,
      '5. Choose "Insert new sheet" or "Replace current sheet"',
      '6. Click "Import data"',
      '',
      'Your SUMRY data will now be in Google Sheets for analysis!'
    ].join('\n')
  };
}

/**
 * Export data for SIS (Student Information System) integration
 * Creates standardized format for importing into SIS systems
 */
export function exportForSIS(students, goals, logs, sisFormat = 'standard') {
  const headers = [
    'StudentID',
    'LastName',
    'FirstName',
    'Grade',
    'DisabilityCategory',
    'ServiceType',
    'GoalArea',
    'GoalStatement',
    'BaselineDate',
    'BaselineScore',
    'TargetScore',
    'CurrentScore',
    'LastProgressDate',
    'ProgressStatus'
  ];

  const rows = [];

  students.forEach(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);

    if (studentGoals.length === 0) {
      // Student with no goals
      rows.push([
        student.id,
        student.name?.split(' ')[1] || '',
        student.name?.split(' ')[0] || '',
        student.grade || '',
        student.disability || '',
        'IEP',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'No Active Goals'
      ]);
    } else {
      studentGoals.forEach(goal => {
        const goalLogs = logs.filter(l => l.goalId === goal.id);
        const lastLog = goalLogs[goalLogs.length - 1];
        const currentScore = lastLog?.stats?.accuracy || goal.baseline || 0;

        let status = 'In Progress';
        if (currentScore >= goal.target) status = 'Mastered';
        else if (goalLogs.length === 0) status = 'Not Started';
        else if (currentScore < 50) status = 'Needs Intervention';

        rows.push([
          student.id,
          student.name?.split(' ')[1] || '',
          student.name?.split(' ')[0] || '',
          student.grade || '',
          student.disability || '',
          'IEP',
          goal.area || '',
          goal.description || '',
          goal.createdAt ? new Date(goal.createdAt).toLocaleDateString() : '',
          goal.baseline || 0,
          goal.target || 100,
          currentScore,
          lastLog?.dateISO || '',
          status
        ]);
      });
    }
  });

  return exportToCSV(
    rows,
    `sumry-sis-import-${Date.now()}.csv`,
    headers
  );
}

/**
 * Export data for state reporting
 */
export function exportForStateReporting(students, goals, logs, state = 'generic') {
  const headers = [
    'District',
    'School',
    'StudentID',
    'StudentName',
    'Grade',
    'DisabilityPrimary',
    'DisabilitySecondary',
    'IEPStatus',
    'ServiceMinutesWeek',
    'GoalCount',
    'GoalsOnTrack',
    'GoalsAtRisk',
    'DataCollectionCompliance',
    'LastIEPDate',
    'NextIEPDate'
  ];

  const rows = students.map(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    const studentLogs = logs.filter(l => l.studentId === student.id);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const recentLogs = studentLogs.filter(l => l.dateISO >= weekAgo);

    const onTrack = studentGoals.filter(g => {
      const goalLogs = studentLogs.filter(l => l.goalId === g.id);
      const recent = goalLogs.slice(-5);
      const avg = recent.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / (recent.length || 1);
      return avg >= (g.target || 80);
    }).length;

    const atRisk = studentGoals.filter(g => {
      const goalLogs = studentLogs.filter(l => l.goalId === g.id);
      const recent = goalLogs.slice(-5);
      const avg = recent.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / (recent.length || 1);
      return avg < 50;
    }).length;

    // Compliance: should have at least 1 data point per week per goal
    const expectedLogs = studentGoals.length;
    const compliance = expectedLogs > 0
      ? Math.round((recentLogs.length / expectedLogs) * 100)
      : 100;

    return [
      student.district || '',
      student.school || '',
      student.id,
      student.name,
      student.grade || '',
      student.disability || '',
      student.disabilitySecondary || '',
      student.iepStatus || 'Active',
      student.serviceMinutes || '',
      studentGoals.length,
      onTrack,
      atRisk,
      `${compliance}%`,
      student.lastIEPDate || '',
      student.nextIEPDate || ''
    ];
  });

  return exportToCSV(
    rows,
    `sumry-state-report-${Date.now()}.csv`,
    headers
  );
}

export default {
  exportToJSON,
  exportToCSV,
  exportStudentsCSV,
  exportProgressLogsCSV,
  exportGoalsCSV,
  exportAllData,
  exportForGoogleSheets,
  exportForSIS,
  exportForStateReporting
};
