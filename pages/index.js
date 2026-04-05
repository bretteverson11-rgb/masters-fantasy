import { useState, useEffect } from 'react'
import { TIERS } from '../lib/golfers'
import Link from 'next/link'

export default function Home() {
  const [teamName, setTeamName] = useState('')
  const [picks, setPicks] = useState(['', '', '', '', '', ''])
  const [locked, setLocked] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingPicks, setExistingPicks] = useState(null)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setLocked(d.locked))
  }, [])

  const handleTeamNameBlur = async () => {
    if (!teamName.trim()) return
    const res = await fetch('/api/entries')
    const { entries } = await res.json()
    const found = entries.find(e => e.nickname.toLowerCase() === teamName.trim().toLowerCase())
    if (found) setExistingPicks(found.picks)
    else setExistingPicks(null)
  }

  const loadExisting = () => {
    if (existingPicks) setPicks(existingPicks)
  }

  const handlePick = (tierIndex, value) => {
    const newPicks = [...picks]
    newPicks[tierIndex] = value
    setPicks(newPicks)
  }

  const handleSubmit = async () => {
    setError('')
    if (!teamName.trim()) return setError('Please enter your team name.')
    if (picks.some(p => !p)) return setError('Please select one golfer from every tier.')
    const unique = new Set(picks)
    if (unique.size !== 6) return setError('Please select a different golfer in each tier.')

    setLoading(true)
    const res = await fetch('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: teamName.trim(), picks }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background:'#f5f0e8'}}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⛳️</div>
          <h1 className="text-2xl font-bold mb-1" style={{color:'#1a5c38'}}>Picks Saved!</h1>
          <p className="text-gray-500 mb-4">Good luck, <span className="font-bold" style={{color:'#1a5c38'}}>{teamName}</span>!</p>
          <div className="rounded-xl p-4 mb-5 text-left space-y-2" style={{background:'#f5f0e8'}}>
            {TIERS.map((tier, i) => (
              <div key={i} className="flex items-center gap-3 text-sm border-b last:border-0 pb-2 last:pb-0" style={{borderColor:'#e8e0d0'}}>
                <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full whitespace-nowrap" style={{background:'#1a5c38'}}>{tier.label}</span>
                <span className="text-gray-700 font-semibold">{picks[i]}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 mb-5 text-left text-sm" style={{background:'#0d3d21'}}>
            <p className="font-bold mb-1" style={{color:'#f0d080'}}>💳 Don't forget to pay!</p>
            <p style={{color:'rgba(255,255,255,0.8)'}}>
              Send <strong style={{color:'#f0d080'}}>$35</strong> via Interac e-Transfer to{' '}
              <strong style={{color:'#f0d080'}}>bretteverson11@gmail.com</strong>
            </p>
            <p className="mt-1" style={{color:'rgba(255,255,255,0.55)', fontSize:'11px'}}>
              Include <strong style={{color:'rgba(255,255,255,0.8)'}}>{teamName}</strong> in your e-Transfer message
            </p>
          </div>
          <Link href="/leaderboard" className="block w-full text-white py-3 rounded-xl font-bold hover:opacity-90 transition text-center" style={{background:'linear-gradient(135deg,#1a5c38,#0d3d21)', border:'1.5px solid #c9a84c'}}>
            View Leaderboard →
          </Link>
          <button onClick={() => setSubmitted(false)} className="mt-3 text-sm text-gray-400 hover:text-gray-600 underline">
            Edit my picks
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background:'#f5f0e8'}}>
      <div className="max-w-lg mx-auto">
        <div className="text-center py-8 px-4" style={{background:'linear-gradient(160deg,#0d3d21,#1a5c38)', borderBottom:'3px solid #c9a84c'}}>
          <div className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3" style={{background:'#c9a84c', color:'#0d3d21', letterSpacing:'2px'}}>
            AUGUSTA NATIONAL · APRIL 2026
          </div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily:'Georgia,serif'}}>
            Ladville <span style={{color:'#f0d080'}}>Masters</span>
          </h1>
          <p className="text-xs uppercase tracking-widest" style={{color:'rgba(255,255,255,0.6)'}}>Fantasy Golf Pool · 2026</p>
          <div className="flex justify-center gap-2 mt-3 text-xl">🇨🇦🏌️🇨🇦</div>
        </div>

        <div className="p-4 md:p-6">
          {locked && (
            <div className="rounded-xl p-4 mb-5 text-center font-bold" style={{background:'#fee2e2', color:'#dc2626'}}>
              🔒 Picks are locked — the tournament has started!
            </div>
          )}

          <div className="rounded-2xl p-5 mb-5" style={{background:'#0d3d21'}}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#c9a84c'}}>Pool Information</p>
            <div className="space-y-1 mb-4">
              {[
                ['Entry Fee', '$35'],
                ['Format', 'Pick 1 from each tier'],
                ['Scoring', 'Top 5 of 6 count'],
                ['Prizes', 'Top 3 paid out (70/20/10%)'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm py-1" style={{borderBottom:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.8)'}}>
                  <span>{label}</span>
                  <strong style={{color:'#f0d080'}}>{val}</strong>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3" style={{background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)'}}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:'#c9a84c'}}>💳 How to Pay</p>
              <p className="text-sm" style={{color:'rgba(255,255,255,0.8)'}}>
                Send <strong style={{color:'#f0d080'}}>$35</strong> via Interac e-Transfer to{' '}
                <strong style={{color:'#f0d080'}}>bretteverson11@gmail.com</strong>
              </p>
              <p className="text-xs mt-2" style={{color:'rgba(255,255,255,0.5)'}}>
                Include your <strong style={{color:'rgba(255,255,255,0.75)'}}>team name</strong> in the e-Transfer message
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{color:'#555'}}>Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                onBlur={handleTeamNameBlur}
                placeholder="e.g. Team Everson"
                disabled={locked}
                className="w-full rounded-xl px-4 py-3 text-gray-800 focus:outline-none disabled:bg-gray-50"
                style={{border:'1.5px solid #ddd'}}
              />
              {existingPicks && !locked && (
                <button onClick={loadExisting} className="mt-2 text-sm underline" style={{color:'#1a5c38'}}>
                  Load your existing picks
                </button>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{color:'#555'}}>Select Your Team</label>
              <p className="text-xs mb-4" style={{color:'#aaa'}}>Pick 1 golfer from each tier · Top 5 of 6 scores count</p>
              <div className="space-y-3">
                {TIERS.map((tier, i) => (
                  <div key={i} className="rounded-xl p-3" style={{border: picks[i] ? '1.5px solid #1a5c38' : '1.5px solid #e8e0d0', background: picks[i] ? '#f0faf4' : '#fff'}}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={i === 0 ? {background:'#c9a84c', color:'#0d3d21'} : {background:'#1a5c38', color:'#fff'}}>
                        {tier.label}
                      </span>
                      <span className="text-xs" style={{color:'#aaa'}}>{tier.description}</span>
                    </div>
                    <select
                      value={picks[i]}
                      onChange={e => handlePick(i, e.target.value)}
                      disabled={locked}
                      className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none disabled:bg-gray-100"
                      style={{border: picks[i] ? '1.5px solid #1a5c38' : '1.5px solid #e0d8c8', color: picks[i] ? '#1a5c38' : '#999', fontWeight: picks[i] ? '700' : '400', background: picks[i] ? '#fff' : '#f5f0e8'}}
                    >
                      <option value="">— Select a {tier.label} golfer —</option>
                      {tier.golfers.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 mb-4 text-sm" style={{background:'#fee2e2', color:'#dc2626'}}>{error}</div>
            )}

            {!locked && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full text-white py-3 rounded-xl font-bold text-lg disabled:opacity-60 hover:opacity-90 transition"
                style={{background:'linear-gradient(135deg,#1a5c38,#0d3d21)', border:'1.5px solid #c9a84c'}}
              >
                {loading ? 'Saving...' : 'Submit My Picks ⛳️'}
              </button>
            )}
          </div>

          <div className="text-center mt-6 pb-8">
            <Link href="/leaderboard" className="font-semibold hover:underline" style={{color:'#1a5c38'}}>
              View Leaderboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
