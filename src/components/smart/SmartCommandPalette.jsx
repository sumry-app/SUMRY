import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, Zap, TrendingUp, Clock, Star } from 'lucide-react';

/**
 * SmartCommandPalette - Predictive, context-aware command system
 * Inspired by: Linear, Raycast, Claude
 *
 * Features:
 * - AI-powered suggestions based on context
 * - Recent actions tracking
 * - Keyboard navigation
 * - Fuzzy search
 * - Quick actions
 */
export default function SmartCommandPalette({
  isOpen,
  onClose,
  context = {},
  recentActions = [],
  onExecute
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Smart suggestions based on context and time
  const smartSuggestions = React.useMemo(() => {
    const suggestions = [];
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    // Time-based suggestions
    if (hour >= 8 && hour < 10) {
      suggestions.push({
        id: 'morning-review',
        title: 'Review Today\'s Schedule',
        description: 'Good morning! Check your assignments for today',
        icon: Clock,
        category: 'suggested',
        action: () => onExecute({ type: 'navigate', to: 'my-work' }),
        priority: 10
      });
    }

    // Context-based suggestions
    if (context.currentView === 'students' && context.selectedStudent) {
      suggestions.push({
        id: 'log-progress',
        title: `Log Progress for ${context.selectedStudent.name}`,
        description: 'Quick data entry',
        icon: TrendingUp,
        category: 'suggested',
        action: () => onExecute({ type: 'log-progress', studentId: context.selectedStudent.id }),
        priority: 9
      });
    }

    // Pattern-based suggestions (user hasn't logged data today)
    if (context.lastLoggedToday === false) {
      suggestions.push({
        id: 'remind-log',
        title: 'Log Student Progress',
        description: 'You haven\'t logged any data yet today',
        icon: Zap,
        category: 'suggested',
        action: () => onExecute({ type: 'navigate', to: 'progress' }),
        priority: 8
      });
    }

    // Weekly pattern - Friday suggestion
    if (dayOfWeek === 5) {
      suggestions.push({
        id: 'weekly-review',
        title: 'Generate Weekly Summary',
        description: 'Review this week\'s progress before the weekend',
        icon: Star,
        category: 'suggested',
        action: () => onExecute({ type: 'generate-report', period: 'week' }),
        priority: 7
      });
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  }, [context, onExecute]);

  // All available commands
  const allCommands = [
    // Navigation
    { id: 'nav-dashboard', title: 'Dashboard', description: 'Go to dashboard', category: 'navigate', keywords: ['home', 'overview'] },
    { id: 'nav-students', title: 'Students', description: 'View all students', category: 'navigate', keywords: ['list', 'roster'] },
    { id: 'nav-goals', title: 'Goals', description: 'Manage IEP goals', category: 'navigate', keywords: ['objectives', 'targets'] },
    { id: 'nav-progress', title: 'Progress', description: 'Track progress', category: 'navigate', keywords: ['data', 'logs'] },

    // Quick Actions
    { id: 'add-student', title: 'Add Student', description: 'Create new student profile', category: 'create', keywords: ['new', 'enroll'] },
    { id: 'add-goal', title: 'Add Goal', description: 'Create new IEP goal', category: 'create', keywords: ['new', 'objective'] },
    { id: 'log-progress', title: 'Log Progress', description: 'Quick data entry', category: 'create', keywords: ['data', 'entry', 'record'] },

    // Reports
    { id: 'export-data', title: 'Export Data', description: 'Download your data', category: 'export', keywords: ['download', 'backup', 'csv'] },
    { id: 'generate-report', title: 'Generate Report', description: 'Create progress report', category: 'export', keywords: ['pdf', 'print'] },

    // Settings
    { id: 'achievements', title: 'View Achievements', description: 'See your progress', category: 'view', keywords: ['badges', 'streaks'] },
    { id: 'ferpa', title: 'Privacy Settings', description: 'FERPA compliance', category: 'settings', keywords: ['security', 'data'] }
  ];

  // Fuzzy search function
  const fuzzyMatch = (str, pattern) => {
    pattern = pattern.toLowerCase();
    str = str.toLowerCase();

    let patternIdx = 0;
    let strIdx = 0;
    let score = 0;

    while (strIdx < str.length && patternIdx < pattern.length) {
      if (str[strIdx] === pattern[patternIdx]) {
        score += 1;
        patternIdx++;
      }
      strIdx++;
    }

    return patternIdx === pattern.length ? score : 0;
  };

  // Filter and rank commands
  const filteredCommands = React.useMemo(() => {
    if (!query) {
      return [
        ...smartSuggestions.slice(0, 3),
        ...recentActions.slice(0, 3).map(action => ({
          ...action,
          category: 'recent'
        })),
        ...allCommands.slice(0, 5)
      ];
    }

    return allCommands
      .map(cmd => {
        const titleScore = fuzzyMatch(cmd.title, query);
        const descScore = fuzzyMatch(cmd.description, query);
        const keywordScore = cmd.keywords?.reduce((sum, kw) => sum + fuzzyMatch(kw, query), 0) || 0;
        const totalScore = titleScore * 3 + descScore + keywordScore;

        return { ...cmd, score: totalScore };
      })
      .filter(cmd => cmd.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, smartSuggestions, recentActions, allCommands]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          if (selected.action) {
            selected.action();
          } else {
            onExecute(selected);
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onExecute, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const getCategoryColor = (category) => {
    const colors = {
      suggested: 'text-purple-600 bg-purple-100',
      recent: 'text-blue-600 bg-blue-100',
      navigate: 'text-green-600 bg-green-100',
      create: 'text-orange-600 bg-orange-100',
      export: 'text-pink-600 bg-pink-100',
      view: 'text-cyan-600 bg-cyan-100',
      settings: 'text-gray-600 bg-gray-100'
    };
    return colors[category] || colors.view;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Type a command or search..."
                  className="flex-1 outline-none text-lg text-gray-900 placeholder-gray-400"
                />
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-mono">⌘</kbd>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-mono">K</kbd>
                </div>
              </div>

              {/* Commands List */}
              <div className="max-h-[400px] overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No commands found</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredCommands.map((cmd, index) => {
                      const Icon = cmd.icon || Command;
                      const isSelected = index === selectedIndex;

                      return (
                        <motion.button
                          key={cmd.id}
                          onClick={() => {
                            if (cmd.action) {
                              cmd.action();
                            } else {
                              onExecute(cmd);
                            }
                            onClose();
                          }}
                          className={`
                            w-full px-4 py-3 flex items-center gap-3 transition-colors
                            ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                          `}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className={`p-2 rounded-lg ${getCategoryColor(cmd.category)}`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900 text-sm">
                              {cmd.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {cmd.description}
                            </div>
                          </div>

                          {cmd.category === 'suggested' && (
                            <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                              <Zap className="w-3 h-3" />
                              Smart
                            </div>
                          )}

                          {cmd.category === 'recent' && (
                            <div className="text-xs text-gray-400">
                              Recent
                            </div>
                          )}

                          {isSelected && (
                            <ArrowRight className="w-4 h-4 text-blue-600" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↓</kbd>
                    <span className="ml-1">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↵</kbd>
                    <span className="ml-1">Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">esc</kbd>
                    <span className="ml-1">Close</span>
                  </div>
                </div>
                <div>
                  {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to use command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  };
}
