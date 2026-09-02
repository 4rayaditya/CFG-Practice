import { AlertCircle, User, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function VolunteerDashboard() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Mentor Dashboard</h2>
          <p className="text-slate-600 mt-2">Here is what needs your attention today.</p>
        </div>
        <Link href="/volunteer/log-visit" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition">
          + New Field Visit
        </Link>
      </header>

      {/* Priority Action List */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <AlertCircle className="text-red-500" /> High Priority Students
        </h3>
        <p className="text-sm text-slate-500 mb-4">Students crossing the risk threshold (Score &gt; 70).</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 font-medium">Student Name</th>
                <th className="pb-3 font-medium">Risk Score</th>
                <th className="pb-3 font-medium">Flag Reason</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-100">
                <td className="py-4 font-medium text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Rajesh Kumar
                </td>
                <td className="py-4 text-red-600 font-bold">82</td>
                <td className="py-4 text-slate-600">3 Missed Sessions + High Vuln</td>
                <td className="py-4 flex gap-2">
                  <a 
                    href="https://wa.me/1234567890?text=Namaste,%20your%20child%20Rajesh%20missed%203%20study%20sessions.%20Please%20ensure%20they%20attend!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white bg-green-500 px-3 py-1.5 rounded-lg font-medium hover:bg-green-600 transition text-xs"
                  >
                    WhatsApp
                  </a>
                  <a 
                    href="sms:+1234567890?body=Namaste,%20your%20child%20Rajesh%20missed%203%20study%20sessions."
                    className="text-white bg-blue-500 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-600 transition text-xs"
                  >
                    SMS
                  </a>
                </td>
              </tr>
              <tr>
                <td className="py-4 font-medium text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Anita S.
                </td>
                <td className="py-4 text-orange-600 font-bold">71</td>
                <td className="py-4 text-slate-600">Failed 2 Quizzes</td>
                <td className="py-4 flex gap-2">
                  <a 
                    href="https://wa.me/1234567890?text=Namaste,%20your%20child%20Anita%20needs%20help%20with%20quizzes."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white bg-green-500 px-3 py-1.5 rounded-lg font-medium hover:bg-green-600 transition text-xs"
                  >
                    WhatsApp
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pending Doubts Queue */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MessageSquare className="text-indigo-500" /> Pending Doubts
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Chemistry</span>
              <p className="text-slate-800 font-medium mt-2">"I don't understand how to balance this redox equation."</p>
              <p className="text-xs text-slate-500 mt-1">From: Sunil • 15 mins ago</p>
            </div>
            <Link href="/volunteer/doubts" className="bg-white border border-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-sm hover:bg-slate-50 transition">
              Resolve
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
