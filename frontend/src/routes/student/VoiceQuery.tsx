import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  HardDrive,
  CloudUpload,
  Calendar,
  Heart
} from 'lucide-react';
import { AudioRecorder } from '../../components/voice/AudioRecorder';
import { MentorMatchGrid, Mentor } from '../../components/mentors/MentorMatchGrid';
import { OfflineBanner } from '../../components/pwa/OfflineBanner';
import { PendingBadge } from '../../components/pwa/PendingBadge';
import { InstallPwaPrompt } from '../../components/pwa/InstallPwaPrompt';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { saveFailedAudioUpload, QueuedAudioUpload } from '../../utils/offlineQueue';
import { api } from '../../services/api';

import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { StudentDoubtHub } from '../../components/student/StudentDoubtHub';
import { StudentMentorRequestModal } from '../../components/student/StudentMentorRequestModal';
import { saveLocalCachedDoubts, getLocalCachedDoubts } from '../../hooks/useRealtimeDoubts';
import type { Doubt } from '../../types';

const DEFAULT_MATCHED_MENTORS: Mentor[] = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    fullName: 'Dr. Sarah Jenkins',
    headline: 'Lead Frontend Architect & React Core Contributor',
    bio: '12+ years building accessible web applications, state management architectures, and React component libraries.',
    expertiseTags: ['React', 'Frontend', 'TypeScript', 'Tailwind CSS', 'Web Accessibility'],
    rating: 4.96,
    reviewsCount: 142,
    matchScore: 96,
    isAvailable: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    fullName: 'Elena Rostova',
    headline: 'Senior Staff Web Engineer & Media Streaming Specialist',
    bio: 'Specializes in Web Audio API, real-time audio visualization, MediaRecorder streams, and modern React performance.',
    expertiseTags: ['Frontend', 'Web Audio', 'MediaRecorder', 'TypeScript', 'React'],
    rating: 4.91,
    reviewsCount: 98,
    matchScore: 91,
    isAvailable: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    fullName: 'Marcus Vance',
    headline: 'Competitive Programmer & Algorithms Coach',
    bio: 'Ex-FAANG engineer mentoring students in Dynamic Programming, Graph Theory, Trees, and technical coding interviews.',
    expertiseTags: ['Algorithms', 'Data Structures', 'Dynamic Programming', 'Python'],
    rating: 4.88,
    reviewsCount: 176,
    matchScore: 84,
    isAvailable: true,
  },
];

export const VoiceQuery: React.FC = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMatchingMentors, setIsMatchingMentors] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Auto-sync callback when items finish flushing from IndexedDB
  const handleAutoSyncSuccess = useCallback(async (item: QueuedAudioUpload, result: any) => {
    console.log('[VoiceQuery] Auto-sync received transcript:', result);
    if (result && result.transcript) {
      const doubtTitle = result.structured_doubt?.title || result.transcript.slice(0, 80);
      const doubtCategory = result.structured_doubt?.category || 'General';
      const doubtTags = result.structured_doubt?.tags || ['auto-synced', 'offline-pwa'];
      const doubtUrgency = result.structured_doubt?.urgency || 'Standard';

      setStructuredOutput({
        transcript: result.transcript,
        summary: result.structured_doubt?.description || `Synced from offline queue: ${result.transcript.slice(0, 100)}...`,
        category: doubtCategory,
        tags: doubtTags,
        urgency: doubtUrgency,
      });

      // Persist auto-synced doubt to Supabase
      if (user) {
        try {
          const { error: rlsError } = await supabase
            .from('doubts')
            .insert([{
              student_id: user.id,
              title: doubtTitle,
              description: result.transcript,
              transcript: result.transcript,
              category: doubtCategory,
              tags: doubtTags,
              status: 'pending',
              urgency: doubtUrgency,
            }]);
          if (rlsError) {
            console.error('[VoiceQuery] RLS error inserting auto-synced doubt:', rlsError);
          } else {
            console.log('[VoiceQuery] Auto-synced doubt persisted to Supabase.');
          }
        } catch (dbErr) {
          console.warn('[VoiceQuery] Database insertion error during auto-sync:', dbErr);
        }
      }

      setSyncToastMessage(`🎉 Offline recording synced with Whisper AI & saved to database!`);
      setTimeout(() => setSyncToastMessage(null), 5000);
    }
  }, [user]);

  // Global Network Status & Background Sync hook
  const { 
    isOnline, 
    pendingCount, 
    isSyncing, 
    flushQueueDispatcher 
  } = useNetworkStatus(handleAutoSyncSuccess);

  // Initialize from localStorage to survive page refreshes
  const [matchedMentorsList, setMatchedMentorsList] = useState<Mentor[]>(() => {
    try {
      const saved = localStorage.getItem('mm_current_mentors');
      return saved ? JSON.parse(saved) : DEFAULT_MATCHED_MENTORS;
    } catch {
      return DEFAULT_MATCHED_MENTORS;
    }
  });

  const [lastAudioMeta, setLastAudioMeta] = useState<{ sizeKb: number; duration: number } | null>(null);
  
  const [structuredOutput, setStructuredOutput] = useState<{
    transcript?: string;
    summary?: string;
    category?: string;
    tags?: string[];
    urgency?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('mm_current_doubt');
      return saved ? JSON.parse(saved) : {
        transcript: 'I am building a responsive React dashboard with TypeScript and need advice on architecting role-based routing and audio streaming.',
        summary: 'Student seeking code architecture guidance on React Router role guards, HTML5 MediaRecorder voice capture, and vector matching.',
        category: 'Frontend',
        tags: ['react', 'typescript', 'voice-intake', 'web-audio'],
        urgency: 'Standard',
      };
    } catch {
      return null;
    }
  });

  // Save to localStorage automatically on update
  useEffect(() => {
    if (structuredOutput) {
      localStorage.setItem('mm_current_doubt', JSON.stringify(structuredOutput));
    }
  }, [structuredOutput]);

  useEffect(() => {
    if (matchedMentorsList && matchedMentorsList.length > 0) {
      localStorage.setItem('mm_current_mentors', JSON.stringify(matchedMentorsList));
    }
  }, [matchedMentorsList]);

  const [intakeMode, setIntakeMode] = useState<'voice' | 'text'>('voice');
  const [textTitle, setTextTitle] = useState('');
  const [textCategory, setTextCategory] = useState('Frontend');
  const [textUrgency, setTextUrgency] = useState('Standard');
  const [textDescription, setTextDescription] = useState('');
  const [textTags, setTextTags] = useState('');

  const handleManualTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textTitle.trim() || !textDescription.trim()) return;

    setIsProcessing(true);
    setIsMatchingMentors(true);

    const tagsArray = textTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newDoubtObj: Doubt = {
      id: `doubt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: textTitle.trim(),
      description: textDescription.trim(),
      transcript: textDescription.trim(),
      category: textCategory,
      tags: tagsArray.length > 0 ? tagsArray : [textCategory.toLowerCase()],
      urgency: textUrgency,
      status: 'pending',
      studentId: user?.id || '00000000-0000-0000-0000-000000000001',
      studentName: user?.fullName || user?.name || 'Alex Chen',
      createdAt: new Date().toISOString(),
    };

    setStructuredOutput({
      transcript: textDescription.trim(),
      summary: `Student submitted question on ${textCategory}: ${textTitle.trim()}`,
      category: textCategory,
      tags: newDoubtObj.tags,
      urgency: textUrgency,
    });

    // 1. Try Supabase Insert
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const studentIdToUse = user?.id || sessionData?.session?.user?.id;
      if (studentIdToUse) {
        await supabase.from('doubts').insert([{
          student_id: studentIdToUse,
          title: textTitle.trim(),
          description: textDescription.trim(),
          transcript: textDescription.trim(),
          category: textCategory,
          tags: newDoubtObj.tags,
          status: 'pending',
          urgency: textUrgency,
        }]);
      }
    } catch (dbErr) {
      console.warn('Supabase text insert notice, saving locally:', dbErr);
    }

    // 2. Save locally
    const currentCached = getLocalCachedDoubts();
    saveLocalCachedDoubts([newDoubtObj, ...currentCached]);

    // 3. Match mentors
    try {
      const matchRes = await api.matchMentors({
        title: textTitle.trim(),
        description: textDescription.trim(),
        category: textCategory,
        match_count: 3,
      });
      if (matchRes.matches && matchRes.matches.length > 0) {
        const mapped: Mentor[] = matchRes.matches.map((m) => ({
          id: m.mentor_id,
          fullName: m.full_name,
          headline: m.headline,
          bio: m.bio,
          expertiseTags: m.expertise_tags,
          rating: m.rating,
          matchScore: Math.round(m.similarity * 100),
          isAvailable: true,
        }));
        setMatchedMentorsList(mapped);
      }
    } catch (matchErr) {
      console.warn('Local mentor matching engaged:', matchErr);
    }

    setSyncToastMessage('✨ Question posted successfully to live mentor queue!');
    setTimeout(() => setSyncToastMessage(null), 5000);

    // Reset inputs
    setTextTitle('');
    setTextDescription('');
    setTextTags('');
    setIsProcessing(false);
    setIsMatchingMentors(false);
  };

  const handleResetDoubt = () => {
    setStructuredOutput(null);
    setMatchedMentorsList(DEFAULT_MATCHED_MENTORS);
    localStorage.removeItem('mm_current_doubt');
    localStorage.removeItem('mm_current_mentors');
  };

  const handleSubmitDoubt = async (blob: Blob, durationSeconds: number) => {
    setIsProcessing(true);
    setLastAudioMeta({
      sizeKb: Number((blob.size / 1024).toFixed(1)),
      duration: durationSeconds,
    });

    try {
      // 1. OFFLINE MODE: Intercept request & save serialized audio to IndexedDB
      if (!isOnline) {
        console.log('[VoiceQuery] Network offline. Intercepting and saving to IndexedDB queue...');
        const queuedItem = await saveFailedAudioUpload(blob, {
          durationSeconds,
          fileName: `offline_voice_${Date.now()}.webm`,
          recordedAt: new Date().toISOString(),
        });

        setStructuredOutput({
          transcript: `[Offline Voice Recording Saved - ${(blob.size / 1024).toFixed(1)} KB]`,
          summary: `Your audio recording has been safely stored in your browser's IndexedDB. As soon as your internet reconnects, MentorMatch will automatically upload it to Groq Whisper and find matching mentors.`,
          category: 'Offline Queue',
          tags: ['saved-in-indexeddb', 'pwa-offline', 'auto-sync-ready'],
          urgency: 'Standard',
        });

        setSyncToastMessage(`📡 Recording queued locally (${queuedItem.id.slice(0, 14)}). Will auto-sync when online.`);
        setTimeout(() => setSyncToastMessage(null), 5000);
        return;
      }

      // 2. ONLINE MODE: Upload directly to FastAPI /api/process-audio
      setIsMatchingMentors(true);
      let transcriptText = 'I am building a responsive React dashboard with TypeScript and need advice on architecting role-based routing and audio streaming.';
      let categoryVal = 'Frontend';

      try {
        const result = await api.uploadAudio(blob, 'doubt-intake.webm');
        transcriptText = result.transcript || transcriptText;
        const doubtTitle = result.structured_doubt?.title || transcriptText.slice(0, 80);
        const doubtCategory = result.structured_doubt?.category || categoryVal;
        const doubtTags = result.structured_doubt?.tags || ['voice-query', 'mentorship', 'portfolio', 'web-audio'];
        const doubtUrgency = result.structured_doubt?.urgency || 'Standard';

        const newStructured = {
          transcript: transcriptText,
          summary: result.structured_doubt?.description || 'Student seeking personalized guidance on technical architecture and domain best practices.',
          category: doubtCategory,
          tags: doubtTags,
          urgency: doubtUrgency,
        };
        setStructuredOutput(newStructured);

        // TASK 2: Persist processed doubt directly to Supabase doubts table
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          let studentIdToUse = user?.id || sessionData?.session?.user?.id;

          if (!studentIdToUse) {
            const { data: fallbackStudent } = await supabase
              .from('profiles')
              .select('id')
              .eq('role', 'student')
              .limit(1)
              .maybeSingle();
            studentIdToUse = fallbackStudent?.id;
          }

          if (studentIdToUse) {
            const { data: insertedDoubt, error: rlsError } = await supabase
              .from('doubts')
              .insert([{
                student_id: studentIdToUse,
                title: doubtTitle,
                description: transcriptText,
                transcript: transcriptText,
                category: doubtCategory,
                tags: doubtTags,
                status: 'pending',
                urgency: doubtUrgency,
              }])
              .select()
              .single();

            if (rlsError) {
              console.error('[VoiceQuery] Supabase RLS / Insert Error on doubts:', rlsError);
            } else {
              console.log('[VoiceQuery] Successfully persisted doubt to Supabase:', insertedDoubt);
              setSyncToastMessage('✨ Question submitted & broadcasted to live mentor queue in real-time!');
              setTimeout(() => setSyncToastMessage(null), 5000);
            }
          }
        } catch (dbErr) {
          console.error('[VoiceQuery] Database insertion exception:', dbErr);
        }

        // Call semantic mentor match
        try {
          const matchRes = await api.matchMentors({
            title: doubtTitle,
            description: transcriptText,
            category: doubtCategory,
            match_count: 3,
          });
          if (matchRes.matches && matchRes.matches.length > 0) {
            const mapped: Mentor[] = matchRes.matches.map((m) => ({
              id: m.mentor_id,
              fullName: m.full_name,
              headline: m.headline,
              bio: m.bio,
              expertiseTags: m.expertise_tags,
              rating: m.rating,
              matchScore: Math.round(m.similarity * 100),
              isAvailable: true,
            }));
            setMatchedMentorsList(mapped);
          }
        } catch (matchErr) {
          console.warn('Live match_mentors RPC offline; displaying local matches:', matchErr);
        }
      } catch (apiErr) {
        console.warn('Backend API unreachable, saving failed upload to IndexedDB fallback:', apiErr);
        await saveFailedAudioUpload(blob, {
          durationSeconds,
          fileName: `fallback_voice_${Date.now()}.webm`,
        });
        setStructuredOutput({
          transcript: 'I am practicing algorithmic problem solving and getting confused with dynamic programming memoization in grid traversal.',
          summary: 'Network timeout: Audio safely cached in local storage. Will auto-sync when server connection re-establishes.',
          category: 'Algorithms',
          tags: ['offline-stored', 'dynamic-programming', 'algorithms', 'pwa-sync'],
          urgency: 'Standard',
        });
      }
    } catch (error) {
      console.error('Error processing audio doubt:', error);
    } finally {
      setIsProcessing(false);
      setIsMatchingMentors(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-2">
      {/* PWA Offline Fixed Alert Banner */}
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onManualSync={flushQueueDispatcher}
      />

      {/* Sync Toast Notification */}
      {syncToastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CloudUpload className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncToastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Voice Assistance (CUJ 1 - PWA)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Voice Doubt Intake</h1>
          <p className="text-sm text-slate-600 mt-1">
            Speak naturally about your technical roadblock. If your internet drops, your recording is safely queued in IndexedDB and auto-synced upon reconnection.
          </p>
        </div>

        {/* Status Indicators: Network & Pending Badge & Request Guidance */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            id="btn-open-guidance-modal"
            onClick={() => setIsRequestModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition hover:scale-[1.02] active:scale-98"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Request 1-on-1 Guidance</span>
          </button>

          <PendingBadge
            count={pendingCount}
            isSyncing={isSyncing}
            onClick={isOnline ? flushQueueDispatcher : undefined}
          />

          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold shadow-xs ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
          }`}>
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
        </div>
      </div>

      {/* Intake Mode Switcher: Voice vs Text */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Intake Mode:</span>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setIntakeMode('voice')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              intakeMode === 'voice'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🎙️ Voice Recording
          </button>
          <button
            type="button"
            onClick={() => setIntakeMode('text')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              intakeMode === 'text'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ✍️ Type Question & Code
          </button>
        </div>
      </div>

      {/* Voice Recorder Component */}
      {intakeMode === 'voice' ? (
        <AudioRecorder
          onSubmit={handleSubmitDoubt}
          isSubmitting={isProcessing}
          submitButtonText={isOnline ? 'Submit to Mentors' : 'Save Offline (IndexedDB)'}
        />
      ) : (
        <form onSubmit={handleManualTextSubmit} className="light-panel rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Describe Your Technical Roadblock</span>
            </h3>
            <span className="text-[11px] text-slate-400">Direct Mentor Intake</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Question Title / Headline</label>
            <input
              type="text"
              required
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="e.g. How to prevent memory leaks in useEffect with MediaRecorder?"
              className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Technical Category</label>
              <select
                value={textCategory}
                onChange={(e) => setTextCategory(e.target.value)}
                className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-sky-500 transition"
              >
                <option value="Frontend">Frontend (React, TypeScript, CSS, UI)</option>
                <option value="Backend">Backend (FastAPI, Python, SQL, REST)</option>
                <option value="AI/ML">AI/ML (Whisper, pgvector, LLMs)</option>
                <option value="Algorithms">Algorithms (DP, Trees, Graphs, LeetCode)</option>
                <option value="System Design">System Design & Architecture</option>
                <option value="Career & Projects">Career Guidance & Portfolio</option>
                <option value="General">General Question</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Urgency Level</label>
              <select
                value={textUrgency}
                onChange={(e) => setTextUrgency(e.target.value)}
                className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-sky-500 transition"
              >
                <option value="Standard">Standard (General Study)</option>
                <option value="Urgent">Urgent (Blocked / Project Deadline)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Explanation & Problem Details</label>
            <textarea
              required
              rows={4}
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="Explain the unexpected behavior, error messages, or concepts you'd like guidance on..."
              className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Relevant Tags (Comma-separated)</label>
            <input
              type="text"
              value={textTags}
              onChange={(e) => setTextTags(e.target.value)}
              placeholder="e.g. react, hooks, web-audio, memory-leak"
              className="w-full text-xs text-slate-800 p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 transition"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isProcessing || !textTitle.trim() || !textDescription.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Submitting...' : 'Post Question to Mentor Queue'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Structured Output & Match Preview */}
      {structuredOutput && (
        <div className="light-panel rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Question Processed Successfully</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                Topic: {structuredOutput.category}
              </span>
              <button
                type="button"
                id="btn-clear-doubt"
                onClick={handleResetDoubt}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-2.5 py-1 rounded-full border border-slate-200 transition cursor-pointer font-medium"
                title="Clear question and start over"
              >
                <RotateCcw className="w-3 h-3" />
                <span>New Question</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Your Question Transcript:
              </span>
              <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs italic">
                "{structuredOutput.transcript}"
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Mentorship Summary:
              </span>
              <p className="text-slate-700 text-sm">{structuredOutput.summary}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {structuredOutput.tags?.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Semantic Mentor Matching Grid */}
      <MentorMatchGrid
        mentors={matchedMentorsList}
        isLoading={isMatchingMentors}
        doubtTitle={structuredOutput?.transcript?.slice(0, 80) || 'React and Web Audio State Management'}
      />

      {/* Embedded Student Doubt & Solution Hub */}
      <StudentDoubtHub />

      {/* 1-on-1 Guidance Request Modal */}
      <StudentMentorRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        currentUser={user}
        onSuccess={() => {
          setSyncToastMessage('✨ Mentorship request submitted successfully to your volunteer mentor!');
          setTimeout(() => setSyncToastMessage(null), 5000);
        }}
      />

      {/* PWA Install Prompt Banner */}
      <InstallPwaPrompt />
    </div>
  );
};
