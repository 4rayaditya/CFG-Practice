'use client'

import { useState } from 'react'
import { Mic, Send, AlertCircle } from 'lucide-react'
import { set } from 'idb-keyval'

export default function DoubtsView() {
  const [doubtText, setDoubtText] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doubtText.trim()) return

    // Offline capability check
    if (!navigator.onLine) {
      await set(`doubt_${Date.now()}`, { text: doubtText, status: 'queued' })
      alert('You are offline. Your doubt has been saved and will sync when you reconnect.')
      setDoubtText('')
      return
    }

    // Normal submit (would connect to Supabase here)
    console.log('Submitting doubt:', doubtText)
    setDoubtText('')
    alert('Doubt submitted successfully!')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Ask a Doubt</h2>
        <p className="text-slate-600 mt-2">Stuck on a concept? Type it out or record a quick voice note.</p>
      </header>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        {!navigator.onLine && (
          <div className="mb-4 p-3 bg-orange-50 text-orange-800 rounded-lg flex items-center gap-2 text-sm border border-orange-200">
            <AlertCircle className="w-5 h-5" />
            You are currently offline. Doubts will be saved locally and sent automatically when internet returns.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition">
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Biology</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Question</label>
            <textarea
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              placeholder="e.g. I don't understand how to balance this redox equation..."
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                isRecording ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Mic className="w-5 h-5" />
              {isRecording ? 'Recording...' : 'Record Voice'}
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
