import { CheckCircle, Circle, ArrowRight } from 'lucide-react'

export default function CareerTrack() {
  const milestones = [
    { id: 1, title: 'Foundational Math', status: 'completed' },
    { id: 2, title: 'Basic Physics (Kinematics)', status: 'completed' },
    { id: 3, title: 'Advanced Algebra', status: 'current' },
    { id: 4, title: 'Thermodynamics', status: 'locked' },
    { id: 5, title: 'State STEM Entrance Mock Exam', status: 'locked' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Your Career Track</h2>
        <p className="text-slate-600 mt-2">Target: <span className="font-semibold text-indigo-600">State STEM Entrance Exam</span></p>
      </header>

      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
        <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-slate-200 z-0"></div>

        <div className="space-y-8 relative z-10">
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="flex items-start gap-6">
              <div className="bg-white rounded-full">
                {milestone.status === 'completed' && <CheckCircle className="w-8 h-8 text-green-500" />}
                {milestone.status === 'current' && (
                  <div className="w-8 h-8 rounded-full border-4 border-indigo-600 bg-white flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                  </div>
                )}
                {milestone.status === 'locked' && <Circle className="w-8 h-8 text-slate-300" />}
              </div>
              
              <div className={`flex-1 p-5 rounded-xl border ${
                milestone.status === 'current' 
                  ? 'border-indigo-200 bg-indigo-50 shadow-sm' 
                  : 'border-slate-100 bg-slate-50'
              }`}>
                <h3 className={`font-semibold text-lg ${milestone.status === 'locked' ? 'text-slate-500' : 'text-slate-800'}`}>
                  Step {idx + 1}: {milestone.title}
                </h3>
                
                {milestone.status === 'current' && (
                  <div className="mt-4">
                    <p className="text-sm text-indigo-700 mb-3">You are 45% through this milestone.</p>
                    <div className="w-full bg-indigo-100 rounded-full h-2 mb-4">
                      <div className="bg-indigo-600 h-2 rounded-full w-[45%]"></div>
                    </div>
                    <button className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                      Continue Learning <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
