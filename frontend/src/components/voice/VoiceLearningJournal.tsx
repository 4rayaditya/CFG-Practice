import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Trash2, 
  BookOpen, 
  Send,
  Plus
} from 'lucide-react';
import { useVoiceToText } from '../../hooks/useVoiceToText';

export interface JournalEntry {
  id: string;
  timestamp: string;
  topic: string;
  reflection: string;
  category: string;
}

const DEFAULT_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    topic: 'React 19 Hooks & Web Audio Cleanup',
    reflection: 'Learned how to properly stop all active MediaStream tracks on component unmount to prevent camera/microphone hardware locking in Chrome.',
    category: 'Frontend',
  },
  {
    id: 'entry-2',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    topic: 'FastAPI SlowAPI Rate Limiting Middleware',
    reflection: 'Configured SlowAPI limiter with custom key_func to extract client IP from X-Forwarded-For header when running behind reverse proxies.',
    category: 'Backend',
  },
];

export const VoiceLearningJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('mm_learning_journal');
      return saved ? JSON.parse(saved) : DEFAULT_ENTRIES;
    } catch {
      return DEFAULT_ENTRIES;
    }
  });

  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [manualText, setManualText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceToText();

  useEffect(() => {
    localStorage.setItem('mm_learning_journal', JSON.stringify(entries));
  }, [entries]);

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        setManualText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        resetTranscript();
      }
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReflection = [manualText.trim(), transcript.trim()].filter(Boolean).join(' ');
    if (!topic.trim() || !finalReflection) return;

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      topic: topic.trim(),
      reflection: finalReflection,
      category,
    };

    setEntries([newEntry, ...entries]);
    setTopic('');
    setManualText('');
    resetTranscript();
    setIsFormOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice-to-Text Data Logging</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Daily Learning Journal & Reflections</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dictate what technical concepts you explored today to build your verified mastery log.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isFormOpen ? 'Cancel' : 'New Voice Reflection'}</span>
        </button>
      </div>

      {/* Voice Entry Form Drawer */}
      {isFormOpen && (
        <form onSubmit={handleSaveEntry} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Today's Topic / Concept</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. pgvector HNSW indexing or Dynamic Programming"
                className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-sky-500 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Domain Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-sky-500 transition"
              >
                <option value="Frontend">Frontend Development</option>
                <option value="Backend">Backend & APIs</option>
                <option value="AI/ML">AI/ML & Vector Embeddings</option>
                <option value="Algorithms">Algorithms & Data Structures</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Reflection & Key Takeaway</label>
              {isSupported && (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-teal-600" />}
                  <span>{isListening ? 'Stop Dictation' : 'Speak Your Reflection'}</span>
                </button>
              )}
            </div>

            <textarea
              required
              rows={3}
              value={manualText || transcript}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Speak aloud or write: What clicked for you today? What challenges did you overcome?"
              className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white text-xs font-bold shadow-xs transition"
            >
              Save Reflection Log
            </button>
          </div>
        </form>
      )}

      {/* Journal Entries List */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 transition space-y-2 relative group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold text-[10px] uppercase">
                  {entry.category}
                </span>
                <h4 className="text-sm font-extrabold text-slate-900">{entry.topic}</h4>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(entry.timestamp)}</span>
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {entry.reflection}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
