import { Trophy, Star, Medal, Zap, Lock } from 'lucide-react'

export default function RewardsView() {
  const earnedBadges = [
    { id: 1, name: 'Math Master', description: 'Score 90%+ in 3 Math quizzes', icon: <Medal className="w-8 h-8 text-yellow-500" />, color: 'bg-yellow-50' },
    { id: 2, name: '7-Day Streak', description: 'Log in and study 7 days in a row', icon: <Zap className="w-8 h-8 text-orange-500" />, color: 'bg-orange-50' },
    { id: 3, name: 'Curious Mind', description: 'Ask 5 doubts in one week', icon: <Star className="w-8 h-8 text-indigo-500" />, color: 'bg-indigo-50' },
  ]

  const lockedBadges = [
    { id: 4, name: 'Physics Prodigy', description: 'Score 90%+ in 3 Physics quizzes' },
    { id: 5, name: '30-Day Streak', description: 'Log in and study 30 days in a row' },
    { id: 6, name: 'Peer Helper', description: 'Resolve a peer\'s doubt in Buddy Chat' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="text-center py-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl text-white shadow-lg">
        <Trophy className="w-16 h-16 mx-auto text-yellow-300 mb-4" />
        <h2 className="text-4xl font-bold">Your Trophy Room</h2>
        <p className="mt-2 text-indigo-100 text-lg">You have earned 3 badges this month. Keep shining!</p>
      </header>

      <section>
        <h3 className="text-2xl font-semibold text-slate-800 mb-6">Earned Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {earnedBadges.map(badge => (
            <div key={badge.id} className={`${badge.color} p-6 rounded-2xl border border-white/50 shadow-sm flex flex-col items-center text-center transition hover:scale-105`}>
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                {badge.icon}
              </div>
              <h4 className="font-bold text-slate-800 text-lg">{badge.name}</h4>
              <p className="text-sm text-slate-600 mt-2">{badge.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-8">
        <h3 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          Locked Badges <Lock className="w-5 h-5 text-slate-400" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70">
          {lockedBadges.map(badge => (
            <div key={badge.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
              <div className="bg-slate-200 p-4 rounded-full mb-4">
                <Lock className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-700 text-lg">{badge.name}</h4>
              <p className="text-sm text-slate-500 mt-2">{badge.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
