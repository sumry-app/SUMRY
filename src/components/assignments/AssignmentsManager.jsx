import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Users, Target, Calendar, Plus, Edit, Trash2, Check, X, Search
} from 'lucide-react';

/**
 * AssignmentsManager - Feature #22: Assignments Table (goal ↔ para mapping)
 *
 * Manages which paras work with which students/goals
 * Critical for para-first workflow and oversight
 */
export default function AssignmentsManager({
  assignments,
  students,
  goals,
  paraStaff,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPara, setFilterPara] = useState('all');

  const [formData, setFormData] = useState({
    paraId: '',
    goalId: '',
    schedule: [],
    timeSlot: '',
    notes: ''
  });

  const weekDays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  const timeSlots = [
    'Anytime',
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM'
  ];

  const handleStartAdd = () => {
    setFormData({
      paraId: '',
      goalId: '',
      schedule: [1, 2, 3, 4, 5], // Default to weekdays
      timeSlot: 'Anytime',
      notes: ''
    });
    setIsAdding(true);
  };

  const handleStartEdit = (assignment) => {
    setFormData({
      paraId: assignment.paraId,
      goalId: assignment.goalId,
      schedule: assignment.schedule,
      timeSlot: assignment.timeSlot || 'Anytime',
      notes: assignment.notes || ''
    });
    setEditingId(assignment.id);
  };

  const handleSave = () => {
    if (!formData.paraId || !formData.goalId) {
      alert('Please select both a para and a goal');
      return;
    }

    if (editingId) {
      onUpdateAssignment(editingId, formData);
      setEditingId(null);
    } else {
      onAddAssignment({
        ...formData,
        id: `assignment_${Date.now()}`,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
    }

    setFormData({ paraId: '', goalId: '', schedule: [], timeSlot: '', notes: '' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ paraId: '', goalId: '', schedule: [], timeSlot: '', notes: '' });
  };

  const toggleDay = (day) => {
    if (formData.schedule.includes(day)) {
      setFormData({
        ...formData,
        schedule: formData.schedule.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        schedule: [...formData.schedule, day].sort()
      });
    }
  };

  // Filter and search assignments
  const filteredAssignments = assignments.filter(assignment => {
    const para = paraStaff.find(p => p.id === assignment.paraId);
    const goal = goals.find(g => g.id === assignment.goalId);
    const student = students.find(s => s.id === goal?.studentId);

    if (filterPara !== 'all' && assignment.paraId !== filterPara) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        para?.name.toLowerCase().includes(searchLower) ||
        student?.name.toLowerCase().includes(searchLower) ||
        goal?.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Para Assignments</h2>
          <p className="text-gray-600">Manage goal and student assignments for paraprofessionals</p>
        </div>
        <Button onClick={handleStartAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm font-semibold">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by para, student, or goal..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block text-sm font-semibold">Filter by Para</Label>
              <Select value={filterPara} onValueChange={setFilterPara}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Paras</SelectItem>
                  {paraStaff.map(para => (
                    <SelectItem key={para.id} value={para.id}>
                      {para.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">
              {editingId ? 'Edit Assignment' : 'New Assignment'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Para Staff *</Label>
                  <Select
                    value={formData.paraId}
                    onValueChange={(value) => setFormData({ ...formData, paraId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select para..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paraStaff.map(para => (
                        <SelectItem key={para.id} value={para.id}>
                          {para.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Goal *</Label>
                  <Select
                    value={formData.goalId}
                    onValueChange={(value) => setFormData({ ...formData, goalId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map(goal => {
                        const student = students.find(s => s.id === goal.studentId);
                        return (
                          <SelectItem key={goal.id} value={goal.id}>
                            {student?.name} - {goal.description.slice(0, 50)}...
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Schedule (Days of Week)</Label>
                <div className="flex gap-2">
                  {weekDays.map(day => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        formData.schedule.includes(day.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Time Slot</Label>
                <Select
                  value={formData.timeSlot}
                  onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Notes</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special instructions or notes..."
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No assignments found. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map(assignment => {
            const para = paraStaff.find(p => p.id === assignment.paraId);
            const goal = goals.find(g => g.id === assignment.goalId);
            const student = students.find(s => s.id === goal?.studentId);

            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-gray-900">{para?.name}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">{student?.name}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-3">
                        <Target className="w-4 h-4 text-gray-500 mt-1" />
                        <div className="text-sm text-gray-700">{goal?.description}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          {assignment.schedule.map(d => weekDays.find(w => w.value === d)?.label).join(', ')}
                        </Badge>
                        <Badge variant="outline">{assignment.timeSlot || 'Anytime'}</Badge>
                        {goal?.area && <Badge variant="outline">{goal.area}</Badge>}
                      </div>

                      {assignment.notes && (
                        <div className="text-xs text-gray-600 mt-2 italic">
                          Note: {assignment.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStartEdit(assignment)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this assignment?')) {
                            onDeleteAssignment(assignment.id);
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{assignments.length}</div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {new Set(assignments.map(a => a.paraId)).size}
              </div>
              <div className="text-sm text-gray-600">Active Paras</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {new Set(assignments.map(a => a.goalId)).size}
              </div>
              <div className="text-sm text-gray-600">Goals Covered</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
