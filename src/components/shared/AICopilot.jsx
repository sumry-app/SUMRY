import { useState, useEffect } from 'react';
import { Sparkles, X, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * AI Copilot - Floating AI assistant that provides contextual suggestions
 * This is the killer feature that makes SUMRY indispensable
 */
export default function AICopilot({ students, goals, progressLogs, currentView }) {
  const [isOpen, setIsOpen] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    // Generate smart suggestions based on current context
    const newSuggestions = generateSmartSuggestions();
    setSuggestions(newSuggestions);
  }, [students, goals, progressLogs, currentView]);

  const generateSmartSuggestions = () => {
    const suggestions = [];
    const now = new Date();

    // Check for students without recent progress
    students.forEach(student => {
      const studentGoals = goals.filter(g => g.studentId === student.id && g.status === 'active');
      studentGoals.forEach(goal => {
        const goalLogs = progressLogs.filter(log => log.goalId === goal.id);
        const latestLog = goalLogs.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO))[0];

        if (!latestLog) {
          suggestions.push({
            type: 'warning',
            icon: AlertTriangle,
            title: 'No Progress Data',
            message: `${student.name} has no progress logged for "${goal.description.substring(0, 40)}..."`,
            action: 'Log Progress',
            priority: 'high',
            studentId: student.id,
            goalId: goal.id
          });
        } else {
          const daysSinceLog = Math.floor((now - new Date(latestLog.dateISO)) / (1000 * 60 * 60 * 24));
          if (daysSinceLog > 14) {
            suggestions.push({
              type: 'reminder',
              icon: AlertTriangle,
              title: 'Progress Update Needed',
              message: `${student.name}'s last progress log was ${daysSinceLog} days ago`,
              action: 'Log Progress',
              priority: 'medium',
              studentId: student.id,
              goalId: goal.id
            });
          }
        }
      });
    });

    // Check for goals that are off-track
    goals.forEach(goal => {
      const goalLogs = progressLogs.filter(log => log.goalId === goal.id);
      if (goalLogs.length >= 3) {
        const recentScores = goalLogs.slice(-3).map(log => log.score);
        const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const progressPercent = ((avgScore - goal.baseline) / (goal.target - goal.baseline)) * 100;

        if (progressPercent < 50) {
          const student = students.find(s => s.id === goal.studentId);
          suggestions.push({
            type: 'insight',
            icon: TrendingUp,
            title: 'Goal May Need Adjustment',
            message: `${student?.name}'s goal is only ${progressPercent.toFixed(0)}% toward target. Consider revising the goal or trying new strategies.`,
            action: 'Review Goal',
            priority: 'high',
            studentId: goal.studentId,
            goalId: goal.id
          });
        }
      }
    });

    // Suggest using AI for new goals
    const aiGeneratedGoals = goals.filter(g => g.aiGenerated);
    if (aiGeneratedGoals.length === 0 && goals.length > 0) {
      suggestions.push({
        type: 'tip',
        icon: Sparkles,
        title: 'Try AI Goal Generation',
        message: 'Generate research-based IEP goals in seconds with our AI assistant!',
        action: 'Try AI Assistant',
        priority: 'low'
      });
    }

    // Check for students ready for goal completion
    goals.forEach(goal => {
      const goalLogs = progressLogs.filter(log => log.goalId === goal.id);
      if (goalLogs.length >= 3) {
        const recentScores = goalLogs.slice(-5).map(log => log.score);
        const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

        if (avgRecent >= goal.target * 0.95 && goal.status === 'active') {
          const student = students.find(s => s.id === goal.studentId);
          suggestions.push({
            type: 'success',
            icon: CheckCircle,
            title: 'Goal Nearly Met!',
            message: `${student?.name} has achieved ${(avgRecent/goal.target*100).toFixed(0)}% of their target. Consider marking this goal as completed.`,
            action: 'Complete Goal',
            priority: 'medium',
            studentId: goal.studentId,
            goalId: goal.id
          });
        }
      }
    });

    // Smart workflow suggestions based on current view
    if (currentView === 'dashboard' && students.length === 0) {
      suggestions.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Get Started',
        message: 'Add your first student to begin tracking IEP goals and progress.',
        action: 'Add Student',
        priority: 'high'
      });
    }

    // Suggest weekly review
    const lastReviewKey = 'sumry_last_review';
    const lastReview = localStorage.getItem(lastReviewKey);
    if (!lastReview || (now - new Date(lastReview)) > 7 * 24 * 60 * 60 * 1000) {
      suggestions.push({
        type: 'tip',
        icon: MessageSquare,
        title: 'Weekly Review',
        message: 'Take 5 minutes to review all student progress and plan next steps.',
        action: 'Start Review',
        priority: 'medium'
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 5);
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'warning': return 'border-l-red-500 bg-red-50';
      case 'reminder': return 'border-l-yellow-500 bg-yellow-50';
      case 'insight': return 'border-l-blue-500 bg-blue-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'tip': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-coral-500 to-coral-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Open AI Copilot"
      >
        <Sparkles className="w-6 h-6" />
        {suggestions.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
            {suggestions.length}
          </span>
        )}
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          AI Copilot
        </span>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-h-[600px] shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-500 to-coral-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <div>
              <h3 className="font-semibold">AI Copilot</h3>
              <p className="text-xs opacity-90">Your intelligent assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            aria-label="Close AI Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {isThinking ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Sparkles className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Analyzing your data...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
            <p className="text-sm font-medium">All caught up! 🎉</p>
            <p className="text-xs mt-1">No urgent actions needed right now.</p>
          </div>
        ) : (
          suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <div
                key={index}
                className={`border-l-4 rounded-lg p-3 transition-all duration-200 hover:shadow-md ${getSuggestionColor(suggestion.type)}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{suggestion.title}</h4>
                    <p className="text-xs text-gray-700 mb-2">{suggestion.message}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => {
                        // Handle suggestion action
                        if (suggestion.action === 'Add Student') {
                          document.querySelector('[data-action="add-student"]')?.click();
                        } else if (suggestion.action === 'Log Progress') {
                          document.querySelector('[data-action="log-progress"]')?.click();
                        } else if (suggestion.action === 'Try AI Assistant') {
                          document.querySelector('[data-action="ai-assistant"]')?.click();
                        }
                      }}
                    >
                      {suggestion.action}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          💡 Powered by AI • Updates in real-time
        </p>
      </div>
    </Card>
  );
}
