import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  TrendingUp,
  FileText,
  Search,
  Inbox,
  Calendar,
  Star,
  Award,
  Bell,
  Zap,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * EmptyState - Beautiful, helpful empty states
 *
 * Inspired by: Apple, Linear, Claude
 * Features:
 * - Context-specific illustrations
 * - Helpful guidance
 * - Clear call-to-action
 * - Beautiful animations
 */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items yet',
  description = 'Get started by creating your first item.',
  action,
  actionLabel = 'Get Started',
  secondaryAction,
  secondaryActionLabel,
  suggestions = [],
  illustration,
  className = ''
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {/* Icon/Illustration */}
      <motion.div variants={item}>
        {illustration ? (
          <div className="mb-6">{illustration}</div>
        ) : (
          <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Icon className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        variants={item}
        className="text-2xl font-bold text-gray-900 mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        variants={item}
        className="text-gray-600 max-w-md mb-6"
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div variants={item} className="flex gap-3">
          {action && (
            <Button onClick={action} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              {actionLabel}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction} variant="outline" size="lg">
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div variants={item} className="mt-8 w-full max-w-md">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick suggestions:</p>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={suggestion.action}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
                whileHover={{ x: 4 }}
              >
                {suggestion.icon && (
                  <div className="p-2 rounded-lg bg-white">
                    <suggestion.icon className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {suggestion.title}
                  </div>
                  {suggestion.description && (
                    <div className="text-xs text-gray-500">
                      {suggestion.description}
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Specialized empty states
export function NoStudentsEmpty({ onAddStudent }) {
  return (
    <EmptyState
      icon={Users}
      title="No students yet"
      description="Start building your caseload by adding your first student. You'll be able to track their goals and progress."
      action={onAddStudent}
      actionLabel="Add First Student"
      suggestions={[
        {
          icon: Users,
          title: 'Import from CSV',
          description: 'Bulk import students from a spreadsheet',
          action: () => console.log('Import CSV')
        },
        {
          icon: FileText,
          title: 'View tutorial',
          description: 'Learn how to get started with SUMRY',
          action: () => console.log('View tutorial')
        }
      ]}
    />
  );
}

export function NoGoalsEmpty({ studentName, onAddGoal }) {
  return (
    <EmptyState
      icon={Target}
      title={studentName ? `No goals for ${studentName}` : 'No goals yet'}
      description={
        studentName
          ? `Create IEP goals to start tracking ${studentName}'s progress.`
          : 'Create IEP goals to start tracking student progress.'
      }
      action={onAddGoal}
      actionLabel="Create Goal"
      suggestions={[
        {
          icon: Zap,
          title: 'Use AI suggestions',
          description: 'Get goal recommendations based on grade level',
          action: () => console.log('AI suggestions')
        }
      ]}
    />
  );
}

export function NoProgressDataEmpty({ goalDescription, onLogProgress }) {
  return (
    <EmptyState
      icon={TrendingUp}
      title="No progress data yet"
      description={
        goalDescription
          ? `Start logging data to track progress on this goal.`
          : 'Log your first data point to begin tracking progress.'
      }
      action={onLogProgress}
      actionLabel="Log Progress"
      suggestions={[
        {
          icon: Calendar,
          title: 'Set up daily reminder',
          description: 'Never forget to log data',
          action: () => console.log('Set reminder')
        }
      ]}
    />
  );
}

export function NoSearchResultsEmpty({ query, onClear }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
      action={onClear}
      actionLabel="Clear Search"
    />
  );
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon={Bell}
      title="You're all caught up!"
      description="No new notifications. Check back later for updates."
      className="py-12"
    />
  );
}

export function NoAchievementsEmpty() {
  return (
    <EmptyState
      icon={Award}
      title="No achievements yet"
      description="Keep logging data and completing tasks to unlock achievements and build your streak!"
      suggestions={[
        {
          icon: Zap,
          title: 'Log data daily',
          description: 'Build your streak and earn points',
          action: () => console.log('Log data')
        },
        {
          icon: Target,
          title: 'Complete a goal',
          description: 'Help a student reach their target',
          action: () => console.log('Complete goal')
        }
      ]}
    />
  );
}

export function NoReportsEmpty({ onGenerateReport }) {
  return (
    <EmptyState
      icon={FileText}
      title="No reports generated"
      description="Create your first report to share progress with parents and administrators."
      action={onGenerateReport}
      actionLabel="Generate Report"
      suggestions={[
        {
          icon: Star,
          title: 'Weekly summary',
          description: 'Quick overview of this week',
          action: () => console.log('Weekly summary')
        },
        {
          icon: TrendingUp,
          title: 'Progress report',
          description: 'Detailed student progress',
          action: () => console.log('Progress report')
        }
      ]}
    />
  );
}

export function NoAssignmentsEmpty({ onCreateAssignment }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No assignments yet"
      description="Assign goals to paras to enable data collection and build accountability."
      action={onCreateAssignment}
      actionLabel="Create Assignment"
    />
  );
}

// Error states
export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error. Please try again.',
  onRetry
}) {
  return (
    <EmptyState
      icon={Zap}
      title={title}
      description={description}
      action={onRetry}
      actionLabel="Try Again"
      className="py-12"
    />
  );
}

// Offline state
export function OfflineState() {
  return (
    <EmptyState
      icon={Zap}
      title="You're offline"
      description="Your changes will sync when you reconnect to the internet."
      className="py-12"
    />
  );
}

// Loading empty state (for initial load)
export function LoadingEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full mb-4"
      />
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}

// Generic content placeholder
export function ContentPlaceholder({ message = 'Content will appear here' }) {
  return (
    <div className="flex items-center justify-center py-12 px-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
      <p>{message}</p>
    </div>
  );
}

// Illustration components (SVG-based)
export function EmptyIllustration({ type = 'default' }) {
  const illustrations = {
    students: (
      <svg width="200" height="200" viewBox="0 0 200 200" className="text-gray-300">
        <circle cx="100" cy="80" r="30" fill="currentColor" opacity="0.5" />
        <circle cx="100" cy="150" r="40" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    goals: (
      <svg width="200" height="200" viewBox="0 0 200 200" className="text-blue-300">
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="100" cy="100" r="5" fill="currentColor" />
      </svg>
    ),
    default: null
  };

  return illustrations[type] || illustrations.default;
}
