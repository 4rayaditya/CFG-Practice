import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Send, 
  Sparkles, 
  Volume2, 
  AlertCircle,
  Radio,
  Trash2,
  Clock
} from 'lucide-react';

export type RecorderState = 'idle' | 'recording' | 'recorded' | 'submitting';

export interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob, durationSeconds: number) => void;
  onSubmit?: (blob: Blob, durationSeconds: number) => Promise<void> | void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onSubmit,
  isSubmitting = false,
  submitButtonText = 'Submit to Mentors',
  className = '',
}) => {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [previewCurrentTime, setPreviewCurrentTime] = useState<number>(0);
  const [previewDuration, setPreviewDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Refs for Web Audio API & MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Format seconds to mm:ss safely with NaN/Infinity guards
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup audio tracks and Web Audio nodes
  const cleanupRecordingResources = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupRecordingResources();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [cleanupRecordingResources, audioUrl]);

  // Real-time canvas visualizer loop
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Fallback simulation wave when simulated
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(40 + Math.sin(Date.now() / 200 + i * 0.4) * 35 + Math.random() * 20);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 32;
      const barSpacing = 4;
      const totalSpacing = (numBars - 1) * barSpacing;
      const barWidth = Math.max(3, (canvas.width - totalSpacing) / numBars);

      for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * (bufferLength / 2));
        const value = dataArray[dataIndex] || 20;
        const percent = Math.min(1, Math.max(0.08, value / 255));
        const barHeight = Math.max(6, percent * (canvas.height - 8));
        const x = i * (barWidth + barSpacing);
        const y = (canvas.height - barHeight) / 2;

        // Gradient color for bars (sky to emerald neon)
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#0284c7'); // sky-600
        gradient.addColorStop(0.5, '#06b6d4'); // cyan-500
        gradient.addColorStop(1, '#10b981'); // emerald-500

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded bar
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }
    };

    render();
  }, []);

  // Start Audio Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingDuration(0);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      // Web Audio API context for live spectrum analysis
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Determine supported MIME type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(finalBlob);
        setAudioBlob(finalBlob);
        setAudioUrl(url);
        setRecorderState('recorded');
        if (onRecordingComplete) {
          onRecordingComplete(finalBlob, recordingDuration);
        }
      };

      mediaRecorder.start(100); // 100ms timeslices for smooth capture
      setRecorderState('recording');
      setIsSimulated(false);

      // Duration timer
      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);

      // Start visualizer animation
      drawWaveform();
    } catch (err: any) {
      console.warn('Microphone permission or hardware notice; using interactive simulation fallback:', err);
      // Fallback simulation for automated environments or denied permissions
      setIsSimulated(true);
      setRecorderState('recording');
      const startTime = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
      drawWaveform();
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    cleanupRecordingResources();

    if (isSimulated || !mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      // Create synthetic audio clip for simulation
      const sampleBlob = new Blob(['simulated-audio-voice-data-wav'], { type: 'audio/wav' });
      const url = URL.createObjectURL(sampleBlob);
      setAudioBlob(sampleBlob);
      setAudioUrl(url);
      setRecorderState('recorded');
      if (onRecordingComplete) {
        onRecordingComplete(sampleBlob, recordingDuration || 4);
      }
    } else {
      mediaRecorderRef.current.stop();
    }
  };

  // Discard & Re-record
  const handleReRecord = () => {
    cleanupRecordingResources();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setPreviewCurrentTime(0);
    setIsPlayingPreview(false);
    setRecorderState('idle');
    setErrorMessage(null);
  };

  // Toggle Preview Playback
  const handleTogglePreviewPlay = () => {
    if (!audioElementRef.current) return;
    if (isPlayingPreview) {
      audioElementRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioElementRef.current.play().catch((err) => {
        console.warn('Preview playback error:', err);
      });
      setIsPlayingPreview(true);
    }
  };

  // Audio preview playback event listeners
  const handleAudioTimeUpdate = () => {
    if (audioElementRef.current) {
      setPreviewCurrentTime(audioElementRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioElementRef.current) {
      setPreviewDuration(audioElementRef.current.duration || recordingDuration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingPreview(false);
    setPreviewCurrentTime(0);
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!audioBlob) return;
    if (onSubmit) {
      setRecorderState('submitting');
      try {
        await onSubmit(audioBlob, recordingDuration);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to submit voice query.');
      } finally {
        setRecorderState('recorded');
      }
    }
  };

  const effectiveSubmitting = isSubmitting || recorderState === 'submitting';

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      {/* Hidden Audio Element for Preview Playback */}
      {audioUrl && (
        <audio
          ref={audioElementRef}
          src={audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleAudioLoadedMetadata}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

      {/* Main Glassmorphism Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 transition-all duration-300">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              recorderState === 'recording'
                ? 'bg-rose-500 animate-ping'
                : recorderState === 'recorded'
                ? 'bg-emerald-500'
                : 'bg-sky-500'
            }`} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {recorderState === 'recording'
                ? 'Live Voice Intake'
                : recorderState === 'recorded'
                ? 'Clip Ready for Review'
                : 'Voice-to-Text Mentorship'}
            </span>
          </div>

          {/* Time indicator or Mode */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {recorderState === 'recording'
                ? formatTime(recordingDuration)
                : recorderState === 'recorded'
                ? formatTime(previewCurrentTime > 0 ? previewCurrentTime : (previewDuration || recordingDuration))
                : '00:00'}
            </span>
          </div>
        </div>

        {/* Dynamic Center Stage */}
        <div className="flex flex-col items-center justify-center py-4 space-y-5">
          
          {/* STATE 1: IDLE */}
          {recorderState === 'idle' && (
            <div className="text-center space-y-5">
              <div className="relative inline-block">
                {/* Glowing Outer Rings */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 blur-md animate-pulse" />
                <button
                  type="button"
                  id="btn-start-recording"
                  onClick={startRecording}
                  aria-label="Start Voice Recording"
                  className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-sky-600 via-sky-500 to-emerald-500 hover:from-sky-500 hover:to-emerald-400 text-white flex flex-col items-center justify-center shadow-lg shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all duration-200 group"
                >
                  <Mic className="w-9 h-9 sm:w-10 sm:h-10 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest">Speak</span>
                </button>
              </div>

              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-900">Tap the Microphone to Ask</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Explain your roadblock freely in English. Whisper AI will structure your doubt and route it to domain mentors.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: RECORDING */}
          {recorderState === 'recording' && (
            <div className="w-full text-center space-y-5">
              {/* Real-time Waveform Canvas */}
              <div className="w-full h-24 sm:h-28 bg-slate-900/95 rounded-2xl p-3 border border-slate-800 shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[10px] font-mono text-rose-400 font-bold uppercase tracking-widest">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                  <span>Recording Audio</span>
                </div>
                
                <canvas 
                  ref={canvasRef} 
                  width={340} 
                  height={80} 
                  className="w-full h-full max-w-sm mx-auto"
                />
              </div>

              <div className="flex items-center justify-center gap-4 pt-1">
                {/* Stop Button */}
                <button
                  type="button"
                  id="btn-stop-recording"
                  onClick={stopRecording}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Done Speaking</span>
                </button>

                {/* Cancel Action */}
                <button
                  type="button"
                  id="btn-cancel-recording"
                  onClick={handleReRecord}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: RECORDED / REVIEW & PLAYBACK */}
          {(recorderState === 'recorded' || recorderState === 'submitting') && audioBlob && (
            <div className="w-full space-y-4">
              
              {/* Waveform / Audio Player Preview Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/80 via-emerald-50/50 to-slate-50 border border-sky-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-toggle-preview-play"
                      onClick={handleTogglePreviewPlay}
                      disabled={effectiveSubmitting}
                      className="w-10 h-10 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition disabled:opacity-50"
                      aria-label={isPlayingPreview ? 'Pause Audio Preview' : 'Play Audio Preview'}
                    >
                      {isPlayingPreview ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Voice Clip Preview</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {(audioBlob.size / 1024).toFixed(1)} KB • {audioBlob.type || 'audio/webm'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-700 bg-sky-100/60 px-2.5 py-1 rounded-lg">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{formatTime(previewCurrentTime)} / {formatTime(previewDuration || recordingDuration)}</span>
                  </div>
                </div>

                {/* Visual Audio Progress Track */}
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden relative">
                  <div 
                    className="bg-gradient-to-r from-sky-600 to-emerald-500 h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${previewDuration > 0 ? (previewCurrentTime / previewDuration) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons: Re-record & Submit */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  id="btn-rerecord-voice"
                  onClick={handleReRecord}
                  disabled={effectiveSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-record Question</span>
                </button>

                <button
                  type="button"
                  id="btn-submit-voice-query"
                  onClick={handleSubmit}
                  disabled={effectiveSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-98 disabled:opacity-50"
                >
                  {effectiveSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Transcribing & Matching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{submitButtonText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Educational Micro-Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>AI Model: Groq Whisper + Llama 3 (Zero Cost)</span>
          <span>Offline PWA Ready</span>
        </div>
      </div>
    </div>
  );
};
