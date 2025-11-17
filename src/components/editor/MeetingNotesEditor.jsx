import { useState, useEffect } from 'react';
import { FileText, Save, Download, Share2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { cn } from '../../lib/utils';

/**
 * Meeting Notes Editor - Practical Integration Example
 *
 * This demonstrates how to integrate the RichTextEditor into a real
 * SUMRY application feature for taking meeting notes.
 */
export default function MeetingNotesEditor({ meetingId, initialNotes = '' }) {
  const [notes, setNotes] = useState(initialNotes);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load meeting data
  useEffect(() => {
    // Simulated API call to load meeting data
    const loadMeeting = async () => {
      // In a real app, this would be an API call
      // const meeting = await api.getMeeting(meetingId);
      // setMeetingTitle(meeting.title);
      // setNotes(meeting.notes);

      // Demo data
      setMeetingTitle('Weekly Team Sync - Nov 17, 2025');
    };

    if (meetingId) {
      loadMeeting();
    }
  }, [meetingId]);

  // Auto-save handler
  const handleAutoSave = async (content) => {
    setIsSaving(true);
    try {
      // Simulated API call
      // await api.updateMeetingNotes(meetingId, content);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setLastSaved(new Date());
      console.log('Meeting notes saved:', content);
    } catch (error) {
      console.error('Failed to save meeting notes:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Export notes as PDF
  const handleExportPDF = () => {
    console.log('Export as PDF', notes);
    // Integration with existing SUMRY PDF export functionality
    // import { exportNotesAsPDF } from '../../lib/pdfReports';
    // exportNotesAsPDF(meetingTitle, notes);
  };

  // Share notes
  const handleShare = () => {
    console.log('Share notes', notes);
    // Integration with sharing functionality
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {meetingTitle || 'Meeting Notes'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lastSaved
                ? `Last saved ${lastSaved.toLocaleTimeString()}`
                : 'Not saved yet'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'text-sm font-medium',
              'bg-gray-100 hover:bg-gray-200',
              'dark:bg-gray-800 dark:hover:bg-gray-700',
              'text-gray-700 dark:text-gray-300',
              'transition-colors duration-200'
            )}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleExportPDF}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'text-sm font-medium',
              'bg-blue-600 hover:bg-blue-700',
              'text-white',
              'transition-colors duration-200'
            )}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        <RichTextEditor
          content={notes}
          onChange={setNotes}
          onSave={handleAutoSave}
          autoSave={true}
          autoSaveInterval={30000} // Save every 30 seconds
          placeholder="Start taking notes for this meeting..."
          showWordCount={true}
          className="border-0"
          editorClassName="min-h-[500px]"
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Tip:</strong> Use keyboard shortcuts for faster formatting:
            Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links
          </p>
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* Meeting Context (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Meeting Info
          </h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Date:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">Nov 17, 2025</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Duration:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">60 min</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Attendees:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">8 people</dd>
            </div>
          </dl>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Quick Stats
          </h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Notes:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {notes ? '✓ Added' : '✗ Empty'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Action Items:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">3</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Shared:</dt>
              <dd className="font-medium text-gray-900 dark:text-white">Yes</dd>
            </div>
          </dl>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Templates
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setNotes(`
                <h2>Meeting Summary</h2>
                <h3>Attendees</h3>
                <ul><li>Name 1</li><li>Name 2</li></ul>
                <h3>Discussion Points</h3>
                <ul><li>Point 1</li><li>Point 2</li></ul>
                <h3>Action Items</h3>
                <ul><li>Task 1</li><li>Task 2</li></ul>
                <h3>Next Steps</h3>
                <p>...</p>
              `)}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              📋 Standard Meeting
            </button>
            <button
              onClick={() => setNotes(`
                <h2>Sprint Planning</h2>
                <h3>Sprint Goal</h3>
                <p>...</p>
                <h3>Stories</h3>
                <ul><li>Story 1</li><li>Story 2</li></ul>
                <h3>Capacity</h3>
                <p>...</p>
              `)}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              🏃 Sprint Planning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
