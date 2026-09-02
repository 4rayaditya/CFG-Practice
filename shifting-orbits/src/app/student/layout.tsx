import Link from 'next/link'
import { BookOpen, User, HelpCircle, Trophy } from 'lucide-react'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">Shifting Orbits</h1>
          <p className="text-sm text-slate-500 mt-1">Student Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/student" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
            <BookOpen className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/student/doubts" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
            <HelpCircle className="w-5 h-5" />
            Ask a Doubt
          </Link>
          <Link href="/student/career" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
            <User className="w-5 h-5" />
            Career Track
          </Link>
          <Link href="/student/rewards" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition">
            <Trophy className="w-5 h-5" />
            Badges
          </Link>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
