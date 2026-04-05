import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { data, error } = await supabase
    .from('picks')
    .select('nickname, picks, paid, updated_at')
    .order('nickname')

  if (error) return res.status(500).json({ error: error.message })

  res.status(200).json({ entries: data || [] })
}
