import Link from 'next/link'
import { Users, FileAudio, MessageSquare, AlertTriangle } from 'lucide-react'

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">Shifting Orbits</h1>
          <p className="text-sm text-slate-400 mt-1">Mentor / Volunteer</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/volunteer" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <Users className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/volunteer/log-visit" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <FileAudio className="w-5 h-5" />
            Log Offline Visit
          </Link>
          <Link href="/volunteer/doubts" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <MessageSquare className="w-5 h-5" />
            Doubt Resolution
          </Link>
          <Link href="/volunteer/alerts" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition">
            <AlertTriangle className="w-5 h-5" />
            Parent Alerts
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition">
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
