import { useState } from 'react';
import { Calendar } from './index';
import { StudentTimeline, ProgressTimeline } from '../timeline/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Timeline, TrendingUp } from 'lucide-react';

/**
 * Calendar and Timeline Demo
 * Shows how to integrate calendar and timeline components
 */
export default function CalendarDemo() {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [customEvents, setCustomEvents] = useState([]);

  // Mock data - replace with actual data from your store
  const mockStudents = [
    {
      id: 1,
      name: 'John Doe',
      grade: '3rd Grade',
      iep_last_meeting: '2024-06-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      grade: '4th Grade',
      iep_last_meeting: '2024-05-20'
    }
  ];

  const mockGoals = [
    {
      id: 1,
      student_id: 1,
      description: 'Read 50 words per minute',
      goal_type: 'Reading',
      current_value: 35,
      target_value: 50,
      target_date: '2025-03-15',
      status: 'in_progress',
      created_at: '2024-09-01'
    },
    {
      id: 2,
      student_id: 1,
      description: 'Complete 10 math problems with 80% accuracy',
      goal_type: 'Math',
      current_value: 7,
      target_value: 10,
      target_date: '2025-04-01',
      status: 'in_progress',
      created_at: '2024-09-15'
    },
    {
      id: 3,
      student_id: 2,
      description: 'Write a 5-sentence paragraph',
      goal_type: 'Writing',
      current_value: 3,
      target_value: 5,
      target_date: '2025-02-28',
      status: 'in_progress',
      created_at: '2024-08-20'
    }
  ];

  const mockProgressLogs = [
    {
      id: 1,
      goal_id: 1,
      date: '2024-10-15',
      score: 60,
      notes: 'Good progress on phonics'
    },
    {
      id: 2,
      goal_id: 1,
      date: '2024-11-01',
      score: 70,
      notes: 'Improved fluency with sight words'
    },
    {
      id: 3,
      goal_id: 1,
      date: '2024-11-15',
      score: 75,
      notes: 'Reading with more confidence'
    },
    {
      id: 4,
      goal_id: 2,
      date: '2024-10-20',
      score: 65,
      notes: 'Struggling with word problems'
    },
    {
      id: 5,
      goal_id: 2,
      date: '2024-11-10',
      score: 72,
      notes: 'Better understanding of addition'
    },
    {
      id: 6,
      goal_id: 3,
      date: '2024-10-25',
      score: 55,
      notes: 'Working on sentence structure'
    },
    {
      id: 7,
      goal_id: 3,
      date: '2024-11-12',
      score: 68,
      notes: 'Improved grammar usage'
    }
  ];

  // Handlers
  const handleCreateEvent = (event) => {
    console.log('Created event:', event);
    setCustomEvents(prev => [...prev, event]);
  };

  const handleUpdateEvent = (eventId, eventData) => {
    console.log('Updated event:', eventId, eventData);
    setCustomEvents(prev =>
      prev.map(e => e.id === eventId ? { ...e, ...eventData } : e)
    );
  };

  const handleDeleteEvent = (eventId) => {
    console.log('Deleted event:', eventId);
    setCustomEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleAddAnnotation = (logId, text) => {
    console.log('Added annotation to log:', logId, text);
  };

  // Get selected student data
  const selectedStudent = mockStudents.find(s => s.id === selectedStudentId);
  const studentGoals = selectedStudentId
    ? mockGoals.filter(g => g.student_id === selectedStudentId)
    : mockGoals;
  const studentLogs = selectedStudentId
    ? mockProgressLogs.filter(log => {
        const goal = mockGoals.find(g => g.id === log.goal_id);
        return goal && goal.student_id === selectedStudentId;
      })
    : mockProgressLogs;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Calendar & Timeline Views
        </h1>
        <p className="text-gray-600">
          Visualize student progress, goals, and important dates
        </p>
      </div>

      {/* Student Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Student:
            </label>
            <Select
              value={selectedStudentId?.toString() || 'all'}
              onValueChange={(value) => setSelectedStudentId(value === 'all' ? null : parseInt(value))}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {mockStudents.map(student => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name} - {student.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="student-timeline" className="flex items-center gap-2">
            <Timeline className="w-4 h-4" />
            Student Timeline
          </TabsTrigger>
          <TabsTrigger value="progress-timeline" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progress Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Calendar
            students={mockStudents}
            goals={studentGoals}
            progressLogs={studentLogs}
            onCreateEvent={handleCreateEvent}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />

          {/* Usage Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">Calendar Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• View events in Month, Week, or Day view</li>
                <li>• Click on a date to create a new event</li>
                <li>• Click on an event to view/edit details</li>
                <li>• Drag custom events to reschedule them</li>
                <li>• Filter events by type using the Filter button</li>
                <li>• Export to iCal format for use in other calendar apps</li>
                <li>• IEP meeting deadlines are automatically tracked</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-timeline" className="space-y-4">
          {selectedStudent ? (
            <StudentTimeline
              student={selectedStudent}
              goals={studentGoals}
              progressLogs={studentLogs}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Timeline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Please select a student</p>
                <p className="text-sm text-gray-400">
                  Use the student selector above to view their timeline
                </p>
              </CardContent>
            </Card>
          )}

          {/* Usage Instructions */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm">Student Timeline Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Horizontal timeline showing student's journey</li>
                <li>• Milestones automatically detected at 50%, 75%, and 90%</li>
                <li>• Zoom in/out to see more or less detail</li>
                <li>• Filter by event type (Goals, Progress, Milestones)</li>
                <li>• Click on events to see detailed information</li>
                <li>• Scroll left/right to navigate the timeline</li>
                <li>• Export timeline as an image (requires html2canvas)</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress-timeline" className="space-y-4">
          <ProgressTimeline
            goals={studentGoals}
            progressLogs={studentLogs}
            students={mockStudents}
            onAddAnnotation={handleAddAnnotation}
          />

          {/* Usage Instructions */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-sm">Progress Timeline Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Vertical timeline with all progress logs</li>
                <li>• Trend line overlay showing overall progress direction</li>
                <li>• Visual chart with score progression over time</li>
                <li>• Filter by specific goals</li>
                <li>• Add annotations to progress entries</li>
                <li>• Expand/collapse entries for more details</li>
                <li>• Statistics showing average, min, max, and trend</li>
                <li>• Export as image for reports</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Integration Example */}
      <Card className="border-2 border-[#65A39B]">
        <CardHeader>
          <CardTitle>Integration Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Import the components:</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { Calendar } from '@/components/calendar';
import { StudentTimeline, ProgressTimeline } from '@/components/timeline';`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Use with your data:</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Calendar
<Calendar
  students={students}
  goals={goals}
  progressLogs={progressLogs}
  onCreateEvent={handleCreateEvent}
  onUpdateEvent={handleUpdateEvent}
  onDeleteEvent={handleDeleteEvent}
/>

// Student Timeline
<StudentTimeline
  student={selectedStudent}
  goals={studentGoals}
  progressLogs={studentProgressLogs}
/>

// Progress Timeline
<ProgressTimeline
  goals={goals}
  progressLogs={progressLogs}
  students={students}
  onAddAnnotation={handleAddAnnotation}
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Connect to your store:</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useDataStore } from '@/store/dataStore';

function MyComponent() {
  const { students, goals, progressLogs } = useDataStore();

  return (
    <Calendar
      students={students}
      goals={goals}
      progressLogs={progressLogs}
    />
  );
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
