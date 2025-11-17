# Excel Export Quick Reference Card

## 🚀 Quick Start (Copy & Paste)

```javascript
// 1. Import
import { exportStudentRoster, downloadExcel } from '@/lib/excelExport';
import { useDataStore } from '@/store/dataStore';

// 2. Get data
const { students, goals, progressLogs } = useDataStore();

// 3. Export
const workbook = exportStudentRoster(students);
downloadExcel(workbook, 'Student_Roster');
```

## 📊 Export Types Cheat Sheet

| Type | Function | Best For | Sheets |
|------|----------|----------|--------|
| **Roster** | `exportStudentRoster()` | Demographics, contact info | 1 |
| **Progress Report** | `exportGoalProgressReport()` | IEP meetings, parent conferences | Multiple |
| **Compliance** | `exportComplianceTracking()` | Due dates, service logs | 2 |
| **Log History** | `exportProgressLogHistory()` | Historical data analysis | 1 |
| **Analytics** | `exportAnalyticsSummary()` | Admin reports, trends | 3 |
| **Complete** | `exportAllData()` | End-of-year, audits | All |

## 🎨 Color Codes

### Status Colors
```
🟢 Green (#4CAF50)  = Active, Completed, On-track (≥80%)
🟡 Yellow (#FFC107) = Needs Attention (50-79%), Due Soon
🔴 Red (#F44336)    = Off-track (<50%), Overdue
🔵 Teal (#65A39B)   = Headers, Completed Goals
```

### When Colors Appear
- **Status Column**: Active/Inactive students
- **Progress %**: On-track vs off-track goals
- **Trend**: Improving (green) vs Declining (red)
- **Due Dates**: Overdue (red), <7 days (yellow)

## ⌨️ Keyboard Shortcuts

```
Ctrl+E (Cmd+E)  - Open Excel export dialog
Ctrl+K (Cmd+K)  - Open Quick Actions menu
ESC             - Close dialogs
```

## 🎯 Common Use Cases

### 1. Export for IEP Meeting
```javascript
const student = students.find(s => s.id === studentId);
const wb = exportGoalProgressReport([student], goals, progressLogs, {
  studentId: student.id
});
downloadExcel(wb, `IEP_${student.last_name}`);
```

### 2. Export Last 30 Days
```javascript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const wb = exportProgressLogHistory(students, goals, progressLogs, {
  dateRange: {
    start: format(thirtyDaysAgo, 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  }
});
```

### 3. Export Reading Goals Only
```javascript
const wb = exportProgressLogHistory(students, goals, progressLogs, {
  goalArea: 'Reading'
});
```

### 4. Export Active Students Only
```javascript
const wb = exportStudentRoster(students, {
  includeInactive: false
});
```

### 5. Export to CSV
```javascript
const wb = exportStudentRoster(students);
downloadCSV(wb, 'Student_Roster'); // CSV instead of XLSX
```

## 📋 Options Reference

### Student Roster Options
```javascript
{
  includeInactive: false,        // Include inactive students
  selectedColumns: ['all'],      // or ['first_name', 'last_name', ...]
  sortBy: 'lastName'            // or 'grade'
}
```

### Progress Report Options
```javascript
{
  studentId: '123',             // Specific student or null for all
  includeCharts: true           // Include chart data
}
```

### Log History Options
```javascript
{
  dateRange: {                  // Filter by date
    start: '2024-01-01',
    end: '2024-12-31'
  },
  studentId: '123',             // Filter by student
  goalArea: 'Reading'           // Filter by goal area
}
```

## 🔧 Troubleshooting

### Problem: Export is slow
**Solution:** Add progress indicator
```javascript
setIsLoading(true);
setTimeout(() => {
  const wb = exportStudentRoster(students);
  downloadExcel(wb, 'Roster');
  setIsLoading(false);
}, 100);
```

### Problem: Columns too wide
**Solution:** Adjust in excelExport.js
```javascript
autoSizeColumns(ws, data, 10, 50); // minWidth, maxWidth
```

### Problem: Need to customize colors
**Solution:** Edit COLORS constant in excelExport.js
```javascript
const COLORS = {
  primary: { rgb: 'E38673' },    // Your color here
  // ...
};
```

## 📱 UI Component Usage

### Basic
```javascript
<ExcelExportDialog />
```

### Custom Trigger
```javascript
<ExcelExportDialog
  trigger={
    <Button>My Custom Button</Button>
  }
/>
```

## 🎓 Goal Progress Statistics

The system automatically calculates:

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Avg Score** | Average of all scores | Sum / Count |
| **Latest Score** | Most recent entry | Last score in array |
| **Progress %** | Progress toward target | (Current - Baseline) / (Target - Baseline) × 100 |
| **Trend** | Direction of progress | Compare first half vs second half |

Trends:
- **Improving**: Second half avg > first half avg × 1.1
- **Declining**: Second half avg < first half avg × 0.9
- **Stable**: Neither improving nor declining

## 📦 What Gets Exported

### Student Roster
- Student ID, Name, DOB, Grade, Disability, Status, Created Date

### Goal Progress Report
**Summary Sheet:**
- Goal Area, Description, Baseline, Target, Status
- Latest Score, Avg Score, Progress %, Trend, Data Points

**Detail Sheets (per goal):**
- Date, Score, Notes, Logged By
- Goal information at top

### Progress Log History
- Date, Student Name, Goal Area, Goal Description
- Score, Unit, Target, Progress %, Notes, Logged By

### Analytics Summary
**Overview:**
- Total Students, Active Students, Total Goals
- Active/Completed Goals, Progress Logs, Avg Logs/Goal

**Student Performance:**
- Student Name, Grade, Goal Counts
- Total Logs, Avg Progress %, On-track Goals

**Goal Area Analysis:**
- Area, Total Goals, Active Goals
- Avg Progress %, Avg Logs/Goal, On-track Count

## 🔒 Security & Privacy

- ✅ All processing happens client-side (browser)
- ✅ No data sent to external servers
- ✅ Files saved directly to user's device
- ✅ Respects user permissions (implement in your app)
- ✅ FERPA compliant (no cloud storage)

## 📏 File Size Guidelines

| Records | Estimated Size | Load Time |
|---------|---------------|-----------|
| 1-50 | 5-15 KB | Instant |
| 51-200 | 15-40 KB | <1 second |
| 201-500 | 40-80 KB | 1-2 seconds |
| 501-1000 | 80-150 KB | 2-5 seconds |
| 1000+ | 150+ KB | 5-10 seconds |

💡 **Tip:** Show progress indicator for 200+ records

## 🎯 Best Practices

### ✅ DO
- Validate data before export
- Show loading indicators for large exports
- Use descriptive filenames with dates
- Handle errors gracefully
- Test with production-size data

### ❌ DON'T
- Export without error handling
- Use generic filenames
- Export sensitive data without permissions
- Forget to show success/failure notifications
- Export extremely large datasets without warning

## 📚 Learning Path

1. **Start Here:** Basic student roster export
2. **Next:** Progress report for one student
3. **Then:** Analytics summary export
4. **Advanced:** Custom filters and date ranges
5. **Pro:** Batch exports and automation

## 🆘 Getting Help

1. **Full Documentation:** `EXCEL_EXPORT_GUIDE.md`
2. **Code Examples:** `src/lib/excelExportExamples.js`
3. **Tests:** `src/lib/__tests__/excelExport.test.js`
4. **XLSX Docs:** https://docs.sheetjs.com/

## 🎪 Live Demo Code

```javascript
import React, { useState } from 'react';
import { exportStudentRoster, downloadExcel } from '@/lib/excelExport';
import { Button } from '@/components/ui/button';

export function QuickExportDemo({ students }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const workbook = exportStudentRoster(students);
      downloadExcel(workbook, 'Demo_Export');
      alert('✅ Export successful!');
    } catch (error) {
      alert('❌ Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'Exporting...' : 'Export to Excel'}
    </Button>
  );
}
```

## 🏆 Pro Tips

1. **Batch Operations**: Use `exportAllData()` for comprehensive exports
2. **Performance**: Add `setTimeout()` wrapper for large datasets
3. **Naming**: Include dates in filenames for easy organization
4. **Testing**: Always test with edge cases (empty data, nulls)
5. **Feedback**: Show progress bars for exports >1000 records

## 📅 Common Schedules

```javascript
// Weekly report every Monday
const isMonday = new Date().getDay() === 1;

// Monthly report on 1st of month
const isFirstOfMonth = new Date().getDate() === 1;

// Quarterly (end of Q1, Q2, Q3, Q4)
const quarter = Math.floor((new Date().getMonth() + 3) / 3);
```

## 🎨 Customization Points

Want to customize? Edit these in `excelExport.js`:

```javascript
// Line 11-26: Colors
const COLORS = { ... }

// Line 28-44: Header style
const HEADER_STYLE = { ... }

// Line 46-57: Cell style
const CELL_STYLE = { ... }

// Line 59-62: Title style
const TITLE_STYLE = { ... }
```

---

**Keep this card handy for quick reference!** 📌

For complete documentation, see `EXCEL_EXPORT_GUIDE.md`
