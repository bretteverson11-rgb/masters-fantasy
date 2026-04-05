import { useState, useEffect } from 'react'
import { TIERS } from '../lib/golfers'
import Link from 'next/link'

const S = {
  page: { minHeight: '100vh', background: '#f5f0e8', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  wrap: { maxWidth: 520, margin: '0 auto' },
  header: { background: 'linear-gradient(160deg,#0d3d21,#1a5c38)', borderBottom: '3px solid #c9a84c', padding: '32px 20px 24px', textAlign: 'center' },
  badge: { display: 'inline-block', background: '#c9a84c', color: '#0d3d21', fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '3px 12px', borderRadius: 20, marginBottom: 10 },
  h1: { fontFamily: 'Georgia,serif', fontSize: 30, fontWeight: 900, color: '#fff', margin: 0 },
  gold: { color: '#f0d080' },
  sub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
  flags: { fontSize: 22, marginTop: 10 },
  body: { padding: '20px 16px' },
  lockBanner: { background: '#fee2e2', color: '#dc2626', borderRadius: 14, padding: '14px 16px', marginBottom: 16, textAlign: 'center', fontWeight: 700, fontSize: 14 },
  infoCard: { background: '#0d3d21', borderRadius: 18, padding: '20px 18px', marginBottom: 16 },
  infoTitle: { fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#c9a84c', marginBottom: 12 },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.8)', padding: '6px 0' },
  payBox: { background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 12, padding: '12px 14px', marginTop: 12 },
  payTitle: { fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#c9a84c', marginBottom: 6 },
  payText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 },
  payNote: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6 },
  card: { background: '#fff', borderRadius: 18, padding: '20px 18px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  fieldLabel: { fontSize: 11, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'block' },
  input: { width: '100%', border: '1.5px solid #ddd', borderRadius: 12, padding: '12px 14px', fontSize: 15, color: '#333', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  loadBtn: { background: 'none', border: 'none', color: '#1a5c38', fontSize: 13, textDecoration: 'underline', cursor: 'pointer', marginTop: 6, padding: 0 },
  tierCard: (selected) => ({ border: selected ? '1.5px solid #1a5c38' : '1.5px solid #e8e0d0', borderRadius: 14, padding: '12px 14px', marginBottom: 10, background: selected ? '#f0faf4' : '#fafafa' }),
  tierHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  tierBadge: (i) => ({ background: i === 0 ? '#c9a84c' : '#1a5c38', color: i === 0 ? '#0d3d21' : '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }),
  tierDesc: { fontSize: 11, color: '#aaa' },
  select: (selected) => ({ width: '100%', border: selected ? '1.5px solid #1a5c38' : '1.5px solid #e0d8c8', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: selected ? '#1a5c38' : '#999', fontWeight: selected ? 700 : 400, background: selected ? '#fff' : '#f5f0e8', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }),
  error: { background: '#fee2e2', color: '#dc2626', borderRadius: 12, padding: '12px 14px', fontSize: 13, marginBottom: 14 },
  submitBtn: { width: '100%', background: 'linear-gradient(135deg,#1a5c38,#0d3d21)', color: '#fff', border: '1.5px solid #c9a84c', borderRadius: 14, padding: '14px', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' },
  lbLink: { display: 'block', textAlign: 'center', marginTop: 20, paddingBottom: 32, color: '#1a5c38', fontWeight: 700, fontSize: 14, textDecoration: 'none' },
  successWrap: { minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  successCard: { background: '#fff', borderRadius: 22, padding: '32px 24px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' },
  picksList: { background: '#f5f0e8', borderRadius: 14, padding: '16px', marginBottom: 16, textAlign: 'left' },
  pickRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #e8e0d0', fontSize: 13 },
  pickBadge: { background: '#1a5c38', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' },
  payReminder: { background: '#0d3d21', borderRadius: 14, padding: '14px 16px', marginBottom: 16, textAlign: 'left' },
  viewLbBtn: { display: 'block', width: '100%', background: 'linear-gradient(135deg,#1a5c38,#0d3d21)', color: '#fff', border: '1.5px solid #c9a84c', borderRadius: 14, padding: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', textDecoration: 'none', textAlign: 'center', fontFamily: 'inherit', boxSizing: 'border-box' },
  editBtn: { background: 'none', border: 'none', color: '#aaa', fontSize: 13, textDecoration: 'underline', cursor: 'pointer', marginTop: 10, fontFamily: 'inherit' },
}

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
    const params = new URLSearchParams(window.location.search)
    const editName = params.get('edit')
    if (editName) {
      setTeamName(editName)
      fetch('/api/entries').then(r => r.json()).then(({ entries }) => {
        const found = entries.find(e => e.nickname.toLowerCase() === editName.toLowerCase())
        if (found) setPicks(found.picks)
      })
    }
  }, [])

  const handleTeamNameBlur = async () => {
    if (!teamName.trim()) return
    const res = await fetch('/api/entries')
    const { entries } = await res.json()
    const found = entries.find(e => e.nickname.toLowerCase() === teamName.trim().toLowerCase())
    if (found) setExistingPicks(found.picks)
    else setExistingPicks(null)
  }

  const handlePick = (i, value) => {
    const newPicks = [...picks]
    newPicks[i] = value
    setPicks(newPicks)
  }

  const handleSubmit = async () => {
    setError('')
    if (!teamName.trim()) return setError('Please enter your team name.')
    if (picks.some(p => !p)) return setError('Please select one golfer from every tier.')
    if (new Set(picks).size !== 6) return setError('Please select a different golfer in each tier.')
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
      <div style={S.successWrap}>
        <div style={S.successCard}>
          <div style={{fontSize: 48, marginBottom: 12}}>⛳️</div>
          <div style={{fontSize: 24, fontWeight: 900, color: '#1a5c38', marginBottom: 4}}>Picks Saved!</div>
          <p style={{color: '#777', marginBottom: 20, fontSize: 14}}>Good luck, <strong style={{color:'#1a5c38'}}>{teamName}</strong>!</p>
          <div style={S.picksList}>
            {TIERS.map((tier, i) => (
              <div key={i} style={{...S.pickRow, borderBottom: i === 5 ? 'none' : '1px solid #e8e0d0'}}>
                <span style={S.pickBadge}>{tier.label}</span>
                <span style={{color:'#333', fontWeight: 600}}>{picks[i]}</span>
              </div>
            ))}
          </div>
          <div style={S.payReminder}>
            <div style={{color:'#f0d080', fontWeight: 800, marginBottom: 6, fontSize: 13}}>💳 Don't forget to pay!</div>
            <div style={{color:'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6}}>
              Send <strong style={{color:'#f0d080'}}>$35</strong> via Interac e-Transfer to <strong style={{color:'#f0d080'}}>bretteverson11@gmail.com</strong>
            </div>
            <div style={{color:'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 6}}>
              Include <strong style={{color:'rgba(255,255,255,0.75)'}}>{teamName}</strong> in your message
            </div>
          </div>
          <Link href="/leaderboard" style={S.viewLbBtn}>View Leaderboard →</Link>
          <button style={S.editBtn} onClick={() => setSubmitted(false)}>Edit my picks</button>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.header}>
          <div style={S.badge}>Augusta National · April 2026</div>
          <h1 style={S.h1}>Ladville <span style={S.gold}>Masters</span></h1>
          <div style={S.sub}>Fantasy Golf Pool · 2026</div>
          <div style={S.flags}>🇨🇦🏌️🇨🇦</div>
        </div>
        <div style={S.body}>
          {locked && <div style={S.lockBanner}>🔒 Picks are locked — the tournament has started!</div>}
          <div style={S.infoCard}>
            <div style={S.infoTitle}>Pool Information</div>
            {[['Entry Fee','$35'],['Format','Pick 1 from each tier'],['Scoring','Top 5 of 6 count'],['Prizes','Top 3 paid out (70/20/10%)']].map(([l,v],i,a) => (
              <div key={l} style={{...S.infoRow, borderBottom: i===a.length-1?'none':'1px solid rgba(255,255,255,0.08)'}}>
                <span>{l}</span><strong style={S.gold}>{v}</strong>
              </div>
            ))}
            <div style={S.payBox}>
              <div style={S.payTitle}>💳 How to Pay</div>
              <div style={S.payText}>Send <strong style={S.gold}>$35</strong> via Interac e-Transfer to <strong style={S.gold}>bretteverson11@gmail.com</strong></div>
              <div style={S.payNote}>Include your <strong style={{color:'rgba(255,255,255,0.75)'}}>team name</strong> in the message</div>
            </div>
          </div>
          <div style={S.card}>
            <div style={{marginBottom: 20}}>
              <label style={S.fieldLabel}>Team Name</label>
              <input style={S.input} type="text" value={teamName} onChange={e => setTeamName(e.target.value)} onBlur={handleTeamNameBlur} placeholder="e.g. Team Everson" disabled={locked} />
              {existingPicks && !locked && (
                <button style={S.loadBtn} onClick={() => setPicks(existingPicks)}>Load your existing picks</button>
              )}
            </div>
            <div style={{marginBottom: 20}}>
              <label style={S.fieldLabel}>Select Your Team</label>
              <div style={{color:'#aaa', fontSize:12, marginBottom:14}}>Pick 1 golfer from each tier · Top 5 of 6 scores count</div>
              {TIERS.map((tier, i) => (
                <div key={i} style={S.tierCard(!!picks[i])}>
                  <div style={S.tierHeader}>
                    <span style={S.tierBadge(i)}>{tier.label}</span>
                    <span style={S.tierDesc}>{tier.description}</span>
                  </div>
                  <select style={S.select(!!picks[i])} value={picks[i]} onChange={e => handlePick(i, e.target.value)} disabled={locked}>
                    <option value="">— Select a {tier.label} golfer —</option>
                    {tier.golfers.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {error && <div style={S.error}>{error}</div>}
            {!locked && (
              <button style={{...S.submitBtn, opacity: loading ? 0.6 : 1}} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Submit My Picks ⛳️'}
              </button>
            )}
          </div>
          <Link href="/leaderboard" style={S.lbLink}>View Leaderboard →</Link>
        </div>
      </div>
    </div>
  )
}
