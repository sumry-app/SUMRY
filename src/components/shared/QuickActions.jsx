import { useState, useEffect } from 'react';
import { Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Plus, TrendingUp, Users, Target, Calendar, FileText, Mic,
  Search, Sparkles, Download, Upload, Settings, Zap
} from 'lucide-react';

/**
 * Quick Actions Command Palette
 * Keyboard shortcuts and quick access for power users
 */
export default function QuickActions({ onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Listen for Cmd/Ctrl + K
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // ESC to close
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const actions = [
    {
      category: 'Create',
      items: [
        {
          icon: Users,
          label: 'Add Student',
          shortcut: 'Ctrl+N',
          action: 'add-student',
          keywords: ['new', 'student', 'create']
        },
        {
          icon: Target,
          label: 'Create Goal',
          shortcut: 'Ctrl+G',
          action: 'create-goal',
          keywords: ['goal', 'new', 'iep']
        },
        {
          icon: TrendingUp,
          label: 'Log Progress',
          shortcut: 'Ctrl+L',
          action: 'log-progress',
          keywords: ['progress', 'log', 'data']
        },
        {
          icon: Mic,
          label: 'Voice Log Progress',
          shortcut: 'Ctrl+Shift+L',
          action: 'voice-log',
          keywords: ['voice', 'speak', 'dictate']
        }
      ]
    },
    {
      category: 'AI Features',
      items: [
        {
          icon: Sparkles,
          label: 'Generate AI Goal',
          shortcut: 'Ctrl+Shift+G',
          action: 'ai-goal',
          keywords: ['ai', 'generate', 'smart', 'automatic']
        },
        {
          icon: Zap,
          label: 'AI Insights',
          shortcut: 'Ctrl+I',
          action: 'ai-insights',
          keywords: ['insights', 'analytics', 'predictions']
        },
        {
          icon: Sparkles,
          label: 'Open AI Copilot',
          shortcut: 'Ctrl+.',
          action: 'ai-copilot',
          keywords: ['copilot', 'assistant', 'help']
        }
      ]
    },
    {
      category: 'Reports & Export',
      items: [
        {
          icon: FileText,
          label: 'IEP Meeting Prep',
          shortcut: 'Ctrl+M',
          action: 'meeting-prep',
          keywords: ['meeting', 'iep', 'preparation']
        },
        {
          icon: Download,
          label: 'Export Data',
          shortcut: 'Ctrl+E',
          action: 'export',
          keywords: ['export', 'download', 'backup']
        },
        {
          icon: FileText,
          label: 'Generate PDF Report',
          shortcut: 'Ctrl+P',
          action: 'pdf-report',
          keywords: ['pdf', 'report', 'print']
        }
      ]
    },
    {
      category: 'Navigation',
      items: [
        {
          icon: TrendingUp,
          label: 'Dashboard',
          shortcut: 'Ctrl+1',
          action: 'nav-dashboard',
          keywords: ['dashboard', 'home', 'overview']
        },
        {
          icon: Users,
          label: 'Students',
          shortcut: 'Ctrl+2',
          action: 'nav-students',
          keywords: ['students', 'list']
        },
        {
          icon: Target,
          label: 'Goals',
          shortcut: 'Ctrl+3',
          action: 'nav-goals',
          keywords: ['goals', 'objectives']
        },
        {
          icon: Calendar,
          label: 'Progress',
          shortcut: 'Ctrl+4',
          action: 'nav-progress',
          keywords: ['progress', 'tracking', 'data']
        }
      ]
    }
  ];

  const filteredActions = actions.map(category => ({
    ...category,
    items: category.items.filter(item =>
      searchTerm === '' ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords.some(k => k.includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.items.length > 0);

  return (
    <>
      {/* Floating Quick Actions Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-40 group"
        aria-label="Quick Actions"
      >
        <Command className="w-6 h-6" />
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Quick Actions (⌘K)
        </span>
      </Button>

      {/* Command Palette Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {/* Search Bar */}
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 outline-none text-lg"
                autoFocus
              />
              <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">ESC</kbd>
            </div>
          </div>

          {/* Actions List */}
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-6">
            {filteredActions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No actions found</p>
              </div>
            ) : (
              filteredActions.map((category, catIndex) => (
                <div key={catIndex}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {category.category}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={itemIndex}
                          onClick={() => {
                            if (onAction) onAction(item.action);
                            setIsOpen(false);
                            setSearchTerm('');
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-coral-100 group-hover:to-coral-200 transition-colors">
                            <Icon className="w-5 h-5 text-gray-600 group-hover:text-coral-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.label}</p>
                          </div>
                          {item.shortcut && (
                            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded font-mono">
                              {item.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-3 bg-gray-50 text-xs text-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              K to open
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Keyboard Shortcuts Guide
 */
export function KeyboardShortcutsGuide() {
  const shortcuts = [
    { keys: ['⌘', 'K'], action: 'Open Quick Actions' },
    { keys: ['⌘', 'N'], action: 'Add Student' },
    { keys: ['⌘', 'G'], action: 'Create Goal' },
    { keys: ['⌘', 'L'], action: 'Log Progress' },
    { keys: ['⌘', '⇧', 'L'], action: 'Voice Log' },
    { keys: ['⌘', 'I'], action: 'AI Insights' },
    { keys: ['⌘', 'M'], action: 'Meeting Prep' },
    { keys: ['⌘', '1-4'], action: 'Navigate Tabs' },
    { keys: ['ESC'], action: 'Close Dialog' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Keyboard Shortcuts</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{shortcut.action}</span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, i) => (
                <kbd key={i} className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
