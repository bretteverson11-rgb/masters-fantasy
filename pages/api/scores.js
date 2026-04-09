const API_KEY = process.env.SPORTSDATA_API_KEY
const TOURNAMENT_ID = '688'

export default async function handler(req, res) {
  try {
    const url = `https://api.sportsdata.io/golf/v2/json/Leaderboard/${TOURNAMENT_ID}?key=${API_KEY}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`SportsData API error: ${response.status}`)
    }

    const data = await response.json()

    // Log the raw structure so we can see field names
    const players = data?.Players || data?.Leaderboard || data?.Tournament?.Players || []

    if (players.length === 0) {
      return res.status(200).json({ scoresMap: {}, lastUpdated: new Date().toISOString(), debug: { keys: Object.keys(data), playerCount: 0 } })
    }

    // Log first player to see field names
    const firstPlayer = players[0]
    const nameFields = Object.keys(firstPlayer).filter(k => k.toLowerCase().includes('name') || k.toLowerCase().includes('first') || k.toLowerCase().includes('last'))

    const roundHighScores = {}
    players.forEach(p => {
      ;(p.Rounds || []).forEach(r => {
        const rd = r.Number
        const strokes = r.Strokes || 0
        if (strokes > 0) {
          roundHighScores[rd] = Math.max(roundHighScores[rd] || 0, strokes)
        }
      })
    })

    const scoresMap = {}
    players.forEach(p => {
      // Try all possible name field combinations
      const name = p.Name ||
        `${p.FirstName || p.First || p.PlayerFirstName || ''} ${p.LastName || p.Last || p.PlayerLastName || ''}`.trim() ||
        p.PlayerName ||
        p.FullName ||
        `Player${p.PlayerID}`

      const isCut = p.MadeCut === false || p.Status === 'C' || p.IsWithdrawn
      const isWD = p.IsWithdrawn || p.Status === 'W'
      const isDQ = p.Status === 'DQ'

      let score = Math.round(p.TotalScore ?? p.ScoreToPar ?? p.TotalToPar ?? 0)

      if (isCut && !isWD && !isDQ) {
        const roundsPlayed = (p.Rounds || []).filter(r => r.Strokes > 0).length
        let penalty = 0
        for (let r = roundsPlayed + 1; r <= 4; r++) {
          penalty += (roundHighScores[r] || 75)
        }
        score = score + penalty
      }

      scoresMap[name] = {
        score,
        status: isCut ? 'cut' : isWD ? 'wd' : isDQ ? 'dq' : 'active',
        position: p.Rank || p.Position,
      }
    })

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60')
    res.status(200).json({
      scoresMap,
      lastUpdated: new Date().toISOString(),
      debug: { nameFields, firstPlayerKeys: Object.keys(firstPlayer), playerCount: players.length }
    })
  } catch (err) {
    console.error('Scores API error:', err)
    res.status(500).json({ error: err.message, scoresMap: {} })
  }
}
