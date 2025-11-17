/**
 * SUMRY Data Import System - Integration Examples
 *
 * This file demonstrates how to integrate the comprehensive data import system
 * into your SUMRY application.
 */

import React from 'react';
import { ImportDialog } from './index';
import { Button } from '../ui/button';
import { Upload, Users, Target, ClipboardList } from 'lucide-react';

// ============================================================================
// BASIC USAGE
// ============================================================================

/**
 * Example 1: Basic Import Button
 *
 * Add a simple import button to any page. The dialog handles everything internally.
 */
export function BasicImportExample() {
  const handleImportComplete = (result) => {
    console.log('Import completed:', result);
    // result contains: { type, count, data }
    alert(`Successfully imported ${result.count} ${result.type}`);
  };

  return (
    <ImportDialog
      onImportComplete={handleImportComplete}
    />
  );
}

// ============================================================================
// CUSTOM TRIGGER
// ============================================================================

/**
 * Example 2: Custom Import Button
 *
 * Use a custom trigger button with your own styling
 */
export function CustomTriggerExample() {
  return (
    <ImportDialog
      trigger={
        <Button variant="default" className="bg-teal-600 hover:bg-teal-700 gap-2">
          <Upload className="w-4 h-4" />
          Import Students & Goals
        </Button>
      }
    />
  );
}

// ============================================================================
// MULTIPLE IMPORT BUTTONS
// ============================================================================

/**
 * Example 3: Separate Import Buttons for Each Type
 *
 * Create specific import buttons for different data types
 */
export function MultipleImportButtonsExample() {
  const handleStudentImport = (result) => {
    console.log('Students imported:', result.data);
    // Refresh student list, show notification, etc.
  };

  const handleGoalImport = (result) => {
    console.log('Goals imported:', result.data);
    // Refresh goal list, show notification, etc.
  };

  const handleProgressImport = (result) => {
    console.log('Progress logs imported:', result.data);
    // Refresh progress data, show notification, etc.
  };

  return (
    <div className="flex gap-3">
      <ImportDialog
        trigger={
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" />
            Import Students
          </Button>
        }
        onImportComplete={handleStudentImport}
      />

      <ImportDialog
        trigger={
          <Button variant="outline" className="gap-2">
            <Target className="w-4 h-4" />
            Import Goals
          </Button>
        }
        onImportComplete={handleGoalImport}
      />

      <ImportDialog
        trigger={
          <Button variant="outline" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Import Progress Logs
          </Button>
        }
        onImportComplete={handleProgressImport}
      />
    </div>
  );
}

// ============================================================================
// INTEGRATION WITH EXISTING PAGES
// ============================================================================

/**
 * Example 4: Add to Student Management Page
 *
 * Integrate import functionality into existing student management UI
 */
export function StudentPageIntegration() {
  const [students, setStudents] = React.useState([]);
  const [showNotification, setShowNotification] = React.useState(false);
  const [importCount, setImportCount] = React.useState(0);

  const handleImportComplete = (result) => {
    if (result.type === 'students') {
      // Update local state with imported students
      setStudents(prev => [...prev, ...result.data]);
      setImportCount(result.count);
      setShowNotification(true);

      // Auto-hide notification after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Student Management</h1>

        <div className="flex gap-3">
          <Button variant="outline">
            Add Student
          </Button>

          <ImportDialog
            trigger={
              <Button className="bg-teal-600 hover:bg-teal-700 gap-2">
                <Upload className="w-4 h-4" />
                Import Students
              </Button>
            }
            onImportComplete={handleImportComplete}
          />
        </div>
      </div>

      {showNotification && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-900 font-semibold">
            Successfully imported {importCount} student{importCount !== 1 ? 's' : ''}!
          </p>
        </div>
      )}

      {/* Rest of your student management UI */}
      <div className="grid gap-4">
        {students.map(student => (
          <div key={student.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{student.name}</h3>
            <p className="text-sm text-gray-600">
              Grade: {student.grade} | {student.disability}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ADVANCED: WITH STATE MANAGEMENT
// ============================================================================

/**
 * Example 5: Integration with Zustand Store
 *
 * The ImportDialog automatically uses the useDataStore hook, so imported
 * data is automatically synced with your global state.
 */
export function StoreIntegrationExample() {
  const handleImportComplete = (result) => {
    // Data is already added to the store by the ImportDialog
    // You can perform additional actions here
    console.log('Store updated with imported data');

    // Show a toast notification
    // toast.success(`Imported ${result.count} ${result.type}`)

    // Navigate to the imported data view
    // navigate('/students')

    // Trigger analytics event
    // analytics.track('data_imported', { type: result.type, count: result.count })
  };

  return (
    <ImportDialog
      onImportComplete={handleImportComplete}
    />
  );
}

// ============================================================================
// TEMPLATE DOWNLOADS
// ============================================================================

/**
 * Example 6: Standalone Template Download Buttons
 *
 * You can also use the import utility functions directly without the dialog
 */
import { downloadImportTemplate, IMPORT_TYPES } from '../../lib/dataImport';

export function TemplateDownloadExample() {
  const handleDownloadStudentTemplate = () => {
    downloadImportTemplate(IMPORT_TYPES.STUDENTS);
  };

  const handleDownloadGoalTemplate = () => {
    downloadImportTemplate(IMPORT_TYPES.GOALS);
  };

  const handleDownloadProgressTemplate = () => {
    downloadImportTemplate(IMPORT_TYPES.PROGRESS_LOGS);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Download Import Templates</h2>
      <p className="text-gray-600 mb-4">
        Download pre-formatted Excel templates to make data import easier
      </p>

      <div className="grid gap-3">
        <Button onClick={handleDownloadStudentTemplate} variant="outline" className="justify-start gap-2">
          <Users className="w-4 h-4" />
          Download Student Roster Template
        </Button>

        <Button onClick={handleDownloadGoalTemplate} variant="outline" className="justify-start gap-2">
          <Target className="w-4 h-4" />
          Download Goals Template
        </Button>

        <Button onClick={handleDownloadProgressTemplate} variant="outline" className="justify-start gap-2">
          <ClipboardList className="w-4 h-4" />
          Download Progress Logs Template
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// USAGE IN APP.JSX
// ============================================================================

/**
 * Example 7: Add to Main App Navigation/Toolbar
 */
export function AppToolbarIntegration() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border-b">
      <div className="flex-1">
        <h1 className="text-xl font-bold">SUMRY</h1>
      </div>

      <nav className="flex items-center gap-4">
        <Button variant="ghost">Dashboard</Button>
        <Button variant="ghost">Students</Button>
        <Button variant="ghost">Goals</Button>
        <Button variant="ghost">Progress</Button>

        {/* Import button in toolbar */}
        <ImportDialog
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
          }
        />
      </nav>
    </div>
  );
}

// ============================================================================
// FEATURES SUMMARY
// ============================================================================

/**
 * The ImportDialog component provides:
 *
 * 1. FILE UPLOAD
 *    - Drag-and-drop interface
 *    - CSV and Excel (.xlsx, .xls) support
 *    - File validation
 *
 * 2. COLUMN MAPPING
 *    - Smart auto-detection with fuzzy matching
 *    - Manual override for all columns
 *    - Confidence indicators
 *    - Required field validation
 *
 * 3. DATA VALIDATION
 *    - Required field checking
 *    - Data type validation
 *    - Date format parsing
 *    - Comprehensive error reporting with line numbers
 *
 * 4. DUPLICATE DETECTION
 *    - Smart duplicate detection for students (by name and number)
 *    - Goal duplicate detection (by description similarity)
 *    - Option to skip duplicates
 *
 * 5. PREVIEW & VALIDATION
 *    - Preview first 10 rows before import
 *    - Visual validation status for each row
 *    - Summary statistics (total, valid, errors)
 *    - Expandable error details
 *
 * 6. IMPORT PROGRESS
 *    - Real-time progress indicator
 *    - Status messages
 *    - Success/error summary
 *
 * 7. TEMPLATES
 *    - Download pre-formatted templates
 *    - Sample data included
 *    - Proper column headers
 *
 * 8. IMPORT TYPES SUPPORTED
 *    - Student Roster: name, grade, disability, student number, DOB
 *    - Goals: student, area, description, baseline, target, metric
 *    - Progress Logs: goal, date, score, notes
 *
 * 9. ERROR HANDLING
 *    - Comprehensive validation errors
 *    - Line-by-line error reporting
 *    - Rollback capability (data not saved if errors)
 *    - User-friendly error messages
 *
 * 10. INCREMENTAL IMPORT
 *     - Handles large files efficiently
 *     - Batch processing support
 *     - Progress tracking for large imports
 */

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export default {
  BasicImportExample,
  CustomTriggerExample,
  MultipleImportButtonsExample,
  StudentPageIntegration,
  StoreIntegrationExample,
  TemplateDownloadExample,
  AppToolbarIntegration
};
