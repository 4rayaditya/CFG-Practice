import React from 'react';
import { Heart, Globe, Wifi, Users, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-white/30" />
              </div>
              <span className="text-base font-bold text-slate-900">MentorMatch Initiative</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-md">
              A nonprofit community effort dedicated to breaking educational barriers. We connect passionate volunteer mentors with students worldwide, enabling voice-first learning that works everywhere—even without continuous internet access.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Our Pillars</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>Offline-First Accessibility</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Volunteer Mentorship</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Safe & Inclusive Learning</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Get Involved</h4>
            <p className="text-xs text-slate-600">
              Join as a volunteer mentor or partner with your school or community center.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer">
                <Globe className="w-3.5 h-3.5" />
                <span>Nonprofit Education Program</span>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} MentorMatch. Empowering future leaders through accessible mentorship.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700 cursor-pointer">Privacy & Safety</span>
            <span>•</span>
            <span className="hover:text-slate-700 cursor-pointer">Student Accessibility</span>
            <span>•</span>
            <span className="hover:text-slate-700 cursor-pointer">Volunteer Code of Conduct</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
