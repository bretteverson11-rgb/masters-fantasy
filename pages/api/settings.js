import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'picks_locked')
      .single()

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ locked: data?.value === 'true' })
  }

  if (req.method === 'POST') {
    const { locked, adminPassword } = req.body

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'picks_locked', value: String(locked) }, { onConflict: 'key' })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ locked })
  }

  res.status(405).end()
}
