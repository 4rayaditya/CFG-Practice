import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  Heart, 
  Users, 
  WifiOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  Compass, 
  BookOpen,
  MessageCircleHeart
} from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 max-w-4xl mx-auto pt-6 pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold uppercase tracking-wider shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Nonprofit Educational Mentorship Initiative</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight sm:leading-none">
          Every Student Deserves a Mentor. <br />
          <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Speak Your Question. Learn & Grow.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          We connect ambitious students with caring volunteer mentors across the globe. 
          Simply speak your doubts aloud—even without an active internet connection—and receive personalized guidance to unlock your full potential.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/student/voice-query"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-600/20 hover:-translate-y-0.5 transition duration-200"
          >
            <Mic className="w-5 h-5" />
            <span>Ask a Question by Voice</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/mentor/doubt-board"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold shadow-xs hover:-translate-y-0.5 transition duration-200"
          >
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Volunteer as a Mentor</span>
          </Link>

          <Link
            to="/roadmap"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium hover:-translate-y-0.5 transition duration-200"
          >
            <Compass className="w-5 h-5 text-sky-600" />
            <span>Explore Learning Paths</span>
          </Link>
        </div>
      </section>

      {/* 3 Core Empowering Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="light-card light-card-hover p-6 rounded-2xl border border-slate-200/80">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-4 text-sky-600">
            <Mic className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Voice-First Accessibility</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            No need to struggle typing complex equations or technical roadblocks. Just hit record and explain your question naturally in your own words.
          </p>
        </div>

        <div className="light-card light-card-hover p-6 rounded-2xl border border-slate-200/80">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
            <WifiOff className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Works Anywhere (Offline-Ready)</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Studying on the bus or in low-connectivity areas? Record your thoughts anytime. Our app saves your questions and sends them automatically once you reconnect.
          </p>
        </div>

        <div className="light-card light-card-hover p-6 rounded-2xl border border-slate-200/80">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4 text-purple-600">
            <Heart className="w-6 h-6 fill-purple-100" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Dedicated Caring Mentors</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Get matched with experienced educators and industry volunteers who provide constructive, compassionate, and step-by-step guidance.
          </p>
        </div>
      </section>

      {/* How It Works (Simple 3 Steps) */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How MentorMatch Empowers You</h2>
          <p className="text-sm text-slate-600">A seamless, friendly learning journey in three simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="space-y-3 relative text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900">Speak Your Question</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tap the microphone whenever you are stuck on a concept, assignment, or project roadblock.
            </p>
          </div>

          <div className="space-y-3 relative text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900">Intelligent Matching</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our intelligent engine analyzes your question and routes it directly to mentors specialized in your topic.
            </p>
          </div>

          <div className="space-y-3 relative text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center mx-auto sm:mx-0">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900">Learn & Move Forward</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive structured, encouraging feedback and interactive roadmaps to master your subject with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Community Impact & Testimonial Highlight */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-sky-500 to-sky-700 text-white rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-md shadow-sky-600/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
              <MessageCircleHeart className="w-3.5 h-3.5" />
              <span>Student Story</span>
            </div>
            <p className="text-lg sm:text-xl font-medium leading-relaxed italic">
              "Being able to record my questions during my commute with no internet, and having a mentor answer by the time I get home, has completely changed how I learn."
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              AC
            </div>
            <div>
              <div className="font-semibold text-sm">Alex Chen</div>
              <div className="text-xs text-sky-100">First-Generation Computer Science Student</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-md shadow-emerald-600/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Mentor Perspective</span>
            </div>
            <p className="text-lg sm:text-xl font-medium leading-relaxed italic">
              "Volunteering with MentorMatch lets me give back directly to enthusiastic students who just need a guiding hand and a little encouragement."
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              SJ
            </div>
            <div>
              <div className="font-semibold text-sm">Dr. Sarah Jenkins</div>
              <div className="text-xs text-emerald-100">Volunteer Mentor & Senior Engineer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="light-panel rounded-3xl p-8 sm:p-10 border border-slate-200 text-center space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">Ready to start your mentorship journey?</h3>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Whether you are a student looking for guidance or an expert wanting to inspire the next generation, we welcome you to our community.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/student/voice-query"
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-sm transition"
          >
            Start Learning as a Student
          </Link>
          <Link
            to="/mentor/doubt-board"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm transition"
          >
            Sign Up as a Volunteer Mentor
          </Link>
        </div>
      </section>
    </div>
  );
};
