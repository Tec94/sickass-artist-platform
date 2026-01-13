import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

// Mock Data until backend is ready
const MOCK_QUESTS = [
  { id: 1, title: 'First Blood', type: 'milestone', description: 'Join your first event', reward: 500, active: true },
  { id: 2, title: 'Weekly Chatter', type: 'daily', description: 'Post 5 messages in Discord', reward: 100, active: true },
];

export const AdminQuests = () => {
  const { user } = useAuth()
  const [quests, setQuests] = useState(MOCK_QUESTS)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'daily',
    description: '',
    reward: 100,
  })

  const handleCreate = () => {
    const newQuest = {
      id: quests.length + 1,
      ...formData,
      active: true
    }
    setQuests([...quests, newQuest])
    setIsCreating(false)
    setFormData({ title: '', type: 'daily', description: '', reward: 100 })
  }

  const handleDelete = (id: number) => {
    setQuests(quests.filter(q => q.id !== id))
  }

  if (!user || user.role !== 'admin') {
    return <div className="text-zinc-500 p-8">Admin access required</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Quests</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded font-semibold hover:shadow-lg"
        >
          {isCreating ? 'Cancel' : 'Create Quest'}
        </button>
      </div>

      {isCreating && (
        <div className="bg-zinc-900/50 p-6 rounded-lg border border-purple-600 mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-4">New Quest</h2>
          <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <input 
                 type="text" 
                 placeholder="Quest Title" 
                 className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
                 value={formData.title}
                 onChange={e => setFormData({...formData, title: e.target.value})}
               />
               <select 
                 className="px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
                 value={formData.type}
                 onChange={e => setFormData({...formData, type: e.target.value})}
               >
                 <option value="daily">Daily</option>
                 <option value="milestone">Milestone</option>
                 <option value="weekly">Weekly</option>
               </select>
             </div>
             <input 
                 type="text" 
                 placeholder="Description" 
                 className="w-full px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
                 value={formData.description}
                 onChange={e => setFormData({...formData, description: e.target.value})}
               />
             <input 
                 type="number" 
                 placeholder="Reward Points" 
                 className="w-full px-4 py-2 bg-zinc-800 text-white rounded border border-zinc-700"
                 value={formData.reward}
                 onChange={e => setFormData({...formData, reward: parseInt(e.target.value)})}
               />
             <button
               onClick={handleCreate}
               className="w-full py-3 bg-green-600 text-white rounded font-bold hover:bg-green-700"
             >
               Save Quest
             </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {quests.map(quest => (
          <div key={quest.id} className="bg-zinc-900 border border-zinc-800 p-4 flex justify-between items-center rounded-lg">
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <h3 className="text-white font-bold">{quest.title}</h3>
                 <span className={`text-[10px] uppercase px-2 rounded ${quest.type === 'milestone' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
                   {quest.type}
                 </span>
               </div>
               <p className="text-zinc-500 text-sm">{quest.description}</p>
             </div>
             
             <div className="flex items-center gap-4">
               <span className="text-yellow-500 font-bold">{quest.reward} PTS</span>
               <button onClick={() => handleDelete(quest.id)} className="text-zinc-500 hover:text-red-500">
                 <iconify-icon icon="solar:trash-bin-trash-linear" width="20"></iconify-icon>
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
