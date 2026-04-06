import { useState, useEffect, useCallback } from 'react'
import { calcTeamScore } from '../lib/scoring'
import Link from 'next/link'

const ENTRY_FEE = 35
const PAYOUT = [0.70, 0.20, 0.10]

const S = {
  page: { minHeight: '100vh', background: '#f5f0e8', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  wrap: { maxWidth: 640, margin: '0 auto' },
  header: { background: 'linear-gradient(160deg,#0d3d21,#1a5c38)', borderBottom: '3px solid #c9a84c', padding: '32px 20px 24px', textAlign: 'center' },
  badge: { display: 'inline-block', background: '#c9a84c', color: '#0d3d21', fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '3px 12px', borderRadius: 20, marginBottom: 10 },
  h1: { fontFamily: 'Georgia,serif', fontSize: 30, fontWeight: 900, color: '#fff', margin: 0 },
  gold: { color: '#f0d080' },
  sub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
  updated: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 },
  lockedPill: { display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, marginTop: 8 },
  unlockedPill: { display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, marginTop: 8 },
  body: { padding: '20px 16px' },
  payoutCard: { background: 'linear-gradient(135deg,#0d3d21,#0a2e18)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 18, padding: '16px 18px', marginBottom: 16 },
  payoutTitle: { fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#c9a84c', textAlign: 'center', marginBottom: 12 },
  payoutRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' },
  payoutPlace: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#fff', fontWeight: 600 },
  payoutPct: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  payoutAmt: { fontSize: 14, fontWeight: 800, color: '#f0d080' },
  hiddenBanner: { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, textAlign: 'center' },
  hiddenBannerText: { fontSize: 13, color: '#c9a84c', fontWeight: 700 },
  hiddenBannerSub: { fontSize: 11, color: 'rgba(201,168,76,0.7)', marginTop: 4 },
  empty: { background: '#fff', borderRadius: 18, padding: 32, textAlign: 'center', color: '#aaa', fontSize: 14 },
  card: (isFirst, locked) => ({ background: '#fff', borderRadius: 18, marginBottom: 10, overflow: 'hidden', border: (isFirst && locked) ? '1.5px solid #c9a84c' : '1.5px solid #e8e0d0', boxShadow: (isFirst && locked) ? '0 4px 20px rgba(201,168,76,0.15)' : 'none' }),
  cardBtn: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' },
  rank: { fontSize: 20, width: 30, textAlign: 'center', flexShrink: 0 },
  rankNum: { fontSize: 14, fontWeight: 800, color: '#aaa' },
  nameWrap: { flex: 1, minWidth: 0 },
  name: { fontWeight: 700, fontSize: 15, color: '#1a1a1a' },
  paidBadge: { display: 'inline-block', background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginTop: 3 },
  owesBadge: { display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginTop: 3 },
  pickCountBadge: { display: 'inline-block', background: '#f5f0e8', color: '#888', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, marginTop: 3 },
  scoreWrap: { textAlign: 'right' },
  prize: { fontSize: 11, fontWeight: 700, color: '#c9a84c' },
  chevron: { fontSize: 11, color: '#ccc', marginLeft: 4 },
  detail: { borderTop: '1px solid #e8e0d0', background: '#f5f0e8', padding: '14px 16px' },
  detailTitle: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#aaa', marginBottom: 10 },
  cutPill: { background: '#fee2e2', color: '#dc2626', fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, marginRight: 4 },
  wdPill: { background: '#f3f4f6', color: '#6b7280', fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, marginRight: 4 },
  editPickBtn: { display: 'block', background: 'none', border: '1.5px solid #1a5c38', color: '#1a5c38', borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 12, fontFamily: 'inherit', textDecoration: 'none', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
  nav: { display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24, paddingBottom: 32 },
  navLink: { color: '#1a5c38', fontWeight: 700, fontSize: 13, textDecoration: 'none' },
  navBtn: { background: 'none', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f0e8', fontFamily: 'inherit', color: '#1a5c38', fontSize: 16, fontWeight: 600 },
}

function fmt(score) {
  if (score === 0) return 'E'
  if (score > 0) return `+${score}`
  return `${score}`
}

function scoreColor(s) {
  if (s < 0) return '#dc2626'
  if (s === 0) return '#374151'
  return '#9ca3af'
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [scoresMap, setScoresMap] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [locked, setLocked] = useState(false)

  const fetchData = useCallback(async () => {
    const [eRes, sRes, stRes] = await Promise.all([
      fetch('/api/entries'),
      fetch('/api/scores'),
      fetch('/api/settings'),
    ])
    const { entries } = await eRes.json()
    const { scoresMap, lastUpdated } = await sRes.json()
    const { locked } = await stRes.json()
    setEntries(entries || [])
    setScoresMap(scoresMap || {})
    setLastUpdated(lastUpdated)
    setLocked(locked)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const iv = setInterval(fetchData, 120000)
    return () => clearInterval(iv)
  }, [fetchData])

  // Before lock: sort alphabetically. After lock: sort by score.
  const ranked = locked
    ? entries
        .map(e => ({ ...e, ...calcTeamScore(e.picks, scoresMap) }))
        .sort((a, b) => a.total - b.total)
    : [...entries].sort((a, b) => a.nickname.localeCompare(b.nickname))

  const paidCount = entries.filter(e => e.paid).length
  const pot = paidCount * ENTRY_FEE
  const medals = ['🥇','🥈','🥉']

  if (loading) return <div style={S.loading}>Loading leaderboard...</div>

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.header}>
          <div style={S.badge}>Augusta National · April 2026</div>
          <h1 style={S.h1}>Ladville <span style={S.gold}>Masters</span></h1>
          <div style={S.sub}>Live Leaderboard</div>
          <div style={{fontSize:22, marginTop:10}}>🏆🌿🏆</div>
          {lastUpdated && locked && (
            <div style={S.updated}>Scores updated {new Date(lastUpdated).toLocaleTimeString()}</div>
          )}
          {locked
            ? <div style={S.lockedPill}>🔒 Picks Locked</div>
            : <div style={S.unlockedPill}>⏳ Picks open — reveals Thursday</div>
          }
        </div>

        <div style={S.body}>

          {/* Payout banner */}
          <div style={S.payoutCard}>
            <div style={S.payoutTitle}>💰 Prize Pool · {entries.length} Entries · ${entries.length * ENTRY_FEE} Pot</div>
            {[['🥇','1st Place',0],['🥈','2nd Place',1],['🥉','3rd Place',2]].map(([medal,place,idx]) => (
              <div key={place} style={{...S.payoutRow, borderBottom: idx===2?'none':'1px solid rgba(255,255,255,0.07)'}}>
                <div style={S.payoutPlace}><span>{medal}</span><span>{place}</span></div>
                <div style={S.payoutPct}>{Math.round(PAYOUT[idx]*100)}%</div>
                <div style={S.payoutAmt}>${Math.round(pot * PAYOUT[idx])}</div>
              </div>
            ))}
          </div>

          {/* Hidden picks banner */}
          {!locked && (
            <div style={S.hiddenBanner}>
              <div style={S.hiddenBannerText}>🔐 Picks are hidden until the tournament starts</div>
              <div style={S.hiddenBannerSub}>Golfer selections will be revealed when picks are locked Thursday</div>
            </div>
          )}

          {ranked.length === 0 ? (
            <div style={S.empty}>No picks submitted yet.</div>
          ) : (
            ranked.map((entry, i) => {
              const showScore = locked
              const rank = locked ? i : null

              return (
                <div key={entry.nickname} style={S.card(i===0, locked)}>
                  <button
                    style={S.cardBtn}
                    onClick={() => !locked ? null : setExpanded(expanded === entry.nickname ? null : entry.nickname)}
                  >
                    {/* Rank — only show when locked */}
                    <div style={S.rank}>
                      {locked
                        ? (i < 3 ? medals[i] : <span style={S.rankNum}>{i+1}</span>)
                        : <span style={{fontSize:14, color:'#ccc'}}>—</span>
                      }
                    </div>

                    <div style={S.nameWrap}>
                      <div style={S.name}>{entry.nickname}</div>
                      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginTop:3}}>
                        {entry.paid === false
                          ? <span style={S.owesBadge}>💸 Owes $</span>
                          : <span style={S.paidBadge}>✓ Paid</span>
                        }
                        {!locked && (
                          <span style={S.pickCountBadge}>✓ {entry.picks?.length || 0} picks submitted</span>
                        )}
                      </div>
                    </div>

                    {/* Score — only show when locked */}
                    {locked && (
                      <div style={S.scoreWrap}>
                        <div style={{fontSize:20, fontWeight:900, color:scoreColor(entry.total)}}>{fmt(entry.total)}</div>
                        {i < 3 && pot > 0 && <div style={S.prize}>${Math.round(pot * PAYOUT[i])}</div>}
                      </div>
                    )}

                    {locked && <span style={S.chevron}>{expanded === entry.nickname ? '▲' : '▼'}</span>}
                  </button>

                  {/* Edit button — only show when NOT locked */}
                  {!locked && (
                    <div style={{padding: '0 16px 12px'}}>
                      <Link href={`/?edit=${encodeURIComponent(entry.nickname)}`} style={S.editPickBtn}>
                        ✏️ Edit My Picks
                      </Link>
                    </div>
                  )}

                  {/* Expanded detail — only when locked */}
                  {locked && expanded === entry.nickname && (
                    <div style={S.detail}>
                      <div style={S.detailTitle}>Team Picks</div>
                      {entry.scores.sort((a,b) => a.score - b.score).map((s) => {
                        const dropped = entry.dropped?.name === s.name
                        return (
                          <div key={s.name} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, color: dropped?'#bbb':'#555', padding:'4px 0', borderBottom:'1px solid #ebe4d8', textDecoration: dropped?'line-through':'none'}}>
                            <span>
                              {s.status==='cut' && <span style={S.cutPill}>CUT</span>}
                              {s.status==='wd' && <span style={S.wdPill}>WD</span>}
                              {s.name}
                            </span>
                            <div style={{display:'flex', alignItems:'center', gap:6}}>
                              <span style={{fontWeight:700, color:scoreColor(s.score)}}>{fmt(s.score)}</span>
                              {dropped && <span style={{fontSize:11,color:'#bbb'}}>(dropped)</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}

          <div style={S.nav}>
            <Link href="/" style={S.navLink}>← Submit Picks</Link>
            <button style={S.navBtn} onClick={fetchData}>↻ Refresh</button>
          </div>
        </div>
      </div>
    </div>
  )
}
