'use client'

import { Download, Users, CheckCircle, Activity, Award } from 'lucide-react'

export default function AdminDashboard() {
  const handleExport = () => {
    alert('Generating PDF Report for CSR Donors...')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">NGO Operations Command Center</h2>
          <p className="text-slate-600 mt-2">Platform telemetry and impact tracking.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Impact Report
        </button>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="text-slate-500 mb-2 flex justify-between items-center">
            <span className="font-medium">Active Students</span>
            <Users className="text-emerald-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-slate-800">1,248</p>
          <p className="text-xs text-green-600 mt-2">+12% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="text-slate-500 mb-2 flex justify-between items-center">
            <span className="font-medium">Doubts Resolved</span>
            <CheckCircle className="text-indigo-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-slate-800">3,892</p>
          <p className="text-xs text-slate-500 mt-2">Avg SLA: 24 mins</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="text-slate-500 mb-2 flex justify-between items-center">
            <span className="font-medium">Field Hours (STT)</span>
            <Activity className="text-orange-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-slate-800">412 hrs</p>
          <p className="text-xs text-slate-500 mt-2">Via offline sync</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="text-slate-500 mb-2 flex justify-between items-center">
            <span className="font-medium">Dropouts Prevented</span>
            <Award className="text-blue-500 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-slate-800">84</p>
          <p className="text-xs text-slate-500 mt-2">Priority Engine triggers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mentor Health */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Mentor Health Audit</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-medium text-slate-800">Mentor: Sunita P.</p>
                <p className="text-sm text-slate-500 mt-1">Last active: 8 days ago</p>
              </div>
              <button className="text-sm bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">
                Reassign Students
              </button>
            </div>
          </div>
        </section>

        {/* Priority Engine Tuning */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Priority Engine Weights</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">Attendance Deficit</span>
                <span className="font-bold text-slate-800">35%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full w-[35%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">Quiz Failures</span>
                <span className="font-bold text-slate-800">25%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full w-[25%]"></div>
              </div>
            </div>
            <button className="w-full text-sm mt-4 border border-emerald-200 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition">
              Tune Algorithm
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
