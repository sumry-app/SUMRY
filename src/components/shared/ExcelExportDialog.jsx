/**
 * ExcelExportDialog Component
 *
 * Advanced Excel export dialog with:
 * - Multiple export type selection
 * - Custom column selection
 * - Date range filtering
 * - Student filtering
 * - Format selection (XLSX/CSV)
 * - Progress indicators
 * - Batch export options
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  Target,
  CheckSquare,
  ClipboardList,
  BarChart3,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import {
  exportStudentRoster,
  exportGoalProgressReport,
  exportComplianceTracking,
  exportProgressLogHistory,
  exportAnalyticsSummary,
  exportAllData,
  downloadExcel,
  downloadCSV
} from '../../lib/excelExport';

const EXPORT_TYPES = [
  {
    id: 'roster',
    name: 'Student Roster',
    description: 'Complete student information with demographics',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    id: 'progress',
    name: 'Goal Progress Report',
    description: 'Detailed goal tracking with progress statistics',
    icon: Target,
    color: 'text-green-600'
  },
  {
    id: 'compliance',
    name: 'Compliance Tracking',
    description: 'Compliance items and service logs',
    icon: CheckSquare,
    color: 'text-purple-600'
  },
  {
    id: 'logs',
    name: 'Progress Log History',
    description: 'Complete history of all progress entries',
    icon: ClipboardList,
    color: 'text-orange-600'
  },
  {
    id: 'analytics',
    name: 'Analytics Summary',
    description: 'Comprehensive analytics and statistics',
    icon: BarChart3,
    color: 'text-pink-600'
  }
];

const ROSTER_COLUMNS = [
  { key: 'student_number', label: 'Student ID' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'first_name', label: 'First Name' },
  { key: 'date_of_birth', label: 'Date of Birth' },
  { key: 'grade_level', label: 'Grade Level' },
  { key: 'disability_classification', label: 'Disability' },
  { key: 'is_active', label: 'Status' },
  { key: 'created_at', label: 'Created Date' }
];

export default function ExcelExportDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('roster');
  const [format, setFormat] = useState('xlsx');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Filters
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [includeInactive, setIncludeInactive] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(['all']);

  // Data from store
  const { students, goals, progressLogs } = useDataStore();

  // Mock data for compliance and service logs (replace with actual data when available)
  const complianceItems = [];
  const serviceLogs = [];

  const handleColumnToggle = (columnKey) => {
    if (columnKey === 'all') {
      setSelectedColumns(['all']);
    } else {
      const newColumns = selectedColumns.filter(col => col !== 'all');
      if (newColumns.includes(columnKey)) {
        const filtered = newColumns.filter(col => col !== columnKey);
        setSelectedColumns(filtered.length > 0 ? filtered : ['all']);
      } else {
        setSelectedColumns([...newColumns, columnKey]);
      }
    }
  };

  const simulateProgress = async (duration) => {
    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      setExportProgress((i / steps) * 100);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportMessage('Preparing export...');

    try {
      let workbook;
      let filename;

      // Prepare options
      const options = {
        includeInactive,
        selectedColumns,
        studentId: selectedStudent !== 'all' ? selectedStudent : null,
        dateRange: dateRange.start && dateRange.end ? dateRange : null
      };

      setExportMessage('Generating workbook...');
      await simulateProgress(500);

      // Generate workbook based on selected type
      switch (selectedType) {
        case 'roster':
          setExportMessage('Exporting student roster...');
          workbook = exportStudentRoster(students, options);
          filename = 'SUMRY_Student_Roster';
          break;

        case 'progress':
          setExportMessage('Exporting goal progress report...');
          workbook = exportGoalProgressReport(students, goals, progressLogs, options);
          filename = 'SUMRY_Goal_Progress_Report';
          break;

        case 'compliance':
          setExportMessage('Exporting compliance tracking...');
          workbook = exportComplianceTracking(students, complianceItems, serviceLogs, options);
          filename = 'SUMRY_Compliance_Tracking';
          break;

        case 'logs':
          setExportMessage('Exporting progress log history...');
          workbook = exportProgressLogHistory(students, goals, progressLogs, options);
          filename = 'SUMRY_Progress_Log_History';
          break;

        case 'analytics':
          setExportMessage('Exporting analytics summary...');
          workbook = exportAnalyticsSummary(students, goals, progressLogs, options);
          filename = 'SUMRY_Analytics_Summary';
          break;

        default:
          throw new Error('Invalid export type');
      }

      setExportMessage('Downloading file...');
      await simulateProgress(300);

      // Download file
      if (format === 'xlsx') {
        downloadExcel(workbook, filename);
      } else {
        downloadCSV(workbook, filename);
      }

      setExportProgress(100);
      setExportMessage('Export completed successfully!');
      setShowSuccess(true);

      // Reset after success
      setTimeout(() => {
        setIsExporting(false);
        setShowSuccess(false);
        setExportProgress(0);
        setExportMessage('');
        setOpen(false);
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage(`Export failed: ${error.message}`);
      setIsExporting(false);
    }
  };

  const handleBatchExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportMessage('Preparing batch export...');

    try {
      await simulateProgress(1000);

      setExportMessage('Generating comprehensive workbook...');
      const workbook = exportAllData(
        students,
        goals,
        progressLogs,
        complianceItems,
        serviceLogs,
        { includeInactive }
      );

      setExportMessage('Downloading file...');
      await simulateProgress(500);

      if (format === 'xlsx') {
        downloadExcel(workbook, 'SUMRY_Complete_Export');
      } else {
        downloadCSV(workbook, 'SUMRY_Complete_Export');
      }

      setExportProgress(100);
      setExportMessage('Batch export completed successfully!');
      setShowSuccess(true);

      setTimeout(() => {
        setIsExporting(false);
        setShowSuccess(false);
        setExportProgress(0);
        setExportMessage('');
        setOpen(false);
      }, 2000);

    } catch (error) {
      console.error('Batch export failed:', error);
      setExportMessage(`Export failed: ${error.message}`);
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            Advanced Excel Export
          </DialogTitle>
          <DialogDescription>
            Export your SUMRY data to Excel with professional formatting, charts, and analysis
          </DialogDescription>
        </DialogHeader>

        {!isExporting ? (
          <div className="space-y-6 py-4">
            {/* Export Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Export Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXPORT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-all ${
                        selectedType === type.id
                          ? 'ring-2 ring-teal-500 bg-teal-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 ${type.color} flex-shrink-0 mt-1`} />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{type.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                          </div>
                          {selectedType === type.id && (
                            <Check className="w-5 h-5 text-teal-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">File Format</Label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFormat('xlsx')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    format === 'xlsx'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="font-medium">XLSX (Excel)</span>
                </button>
                <button
                  onClick={() => setFormat('csv')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    format === 'csv'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">CSV (Text)</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Filters & Options</Label>

              {/* Student Selection */}
              {(selectedType === 'progress' || selectedType === 'logs') && (
                <div className="space-y-2">
                  <Label htmlFor="student-select">Student</Label>
                  <select
                    id="student-select"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">All Students</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Range */}
              {(selectedType === 'logs' || selectedType === 'compliance') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Column Selection for Roster */}
              {selectedType === 'roster' && (
                <div className="space-y-2">
                  <Label>Include Columns</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="col-all"
                        checked={selectedColumns.includes('all')}
                        onCheckedChange={() => handleColumnToggle('all')}
                      />
                      <Label htmlFor="col-all" className="font-normal cursor-pointer">
                        All Columns
                      </Label>
                    </div>
                    {ROSTER_COLUMNS.slice(0, -1).map((col) => (
                      <div key={col.key} className="flex items-center gap-2">
                        <Checkbox
                          id={`col-${col.key}`}
                          checked={selectedColumns.includes('all') || selectedColumns.includes(col.key)}
                          onCheckedChange={() => handleColumnToggle(col.key)}
                          disabled={selectedColumns.includes('all')}
                        />
                        <Label
                          htmlFor={`col-${col.key}`}
                          className="font-normal cursor-pointer"
                        >
                          {col.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Include Inactive */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-inactive"
                  checked={includeInactive}
                  onCheckedChange={setIncludeInactive}
                />
                <Label htmlFor="include-inactive" className="font-normal cursor-pointer">
                  Include inactive students
                </Label>
              </div>
            </div>

            {/* Preview Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Export Preview</p>
                    <ul className="space-y-1 text-xs">
                      <li>• {students.length} students in database</li>
                      <li>• {goals.length} goals tracked</li>
                      <li>• {progressLogs.length} progress logs recorded</li>
                      <li>• Format: Professional {format.toUpperCase()} with charts and formatting</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Export Progress */
          <div className="py-12 space-y-6">
            <div className="flex flex-col items-center justify-center">
              {showSuccess ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              ) : (
                <div className="relative mb-4">
                  <Loader2 className="w-16 h-16 text-teal-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-teal-600">
                      {Math.round(exportProgress)}%
                    </span>
                  </div>
                </div>
              )}

              <p className="text-lg font-semibold text-gray-900 mb-2">{exportMessage}</p>

              {/* Progress Bar */}
              <div className="w-full max-w-md">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 transition-all duration-300 ease-out"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>

              {showSuccess && (
                <p className="text-sm text-gray-600 mt-4">
                  Your file has been downloaded successfully!
                </p>
              )}
            </div>
          </div>
        )}

        {!isExporting && (
          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <Button
                onClick={handleBatchExport}
                variant="outline"
                className="gap-2"
                disabled={isExporting}
              >
                <Download className="w-4 h-4" />
                Export All Data
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="gap-2 bg-teal-600 hover:bg-teal-700"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
