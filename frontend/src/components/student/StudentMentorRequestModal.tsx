import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Home, 
  PhoneCall, 
  UserCheck,
  Clock,
  Heart
} from 'lucide-react';
import type { MentorshipRequest, User as UserType } from '../../types';
import { submitMentorshipRequest, getPersistedMentors } from '../../data/mockData';

interface StudentMentorRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onSuccess?: (req: MentorshipRequest) => void;
}

export const StudentMentorRequestModal: React.FC<StudentMentorRequestModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const mentors = getPersistedMentors();
  const [selectedMentorId, setSelectedMentorId] = useState<string>(
    currentUser?.assignedMentorId || (mentors.length > 0 ? mentors[0].id : '')
  );
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [preferredMode, setPreferredMode] = useState<'In-Person Home Visit' | 'Audio/Voice Call' | 'Doubt Chat Guidance'>('In-Person Home Visit');
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent'>('Standard');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedMentor = mentors.find((m) => m.id === selectedMentorId) || mentors[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !description.trim()) {
      setErrorMsg('Please enter both a topic and a brief description of your request.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const newReq = submitMentorshipRequest({
      studentId: currentUser?.id || 'stu-001',
      studentName: currentUser?.fullName || currentUser?.name || 'Rahul Kumar',
      studentAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      mentorId: selectedMentor?.id || mentors[0].id,
      mentorName: selectedMentor?.fullName || mentors[0].fullName,
      topic: topic.trim(),
      description: description.trim(),
      urgency,
      preferredMode,
    });

    setLoading(false);
    setSuccessMsg(true);

    if (onSuccess) {
      onSuccess(newReq);
    }

    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
              <Heart className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-sky-300 bg-sky-900/60 px-2 py-0.5 rounded border border-sky-400/30">
                1-on-1 Guidance
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">Request Mentor Support</h2>
              <p className="text-xs text-slate-300">
                Connect directly with your volunteer mentor or request an offline home visit.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Mentorship request sent! Your mentor has been notified.</span>
            </div>
          )}

          {/* Select Mentor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select Mentor
            </label>
            <select
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
            >
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.headline})
                </option>
              ))}
            </select>
          </div>

          {/* Request Topic */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Topic / Purpose *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Board Exam Study Strategy, Broken Device Help, College Form"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what roadblock you are facing and what help you need from your mentor..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>

          {/* Preferred Interaction Mode & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Preferred Mode
              </label>
              <select
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              >
                <option value="In-Person Home Visit">🏠 In-Person Home Visit</option>
                <option value="Audio/Voice Call">📞 Audio/Voice Call</option>
                <option value="Doubt Chat Guidance">💬 Doubt Chat Guidance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none ${
                  urgency === 'Urgent' ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Standard">Standard Priority</option>
                <option value="Urgent">🚨 Urgent (Exam / Financial Block)</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || successMsg}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
