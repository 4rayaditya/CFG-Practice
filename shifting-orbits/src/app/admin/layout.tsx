import Link from 'next/link'
import { LayoutDashboard, Shield, FileText, Settings, Activity } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-emerald-900 text-emerald-100 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6" /> Orbits
          </h1>
          <p className="text-sm text-emerald-400 mt-1">Admin Command Center</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-800 hover:text-white transition">
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>
          <Link href="/admin/impact-reports" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-800 hover:text-white transition">
            <FileText className="w-5 h-5" />
            Impact Reports
          </Link>
          <Link href="/admin/mentor-health" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-800 hover:text-white transition">
            <Activity className="w-5 h-5" />
            Mentor Health
          </Link>
          <Link href="/admin/priority-rules" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-800 hover:text-white transition">
            <Settings className="w-5 h-5" />
            Priority Engine
          </Link>
        </nav>
        
        <div className="p-4 border-t border-emerald-800">
          <button className="w-full text-left px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-800 rounded-lg transition">
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
