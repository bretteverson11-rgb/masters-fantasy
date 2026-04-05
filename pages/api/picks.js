import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nickname, picks } = req.body

  if (!nickname || !picks || picks.length !== 6) {
    return res.status(400).json({ error: 'Team name and exactly 6 picks required.' })
  }

  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'picks_locked')
    .single()

  if (setting?.value === 'true') {
    return res.status(403).json({ error: 'Picks are locked. The tournament has started!' })
  }

  const { error } = await supabase
    .from('picks')
    .upsert(
      { nickname: nickname.trim(), picks, updated_at: new Date().toISOString() },
      { onConflict: 'nickname' }
    )

  if (error) return res.status(500).json({ error: error.message })

  res.status(200).json({ success: true })
}
