import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Download, Upload, Trash2, Save, TrendingUp, Calendar, Edit, Eye,
  ChevronRight, Plus, Copy, Bell, Share2, Camera, Clock, Users,
  AlertTriangle, CheckCircle, XCircle, Mail, Printer, BarChart3,
  Sparkles, Globe, Zap, Shield, DollarSign, Wifi, WifiOff,
  MessageSquare, FileText, Languages, Video, Award, BookOpen, Filter, LogOut, User, Search
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend } from 'recharts';
import {
  uid,
  createTimestamp,
  formatTimestamp,
  normalizeStoreData,
  exportJSON,
  exportCSV,
  parseScore,
  calculateTrendline,
  getProgressStatus
} from "@/lib/data";
import { usePersistentStore } from "@/hooks/usePersistentStore";

const usersStorageKey = "sumry_users_v1";
const currentUserKey = "sumry_current_user";

// ========== SHARED COMPONENTS ==========
function ConfirmButton({ onConfirm, children, variant, size = "sm" }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 2500);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <Button size={size} variant={variant || (armed ? "destructive" : "ghost")} onClick={() => armed ? onConfirm() : setArmed(true)}>
      {armed ? "Confirm?" : children}
    </Button>
  );
}

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-indigo-900/40 flex items-center gap-2">
        <WifiOff className="h-4 w-4" strokeWidth={2} />
        <span className="text-sm font-medium">Offline - Data will sync when online</span>
      </div>
    </div>
  );
}

// ========== AI FEATURES ==========
function AIGoalAssistant({ onGenerate, onClose, students }) {
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [area, setArea] = useState("Reading");
  const [studentLevel, setStudentLevel] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateGoal = () => {
    setGenerating(true);

    setTimeout(() => {
      const templates = {
        Reading: {
          fluency: { desc: "Student will read grade-level text at [X] words per minute with 95% accuracy", baseline: "60 WPM", target: "120 WPM", metric: "WPM" },
          comprehension: { desc: "Student will answer literal and inferential comprehension questions with 80% accuracy", baseline: "50%", target: "80%", metric: "% correct" },
          phonics: { desc: "Student will decode multisyllabic words using phonetic patterns with 90% accuracy", baseline: "60%", target: "90%", metric: "% correct" }
        },
        Math: {
          computation: { desc: "Student will solve 2-digit addition/subtraction with regrouping with 85% accuracy", baseline: "50%", target: "85%", metric: "% correct" },
          word_problems: { desc: "Student will solve 1-step word problems with 80% accuracy", baseline: "40%", target: "80%", metric: "% correct" },
          fluency: { desc: "Student will complete [X] math facts in 2 minutes", baseline: "10", target: "25", metric: "problems/2min" }
        },
        Writing: {
          composition: { desc: "Student will write a 5-sentence paragraph with topic sentence and details", baseline: "2 sentences", target: "5 sentences", metric: "sentences" },
          mechanics: { desc: "Student will use capitalization and punctuation with 85% accuracy", baseline: "50%", target: "85%", metric: "% correct" },
          spelling: { desc: "Student will spell grade-level words with 90% accuracy", baseline: "60%", target: "90%", metric: "% correct" }
        },
        Behavior: {
          attention: { desc: "Student will remain on-task for 20 minutes without redirection", baseline: "5 min", target: "20 min", metric: "minutes" },
          social: { desc: "Student will initiate positive peer interactions 3 times per day", baseline: "0", target: "3", metric: "interactions/day" },
          regulation: { desc: "Student will use coping strategies when frustrated in 4 of 5 opportunities", baseline: "1/5", target: "4/5", metric: "ratio" }
        }
      };

      const template = templates[area]?.[focusArea.toLowerCase()] || {
        desc: `Student will demonstrate improved ${focusArea} skills with 80% accuracy`,
        baseline: studentLevel || "Current level",
        target: "80%",
        metric: "% correct"
      };

      onGenerate({
        studentId,
        area,
        description: template.desc,
        baseline: template.baseline,
        target: template.target,
        metric: template.metric,
        aiGenerated: true
      });

      setGenerating(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-2xl border-white/40 rounded-3xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-600/40">
              <Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <DialogTitle>AI Goal Generator</DialogTitle>
              <p className="text-sm text-slate-500">Create measurable IEP goals instantly</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="bg-white/80 backdrop-blur-xl border-black/5">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Goal Area</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="bg-white/80 backdrop-blur-xl border-black/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Reading", "Math", "Writing", "Behavior", "Communication", "Social Skills", "Motor Skills"].map(a =>
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Focus Area</Label>
            <Input
              placeholder="e.g., fluency, computation, attention, phonics"
              value={focusArea}
              onChange={e => setFocusArea(e.target.value)}
              className="bg-white/80 backdrop-blur-xl border-black/5"
            />
          </div>

          <div>
            <Label>Current Level (Optional)</Label>
            <Input
              placeholder="e.g., reads 60 WPM, adds with 50% accuracy"
              value={studentLevel}
              onChange={e => setStudentLevel(e.target.value)}
              className="bg-white/80 backdrop-blur-xl border-black/5"
            />
          </div>

          <div className="p-4 bg-gradient-to-br from-sky-50 to-indigo-50 border border-indigo-200/60 rounded-2xl">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
              <div className="text-sm text-indigo-900">
                <strong>Pro Tip:</strong> The AI uses research-based goal templates. You can edit the generated goal before saving.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-200">
            Cancel
          </Button>
          <Button
            onClick={generateGoal}
            disabled={generating || !focusArea || !studentId}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white shadow-lg shadow-blue-600/30"
          >
            {generating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" strokeWidth={2}/>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" strokeWidth={2}/>
                Generate Goal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ========== GOAL MANAGEMENT ==========
function GoalTemplates({ onSelectTemplate }) {
  const templates = [
    {
      category: "Reading",
      templates: [
        { area: "Reading", description: "Student will read grade-level text with 95% accuracy", baseline: "80%", target: "95%", metric: "% accuracy" },
        { area: "Reading", description: "Student will read [X] words per minute", baseline: "60", target: "100", metric: "WPM" },
        { area: "Reading", description: "Student will answer comprehension questions with 80% accuracy", baseline: "50%", target: "80%", metric: "% correct" }
      ]
    },
    {
      category: "Math",
      templates: [
        { area: "Math", description: "Student will solve addition problems with 90% accuracy", baseline: "60%", target: "90%", metric: "% correct" },
        { area: "Math", description: "Student will complete [X] math facts in 2 minutes", baseline: "10", target: "25", metric: "problems/2min" },
        { area: "Math", description: "Student will solve word problems with 80% accuracy", baseline: "40%", target: "80%", metric: "% correct" }
      ]
    },
    {
      category: "Behavior",
      templates: [
        { area: "Behavior", description: "Student will remain on-task for 20 minutes", baseline: "5 min", target: "20 min", metric: "minutes" },
        { area: "Behavior", description: "Student will follow 3-step directions with 80% accuracy", baseline: "40%", target: "80%", metric: "% correct" },
        { area: "Behavior", description: "Student will request a break appropriately 4 out of 5 times", baseline: "1/5", target: "4/5", metric: "ratio" }
      ]
    }
  ];

  return (
    <Dialog open={true} onOpenChange={() => onSelectTemplate(null)}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Goal Templates</DialogTitle>
          <p className="text-sm text-slate-500">Select a template to customize</p>
        </DialogHeader>
        <div className="space-y-4">
          {templates.map(category => (
            <div key={category.category}>
              <h4 className="font-semibold text-slate-900 mb-2">{category.category}</h4>
              <div className="space-y-2">
                {category.templates.map((template, i) => (
                  <Card key={i} className="cursor-pointer hover:bg-accent transition-colors border-black/5" onClick={() => onSelectTemplate(template)}>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-slate-900">{template.description}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Baseline: {template.baseline} → Target: {template.target} ({template.metric})
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditGoalDialog({ goal, students, onSave, onClose }) {
  const [studentId, setStudentId] = useState(goal?.studentId || students[0]?.id || "");
  const [area, setArea] = useState(goal?.area || "Reading");
  const [description, setDescription] = useState(goal?.description || "");
  const [baseline, setBaseline] = useState(goal?.baseline || "");
  const [target, setTarget] = useState(goal?.target || "");
  const [metric, setMetric] = useState(goal?.metric || "% correct");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleTemplateSelect = (template) => {
    if (template) {
      setArea(template.area);
      setDescription(template.description);
      setBaseline(template.baseline);
      setTarget(template.target);
      setMetric(template.metric);
    }
    setShowTemplates(false);
  };

  const handleAIGenerate = (aiGoal) => {
    setArea(aiGoal.area);
    setDescription(aiGoal.description);
    setBaseline(aiGoal.baseline);
    setTarget(aiGoal.target);
    setMetric(aiGoal.metric);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{goal ? "Edit Goal" : "Add Goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!goal && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAI(true)} className="flex-1 border-blue-200/60 text-blue-600 hover:bg-blue-50">
                  <Sparkles className="h-4 w-4 mr-2" strokeWidth={2}/>AI Assistant
                </Button>
                <Button variant="outline" onClick={() => setShowTemplates(true)} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" strokeWidth={2}/>Templates
                </Button>
              </div>
            )}
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="bg-white/80 backdrop-blur-xl border-black/5"><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="bg-white/80 backdrop-blur-xl border-black/5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Reading", "Math", "Writing", "Behavior", "Communication", "Social Skills", "Motor Skills"].map(a =>
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Textarea placeholder="Goal description (be specific and measurable)" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="bg-white/80 backdrop-blur-xl border-black/5" />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Baseline" value={baseline} onChange={e => setBaseline(e.target.value)} className="bg-white/80 backdrop-blur-xl border-black/5" />
              <Input placeholder="Target" value={target} onChange={e => setTarget(e.target.value)} className="bg-white/80 backdrop-blur-xl border-black/5" />
              <Input placeholder="Metric" value={metric} onChange={e => setMetric(e.target.value)} className="bg-white/80 backdrop-blur-xl border-black/5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => {
              const trimmedDescription = description.trim();
              const trimmedBaseline = baseline.trim();
              const trimmedTarget = target.trim();
              const trimmedMetric = metric.trim();
              if (!studentId || !trimmedDescription) return;
              onSave({
                ...goal,
                id: goal?.id || uid(),
                studentId,
                area,
                description: trimmedDescription,
                baseline: trimmedBaseline,
                target: trimmedTarget,
                metric: trimmedMetric
              });
              onClose();
            }}>Save Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showTemplates && <GoalTemplates onSelectTemplate={handleTemplateSelect} />}
      {showAI && <AIGoalAssistant students={students} onGenerate={handleAIGenerate} onClose={() => setShowAI(false)} />}
    </>
  );
}

function GoalDetailDialog({ goal, student, logs, store, onClose }) {
  const sortedLogs = useMemo(() =>
    [...logs].sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [logs]
  );

  const chartData = useMemo(() =>
    sortedLogs.map(l => ({
      date: l.dateISO,
      score: parseScore(l.score),
      label: l.dateISO.slice(5)
    })).filter(d => d.score !== null),
    [sortedLogs]
  );

  const baseline = parseScore(goal.baseline);
  const target = parseScore(goal.target);
  const trendline = calculateTrendline(sortedLogs);
  const status = getProgressStatus(logs, goal.baseline, goal.target);

  const trendlineData = useMemo(() => {
    if (!trendline || chartData.length === 0) return [];
    return chartData.map((d, i) => ({
      ...d,
      trend: trendline.slope * i + trendline.intercept
    }));
  }, [trendline, chartData]);

  const generateProgressReport = () => {
    const recent = sortedLogs.slice(-3);
    const avgRecent = recent.reduce((sum, l) => sum + (parseScore(l.score) || 0), 0) / recent.length;

    let report = `Progress Report: ${student?.name}\n\n`;
    report += `Goal: ${goal.description}\n`;
    report += `Area: ${goal.area}\n`;
    report += `Baseline: ${goal.baseline} | Target: ${goal.target}\n\n`;
    report += `Data Points: ${logs.length}\n`;
    report += `Recent Average: ${avgRecent.toFixed(1)}\n`;
    report += `Status: ${status.label}\n\n`;
    report += `Recent Progress:\n`;
    recent.forEach(l => {
      report += `- ${l.dateISO}: ${l.score} ${goal.metric}\n`;
      if (l.notes) report += `  Notes: ${l.notes}\n`;
    });

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `progress-${student?.name}-${goal.area}-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Goal Progress Analysis</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="border-slate-200">{goal.area}</Badge>
              <span className="text-sm text-slate-600">{student?.name}</span>
              <Badge
                variant={status.color === 'green' ? 'default' : status.color === 'red' ? 'destructive' : 'secondary'}
                className="ml-auto"
              >
                {status.color === 'green' && <CheckCircle className="h-3 w-3 mr-1" strokeWidth={2}/>}
                {status.color === 'red' && <AlertTriangle className="h-3 w-3 mr-1" strokeWidth={2}/>}
                {status.label}
              </Badge>
            </div>
            <p className="font-medium text-slate-900">{goal.description}</p>
            <div className="flex gap-4 mt-2 text-sm text-slate-600">
              <span>Baseline: {goal.baseline || "—"}</span>
              <span>Target: {goal.target || "—"}</span>
              <span>{goal.metric}</span>
              <span className="ml-auto font-medium">{logs.length} data points</span>
            </div>
          </div>

          {logs.length < 7 && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200/60 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-indigo-500 mt-0.5 flex-shrink-0" strokeWidth={2} />
              <div>
                <div className="font-medium text-slate-900 text-sm">Need more data for statistical validity</div>
                <div className="text-slate-600 text-sm">Collect {7 - logs.length} more data points for reliable trends (7-12 recommended)</div>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-xl border-black/5">
              <CardContent className="p-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">Progress Chart with Trend Analysis</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendlineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} name="Actual Score" />
                    {trendline && <Line type="monotone" dataKey="trend" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Trend" />}
                    {baseline !== null && <ReferenceLine y={baseline} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Baseline', position: 'left', style: { fontSize: '11px' } }} />}
                    {target !== null && <ReferenceLine y={target} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Target', position: 'left', style: { fontSize: '11px' } }} />}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={generateProgressReport} className="border-slate-200">
              <Download className="h-4 w-4 mr-2" strokeWidth={2}/>Generate Report
            </Button>
            <Button variant="outline" onClick={() => {
              const url = `${window.location.origin}?share=${goal.id}`;
              navigator.clipboard.writeText(url);
              alert('Share link copied!');
            }} className="border-slate-200">
              <Share2 className="h-4 w-4 mr-2" strokeWidth={2}/>Share Link
            </Button>
          </div>

          <Card className="bg-white/80 backdrop-blur-xl border-black/5">
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">All Progress Logs ({logs.length})</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sortedLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-sm">{log.dateISO}</span>
                      <span className="text-sm text-slate-600">Score: {log.score || "—"}</span>
                    </div>
                    {log.notes && <p className="text-sm text-slate-600 mb-1">{log.notes}</p>}
                    {log.accommodationsUsed?.length > 0 && (
                      <div className="text-xs text-slate-500">
                        Accommodations: {log.accommodationsUsed.join(", ")}
                      </div>
                    )}
                    {log.evidence && (
                      <a href={log.evidence} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                        View evidence
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GoalsView({ store, setStore }) {
  const [studentFilter, setStudentFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [editDialog, setEditDialog] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const studentLookup = useMemo(() => {
    const map = new Map();
    store.students.forEach(student => {
      map.set(student.id, student.name);
    });
    return map;
  }, [store.students]);

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return store.goals.filter(g => {
      if (studentFilter !== "all" && g.studentId !== studentFilter) return false;
      if (areaFilter !== "all" && g.area !== areaFilter) return false;
      if (query) {
        const haystack = [
          g.description,
          g.area,
          studentLookup.get(g.studentId) || "",
          g.metric
        ].map(value => (value || "").toLowerCase()).join(" ");
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [store.goals, studentFilter, areaFilter, searchTerm, studentLookup]);

  const areas = useMemo(() =>
    [...new Set(store.goals.map(g => g.area))],
    [store.goals]
  );

  const handleSave = useCallback((goal) => {
    const now = createTimestamp();
    const goalWithTimestamps = {
      ...goal,
      createdAt: goal.createdAt || now
    };

    setStore(prev => ({
      ...prev,
      lastUpdated: now,
      goals: prev.goals.find(g => g.id === goalWithTimestamps.id)
        ? prev.goals.map(g => g.id === goalWithTimestamps.id ? goalWithTimestamps : g)
        : [goalWithTimestamps, ...prev.goals]
    }));
  }, [setStore]);

  const handleDelete = useCallback((id) => {
    setStore(prev => ({
      ...prev,
      lastUpdated: createTimestamp(),
      goals: prev.goals.filter(g => g.id !== id),
      logs: prev.logs.filter(l => l.goalId !== id)
    }));
  }, [setStore]);

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap items-center">
        <Select value={studentFilter} onValueChange={setStudentFilter}>
          <SelectTrigger className="w-48 bg-white/80 backdrop-blur-xl border-black/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All students</SelectItem>
            {store.students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger className="w-48 bg-white/80 backdrop-blur-xl border-black/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {areas.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={2} />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search goals..."
            className="pl-9 bg-white/80 backdrop-blur-xl border-black/5"
          />
        </div>
        <Button onClick={() => setEditDialog({})}>
          <Plus className="h-4 w-4 mr-2" strokeWidth={2}/>Add Goal
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-xl border-black/5"><CardContent className="p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-300" strokeWidth={2}/>
          <p className="text-slate-500 font-medium">
            {store.goals.length === 0 ? "No goals yet" : "No goals match your filters"}
          </p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(g => {
            const logs = store.logs.filter(l => l.goalId === g.id);
            const student = store.students.find(s => s.id === g.studentId);
            const status = getProgressStatus(logs, g.baseline, g.target);

            return (
              <Card key={g.id} className="bg-white/80 backdrop-blur-xl border-black/5 hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="border-slate-200">{g.area}</Badge>
                        <span className="text-sm font-medium text-slate-700">{student?.name}</span>
                        <Badge
                          variant={status.color === 'green' ? 'default' : status.color === 'red' ? 'destructive' : 'secondary'}
                          className="ml-2"
                        >
                          {status.color === 'green' && <CheckCircle className="h-3 w-3 mr-1" strokeWidth={2}/>}
                          {status.color === 'red' && <AlertTriangle className="h-3 w-3 mr-1" strokeWidth={2}/>}
                          {logs.length} logs
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-900 font-medium mb-2">{g.description}</p>
                      <div className="text-xs text-slate-500">
                        Baseline: {g.baseline || "—"} → Target: {g.target || "—"} ({g.metric})
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => setDetailsDialog(g)} className="text-slate-600 hover:text-slate-900">
                        <Eye className="h-4 w-4" strokeWidth={2}/>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditDialog(g)} className="text-slate-600 hover:text-slate-900">
                        <Edit className="h-4 w-4" strokeWidth={2}/>
                      </Button>
                      <ConfirmButton onConfirm={() => handleDelete(g.id)}>
                        <Trash2 className="h-4 w-4" strokeWidth={2}/>
                      </ConfirmButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {editDialog && (
        <EditGoalDialog
          goal={editDialog.id ? editDialog : null}
          students={store.students}
          onSave={handleSave}
          onClose={() => setEditDialog(null)}
        />
      )}

      {detailsDialog && (
        <GoalDetailDialog
          goal={detailsDialog}
          student={store.students.find(s => s.id === detailsDialog.studentId)}
          logs={store.logs.filter(l => l.goalId === detailsDialog.id)}
          store={store}
          onClose={() => setDetailsDialog(null)}
        />
      )}
    </div>
  );
}

// ========== PROGRESS LOGS ==========
function ProgressView({ store, setStore }) {
  const [goalFilter, setGoalFilter] = useState("all");
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");

  const filteredGoals = goalFilter === "all" ? store.goals : store.goals.filter(g => g.id === goalFilter);
  const goalLookup = useMemo(() => new Map(store.goals.map(goal => [goal.id, goal])), [store.goals]);
  const studentLookup = useMemo(() => new Map(store.students.map(student => [student.id, student])), [store.students]);
  const logsForExport = useMemo(() => goalFilter === "all" ? store.logs : store.logs.filter(log => log.goalId === goalFilter), [store.logs, goalFilter]);

  const exportLogsToCSV = useCallback(() => {
    if (logsForExport.length === 0) {
      alert('No logs to export for the current filters.');
      return;
    }

    const header = ["Date", "Student", "Goal", "Area", "Score", "Metric", "Notes", "Accommodations"];
    const rows = logsForExport.map(log => {
      const goal = goalLookup.get(log.goalId);
      const student = goal ? studentLookup.get(goal.studentId) : undefined;
      return [
        log.dateISO,
        student?.name || "",
        goal?.description || "",
        goal?.area || "",
        log.score,
        goal?.metric || "",
        log.notes || "",
        (log.accommodationsUsed || []).join("; ")
      ];
    });

    exportCSV([header, ...rows], `progress-logs-${goalFilter === 'all' ? 'all' : goalFilter}.csv`);
  }, [goalFilter, goalLookup, logsForExport, studentLookup]);

  const handleAddLog = () => {
    const trimmedScore = score.trim();
    if (goalFilter === "all" || !trimmedScore) return;

    const newLog = {
      id: uid(),
      goalId: goalFilter,
      dateISO,
      score: trimmedScore,
      notes: notes.trim(),
      accommodationsUsed: []
    };

    setStore(prev => ({
      ...prev,
      lastUpdated: createTimestamp(),
      logs: [newLog, ...prev.logs]
    }));

    setScore("");
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-xl border-black/5">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Log Progress</h3>
            <Button variant="outline" size="sm" onClick={exportLogsToCSV} className="border-slate-200">
              <Download className="h-4 w-4 mr-2" strokeWidth={2}/>Export Logs
            </Button>
          </div>
          <div className="space-y-4">
            <Select value={goalFilter} onValueChange={setGoalFilter}>
              <SelectTrigger className="bg-white/80 backdrop-blur-xl border-black/5">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All goals</SelectItem>
                {store.goals.map(g => {
                  const student = store.students.find(s => s.id === g.studentId);
                  return (
                    <SelectItem key={g.id} value={g.id}>
                      {student?.name} - {g.area}: {g.description.slice(0, 50)}...
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {goalFilter !== "all" && (
              <>
                <Input
                  type="date"
                  value={dateISO}
                  onChange={e => setDateISO(e.target.value)}
                  className="bg-white/80 backdrop-blur-xl border-black/5"
                />
                <Input
                  placeholder="Score (e.g., 85, 90%)"
                  value={score}
                  onChange={e => setScore(e.target.value)}
                  className="bg-white/80 backdrop-blur-xl border-black/5"
                />
                <Textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="bg-white/80 backdrop-blur-xl border-black/5"
                />
                <Button onClick={handleAddLog} className="w-full">
                  <Plus className="h-4 w-4 mr-2" strokeWidth={2}/>Log Progress
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredGoals.map(goal => {
          const logs = store.logs.filter(l => l.goalId === goal.id);
          const student = store.students.find(s => s.id === goal.studentId);

          return (
            <Card key={goal.id} className="bg-white/80 backdrop-blur-xl border-black/5">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="border-slate-200">{goal.area}</Badge>
                      <span className="text-sm font-medium text-slate-700">{student?.name}</span>
                    </div>
                    <p className="text-sm text-slate-900">{goal.description}</p>
                  </div>
                  <Badge variant="secondary">{logs.length} logs</Badge>
                </div>

                {logs.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-200">
                    {logs.slice(0, 3).map(log => (
                      <div key={log.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{log.dateISO}</span>
                        <span className="font-medium">{log.score} {goal.metric}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ========== STUDENTS VIEW ==========
function StudentsView({ store, setStore }) {
  const [editDialog, setEditDialog] = useState(null);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [disability, setDisability] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const sorted = [...store.students].sort((a, b) => a.name.localeCompare(b.name));
    if (!query) return sorted;
    return sorted.filter(student => {
      const haystack = [student.name, student.grade, student.disability]
        .map(value => (value || "").toLowerCase())
        .join(" ");
      return haystack.includes(query);
    });
  }, [store.students, searchTerm]);

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedGrade = grade.trim();
    const trimmedDisability = disability.trim();
    if (!trimmedName) return;

    if (editDialog?.id) {
      setStore(prev => ({
        ...prev,
        lastUpdated: createTimestamp(),
        students: prev.students.map(s => s.id === editDialog.id ? {
          ...s,
          name: trimmedName,
          grade: trimmedGrade,
          disability: trimmedDisability
        } : s)
      }));
    } else {
      const now = createTimestamp();
      const newStudent = { id: uid(), name: trimmedName, grade: trimmedGrade, disability: trimmedDisability, createdAt: now };
      setStore(prev => ({
        ...prev,
        lastUpdated: now,
        students: [newStudent, ...prev.students]
      }));
    }

    setEditDialog(null);
    setName("");
    setGrade("");
    setDisability("");
  };

  const handleDelete = (id) => {
    setStore(prev => ({
      ...prev,
      lastUpdated: createTimestamp(),
      students: prev.students.filter(s => s.id !== id),
      goals: prev.goals.filter(g => g.studentId !== id),
      logs: prev.logs.filter(l => {
        const goal = prev.goals.find(g => g.id === l.goalId);
        return goal?.studentId !== id;
      })
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">Students</h2>
        <div className="flex flex-1 md:flex-initial items-center gap-2 justify-end">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={2} />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search students..."
              className="pl-9 bg-white/80 backdrop-blur-xl border-black/5"
            />
          </div>
          <Button onClick={() => setEditDialog({})}>
            <Plus className="h-4 w-4 mr-2" strokeWidth={2}/>Add Student
          </Button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-xl border-black/5">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" strokeWidth={2}/>
            <p className="text-slate-500 font-medium">
              {store.students.length === 0 ? "No students yet" : "No students match your filters"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map(student => {
            const goalsCount = store.goals.filter(g => g.studentId === student.id).length;

            return (
              <Card key={student.id} className="bg-white/80 backdrop-blur-xl border-black/5 hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{student.name}</h3>
                      <p className="text-sm text-slate-600">Grade {student.grade}</p>
                    </div>
                    <Badge variant="secondary">{goalsCount} goals</Badge>
                  </div>
                  {student.disability && (
                    <p className="text-xs text-slate-500 mb-3">{student.disability}</p>
                  )}
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditDialog(student);
                      setName(student.name);
                      setGrade(student.grade);
                      setDisability(student.disability);
                    }} className="text-slate-600 hover:text-slate-900">
                      <Edit className="h-4 w-4" strokeWidth={2}/>
                    </Button>
                    <ConfirmButton onConfirm={() => handleDelete(student.id)}>
                      <Trash2 className="h-4 w-4" strokeWidth={2}/>
                    </ConfirmButton>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {editDialog && (
        <Dialog open={true} onOpenChange={() => setEditDialog(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>{editDialog.id ? "Edit Student" : "Add Student"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Student name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-white/80 backdrop-blur-xl border-black/5"
                />
              </div>
              <div>
                <Label>Grade</Label>
                <Input
                  placeholder="e.g., 3, 4, 5"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="bg-white/80 backdrop-blur-xl border-black/5"
                />
              </div>
              <div>
                <Label>Disability (Optional)</Label>
                <Input
                  placeholder="e.g., Specific Learning Disability, Autism"
                  value={disability}
                  onChange={e => setDisability(e.target.value)}
                  className="bg-white/80 backdrop-blur-xl border-black/5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ========== DASHBOARD ==========
function Dashboard({ store }) {
  const stats = useMemo(() => {
    const totalStudents = store.students.length;
    const totalGoals = store.goals.length;
    const totalLogs = store.logs.length;

    const onTrackGoals = store.goals.filter(g => {
      const logs = store.logs.filter(l => l.goalId === g.id);
      const status = getProgressStatus(logs, g.baseline, g.target);
      return status.status === 'on-track';
    }).length;

    return { totalStudents, totalGoals, totalLogs, onTrackGoals };
  }, [store]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h2>
        <p className="text-slate-600">Welcome to SUMRY - Your IEP Management System</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-600 text-white border-0 shadow-lg shadow-indigo-600/30 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-50 text-sm font-medium">Students</p>
                <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-50" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-600 to-slate-700 text-white border-0 shadow-lg shadow-slate-900/30 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-50 text-sm font-medium">Goals</p>
                <p className="text-3xl font-bold mt-1">{stats.totalGoals}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-50" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-600/25 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-50 text-sm font-medium">Progress Logs</p>
                <p className="text-3xl font-bold mt-1">{stats.totalLogs}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-50" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-700 to-indigo-600 text-white border-0 shadow-lg shadow-indigo-900/30 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-50 text-sm font-medium">On Track</p>
                <p className="text-3xl font-bold mt-1">{stats.onTrackGoals}/{stats.totalGoals}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-50" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>
      </div>

      {store.students.length === 0 && (
        <Card className="bg-gradient-to-br from-sky-50 to-indigo-50 border-indigo-200/60 rounded-2xl shadow-lg shadow-indigo-200/40">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                <Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Get Started with SUMRY</h3>
                <p className="text-indigo-800 mb-4">
                  Welcome! Start by adding your first student, then create IEP goals and track progress.
                </p>
                <ul className="space-y-2 text-sm text-indigo-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" strokeWidth={2} />
                    Add students in the Students tab
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" strokeWidth={2} />
                    Create goals using AI assistance or templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" strokeWidth={2} />
                    Log progress and analyze trends
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {store.goals.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-xl border-black/5">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {store.logs.slice(0, 5).map(log => {
                const goal = store.goals.find(g => g.id === log.goalId);
                const student = store.students.find(s => s.id === goal?.studentId);

                return (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" strokeWidth={2}/>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{student?.name}</p>
                        <p className="text-xs text-slate-600">{goal?.area} - {log.score}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{log.dateISO}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ========== AUTHENTICATION ==========
function hashPassword(password) {
  // Simple hash for demo purposes - in production, use proper encryption
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function loadUsers() {
  const raw = localStorage.getItem(usersStorageKey);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

function getCurrentUser() {
  const raw = localStorage.getItem(currentUserKey);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function persistCurrentUser(user) {
  if (user) {
    localStorage.setItem(currentUserKey, JSON.stringify(user));
  } else {
    localStorage.removeItem(currentUserKey);
  }
}

function LoginPage({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (isSignup && !name)) {
      setError("Please fill in all fields");
      return;
    }

    const users = loadUsers();

    if (isSignup) {
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        setError("Email already registered");
        return;
      }

      // Create new user
      const newUser = {
        id: uid(),
        email,
        name,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);
      persistCurrentUser(newUser);
      onLogin(newUser);
    } else {
      // Login
      const user = users.find(u => u.email === email);
      if (!user || user.passwordHash !== hashPassword(password)) {
        setError("Invalid email or password");
        return;
      }

      persistCurrentUser(user);
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100/40 via-blue-50/30 to-indigo-100/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-2xl border-white/40 rounded-3xl shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <Award className="h-10 w-10 text-white" strokeWidth={2}/>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">SUMRY</h1>
          <p className="text-center text-slate-600 mb-8">IEP Management System</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <Label>Name</Label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-white/80 backdrop-blur-xl border-black/5 rounded-xl"
                />
              </div>
            )}

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-white/80 backdrop-blur-xl border-black/5 rounded-xl"
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-white/80 backdrop-blur-xl border-black/5 rounded-xl"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full">
              {isSignup ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ========== MAIN APP ==========
export default function App() {
  const { store, setStore, replaceStore } = usePersistentStore();
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result);
        const normalized = normalizeStoreData(imported);
        const stamped = { ...normalized, lastUpdated: createTimestamp() };
        replaceStore(stamped);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Error importing file');
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleLogout = () => {
    persistCurrentUser(null);
    setCurrentUserState(null);
  };

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUserState} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100/40 via-blue-50/30 to-indigo-100/40">
      <OfflineIndicator />

      <div className="border-b bg-white/60 backdrop-blur-xl border-white/20 sticky top-0 z-40 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Award className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SUMRY</h1>
                <p className="text-xs text-slate-600">IEP Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => exportJSON(store)} size="sm" className="border-slate-200 rounded-xl">
                <Download className="h-4 w-4 mr-2" strokeWidth={2}/>Export
              </Button>
              <Button variant="outline" size="sm" className="border-slate-200 rounded-xl" onClick={() => document.getElementById('import-input')?.click()}>
                <Upload className="h-4 w-4 mr-2" strokeWidth={2}/>Import
              </Button>
              <input id="import-input" type="file" accept=".json" className="hidden" onChange={handleImport} />

              {store.lastUpdated && (
                <div className="hidden lg:flex flex-col text-right text-xs px-3 py-1.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 text-slate-500">
                  <span className="uppercase tracking-wide text-[10px] text-slate-400">Last updated</span>
                  <span className="text-slate-600 font-medium">{formatTimestamp(store.lastUpdated)}</span>
                </div>
              )}

              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40">
                  <User className="h-4 w-4 text-slate-600" strokeWidth={2}/>
                  <span className="text-sm font-medium text-slate-700">{currentUser.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-200 rounded-xl">
                  <LogOut className="h-4 w-4 mr-2" strokeWidth={2}/>Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/60 backdrop-blur-xl border border-white/40 p-1.5 shadow-lg shadow-black/5 rounded-2xl">
            <TabsTrigger value="dashboard" className="rounded-xl">
              <BarChart3 className="h-4 w-4 mr-2" strokeWidth={2}/>Dashboard
            </TabsTrigger>
            <TabsTrigger value="students" className="rounded-xl">
              <Users className="h-4 w-4 mr-2" strokeWidth={2}/>Students
            </TabsTrigger>
            <TabsTrigger value="goals" className="rounded-xl">
              <TrendingUp className="h-4 w-4 mr-2" strokeWidth={2}/>Goals
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-xl">
              <Calendar className="h-4 w-4 mr-2" strokeWidth={2}/>Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard store={store} />
          </TabsContent>

          <TabsContent value="students">
            <StudentsView store={store} setStore={setStore} />
          </TabsContent>

          <TabsContent value="goals">
            <GoalsView store={store} setStore={setStore} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressView store={store} setStore={setStore} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
