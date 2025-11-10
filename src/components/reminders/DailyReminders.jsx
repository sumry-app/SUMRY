import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, Plus, Clock, Calendar } from 'lucide-react';

/**
 * DailyReminders - Feature #14: Daily Reminders + Checklists
 *
 * Push reminders for data collection
 * Daily checklists for paras
 */
export default function DailyReminders({ reminders, onComplete, onDismiss, onAdd }) {
  const [activeReminders, setActiveReminders] = useState([]);

  useEffect(() => {
    // Filter to today's reminders
    const today = new Date().toISOString().split('T')[0];
    const todayReminders = reminders.filter(r =>
      r.date === today && !r.completed && !r.dismissed
    );
    setActiveReminders(todayReminders);

    // Check for browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Set up reminder notifications
    todayReminders.forEach(reminder => {
      const reminderTime = new Date(`${reminder.date}T${reminder.time}`);
      const now = new Date();
      const msUntilReminder = reminderTime - now;

      if (msUntilReminder > 0 && msUntilReminder < 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('SUMRY Reminder', {
              body: reminder.message,
              icon: '/icon.png'
            });
          }
        }, msUntilReminder);
      }
    });
  }, [reminders]);

  const handleComplete = (reminderId) => {
    onComplete(reminderId);
    setActiveReminders(activeReminders.filter(r => r.id !== reminderId));
  };

  const handleDismiss = (reminderId) => {
    onDismiss(reminderId);
    setActiveReminders(activeReminders.filter(r => r.id !== reminderId));
  };

  if (activeReminders.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm space-y-2">
      {activeReminders.slice(0, 3).map(reminder => (
        <Card
          key={reminder.id}
          className="border-2 border-blue-300 bg-blue-50 shadow-xl animate-in slide-in-from-right"
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-blue-600 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {reminder.time}
                  </Badge>
                  {reminder.priority === 'high' && (
                    <Badge variant="destructive" className="text-xs">
                      High Priority
                    </Badge>
                  )}
                </div>

                <p className="text-sm font-medium text-gray-900 mb-1">
                  {reminder.title}
                </p>
                <p className="text-xs text-gray-600">
                  {reminder.message}
                </p>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleComplete(reminder.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismiss(reminder.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {activeReminders.length > 3 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-3 pb-3 text-center text-sm text-gray-600">
            +{activeReminders.length - 3} more reminders
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Daily Checklist Component
export function DailyChecklist({ tasks, onToggle, onAdd }) {
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Checklist
            </h3>
            <p className="text-sm text-gray-600">
              {completedCount} of {tasks.length} completed ({progress}%)
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Task list */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No tasks for today. Add one to get started!
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  task.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <button
                  onClick={() => onToggle(task.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4 text-white" />}
                </button>

                <div className="flex-1">
                  <div className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-xs text-gray-600">{task.description}</div>
                  )}
                </div>

                {task.time && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {task.time}
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>

        {progress === 100 && tasks.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg text-center">
            <p className="text-green-700 font-semibold">🎉 All tasks complete!</p>
            <p className="text-xs text-green-600 mt-1">Great work today!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Generate default daily tasks for paras
export function generateDailyTasks(assignments, currentDate) {
  const dayOfWeek = new Date(currentDate).getDay();

  return assignments
    .filter(a => a.schedule.includes(dayOfWeek))
    .map(assignment => ({
      id: `task_${assignment.id}_${currentDate}`,
      title: `Data collection: ${assignment.studentName}`,
      description: assignment.goalDescription,
      time: assignment.timeSlot,
      completed: false,
      assignmentId: assignment.id
    }));
}
