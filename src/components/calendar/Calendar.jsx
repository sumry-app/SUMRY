import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Download,
  Filter,
  X,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  generateMonthGrid,
  generateWeekGrid,
  getEventsForDate,
  getEventsInRange,
  EVENT_TYPES,
  EVENT_COLORS,
  exportToICal,
  getNextMonth,
  getPreviousMonth,
  getNextWeek,
  getPreviousWeek,
  getNextDay,
  getPreviousDay,
  createEventFromGoal,
  createEventFromProgressLog,
  formatEventDate,
  getIEPDeadlines
} from '@/lib/calendarUtils';

const VIEW_MODES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

/**
 * Full-featured Calendar Component
 * Displays IEP meetings, goal deadlines, progress logs, and custom events
 */
export default function Calendar({ students = [], goals = [], progressLogs = [], onCreateEvent, onUpdateEvent, onDeleteEvent }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(VIEW_MODES.MONTH);
  const [selectedDate, setSelectedDate] = useState(null);
  const [customEvents, setCustomEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [filterTypes, setFilterTypes] = useState(new Set(Object.values(EVENT_TYPES)));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState(null);

  // Generate all events from different sources
  const allEvents = useMemo(() => {
    const events = [...customEvents];

    // Add goal deadline events
    goals.forEach(goal => {
      const student = students.find(s => s.id === goal.student_id);
      const event = createEventFromGoal(goal, student);
      if (event) events.push(event);
    });

    // Add progress log events
    progressLogs.forEach(log => {
      const goal = goals.find(g => g.id === log.goal_id);
      const student = students.find(s => s.id === goal?.student_id);
      const event = createEventFromProgressLog(log, goal, student);
      if (event) events.push(event);
    });

    // Add IEP meeting deadlines
    const iepDeadlines = getIEPDeadlines(students);
    iepDeadlines.forEach(deadline => {
      events.push({
        id: `iep-deadline-${deadline.studentId}`,
        type: EVENT_TYPES.IEP_MEETING,
        title: `IEP Meeting - ${deadline.studentName}`,
        description: `Annual IEP meeting deadline (${deadline.daysUntilDue} days)`,
        date: format(deadline.deadline, 'yyyy-MM-dd'),
        studentId: deadline.studentId,
        metadata: {
          status: deadline.status,
          lastMeeting: deadline.lastMeeting,
          daysUntilDue: deadline.daysUntilDue
        }
      });
    });

    return events;
  }, [goals, progressLogs, students, customEvents]);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => filterTypes.has(event.type));
  }, [allEvents, filterTypes]);

  // Get calendar grid based on view mode
  const calendarGrid = useMemo(() => {
    switch (viewMode) {
      case VIEW_MODES.MONTH:
        return generateMonthGrid(currentDate);
      case VIEW_MODES.WEEK:
        return [generateWeekGrid(currentDate)];
      case VIEW_MODES.DAY:
        return [[{ date: currentDate, isToday: true }]];
      default:
        return generateMonthGrid(currentDate);
    }
  }, [currentDate, viewMode]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    switch (viewMode) {
      case VIEW_MODES.MONTH:
        setCurrentDate(getPreviousMonth(currentDate));
        break;
      case VIEW_MODES.WEEK:
        setCurrentDate(getPreviousWeek(currentDate));
        break;
      case VIEW_MODES.DAY:
        setCurrentDate(getPreviousDay(currentDate));
        break;
    }
  }, [currentDate, viewMode]);

  const handleNext = useCallback(() => {
    switch (viewMode) {
      case VIEW_MODES.MONTH:
        setCurrentDate(getNextMonth(currentDate));
        break;
      case VIEW_MODES.WEEK:
        setCurrentDate(getNextWeek(currentDate));
        break;
      case VIEW_MODES.DAY:
        setCurrentDate(getNextDay(currentDate));
        break;
    }
  }, [currentDate, viewMode]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Event handlers
  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
    setIsCreateMode(true);
    setSelectedEvent({
      title: '',
      description: '',
      date: format(date, 'yyyy-MM-dd'),
      type: EVENT_TYPES.CUSTOM,
      time: '09:00',
      location: '',
      studentId: ''
    });
    setIsEventDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsCreateMode(false);
    setIsEventDialogOpen(true);
  }, []);

  const handleSaveEvent = useCallback((eventData) => {
    if (isCreateMode) {
      const newEvent = {
        ...eventData,
        id: `custom-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setCustomEvents(prev => [...prev, newEvent]);
      onCreateEvent?.(newEvent);
    } else {
      setCustomEvents(prev =>
        prev.map(e => e.id === selectedEvent.id ? { ...e, ...eventData } : e)
      );
      onUpdateEvent?.(selectedEvent.id, eventData);
    }
    setIsEventDialogOpen(false);
  }, [isCreateMode, selectedEvent, onCreateEvent, onUpdateEvent]);

  const handleDeleteEvent = useCallback(() => {
    if (selectedEvent && selectedEvent.id.startsWith('custom-')) {
      setCustomEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      onDeleteEvent?.(selectedEvent.id);
      setIsEventDialogOpen(false);
    }
  }, [selectedEvent, onDeleteEvent]);

  const handleExportICal = useCallback(() => {
    exportToICal(filteredEvents, `sumry-calendar-${format(currentDate, 'yyyy-MM')}.ics`);
  }, [filteredEvents, currentDate]);

  // Drag and drop handlers
  const handleDragStart = useCallback((event, e) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((date, e) => {
    e.preventDefault();
    if (draggedEvent && draggedEvent.id.startsWith('custom-')) {
      const newDate = format(date, 'yyyy-MM-dd');
      setCustomEvents(prev =>
        prev.map(evt =>
          evt.id === draggedEvent.id ? { ...evt, date: newDate } : evt
        )
      );
      onUpdateEvent?.(draggedEvent.id, { date: newDate });
    }
    setDraggedEvent(null);
  }, [draggedEvent, onUpdateEvent]);

  // Toggle filter
  const toggleFilter = useCallback((type) => {
    setFilterTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CalendarIcon className="w-8 h-8 text-[#65A39B]" />
              <div>
                <CardTitle className="text-2xl">Calendar</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {viewMode === VIEW_MODES.MONTH && format(currentDate, 'MMMM yyyy')}
                  {viewMode === VIEW_MODES.WEEK && `Week of ${format(currentDate, 'MMM d, yyyy')}`}
                  {viewMode === VIEW_MODES.DAY && format(currentDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Selector */}
              <div className="flex gap-1 border rounded-lg p-1">
                {Object.values(VIEW_MODES).map(mode => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="capitalize"
                  >
                    {mode}
                  </Button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-1 border rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleToday}>
                  Today
                </Button>
                <Button variant="ghost" size="sm" onClick={handleNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportICal}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t overflow-hidden"
            >
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  <Label className="w-full text-sm font-medium mb-2">Show Events:</Label>
                  {Object.entries(EVENT_TYPES).map(([key, value]) => {
                    const colors = EVENT_COLORS[value];
                    return (
                      <button
                        key={value}
                        onClick={() => toggleFilter(value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all ${
                          filterTypes.has(value)
                            ? `${colors.bg} ${colors.text} ${colors.border}`
                            : 'bg-gray-100 text-gray-400 border-gray-300'
                        }`}
                      >
                        {key.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day Headers */}
          {viewMode === VIEW_MODES.MONTH && (
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
          )}

          {/* Calendar Cells */}
          <div className="space-y-2">
            {calendarGrid.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {week.map((day, dayIndex) => {
                  const dayEvents = getEventsForDate(filteredEvents, day.date);
                  const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd');

                  return (
                    <CalendarDay
                      key={dayIndex}
                      day={day}
                      events={dayEvents}
                      isSelected={isSelected}
                      viewMode={viewMode}
                      onClick={() => handleDateClick(day.date)}
                      onEventClick={handleEventClick}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(day.date, e)}
                      onDragStart={handleDragStart}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Dialog */}
      <EventDialog
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        event={selectedEvent}
        isCreateMode={isCreateMode}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        students={students}
      />
    </div>
  );
}

/**
 * Calendar Day Cell Component
 */
function CalendarDay({ day, events, isSelected, viewMode, onClick, onEventClick, onDragOver, onDrop, onDragStart }) {
  const isMonthView = viewMode === VIEW_MODES.MONTH;

  return (
    <motion.div
      whileHover={{ scale: isMonthView ? 1.02 : 1 }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`
        relative min-h-[100px] p-2 rounded-lg border-2 cursor-pointer transition-all
        ${day.isToday ? 'border-[#65A39B] bg-[#65A39B]/5' : 'border-gray-200'}
        ${isSelected ? 'ring-2 ring-[#65A39B] ring-offset-2' : ''}
        ${!day.isCurrentMonth && isMonthView ? 'opacity-40' : ''}
        ${day.isPast && !day.isToday ? 'bg-gray-50' : 'bg-white'}
        hover:border-[#65A39B]/50 hover:shadow-md
      `}
    >
      {/* Date Number */}
      <div className={`
        text-sm font-semibold mb-2
        ${day.isToday ? 'text-[#65A39B]' : day.isPast ? 'text-gray-400' : 'text-gray-700'}
      `}>
        {format(day.date, 'd')}
        {day.isToday && (
          <span className="ml-1 px-2 py-0.5 bg-[#65A39B] text-white text-xs rounded-full">
            Today
          </span>
        )}
      </div>

      {/* Events */}
      <div className="space-y-1">
        {events.slice(0, 3).map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            draggable={event.id.startsWith('custom-')}
            onDragStart={(e) => onDragStart(event, e)}
            onClick={(e) => onEventClick(event, e)}
            className={`
              px-2 py-1 rounded text-xs font-medium truncate cursor-pointer
              ${EVENT_COLORS[event.type]?.bg || 'bg-gray-100'}
              ${EVENT_COLORS[event.type]?.text || 'text-gray-800'}
              border-l-2 ${EVENT_COLORS[event.type]?.border || 'border-gray-300'}
              hover:shadow-sm transition-shadow
            `}
          >
            {event.title}
          </motion.div>
        ))}
        {events.length > 3 && (
          <div className="text-xs text-gray-500 font-medium px-2">
            +{events.length - 3} more
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Event Dialog Component
 */
function EventDialog({ isOpen, onClose, event, isCreateMode, onSave, onDelete, students }) {
  const [formData, setFormData] = useState(event || {});

  useEffect(() => {
    if (event) {
      setFormData(event);
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const canEdit = isCreateMode || (event && event.id.startsWith('custom-'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? 'Create Event' : 'Event Details'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
              disabled={!canEdit}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={!canEdit}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.time || ''}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_TYPES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {key.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Student</Label>
            <Select
              value={formData.studentId || ''}
              onValueChange={(value) => setFormData({ ...formData, studentId: value })}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Event location"
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event description"
              rows={4}
              disabled={!canEdit}
            />
          </div>

          {event?.metadata && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700">Additional Information</p>
              {Object.entries(event.metadata).map(([key, value]) => (
                <div key={key} className="text-sm text-gray-600">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                  {typeof value === 'object' ? JSON.stringify(value) : value}
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2">
            {canEdit && !isCreateMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              {canEdit ? 'Cancel' : 'Close'}
            </Button>
            {canEdit && (
              <Button type="submit">
                {isCreateMode ? 'Create Event' : 'Save Changes'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
