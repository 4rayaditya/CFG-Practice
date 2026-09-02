'use client'

import { useState } from 'react'
import { Send, User } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'me' | 'buddy'
  timestamp: string
}

export default function BuddyMentoring() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! I saw you are also on the STEM track. Let me know if you need help with physics.',
      sender: 'buddy',
      timestamp: '10:00 AM'
    },
    {
      id: '2',
      text: 'Thanks! I actually struggled with the vectors quiz yesterday.',
      sender: 'me',
      timestamp: '10:05 AM'
    }
  ])
  const [inputText, setInputText] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, newMessage])
    setInputText('')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800">Buddy Mentoring</h2>
        <p className="text-slate-600 mt-2">Connect with a senior peer for guidance.</p>
      </header>

      <section className="bg-white flex-1 rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <div className="bg-indigo-100 p-2 rounded-full">
            <User className="text-indigo-600 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Amit Verma</h3>
            <p className="text-xs text-slate-500">Senior Buddy (Class 12)</p>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] rounded-2xl p-4 ${
                  msg.sender === 'me' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-2 text-right ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message your buddy..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition flex items-center justify-center shrink-0 w-10 h-10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
