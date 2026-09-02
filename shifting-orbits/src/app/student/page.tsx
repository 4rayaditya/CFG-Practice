import { BookOpen, CheckCircle, Clock } from 'lucide-react'

export default function StudentDashboard() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Welcome back, Student!</h2>
        <p className="text-slate-600 mt-2 text-lg">You are on a 7-day learning streak. Keep it up!</p>
      </header>

      {/* Career Progress */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Your Career Track: State STEM Entrance</h3>
        <div className="w-full bg-slate-100 rounded-full h-4 mb-2">
          <div className="bg-indigo-600 h-4 rounded-full w-[45%]"></div>
        </div>
        <p className="text-sm text-slate-500">45% Completed • Next Milestone: Advanced Algebra</p>
      </section>

      {/* Today's Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Today's Quizzes
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-700">Physics: Motion Vectors</span>
              <button className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition">Start</button>
            </li>
            <li className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-700 line-through">Math: Quadratic Equations</span>
              <CheckCircle className="text-green-500 w-5 h-5" />
            </li>
          </ul>
        </section>

        {/* Recent Doubts */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="text-orange-500" /> Recent Doubts
          </h3>
          <ul className="space-y-3">
            <li className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-medium text-slate-800 text-sm">"How to balance redox reactions?"</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">In Progress</span>
                <span className="text-slate-500">Mentor Rahul reviewing</span>
              </div>
            </li>
            <li className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-medium text-slate-800 text-sm">"Newton's third law example"</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Resolved</span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
