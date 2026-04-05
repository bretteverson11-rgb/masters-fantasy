import { useState } from 'react'
import Link from 'next/link'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [locked, setLocked] = useState(false)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const login = () => {
    if (password === 'LadmastersDean') {
      setAuthed(true)
      loadData()
    } else {
      setMessage('Wrong password.')
    }
  }

  const loadData = async () => {
    const [settingsRes, entriesRes] = await Promise.all([
      fetch('/api/settings'),
      fetch('/api/entries'),
    ])
    const { locked } = await settingsRes.json()
    const { entries } = await entriesRes.json()
    setLocked(locked)
    setEntries(entries || [])
  }

  const toggleLock = async () => {
    setLoading(true)
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locked: !locked, adminPassword: password }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setLocked(data.locked)
      setMessage(data.locked ? '🔒 Picks locked!' : '🔓 Picks unlocked!')
    } else {
      setMessage(data.error)
    }
  }

  const deleteEntry = async (nickname) => {
    if (!confirm(`Delete ${nickname}'s picks?`)) return
    const res = await fetch('/api/admin-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, adminPassword: password }),
    })
    if (res.ok) {
      setEntries(entries.filter(e => e.nickname !== nickname))
      setMessage(`Deleted ${nickname}.`)
    }
  }

  const togglePaid = async (nickname, currentPaid) => {
    const newPaid = !currentPaid
    const res = await fetch('/api/admin-paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, paid: newPaid, adminPassword: password }),
    })
    if (res.ok) {
      setEntries(entries.map(e => e.nickname === nickname ? { ...e, paid: newPaid } : e))
    }
  }

  const paidCount = entries.filter(e => e.paid).length

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background:'#f5f0e8'}}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-sm">
          <div className="text-center py-6 px-6" style={{background:'linear-gradient(160deg,#0d3d21,#1a5c38)', borderBottom:'3px solid #c9a84c'}}>
            <h1 className="text-xl font-bold text-white" style={{fontFamily:'Georgia,serif'}}>
              Ladville <span style={{color:'#f0d080'}}>Masters</span>
            </h1>
            <p className="text-xs uppercase tracking-widest mt-1" style={{color:'rgba(255,255,255,0.6)'}}>Admin Panel</p>
          </div>
          <div className="p-6">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Admin password"
              className="w-full rounded-xl px-4 py-3 mb-4 focus:outline-none"
              style={{border:'1.5px solid #ddd'}}
            />
            {message && <p className="text-sm mb-3" style={{color:'#dc2626'}}>{message}</p>}
            <button
              onClick={login}
              className="w-full text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
              style={{background:'linear-gradient(135deg,#1a5c38,#0d3d21)', border:'1.5px solid #c9a84c'}}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background:'#f5f0e8'}}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-6 px-4" style={{background:'linear-gradient(160deg,#0d3d21,#1a5c38)', borderBottom:'3px solid #c9a84c'}}>
          <div className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-2" style={{background:'#c9a84c', color:'#0d3d21', letterSpacing:'2px'}}>
            ADMIN PANEL
          </div>
          <h1 className="text-2xl font-bold text-white" style={{fontFamily:'Georgia,serif'}}>
            Ladville <span style={{color:'#f0d080'}}>Masters</span>
          </h1>
        </div>

        <div className="p-4 md:p-6">
          {message && (
            <div className="rounded-xl px-4 py-3 mb-5 text-sm font-semibold" style={{background:'#dcfce7', border:'1px solid #bbf7d0', color:'#16a34a'}}>
              {message}
            </div>
          )}

          <div className="flex justify-end mb-4">
            <Link href="/leaderboard" className="text-sm font-semibold hover:underline" style={{color:'#1a5c38'}}>
              View Leaderboard →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 mb-4" style={{border:'1.5px solid #e8e0d0'}}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#555'}}>Pick Lock Control</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-xl px-4 py-3 font-bold text-sm" style={locked ? {background:'#fee2e2', color:'#dc2626'} : {background:'#dcfce7', color:'#16a34a'}}>
                {locked ? '🔒 Picks are LOCKED' : '🔓 Picks are OPEN'}
              </div>
              <button
                onClick={toggleLock}
                disabled={loading}
                className="px-5 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60 hover:opacity-90 transition"
                style={{background: locked ? '#16a34a' : '#dc2626'}}
              >
                {loading ? '...' : locked ? 'Unlock' : 'Lock Picks'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5" style={{border:'1.5px solid #e8e0d0'}}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest" style={{color:'#555'}}>
                All Entries ({entries.length})
              </p>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{background:'#dcfce7', color:'#16a34a'}}>
                💰 {paidCount}/{entries.length} paid
              </span>
            </div>

            {entries.length === 0 ? (
              <p className="text-sm text-gray-400">No entries yet.</p>
            ) : (
              <div>
                <div className="flex items-center gap-3 pb-2 mb-1" style={{borderBottom:'1px solid #eee'}}>
                  <span className="flex-1 text-xs font-bold uppercase tracking-wide" style={{color:'#bbb'}}>Team</span>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{width:'42px', textAlign:'center', color:'#bbb'}}>Paid</span>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{width:'32px', textAlign:'right', color:'#bbb'}}>Del</span>
                </div>

                {entries.map(entry => (
                  <div key={entry.nickname} className="flex items-center gap-3 py-3" style={{borderBottom:'1px solid #f5f0e8'}}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-800">{entry.nickname}</span>
                        {!entry.paid && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#fee2e2', color:'#dc2626'}}>Owes $</span>
                        )}
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{color:'#bbb'}}>{entry.picks?.join(' · ')}</p>
                    </div>
                    <div style={{width:'42px', display:'flex', justifyContent:'center'}}>
                      <button
                        onClick={() => togglePaid(entry.nickname, entry.paid)}
                        className="flex items-center justify-center rounded-lg transition-all"
                        style={{width:'28px', height:'28px', border: entry.paid ? 'none' : '2px solid #d1d5db', background: entry.paid ? '#22c55e' : '#fff', color: '#fff', fontSize: '14px', fontWeight: '900'}}
                      >
                        {entry.paid && '✓'}
                      </button>
                    </div>
                    <div style={{width:'32px', textAlign:'right'}}>
                      <button onClick={() => deleteEntry(entry.nickname)} className="text-xs font-semibold hover:opacity-80" style={{color:'#fca5a5'}}>
                        Del
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
