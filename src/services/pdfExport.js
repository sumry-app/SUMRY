import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Generate professional IEP Progress Report PDF
 */
export function generateProgressReportPDF(student, goals, progressLogs) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(227, 134, 115); // Coral color
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('IEP Progress Report', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('SUMRY - Individualized Education Program Management', pageWidth / 2, 25, { align: 'center' });

  // Student Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 14, 45);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const studentInfo = [
    ['Student Name:', `${student.first_name} ${student.last_name}`],
    ['Grade Level:', student.grade_level || 'N/A'],
    ['Disability Classification:', student.disability_classification || 'N/A'],
    ['Report Date:', format(new Date(), 'MMMM dd, yyyy')]
  ];

  autoTable(doc, {
    startY: 50,
    head: [],
    body: studentInfo,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' }
    }
  });

  // Goals Summary
  let yPosition = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('IEP Goals Progress Summary', 14, yPosition);

  yPosition += 5;

  goals.forEach((goal, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Goal header
    doc.setFillColor(245, 245, 245);
    doc.rect(14, yPosition, pageWidth - 28, 10, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Goal ${index + 1}: ${goal.area}`, 16, yPosition + 7);

    yPosition += 12;

    // Goal details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const goalDetails = [
      ['Description:', goal.description],
      ['Baseline:', `${goal.baseline_value || 'N/A'} ${goal.metric_unit || ''} - ${goal.baseline_description || ''}`],
      ['Target:', `${goal.target_value} ${goal.metric_unit || ''} - ${goal.target_description || ''}`],
      ['Status:', goal.status.toUpperCase()],
    ];

    if (goal.ai_generated) {
      goalDetails.push(['AI Generated:', 'Yes ✓']);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: goalDetails,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 16 }
    });

    yPosition = doc.lastAutoTable.finalY + 5;

    // Progress data for this goal
    const goalLogs = progressLogs.filter(log => log.goal_id === goal.id);

    if (goalLogs.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Progress Data:', 16, yPosition);
      yPosition += 5;

      const progressData = goalLogs
        .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
        .map(log => [
          format(new Date(log.log_date), 'MM/dd/yyyy'),
          `${log.score} ${goal.metric_unit || ''}`,
          log.notes || '-'
        ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Score', 'Notes']],
        body: progressData,
        theme: 'striped',
        headStyles: {
          fillColor: [101, 163, 155], // Teal color
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { fontSize: 9 },
        margin: { left: 16, right: 16 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 30 },
          2: { cellWidth: 'auto' }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Calculate progress statistics
      const scores = goalLogs.map(log => parseFloat(log.score));
      const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
      const latestScore = scores[scores.length - 1];
      const progressPercentage = goal.baseline_value
        ? (((latestScore - goal.baseline_value) / (goal.target_value - goal.baseline_value)) * 100).toFixed(1)
        : 0;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Average Score: ${avgScore} ${goal.metric_unit || ''}`, 16, yPosition);
      doc.text(`Latest Score: ${latestScore} ${goal.metric_unit || ''}`, 16, yPosition + 5);
      doc.text(`Progress toward target: ${progressPercentage}%`, 16, yPosition + 10);

      yPosition += 20;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('No progress data recorded yet', 16, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 15;
    }
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated by SUMRY on ${format(new Date(), 'MM/dd/yyyy HH:mm')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Generate and download IEP Progress Report
 */
export function downloadProgressReport(student, goals, progressLogs) {
  const doc = generateProgressReportPDF(student, goals, progressLogs);
  const fileName = `IEP_Progress_${student.last_name}_${student.first_name}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
}

/**
 * Generate Summary Report PDF
 */
export function generateSummaryReportPDF(students, allGoals, allProgressLogs) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(227, 134, 115);
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('IEP Summary Report', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(), 'MMMM dd, yyyy'), pageWidth / 2, 23, { align: 'center' });

  // Statistics
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Statistics', 14, 45);

  const activeGoals = allGoals.filter(g => g.status === 'active').length;
  const completedGoals = allGoals.filter(g => g.status === 'completed').length;
  const totalLogs = allProgressLogs.length;

  const stats = [
    ['Total Students:', students.length.toString()],
    ['Active Goals:', activeGoals.toString()],
    ['Completed Goals:', completedGoals.toString()],
    ['Total Progress Logs:', totalLogs.toString()]
  ];

  autoTable(doc, {
    startY: 50,
    head: [],
    body: stats,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' }
    }
  });

  // Student summary table
  let yPosition = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Summary', 14, yPosition);

  const studentData = students.map(student => {
    const studentGoals = allGoals.filter(g => g.student_id === student.id);
    const activeCount = studentGoals.filter(g => g.status === 'active').length;
    const completedCount = studentGoals.filter(g => g.status === 'completed').length;

    return [
      `${student.first_name} ${student.last_name}`,
      student.grade_level || 'N/A',
      activeCount.toString(),
      completedCount.toString()
    ];
  });

  autoTable(doc, {
    startY: yPosition + 5,
    head: [['Student Name', 'Grade', 'Active Goals', 'Completed Goals']],
    body: studentData,
    theme: 'striped',
    headStyles: {
      fillColor: [101, 163, 155],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: { fontSize: 10 }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated by SUMRY on ${format(new Date(), 'MM/dd/yyyy HH:mm')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}

/**
 * Download summary report
 */
export function downloadSummaryReport(students, goals, progressLogs) {
  const doc = generateSummaryReportPDF(students, goals, progressLogs);
  doc.save(`IEP_Summary_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
}
