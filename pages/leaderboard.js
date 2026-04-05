import { useState, useEffect, useCallback } from 'react'
import { calcTeamScore } from '../lib/scoring'
import Link from 'next/link'

const ENTRY_FEE = 35
const PAYOUT = [0.70, 0.20, 0.10]

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [scoresMap, setScoresMap] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [locked, setLocked] = useState(false)

  const fetchData = useCallback(async () => {
    const [entriesRes, scoresRes, settingsRes] = await Promise.all([
      fetch('/api/entries'),
      fetch('/api/scores'),
      fetch('/api/settings'),
    ])
    const { entries } = await entriesRes.json()
    const { scoresMap, lastUpdated } = await scoresRes.json()
    const { locked } = await settingsRes.json()
    setEntries(entries || [])
    setScoresMap(scoresMap || {})
    setLastUpdated(lastUpdated)
    setLocked(locked)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 120000)
    return () => clearInterval(interval)
  }, [fetchData])

  const ranked = entries
    .map(entry => {
      const result = calcTeamScore(entry.picks, scoresMap)
      return { ...entry, ...result }
    })
    .sort((a, b) => a.total - b.total)

  const paidCount = entries.filter(e => e.paid).length
  const pot = paidCount * ENTRY_FEE

  const getMedal = (i) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `${i + 1}`
  }

  const scoreColor = (score) => {
    if (score < 0) return '#dc2626'
    if (score === 0) return '#374151'
    return '#9ca3af'
  }

  const formatScore = (score) => {
    if (score === 0) return 'E'
    if (score > 0) return `+${score}`
    return `${score}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:'#f5f0e8'}}>
        <div className="text-lg font-semibold animate-pulse" style={{color:'#1a5c38'}}>Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background:'#f5f0e8'}}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8 px-4" style={{background:'linear-gradient(160deg,#0d3d21,#1a5c38)', borderBottom:'3px solid #c9a84c'}}>
          <div className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3" style={{background:'#c9a84c', color:'#0d3d21', letterSpacing:'2px'}}>
            AUGUSTA NATIONAL · APRIL 2026
          </div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{fontFamily:'Georgia,serif'}}>
            Ladville <span style={{color:'#f0d080'}}>Masters</span>
          </h1>
          <p className="text-xs uppercase tracking-widest" style={{color:'rgba(255,255,255,0.6)'}}>Live Leaderboard</p>
          <div className="flex justify-center gap-2 mt-3 text-xl">🏆🌿🏆</div>
          {lastUpdated && (
            <p className="text-xs mt-3" style={{color:'rgba(255,255,255,0.45)'}}>
              Scores updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
          {locked && (
            <div className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full" style={{background:'#fee2e2', color:'#dc2626'}}>
              🔒 Picks Locked
            </div>
          )}
        </div>

        <div className="p-4 md:p-6">
          <div className="rounded-2xl p-4 mb-5" style={{background:'linear-gradient(135deg,#0d3d21,#0a2e18)', border:'1px solid rgba(201,168,76,0.4)'}}>
            <p className="text-center text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#c9a84c'}}>
              💰 Prize Pool · {entries.length} Entries · ${entries.length * ENTRY_FEE} Pot
            </p>
            {[
              { medal: '🥇', place: '1st Place', pct: '70%', amt: Math.round(pot * PAYOUT[0]) },
              { medal: '🥈', place: '2nd Place', pct: '20%', amt: Math.round(pot * PAYOUT[1]) },
              { medal: '🥉', place: '3rd Place', pct: '10%', amt: Math.round(pot * PAYOUT[2]) },
            ].map(({ medal, place, pct, amt }) => (
              <div key={place} className="flex justify-between items-center py-1.5" style={{borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span>{medal}</span><span>{place}</span>
                </div>
                <div className="text-xs" style={{color:'rgba(255,255,255,0.4)'}}>{pct}</div>
                <div className="text-sm font-bold" style={{color:'#f0d080'}}>${amt}</div>
              </div>
            ))}
          </div>

          {ranked.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
              No picks submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {ranked.map((entry, i) => (
                <div key={entry.nickname} className="rounded-2xl overflow-hidden" style={{background:'#fff', border: i === 0 ? '1.5px solid #c9a84c' : '1.5px solid #e8e0d0', boxShadow: i === 0 ? '0 4px 20px rgba(201,168,76,0.2)' : 'none'}}>
                  <button
                    onClick={() => setExpanded(expanded === entry.nickname ? null : entry.nickname)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left"
                  >
                    <span className="text-lg w-8 text-center font-bold" style={{color:'#888'}}>{getMedal(i)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900">{entry.nickname}</div>
                      <div className="mt-0.5">
                        {entry.paid === false ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#fee2e2', color:'#dc2626'}}>💸 Owes $</span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#dcfce7', color:'#16a34a'}}>✓ Paid</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black" style={{color: scoreColor(entry.total)}}>{formatScore(entry.total)}</div>
                      {i < 3 && pot > 0 && (
                        <div className="text-xs font-bold" style={{color:'#c9a84c'}}>${Math.round(pot * PAYOUT[i])}</div>
                      )}
                    </div>
                    <span style={{color:'#ccc', fontSize:'11px'}}>{expanded === entry.nickname ? '▲' : '▼'}</span>
                  </button>

                  {expanded === entry.nickname && (
                    <div className="px-4 py-3" style={{borderTop:'1px solid #e8e0d0', background:'#f5f0e8'}}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'#aaa'}}>Team Picks</p>
                      <div className="space-y-1.5">
                        {entry.scores
                          .sort((a, b) => a.score - b.score)
                          .map((s) => {
                            const isDropped = entry.dropped?.name === s.name
                            return (
                              <div key={s.name} className={`flex justify-between items-center text-sm ${isDropped ? 'opacity-35 line-through' : ''}`}>
                                <span className="text-gray-700">{s.name}</span>
                                <div className="flex items-center gap-2">
                                  {s.status === 'cut' && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#fee2e2', color:'#dc2626'}}>CUT</span>}
                                  {s.status === 'wd' && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#f3f4f6', color:'#6b7280'}}>WD</span>}
                                  <span className="font-bold" style={{color: scoreColor(s.score)}}>{formatScore(s.score)}</span>
                                  {isDropped && <span className="text-xs" style={{color:'#bbb'}}>(dropped)</span>}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-6 justify-center mt-8 pb-8 text-sm font-semibold" style={{color:'#1a5c38'}}>
            <Link href="/" className="hover:underline">← Submit / Edit Picks</Link>
            <button onClick={fetchData} className="hover:underline" style={{color:'#aaa'}}>↻ Refresh</button>
          </div>
        </div>
      </div>
    </div>
  )
}
