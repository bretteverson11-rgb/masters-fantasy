import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nickname, adminPassword } = req.body

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { error } = await supabase
    .from('picks')
    .delete()
    .eq('nickname', nickname)

  if (error) return res.status(500).json({ error: error.message })

  res.status(200).json({ success: true })
}
