import React from 'react';
import { Sparkles, Shield, Cpu, WifiOff } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">MentorMatch AI v1.0</span>
            <span>• Built for offline-first voice mentorship</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Whisper + GPT-4o-mini</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>pgvector Matching</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>PWA Offline Sync</span>
            </div>
          </div>

          <div className="text-slate-500">
            Person 3 • UI & Analytics Engineering
          </div>
        </div>
      </div>
    </footer>
  );
};
