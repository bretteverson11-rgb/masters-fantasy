import { useState } from 'react'
import Link from 'next/link'

const S = {
  page: { minHeight: '100vh', background: '#f5f0e8', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  wrap: { maxWidth: 600, margin: '0 auto' },
  header: { background: 'linear-gradient(160deg,#0d3d21,#1a5c38)', borderBottom: '3px solid #c9a84c', padding: '28px 20px 22px', textAlign: 'center' },
  badge: { display: 'inline-block', background: '#c9a84c', color: '#0d3d21', fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', padding: '3px 12px', borderRadius: 20, marginBottom: 8 },
  h1: { fontFamily: 'Georgia,serif', fontSize: 26, fontWeight: 900, color: '#fff', margin: 0 },
  gold: { color: '#f0d080' },
  sub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
  body: { padding: '20px 16px' },
  toast: { background: '#dcfce7', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, fontWeight: 600 },
  topRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: 14 },
  lbLink: { color: '#1a5c38', fontWeight: 700, fontSize: 13, textDecoration: 'none' },
  card: { background: '#fff', borderRadius: 18, padding: '18px 18px', marginBottom: 14, border: '1.5px solid #e8e0d0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 11, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  lockRow: { display: 'flex', alignItems: 'center', gap: 12 },
  lockStatus: (locked) => ({ flex: 1, borderRadius: 12, padding: '12px 16px', fontWeight: 700, fontSize: 14, background: locked ? '#fee2e2' : '#dcfce7', color: locked ? '#dc2626' : '#16a34a' }),
  lockBtn: (locked) => ({ background: locked ? '#16a34a' : '#dc2626', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 18px', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }),
  entriesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  paidTally: { background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 },
  colHeads: { display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1px solid #eee', marginBottom: 4 },
  colHead: { fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: 0.6 },
  entryRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid #f5f0e8' },
  entryName: { fontWeight: 700, fontSize: 14, color: '#222' },
  entryPicks: { fontSize: 11, color: '#bbb', marginTop: 2 },
  owesBadge: { display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, marginLeft: 6 },
  checkbox: (checked) => ({ width: 28, height: 28, borderRadius: 8, border: checked ? 'none' : '2px solid #d1d5db', background: checked ? '#22c55e' : '#fff', color: '#fff', fontSize: 14, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'inherit' }),
  delBtn: { background: 'none', border: 'none', color: '#fca5a5', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  loginWrap: { minHeight: '100vh', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  loginCard: { background: '#fff', borderRadius: 22, overflow: 'hidden', width: '100%', maxWidth: 360, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' },
  loginHeader: { background: 'linear-gradient(160deg,#0d3d21,#1a5c38)', borderBottom: '3px solid #c9a84c', padding: '24px 20px', textAlign: 'center' },
  loginBody: { padding: '24px 20px' },
  pwInput: { width: '100%', border: '1.5px solid #ddd', borderRadius: 12, padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'inherit', marginBottom: 12, boxSizing: 'border-box' },
  loginBtn: { width: '100%', background: 'linear-gradient(135deg,#1a5c38,#0d3d21)', color: '#fff', border: '1.5px solid #c9a84c', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' },
  errMsg: { color: '#dc2626', fontSize: 13, marginBottom: 10 },
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [locked, setLocked] = useState(false)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [loginErr, setLoginErr] = useState('')

  const login = () => {
    if (password === 'LadmastersDean') {
      setAuthed(true)
      loadData()
    } else {
      setLoginErr('Wrong password.')
    }
  }

  const loadData = async () => {
    const [sRes, eRes] = await Promise.all([fetch('/api/settings'), fetch('/api/entries')])
    const { locked } = await sRes.json()
    const { entries } = await eRes.json()
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
      setMessage('Error: ' + data.error)
    }
  }

  const deleteEntry = async (nickname) => {
    if (!confirm(`Delete ${nickname}?`)) return
    const res = await fetch('/api/admin-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, adminPassword: password }),
    })
    if (res.ok) {
      setEntries(prev => prev.filter(e => e.nickname !== nickname))
      setMessage(`Deleted ${nickname}.`)
    } else {
      const data = await res.json()
      setMessage('Error: ' + data.error)
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
      setEntries(prev => prev.map(e => e.nickname === nickname ? { ...e, paid: newPaid } : e))
    } else {
      const data = await res.json()
      setMessage('Error: ' + data.error)
    }
  }

  const paidCount = entries.filter(e => e.paid).length

  if (!authed) {
    return (
      <div style={S.loginWrap}>
        <div style={S.loginCard}>
          <div style={S.loginHeader}>
            <div style={S.badge}>Admin Panel</div>
            <h1 style={S.h1}>Ladville <span style={S.gold}>Masters</span></h1>
          </div>
          <div style={S.loginBody}>
            <input style={S.pwInput} type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Admin password" />
            {loginErr && <div style={S.errMsg}>{loginErr}</div>}
            <button style={S.loginBtn} onClick={login}>Login</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.header}>
          <div style={S.badge}>Admin Panel</div>
          <h1 style={S.h1}>Ladville <span style={S.gold}>Masters</span></h1>
          <div style={S.sub}>Pool Management · 2026</div>
        </div>
        <div style={S.body}>
          {message && <div style={S.toast}>{message}</div>}
          <div style={S.topRow}>
            <Link href="/leaderboard" style={S.lbLink}>View Leaderboard →</Link>
          </div>
          <div style={S.card}>
            <div style={S.sectionTitle}>Pick Lock Control</div>
            <div style={S.lockRow}>
              <div style={S.lockStatus(locked)}>{locked ? '🔒 Picks are LOCKED' : '🔓 Picks are OPEN'}</div>
              <button style={{...S.lockBtn(locked), opacity: loading?0.6:1}} onClick={toggleLock} disabled={loading}>
                {loading ? '...' : locked ? 'Unlock' : 'Lock Picks'}
              </button>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.entriesHeader}>
              <div style={S.sectionTitle}>All Entries ({entries.length})</div>
              <div style={S.paidTally}>💰 {paidCount}/{entries.length} paid</div>
            </div>
            {entries.length === 0 ? (
              <div style={{color:'#aaa', fontSize:13}}>No entries yet.</div>
            ) : (
              <div>
                <div style={S.colHeads}>
                  <span style={{...S.colHead, flex:1}}>Team</span>
                  <span style={{...S.colHead, width:42, textAlign:'center'}}>Paid</span>
                  <span style={{...S.colHead, width:32, textAlign:'right'}}>Del</span>
                </div>
                {entries.map(entry => (
                  <div key={entry.nickname} style={S.entryRow}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={S.entryName}>
                        {entry.nickname}
                        {!entry.paid && <span style={S.owesBadge}>Owes $</span>}
                      </div>
                      <div style={S.entryPicks}>{entry.picks?.join(' · ')}</div>
                    </div>
                    <div style={{width:42, display:'flex', justifyContent:'center'}}>
                      <button style={S.checkbox(entry.paid)} onClick={() => togglePaid(entry.nickname, entry.paid)}>
                        {entry.paid ? '✓' : ''}
                      </button>
                    </div>
                    <div style={{width:32, textAlign:'right'}}>
                      <button style={S.delBtn} onClick={() => deleteEntry(entry.nickname)}>Del</button>
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
