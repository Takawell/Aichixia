import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  const profileRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_settings?user_id=eq.${user.id}&select=is_admin`, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${token}`,
    },
  });
  const profileData = await profileRes.json();
  if (!profileData?.[0]?.is_admin) return res.status(403).json({ error: 'Forbidden' });

  const { pin } = req.body;
  if (!pin || typeof pin !== 'string') return res.status(400).json({ error: 'PIN required' });

  const correct = process.env.ADMIN_PIN;
  if (!correct) return res.status(500).json({ error: 'PIN not configured' });

  if (pin !== correct) return res.status(401).json({ error: 'Invalid PIN' });

  return res.status(200).json({ ok: true });
}
