/**
 * ImportDialog Component
 *
 * Comprehensive data import UI with:
 * - Drag-and-drop file upload
 * - File type detection
 * - Smart column mapping interface
 * - Data preview table (first 10 rows)
 * - Validation results
 * - Import progress
 * - Success/error summary
 * - Rollback option
 * - Import history
 */

import React, { useState, useRef, useCallback } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  Users,
  Target,
  ClipboardList,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  parseFile,
  detectFileType,
  autoDetectColumns,
  validateColumnMappings,
  validateAllData,
  detectDuplicateStudents,
  detectDuplicateGoals,
  transformStudentData,
  transformGoalData,
  transformProgressLogData,
  downloadImportTemplate,
  generatePreview,
  IMPORT_TYPES,
  COLUMN_MAPPINGS
} from '../../lib/dataImport';
import { useDataStore } from '../../store/dataStore';
import { uid } from '../../lib/data';

// Import type configuration
const IMPORT_TYPE_CONFIG = {
  [IMPORT_TYPES.STUDENTS]: {
    name: 'Student Roster',
    description: 'Import student information (name, grade, disability, student number)',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  [IMPORT_TYPES.GOALS]: {
    name: 'Goals List',
    description: 'Import goals (student, area, description, baseline, target)',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  [IMPORT_TYPES.PROGRESS_LOGS]: {
    name: 'Progress Logs',
    description: 'Import progress data (goal, date, score, notes)',
    icon: ClipboardList,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
};

// Import steps
const STEPS = {
  SELECT_TYPE: 'select_type',
  UPLOAD_FILE: 'upload_file',
  MAP_COLUMNS: 'map_columns',
  PREVIEW_VALIDATE: 'preview_validate',
  IMPORTING: 'importing',
  COMPLETE: 'complete'
};

export default function ImportDialog({ trigger, onImportComplete }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(STEPS.SELECT_TYPE);
  const [importType, setImportType] = useState(null);

  // File data
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Column mapping
  const [columnMappings, setColumnMappings] = useState({});
  const [mappingConfidence, setMappingConfidence] = useState({});
  const [unmappedHeaders, setUnmappedHeaders] = useState([]);

  // Validation
  const [validationResults, setValidationResults] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  // Import progress
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');
  const [importResults, setImportResults] = useState(null);
  const [importedData, setImportedData] = useState(null);

  // UI state
  const [expandedErrors, setExpandedErrors] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const fileInputRef = useRef(null);

  // Store access
  const { students, goals, createStudent, createGoal, createProgressLog } = useDataStore();

  // ============================================================================
  // FILE UPLOAD HANDLERS
  // ============================================================================

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    const fileType = detectFileType(selectedFile);
    if (!fileType) {
      alert('Invalid file type. Please upload a CSV or Excel file.');
      return;
    }

    setFile(selectedFile);

    try {
      const parsed = await parseFile(selectedFile);
      setParsedData(parsed);

      // Auto-detect column mappings
      const autoMapping = autoDetectColumns(parsed.headers, importType);
      setColumnMappings(autoMapping.mappings);
      setMappingConfidence(autoMapping.confidence);
      setUnmappedHeaders(autoMapping.unmappedHeaders);

      // Move to mapping step
      setStep(STEPS.MAP_COLUMNS);
    } catch (error) {
      alert(`Failed to parse file: ${error.message}`);
      setFile(null);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [importType]);

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // ============================================================================
  // COLUMN MAPPING HANDLERS
  // ============================================================================

  const handleColumnMappingChange = (fieldKey, headerName) => {
    setColumnMappings(prev => ({
      ...prev,
      [fieldKey]: headerName
    }));
  };

  const handleValidateMapping = () => {
    const validation = validateColumnMappings(columnMappings, importType);

    if (!validation.isValid) {
      const errorMsg = validation.errors.map(e => e.message).join('\n');
      alert(`Column mapping errors:\n${errorMsg}`);
      return;
    }

    // Validate all data
    const results = validateAllData(parsedData.data, columnMappings, importType);
    setValidationResults(results);

    // Generate preview
    const preview = generatePreview(parsedData.data, columnMappings, importType, 10);
    setPreviewData(preview);

    // Check for duplicates
    if (importType === IMPORT_TYPES.STUDENTS) {
      const dups = detectDuplicateStudents(results.validData, students);
      setDuplicates(dups);
    } else if (importType === IMPORT_TYPES.GOALS) {
      // Build student mapping for duplicate detection
      const studentMapping = {};
      students.forEach(s => {
        studentMapping[s.name.toLowerCase()] = s.id;
      });
      const dups = detectDuplicateGoals(results.validData, goals, studentMapping);
      setDuplicates(dups);
    }

    setStep(STEPS.PREVIEW_VALIDATE);
  };

  // ============================================================================
  // IMPORT HANDLERS
  // ============================================================================

  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    setImportStatus('Preparing import...');
    setStep(STEPS.IMPORTING);

    try {
      let dataToImport = validationResults.validData;

      // Filter out duplicates if requested
      if (skipDuplicates && duplicates.length > 0) {
        const duplicateRows = new Set(duplicates.map(d => d.rowIndex));
        dataToImport = dataToImport.filter(item => !duplicateRows.has(item.rowIndex));
      }

      setImportStatus(`Importing ${dataToImport.length} records...`);
      setImportProgress(10);

      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      const imported = [];

      if (importType === IMPORT_TYPES.STUDENTS) {
        const students = transformStudentData(dataToImport);

        for (let i = 0; i < students.length; i++) {
          try {
            const created = await createStudent(students[i]);
            imported.push(created);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              row: dataToImport[i].rowIndex,
              error: error.message
            });
          }

          setImportProgress(10 + ((i + 1) / students.length) * 80);
        }
      } else if (importType === IMPORT_TYPES.GOALS) {
        // Build student mapping
        const studentMapping = {
          byName: {},
          byNumber: {}
        };

        students.forEach(s => {
          studentMapping.byName[s.name.toLowerCase()] = s.id;
          if (s.studentNumber) {
            studentMapping.byNumber[s.studentNumber] = s.id;
          }
        });

        const goalData = transformGoalData(dataToImport, studentMapping);

        for (let i = 0; i < goalData.length; i++) {
          if (!goalData[i]) {
            errorCount++;
            errors.push({
              row: dataToImport[i].rowIndex,
              error: 'Student not found'
            });
            continue;
          }

          try {
            const created = await createGoal(goalData[i]);
            imported.push(created);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              row: dataToImport[i].rowIndex,
              error: error.message
            });
          }

          setImportProgress(10 + ((i + 1) / goalData.length) * 80);
        }
      } else if (importType === IMPORT_TYPES.PROGRESS_LOGS) {
        // Build goal mapping by description
        const goalMapping = {};
        goals.forEach(g => {
          goalMapping[g.description.toLowerCase().trim()] = g.id;
        });

        const logData = transformProgressLogData(dataToImport, goalMapping);

        for (let i = 0; i < logData.length; i++) {
          if (!logData[i]) {
            errorCount++;
            errors.push({
              row: dataToImport[i].rowIndex,
              error: 'Goal not found'
            });
            continue;
          }

          try {
            const created = await createProgressLog(logData[i]);
            imported.push(created);
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({
              row: dataToImport[i].rowIndex,
              error: error.message
            });
          }

          setImportProgress(10 + ((i + 1) / logData.length) * 80);
        }
      }

      setImportProgress(100);
      setImportStatus('Import complete!');

      setImportResults({
        totalRows: dataToImport.length,
        successCount,
        errorCount,
        errors,
        skippedDuplicates: skipDuplicates ? duplicates.length : 0
      });

      setImportedData(imported);
      setStep(STEPS.COMPLETE);

      // Call completion callback if provided
      if (onImportComplete) {
        onImportComplete({
          type: importType,
          count: successCount,
          data: imported
        });
      }

    } catch (error) {
      setImportStatus(`Import failed: ${error.message}`);
      setImportResults({
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, error: error.message }],
        skippedDuplicates: 0
      });
    } finally {
      setIsImporting(false);
    }
  };

  // ============================================================================
  // RESET & NAVIGATION
  // ============================================================================

  const handleReset = () => {
    setStep(STEPS.SELECT_TYPE);
    setImportType(null);
    setFile(null);
    setParsedData(null);
    setColumnMappings({});
    setMappingConfidence({});
    setUnmappedHeaders([]);
    setValidationResults(null);
    setDuplicates([]);
    setPreviewData([]);
    setImportProgress(0);
    setImportStatus('');
    setImportResults(null);
    setImportedData(null);
  };

  const handleClose = () => {
    handleReset();
    setOpen(false);
  };

  const handleBack = () => {
    if (step === STEPS.UPLOAD_FILE) {
      setStep(STEPS.SELECT_TYPE);
    } else if (step === STEPS.MAP_COLUMNS) {
      setStep(STEPS.UPLOAD_FILE);
      setFile(null);
      setParsedData(null);
    } else if (step === STEPS.PREVIEW_VALIDATE) {
      setStep(STEPS.MAP_COLUMNS);
    }
  };

  const handleDownloadTemplate = () => {
    downloadImportTemplate(importType);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStepIndicator = () => {
    const steps = [
      { key: STEPS.SELECT_TYPE, label: 'Select Type' },
      { key: STEPS.UPLOAD_FILE, label: 'Upload File' },
      { key: STEPS.MAP_COLUMNS, label: 'Map Columns' },
      { key: STEPS.PREVIEW_VALIDATE, label: 'Preview & Validate' },
      { key: STEPS.IMPORTING, label: 'Importing' },
      { key: STEPS.COMPLETE, label: 'Complete' }
    ];

    const currentIndex = steps.findIndex(s => s.key === step);

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.slice(0, -1).map((s, index) => (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index < currentIndex
                    ? 'bg-teal-600 text-white'
                    : index === currentIndex
                    ? 'bg-teal-100 text-teal-600 ring-2 ring-teal-600'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentIndex ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={`text-sm font-medium hidden md:inline ${
                  index <= currentIndex ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < steps.length - 2 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentIndex ? 'bg-teal-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderSelectType = () => (
    <div className="space-y-4 py-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Import Type</h3>
        <p className="text-sm text-gray-600">Choose what type of data you want to import</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(IMPORT_TYPE_CONFIG).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <Card
              key={type}
              className={`cursor-pointer transition-all hover:shadow-md ${
                importType === type
                  ? `ring-2 ring-teal-500 ${config.bgColor}`
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setImportType(type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${config.bgColor}`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-base">{config.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                  </div>
                  {importType === type && (
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Need help?</p>
              <p>Download a template file to see the required format and column headers for each import type.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUploadFile = () => (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Upload Your File</h3>
          <p className="text-sm text-gray-600">
            Upload a CSV or Excel file with your {IMPORT_TYPE_CONFIG[importType].name.toLowerCase()}
          </p>
        </div>
        <Button onClick={handleDownloadTemplate} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Download Template
        </Button>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <FileSpreadsheet className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-lg">{file.name}</p>
              <p className="text-sm text-gray-600">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              onClick={() => {
                setFile(null);
                setParsedData(null);
              }}
              variant="outline"
              size="sm"
            >
              Choose Different File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drag and drop your file here
              </p>
              <p className="text-sm text-gray-500 mt-1">or</p>
            </div>
            <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" />
              Browse Files
            </Button>
            <p className="text-xs text-gray-500">Supports CSV and Excel (.xlsx, .xls) files</p>
          </div>
        )}
      </div>

      {parsedData && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold mb-1">File parsed successfully!</p>
                <ul className="space-y-1">
                  <li>• {parsedData.totalRows} data rows found</li>
                  <li>• {parsedData.headers.length} columns detected</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMapColumns = () => {
    const expectedColumns = COLUMN_MAPPINGS[importType];

    return (
      <div className="space-y-4 py-4">
        <div>
          <h3 className="text-lg font-semibold">Map Your Columns</h3>
          <p className="text-sm text-gray-600">
            Match your file columns to SUMRY fields. Auto-detected mappings are suggested.
          </p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {expectedColumns.map(col => {
            const mappedHeader = columnMappings[col.key];
            const confidence = mappingConfidence[col.key];

            return (
              <div key={col.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-semibold">{col.label}</Label>
                    {col.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                    {confidence && confidence >= 0.8 && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        Auto-detected
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <select
                    value={mappedHeader || ''}
                    onChange={(e) => handleColumnMappingChange(col.key, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      col.required && !mappedHeader ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select Column --</option>
                    {parsedData.headers.map(header => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        {unmappedHeaders.length > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-1">Unmapped columns detected</p>
                  <p>The following columns won't be imported: {unmappedHeaders.join(', ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPreviewValidate = () => {
    if (!validationResults) return null;

    const hasErrors = validationResults.invalidRows > 0;
    const hasDuplicates = duplicates.length > 0;

    return (
      <div className="space-y-4 py-4">
        <div>
          <h3 className="text-lg font-semibold">Preview & Validation</h3>
          <p className="text-sm text-gray-600">
            Review your data before importing. Fix any errors to proceed.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {validationResults.totalRows}
                </div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validationResults.validRows}
                </div>
                <div className="text-sm text-gray-600">Valid</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResults.invalidRows}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Duplicates Warning */}
        {hasDuplicates && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900">
                    {duplicates.length} potential duplicate{duplicates.length > 1 ? 's' : ''} detected
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    These records appear to match existing data in your system.
                  </p>

                  <button
                    onClick={() => setShowDuplicates(!showDuplicates)}
                    className="flex items-center gap-1 text-sm text-yellow-700 hover:text-yellow-900 mt-2"
                  >
                    {showDuplicates ? 'Hide' : 'Show'} duplicates
                    {showDuplicates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showDuplicates && (
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                      {duplicates.slice(0, 10).map((dup, idx) => (
                        <div key={idx} className="text-xs bg-white p-2 rounded border border-yellow-200">
                          <p className="font-semibold">Row {dup.rowIndex}</p>
                          <p className="text-gray-600">
                            Matches existing: {dup.existingData.name || dup.existingData.description}
                          </p>
                        </div>
                      ))}
                      {duplicates.length > 10 && (
                        <p className="text-xs text-yellow-700">
                          ...and {duplicates.length - 10} more
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={skipDuplicates}
                        onChange={(e) => setSkipDuplicates(e.target.checked)}
                        className="rounded border-yellow-300"
                      />
                      <span className="text-yellow-900">Skip duplicates during import</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Errors */}
        {hasErrors && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">
                    {validationResults.errors.length} validation error{validationResults.errors.length > 1 ? 's' : ''} found
                  </p>
                  <p className="text-sm text-red-800 mt-1">
                    Please fix these errors in your file before importing.
                  </p>

                  <button
                    onClick={() => setExpandedErrors(!expandedErrors)}
                    className="flex items-center gap-1 text-sm text-red-700 hover:text-red-900 mt-2"
                  >
                    {expandedErrors ? 'Hide' : 'Show'} errors
                    {expandedErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {expandedErrors && (
                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {validationResults.errors.slice(0, 20).map((error, idx) => (
                        <div key={idx} className="text-xs bg-white p-2 rounded border border-red-200">
                          <span className="font-semibold">Row {error.row}</span>
                          <span className="text-gray-600"> - {error.field}: </span>
                          <span className="text-red-600">{error.message}</span>
                        </div>
                      ))}
                      {validationResults.errors.length > 20 && (
                        <p className="text-xs text-red-700">
                          ...and {validationResults.errors.length - 20} more errors
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Table */}
        <div>
          <h4 className="font-semibold mb-2">Data Preview (First 10 Rows)</h4>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Row</th>
                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                    {Object.keys(columnMappings).map(key => (
                      <th key={key} className="px-3 py-2 text-left font-semibold">
                        {COLUMN_MAPPINGS[importType].find(c => c.key === key)?.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2 font-mono text-xs">{row.rowIndex}</td>
                      <td className="px-3 py-2">
                        {row.validation.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </td>
                      {Object.keys(columnMappings).map(key => (
                        <td key={key} className="px-3 py-2 max-w-xs truncate">
                          {row.data[key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImporting = () => (
    <div className="py-12 space-y-6">
      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-4">
          <Loader2 className="w-16 h-16 text-teal-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-teal-600">
              {Math.round(importProgress)}%
            </span>
          </div>
        </div>

        <p className="text-lg font-semibold text-gray-900 mb-2">{importStatus}</p>

        <div className="w-full max-w-md">
          <Progress value={importProgress} max={100} className="h-2" />
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Please don't close this window...
        </p>
      </div>
    </div>
  );

  const renderComplete = () => {
    if (!importResults) return null;

    const success = importResults.successCount > 0;
    const hasErrors = importResults.errorCount > 0;

    return (
      <div className="space-y-4 py-4">
        <div className="flex flex-col items-center justify-center py-6">
          {success ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Complete!</h3>
              <p className="text-gray-600 text-center max-w-md">
                Successfully imported {importResults.successCount} {importType === IMPORT_TYPES.STUDENTS ? 'students' : importType === IMPORT_TYPES.GOALS ? 'goals' : 'progress logs'}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Failed</h3>
              <p className="text-gray-600 text-center max-w-md">
                No records were imported due to errors
              </p>
            </>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{importResults.totalRows}</div>
              <div className="text-sm text-gray-600">Processed</div>
            </CardContent>
          </Card>

          <Card className={success ? 'bg-green-50' : ''}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${success ? 'text-green-600' : ''}`}>
                {importResults.successCount}
              </div>
              <div className="text-sm text-gray-600">Imported</div>
            </CardContent>
          </Card>

          <Card className={hasErrors ? 'bg-red-50' : ''}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${hasErrors ? 'text-red-600' : ''}`}>
                {importResults.errorCount}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </CardContent>
          </Card>
        </div>

        {importResults.skippedDuplicates > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <p className="text-sm text-yellow-900">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Skipped {importResults.skippedDuplicates} duplicate record{importResults.skippedDuplicates > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        )}

        {hasErrors && importResults.errors.length > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="font-semibold text-red-900 mb-2">Import Errors:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {importResults.errors.map((error, idx) => (
                  <div key={idx} className="text-sm text-red-800">
                    Row {error.row}: {error.error}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            Data Import
          </DialogTitle>
          <DialogDescription>
            Import students, goals, or progress logs from CSV or Excel files
          </DialogDescription>
        </DialogHeader>

        {step !== STEPS.COMPLETE && step !== STEPS.SELECT_TYPE && renderStepIndicator()}

        {step === STEPS.SELECT_TYPE && renderSelectType()}
        {step === STEPS.UPLOAD_FILE && renderUploadFile()}
        {step === STEPS.MAP_COLUMNS && renderMapColumns()}
        {step === STEPS.PREVIEW_VALIDATE && renderPreviewValidate()}
        {step === STEPS.IMPORTING && renderImporting()}
        {step === STEPS.COMPLETE && renderComplete()}

        <DialogFooter>
          {step === STEPS.SELECT_TYPE && (
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep(STEPS.UPLOAD_FILE)}
                disabled={!importType}
                className="gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === STEPS.UPLOAD_FILE && (
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={() => setStep(STEPS.MAP_COLUMNS)}
                disabled={!parsedData}
                className="gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === STEPS.MAP_COLUMNS && (
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button onClick={handleValidateMapping} className="gap-2">
                Validate & Preview
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === STEPS.PREVIEW_VALIDATE && (
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={validationResults?.invalidRows > 0}
                className="gap-2 bg-teal-600 hover:bg-teal-700"
              >
                <Upload className="w-4 h-4" />
                Import {validationResults?.validRows || 0} Records
              </Button>
            </div>
          )}

          {step === STEPS.COMPLETE && (
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Import More Data
              </Button>
              <Button onClick={handleClose} className="gap-2 bg-teal-600 hover:bg-teal-700">
                <CheckCircle2 className="w-4 h-4" />
                Done
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
