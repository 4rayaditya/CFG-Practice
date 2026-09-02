'use client'

import { useState } from 'react'
import { CheckCircle, Mic, Send } from 'lucide-react'

export default function DoubtResolution() {
  const [activeDoubt, setActiveDoubt] = useState<number | null>(1)
  const [responseText, setResponseText] = useState('')

  const doubts = [
    {
      id: 1,
      studentName: 'Sunil Verma',
      subject: 'Chemistry',
      text: "I don't understand how to balance this redox equation. The electrons aren't adding up on both sides.",
      time: '15 mins ago',
      status: 'pending'
    },
    {
      id: 2,
      studentName: 'Anita S.',
      subject: 'Physics',
      text: "Can someone explain Newton's third law with a real-life example?",
      time: '1 hour ago',
      status: 'pending'
    }
  ]

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault()
    if (!responseText.trim()) return
    alert('Response sent to student! Doubt marked as resolved.')
    setResponseText('')
    setActiveDoubt(null)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Doubt Resolution Desk</h2>
        <p className="text-slate-600 mt-2">Help students by answering their routed questions.</p>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Queue List */}
        <div className="w-1/3 bg-white border border-slate-200 rounded-2xl overflow-y-auto shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
            Pending Queue ({doubts.length})
          </div>
          <div className="divide-y divide-slate-100">
            {doubts.map(doubt => (
              <div 
                key={doubt.id} 
                onClick={() => setActiveDoubt(doubt.id)}
                className={`p-4 cursor-pointer transition ${
                  activeDoubt === doubt.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-white px-2 py-1 rounded border border-indigo-100">{doubt.subject}</span>
                  <span className="text-xs text-slate-400">{doubt.time}</span>
                </div>
                <h4 className="font-medium text-slate-800 truncate">{doubt.studentName}</h4>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{doubt.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Panel */}
        <div className="w-2/3 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
          {activeDoubt ? (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                    {doubts.find(d => d.id === activeDoubt)?.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{doubts.find(d => d.id === activeDoubt)?.studentName}</h3>
                    <p className="text-xs text-slate-500">Class 10 • {doubts.find(d => d.id === activeDoubt)?.subject}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 shadow-sm">
                  "{doubts.find(d => d.id === activeDoubt)?.text}"
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-end">
                <form onSubmit={handleResolve} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Response</label>
                    <textarea
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      placeholder="Type your explanation here..."
                      className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <button type="button" className="flex items-center gap-2 text-slate-600 bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition text-sm font-medium">
                      <Mic className="w-4 h-4" /> Record Audio Reply
                    </button>
                    <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium">
                      <Send className="w-4 h-4" /> Send Resolution
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <CheckCircle className="w-16 h-16 mb-4 text-slate-200" />
              <p>Select a doubt from the queue to resolve it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
