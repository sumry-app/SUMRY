import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock, Star, TrendingUp, Mic, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * PredictiveInput - Smart input with autocomplete and predictions
 *
 * Features:
 * - Context-aware suggestions
 * - Recent items tracking
 * - Fuzzy matching
 * - Keyboard navigation
 * - Voice input support
 * - Smart ranking
 * - Beautiful animations
 */
export default function PredictiveInput({
  value,
  onChange,
  onSelect,
  placeholder = 'Start typing...',
  suggestions = [],
  recentItems = [],
  predictedItems = [],
  showVoice = false,
  icon: Icon = Search,
  type = 'text',
  className = '',
  autoFocus = false,
  onVoiceInput
}) {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync with external value
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  // Fuzzy match scoring
  const fuzzyMatch = (str, pattern) => {
    if (!pattern) return 0;

    str = str.toLowerCase();
    pattern = pattern.toLowerCase();

    let score = 0;
    let patternIdx = 0;
    let prevMatchIdx = -1;

    for (let strIdx = 0; strIdx < str.length && patternIdx < pattern.length; strIdx++) {
      if (str[strIdx] === pattern[patternIdx]) {
        score += 10;

        // Bonus for consecutive matches
        if (prevMatchIdx === strIdx - 1) {
          score += 5;
        }

        // Bonus for start of word
        if (strIdx === 0 || str[strIdx - 1] === ' ') {
          score += 8;
        }

        prevMatchIdx = strIdx;
        patternIdx++;
      }
    }

    // Must match all characters
    if (patternIdx !== pattern.length) return 0;

    // Bonus for exact match
    if (str === pattern) score += 50;

    // Bonus for starts with
    if (str.startsWith(pattern)) score += 20;

    return score;
  };

  // Get filtered and ranked suggestions
  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) {
      return [
        ...predictedItems.slice(0, 3).map(item => ({
          ...item,
          category: 'predicted',
          icon: TrendingUp
        })),
        ...recentItems.slice(0, 5).map(item => ({
          ...item,
          category: 'recent',
          icon: Clock
        }))
      ];
    }

    // Score and filter all suggestions
    const scored = suggestions
      .map(item => {
        const titleScore = fuzzyMatch(item.title || item.label || item.name || '', query);
        const descScore = fuzzyMatch(item.description || '', query) * 0.5;
        const totalScore = titleScore + descScore;

        return { ...item, score: totalScore };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    // Add category and icons
    return scored.map(item => ({
      ...item,
      category: item.category || 'suggestion',
      icon: item.icon || ArrowRight
    }));
  }, [query, suggestions, recentItems, predictedItems]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setIsOpen(true);
    setSelectedIndex(0);
  };

  // Handle selection
  const handleSelect = (item) => {
    const selectedValue = item.title || item.label || item.name || item.value || '';
    setQuery(selectedValue);
    onChange?.(selectedValue);
    onSelect?.(item);
    setIsOpen(false);
    setSelectedIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredSuggestions[selectedIndex]) {
          handleSelect(filteredSuggestions[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredSuggestions]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      onChange?.(transcript);
      onVoiceInput?.(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const getCategoryColor = (category) => {
    const colors = {
      predicted: 'text-purple-600 bg-purple-100',
      recent: 'text-blue-600 bg-blue-100',
      suggestion: 'text-gray-600 bg-gray-100',
      favorite: 'text-yellow-600 bg-yellow-100'
    };
    return colors[category] || colors.suggestion;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      predicted: 'Predicted',
      recent: 'Recent',
      suggestion: 'Suggestion',
      favorite: 'Favorite'
    };
    return labels[category] || '';
  };

  return (
    <div className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type={type}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`
            w-full pl-10 pr-20 py-3 rounded-xl border-2 border-gray-200
            focus:border-blue-500 focus:outline-none
            transition-all duration-200
            text-gray-900 placeholder-gray-400
            ${className}
          `}
        />

        {/* Right side actions */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Clear button */}
          {query && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => {
                setQuery('');
                onChange?.('');
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>
          )}

          {/* Voice input button */}
          {showVoice && (
            <motion.button
              onClick={handleVoiceInput}
              className={`
                p-1.5 rounded-full transition-all
                ${isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'hover:bg-gray-100 text-gray-400'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && filteredSuggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-2xl overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto">
              {filteredSuggestions.map((item, index) => {
                const ItemIcon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <motion.button
                    key={item.id || index}
                    onClick={() => handleSelect(item)}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3
                      transition-colors text-left
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Icon */}
                    <div className={`
                      p-2 rounded-lg flex-shrink-0
                      ${getCategoryColor(item.category)}
                    `}>
                      <ItemIcon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.title || item.label || item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>

                    {/* Category badge */}
                    {item.category && getCategoryLabel(item.category) && (
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {getCategoryLabel(item.category)}
                      </div>
                    )}

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↵</kbd>
                  <span className="ml-1">Select</span>
                </div>
              </div>
              <div>
                {filteredSuggestions.length} result{filteredSuggestions.length !== 1 ? 's' : ''}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Specialized student input
export function StudentPredictiveInput({ students, onSelect, ...props }) {
  const suggestions = students.map(student => ({
    id: student.id,
    title: student.name,
    description: student.grade ? `Grade ${student.grade}` : '',
    value: student.name,
    data: student
  }));

  return (
    <PredictiveInput
      suggestions={suggestions}
      onSelect={(item) => onSelect?.(item.data)}
      placeholder="Search for a student..."
      {...props}
    />
  );
}

// Specialized goal input
export function GoalPredictiveInput({ goals, students, onSelect, ...props }) {
  const suggestions = goals.map(goal => {
    const student = students.find(s => s.id === goal.studentId);
    return {
      id: goal.id,
      title: goal.description,
      description: student ? `${student.name} - ${goal.domain}` : goal.domain,
      value: goal.description,
      data: goal
    };
  });

  return (
    <PredictiveInput
      suggestions={suggestions}
      onSelect={(item) => onSelect?.(item.data)}
      placeholder="Search for a goal..."
      {...props}
    />
  );
}
