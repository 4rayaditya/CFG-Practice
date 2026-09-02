import React, { useState } from 'react';
import { 
  Users, 
  Send, 
  Sparkles, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Share2, 
  MessageSquare,
  Flame,
  Star,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  id: string;
  sender: 'me' | 'buddy';
  text: string;
  timestamp: string;
}

export const BuddyMentoring: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'buddy',
      text: 'Hey! I saw you scored 85% on yesterday\'s Physics quiz. Great job on the kinematics section!',
      timestamp: '10:14 AM'
    },
    {
      id: '2',
      sender: 'me',
      text: 'Thanks Amit! I was still a bit confused about rotational motion torque formulas though.',
      timestamp: '10:18 AM'
    },
    {
      id: '3',
      sender: 'buddy',
      text: 'No problem! Remember τ = r × F × sin(θ). The trick is to always look at the perpendicular distance from the pivot. Let\'s solve problem 4 together tonight?',
      timestamp: '10:20 AM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate smart buddy response
    setTimeout(() => {
      const buddyReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'buddy',
        text: 'Got it! I am reviewing that note right now. Keep pushing forward!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, buddyReply]);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-200" />
            <span>Peer-to-Peer Buddy Mentoring (P2P)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Connect, Collaborate & Learn with Senior Peers
          </h1>
          <p className="text-sm text-emerald-50 leading-relaxed">
            Paired with senior classmates who excel in your chosen curriculum track. Exchange study notes, solve daily challenges together, and celebrate wins.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Buddy Profile & Daily Challenge */}
        <div className="space-y-6">
          {/* Buddy Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Assigned Senior Peer
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>14-Day Streak</span>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-sky-500/20">
                AV
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>Amit Verma</span>
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                </h3>
                <p className="text-xs text-slate-500">Grade 12 • State STEM Track Scholar</p>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>4.95 Rating • 32 Doubts Resolved</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Strongest Subjects:</span>
                <span className="font-bold text-slate-800">Physics, Calculus</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Study Zone:</span>
                <span className="font-bold text-slate-800">Evenings (6 PM – 9 PM)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Peer Challenge:</span>
                <span className="font-bold text-emerald-700">Cooperative Review</span>
              </div>
            </div>
          </div>

          {/* Today's Buddy Challenge */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-sky-50 rounded-3xl border border-indigo-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-extrabold text-indigo-950">Today's Buddy Challenge</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                +50 XP
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              &ldquo;Explain Newton's Third Law with 2 everyday village/agricultural machinery examples and trade notes.&rdquo;
            </p>

            <button
              onClick={() => setChallengeCompleted(!challengeCompleted)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${
                challengeCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{challengeCompleted ? 'Challenge Completed!' : 'Mark Challenge Done'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Chat Room */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[580px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  AV
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Amit Verma (Buddy)</h4>
                <p className="text-[11px] text-slate-500">Active now • STEM Peer Guide</p>
              </div>
            </div>

            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Direct Peer Channel
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
            {messages.map((msg) => {
              const isMe = msg.sender === 'me';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-sky-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Amit a question or share study notes..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition shadow-sm"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuddyMentoring;
