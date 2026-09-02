'use client'

import { useState } from 'react'
import { Mic, Square, Save, WifiOff } from 'lucide-react'
import { set } from 'idb-keyval'

export default function LogVisit() {
  const [isRecording, setIsRecording] = useState(false)
  const [logText, setLogText] = useState('')
  const [studentId, setStudentId] = useState('')

  const handleRecordToggle = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setLogText('Recording audio... (In a real app, MediaRecorder API will capture the audio stream here)')
    } else {
      setLogText('Visited Rajesh. Attendance dropped due to harvesting season. Mother requested evening coursework.')
    }
  }

  const handleSave = async () => {
    if (!studentId || !logText) {
      alert('Please fill out student and log details.')
      return
    }

    const logData = {
      studentId,
      logText,
      timestamp: Date.now(),
      status: 'pending_sync'
    }

    if (!navigator.onLine) {
      // Save offline via IndexedDB
      await set(`field_log_${Date.now()}`, logData)
      alert('Saved offline. Will sync automatically when connection restores.')
    } else {
      // Sync immediately
      console.log('Syncing to Supabase / Whisper API...', logData)
      alert('Visit log saved and analyzed successfully!')
    }

    setLogText('')
    setStudentId('')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Log Field Visit</h2>
        <p className="text-slate-600 mt-2">Record your observations offline. Audio will be converted to text later.</p>
      </header>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        {!navigator.onLine && (
          <div className="mb-6 p-4 bg-orange-50 rounded-xl flex items-start gap-3 border border-orange-200">
            <WifiOff className="text-orange-600 w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-orange-800">You are offline</p>
              <p className="text-sm text-orange-700 mt-1">Logs will be securely saved to your device and synced when you return to a network zone.</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Student</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-slate-900"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
            >
              <option value="">-- Choose Student --</option>
              <option value="stu_123">Rajesh Kumar</option>
              <option value="stu_124">Anita S.</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Audio Log</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <button 
                onClick={handleRecordToggle}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <p className="mt-4 text-sm text-slate-500">
                {isRecording ? 'Tap to stop recording' : 'Tap to start voice note'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Transcribed Text (Preview)</label>
            <textarea
              value={logText}
              onChange={e => setLogText(e.target.value)}
              placeholder="Your recorded text will appear here..."
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition font-medium"
          >
            <Save className="w-5 h-5" />
            Save Log
          </button>
        </div>
      </section>
    </div>
  )
}
