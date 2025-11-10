import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Minus, CheckCircle, XCircle, Circle, Save, Trash2,
  Target, Clock, User, MessageSquare, TrendingUp
} from 'lucide-react';

/**
 * TrialDataLogger - Feature #1: Goal-Level Data Logging
 *
 * Comprehensive trial-by-trial data collection for IEP goals
 * Tracks: trials, corrects, prompt levels, independence, notes
 * Designed for para-first workflow with mobile optimization
 */
export default function TrialDataLogger({
  student,
  goal,
  onSave,
  onCancel,
  existingLog = null
}) {
  const [trials, setTrials] = useState(existingLog?.trials || []);
  const [sessionNotes, setSessionNotes] = useState(existingLog?.notes || '');
  const [duration, setDuration] = useState(existingLog?.duration || 0);
  const [sessionType, setSessionType] = useState(existingLog?.sessionType || 'instruction');
  const [promptLevel, setPromptLevel] = useState('independent');
  const [startTime] = useState(Date.now());

  // Prompt hierarchy for data integrity
  const promptLevels = [
    { value: 'independent', label: 'Independent', color: 'bg-green-100 text-green-800', weight: 100 },
    { value: 'verbal', label: 'Verbal Prompt', color: 'bg-blue-100 text-blue-800', weight: 75 },
    { value: 'gesture', label: 'Gesture/Visual', color: 'bg-yellow-100 text-yellow-800', weight: 50 },
    { value: 'model', label: 'Model', color: 'bg-orange-100 text-orange-800', weight: 25 },
    { value: 'physical', label: 'Hand-over-Hand', color: 'bg-red-100 text-red-800', weight: 10 }
  ];

  const sessionTypes = [
    { value: 'instruction', label: 'Instruction' },
    { value: 'practice', label: 'Practice' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'generalization', label: 'Generalization' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  useEffect(() => {
    // Auto-update duration every second
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const addTrial = (correct) => {
    const trial = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      correct,
      promptLevel,
      independence: promptLevels.find(p => p.value === promptLevel)?.weight || 0
    };
    setTrials([...trials, trial]);
  };

  const removeTrial = (id) => {
    setTrials(trials.filter(t => t.id !== id));
  };

  const calculateStats = () => {
    if (trials.length === 0) return { correct: 0, accuracy: 0, avgIndependence: 0 };

    const correct = trials.filter(t => t.correct).length;
    const accuracy = Math.round((correct / trials.length) * 100);
    const avgIndependence = Math.round(
      trials.reduce((sum, t) => sum + t.independence, 0) / trials.length
    );

    return { correct, total: trials.length, accuracy, avgIndependence };
  };

  const handleSave = () => {
    const stats = calculateStats();
    const log = {
      id: existingLog?.id || `log_${Date.now()}`,
      studentId: student.id,
      goalId: goal.id,
      dateISO: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      trials,
      stats,
      sessionType,
      duration,
      notes: sessionNotes,
      paraId: 'current_user', // Will be replaced with actual user ID
      score: stats.accuracy // For backward compatibility with existing charts
    };
    onSave(log);
  };

  const stats = calculateStats();
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Header with Student & Goal Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">{student.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-gray-700">{goal.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatDuration(duration)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Type Selector */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-sm font-semibold mb-2 block">Session Type</Label>
          <Select value={sessionType} onValueChange={setSessionType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sessionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Trial Recording Interface */}
      <Card className="border-2 border-gray-200">
        <CardContent className="pt-6">
          <Label className="text-sm font-semibold mb-3 block">Prompt Level for Next Trial</Label>

          {/* Prompt Level Selector - Large touch-friendly buttons */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
            {promptLevels.map(level => (
              <button
                key={level.value}
                onClick={() => setPromptLevel(level.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  promptLevel === level.value
                    ? `${level.color} border-current scale-105`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-semibold">{level.label}</div>
                <div className="text-xs opacity-75">{level.weight}%</div>
              </button>
            ))}
          </div>

          {/* Add Trial Buttons - Extra large for mobile/para use */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => addTrial(true)}
              size="lg"
              className="h-24 bg-green-600 hover:bg-green-700 text-white text-xl font-bold"
            >
              <CheckCircle className="w-8 h-8 mr-3" />
              Correct
            </Button>
            <Button
              onClick={() => addTrial(false)}
              size="lg"
              variant="destructive"
              className="h-24 text-xl font-bold"
            >
              <XCircle className="w-8 h-8 mr-3" />
              Incorrect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trial History */}
      {trials.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-semibold">Trial History ({trials.length} trials)</Label>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">{stats.accuracy}%</span>
                </div>
                <span className="text-gray-500">
                  {stats.correct}/{stats.total} correct
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...trials].reverse().map((trial, index) => {
                const promptInfo = promptLevels.find(p => p.value === trial.promptLevel);
                return (
                  <div
                    key={trial.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-500">
                        #{trials.length - index}
                      </span>
                      {trial.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <Badge className={promptInfo?.color}>
                        {promptInfo?.label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(trial.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrial(trial.id)}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Statistics */}
      {trials.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <CardContent className="pt-6">
            <Label className="text-sm font-semibold mb-3 block">Session Statistics</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.accuracy}%</div>
                <div className="text-xs text-gray-600 mt-1">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.avgIndependence}%</div>
                <div className="text-xs text-gray-600 mt-1">Independence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{trials.length}</div>
                <div className="text-xs text-gray-600 mt-1">Trials</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Notes */}
      <Card>
        <CardContent className="pt-6">
          <Label className="text-sm font-semibold mb-2 block flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Session Notes
          </Label>
          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Notes about the session, student behavior, environmental factors, etc..."
            className="h-24"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={trials.length === 0}
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Session
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="h-12"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
