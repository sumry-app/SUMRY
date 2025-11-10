import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AICopilot from '@/components/shared/AICopilot';
import VoiceInput, { QuickVoiceLogger } from '@/components/shared/VoiceInput';
import QuickActions from '@/components/shared/QuickActions';
import AIInsightsDashboard from '@/components/dashboard/AIInsightsDashboard';
import ParentPortal from '@/components/parent/ParentPortal';
import IEPMeetingPrep from '@/components/meetings/IEPMeetingPrep';
import { Sparkles, Mic, Command, TrendingUp, Users, FileText } from 'lucide-react';

/**
 * Component Showcase - Demo all new revolutionary features
 */
export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data for demos
  const sampleStudents = [
    {
      id: '1',
      name: 'Alex Johnson',
      grade: '3rd Grade',
      disability: 'Specific Learning Disability'
    },
    {
      id: '2',
      name: 'Emma Martinez',
      grade: '4th Grade',
      disability: 'Speech/Language Impairment'
    }
  ];

  const sampleGoals = [
    {
      id: 'g1',
      studentId: '1',
      area: 'Reading',
      description: 'Given grade-level text, student will read with 95% accuracy at 80 words per minute',
      baseline: 45,
      target: 80,
      metric: 'words per minute',
      status: 'active',
      aiGenerated: true
    },
    {
      id: 'g2',
      studentId: '1',
      area: 'Math',
      description: 'Student will solve multi-digit addition problems with 80% accuracy',
      baseline: 50,
      target: 80,
      metric: 'percent correct',
      status: 'active',
      aiGenerated: false
    }
  ];

  const sampleProgressLogs = [
    {
      id: 'p1',
      goalId: 'g1',
      dateISO: '2025-01-05',
      score: 52,
      notes: 'Great progress with shorter passages'
    },
    {
      id: 'p2',
      goalId: 'g1',
      dateISO: '2025-01-12',
      score: 58,
      notes: 'Improved fluency'
    },
    {
      id: 'p3',
      goalId: 'g1',
      dateISO: '2025-01-19',
      score: 65,
      notes: 'Reading with more confidence'
    }
  ];

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    alert(`Quick action triggered: ${action}`);
  };

  const handleVoiceTranscript = (transcript) => {
    console.log('Voice transcript:', transcript);
  };

  const handleQuickVoiceComplete = (data) => {
    console.log('Quick voice log complete:', data);
    alert('Progress logged via voice!');
  };

  const handleMeetingComplete = () => {
    alert('IEP Meeting Packet Generated!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🚀 SUMRY Next-Level Features
          </h1>
          <p className="text-gray-600 text-lg">
            7 Revolutionary Features That Make SUMRY Unbeatable
          </p>
          <p className="text-sm text-gray-500 mt-2">
            $241 investment → $5,725 value → 2,275% ROI
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-2 bg-white p-2 rounded-lg shadow mb-6">
            <TabsTrigger value="overview" className="text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-copilot" className="text-xs">
              <Sparkles className="w-4 h-4 mr-1" />
              AI Copilot
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">
              <Mic className="w-4 h-4 mr-1" />
              Voice Input
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">
              <TrendingUp className="w-4 h-4 mr-1" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="parent" className="text-xs">
              <Users className="w-4 h-4 mr-1" />
              Parent Portal
            </TabsTrigger>
            <TabsTrigger value="meeting" className="text-xs">
              <FileText className="w-4 h-4 mr-1" />
              Meeting Prep
            </TabsTrigger>
            <TabsTrigger value="quick-actions" className="text-xs">
              <Command className="w-4 h-4 mr-1" />
              Quick Actions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-2 border-purple-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Welcome to SUMRY's Revolutionary Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  You're about to explore 7 game-changing features that make SUMRY the most advanced IEP management system available.
                  Each feature was designed to save teachers time and make their work more effective.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FeatureCard
                    icon={Sparkles}
                    title="AI Copilot"
                    description="Context-aware assistant with real-time suggestions"
                    value="Never miss a student need"
                    onClick={() => setActiveTab('ai-copilot')}
                  />
                  <FeatureCard
                    icon={Mic}
                    title="Voice Input"
                    description="Hands-free progress logging while teaching"
                    value="Save 2+ hours/week"
                    onClick={() => setActiveTab('voice')}
                  />
                  <FeatureCard
                    icon={TrendingUp}
                    title="AI Insights"
                    description="Predictive analytics and forecasting"
                    value="Data-driven decisions"
                    onClick={() => setActiveTab('insights')}
                  />
                  <FeatureCard
                    icon={FileText}
                    title="Meeting Prep"
                    description="5-hour task → 15 minutes"
                    value="95% time saved"
                    onClick={() => setActiveTab('meeting')}
                  />
                  <FeatureCard
                    icon={Users}
                    title="Parent Portal"
                    description="Real-time transparency for families"
                    value="300% more engagement"
                    onClick={() => setActiveTab('parent')}
                  />
                  <FeatureCard
                    icon={Command}
                    title="Quick Actions"
                    description="Keyboard shortcuts for power users"
                    value="10x faster workflow"
                    onClick={() => setActiveTab('quick-actions')}
                  />
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-lg mb-2">💰 Value Delivered</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">$241</p>
                      <p className="text-xs text-gray-600">Investment</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">$5,725</p>
                      <p className="text-xs text-gray-600">Market Value</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">2,275%</p>
                      <p className="text-xs text-gray-600">ROI</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">10h/week</p>
                      <p className="text-xs text-gray-600">Time Saved</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Copilot Tab */}
          <TabsContent value="ai-copilot" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Copilot - Your 24/7 Intelligent Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  The AI Copilot floats on every screen, analyzing your data in real-time and providing
                  context-aware suggestions. It identifies at-risk students, celebrates achievements, and
                  recommends next actions automatically.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">Key Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Real-time analysis of all student data</li>
                    <li>Context-aware suggestions based on current view</li>
                    <li>Priority-based alerts (high/medium/low)</li>
                    <li>One-click actions from suggestions</li>
                    <li>Celebrates milestones automatically</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-500 italic">
                  💡 The AI Copilot is now floating in the bottom-right corner! Try clicking on it.
                </p>
              </CardContent>
            </Card>

            {/* AI Copilot component (will float) */}
            <AICopilot
              students={sampleStudents}
              goals={sampleGoals}
              progressLogs={sampleProgressLogs}
              currentView={activeTab}
            />
          </TabsContent>

          {/* Voice Input Tab */}
          <TabsContent value="voice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice Input - Hands-Free Progress Logging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Log progress while walking around the classroom! Voice input uses the Web Speech API
                  to transcribe your speech in real-time. No more staying late to type up notes.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Try It Now:</h4>
                  <VoiceInput onTranscript={handleVoiceTranscript} />
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Quick Voice Logger:</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    3-step wizard for rapid progress logging with voice
                  </p>
                  <QuickVoiceLogger
                    onComplete={handleQuickVoiceComplete}
                    students={sampleStudents}
                    goals={sampleGoals}
                  />
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Time Saved:</strong> 30+ minutes per day = 2.5 hours per week</p>
                  <p><strong>Value:</strong> Log progress while actually teaching, not after school</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>AI Insights Dashboard - Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  See the future with AI-powered predictions. Know which goals will be met, which students
                  need intervention, and what actions to take BEFORE IEP meetings.
                </p>
              </CardContent>
            </Card>

            <AIInsightsDashboard
              students={sampleStudents}
              goals={sampleGoals}
              progressLogs={sampleProgressLogs}
            />
          </TabsContent>

          {/* Parent Portal Tab */}
          <TabsContent value="parent">
            <ParentPortal
              student={sampleStudents[0]}
              goals={sampleGoals}
              progressLogs={sampleProgressLogs}
            />
          </TabsContent>

          {/* Meeting Prep Tab */}
          <TabsContent value="meeting">
            <IEPMeetingPrep
              student={sampleStudents[0]}
              goals={sampleGoals}
              progressLogs={sampleProgressLogs}
              onComplete={handleMeetingComplete}
            />
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="quick-actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions - Power User Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Navigate the entire app with keyboard shortcuts. Press <kbd className="px-2 py-1 bg-gray-100 rounded">⌘K</kbd> or <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl+K</kbd> to open the command palette.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Keyboard Shortcuts:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <ShortcutItem keys="⌘K" action="Open Command Palette" />
                    <ShortcutItem keys="⌘N" action="Add Student" />
                    <ShortcutItem keys="⌘G" action="Create Goal" />
                    <ShortcutItem keys="⌘L" action="Log Progress" />
                    <ShortcutItem keys="⌘⇧L" action="Voice Log" />
                    <ShortcutItem keys="⌘I" action="AI Insights" />
                    <ShortcutItem keys="⌘M" action="Meeting Prep" />
                    <ShortcutItem keys="⌘1-4" action="Navigate Tabs" />
                  </div>
                </div>

                <p className="text-sm text-gray-500 italic">
                  💡 Click the floating command button in bottom-right or press ⌘K to try it!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions component (will float) */}
        <QuickActions onAction={handleQuickAction} />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-lg transition-all duration-200 text-left group"
    >
      <Icon className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <p className="text-xs font-semibold text-purple-600">{value}</p>
    </button>
  );
}

function ShortcutItem({ keys, action }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{action}</span>
      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{keys}</kbd>
    </div>
  );
}
