const API_KEY = process.env.SPORTSDATA_API_KEY
const TOURNAMENT_ID = '688'

// Maps SportsData.io names to our golfers.js names
const NAME_MAP = {
  'Sung-jae Im': 'Sungjae Im',
  'Im Sungjae': 'Sungjae Im',
  'Im Sung-jae': 'Sungjae Im',
  'Sungjae Im': 'Sungjae Im',
  'Ludvig Aberg': 'Ludvig Åberg',
  'Ludvig Åberg': 'Ludvig Åberg',
  'Nicolai Hojgaard': 'Nicolai Højgaard',
  'Nicolai Højgaard': 'Nicolai Højgaard',
  'Rasmus Hojgaard': 'Rasmus Højgaard',
  'Rasmus Højgaard': 'Rasmus Højgaard',
  'Jose Maria Olazabal': 'Jose Maria Olazabal',
  'José María Olazábal': 'Jose Maria Olazabal',
  'Sergio Garcia': 'Sergio Garcia',
  'Sergio García': 'Sergio Garcia',
  'Joaquin Niemann': 'Joaquin Niemann',
  'Joaquín Niemann': 'Joaquin Niemann',
  'Nico Echavarria': 'Nico Echavarria',
  'Nico Echavarría': 'Nico Echavarria',
  'Alex Noren': 'Alex Noren',
  'Alex Norén': 'Alex Noren',
  'Matteo Manassero': 'Matteo Manassero',
  'J.J. Spaun': 'J.J. Spaun',
  'JJ Spaun': 'J.J. Spaun',
  'Tyrrell Hatton': 'Tyrrell Hatton',
  'Abraham Ancer': 'Abraham Ancer',
  'Ryo Hisatsune': 'Ryo Hisatsune',
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
      // Build raw name from whatever fields SportsData provides
      const rawName = (
        p.Name ||
        `${p.FirstName || p.First || p.PlayerFirstName || ''} ${p.LastName || p.Last || p.PlayerLastName || ''}`.trim() ||
        p.PlayerName ||
        p.FullName ||
        ''
      ).trim()

      if (!rawName) return

      // Map to our internal name
      const name = NAME_MAP[rawName] || rawName

      const isCut = p.MadeCut === false || p.MadeCut === 0 || p.Status === 'C'
      const isWD = p.IsWithdrawn === true || p.Status === 'W'
      const isDQ = p.Status === 'DQ'

      // Get score — round to avoid decimals
      let score = Math.round(p.TotalScore ?? p.ScoreToPar ?? p.TotalToPar ?? 0)

      // Missed cut penalty: add highest score from unplayed rounds
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
res.status(200).json({ 
  scoresMap, 
  lastUpdated: new Date().toISOString(),
  debug_names: players.map(p => p.Name || `${p.FirstName} ${p.LastName}`)
})

  } catch (err) {
    console.error('Scores API error:', err)
    res.status(500).json({ error: err.message, scoresMap: {} })
  }
}
