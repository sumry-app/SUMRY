import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

/**
 * TutorialOverlay - Feature #28: Tutorial Overlay + In-App Tips
 *
 * Interactive onboarding walkthrough for new users
 * Context-sensitive tips for power features
 */

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: '👋 Welcome to SUMRY!',
    content: 'The most advanced IEP management system designed for special education teams. Let\'s take a quick tour!',
    position: 'center'
  },
  {
    id: 'dashboard',
    title: '📊 Your Dashboard',
    content: 'See progress at a glance. Track all students, goals, and recent activity in one place.',
    target: '[value="dashboard"]',
    position: 'bottom'
  },
  {
    id: 'students',
    title: '👥 Manage Students',
    content: 'Add students, track their IEP goals, and monitor progress over time.',
    target: '[value="students"]',
    position: 'bottom'
  },
  {
    id: 'goals',
    title: '🎯 IEP Goals',
    content: 'Create SMART IEP goals with AI assistance. Track baseline, target, and current performance.',
    target: '[value="goals"]',
    position: 'bottom'
  },
  {
    id: 'progress',
    title: '📈 Progress Tracking',
    content: 'Log data points, visualize trends, and generate progress reports.',
    target: '[value="progress"]',
    position: 'bottom'
  },
  {
    id: 'achievements',
    title: '🏆 Stay Motivated',
    content: 'Earn achievements and maintain streaks for consistent data collection!',
    target: '[value="achievements"]',
    position: 'bottom'
  },
  {
    id: 'ferpa',
    title: '🔒 Privacy Matters',
    content: 'View our FERPA compliance and data privacy practices. Your data is secure.',
    target: '[value="ferpa"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: '🎉 You\'re All Set!',
    content: 'Ready to transform your IEP management? Start by adding your first student!',
    position: 'center'
  }
];

export default function TutorialOverlay({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [show, setShow] = useState(true);

  const step = TUTORIAL_STEPS[currentStep];

  useEffect(() => {
    if (step.target && step.position !== 'center') {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 10,
          left: rect.left
        });
      }
    }
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setShow(false);
    localStorage.setItem('sumry_tutorial_completed', 'true');
    onComplete?.();
  };

  const handleSkip = () => {
    setShow(false);
    localStorage.setItem('sumry_tutorial_skipped', 'true');
    onSkip?.();
  };

  if (!show) return null;

  // Overlay for highlighting
  if (step.position !== 'center' && step.target) {
    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();

      return (
        <>
          {/* Dark overlay */}
          <div className="fixed inset-0 bg-black/50 z-[100]" onClick={handleSkip} />

          {/* Highlight ring */}
          <div
            className="fixed z-[101] pointer-events-none"
            style={{
              top: rect.top - 4,
              left: rect.left - 4,
              width: rect.width + 8,
              height: rect.height + 8,
              border: '4px solid #3b82f6',
              borderRadius: '12px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
            }}
          />

          {/* Tutorial card */}
          <Card
            className="fixed z-[102] shadow-2xl border-2 border-blue-500 animate-in fade-in slide-in-from-bottom-4"
            style={{
              top: position.top,
              left: position.left,
              maxWidth: '400px'
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg">{step.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-gray-700 mb-4">{step.content}</p>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </div>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={handlePrev}>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button size="sm" onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                    {currentStep < TUTORIAL_STEPS.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      'Get Started!'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      );
    }
  }

  // Center modal
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center" onClick={handleSkip}>
        <Card
          className="max-w-md mx-4 shadow-2xl border-2 border-blue-500 animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="pt-8 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-xl">{step.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-gray-700 mb-6 text-center">{step.content}</p>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrev}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                <Button size="sm" onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  {currentStep < TUTORIAL_STEPS.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    'Get Started!'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Helper function to check if tutorial should show
export function shouldShowTutorial() {
  const completed = localStorage.getItem('sumry_tutorial_completed');
  const skipped = localStorage.getItem('sumry_tutorial_skipped');
  return !completed && !skipped;
}

// Helper to reset tutorial
export function resetTutorial() {
  localStorage.removeItem('sumry_tutorial_completed');
  localStorage.removeItem('sumry_tutorial_skipped');
}
