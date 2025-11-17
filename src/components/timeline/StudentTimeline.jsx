import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn,
  ZoomOut,
  Target,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';
import { format, parseISO, differenceInDays, min, max } from 'date-fns';

/**
 * StudentTimeline Component
 * Displays a horizontal timeline of student progress with milestones and events
 */
export default function StudentTimeline({ student, goals = [], progressLogs = [] }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterTypes, setFilterTypes] = useState(new Set(['goal', 'progress', 'milestone']));
  const [scrollPosition, setScrollPosition] = useState(0);
  const timelineRef = useRef(null);

  // Generate timeline events from goals and progress
  const timelineEvents = useMemo(() => {
    const events = [];

    // Add goal creation events
    goals.forEach(goal => {
      if (goal.created_at) {
        events.push({
          id: `goal-created-${goal.id}`,
          type: 'goal',
          subtype: 'created',
          date: goal.created_at,
          title: 'Goal Created',
          description: goal.description,
          icon: Target,
          color: 'blue',
          metadata: goal
        });
      }

      // Add goal completion/deadline events
      if (goal.target_date) {
        const isCompleted = goal.status === 'completed';
        events.push({
          id: `goal-deadline-${goal.id}`,
          type: 'goal',
          subtype: isCompleted ? 'completed' : 'deadline',
          date: goal.target_date,
          title: isCompleted ? 'Goal Completed' : 'Goal Deadline',
          description: goal.description,
          icon: isCompleted ? CheckCircle : Calendar,
          color: isCompleted ? 'green' : 'purple',
          metadata: goal
        });
      }
    });

    // Add progress log events
    progressLogs.forEach(log => {
      const goal = goals.find(g => g.id === log.goal_id);
      events.push({
        id: `progress-${log.id}`,
        type: 'progress',
        date: log.date,
        title: 'Progress Entry',
        description: log.notes || goal?.description || '',
        score: log.score,
        icon: TrendingUp,
        color: log.score >= 80 ? 'green' : log.score >= 60 ? 'yellow' : 'red',
        metadata: { ...log, goal }
      });
    });

    // Add milestone events (achievements when score reaches thresholds)
    const milestones = detectMilestones(progressLogs, goals);
    milestones.forEach(milestone => {
      events.push({
        id: `milestone-${milestone.id}`,
        type: 'milestone',
        date: milestone.date,
        title: milestone.title,
        description: milestone.description,
        icon: Award,
        color: 'gold',
        metadata: milestone
      });
    });

    // Sort by date
    return events.sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateA - dateB;
    });
  }, [goals, progressLogs]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return timelineEvents.filter(event => filterTypes.has(event.type));
  }, [timelineEvents, filterTypes]);

  // Calculate timeline bounds
  const timelineBounds = useMemo(() => {
    if (filteredEvents.length === 0) {
      return {
        start: new Date(),
        end: new Date(),
        totalDays: 0
      };
    }

    const dates = filteredEvents.map(e => parseISO(e.date));
    const start = min(dates);
    const end = max(dates);
    const totalDays = Math.max(differenceInDays(end, start), 1);

    return { start, end, totalDays };
  }, [filteredEvents]);

  // Calculate event positions
  const eventPositions = useMemo(() => {
    return filteredEvents.map(event => {
      const eventDate = parseISO(event.date);
      const daysFromStart = differenceInDays(eventDate, timelineBounds.start);
      const position = (daysFromStart / timelineBounds.totalDays) * 100;
      return { ...event, position };
    });
  }, [filteredEvents, timelineBounds]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.5, 0.5));

  // Scroll handlers
  const handleScrollLeft = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (timelineRef.current) {
      timelineRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Toggle filter
  const toggleFilter = (type) => {
    setFilterTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Export as image
  const handleExport = () => {
    // Would implement html2canvas or similar for image export
    console.log('Export timeline as image');
  };

  if (!student) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">No student selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Student Timeline</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {student.name} - {filteredEvents.length} events
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Zoom Controls */}
              <div className="flex gap-1 border rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="px-2 py-1 text-sm font-medium">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              {/* Filter */}
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={filterTypes.has('goal') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => toggleFilter('goal')}
                >
                  Goals
                </Button>
                <Button
                  variant={filterTypes.has('progress') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => toggleFilter('progress')}
                >
                  Progress
                </Button>
                <Button
                  variant={filterTypes.has('milestone') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => toggleFilter('milestone')}
                >
                  Milestones
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No timeline events to display</p>
              <p className="text-sm text-gray-400 mt-1">
                Add goals and progress logs to see the student's journey
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Scroll Controls */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleScrollLeft}
                  className="rounded-full shadow-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleScrollRight}
                  className="rounded-full shadow-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Timeline Container */}
              <div
                ref={timelineRef}
                className="overflow-x-auto pb-4 px-12"
                style={{ scrollbarWidth: 'thin' }}
              >
                <div
                  className="relative min-h-[300px]"
                  style={{ width: `${100 * zoomLevel}%`, minWidth: '100%' }}
                >
                  {/* Timeline Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#65A39B] via-[#E3866B] to-[#65A39B] rounded-full" />

                  {/* Date Markers */}
                  <div className="absolute top-1/2 left-0 right-0 mt-8">
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>{format(timelineBounds.start, 'MMM d, yyyy')}</span>
                      <span>{format(timelineBounds.end, 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {/* Events */}
                  <AnimatePresence>
                    {eventPositions.map((event, index) => (
                      <TimelineEvent
                        key={event.id}
                        event={event}
                        index={index}
                        isSelected={selectedEvent?.id === event.id}
                        onClick={() => setSelectedEvent(event)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="border-2 border-[#65A39B]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${getColorClasses(selectedEvent.color).bg}`}>
                      <selectedEvent.icon className={`w-6 h-6 ${getColorClasses(selectedEvent.color).text}`} />
                    </div>
                    <div>
                      <CardTitle>{selectedEvent.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatEventDate(selectedEvent.date)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>

                  {selectedEvent.score !== undefined && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              selectedEvent.score >= 80 ? 'bg-green-500' :
                              selectedEvent.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${selectedEvent.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{selectedEvent.score}</span>
                      </div>
                    </div>
                  )}

                  {selectedEvent.metadata?.goal && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Related Goal</p>
                      <p className="text-sm text-gray-600">
                        {selectedEvent.metadata.goal.description}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <Badge variant="outline" className="capitalize">
                      {selectedEvent.type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Timeline Event Component
 */
function TimelineEvent({ event, index, isSelected, onClick }) {
  const colorClasses = getColorClasses(event.color);
  const isAbove = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      style={{ left: `${event.position}%` }}
      className="absolute top-1/2 -translate-x-1/2 cursor-pointer"
      onClick={onClick}
    >
      {/* Connecting Line */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-0.5 ${colorClasses.bg} ${
          isAbove ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
        style={{ height: '40px' }}
      />

      {/* Event Marker */}
      <motion.div
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative z-10 p-3 rounded-full border-4 border-white shadow-lg
          ${colorClasses.bg} ${isSelected ? 'ring-4 ring-[#65A39B]' : ''}
          transition-all
        `}
      >
        <event.icon className={`w-5 h-5 ${colorClasses.text}`} />
      </motion.div>

      {/* Event Card */}
      <motion.div
        initial={{ opacity: 0, y: isAbove ? 10 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 + 0.1 }}
        className={`
          absolute left-1/2 -translate-x-1/2 w-48
          ${isAbove ? 'bottom-full mb-16' : 'top-full mt-16'}
        `}
      >
        <div
          className={`
            p-3 rounded-lg shadow-md border-2 bg-white
            ${isSelected ? 'border-[#65A39B]' : colorClasses.border}
            hover:shadow-lg transition-all
          `}
        >
          <p className="text-xs font-semibold text-gray-900 mb-1 truncate">
            {event.title}
          </p>
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {event.description}
          </p>
          <p className="text-xs text-gray-500">
            {formatEventDate(event.date)}
          </p>
          {event.score !== undefined && (
            <div className="mt-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Score:</span>
                <span className="text-xs font-bold">{event.score}</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Helper Functions
 */

function getColorClasses(color) {
  const colors = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' },
    red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
    gold: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' }
  };
  return colors[color] || colors.blue;
}

function formatEventDate(dateString) {
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Detect milestones from progress logs
 */
function detectMilestones(progressLogs, goals) {
  const milestones = [];
  const sortedLogs = [...progressLogs].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateA - dateB;
  });

  // Group by goal
  const logsByGoal = {};
  sortedLogs.forEach(log => {
    if (!logsByGoal[log.goal_id]) {
      logsByGoal[log.goal_id] = [];
    }
    logsByGoal[log.goal_id].push(log);
  });

  // Detect milestones for each goal
  Object.entries(logsByGoal).forEach(([goalId, logs]) => {
    const goal = goals.find(g => g.id === parseInt(goalId));
    let hasReached50 = false;
    let hasReached75 = false;
    let hasReached90 = false;

    logs.forEach(log => {
      if (log.score >= 50 && !hasReached50) {
        hasReached50 = true;
        milestones.push({
          id: `milestone-50-${goalId}`,
          date: log.date,
          title: 'Halfway There!',
          description: `Reached 50% on: ${goal?.description || 'goal'}`,
          score: log.score
        });
      }
      if (log.score >= 75 && !hasReached75) {
        hasReached75 = true;
        milestones.push({
          id: `milestone-75-${goalId}`,
          date: log.date,
          title: 'Great Progress!',
          description: `Reached 75% on: ${goal?.description || 'goal'}`,
          score: log.score
        });
      }
      if (log.score >= 90 && !hasReached90) {
        hasReached90 = true;
        milestones.push({
          id: `milestone-90-${goalId}`,
          date: log.date,
          title: 'Almost There!',
          description: `Reached 90% on: ${goal?.description || 'goal'}`,
          score: log.score
        });
      }
    });
  });

  return milestones;
}
