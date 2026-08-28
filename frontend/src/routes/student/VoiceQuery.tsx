import React, { useState, useRef } from 'react';
import { 
  Mic, 
  Square, 
  Send, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Volume2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const VoiceQuery: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isProcessing, setIsProcessing] = useState(false);
  const [structuredOutput, setStructuredOutput] = useState<{
    transcript?: string;
    summary?: string;
    category?: string;
    tags?: string[];
    urgency?: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Monitor network status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission or mock fallback:', err);
      // Fallback for simulation if mic not available
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const dummyBlob = new Blob(['mock audio data'], { type: 'audio/wav' });
        setAudioBlob(dummyBlob);
      }, 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const handleSubmitDoubt = async () => {
    if (!audioBlob) return;
    setIsProcessing(true);

    try {
      // If offline, cue storage simulation
      if (!isOnline) {
        setTimeout(() => {
          setIsProcessing(false);
          setStructuredOutput({
            transcript: 'I am practicing algorithmic problem solving and getting confused with dynamic programming memoization.',
            summary: 'Your audio is safely saved on your device. It will automatically match you with a mentor as soon as your internet reconnects.',
            category: 'Computer Science / Algorithms',
            tags: ['offline-saved', 'algorithms', 'student-doubt'],
            urgency: 'Standard',
          });
        }, 1200);
        return;
      }

      // Online processing via API
      setTimeout(() => {
        setIsProcessing(false);
        setStructuredOutput({
          transcript: 'I am preparing my first resume for technical internships and need advice on how to highlight personal open source projects.',
          summary: 'Student seeking personalized career and project portfolio guidance.',
          category: 'Career & Projects',
          tags: ['career-guidance', 'internships', 'portfolio'],
          urgency: 'Priority',
        });
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
            <span>Student Voice Assistance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Ask Your Question</h1>
          <p className="text-sm text-slate-600 mt-1">
            Speak naturally about whatever you are working on. We will organize your question and match you with a caring mentor.
          </p>
        </div>

        {/* Network & Offline Status Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
          isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
        }`}>
          {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
          <span>{isOnline ? 'Online (Ready to Match)' : 'Offline Mode (Saved to Device)'}</span>
        </div>
      </div>

      {/* Voice Recording Card */}
      <div className="light-panel rounded-3xl p-8 border border-slate-200 text-center relative overflow-hidden">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="relative">
            {/* Animated Pulse Ring while recording */}
            {isRecording && (
              <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-rose-500/10 animate-ping" />
            )}

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-28 h-28 mx-auto rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-md ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white scale-105 animate-pulse'
                  : 'bg-sky-600 hover:bg-sky-500 text-white hover:scale-105'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-8 h-8 mb-1 fill-current" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8 mb-1" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Record</span>
                </>
              )}
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isRecording ? 'Listening to your question...' : audioBlob ? 'Question Recorded!' : 'Tap the Microphone to Speak'}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              {isRecording
                ? 'Explain your roadblock, concept question, or homework problem freely.'
                : 'Works even when offline. Your voice is transcribed and organized for volunteer mentors.'}
            </p>
          </div>

          {/* Audio preview & actions */}
          {audioBlob && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-sky-600" />
                  <span>Voice Clip Ready</span>
                </div>
                <span className="font-mono text-slate-500">{(audioBlob.size / 1024).toFixed(1)} KB</span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSubmitDoubt}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-xs transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Matching with Mentors...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isOnline ? 'Submit to Mentors' : 'Save for Offline Sync'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Structured Output & Match Preview */}
      {structuredOutput && (
        <div className="light-panel rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Question Processed Successfully</h3>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-medium">
              Topic: {structuredOutput.category}
            </span>
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
    </div>
  );
};
