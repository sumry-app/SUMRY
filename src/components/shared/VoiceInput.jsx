import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Voice Input Component - Game changer for busy teachers
 * Log progress while walking around the classroom!
 */
export default function VoiceInput({ onTranscript, placeholder = 'Click microphone to start...' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }

        if (finalText) {
          setTranscript(prev => prev + finalText);
          setInterimTranscript('');
          if (onTranscript) {
            onTranscript(finalText.trim());
          }
        } else {
          setInterimTranscript(interimText);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);

        if (event.error === 'no-speech') {
          // User didn't speak, just restart
          if (recognitionRef.current) {
            setTimeout(() => {
              try {
                recognition.start();
              } catch (e) {
                // Already started
              }
            }, 100);
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart if user is still in voice mode
        if (recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or stopped by user
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  if (!isSupported) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          Voice input is not supported in your browser. Try Chrome, Edge, or Safari.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Voice button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={toggleListening}
          className={`flex-1 transition-all duration-300 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Voice Input
            </>
          )}
        </Button>

        {transcript && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearTranscript}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Transcript display */}
      {(transcript || interimTranscript || isListening) && (
        <Card className={`p-4 min-h-[100px] transition-all duration-300 ${
          isListening ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}>
          {isListening && !transcript && !interimTranscript && (
            <div className="flex items-center gap-2 text-red-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="text-sm font-medium">Listening... Speak now</p>
            </div>
          )}

          {transcript && (
            <p className="text-sm text-gray-800 mb-2">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-500 italic">{interimTranscript}</span>
              )}
            </p>
          )}

          {!transcript && interimTranscript && (
            <p className="text-sm text-gray-500 italic">{interimTranscript}</p>
          )}

          {isListening && (
            <div className="mt-2 flex items-center gap-1">
              <div className="w-1 h-3 bg-red-500 animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-4 bg-red-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-5 bg-red-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-1 h-4 bg-red-500 animate-pulse" style={{ animationDelay: '450ms' }}></div>
              <div className="w-1 h-3 bg-red-500 animate-pulse" style={{ animationDelay: '600ms' }}></div>
            </div>
          )}
        </Card>
      )}

      {/* Usage tips */}
      {!isListening && !transcript && (
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-medium">💡 Voice Input Tips:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>{placeholder}</li>
            <li>Speak clearly and naturally</li>
            <li>Say “period” for punctuation</li>
            <li>Works great for quick progress notes!</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Quick Voice Logger - Specialized component for rapid progress logging
 */
export function QuickVoiceLogger({ onComplete, students, goals }) {
  const [step, setStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [notes, setNotes] = useState('');
  const [score, setScore] = useState('');

  const handleVoiceInput = (transcript) => {
    if (step === 3) {
      // Extract score and notes from voice
      const scoreMatch = transcript.match(/(\d+)/);
      if (scoreMatch && !score) {
        setScore(scoreMatch[1]);
      }
      setNotes(prev => prev + ' ' + transcript);
    }
  };

  const studentGoals = selectedStudent
    ? goals.filter(g => g.studentId === selectedStudent.id && g.status === 'active')
    : [];

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quick Voice Logger</h3>
        <div className="flex gap-1">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                step >= s ? 'bg-coral-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Select student:</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {students.map(student => (
              <button
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  setStep(2);
                }}
                className="w-full p-3 text-left border rounded-lg hover:border-coral-500 hover:bg-coral-50 transition-colors"
              >
                <p className="font-medium">{student.name}</p>
                <p className="text-xs text-gray-500">{student.grade}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <button
            onClick={() => setStep(1)}
            className="text-sm text-coral-600 hover:underline"
          >
            ← Change student
          </button>
          <p className="text-sm text-gray-600">Select goal for {selectedStudent?.name}:</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {studentGoals.map(goal => (
              <button
                key={goal.id}
                onClick={() => {
                  setSelectedGoal(goal);
                  setStep(3);
                }}
                className="w-full p-3 text-left border rounded-lg hover:border-coral-500 hover:bg-coral-50 transition-colors"
              >
                <p className="text-sm font-medium">{goal.area}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{goal.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <button
              onClick={() => setStep(2)}
              className="text-sm text-coral-600 hover:underline mb-2"
            >
              ← Change goal
            </button>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Student</p>
              <p className="font-medium">{selectedStudent?.name}</p>
              <p className="text-xs text-gray-500 mt-2">Goal</p>
              <p className="text-sm">{selectedGoal?.description}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Score</label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter score..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Notes (Voice or Type)</label>
            <VoiceInput onTranscript={handleVoiceInput} />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded-lg mt-2"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (score && onComplete) {
                  onComplete({
                    studentId: selectedStudent.id,
                    goalId: selectedGoal.id,
                    score: parseFloat(score),
                    notes: notes.trim(),
                    dateISO: new Date().toISOString().split('T')[0]
                  });
                }
              }}
              className="flex-1"
              disabled={!score}
            >
              <Check className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
