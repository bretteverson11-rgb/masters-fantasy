const API_KEY = process.env.SPORTSDATA_API_KEY
const TOURNAMENT_ID = '688'

const NAME_MAP = {
  'Sung-Jae Im': 'Sungjae Im',
  'Sung-jae Im': 'Sungjae Im',
  'Im Sungjae': 'Sungjae Im',
  'Im Sung-jae': 'Sungjae Im',
  'Im Sung-Jae': 'Sungjae Im',
  'Ludvig Aberg': 'Ludvig Åberg',
  'Nicolai Hojgaard': 'Nicolai Højgaard',
  'Rasmus Hojgaard': 'Rasmus Højgaard',
  'Jose Maria Olazabal': 'Jose Maria Olazabal',
  'José María Olazábal': 'Jose Maria Olazabal',
  'Sergio García': 'Sergio Garcia',
  'Joaquín Niemann': 'Joaquin Niemann',
  'Nico Echavarría': 'Nico Echavarria',
  'Alex Norén': 'Alex Noren',
  'JJ Spaun': 'J.J. Spaun',
  'J.J. Spaun': 'J.J. Spaun',
}

export default async function handler(req, res) {
  try {
    const url = `https://api.sportsdata.io/golf/v2/json/Leaderboard/${TOURNAMENT_ID}?key=${API_KEY}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`SportsData API error: ${response.status}`)
    }

    const data = await response.json()
    const players = data?.Players || data?.Leaderboard || data?.Tournament?.Players || []

    if (players.length === 0) {
      return res.status(200).json({ scoresMap: {}, lastUpdated: new Date().toISOString() })
    }

    // Find highest score per round for missed cut penalty
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
      const rawName = (
        p.Name ||
        `${p.FirstName || ''} ${p.LastName || ''}`.trim() ||
        p.PlayerName ||
        p.FullName ||
        ''
      ).trim()

      if (!rawName) return

      const name = NAME_MAP[rawName] || rawName

      const isCut = p.MadeCut === false || p.MadeCut === 0 || p.Status === 'C'
      const isWD = p.IsWithdrawn === true || p.Status === 'W'
      const isDQ = p.Status === 'DQ'

      let score = Math.round(p.TotalScore ?? p.ScoreToPar ?? p.TotalToPar ?? 0)

      if (isCut && !isWD && !isDQ) {
        const roundsPlayed = (p.Rounds || []).filter(r => (r.Strokes || 0) > 0).length
        let penalty = 0
        for (let r = roundsPlayed + 1; r <= 4; r++) {
          penalty += (roundHighScores[r] || 75)
        }
        score = score + penalty
      }

      scoresMap[name] = {
        score,
        status: isWD ? 'wd' : isDQ ? 'dq' : isCut ? 'cut' : 'active',
        position: p.Rank || p.Position || null,
      }
    })

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60')
    res.status(200).json({ scoresMap, lastUpdated: new Date().toISOString() })

  } catch (err) {
    console.error('Scores API error:', err)
    res.status(500).json({ error: err.message, scoresMap: {} })
  }
}
