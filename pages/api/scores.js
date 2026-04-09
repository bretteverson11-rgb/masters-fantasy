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
    const players = data?.Players || []

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
      const name = `${p.FirstName} ${p.LastName}`
      const isCut = p.IsWithdrawn || p.Status === 'C' || p.MadeCut === false
      const isWD = p.IsWithdrawn || p.Status === 'W'
      const isDQ = p.Status === 'DQ'

      let score = p.TotalScore ?? 0

      if (isCut && !isWD && !isDQ) {
        const roundsPlayed = (p.Rounds || []).filter(r => r.Strokes > 0).length
        let penalty = 0
        for (let r = roundsPlayed + 1; r <= 4; r++) {
          penalty += (roundHighScores[r] || 75)
        }
        score = (p.TotalScore ?? 0) + penalty
      }

      scoresMap[name] = {
        score,
        status: isCut ? 'cut' : isWD ? 'wd' : isDQ ? 'dq' : 'active',
        position: p.Rank,
      }
    })

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60')
    res.status(200).json({ scoresMap, lastUpdated: new Date().toISOString() })
  } catch (err) {
    console.error('Scores API error:', err)
    res.status(500).json({ error: err.message, scoresMap: {} })
  }
}
