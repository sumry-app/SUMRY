/**
 * PDF Report Generation for IEP Management
 * Generates comprehensive progress reports, goal summaries, and compliance documents
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatTimestamp } from './data.js';

/**
 * Generate comprehensive student progress report
 */
export async function generateStudentProgressReport(store, student) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('SUMRY - IEP Progress Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Generated: ' + new Date().toLocaleDateString(), pageWidth / 2, yPos, { align: 'center' });

  // Student Information
  yPos += 15;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Student Information', 14, yPos);
  
  yPos += 2;
  doc.setLineWidth(0.5);
  doc.setDrawColor(59, 130, 246);
  doc.line(14, yPos, pageWidth - 14, yPos);

  yPos += 10;
  doc.setFontSize(12);
  doc.text('Name: ' + student.name, 14, yPos);
  yPos += 7;
  doc.text('Grade: ' + (student.grade || 'Not specified'), 14, yPos);
  yPos += 7;
  doc.text('Disability: ' + (student.disability || 'Not specified'), 14, yPos);

  // Goals Summary
  const studentGoals = (store.goals || []).filter(g => g.studentId === student.id);
  const activeGoals = studentGoals.filter(g => g.status !== 'completed');

  yPos += 15;
  doc.setFontSize(16);
  doc.text('Goals Overview', 14, yPos);
  
  yPos += 2;
  doc.line(14, yPos, pageWidth - 14, yPos);

  yPos += 10;
  doc.setFontSize(12);
  doc.text('Total Goals: ' + studentGoals.length, 14, yPos);
  yPos += 7;
  doc.text('Active Goals: ' + activeGoals.length, 14, yPos);

  // Goals Table
  if (studentGoals.length > 0) {
    yPos += 10;
    
    const goalsData = studentGoals.map(goal => {
      const logs = (store.logs || []).filter(l => l.goalId === goal.id);
      const latestScore = logs.length > 0 ? logs[logs.length - 1].score : 'No data';
      
      return [
        goal.area,
        goal.description.substring(0, 50) + (goal.description.length > 50 ? '...' : ''),
        goal.baseline || 'N/A',
        goal.target || 'N/A',
        latestScore,
        logs.length + ' entries'
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: [['Area', 'Description', 'Baseline', 'Target', 'Latest', 'Progress Logs']],
      body: goalsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        1: { cellWidth: 60 }
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Detailed Goal Analysis (new page for each goal)
  for (const goal of studentGoals) {
    const logs = (store.logs || []).filter(l => l.goalId === goal.id);
    
    if (logs.length === 0) continue;

    doc.addPage();
    yPos = 20;

    // Goal Header
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Goal: ' + goal.area, 14, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const splitDescription = doc.splitTextToSize(goal.description, pageWidth - 28);
    doc.text(splitDescription, 14, yPos);
    yPos += splitDescription.length * 7 + 10;

    // Goal Details
    doc.setFontSize(10);
    doc.text('Baseline: ' + (goal.baseline || 'Not set'), 14, yPos);
    yPos += 6;
    doc.text('Target: ' + (goal.target || 'Not set'), 14, yPos);
    yPos += 6;
    doc.text('Metric: ' + (goal.metric || 'Not specified'), 14, yPos);
    
    yPos += 12;

    // Progress Logs Table
    const logsData = logs
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
      .map(log => [
        log.dateISO,
        log.score,
        log.accommodationsUsed ? log.accommodationsUsed.join(', ') : 'None',
        log.notes ? log.notes.substring(0, 40) + (log.notes.length > 40 ? '...' : '') : ''
      ]);

    doc.autoTable({
      startY: yPos,
      head: [['Date', 'Score', 'Accommodations', 'Notes']],
      body: logsData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
      columnStyles: {
        3: { cellWidth: 60 }
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Progress Analysis
    if (logs.length >= 3) {
      const scores = logs.map(l => parseFloat(l.score)).filter(s => !isNaN(s));
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const trend = scores[scores.length - 1] > scores[0] ? 'Improving' : 
                   scores[scores.length - 1] < scores[0] ? 'Declining' : 'Stable';

      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFillColor(240, 249, 255);
      doc.rect(14, yPos, pageWidth - 28, 30, 'F');
      
      yPos += 8;
      doc.setFontSize(11);
      doc.setTextColor(30, 64, 175);
      doc.text('Progress Analysis', 18, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Average Score: ' + avg.toFixed(2), 18, yPos);
      yPos += 6;
      doc.text('Trend: ' + trend, 18, yPos);
      yPos += 6;
      doc.text('Total Data Points: ' + logs.length, 18, yPos);
    }
  }

  // Footer on last page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Page ' + i + ' of ' + totalPages,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'SUMRY IEP Management System - Confidential',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = 'IEP-Progress-' + student.name.replace(/\s+/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.pdf';
  doc.save(fileName);
}

/**
 * Generate goal summary report for a specific goal
 */
export async function generateGoalReport(store, goal) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const student = (store.students || []).find(s => s.id === goal.studentId);
  const logs = (store.logs || []).filter(l => l.goalId === goal.id)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('IEP Goal Progress Report', pageWidth / 2, yPos, { align: 'center' });

  yPos += 20;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Student: ' + (student ? student.name : 'Unknown'), 14, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  doc.text('Goal Area: ' + goal.area, 14, yPos);

  yPos += 10;
  const splitDesc = doc.splitTextToSize(goal.description, pageWidth - 28);
  doc.text(splitDesc, 14, yPos);
  yPos += splitDesc.length * 7 + 15;

  // Statistics
  doc.setFontSize(14);
  doc.text('Performance Metrics', 14, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.text('Baseline: ' + (goal.baseline || 'Not set'), 14, yPos);
  yPos += 7;
  doc.text('Target: ' + (goal.target || 'Not set'), 14, yPos);
  yPos += 7;
  doc.text('Total Progress Entries: ' + logs.length, 14, yPos);

  if (logs.length > 0) {
    yPos += 7;
    doc.text('Latest Score: ' + logs[logs.length - 1].score, 14, yPos);
    yPos += 7;
    doc.text('Latest Date: ' + logs[logs.length - 1].dateISO, 14, yPos);
  }

  yPos += 15;

  // Progress table
  if (logs.length > 0) {
    const logsData = logs.map(log => [
      log.dateISO,
      log.score,
      log.accommodationsUsed ? log.accommodationsUsed.join(', ') : 'None',
      log.notes || ''
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Date', 'Score', 'Accommodations', 'Notes']],
      body: logsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });
  }

  const fileName = 'Goal-Report-' + goal.area.replace(/\s+/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.pdf';
  doc.save(fileName);
}

/**
 * Generate compliance summary report
 */
export async function generateComplianceReport(store) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('IEP Compliance Report', pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Generated: ' + new Date().toLocaleDateString(), pageWidth / 2, yPos, { align: 'center' });

  yPos += 20;

  // Overall Statistics
  const students = store.students || [];
  const goals = store.goals || [];
  const logs = store.logs || [];

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Overall Statistics', 14, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.text('Total Students: ' + students.length, 14, yPos);
  yPos += 7;
  doc.text('Total Goals: ' + goals.length, 14, yPos);
  yPos += 7;
  doc.text('Total Progress Logs: ' + logs.length, 14, yPos);
  yPos += 7;
  doc.text('Active Goals: ' + goals.filter(g => g.status !== 'completed').length, 14, yPos);

  yPos += 20;

  // Student Summary Table
  const studentData = students.map(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    const activeGoals = studentGoals.filter(g => g.status !== 'completed');
    const studentLogs = logs.filter(l => {
      const goal = goals.find(g => g.id === l.goalId);
      return goal && goal.studentId === student.id;
    });

    return [
      student.name,
      student.grade || 'N/A',
      studentGoals.length,
      activeGoals.length,
      studentLogs.length
    ];
  });

  doc.autoTable({
    startY: yPos,
    head: [['Student Name', 'Grade', 'Total Goals', 'Active Goals', 'Progress Logs']],
    body: studentData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  const fileName = 'Compliance-Report-' + new Date().toISOString().slice(0, 10) + '.pdf';
  doc.save(fileName);
}

/**
 * Generate data trends report with charts
 */
export async function generateTrendsReport(store, studentId = null) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text('Progress Trends Analysis', pageWidth / 2, yPos, { align: 'center' });

  yPos += 20;

  const goals = studentId 
    ? (store.goals || []).filter(g => g.studentId === studentId)
    : (store.goals || []);

  for (const goal of goals) {
    const logs = (store.logs || []).filter(l => l.goalId === goal.id);
    
    if (logs.length < 2) continue;

    const student = (store.students || []).find(s => s.id === goal.studentId);

    doc.setFontSize(14);
    doc.text((student ? student.name + ' - ' : '') + goal.area, 14, yPos);
    yPos += 8;

    // Calculate trend
    const sortedLogs = [...logs].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const scores = sortedLogs.map(l => parseFloat(l.score)).filter(s => !isNaN(s));
    
    if (scores.length >= 2) {
      const firstScore = scores[0];
      const lastScore = scores[scores.length - 1];
      const change = lastScore - firstScore;
      const percentChange = ((change / firstScore) * 100).toFixed(1);

      doc.setFontSize(10);
      doc.text('Baseline: ' + goal.baseline, 14, yPos);
      yPos += 6;
      doc.text('Target: ' + goal.target, 14, yPos);
      yPos += 6;
      doc.text('First Score: ' + firstScore.toFixed(2), 14, yPos);
      yPos += 6;
      doc.text('Latest Score: ' + lastScore.toFixed(2), 14, yPos);
      yPos += 6;
      doc.text('Change: ' + (change > 0 ? '+' : '') + change.toFixed(2) + ' (' + percentChange + '%)', 14, yPos);
      yPos += 15;
    }

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
  }

  const fileName = 'Trends-Report-' + new Date().toISOString().slice(0, 10) + '.pdf';
  doc.save(fileName);
}
