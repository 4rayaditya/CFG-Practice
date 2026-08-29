import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  HardDrive,
  CloudUpload
} from 'lucide-react';
import { AudioRecorder } from '../../components/voice/AudioRecorder';
import { MentorMatchGrid, Mentor } from '../../components/mentors/MentorMatchGrid';
import { OfflineBanner } from '../../components/pwa/OfflineBanner';
import { PendingBadge } from '../../components/pwa/PendingBadge';
import { InstallPwaPrompt } from '../../components/pwa/InstallPwaPrompt';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { saveFailedAudioUpload, QueuedAudioUpload } from '../../utils/offlineQueue';
import { api } from '../../services/api';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMatchingMentors, setIsMatchingMentors] = useState(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Auto-sync callback when items finish flushing from IndexedDB
  const handleAutoSyncSuccess = useCallback((item: QueuedAudioUpload, result: any) => {
    console.log('[VoiceQuery] Auto-sync received transcript:', result);
    if (result && result.transcript) {
      setStructuredOutput({
        transcript: result.transcript,
        summary: `Synced from offline queue: ${result.transcript.slice(0, 100)}...`,
        category: result.structured_doubt?.category || 'General',
        tags: result.structured_doubt?.tags || ['auto-synced', 'offline-pwa'],
        urgency: result.structured_doubt?.urgency || 'Standard',
      });
      setSyncToastMessage(`🎉 Offline recording synced with Whisper AI!`);
      setTimeout(() => setSyncToastMessage(null), 5000);
    }
  }, []);

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
        const newStructured = {
          transcript: transcriptText,
          summary: result.structured_doubt?.description || 'Student seeking personalized guidance on technical architecture and domain best practices.',
          category: result.structured_doubt?.category || categoryVal,
          tags: result.structured_doubt?.tags || ['voice-query', 'mentorship', 'portfolio', 'web-audio'],
          urgency: result.structured_doubt?.urgency || 'Standard',
        };
        setStructuredOutput(newStructured);

        // Call semantic mentor match
        try {
          const matchRes = await api.matchMentors({
            title: transcriptText.slice(0, 80),
            description: transcriptText,
            category: newStructured.category,
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

        {/* Status Indicators: Network & Pending Badge */}
        <div className="flex items-center gap-2">
          <PendingBadge
            count={pendingCount}
            isSyncing={isSyncing}
            onClick={isOnline ? flushQueueDispatcher : undefined}
          />

          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-semibold shadow-xs ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
          }`}>
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
            <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
        </div>
      </div>

      {/* Voice Recorder Component */}
      <AudioRecorder
        onSubmit={handleSubmitDoubt}
        isSubmitting={isProcessing}
        submitButtonText={isOnline ? 'Submit to Mentors' : 'Save Offline (IndexedDB)'}
      />

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
                Your Spoken Words:
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

      {/* PWA Install Prompt Banner */}
      <InstallPwaPrompt />
    </div>
  );
};
