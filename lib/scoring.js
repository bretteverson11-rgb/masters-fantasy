export function calcTeamScore(picks, scoresMap) {
  const scores = picks.map(name => {
    const data = scoresMap[name]
    if (!data) return { name, score: 0, display: 'E', status: 'unknown' }
    return {
      name,
      score: data.score,
      display: formatScore(data.score),
      status: data.status,
    }
  })

  const sorted = [...scores].sort((a, b) => a.score - b.score)
  const counting = sorted.slice(0, 5)
  const dropped = sorted[5]
  const total = counting.reduce((sum, s) => sum + s.score, 0)

  return {
    total,
    display: formatScore(total),
    scores,
    dropped,
  }
}

export function formatScore(score) {
  if (score === 0) return 'E'
  if (score > 0) return `+${score}`
  return `${score}`
}
