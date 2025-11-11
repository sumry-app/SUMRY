import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';

/**
 * LoadingStates - Beautiful loading animations and skeleton screens
 *
 * Components:
 * - Skeleton screens for content
 * - Spinner loaders
 * - Progress indicators
 * - Shimmer effects
 * - Pulse animations
 */

// Shimmer animation for skeletons
const shimmer = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut'
    }
  }
};

// Base Skeleton component
export function Skeleton({ className = '', animate = true }) {
  return (
    <div className={`relative bg-gray-200 rounded overflow-hidden ${className}`}>
      {animate && (
        <motion.div
          initial="initial"
          animate="animate"
          variants={shimmer}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        />
      )}
    </div>
  );
}

// Spinner Loader
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2
      className={`${sizes[size]} animate-spin text-blue-600 ${className}`}
    />
  );
}

// Full page loader
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4"
        />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Progress bar
export function ProgressBar({ progress = 0, className = '' }) {
  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
      />
    </div>
  );
}

// Circular progress
export function CircularProgress({ progress = 0, size = 64, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-gray-200"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-blue-600"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Student Card Skeleton
export function StudentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Goal Card Skeleton
export function GoalCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="w-16 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ height = 300 }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <ChartSkeleton />

      {/* List */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 5, type = 'default' }) {
  const skeletons = {
    default: () => (
      <div className="p-4 border-b border-gray-200">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    ),
    student: () => <StudentCardSkeleton />,
    goal: () => <GoalCardSkeleton />
  };

  const SkeletonComponent = skeletons[type] || skeletons.default;

  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

// Inline loader (for buttons, etc.)
export function InlineLoader({ text = 'Loading' }) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size="sm" />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}

// Refresh button with loading state
export function RefreshButton({ isLoading, onClick, children = 'Refresh' }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileTap={{ scale: 0.95 }}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        ${isLoading
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
      `}
    >
      <span className="flex items-center gap-2">
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {children}
      </span>
    </motion.button>
  );
}

// Pulse loader (simple dot animation)
export function PulseLoader({ size = 'md' }) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
          className={`${sizes[size]} rounded-full bg-blue-600`}
        />
      ))}
    </div>
  );
}

// Typing indicator (like chat apps)
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 p-3 bg-gray-100 rounded-2xl w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -8, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15
          }}
          className="w-2 h-2 rounded-full bg-gray-400"
        />
      ))}
    </div>
  );
}

// Loading overlay for sections
export function SectionLoader({ message, isLoading }) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl"
    >
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-2" />
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </motion.div>
  );
}

// Skeleton text (for inline loading)
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

// Card skeleton (generic)
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
      <Skeleton className="h-6 w-32 mb-4" />
      <SkeletonText lines={3} />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export default {
  Skeleton,
  Spinner,
  PageLoader,
  ProgressBar,
  CircularProgress,
  StudentCardSkeleton,
  GoalCardSkeleton,
  TableRowSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  ListSkeleton,
  InlineLoader,
  RefreshButton,
  PulseLoader,
  TypingIndicator,
  SectionLoader,
  SkeletonText,
  CardSkeleton
};
